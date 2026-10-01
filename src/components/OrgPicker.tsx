import { useState } from 'react';
import { DEFAULT_ADDRESS, type Midnight } from '../hooks/useMidnight';

export function OrgPicker({ m }: { m: Midnight }) {
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [name, setName] = useState('');
  const busy = !!m.tx;

  return (
    <section className="split">
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          void m.join(address.trim());
        }}
      >
        <p className="eyebrow">Members &amp; admins</p>
        <h3>Open an organisation</h3>
        <label htmlFor="addr">Contract address</label>
        <input id="addr" className="mono" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Paste the org’s contract address" required />
        <button className="btn" disabled={busy || !address.trim()}>Open →</button>
      </form>

      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          void m.deploy(name.trim());
        }}
      >
        <p className="eyebrow">New organisation</p>
        <h3>Deploy your own</h3>
        <label htmlFor="org">Organisation name</label>
        <input id="org" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" maxLength={64} required />
        <p className="muted small">You become the admin. Only a hash of your key is stored on-chain.</p>
        <button className="btn ghost" disabled={busy || !name.trim()}>Deploy contract</button>
      </form>
    </section>
  );
}
