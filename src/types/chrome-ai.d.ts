// src/types/chrome-ai.d.ts
// Type definitions for experimental Chrome AI APIs

declare global {
  interface Window {
    ai?: {
      // Prompt API (Gemini Nano)
      languageModel?: {
        capabilities: () => Promise<{
          available: 'readily' | 'after-download' | 'no';
        }>;
        create: (options?: {
          systemPrompt?: string;
          temperature?: number;
          topK?: number;
        }) => Promise<AILanguageModel>;
      };

      // Translator API
      translator?: {
        capabilities: () => Promise<{
          available: 'readily' | 'after-download' | 'no';
          languagePairAvailable: (
            sourceLanguage: string,
            targetLanguage: string
          ) => Promise<'readily' | 'after-download' | 'no'>;
        }>;
        create: (options: {
          sourceLanguage: string;
          targetLanguage: string;
        }) => Promise<AITranslator>;
      };

      // Proofreader API
      rewriter?: {
        capabilities: () => Promise<{
          available: 'readily' | 'after-download' | 'no';
        }>;
        create: (options?: {
          sharedContext?: string;
          tone?: 'formal' | 'neutral' | 'casual';
          format?: 'plain-text' | 'markdown';
          length?: 'shorter' | 'same' | 'longer';
        }) => Promise<AIRewriter>;
      };
    };
  }

  interface AILanguageModel {
    prompt: (input: string) => Promise<string>;
    promptStreaming: (input: string) => ReadableStream<string>;
    countPromptTokens: (input: string) => Promise<number>;
    destroy: () => void;
  }

  interface AITranslator {
    translate: (text: string) => Promise<string>;
    destroy: () => void;
  }

  interface AIRewriter {
    rewrite: (text: string) => Promise<string>;
    rewriteStreaming: (text: string) => ReadableStream<string>;
    destroy: () => void;
  }
}

export {};