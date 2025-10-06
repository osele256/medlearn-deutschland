// src/features/translator/TermTranslator.tsx
import { useState } from 'react';
import { useStore } from '@/lib/store';

type LanguageCode = 'en' | 'de';

interface LanguagePair {
  source: LanguageCode;
  target: LanguageCode;
}

const COMMON_MEDICAL_TERMS = {
  en: [
    'heart attack', 'chest pain', 'shortness of breath', 'fever', 'headache',
    'blood pressure', 'diabetes', 'infection', 'surgery', 'medication',
    'diagnosis', 'treatment', 'symptoms', 'prescription', 'emergency'
  ],
  de: [
    'Herzinfarkt', 'Brustschmerzen', 'Atemnot', 'Fieber', 'Kopfschmerzen',
    'Blutdruck', 'Diabetes', 'Infektion', 'Operation', 'Medikament',
    'Diagnose', 'Behandlung', 'Symptome', 'Rezept', 'Notfall'
  ]
};

export function TermTranslator() {
  const [term, setTerm] = useState('');
  const [languages, setLanguages] = useState<LanguagePair>({
    source: 'en',
    target: 'de'
  });

  const {
    translations,
    isTranslating,
    translationError,
    translateTerm,
    clearError,
    capabilities,
  } = useStore();

  const handleTranslate = () => {
    if (!term.trim()) return;

    translateTerm({
      term: term.trim(),
      sourceLanguage: languages.source,
      targetLanguage: languages.target,
    });
  };

  const handleSwapLanguages = () => {
    setLanguages({
      source: languages.target,
      target: languages.source,
    });
  };

  const handleQuickSelect = (selectedTerm: string) => {
    setTerm(selectedTerm);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isOffline = capabilities?.translator === 'unavailable';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Medical Term Translator</h2>
        <p className="mt-2 text-gray-600">
          Translate medical terminology between English and German
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Übersetzen Sie medizinische Begriffe zwischen Englisch und Deutsch
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
              <h3 className="text-sm font-medium text-amber-800">Translation API Offline</h3>
              <p className="mt-1 text-sm text-amber-700">
                Chrome Translation API is not available. Enable it in chrome://flags
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Translation Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Language Selector */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              From / Von
            </label>
            <select
              value={languages.source}
              onChange={(e) => setLanguages({ ...languages, source: e.target.value as LanguageCode })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating}
            >
              <option value="en">English</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>

          <button
            onClick={handleSwapLanguages}
            disabled={isTranslating}
            className="mt-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            title="Swap languages / Sprachen tauschen"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To / Nach
            </label>
            <select
              value={languages.target}
              onChange={(e) => setLanguages({ ...languages, target: e.target.value as LanguageCode })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating}
            >
              <option value="en">English</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>
        </div>

        {/* Term Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Medical Term / Medizinischer Begriff
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
              placeholder={languages.source === 'en' ? 'Enter medical term...' : 'Medizinischen Begriff eingeben...'}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTranslating || isOffline}
            />
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !term.trim() || isOffline}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isTranslating ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Translate'
              )}
            </button>
          </div>
        </div>

        {/* Quick Select Terms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Common Terms / Häufige Begriffe
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_MEDICAL_TERMS[languages.source].map((quickTerm) => (
              <button
                key={quickTerm}
                onClick={() => handleQuickSelect(quickTerm)}
                disabled={isTranslating || isOffline}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-full transition-colors border border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickTerm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {translationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{translationError}</p>
            </div>
            <button
              onClick={() => clearError('translation')}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Translation History */}
      {translations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Translation History / Übersetzungsverlauf
          </h3>
          <div className="space-y-3">
            {translations.map((translation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{translation.original}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span className="font-medium text-blue-600">{translation.translated}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {translation.sourceLanguage.toUpperCase()} → {translation.targetLanguage.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(translation.translated)}
                  className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {translations.length === 0 && !translationError && (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Translations Yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a medical term above or select from common terms
          </p>
        </div>
      )}
    </div>
  );
}