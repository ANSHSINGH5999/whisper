import { useState } from 'react';
import type { Midnight } from '../hooks/useMidnight';

export function MemberKey({ m }: { m: Midnight }) {
  const [showKey, setShowKey] = useState(false);
  const [restore, setRestore] = useState('');
  const [copied, setCopied] = useState(false);
  const me = m.me!;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(me.commitment);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: code is still selectable */
    }
  };

  return (
    <section className="panel">
      <p className="eyebrow">Your identity</p>
      <h3>Member code</h3>
      <p className="muted small">Share this with the admin to be registered. It’s a one-way hash: it can’t be turned back into your key.</p>
      <div className="codebox">
        <code className="mono">{me.commitment}</code>
        <button className="btn ghost sm" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>

      <details className="key">
        <summary>Back up or restore your secret key</summary>
        <p className="muted small">
          Your key is stored only in this browser. Lose it and you lose your membership. Never share it — anyone with it can report as you.
        </p>
        <div className="codebox">
          <code className="mono">{showKey ? m.secretKey : '•'.repeat(64)}</code>
          <button className="btn ghost sm" onClick={() => setShowKey((s) => !s)}>{showKey ? 'Hide' : 'Reveal'}</button>
        </div>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            void m.importKey(restore);
            setRestore('');
          }}
        >
          <label htmlFor="restore" className="sr-only">Restore key</label>
          <input id="restore" className="mono" value={restore} onChange={(e) => setRestore(e.target.value)} placeholder="Paste a backed-up key" />
          <button className="btn ghost sm" disabled={!restore.trim()}>Restore</button>
        </form>
      </details>
    </section>
  );
}
