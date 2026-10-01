// DUST has 15 decimals.
const formatDust = (v: bigint) => (Number(v) / 1e15).toLocaleString(undefined, { maximumFractionDigits: 2 });

import type { Midnight } from '../hooks/useMidnight';

export function WalletConnect({ m }: { m: Midnight }) {
  if (m.wallet) {
    return (
      <span className="wallet-on">
        <span className="dot" aria-hidden="true" /> Lace · Preprod
        {m.dust !== null && <span className="muted"> · {formatDust(m.dust)} DUST</span>}
      </span>
    );
  }
  return (
    <button className="btn" onClick={m.connect} disabled={m.connecting}>
      {m.connecting ? 'Approve in Lace…' : 'Connect Lace →'}
    </button>
  );
}
