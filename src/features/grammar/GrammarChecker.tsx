// src/features/grammar/GrammarChecker.tsx
import { useState } from 'react';
import { useStore } from '@/lib/store';

const SAMPLE_TEXTS = {
  patientNote: `Patient presented with acute chest pain radiating to left arm. Vital signs was stable. EKG shows ST elevation in leads II, III, aVF. Patient have history of hypertension and smoking. Troponin levels is elevated. Recommend immediate cardiac catheterization.`,
  
  discharge: `The patient is discharge home with prescription for aspirin 100mg daily, metoprolol 50mg twice daily, and atorvastatin 40mg at bedtime. Follow up appointment in cardiology clinic in 2 week. Patient should avoiding strenuous activity for 4-6 weeks.`,
  
  referral: `I am referring this patient to your clinic for further evaluation of persistent headache. The symptoms began 3 months ago and is progressively worsening. Initial CT scan was normal. Patient tried several medications without significant improvement. Please see and advice.`
};

export function GrammarChecker() {
  const [text, setText] = useState('');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  const {
    lastGrammarCheck,
    isCheckingGrammar,
    grammarError,
    checkGrammar,
    clearError,
    capabilities,
  } = useStore();

  const handleCheck = () => {
    if (!text.trim()) return;
    checkGrammar(text);
    setAppliedSuggestions(new Set());
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLE_TEXTS) => {
    setText(SAMPLE_TEXTS[sampleKey]);
    setAppliedSuggestions(new Set());
  };

  const handleApplySuggestion = (index: number) => {
    if (!lastGrammarCheck) return;
    
    const suggestion = lastGrammarCheck.suggestions[index];
    const newText = text.substring(0, suggestion.position.start) +
                    suggestion.suggestion +
                    text.substring(suggestion.position.end);
    
    setText(newText);
    setAppliedSuggestions(new Set([...appliedSuggestions, index]));
  };

  const handleApplyAll = () => {
    if (!lastGrammarCheck) return;
    setText(lastGrammarCheck.correctedText);
    setAppliedSuggestions(new Set(lastGrammarCheck.suggestions.map((_, i) => i)));
  };

  const handleClear = () => {
    setText('');
    setAppliedSuggestions(new Set());
  };

  const isOffline = capabilities?.rewriter === 'unavailable';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Medical Grammar Checker</h2>
        <p className="mt-2 text-gray-600">
          Proofread and improve your German medical documentation
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Korrekturlesen und Verbesserung Ihrer deutschen medizinischen Dokumentation
        </p>
      </div>

      {/* Offline Warning */}
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Grammar Check API Offline</h3>
              <p className="mt-1 text-sm text-amber-700">
                Chrome Rewriter API is not available. Enable it in chrome://flags
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Text Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Your Text / Ihr Text</h3>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                disabled={!text || isCheckingGrammar}
                className="text-sm text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your medical text here...&#10;&#10;Fügen Sie hier Ihren medizinischen Text ein..."
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
            disabled={isCheckingGrammar || isOffline}
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {text.length} characters • {text.split(/\s+/).filter(Boolean).length} words
            </span>
            
            <button
              onClick={handleCheck}
              disabled={isCheckingGrammar || !text.trim() || isOffline}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isCheckingGrammar ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </span>
              ) : (
                'Check Grammar'
              )}
            </button>
          </div>

          {/* Sample Texts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Load Sample Text / Beispieltext laden
            </h4>
            <div className="space-y-2">
              {Object.entries(SAMPLE_TEXTS).map(([key, _]) => (
                <button
                  key={key}
                  onClick={() => handleLoadSample(key as keyof typeof SAMPLE_TEXTS)}
                  disabled={isCheckingGrammar}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {key === 'patientNote' && '📋 Patient Note (with errors)'}
                  {key === 'discharge' && '🏥 Discharge Summary (with errors)'}
                  {key === 'referral' && '📄 Referral Letter (with errors)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Suggestions / Vorschläge
            </h3>
            {lastGrammarCheck && lastGrammarCheck.suggestions.length > 0 && (
              <button
                onClick={handleApplyAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Apply All ({lastGrammarCheck.suggestions.length})
              </button>
            )}
          </div>

          {/* Error Display */}
          {grammarError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{grammarError}</p>
                </div>
                <button
                  onClick={() => clearError('grammar')}
                  className="ml-3 text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Suggestions List */}
          {lastGrammarCheck && lastGrammarCheck.suggestions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lastGrammarCheck.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    appliedSuggestions.has(index)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      suggestion.type === 'grammar' ? 'bg-red-100 text-red-700' :
                      suggestion.type === 'spelling' ? 'bg-orange-100 text-orange-700' :
                      suggestion.type === 'style' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {suggestion.type}
                    </span>
                    
                    {!appliedSuggestions.has(index) && (
                      <button
                        onClick={() => handleApplySuggestion(index)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Apply
                      </button>
                    )}
                    
                    {appliedSuggestions.has(index) && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Applied
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">{suggestion.original}</span>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-sm font-medium text-green-600">{suggestion.suggestion}</span>
                    </div>
                    
                    {suggestion.explanation && (
                      <p className="text-xs text-gray-600 mt-2">{suggestion.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : lastGrammarCheck && lastGrammarCheck.suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Great! No Errors Found</h3>
              <p className="text-sm text-gray-500">Your text looks grammatically correct</p>
              <p className="text-xs text-gray-400 mt-2">Ihr Text ist grammatikalisch korrekt</p>
              {lastGrammarCheck.score !== undefined && (
                <div className="mt-4 px-4 py-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-semibold text-green-700">
                    Quality Score: {lastGrammarCheck.score}/100
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Check Performed Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter text and click "Check Grammar" to see suggestions
              </p>
            </div>
          )}

          {/* Corrected Text Preview */}
          {lastGrammarCheck && lastGrammarCheck.suggestions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Corrected Text / Korrigierter Text
              </h4>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">
                  {lastGrammarCheck.correctedText}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lastGrammarCheck.correctedText);
                }}
                className="mt-3 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Corrected Text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Tips for Medical Documentation / Tipps für medizinische Dokumentation
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use formal language (Sie, not du) in patient documentation</li>
          <li>• Be precise with medical terminology (Herzinfarkt vs. Herzanfall)</li>
          <li>• Use past tense for patient history (Patient hatte vs. Patient hat)</li>
          <li>• Avoid ambiguous pronouns - repeat the noun if necessary</li>
          <li>• Check subject-verb agreement carefully in German</li>
        </ul>
      </div>
    </div>
  );
}