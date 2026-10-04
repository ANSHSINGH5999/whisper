import { useState, type CSSProperties } from 'react';
import type { DetectedWallet } from '../utils/providers';
import type { Midnight } from '../hooks/useMidnight';

// DUST has 15 decimals.
const formatDust = (v: bigint) => (Number(v) / 1e15).toLocaleString(undefined, { maximumFractionDigits: 2 });

export function ConnectButton({ m, className = '', style }: { m: Midnight; className?: string; style?: CSSProperties }) {
  const [wallets, setWallets] = useState<DetectedWallet[] | null>(null);

  const open = async () => setWallets(await m.detectWallets());
  const pick = (w: DetectedWallet) => {
    setWallets(null);
    void m.connect(w);
  };

  return (
    <>
      <button className={`btn ${className}`} style={style} onClick={open} disabled={m.connecting}>
        {m.connecting ? 'Approve in your wallet…' : 'Connect wallet →'}
      </button>
      {wallets && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Choose a wallet" onClick={() => setWallets(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Choose a wallet</h3>
            {wallets.length ? (
              <ul className="wallet-list">
                {wallets.map((w) => (
                  <li key={w.id}>
                    <button onClick={() => pick(w)}>
                      <img src={w.icon} alt="" width={28} height={28} />
                      {w.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">No Midnight wallet detected. Install Lace or 1AM, enable Midnight, then reload this page.</p>
            )}
            <button className="btn ghost sm" onClick={() => setWallets(null)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export function WalletConnect({ m }: { m: Midnight }) {
  if (m.wallet) {
    return (
      <span className="wallet-on">
        <span className="dot" aria-hidden="true" /> {m.walletName ?? 'Wallet'} · Preprod
        {m.dust !== null && <span className="muted"> · {formatDust(m.dust)} DUST</span>}
      </span>
    );
  }
  return <ConnectButton m={m} />;
}
