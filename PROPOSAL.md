# Whisper — Product Proposal

**Track:** Governance (also relevant to Consumer & Social, Healthcare)

## Problem

People inside organisations see fraud, safety violations and harassment first, but most never report it. The main reason is fear of retaliation. "Anonymous" hotlines don't fix this: the operator can see metadata, logins, or who was invited, and reports are trivially spammed or faked by outsiders because nothing proves the reporter is actually an insider.

So organisations are stuck choosing between:
- **Identified reports.** These are credible, but people won't make them.
- **Truly anonymous forms.** People will use them, but they get spam and fake reports and aren't credible.

## Solution

Whisper is an anonymous reporting channel where every report carries a zero-knowledge proof that it came from a verified member. No one, including the admin who registered the members, can tell which member wrote it.

- The admin registers members by adding a one-way **member code** (a hash of a secret the member generates on their own device) to a Merkle tree on-chain.
- To report, the member's browser proves membership in the tree without revealing which leaf is theirs.
- A **nullifier** caps reports per member per round, so the channel can't be flooded and the cap can't be bypassed. Two reports from the same person remain unlinkable.
- Report text and triage status (*Acknowledged / Resolved / Dismissed*) are public and tamper-proof, so the org is accountable for responding.

## Why Midnight

The product only works if three things hold at once: membership is verifiable, the reporter stays anonymous, and the record can't be tampered with. Midnight gives all three natively:
- **Compact circuits + private witnesses**: the secret key and Merkle path never leave the device.
- **Selective disclosure**: only the root check, the nullifier and the report text are `disclose()`d.
- **Public ledger**: report history and statuses can't be quietly deleted by the organisation.

## Users

- **Members:** employees, contractors, students, union members, clinic staff.
- **Admins:** compliance officers, ombudspersons, DAO stewards, HR.

## MVP scope (Level 4)

- Deploy an organisation contract to Preprod.
- Admin: add members, start rounds, set report status.
- Member: generate a key locally, share the member code, file a ZK-proven anonymous report (up to 3 per round).
- Public report feed with statuses.

## Later

- Encrypted report bodies (only the admin can read them; the public sees only that a report exists).
- Members can add follow-up evidence to their own report anonymously, proven with the same nullifier family.
- Self-registration via verifiable credentials (e.g. a work-email credential) instead of the admin adding codes.
- Shielded bounty payouts to reporters.
