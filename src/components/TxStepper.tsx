import type { TxState } from '../hooks/useMidnight';

const STEPS = [
  { id: 'preparing', label: 'Run circuit locally', hint: 'Your secret key and Merkle path are read on this device' },
  { id: 'proving', label: 'Generate ZK proof', hint: 'The proof server turns private inputs into a proof (≈30–90s)' },
  { id: 'balancing', label: 'Approve in your wallet', hint: 'Your wallet adds DUST for fees and signs' },
  { id: 'submitting', label: 'Submit', hint: 'Only the proof and public outputs are sent' },
  { id: 'confirming', label: 'Confirm on-chain', hint: 'Waiting for the block to finalise' },
] as const;

export function TxStepper({ tx }: { tx: TxState }) {
  if (!tx) return null;
  const current = STEPS.findIndex((s) => s.id === tx.phase);
  return (
    <section className="stepper" aria-live="polite" aria-busy="true">
      <p className="eyebrow">{tx.label}</p>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.id} className={i < current ? 'done' : i === current ? 'active' : ''}>
            <span className="marker" aria-hidden="true" />
            <div>
              <b>{s.label}</b>
              {i === current && <small>{s.hint}</small>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
