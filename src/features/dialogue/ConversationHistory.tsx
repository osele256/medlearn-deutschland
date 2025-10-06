// src/features/dialogue/ConversationHistory.tsx
import { DialogueMessage } from '@/adapters/chrome-ai/types';

interface ConversationHistoryProps {
  messages: DialogueMessage[];
}

export function ConversationHistory({ messages }: ConversationHistoryProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Start the Conversation</h3>
        <p className="text-sm text-gray-500">Begin by greeting the patient and asking about their concern</p>
        <p className="text-xs text-gray-400 mt-2">Beginnen Sie mit einer Begrüßung und fragen Sie nach dem Anliegen</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'doctor' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] rounded-lg px-4 py-3 ${
              message.role === 'doctor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {/* Role Label */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold ${
                message.role === 'doctor' ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {message.role === 'doctor' ? (
                  <>
                    <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Doctor / Arzt
                  </>
                ) : (
                  <>
                    <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Patient
                  </>
                )}
              </span>
              <span className={`text-xs ${
                message.role === 'doctor' ? 'text-blue-200' : 'text-gray-400'
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
        </div>
      ))}
    </div>
  );
}