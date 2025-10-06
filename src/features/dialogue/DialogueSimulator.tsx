// src/features/dialogue/DialogueSimulator.tsx
import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { ConversationHistory } from './ConversationHistory';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export function DialogueSimulator() {
  const {
    activeDialogue,
    isSendingMessage,
    dialogueError,
    currentScenario,
    sendMessage,
    clearDialogue,
    clearError,
    startDialogue,
  } = useStore();

  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDialogue?.history]);

  // If no active dialogue but we have a current scenario, prompt to start
  if (!activeDialogue && currentScenario) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Practice Dialogue
            </h3>
            <p className="text-gray-600 mb-2">
              Bereit für das Patientengespräch
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Scenario:</h4>
              <p className="text-sm text-gray-900 font-medium">{currentScenario.title}</p>
              <p className="text-xs text-gray-500 mt-1">{currentScenario.chiefComplaint}</p>
            </div>

            <button
              onClick={() => startDialogue(currentScenario)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Conversation / Gespräch beginnen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no scenario at all, prompt to generate one
  if (!activeDialogue && !currentScenario) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Scenario Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate a clinical scenario first, then start a dialogue
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Erstellen Sie zuerst ein Szenario, dann beginnen Sie das Gespräch
          </p>
        </div>
      </div>
    );
  }

  // Active dialogue interface
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header with scenario info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {activeDialogue?.scenario?.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Chief Complaint:</span>{' '}
              {activeDialogue?.scenario?.chiefComplaint}
            </p>
          </div>
          
          <button
            onClick={clearDialogue}
            className="text-gray-400 hover:text-red-600 transition-colors ml-4"
            title="End conversation / Gespräch beenden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message count */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {activeDialogue?.history.length || 0} messages
          </span>
        </div>
      </div>

      {/* Error Display */}
      {dialogueError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{dialogueError}</p>
            </div>
            <button
              onClick={() => clearError('dialogue')}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style={{ height: '600px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeDialogue && (
            <>
              <ConversationHistory messages={activeDialogue.history} />
              {isSendingMessage && <TypingIndicator />}
              <div ref={conversationEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <MessageInput
            onSend={sendMessage}
            disabled={isSendingMessage}
            isLoading={isSendingMessage}
          />
        </div>
      </div>

      {/* Helper Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Tips for Effective Practice / Tipps für effektives Üben
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ask open-ended questions (e.g., "Tell me more about the pain")</li>
          <li>• Practice OPQRST: Onset, Provocation, Quality, Region, Severity, Time</li>
          <li>• Use empathy: "I understand this must be concerning for you"</li>
          <li>• Ask about relevant medical history and medications</li>
          <li>• Try asking in German: "Können Sie mir mehr über die Schmerzen erzählen?"</li>
        </ul>
      </div>
    </div>
  );
}