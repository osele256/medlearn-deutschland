import { useState } from 'react';
import { DialogueMessage } from '@/adapters/chrome-ai/types';

interface ConversationHistoryProps {
  messages: DialogueMessage[];
}

export function ConversationHistory({ messages }: ConversationHistoryProps) {
  const [translatedMessages, setTranslatedMessages] = useState<Set<string>>(new Set());

  const toggleTranslation = (messageId: string) => {
    setTranslatedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Start the Conversation</h3>
        <p className="text-sm text-gray-500">Begin by greeting the patient in German</p>
        <p className="text-xs text-gray-400 mt-2">Try: "Guten Tag, wie kann ich Ihnen helfen?"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const showTranslation = translatedMessages.has(message.id);
        const isPatient = message.role === 'patient';

        return (
          <div
            key={message.id}
            className={`flex ${message.role === 'doctor' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${isPatient ? 'space-y-2' : ''}`}>
              <div
                className={`rounded-lg px-4 py-3 ${message.role === 'doctor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                  }`}
              >
                {/* Role Label */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${message.role === 'doctor' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                    {message.role === 'doctor' ? (
                      <>
                        <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        You / Sie (Arzt/Ärztin)
                      </>
                    ) : (
                      <>
                        <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Patient 🇩🇪
                      </>
                    )}
                  </span>
                  <span className={`text-xs ${message.role === 'doctor' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                    {new Date(message.timestamp).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Message Content */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>

              {/* Translation button for patient messages */}
              {isPatient && (
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTranslation(message.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {showTranslation ? 'Hide' : 'Show'} English Translation
                  </button>
                </div>
              )}

              {/* Translation Panel */}
              {isPatient && showTranslation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="text-xs font-semibold text-blue-700 mb-1">
                    🇬🇧 English Translation:
                  </div>
                  <div className="text-sm text-gray-700">
                    {/* This would come from translation API or AI */}
                    <em>[Translation: This would show English translation of patient's German response]</em>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}