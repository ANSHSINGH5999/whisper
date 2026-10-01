import { useState } from 'react';
import type { Midnight } from '../hooks/useMidnight';

export function AdminConsole({ m }: { m: Midnight }) {
  const [code, setCode] = useState('');
  const busy = !!m.tx;

  return (
    <section className="panel">
      <p className="eyebrow">Admin</p>
      <h3>Manage members</h3>
      <form
        className="row"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await m.addMember(code)) setCode('');
        }}
      >
        <label htmlFor="code" className="sr-only">Member code</label>
        <input id="code" className="mono" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste a member code (64 hex chars)" />
        <button className="btn" disabled={busy || !code.trim()}>Add member</button>
      </form>
      <p className="muted small">
        The code is inserted into a Merkle tree. Once added, you can’t tell which report came from which code.
      </p>
      <div className="row">
        <span className="muted small">Starting a new round gives every member a fresh set of report slots.</span>
        <button className="btn ghost" disabled={busy} onClick={m.newRound}>Start round {(m.ledger!.round + 1n).toString()}</button>
      </div>
    </section>
  );
}
