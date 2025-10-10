// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChromeAIClient } from '@/adapters/chrome-ai/client';
import {
  AICapabilities,
  Scenario,
  ScenarioParams,
  DialogueMessage,
  DialogueContext,
  TranslationParams,
  TranslationResult,
  GrammarCheckResult,
} from '@/adapters/chrome-ai/types';
import { logger } from './logger';

// Initialize Chrome AI client (singleton)
const aiClient = new ChromeAIClient();

interface AppState {
  // API Status
  capabilities: AICapabilities | null;
  isCheckingCapabilities: boolean;
  
  // Scenarios
  currentScenario: Scenario | null;
  scenarioHistory: Scenario[];
  isGeneratingScenario: boolean;
  scenarioError: string | null;
  
  // Dialogue
  activeDialogue: DialogueContext | null;
  isSendingMessage: boolean;
  dialogueError: string | null;
  
  // Translation
  translations: TranslationResult[];
  isTranslating: boolean;
  translationError: string | null;
  
  // Grammar
  lastGrammarCheck: GrammarCheckResult | null;
  isCheckingGrammar: boolean;
  grammarError: string | null;
  
  // Actions
  checkAPIAvailability: () => Promise<void>;
  generateScenario: (params: ScenarioParams) => Promise<void>;
  startDialogue: (scenario: Scenario) => void;
  sendMessage: (content: string) => Promise<void>;
  clearDialogue: () => void;
  translateTerm: (params: TranslationParams) => Promise<void>;
  checkGrammar: (text: string) => Promise<void>;
  clearError: (type: 'scenario' | 'dialogue' | 'translation' | 'grammar') => void;

}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      capabilities: null,
      isCheckingCapabilities: false,
      currentScenario: null,
      scenarioHistory: [],
      isGeneratingScenario: false,
      scenarioError: null,
      activeDialogue: null,
      isSendingMessage: false,
      dialogueError: null,
      translations: [],
      isTranslating: false,
      translationError: null,
      lastGrammarCheck: null,
      isCheckingGrammar: false,
      grammarError: null,

      // Check API availability
      checkAPIAvailability: async () => {
        set({ isCheckingCapabilities: true });
        logger.info('store.check_capabilities.start');

        try {
          const capabilities = await aiClient.checkCapabilities();
          set({ capabilities, isCheckingCapabilities: false });
          logger.info('store.check_capabilities.success', { capabilities });
        } catch (error) {
          logger.error('store.check_capabilities.error', { error });
          set({ isCheckingCapabilities: false });
        }
      },

      // Generate scenario
      generateScenario: async (params: ScenarioParams) => {
        set({ isGeneratingScenario: true, scenarioError: null });
        logger.info('store.generate_scenario.start', params);

        try {
          const result = await aiClient.generateScenario(params);

          if (result.status === 'success') {
            const { currentScenario, scenarioHistory } = get();
            const newHistory = currentScenario
              ? [...scenarioHistory, currentScenario].slice(-10) // Keep last 10
              : scenarioHistory;

            set({
              currentScenario: result.data,
              scenarioHistory: newHistory,
              isGeneratingScenario: false,
              scenarioError: null,
            });
            logger.info('store.generate_scenario.success', {
              scenarioId: result.data.id,
            });
          } else if (result.status === 'error') {
            set({
              isGeneratingScenario: false,
              scenarioError: result.error.message,
            });
            logger.error('store.generate_scenario.error', {
              error: result.error,
            });
          } else {
            set({
              isGeneratingScenario: false,
              scenarioError: result.reason,
            });
          }
        } catch (error) {
          set({
            isGeneratingScenario: false,
            scenarioError: 'An unexpected error occurred',
          });
          logger.error('store.generate_scenario.exception', { error });
        }
      },

      // Start dialogue
      startDialogue: (scenario: Scenario) => {
        const dialogue: DialogueContext = {
          scenario,
          history: [],
        };
        set({ activeDialogue: dialogue, dialogueError: null });
        logger.info('store.start_dialogue', { scenarioId: scenario.id });
      },

      // Send message
      sendMessage: async (content: string) => {
        const { activeDialogue } = get();
        if (!activeDialogue) {
          logger.warn('store.send_message.no_active_dialogue');
          return;
        }

        // Optimistic update - add doctor message immediately
        const doctorMessage: DialogueMessage = {
          id: `msg-${Date.now()}`,
          role: 'doctor',
          content,
          timestamp: Date.now(),
        };

        const updatedHistory = [...activeDialogue.history, doctorMessage];
        set({
          activeDialogue: { ...activeDialogue, history: updatedHistory },
          isSendingMessage: true,
          dialogueError: null,
        });

        logger.info('store.send_message.start', { messageLength: content.length });

        try {
          const result = await aiClient.simulateDialogue(content, {
            ...activeDialogue,
            history: updatedHistory,
          });

          if (result.status === 'success') {
            const patientMessage: DialogueMessage = {
              id: `msg-${Date.now()}`,
              role: 'patient',
              content: result.data.message,
              timestamp: Date.now(),
            };

            const finalHistory = [...updatedHistory, patientMessage];
            set({
              activeDialogue: {
                ...activeDialogue,
                history: finalHistory,
              },
              isSendingMessage: false,
            });
            logger.info('store.send_message.success');
          } else if (result.status === 'error') {
            set({
              isSendingMessage: false,
              dialogueError: result.error.message,
            });
            logger.error('store.send_message.error', { error: result.error });
          } else {
            set({
              isSendingMessage: false,
              dialogueError: result.reason,
            });
          }
        } catch (error) {
          set({
            isSendingMessage: false,
            dialogueError: 'Failed to send message',
          });
          logger.error('store.send_message.exception', { error });
        }
      },

      // Clear dialogue
      clearDialogue: () => {
        set({ activeDialogue: null, dialogueError: null });
        logger.info('store.clear_dialogue');
      },

      // Translate term
      translateTerm: async (params: TranslationParams) => {
        set({ isTranslating: true, translationError: null });
        logger.info('store.translate_term.start', params);

        try {
          const result = await aiClient.translateTerm(params);

          if (result.status === 'success') {
            const { translations } = get();
            set({
              translations: [result.data, ...translations].slice(0, 50), // Keep last 50
              isTranslating: false,
            });
            logger.info('store.translate_term.success');
          } else if (result.status === 'error') {
            set({
              isTranslating: false,
              translationError: result.error.message,
            });
          } else {
            set({
              isTranslating: false,
              translationError: result.reason,
            });
          }
        } catch (error) {
          set({
            isTranslating: false,
            translationError: 'Translation failed',
          });
          logger.error('store.translate_term.exception', { error });
        }
      },

      // Check grammar
      checkGrammar: async (text: string) => {
        set({ isCheckingGrammar: true, grammarError: null });
        logger.info('store.check_grammar.start', { textLength: text.length });

        try {
          const result = await aiClient.checkGrammar(text);

          if (result.status === 'success') {
            set({
              lastGrammarCheck: result.data,
              isCheckingGrammar: false,
            });
            logger.info('store.check_grammar.success', {
              suggestionsCount: result.data.suggestions.length,
            });
          } else if (result.status === 'error') {
            set({
              isCheckingGrammar: false,
              grammarError: result.error.message,
            });
          } else {
            set({
              isCheckingGrammar: false,
              grammarError: result.reason,
            });
          }
        } catch (error) {
          set({
            isCheckingGrammar: false,
            grammarError: 'Grammar check failed',
          });
          logger.error('store.check_grammar.exception', { error });
        }
      },

      // Clear errors
      clearError: (type) => {
        const updates: Partial<AppState> = {};
        if (type === 'scenario') updates.scenarioError = null;
        if (type === 'dialogue') updates.dialogueError = null;
        if (type === 'translation') updates.translationError = null;
        if (type === 'grammar') updates.grammarError = null;
        set(updates);
      },
    }),
    {
      name: 'medical-learning-storage',
      partialize: (state) => ({
        // Only persist certain fields
        currentScenario: state.currentScenario,
        scenarioHistory: state.scenarioHistory,
        activeDialogue: state.activeDialogue,
        translations: state.translations.slice(0, 20), // Only persist 20 most recent
        lastGrammarCheck: state.lastGrammarCheck,
      }),
    }
  )
);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  aiClient.destroy();
});