import type { Midnight } from '../hooks/useMidnight';

/** Shown when the connected wallet can't pay fees yet. */
export function FundWallet({ m }: { m: Midnight }) {
  if (!m.wallet || m.dust !== 0n) return null;
  return (
    <section className="notice fund" aria-live="polite">
      <b>Your wallet has 0 DUST, so it can’t pay transaction fees yet.</b>
      <ol>
        <li>
          Request tNIGHT for this address at the{' '}
          <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer">Preprod faucet</a>:
          <code className="mono">{m.walletAddress}</code>
        </li>
        <li>In your wallet, turn on DUST generation for that tNIGHT. DUST builds up over a few minutes.</li>
      </ol>
      <button className="btn ghost sm" onClick={m.refreshDust}>Check balance again</button>
    </section>
  );
}
