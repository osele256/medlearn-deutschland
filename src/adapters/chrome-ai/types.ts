// src/adapters/chrome-ai/types.ts
// Internal adapter types - isolate app from Chrome AI changes

export type AIResultStatus = "success" | "error" | "unavailable" | "loading";

export interface AIError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  originalError?: unknown;
  timestamp: number;
}

export type AIErrorCode =
  | "API_UNAVAILABLE"
  | "API_NOT_READY"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "INVALID_INPUT"
  | "INVALID_RESPONSE"
  | "SESSION_LOST"
  | "UNKNOWN";

export type AIResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; error: AIError }
  | { status: "unavailable"; reason: string }
  | { status: "loading" };

export interface AICapabilities {
  prompt: "available" | "downloading" | "unavailable";
  translator: "available" | "downloading" | "unavailable";
  rewriter: "available" | "downloading" | "unavailable";
  lastChecked: number;
}

// Domain types for business logic
export type MedicalSpecialty =
  | "cardiology"
  | "pediatrics"
  | "emergency"
  | "surgery"
  | "psychiatry"
  | "neurology"
  | "nursing"
  | "geriatrics";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface ScenarioParams {
  specialty: MedicalSpecialty;
  difficulty: DifficultyLevel;
}

export interface Scenario {
  id: string;
  specialty: MedicalSpecialty;
  difficulty: DifficultyLevel;
  title: string;
  description: string;
  chiefComplaint: string;
  vitalSigns?: {
    bp?: string;
    hr?: number;
    rr?: number;
    temp?: number;
    spo2?: number;
  };
  createdAt: number;
}

export interface DialogueContext {
  scenario?: Scenario;
  history: DialogueMessage[];
  maxHistoryLength?: number;
}

export interface DialogueMessage {
  id: string;
  role: "doctor" | "patient";
  content: string;
  timestamp: number;
}

export interface DialogueResponse {
  message: string;
  emotion?: string;
  suggestions?: string[];
}

export interface TranslationParams {
  term: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  alternatives?: string[];
  context?: string;
}

export interface GrammarSuggestion {
  original: string;
  suggestion: string;
  type: "grammar" | "spelling" | "style" | "clarity";
  position: {
    start: number;
    end: number;
  };
  explanation?: string;
}

export interface GrammarCheckResult {
  originalText: string;
  correctedText: string;
  suggestions: GrammarSuggestion[];
  score?: number;
}

// Adapter interface - this is the contract the app depends on
export interface ChromeAIAdapter {
  // Capability checking
  checkCapabilities(): Promise<AICapabilities>;

  // Prompt API
  generateScenario(params: ScenarioParams): Promise<AIResult<Scenario>>;
  simulateDialogue(
    message: string,
    context: DialogueContext
  ): Promise<AIResult<DialogueResponse>>;

  // Translator API
  translateTerm(
    params: TranslationParams
  ): Promise<AIResult<TranslationResult>>;

  // Rewriter API (used for grammar checking)
  checkGrammar(text: string): Promise<AIResult<GrammarCheckResult>>;

  // Cleanup
  destroy(): void;
}
