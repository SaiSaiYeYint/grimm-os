import { GeminiProvider } from "./providers/GeminiProvider.js";

export class ProviderService {
  constructor({ providerName = process.env.GRIMM_PROVIDER || "gemini", providers = {} } = {}) {
    this.providerName = providerName;
    this.providers = {
      gemini: providers.gemini || new GeminiProvider(),
      mock: providers.mock || new MockProvider()
    };
  }

  get provider() {
    return this.providers[this.providerName] || this.providers.mock;
  }

  get configured() {
    return Boolean(this.provider?.configured);
  }

  async generate({ systemInstruction = "", userPrompt = "" } = {}) {
    return this.provider.generate(userPrompt, { systemInstruction });
  }

  health() {
    const provider = this.provider;
    return {
      provider: this.providerName,
      model: provider?.model || "mock",
      configured: Boolean(provider?.configured)
    };
  }
}

class MockProvider {
  constructor() {
    this.model = "mock";
  }

  get configured() {
    return true;
  }

  async generate() {
    return JSON.stringify({
      reply: "Mock brain is awake. Real provider is not configured.",
      coinsDelta: 0,
      memoryUpdate: {},
      shouldLog: false,
      improvement: null,
      workOrder: null,
      mode: "normal",
      suggestedActions: []
    });
  }
}
