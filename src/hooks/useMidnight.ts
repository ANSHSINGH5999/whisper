import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CompiledWhisper,
  type DeployedWhisper,
  type Ledger,
  type ReportStatus,
  type WhisperProviders,
  freeSlots,
  parseLedger,
  pureCircuits,
  randomSecret,
  whisperPrivateStateId,
} from '../utils/contract';
import { type TxPhase, buildProviders, connectWallet } from '../utils/providers';

const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as string;
export const DEFAULT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ?? '';

export type TxState = { label: string; phase: TxPhase | 'preparing' } | null;

// The secret key is per-organisation so commitments can't be correlated across orgs.
const keyStore = {
  load: (address: string) => {
    try {
      const hex = localStorage.getItem(`whisper:key:${address}`);
      return hex ? fromHex(hex) : null;
    } catch {
      return null;
    }
  },
  save: (address: string, sk: Uint8Array) => {
    try {
      localStorage.setItem(`whisper:key:${address}`, toHex(sk));
    } catch {
      /* storage unavailable: key lives in memory only, user is told to back it up */
    }
  },
};

/** Spendable DUST, or null if the wallet can't report it. */
const readDust = (api: ConnectedAPI) =>
  api.getDustBalance().then(
    (d) => d.balance,
    () => null,
  );

export const friendlyError = (e: unknown): string => {
  const props = e && typeof e === 'object' ? Object.getOwnPropertyNames(e) : [];
  console.error('[whisper]', e, JSON.stringify(e, props), (e as { cause?: unknown })?.cause);
  const w = e as { code?: string; reason?: string; message?: string };
  if (w?.code === 'Rejected' || w?.code === 'PermissionRejected') return 'You declined the request in your wallet.';
  if (w?.code === 'Disconnected') return 'The wallet disconnected. Reconnect Lace and try again.';
  const msg = w?.reason || w?.message || String(e) || 'Unknown error';
  if (/reject|denied|cancel/i.test(msg)) return 'You declined the request in your wallet.';
  if (/failed to fetch|ECONNREFUSED|6300/i.test(msg)) return 'Could not reach the proof server. Is it running (see Setup)?';
  if (/insufficient|not enough|dust/i.test(msg)) return 'Not enough tDUST to pay fees. Generate DUST from tNIGHT in Lace.';
  return msg.replace(/^Error:\s*/, '') || 'Transaction failed. Check the browser console for details.';
};

export const useMidnight = () => {
  const [wallet, setWallet] = useState<ConnectedAPI | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [contract, setContract] = useState<DeployedWhisper | null>(null);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [secretKey, setSecretKey] = useState<Uint8Array | null>(null);
  const [tx, setTx] = useState<TxState>(null);
  const [error, setError] = useState<string | null>(null);
  const [dust, setDust] = useState<bigint | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const providers = useRef<WhisperProviders | null>(null);
  const walletRef = useRef<ConnectedAPI | null>(null);
  const phaseRef = useRef<string>('preparing');

  const address = contract?.deployTxData.public.contractAddress ?? null;

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const api = await connectWallet(NETWORK_ID);
      providers.current = await buildProviders(api, (phase) => {
        phaseRef.current = phase;
        setTx((t) => (t ? { ...t, phase } : t));
      });
      setDust(await readDust(api));
      setWalletAddress((await api.getUnshieldedAddress()).unshieldedAddress);
      walletRef.current = api;
      setWallet(api);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setConnecting(false);
    }
  }, []);

  /** Runs an on-chain action with live phase tracking and user-readable errors. */
  const run = useCallback(async <T>(label: string, fn: (p: WhisperProviders) => Promise<T>): Promise<T | undefined> => {
    if (!providers.current || !walletRef.current) return;
    setError(null);
    const balance = await readDust(walletRef.current);
    setDust(balance);
    if (balance === 0n) {
      setError('Your wallet has 0 DUST, so it cannot pay fees. Get tNIGHT from the Preprod faucet and turn on DUST generation in Lace.');
      return;
    }
    phaseRef.current = 'preparing';
    setTx({ label, phase: 'preparing' });
    try {
      return await fn(providers.current);
    } catch (e) {
      console.error(`[whisper] "${label}" failed during phase: ${phaseRef.current}`);
      setError(friendlyError(e));
    } finally {
      setTx(null);
    }
  }, []);

  const deploy = (orgName: string) =>
    run('Creating organisation', async (p) => {
      const sk = randomSecret();
      const deployed = await deployContract(p, {
        compiledContract: CompiledWhisper,
        privateStateId: whisperPrivateStateId,
        initialPrivateState: { secretKey: sk },
        args: [orgName],
      });
      keyStore.save(deployed.deployTxData.public.contractAddress, sk);
      setSecretKey(sk);
      setContract(deployed);
    });

  const join = (contractAddress: string) =>
    run('Opening organisation', async (p) => {
      const sk = keyStore.load(contractAddress) ?? randomSecret();
      keyStore.save(contractAddress, sk);
      p.privateStateProvider.setContractAddress(contractAddress);
      const found = await findDeployedContract(p, {
        contractAddress,
        compiledContract: CompiledWhisper,
        privateStateId: whisperPrivateStateId,
        initialPrivateState: { secretKey: sk },
      });
      setSecretKey(sk);
      setContract(found);
    });

  /** Restore a backed-up key (e.g. on a new device). */
  const importKey = async (hex: string) => {
    if (!address || !providers.current) return;
    const clean = hex.trim().replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/i.test(clean)) return setError('A Whisper key is 64 hex characters.');
    const sk = fromHex(clean);
    await providers.current.privateStateProvider.set(whisperPrivateStateId, { secretKey: sk });
    keyStore.save(address, sk);
    setSecretKey(sk);
  };

  useEffect(() => {
    if (!address || !providers.current) return;
    const sub = providers.current.publicDataProvider
      .contractStateObservable(address, { type: 'latest' })
      .subscribe({ next: (s) => setLedger(parseLedger(s.data)), error: (e) => setError(friendlyError(e)) });
    return () => sub.unsubscribe();
  }, [address]);

  const derived = useMemo(() => {
    if (!ledger || !secretKey) return null;
    const commitment = pureCircuits.memberCommitment(secretKey);
    return {
      commitment: toHex(commitment),
      isAdmin: toHex(ledger.admin) === toHex(pureCircuits.adminKey(secretKey)),
      isMember: ledger.members.findPathForLeaf(commitment) !== undefined,
      freeSlots: freeSlots(ledger, secretKey),
    };
  }, [ledger, secretKey]);

  return {
    wallet,
    dust,
    walletAddress,
    refreshDust: async () => walletRef.current && setDust(await readDust(walletRef.current)),
    connecting,
    connect,
    address,
    ledger,
    secretKey: secretKey ? toHex(secretKey) : null,
    me: derived,
    tx,
    error,
    clearError: () => setError(null),
    deploy,
    join,
    importKey,
    submitReport: (body: string) =>
      run('Filing anonymous report', async () => {
        const slot = derived?.freeSlots[0];
        if (slot === undefined) throw new Error('You have used all your reports for this round.');
        await contract!.callTx.submitReport(body, BigInt(slot));
        return true;
      }),
    addMember: (commitmentHex: string) =>
      run('Registering member', async () => {
        const clean = commitmentHex.trim().replace(/^0x/, '');
        if (!/^[0-9a-f]{64}$/i.test(clean)) throw new Error('A member code is 64 hex characters.');
        const c = fromHex(clean);
        await contract!.callTx.addMember(c);
        return true;
      }),
    setStatus: (id: bigint, status: ReportStatus) =>
      run('Updating report', async () => void (await contract!.callTx.setStatus(id, status))),
    newRound: () => run('Starting new round', async () => void (await contract!.callTx.newRound())),
  };
};

export type Midnight = ReturnType<typeof useMidnight>;
