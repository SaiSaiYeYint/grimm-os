import { MemoryService } from "./MemoryService.js";
import { PromptService } from "./PromptService.js";
import { ProviderService } from "./ProviderService.js";
import { ResponseValidator } from "./ResponseValidator.js";

export class GrimmRuntime {
  constructor({
    memoryService = new MemoryService(),
    promptService = new PromptService(),
    providerService = new ProviderService(),
    responseValidator = new ResponseValidator()
  } = {}) {
    this.memoryService = memoryService;
    this.promptService = promptService;
    this.providerService = providerService;
    this.responseValidator = responseValidator;
  }

  async respond(input = {}) {
    const runtimeInput = this.prepareInput(input);
    const prompt = this.promptService.build(runtimeInput);
    if (!this.providerService.configured) return this.responseValidator.fallback({ mode: runtimeInput.mode });
    const raw = await this.providerService.generate(prompt);
    const response = this.responseValidator.validate(raw, { mode: runtimeInput.mode });
    this.memoryService.saveUpdate(response.memoryUpdate, runtimeInput.message);
    return response;
  }

  prepareInput(input = {}) {
    const mode = String(input.mode || "normal");
    return {
      message: String(input.message || ""),
      mode,
      playerMemory: this.memoryService.forRequest(input.playerMemory || {}),
      recentMessages: Array.isArray(input.recentMessages) ? input.recentMessages.slice(-12) : [],
      improvementIdea: input.improvementIdea || null,
      improvementReview: input.improvementReview || null,
      improvementDecision: input.improvementDecision || null,
      lastImprovementDecision: input.lastImprovementDecision || null,
      decision: input.decision || null
    };
  }

  health(mode = "normal") {
    const provider = this.providerService.health();
    return {
      provider: provider.provider,
      model: provider.model,
      hasProvider: provider.configured,
      constitutionLoaded: this.promptService.hasFile("grimm/constitution.md"),
      promptFilesLoaded: this.promptService.promptFiles(mode).filter(file => this.promptService.hasFile(file))
    };
  }
}
