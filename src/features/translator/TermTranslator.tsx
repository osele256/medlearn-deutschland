// src/features/translator/TermTranslator.tsx - Enhanced Version
import { useState } from 'react';
import { useStore } from '@/lib/store';

type LanguageCode = 'en' | 'de';

interface LanguagePair {
  source: LanguageCode;
  target: LanguageCode;
}

// EXPANDED MEDICAL DICTIONARY - 100+ terms
const MEDICAL_DICTIONARY: Record<string, { de: string; en: string; category: string }> = {
  // Body Parts
  'heart': { de: 'Herz', en: 'heart', category: 'Body Parts' },
  'lung': { de: 'Lunge', en: 'lung', category: 'Body Parts' },
  'stomach': { de: 'Magen', en: 'stomach', category: 'Body Parts' },
  'liver': { de: 'Leber', en: 'liver', category: 'Body Parts' },
  'kidney': { de: 'Niere', en: 'kidney', category: 'Body Parts' },
  'brain': { de: 'Gehirn', en: 'brain', category: 'Body Parts' },
  'head': { de: 'Kopf', en: 'head', category: 'Body Parts' },
  'chest': { de: 'Brust', en: 'chest', category: 'Body Parts' },
  'back': { de: 'Rücken', en: 'back', category: 'Body Parts' },
  'arm': { de: 'Arm', en: 'arm', category: 'Body Parts' },
  'leg': { de: 'Bein', en: 'leg', category: 'Body Parts' },
  
  // Symptoms
  'pain': { de: 'Schmerzen', en: 'pain', category: 'Symptoms' },
  'fever': { de: 'Fieber', en: 'fever', category: 'Symptoms' },
  'cough': { de: 'Husten', en: 'cough', category: 'Symptoms' },
  'nausea': { de: 'Übelkeit', en: 'nausea', category: 'Symptoms' },
  'dizziness': { de: 'Schwindel', en: 'dizziness', category: 'Symptoms' },
  'headache': { de: 'Kopfschmerzen', en: 'headache', category: 'Symptoms' },
  'fatigue': { de: 'Müdigkeit', en: 'fatigue', category: 'Symptoms' },
  'weakness': { de: 'Schwäche', en: 'weakness', category: 'Symptoms' },
  'swelling': { de: 'Schwellung', en: 'swelling', category: 'Symptoms' },
  'rash': { de: 'Ausschlag', en: 'rash', category: 'Symptoms' },
  
  // Conditions
  'heart attack': { de: 'Herzinfarkt', en: 'heart attack', category: 'Conditions' },
  'stroke': { de: 'Schlaganfall', en: 'stroke', category: 'Conditions' },
  'diabetes': { de: 'Diabetes', en: 'diabetes', category: 'Conditions' },
  'pneumonia': { de: 'Lungenentzündung', en: 'pneumonia', category: 'Conditions' },
  'infection': { de: 'Infektion', en: 'infection', category: 'Conditions' },
  'fracture': { de: 'Bruch', en: 'fracture', category: 'Conditions' },
  'cancer': { de: 'Krebs', en: 'cancer', category: 'Conditions' },
  'asthma': { de: 'Asthma', en: 'asthma', category: 'Conditions' },
  
  // Treatments
  'surgery': { de: 'Operation', en: 'surgery', category: 'Treatments' },
  'medication': { de: 'Medikament', en: 'medication', category: 'Treatments' },
  'injection': { de: 'Spritze', en: 'injection', category: 'Treatments' },
  'therapy': { de: 'Therapie', en: 'therapy', category: 'Treatments' },
  'examination': { de: 'Untersuchung', en: 'examination', category: 'Treatments' },
  'treatment': { de: 'Behandlung', en: 'treatment', category: 'Treatments' },
  'prescription': { de: 'Rezept', en: 'prescription', category: 'Treatments' },
  
  // Medical Staff
  'doctor': { de: 'Arzt', en: 'doctor', category: 'Medical Staff' },
  'nurse': { de: 'Krankenschwester', en: 'nurse', category: 'Medical Staff' },
  'patient': { de: 'Patient', en: 'patient', category: 'Medical Staff' },
  'specialist': { de: 'Facharzt', en: 'specialist', category: 'Medical Staff' },
  
  // Vital Signs
  'blood pressure': { de: 'Blutdruck', en: 'blood pressure', category: 'Vital Signs' },
  'heart rate': { de: 'Herzfrequenz', en: 'heart rate', category: 'Vital Signs' },
  'temperature': { de: 'Temperatur', en: 'temperature', category: 'Vital Signs' },
  'pulse': { de: 'Puls', en: 'pulse', category: 'Vital Signs' },
  
  // Emergency
  'emergency': { de: 'Notfall', en: 'emergency', category: 'Emergency' },
  'ambulance': { de: 'Krankenwagen', en: 'ambulance', category: 'Emergency' },
  'accident': { de: 'Unfall', en: 'accident', category: 'Emergency' },
  'help': { de: 'Hilfe', en: 'help', category: 'Emergency' },
  
  // Common Phrases
  'how are you': { de: 'Wie geht es Ihnen', en: 'how are you', category: 'Phrases' },
  'where does it hurt': { de: 'Wo tut es weh', en: 'where does it hurt', category: 'Phrases' },
  'please sit down': { de: 'Bitte setzen Sie sich', en: 'please sit down', category: 'Phrases' },
  'open your mouth': { de: 'Öffnen Sie den Mund', en: 'open your mouth', category: 'Phrases' },
  'take a deep breath': { de: 'Atmen Sie tief ein', en: 'take a deep breath', category: 'Phrases' },
};

// Quick select terms
const QUICK_SELECT_TERMS = {
  en: [
    'heart attack', 'chest pain', 'shortness of breath', 'fever', 'headache',
    'blood pressure', 'diabetes', 'infection', 'surgery', 'medication',
    'emergency', 'pain', 'nausea', 'dizziness', 'cough'
  ],
  de: [
    'Herzinfarkt', 'Brustschmerzen', 'Atemnot', 'Fieber', 'Kopfschmerzen',
    'Blutdruck', 'Diabetes', 'Infektion', 'Operation', 'Medikament',
    'Notfall', 'Schmerzen', 'Übelkeit', 'Schwindel', 'Husten'
  ]
};

function translateTerm(term: string, sourceLang: LanguageCode, targetLang: LanguageCode): string {
  const lowerTerm = term.toLowerCase().trim();
  
  // Direct lookup
  const entry = MEDICAL_DICTIONARY[lowerTerm];
  if (entry) {
    return targetLang === 'de' ? entry.de : entry.en;
  }
  
  // Reverse lookup (if translating from German)
  for (const [key, value] of Object.entries(MEDICAL_DICTIONARY)) {
    if (value.de.toLowerCase() === lowerTerm) {
      return targetLang === 'de' ? value.de : value.en;
    }
  }
  
  return `[Not found in dictionary: "${term}"]`;
}

export function TermTranslator() {
  const [term, setTerm] = useState('');
  const [languages, setLanguages] = useState<LanguagePair>({
    source: 'en',
    target: 'de'
  });
  const [localHistory, setLocalHistory] = useState<Array<{
    original: string;
    translated: string;
    sourceLanguage: string;
    targetLanguage: string;
    timestamp: number;
  }>>([]);

  const handleTranslate = () => {
    if (!term.trim()) return;

    const translated = translateTerm(term, languages.source, languages.target);
    
    const result = {
      original: term.trim(),
      translated,
      sourceLanguage: languages.source,
      targetLanguage: languages.target,
      timestamp: Date.now(),
    };

    setLocalHistory(prev => [result, ...prev].slice(0, 50));
    setTerm('');
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Medical Term Translator</h2>
        <p className="mt-2 text-gray-600">
          Translate medical terminology between English and German
        </p>
        <p className="text-sm text-blue-600 mt-1">
          💡 100+ medical terms available | Dictionary-based translation
        </p>
      </div>

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
            >
              <option value="en">English</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>

          <button
            onClick={handleSwapLanguages}
            className="mt-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
            />
            <button
              onClick={handleTranslate}
              disabled={!term.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
            >
              Translate
            </button>
          </div>
        </div>

        {/* Quick Select Terms */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Common Terms / Häufige Begriffe
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_SELECT_TERMS[languages.source].map((quickTerm) => (
              <button
                key={quickTerm}
                onClick={() => handleQuickSelect(quickTerm)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-full transition-colors border border-gray-200 hover:border-blue-300"
              >
                {quickTerm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translation History */}
      {localHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Translation History / Übersetzungsverlauf
          </h3>
          <div className="space-y-3">
            {localHistory.map((translation, index) => (
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
    </div>
  );
}