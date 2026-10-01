import type { ReactNode } from 'react';

export function Layout({ wallet, children }: { wallet: ReactNode; children: ReactNode }) {
  return (
    <>
      <nav className="nav">
        <a className="logo" href="/" aria-label="Whisper home">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2.2" fill="var(--accent)" />
          </svg>
          Whisper
        </a>
        <span className="pill">Preprod</span>
        <div className="nav-end">{wallet}</div>
      </nav>
      <main className="main">{children}</main>
      <footer className="footer muted small">
        Built on <a href="https://midnight.network">Midnight</a>. Identities are protected by zero-knowledge proofs;
        report text is public to the organisation — avoid details only you would know.
      </footer>
    </>
  );
}
