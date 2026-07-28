import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export class ObsidianVaultService {
  constructor(root = process.cwd()) {
    this.root = root;
    this.vaultDir = process.env.OBSIDIAN_VAULT_PATH || join(root, "obsidian", "GrimmVault");
    this.systemDir = join(this.vaultDir, "00_System");
    this.playerDir = join(this.vaultDir, "01_Player");
    this.reflectionsDir = join(this.vaultDir, "02_Reflections");
    this.improvementsDir = join(this.vaultDir, "03_Improvements");
    this.workOrdersDir = join(this.vaultDir, "04_Work_Orders");
    this.projectDir = join(this.vaultDir, "05_Project");
  }

  ensure() {
    for (const dir of [this.vaultDir, this.systemDir, this.playerDir, this.reflectionsDir, this.improvementsDir, this.workOrdersDir, this.projectDir]) {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
    this.writeIfMissing("START_HERE.md", startHere());
    this.writeIfMissing("AI_BUILDER_PROTOCOL.md", builderProtocol());
  }

  syncProjectDocs() {
    this.ensure();
    for (const file of ["vision.md", "identity.md", "mission.md", "voice.md", "constitution.md", "examples.md", "rules.md", "operating_manual.md"]) {
      this.copyIfMissing(join(this.root, "grimm", file), join(this.systemDir, file));
    }
    this.copyIfMissing(join(this.root, "BUILD.md"), join(this.projectDir, "BUILD.md"));
    this.copyIfMissing(join(this.root, "builder", "PROJECT_STATE.md"), join(this.projectDir, "PROJECT_STATE.md"));
    this.writeIfMissing(join("01_Player", "memory.md"), "# Player Memory\n\nNo memory saved yet.\n");
    this.writeIfMissing(join("01_Player", "goals.md"), "# Goals\n\nNo goals saved yet.\n");
    this.writeIfMissing(join("01_Player", "patterns.md"), "# Patterns\n\nNo patterns saved yet.\n");
    this.writeIfMissing(join("03_Improvements", "inbox.md"), "# Improvement Inbox\n\nNo improvement suggestions yet.\n");
  }

  readSystemDoc(grimmPath) {
    this.ensure();
    const path = join(this.systemDir, basename(grimmPath));
    if (!existsSync(path)) return "";
    return readFileSync(path, "utf8");
  }

  writePlayerMemory(memory = {}) {
    this.ensure();
    this.write(join("01_Player", "memory.md"), renderMemory(memory));
    this.write(join("01_Player", "goals.md"), renderList("Goals", memory.goals));
    this.write(join("01_Player", "patterns.md"), renderList("Patterns", memory.patterns));
  }

  appendReflection(entry = {}) {
    if (!entry?.id) return;
    this.ensure();
    const date = String(entry.createdAt || new Date().toISOString()).slice(0, 10);
    const path = join("02_Reflections", `${date}.md`);
    const existing = this.readVaultFile(path);
    this.write(path, existing + renderReflection(entry));
  }

  writeImprovementInbox(ideas = []) {
    this.ensure();
    this.write(join("03_Improvements", "inbox.md"), renderImprovements(ideas));
  }

  writeWorkOrder(fileName, content) {
    if (!fileName || !content) return;
    this.ensure();
    this.write(join("04_Work_Orders", fileName), content);
  }

  readVaultFile(relativePath) {
    try {
      return readFileSync(join(this.vaultDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }

  write(relativePath, content) {
    const path = join(this.vaultDir, relativePath);
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path, content, "utf8");
  }

  writeIfMissing(relativePath, content) {
    const path = join(this.vaultDir, relativePath);
    if (existsSync(path)) return;
    this.write(relativePath, content);
  }

  copyIfMissing(source, destination) {
    if (!existsSync(source) || existsSync(destination)) return;
    const dir = dirname(destination);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(destination, readFileSync(source, "utf8"), "utf8");
  }
}

function renderMemory(memory = {}) {
  return [
    "# Player Memory",
    "",
    `Updated: ${memory.updatedAt || new Date().toISOString()}`,
    "",
    renderList("Facts", memory.facts),
    renderList("Preferences", memory.preferences),
    renderList("Patterns", memory.patterns),
    renderList("Goals", memory.goals),
    renderList("Relationship", memory.relationship)
  ].join("\n");
}

function renderList(title, items = []) {
  const values = Array.isArray(items) ? items : [];
  return [`# ${title}`, "", ...values.map(item => `- ${item.text || item}`), ""].join("\n");
}

function renderReflection(entry = {}) {
  return [
    `\n## ${entry.createdAt || new Date().toISOString()}`,
    "",
    `ID: ${entry.id}`,
    `Mode: ${entry.mode || "normal"}`,
    "",
    `Summary: ${entry.summary || ""}`,
    "",
    renderInlineList("Recurring Patterns", entry.recurringPatterns),
    renderInlineList("Possible Memory Updates", entry.possibleMemoryUpdates),
    renderInlineList("Improvement Ideas", entry.improvementIdeas),
    renderInlineList("Burmese Misunderstandings", entry.burmeseMisunderstandings)
  ].join("\n");
}

function renderInlineList(title, items = []) {
  const values = Array.isArray(items) ? items : [];
  if (!values.length) return `### ${title}\n\n- None\n`;
  return [`### ${title}`, "", ...values.map(item => `- ${typeof item === "string" ? item : JSON.stringify(item)}`), ""].join("\n");
}

function renderImprovements(ideas = []) {
  const values = Array.isArray(ideas) ? ideas : [];
  return [
    "# Improvement Inbox",
    "",
    ...values.map(idea => [
      `## ${idea.summary || idea.originalMessage || "Untitled idea"}`,
      "",
      `Status: ${idea.status || "new"}`,
      `Category: ${idea.category || "feature"}`,
      `Created: ${idea.createdAt || ""}`,
      "",
      `Original: ${idea.originalMessage || ""}`,
      ""
    ].join("\n"))
  ].join("\n");
}

function startHere() {
  return `# Grimm Vault

This Obsidian vault is Grimm's provider-agnostic memory and project workspace.

Any AI builder may work here: Codex, Claude Code, Gemini CLI, Cursor, OpenAI, Ollama, LM Studio, or future systems.

Read first:

1. [[AI_BUILDER_PROTOCOL]]
2. [[00_System/vision]]
3. [[00_System/identity]]
4. [[00_System/constitution]]
5. [[05_Project/PROJECT_STATE]]
6. [[05_Project/BUILD]]

The files and storage are the source of truth. AI models are replaceable.
`;
}

function builderProtocol() {
  return `# AI Builder Protocol

Grimm owns the project.

AI builders execute work orders and preserve the architecture.

Rules:

- Read this vault before coding.
- Read project state before changing files.
- Do not hardcode Grimm's identity in code.
- Do not depend on one AI provider.
- Keep secrets out of GitHub.
- Update documentation after meaningful architecture changes.
- Preserve the 3-layer UI unless an approved work order changes it.
`;
}
