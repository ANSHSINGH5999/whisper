# Whisper

![CI](https://github.com/ANSHSINGH5999/whisper/actions/workflows/ci.yml/badge.svg)

> Anonymous insider reporting on Midnight — prove you're a verified member of an organisation without revealing which one you are.

## Live Demo

**https://whisper-midnight.vercel.app** (connect a Lace wallet set to Preprod; see [Prerequisites](#prerequisites))

## Contract Address

| Network | Address |
|---------|---------|
| Preprod | `[ADDRESS — added after deploy]` |

## What This Product Does

People inside organisations are the first to see fraud, safety violations and abuse, yet most never report it because they fear retaliation. "Anonymous" hotlines don't solve this. The operator can usually see who was invited or who logged in, and because nothing proves the reporter is an insider, these channels fill up with spam and fake claims that nobody takes seriously.

Whisper fixes both sides. An admin registers members by adding a one-way **member code** (generated on the member's own device) to an on-chain Merkle tree. When a member files a report, their browser generates a **zero-knowledge proof** that they hold the secret behind *some* code in the tree. The chain accepts the report as coming from a verified member, but no one, not even the admin who added the codes, can tell which member wrote it. A per-round **nullifier** stops any member from flooding the channel, and two reports from the same person still can't be linked to each other.

This needs Midnight specifically: the product depends on private inputs (the key and the Merkle path), selective disclosure of only what must be public (a shared root, an unlinkable tag, the report text), and a public ledger the organisation can't quietly edit. Compact circuits with witnesses and `disclose()` express exactly that. On a transparent chain, the reporter would be exposed. With a plain database, the organisation could rewrite history.

## Privacy Model

- **What is PUBLIC (on-chain, anyone can see):**
  - Organisation name, admin key **hash**, current round, member count
  - Member codes added by the admin, and the Merkle tree built from them. The codes are one-way hashes of secret keys, so they reveal nothing about the keys and, after a report, nothing about who used them
  - Spent nullifiers (one-time tags, unlinkable to member codes or to each other)
  - Report text, the round it was filed in, and its status
- **What is PRIVATE (private witness, never on-chain):**
  - The member's / admin's 32-byte secret key (`secretKey()` witness)
  - The Merkle path, i.e. *which* member the reporter is (`memberPath()` witness)
  - Which of the 3 per-round report slots was used (private circuit argument)
- **What the user PROVES without revealing:**
  - "I know a secret whose member code is in this organisation's tree" (Merkle root check)
  - "I haven't used this slot in this round" (nullifier not yet spent)
  - For admin actions: "I know the secret behind the admin hash"

`disclose()` appears only on: the computed Merkle root (shared by every member), the nullifier, the report text, the admin hash at deploy time, member codes being added, and the report id and status being set. See the header comment in [`contracts/whisper.compact`](contracts/whisper.compact).

**Fees:** the reporter's wallet pays fees in DUST, which is a shielded resource on Midnight, so paying the fee doesn't attach a public address to the report.

### Known limitations

- **The anonymity set is the member list.** With only 2 members, a report narrows the author down to 1 of 2. Anonymity is meaningful only once an organisation has registered enough members.
- **Content and timing aren't hidden.** The report text, its writing style, and when it lands (for example, right after the admin adds someone) can all identify the author.
- **The admin is trusted to register real members.** The admin could register codes they control (sybils), although every registration is visible as a public on-chain event.
- **No admin key rotation in the MVP**, and the tree holds at most 1,024 members (depth 10).
- **Keys are stored in browser localStorage.** Back them up; clearing site data deletes them.

## Tech Stack

| Layer | Tech |
|---|---|
| Smart contract | Compact (language 0.23, compiler 0.31.1) |
| Contract runtime / tests | `@midnight-ntwrk/compact-runtime` 0.16, Vitest |
| dApp SDK | Midnight.js 4.1.1 (contracts, indexer, proof provider, fetch ZK config) |
| Wallet | Lace via DApp Connector API 4 |
| Frontend | React 19, TypeScript, Vite 8 |
| Proving | Midnight proof server 8.0.3 (Docker) |
| CI | GitHub Actions + `midnightntwrk/setup-compact-action` |

```
contracts/whisper.compact   ← privacy core (Merkle membership + nullifiers)
managed/whisper/            ← compiler output: JS bindings, ZKIR, proving keys
src/utils/contract.ts       ← witnesses, private state, compiled-contract helpers
src/utils/providers.ts      ← Lace + indexer + proof-server providers, tx phase tracking
src/hooks/useMidnight.ts    ← deploy/join, per-org secret key, ledger subscription
src/components/             ← WalletConnect, AnonymousReport, AdminConsole, ReportFeed…
tests/whisper.test.ts       ← contract simulator tests
```

## Prerequisites

- [Lace wallet](https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk) with Midnight enabled, network set to **Preprod**, funded from the [faucet](https://faucet.preprod.midnight.network) with DUST generation on
- **Node.js v22+** (v24 recommended)
- **Docker**, for the proof server
- **Compact compiler 0.31.1**. This is only needed if you change the contract, since `managed/` is committed. Install with `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh`, then run `compact update 0.31.1`

## Setup & Run Locally

1. Clone and install:
   ```bash
   git clone https://github.com/ANSHSINGH5999/whisper.git
   cd whisper
   npm install
   ```
2. Start the proof server, and point Lace → Settings → Midnight → Proof server at `http://localhost:6300`:
   ```bash
   docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
   ```
3. (Optional) Recompile the contract:
   ```bash
   npm run compact
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173, click **Connect Lace**, then either open an existing organisation by contract address or deploy your own.

To pre-fill the contract address, set `VITE_CONTRACT_ADDRESS` in `.env.preprod`.

## Run Tests

```bash
npm run compact   # only if managed/ is stale
npm test
```

The 9 simulator tests cover:
- Initialisation
- Anonymous reporting by a member
- Rejection of non-members
- Nullifier double-use and the round reset
- The slot cap
- Independence between members
- Admin-only access control
- Status updates
- Unlinkability of the derived values

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and PR to `main`:

**install (`npm ci`) → `compact compile` → `npm test` → `tsc` + `vite build`**

## Usage Guide

See [docs/USAGE.md](docs/USAGE.md).

## Product X Profile

**[X PROFILE — added after the account is created]**

## License

Apache-2.0
