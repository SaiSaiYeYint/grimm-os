# Grimm OS

Grimm is a local-first productivity companion with a character-driven judge,
chat, pond visuals, coins, reflections, and a human-readable Obsidian brain.

## Start on Windows

From Command Prompt or PowerShell:

```text
setup-grimm.cmd
start-grimm.cmd
```

Then open:

```text
http://localhost:8787
```

The setup script installs the locked Node dependencies, creates a local `.env`
from `.env.local.example` when needed, and runs the test suite. It never
overwrites an existing `.env`.

Ollama is the default local AI provider. Grimm still starts when Ollama is not
available and reports that the local model is asleep.

## Two-computer setup

Git is the source of truth for code. The Obsidian vault at `C:\Brain` is the
source of truth for durable project notes and Grimm memory.

See [MULTI_DEVICE_SETUP.md](MULTI_DEVICE_SETUP.md) before setting up the second
computer.

## Useful commands

```text
npm.cmd test
npm.cmd start
```

The repository intentionally excludes `.env`, dependencies, build output, and
the repo-local fallback Obsidian vault.
