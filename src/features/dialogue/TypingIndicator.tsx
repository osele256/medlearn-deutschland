// src/features/dialogue/TypingIndicator.tsx
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[75%] rounded-lg px-4 py-3 bg-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-500">
            <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Patient
          </span>
          <span className="text-xs text-gray-400">ist am Schreiben...</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}