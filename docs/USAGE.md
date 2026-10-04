# How to Use Whisper

Whisper lets people inside an organisation report problems — fraud, safety issues, harassment — while proving they really are insiders, without anyone (including the admin who invited them) being able to tell who wrote which report.

## What You Need

- **Google Chrome** (or another Chromium browser)
- **Lace or 1AM wallet** extension with Midnight enabled and the network set to **Preprod**
- Some **tNIGHT** from the [Preprod faucet](https://faucet.preprod.midnight.network), with **DUST generation** turned on in your wallet (DUST pays transaction fees)
- A **proof server** that Lace can reach. The simplest is running it locally with Docker:
  ```bash
  docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v
  ```
  Then in wallet settings → Midnight, set the proof server to `http://localhost:6300`.

## Step-by-Step Guide

### If you're a member (reporter)

1. Open the Whisper app and click **Connect wallet**, choose Lace or 1AM, and approve the connection in the wallet pop-up.
2. Paste your organisation's **contract address** (your admin shares it) and click **Open**.
3. Find the **Member code** panel and click **Copy**. Send this code to your admin through any channel — email or chat is fine. It's a one-way code; it can't reveal or recreate your secret key.
4. Open **"Back up or restore your secret key"**, click **Reveal**, and save the key somewhere safe (a password manager). This browser is the only place it exists.
5. Wait until the admin tells you they've added you. The header will change from **Not registered** to **Member**.
6. Write your report in the **File a report** box. Stick to facts; avoid details only you could know.
7. Click **Prove & submit anonymously**. Watch the progress bar:
   - *Run circuit locally* — your key is used on your device only
   - *Generate ZK proof* — takes about 30–90 seconds
   - *Approve in your wallet* — confirm the transaction in the pop-up
   - *Submit* and *Confirm on-chain*
8. Your report appears in the **Reports** list as "Filed by: a verified member". You can file up to 3 reports per round.

### If you're an admin

1. Connect your wallet, enter your organisation's name under **Deploy your own**, and click **Deploy contract**. Approve in your wallet.
2. Copy the **contract address** shown under the organisation name and share it with your members.
3. When a member sends you their member code, paste it into **Manage members → Add member**.
4. As reports arrive, mark them **Acknowledged**, **Resolved**, or **Dismissed**. Everyone can see the status, so reporters know they've been heard.
5. Click **Start round N** to give every member a fresh set of 3 report slots (e.g. monthly).

> Back up your admin key too (**Back up or restore your secret key**). Without it you can't add members or triage reports.

## What Gets Proved (and What Stays Private)

When you submit a report, your browser creates a zero-knowledge proof of this statement:

> "I know a secret key whose member code is somewhere in this organisation's member list, and I haven't used this report slot yet this round."

| | Who can see it |
|---|---|
| The report text | Everyone (it's on the public ledger) |
| That *some* verified member filed it | Everyone |
| A one-time tag (nullifier) that prevents spamming | Everyone — but it can't be linked to your member code or to your other reports |
| Your secret key | Only you — it never leaves your browser |
| Which member code is yours | Only you and the admin, and the admin can't connect it to any report |
| Which of your 3 slots you used | Only you |

**What Whisper can't hide:** what you write. If a report contains details only you would know, or your distinctive writing style, people may guess it's you. The time a report lands and the total number of members are also public.

## Troubleshooting

| Problem | What to do |
|---|---|
| "No Midnight wallet found" | Install Lace or 1AM, enable Midnight in its settings, then reload the page. |
| "Could not reach the proof server" | Start the Docker proof server (see *What You Need*) and make sure your wallet points to `http://localhost:6300`. |
| "Not enough tDUST to pay fees" | Get tNIGHT from the faucet and turn on DUST generation in your wallet. Wait a few minutes for DUST to accumulate. |
| "Your key is not registered in this organisation yet" | The admin hasn't added your member code — or you're in a different browser. Restore your backed-up key. |
| "Report slot already used this round" / 0 reports left | Wait for the admin to start a new round. |
| "Only the admin can do this" | You're not using the key that deployed this organisation. Restore the admin key. |
| Stuck on "Generate ZK proof" | The first proof can take up to 2 minutes. Check the Docker terminal for activity. |
| "You declined the request in your wallet" | Click the button again and approve in Lace. |
