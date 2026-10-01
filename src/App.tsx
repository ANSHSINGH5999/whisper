import { AdminConsole } from './components/AdminConsole';
import { AnonymousReport } from './components/AnonymousReport';
import { FundWallet } from './components/FundWallet';
import { Layout } from './components/Layout';
import { MemberKey } from './components/MemberKey';
import { OrgPicker } from './components/OrgPicker';
import { ReportFeed } from './components/ReportFeed';
import { TxStepper } from './components/TxStepper';
import { WalletConnect } from './components/WalletConnect';
import { useMidnight } from './hooks/useMidnight';

export default function App() {
  const m = useMidnight();

  return (
    <Layout wallet={<WalletConnect m={m} />}>
      {m.error && (
        <div className="alert" role="alert">
          <span>{m.error}</span>
          <button className="link" onClick={m.clearError} aria-label="Dismiss error">
            Dismiss
          </button>
        </div>
      )}
      <FundWallet m={m} />
      <TxStepper tx={m.tx} />

      {!m.wallet ? (
        <Intro />
      ) : !m.address ? (
        <OrgPicker m={m} />
      ) : !m.ledger || !m.me ? (
        <p className="muted center pad">Syncing organisation state from the Preprod indexer…</p>
      ) : (
        <div className="workspace">
          <header className="org-head">
            <p className="eyebrow">Organisation</p>
            <h2>{m.ledger.orgName}</h2>
            <p className="muted mono small">{m.address}</p>
            <dl className="stats">
              <div><dt>Members</dt><dd>{m.ledger.memberCount.toString()}</dd></div>
              <div><dt>Reports</dt><dd>{m.ledger.reportCount.toString()}</dd></div>
              <div><dt>Round</dt><dd>{m.ledger.round.toString()}</dd></div>
              <div><dt>You are</dt><dd>{m.me.isAdmin ? 'Admin' : m.me.isMember ? 'Member' : 'Not registered'}</dd></div>
            </dl>
          </header>
          <AnonymousReport m={m} />
          <MemberKey m={m} />
          {m.me.isAdmin && <AdminConsole m={m} />}
          <ReportFeed m={m} />
        </div>
      )}
    </Layout>
  );
}

function Intro() {
  return (
    <section className="hero">
      <p className="eyebrow">Anonymous insider reporting · Midnight Preprod</p>
      <h1>
        Speak up.
        <br />
        <em>Stay unnamed.</em>
      </h1>
      <p className="lede">
        Whisper lets verified members of an organisation report wrongdoing with a zero-knowledge proof that they belong —
        without revealing who they are. Not to the public. Not to the admin who invited them.
      </p>
      <ol className="how">
        <li><b>Join</b>Your key is generated on your device. You hand the admin a one-way code, never the key.</li>
        <li><b>Prove</b>Your browser proves “I’m one of the registered members” in zero knowledge.</li>
        <li><b>Report</b>Only the report text and an unlinkable one-time tag reach the chain.</li>
      </ol>
      <p className="muted small">Connect a Lace wallet set to Preprod to begin.</p>
    </section>
  );
}
