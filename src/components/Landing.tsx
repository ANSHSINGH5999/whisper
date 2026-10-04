import type { Midnight } from '../hooks/useMidnight';
import { delay } from './Layout';
import { ConnectButton } from './WalletConnect';

export function Intro({ m }: { m: Midnight }) {
  return (
    <section className="hero">
      <p className="badge appear appear--pop" style={delay('0.22s')}>
        <svg className="badge-star" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
        </svg>
        Anonymous insider reporting · Midnight Preprod
      </p>
      <h1>
        <span className="headline-line appear appear--mask" style={delay('0.42s')}>Speak up.</span>
        <span className="headline-line appear appear--mask" style={delay('0.62s')}><em>Stay unnamed.</em></span>
      </h1>
      <p className="lede appear appear--soft" style={delay('0.82s')}>
        Whisper lets verified members of an organisation report wrongdoing with a zero-knowledge proof that they belong —
        without revealing who they are. Not to the public. Not to the admin who invited them.
      </p>
      <div className="hero-actions">
        <ConnectButton m={m} className="hero appear appear--btn" style={delay('0.96s')} />
      </div>
      <p className="hero-note appear appear--soft" style={delay('1.1s')}>Works with Lace or 1AM, set to Preprod.</p>
    </section>
  );
}

export function HeroStats() {
  return (
    <footer className="hero-stats">
      <div className="stat appear appear--stat" style={delay('1.12s')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="pl" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".38" /><stop offset="1" stopColor="#3a3a3a" stopOpacity=".62" /></linearGradient>
            <linearGradient id="pr" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#3a3a3a" stopOpacity=".38" /><stop offset="1" stopColor="#fff" stopOpacity=".62" /></linearGradient>
          </defs>
          <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#pl)" />
          <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#pr)" />
          <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
        </svg>
        <span><b>Join.</b> Your key is generated on your device</span>
      </div>
      <div className="stat appear appear--stat" style={delay('1.28s')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#fff" />
          <g fill="none" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7.1v7.4" /><path d="M8.15 12.35L12 16.2l3.85-3.85" /></g>
        </svg>
        <span><b>Prove.</b> Membership, in zero knowledge</span>
      </div>
      <div className="stat appear appear--stat" style={delay('1.44s')}>
        <svg className="stat-icon-wide" viewBox="0 0 40 22" aria-hidden="true">
          <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
          <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
          <path d="M5.6 6.2 6.4 3.2 8.6 5ZM14.8 6.2 14 3.2 11.8 5Z" fill="#2b2b2b" />
          <circle cx="8.6" cy="11.4" r=".7" fill="#1a1a1a" /><circle cx="11.8" cy="11.4" r=".7" fill="#1a1a1a" />
          <circle cx="20.2" cy="11" r="9.2" fill="#fff" />
          <circle cx="17.4" cy="9.4" r="1.7" fill="#111" /><circle cx="23" cy="9.4" r="1.7" fill="#111" />
          <ellipse cx="20.2" cy="12.4" rx="1.2" ry=".8" fill="#111" />
          <path d="M17.6 15c1.4 1.4 3.6 1.4 5 0" fill="none" stroke="#111" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
          <text x="30.2" y="15.1" fontSize="12.5" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="Inter, sans-serif">w</text>
        </svg>
        <span><b>Report.</b> Only an unlinkable tag reaches the chain</span>
      </div>
    </footer>
  );
}
