# Demo Video Script (≈3 minutes)

Record with two browser profiles side by side: **Admin** (left) and **Member** (right), both with Lace on Preprod.

| Time | Screen | Say |
|---|---|---|
| 0:00 | Landing page | "Whisper is anonymous insider reporting on Midnight. A report proves it came from a verified member — but not which one." |
| 0:15 | `contracts/whisper.compact` header comment | "The privacy core: the member's secret key and Merkle path are private witnesses. Only the Merkle root, a one-time nullifier and the report text are disclosed." |
| 0:35 | Admin: Connect Lace → Deploy your own | "The admin deploys an organisation. Only a hash of their key goes on-chain." Approve in Lace, show the contract address. |
| 0:55 | Member: Connect Lace → Open org → Member code | "The member's key is generated in their browser. They send the admin this one-way code — never the key." Copy it. |
| 1:10 | Admin: Add member | Paste code, approve. "The code goes into a Merkle tree." |
| 1:25 | Member: File a report | Type a report. Point at the privacy lens: "Leaves your device vs stays on your device." Click **Prove & submit anonymously**. |
| 1:35 | Stepper | "Circuit runs locally, the proof server builds a zero-knowledge proof, Lace pays fees in shielded DUST." |
| 2:05 | Feed | "The report appears as 'Filed by: a verified member'. The admin who added this member can't tell it was them." |
| 2:20 | Member: submit with a non-member key / show slots counter | "A per-round nullifier caps spam — 3 reports per round — and two reports from the same person can't be linked." |
| 2:35 | Admin: mark Acknowledged | "Statuses are public and tamper-proof, so the org is accountable." |
| 2:45 | GitHub: green CI badge + tests | "Contract tests and build run in CI on every push. Contract address and live demo are in the README." |
