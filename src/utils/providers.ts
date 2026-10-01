import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Transaction, type FinalizedTransaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import semver from 'semver';
import type { WhisperCircuitKeys, WhisperPrivateState, WhisperProviders } from './contract';

/** Real stages of a Midnight transaction, reported as each provider is invoked. */
export type TxPhase = 'proving' | 'balancing' | 'submitting' | 'confirming';

// Several Midnight wallets can be injected at once; prefer Lace, fall back to any compatible one.
const findWallet = (): InitialAPI | undefined => {
  const compatible = Object.values(window.midnight ?? {}).filter(
    (w): w is InitialAPI => !!w && typeof w === 'object' && 'apiVersion' in w && semver.satisfies(w.apiVersion, '4.x'),
  );
  return compatible.find((w) => w.name.toLowerCase() === 'lace') ?? compatible[0];
};

export const connectWallet = async (networkId: string): Promise<ConnectedAPI> => {
  // Extensions inject window.midnight shortly after page load.
  for (let i = 0; i < 20 && !findWallet(); i++) await new Promise((r) => setTimeout(r, 100));
  const wallet = findWallet();
  if (!wallet) throw new Error('No Midnight wallet found. Install Lace and enable Midnight, then reload.');
  return wallet.connect(networkId);
};

/**
 * Private state lives only in this browser tab's memory; the secret key itself is
 * persisted by the app (see useMidnight) so the user can back it up explicitly.
 */
const memoryPrivateState = (): PrivateStateProvider<string, WhisperPrivateState> => {
  const states = new Map<string, WhisperPrivateState>();
  const keys = new Map<string, Parameters<PrivateStateProvider['setSigningKey']>[1]>();
  let address = '';
  const unsupported = () => Promise.reject(new Error('Private state export is not supported'));
  return {
    setContractAddress: (a) => void (address = a),
    set: async (id, s) => void states.set(`${address}:${id}`, s),
    get: async (id) => states.get(`${address}:${id}`) ?? null,
    remove: async (id) => void states.delete(`${address}:${id}`),
    clear: async () => states.clear(),
    setSigningKey: async (a, k) => void keys.set(a, k),
    getSigningKey: async (a) => keys.get(a) ?? null,
    removeSigningKey: async (a) => void keys.delete(a),
    clearSigningKeys: async () => keys.clear(),
    exportPrivateStates: unsupported,
    importPrivateStates: unsupported,
    exportSigningKeys: unsupported,
    importSigningKeys: unsupported,
  };
};

export const buildProviders = async (
  wallet: ConnectedAPI,
  onPhase: (p: TxPhase) => void,
): Promise<WhisperProviders> => {
  const config = await wallet.getConfiguration();
  if (!config.proverServerUri) throw new Error('Your wallet has no proof server configured. Set one in Lace settings.');
  const { shieldedCoinPublicKey, shieldedEncryptionPublicKey } = await wallet.getShieldedAddresses();
  // Proving keys and ZKIR are served next to the app (see vite.config.ts publicDir).
  const zkConfig = new FetchZkConfigProvider<WhisperCircuitKeys>(window.location.origin, fetch.bind(window));
  const prover = httpClientProofProvider(config.proverServerUri, zkConfig);

  return {
    privateStateProvider: memoryPrivateState(),
    zkConfigProvider: zkConfig,
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    proofProvider: {
      proveTx: (tx, cfg) => {
        onPhase('proving');
        return prover.proveTx(tx, cfg);
      },
    },
    walletProvider: {
      getCoinPublicKey: () => shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedEncryptionPublicKey,
      balanceTx: async (tx): Promise<FinalizedTransaction> => {
        onPhase('balancing');
        const { tx: balanced } = await wallet.balanceUnsealedTransaction(toHex(tx.serialize()));
        return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced));
      },
    },
    midnightProvider: {
      submitTx: async (tx) => {
        onPhase('submitting');
        await wallet.submitTransaction(toHex(tx.serialize()));
        onPhase('confirming');
        return tx.identifiers()[0];
      },
    },
  };
};
