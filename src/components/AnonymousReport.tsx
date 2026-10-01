import { useState } from 'react';
import type { Midnight } from '../hooks/useMidnight';
import { MAX_REPORTS_PER_ROUND } from '../utils/contract';

const short = (hex: string) => `${hex.slice(0, 10)}…${hex.slice(-6)}`;

/** The core feature: compose a report while seeing exactly what will and won't leave the device. */
export function AnonymousReport({ m }: { m: Midnight }) {
  const [body, setBody] = useState('');
  const me = m.me!;
  const slotsLeft = me.freeSlots.length;
  const canSubmit = me.isMember && slotsLeft > 0 && body.trim().length > 0 && !m.tx;

  return (
    <section className="panel report">
      <div>
        <p className="eyebrow">File a report</p>
        <h3>Say what you saw.</h3>
        {!me.isMember && (
          <p className="notice">
            You aren’t registered yet. Send your <b>member code</b> (below) to the admin. Once they add it, you can report here.
          </p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await m.submitReport(body.trim())) setBody('');
          }}
        >
          <label htmlFor="body" className="sr-only">Report</label>
          <textarea
            id="body"
            rows={6}
            maxLength={1000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the issue. Avoid details that only you could know."
            disabled={!me.isMember}
          />
          <div className="row">
            <span className="muted small">
              {slotsLeft}/{MAX_REPORTS_PER_ROUND} reports left this round
            </span>
            <button className="btn" disabled={!canSubmit}>Prove &amp; submit anonymously</button>
          </div>
        </form>
      </div>

      <aside className="lens" aria-label="Privacy breakdown">
        <h4>Leaves your device</h4>
        <ul>
          <li><span>Report text</span><em>public</em></li>
          <li><span>Membership proof</span><em>zero-knowledge</em></li>
          <li><span>One-time tag (nullifier)</span><em>unlinkable</em></li>
        </ul>
        <h4>Stays on your device</h4>
        <ul className="private">
          <li><span>Your secret key</span><code className="veil">{short(m.secretKey ?? '')}</code></li>
          <li><span>Which member you are</span><code className="veil">leaf #?</code></li>
          <li><span>Which slot you used</span><code className="veil">slot ?</code></li>
        </ul>
        <p className="muted small">
          The admin added your code, but the proof only shows “someone in the list” — they can’t tell which entry.
        </p>
      </aside>
    </section>
  );
}
