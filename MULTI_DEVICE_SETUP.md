# Grimm on Laptop and PC

Use one source of truth for each kind of information:

- GitHub repository: app code and code history.
- `C:\Brain`: Obsidian project notes and durable Grimm memory.
- `.env`: private, device-specific settings. Never commit it.

## First setup on the PC

Install Git and the current Node.js LTS release, then open Command Prompt:

```text
mkdir C:\Projects
cd /d C:\Projects
git clone https://github.com/SaiSaiYeYint/grimm-os.git
cd grimm-os
setup-grimm.cmd
start-grimm.cmd
```

Do not put the PC clone inside OneDrive or Google Drive. Git should synchronize
the code; cloud-drive syncing of the repository's `.git` folder can create
conflicts.

## Put the Brain on both computers

Grimm expects the shared vault at:

```text
C:\Brain
```

Make the existing laptop `C:\Brain` folder available at that exact path on the
PC. Use one two-way sync system for the vault, not multiple sync systems at the
same time.

The laptop currently backs up `C:\Brain` with Google Drive. If Google Drive does
not provide a true two-way local folder at `C:\Brain` on the PC, use Syncthing
for `C:\Brain` on both computers instead.

Before changing devices, wait until the Brain sync reports that it is complete.
Do not edit the same Obsidian note on both computers at the same time.

## Normal work on either computer

Before starting:

```text
git pull --ff-only
```

After a useful change:

```text
npm.cmd test
git add -A
git commit -m "Describe the change"
git push
```

Push before switching computers. Pull before starting on the other computer.
Avoid editing the same branch on both machines at the same time.

## Local settings

`setup-grimm.cmd` creates `.env` from `.env.local.example` only when `.env` does
not already exist. The default local setup uses:

```text
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:1.5b
OBSIDIAN_VAULT_PATH=C:\Brain\Grimm
```

Install the same Ollama model on each computer that should run Grimm locally.
API keys, if used later, must be added separately to each computer's `.env`.

## What is not automatically shared

- Browser `localStorage` remains local to each browser/device.
- `.env` remains local to each computer.
- Installed Node packages and Ollama models remain local and are recreated from
  the committed setup files.
