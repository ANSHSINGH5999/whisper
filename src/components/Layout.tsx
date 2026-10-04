import { useEffect, type CSSProperties, type ReactNode } from 'react';

export const delay = (s: string) => ({ '--d': s }) as CSSProperties;

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4';

interface LayoutProps {
  wallet: ReactNode;
  landing?: boolean;
  wide?: boolean;
  stats?: ReactNode;
  children: ReactNode;
}

export function Layout({ wallet, landing = false, wide = false, stats, children }: LayoutProps) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.appear:not(.is-in), .hero-photo:not(.is-in)');
    els.forEach((el) => el.addEventListener('animationend', () => el.classList.add('is-in'), { once: true }));
    // If animations never start (reduced motion, throttled tab), show everything.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const running = els[0]?.getAnimations().some((a) => a.playState === 'running' || a.playState === 'finished');
        if (!running) els.forEach((el) => el.classList.add('is-in'));
      }),
    );
  }, [landing, wide]);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      {landing && <video className="hero-photo appear appear--fade" src={HERO_VIDEO} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />}
      <div className={landing ? 'page landing' : 'page'}>
        <header className="header">
          <a className="logo appear appear--scale" style={delay('0.08s')} href="/" aria-label="Whisper home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
            Whisper
          </a>
          <span className="pill appear appear--soft" style={delay('0.28s')}>Preprod</span>
          <div className="nav-end appear appear--scale" style={delay('0.34s')}>{wallet}</div>
        </header>
        <main className={landing ? 'hero-main' : wide ? 'main-wide' : 'main'}>{children}</main>
        {landing ? (
          stats
        ) : (
          <footer className="footer muted small">
            Built on <a href="https://midnight.network">Midnight</a>. Identities are protected by zero-knowledge proofs;
            report text is public to the organisation — avoid details only you would know.
          </footer>
        )}
      </div>
    </>
  );
}
