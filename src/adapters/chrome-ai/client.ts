// src/adapters/chrome-ai/client.ts
import { logger } from "@/lib/logger";
import {
  ChromeAIAdapter,
  AIResult,
  AICapabilities,
  AIError,
  Scenario,
  ScenarioParams,
  DialogueContext,
  DialogueResponse,
  TranslationParams,
  TranslationResult,
  GrammarCheckResult,
} from "./types";
import { getCachedScenario, getCachedDialogueResponse } from "./fallbacks";

const TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class ChromeAIClient implements ChromeAIAdapter {
  private languageModel: AILanguageModel | null = null;
  private translator: AITranslator | null = null;
  private rewriter: AIRewriter | null = null;
  private destroyed = false;

  async checkCapabilities(): Promise<AICapabilities> {
    const start = Date.now();

    try {
      const [prompt, translator, rewriter] = await Promise.all([
        this.checkPromptAPI(),
        this.checkTranslatorAPI(),
        this.checkRewriterAPI(),
      ]);

      const capabilities: AICapabilities = {
        prompt,
        translator,
        rewriter,
        lastChecked: Date.now(),
      };

      logger.info("ai.capabilities.checked", {
        capabilities,
        duration: Date.now() - start,
      });

      return {
        id: `scenario-${Date.now()}`,
        specialty: params.specialty,
        difficulty: params.difficulty,
        title: parsed.title || "Medical Scenario",
        description: parsed.description || "No description available",
        chiefComplaint:
          parsed.chiefComplaint || "Patient presenting for evaluation",
        vitalSigns: parsed.vitalSigns,
        createdAt: Date.now(),
      };
    } catch (error) {
      logger.error("ai.scenario.parse_error", { response, error });
      throw new Error("Failed to parse scenario response");
    }
  }

  private buildDialoguePrompt(
    message: string,
    context: DialogueContext
  ): string {
    const historyText = context.history
      .slice(-10) // Last 10 messages for context
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const scenarioContext = context.scenario
      ? `\nScenario: ${context.scenario.description}\nChief Complaint: ${context.scenario.chiefComplaint}`
      : "";

    return `You are a patient in a German medical consultation. Respond primarily in German with occasional English medical terms when appropriate.${scenarioContext}

Previous conversation:
${historyText}

Doctor: ${message}

Respond naturally as the patient IN GERMAN. Use everyday German that a real patient would use. Mix in English medical terms if the patient would be confused or uncertain. Format as JSON:
{
  "message": "Deine Antwort auf Deutsch (Your response in German)",
  "emotion": "calm|anxious|relieved|confused",
  "suggestions": ["mögliche Folgefrage 1", "mögliche Frage 2"]
}

Example patient responses:
- "Ja, die Schmerzen haben vor etwa zwei Stunden angefangen."
- "Ich bin nicht sicher... maybe it's the medication?"
- "Es tut hier weh." (points to chest)`;
  }

  private parseDialogueResponse(response: string): DialogueResponse {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        message: parsed.message || response,
        emotion: parsed.emotion,
        suggestions: parsed.suggestions,
      };
    } catch (error) {
      // Fallback: use raw response as message
      return {
        message: response.trim(),
      };
    }
  }

  private parseGrammarResult(
    original: string,
    corrected: string
  ): GrammarCheckResult {
    const suggestions: GrammarCheckResult["suggestions"] = [];

    // Simple diff algorithm - in production you'd want a proper diff library
    if (original !== corrected) {
      const originalWords = original.split(" ");
      const correctedWords = corrected.split(" ");

      let position = 0;
      for (
        let i = 0;
        i < Math.max(originalWords.length, correctedWords.length);
        i++
      ) {
        if (originalWords[i] !== correctedWords[i]) {
          suggestions.push({
            original: originalWords[i] || "",
            suggestion: correctedWords[i] || "",
            type: "grammar",
            position: {
              start: position,
              end: position + (originalWords[i]?.length || 0),
            },
          });
        }
        position += (originalWords[i]?.length || 0) + 1;
      }
    }

    return {
      originalText: original,
      correctedText: corrected,
      suggestions,
      score:
        suggestions.length === 0
          ? 100
          : Math.max(0, 100 - suggestions.length * 5),
    };
  }
  private async getCapabilities(): Promise<CapabilitiesResult> {
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      // You can do something with capabilities here if needed
      return {
        prompt: capabilities.prompt || "available",
        translator: capabilities.translator || "available",
        rewriter: capabilities.rewriter || "available",
        lastChecked: Date.now(),
      };
    } catch (error) {
      logger.error("ai.capabilities.error", { error });
      return {
        prompt: "unavailable",
        translator: "unavailable",
        rewriter: "unavailable",
        lastChecked: Date.now(),
      };
    }
  }

  private async checkPromptAPI(): Promise<
    "available" | "downloading" | "unavailable"
  > {
    if (!window.ai?.languageModel) return "unavailable";

    try {
      const capabilities = await window.ai.languageModel.capabilities();
      if (capabilities.available === "readily") return "available";
      if (capabilities.available === "after-download") return "downloading";
      return "unavailable";
    } catch {
      return "unavailable";
    }
  }

  private async checkTranslatorAPI(): Promise<
    "available" | "downloading" | "unavailable"
  > {
    if (!window.ai?.translator) return "unavailable";

    try {
      const capabilities = await window.ai.translator.capabilities();
      if (capabilities.available === "readily") return "available";
      if (capabilities.available === "after-download") return "downloading";
      return "unavailable";
    } catch {
      return "unavailable";
    }
  }

  private async checkRewriterAPI(): Promise<
    "available" | "downloading" | "unavailable"
  > {
    if (!window.ai?.rewriter) return "unavailable";

    try {
      const capabilities = await window.ai.rewriter.capabilities();
      if (capabilities.available === "readily") return "available";
      if (capabilities.available === "after-download") return "downloading";
      return "unavailable";
    } catch {
      return "unavailable";
    }
  }

  async generateScenario(params: ScenarioParams): Promise<AIResult<Scenario>> {
    const start = Date.now();
    logger.info("ai.scenario.start", params);

    if (!window.ai?.languageModel) {
      logger.warn("ai.scenario.unavailable", params);
      return {
        status: "success",
        data: getCachedScenario(params),
      };
    }

    return this.withRetry(async () => {
      try {
        if (!this.languageModel) {
          this.languageModel = await window.ai!.languageModel!.create({
            systemPrompt:
              "You are a medical education assistant. Generate realistic clinical scenarios for medical students.",
            temperature: 0.8,
          });
        }

        const prompt = this.buildScenarioPrompt(params);
        const response = await this.withTimeout(
          this.languageModel.prompt(prompt),
          TIMEOUT_MS
        );

        const scenario = this.parseScenarioResponse(response, params);

        logger.info("ai.scenario.success", {
          ...params,
          duration: Date.now() - start,
          scenarioId: scenario.id,
        });

        return { status: "success", data: scenario };
      } catch (error) {
        logger.error("ai.scenario.error", {
          params,
          error,
          duration: Date.now() - start,
        });

        const aiError = this.normalizeError(error, "SCENARIO_GENERATION");

        // Fallback to cached scenario
        if (!aiError.retryable) {
          logger.info("ai.scenario.fallback", params);
          return { status: "success", data: getCachedScenario(params) };
        }

        return { status: "error", error: aiError };
      }
    });
  }

  async simulateDialogue(
    message: string,
    context: DialogueContext
  ): Promise<AIResult<DialogueResponse>> {
    const start = Date.now();
    logger.info("ai.dialogue.start", { messageLength: message.length });

    if (!window.ai?.languageModel) {
      logger.warn("ai.dialogue.unavailable");
      return {
        status: "success",
        data: getCachedDialogueResponse(),
      };
    }

    return this.withRetry(async () => {
      try {
        if (!this.languageModel) {
          this.languageModel = await window.ai!.languageModel!.create({
            systemPrompt:
              "You are a patient in a medical scenario. Respond realistically to the doctor's questions.",
            temperature: 0.9,
          });
        }

        const prompt = this.buildDialoguePrompt(message, context);
        const response = await this.withTimeout(
          this.languageModel.prompt(prompt),
          TIMEOUT_MS
        );

        const dialogueResponse = this.parseDialogueResponse(response);

        logger.info("ai.dialogue.success", {
          duration: Date.now() - start,
          responseLength: dialogueResponse.message.length,
        });

        return { status: "success", data: dialogueResponse };
      } catch (error) {
        logger.error("ai.dialogue.error", {
          error,
          duration: Date.now() - start,
        });

        const aiError = this.normalizeError(error, "DIALOGUE_SIMULATION");

        if (!aiError.retryable) {
          return { status: "success", data: getCachedDialogueResponse() };
        }

        return { status: "error", error: aiError };
      }
    });
  }

  async translateTerm(
    params: TranslationParams
  ): Promise<AIResult<TranslationResult>> {
    const start = Date.now();
    logger.info("ai.translate.start", params);

    // Check if Translator API is available
    if (!window.ai?.translator) {
      logger.warn("ai.translate.unavailable");

      // Use basic dictionary fallback
      const basicTranslation = this.basicTranslate(
        params.term,
        params.sourceLanguage,
        params.targetLanguage
      );

      return {
        status: "success",
        data: {
          original: params.term,
          translated: basicTranslation,
          sourceLanguage: params.sourceLanguage,
          targetLanguage: params.targetLanguage,
        },
      };
    }

    // Use AI translator with retry logic
    return this.withRetry(async () => {
      try {
        // Initialize translator if not already done
        if (!this.translator) {
          this.translator = await window.ai.translator.create({
            sourceLanguage: params.sourceLanguage,
            targetLanguage: params.targetLanguage,
          });
        }

        // Perform translation with timeout
        const translated = await this.withTimeout(
          this.translator.translate(params.term),
          TIMEOUT_MS
        );

        const result: TranslationResult = {
          original: params.term,
          translated,
          sourceLanguage: params.sourceLanguage,
          targetLanguage: params.targetLanguage,
        };

        logger.info("ai.translate.success", {
          duration: Date.now() - start,
          termLength: params.term.length,
        });

        return { status: "success", data: result };
      } catch (error) {
        logger.error("ai.translate.error", { params, error });

        const aiError = this.normalizeError(error, "TRANSLATION");
        return { status: "error", error: aiError };
      }
    });
  }

  async checkGrammar(text: string): Promise<AIResult<GrammarCheckResult>> {
    const start = Date.now();
    logger.info("ai.grammar.start", { textLength: text.length });

    if (!window.ai?.rewriter) {
      return {
        status: "unavailable",
        reason: "Grammar checking API not available in this browser",
      };
    }

    return this.withRetry(async () => {
      try {
        if (!this.rewriter) {
          this.rewriter = await window.ai.rewriter.create({
            tone: "formal",
            format: "plain-text",
            length: "same",
          });
        }

        const correctedText = await this.withTimeout(
          this.rewriter.rewrite(text),
          TIMEOUT_MS
        );

        const result = this.parseGrammarResult(text, correctedText);

        logger.info("ai.grammar.success", {
          duration: Date.now() - start,
          suggestionsCount: result.suggestions.length,
        });

        return { status: "success", data: result };
      } catch (error) {
        logger.error("ai.grammar.error", { error });

        const aiError = this.normalizeError(error, "GRAMMAR_CHECK");
        return { status: "error", error: aiError };
      }
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.languageModel?.destroy();
    this.translator?.destroy();
    this.rewriter?.destroy();
    this.languageModel = null;
    this.translator = null;
    this.rewriter = null;
    logger.info("ai.client.destroyed");
  }

  // Helper methods
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
      ),
    ]);
  }

  private async withRetry<T>(
    operation: () => Promise<AIResult<T>>,
    retries = MAX_RETRIES
  ): Promise<AIResult<T>> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await operation();

      if (result.status === "success" || result.status === "unavailable") {
        return result;
      }

      if (result.status === "error" && !result.error.retryable) {
        return result;
      }

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        logger.info("ai.retry", { attempt, delay });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      status: "error",
      error: {
        code: "UNKNOWN",
        message: "Max retries exceeded",
        retryable: false,
        timestamp: Date.now(),
      },
    };
  }

  private normalizeError(error: unknown, context: string): AIError {
    const message = error instanceof Error ? error.message : String(error);

    let code: AIError["code"] = "UNKNOWN";
    let retryable = true;

    if (message.includes("timeout")) {
      code = "TIMEOUT";
    } else if (
      message.includes("not available") ||
      message.includes("unavailable")
    ) {
      code = "API_UNAVAILABLE";
      retryable = false;
    } else if (message.includes("rate limit")) {
      code = "RATE_LIMITED";
    } else if (message.includes("session")) {
      code = "SESSION_LOST";
    }

    return {
      code,
      message: `${context}: ${message}`,
      retryable,
      originalError: error,
      timestamp: Date.now(),
    };
  }

  private buildScenarioPrompt(params: ScenarioParams): string {
    return `Generate a realistic ${params.difficulty} medical scenario for ${params.specialty}.

Format as JSON:
{
  "title": "Brief title",
  "description": "Detailed clinical presentation",
  "chiefComplaint": "Why patient came in",
  "vitalSigns": {
    "bp": "120/80",
    "hr": 75,
    "rr": 16,
    "temp": 37.0,
    "spo2": 98
  }
}`;
  }

  private parseScenarioResponse(
    response: string,
    params: ScenarioParams
  ): Scenario {
    try {
      // Extract JSON from response (AI might add extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed;
    } catch (error) {
      console.error("Error parsing scenario response:", error);
      throw error; // or return a default Scenario object if needed
    }
  }
  private basicTranslate(term: string, source: string, target: string): string {
    // Basic medical dictionary EN <-> DE
    const dictionary: Record<string, string> = {
      // EN -> DE
      "heart attack": "Herzinfarkt",
      "chest pain": "Brustschmerzen",
      "shortness of breath": "Atemnot",
      fever: "Fieber",
      headache: "Kopfschmerzen",
      "blood pressure": "Blutdruck",
      diabetes: "Diabetes",
      infection: "Infektion",
      surgery: "Operation",
      medication: "Medikament",
      diagnosis: "Diagnose",
      treatment: "Behandlung",
      symptoms: "Symptome",
      prescription: "Rezept",
      emergency: "Notfall",

      // DE -> EN (reverse lookup)
      herzinfarkt: "heart attack",
      brustschmerzen: "chest pain",
      atemnot: "shortness of breath",
      fieber: "fever",
      kopfschmerzen: "headache",
      blutdruck: "blood pressure",
      diabetes: "diabetes",
      infektion: "infection",
      operation: "surgery",
      medikament: "medication",
      diagnose: "diagnosis",
      behandlung: "treatment",
      symptome: "symptoms",
      rezept: "prescription",
      notfall: "emergency",
    };

    const lowerTerm = term.toLowerCase();
    return dictionary[lowerTerm] || `[Translation unavailable: ${term}]`;
  }
}
