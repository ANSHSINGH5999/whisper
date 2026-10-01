import type { Midnight } from '../hooks/useMidnight';

export function WalletConnect({ m }: { m: Midnight }) {
  if (m.wallet) {
    return (
      <span className="wallet-on">
        <span className="dot" aria-hidden="true" /> Lace connected
      </span>
    );
  }
  return (
    <button className="btn" onClick={m.connect} disabled={m.connecting}>
      {m.connecting ? 'Approve in Lace…' : 'Connect Lace →'}
    </button>
  );
}
