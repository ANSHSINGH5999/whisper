import type { Midnight } from '../hooks/useMidnight';
import { ReportStatus, statusLabel } from '../utils/contract';

export function ReportFeed({ m }: { m: Midnight }) {
  const reports = [...m.ledger!.reports].sort(([a], [b]) => Number(b - a));
  const isAdmin = m.me!.isAdmin;

  return (
    <section className="panel feed">
      <p className="eyebrow">On-chain record</p>
      <h3>Reports</h3>
      {reports.length === 0 && <p className="muted">No reports yet.</p>}
      <ul>
        {reports.map(([id, r]) => (
          <li key={id.toString()}>
            <div className="meta">
              <span className="mono">#{id.toString()}</span>
              <span>Round {r.round.toString()}</span>
              <span className={`status s${r.status}`}>{statusLabel[r.status]}</span>
              <span className="muted">Filed by: a verified member</span>
            </div>
            <p>{r.body}</p>
            {isAdmin && (
              <div className="actions">
                {[ReportStatus.ACKNOWLEDGED, ReportStatus.RESOLVED, ReportStatus.DISMISSED].map((s) => (
                  <button key={s} className="btn ghost sm" disabled={!!m.tx || r.status === s} onClick={() => m.setStatus(id, s)}>
                    {statusLabel[s]}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
