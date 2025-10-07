// src/features/scenarios/ScenarioGenerator.tsx
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MedicalSpecialty, DifficultyLevel } from '@/adapters/chrome-ai/types';

const SPECIALTIES: { value: MedicalSpecialty; label: string }[] = [
  { value: 'cardiology', label: 'Cardiology / Kardiologie' },
  { value: 'pediatrics', label: 'Pediatrics / Pädiatrie' },
  { value: 'emergency', label: 'Emergency / Notfallmedizin' },
  { value: 'surgery', label: 'Surgery / Chirurgie' },
  { value: 'psychiatry', label: 'Psychiatry / Psychiatrie' },
  { value: 'neurology', label: 'Neurology / Neurologie' },
  { value: 'nursing', label: 'Nursing Care / Krankenpflege' },
  { value: 'geriatrics', label: 'Geriatric Care / Altenpflege' },
];

const DIFFICULTIES: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Basic cases for practice' },
  { value: 'intermediate', label: 'Intermediate', description: 'Moderate complexity' },
  { value: 'advanced', label: 'Advanced', description: 'Complex clinical scenarios' },
];

export function ScenarioGenerator({ onStartDialogue }: ScenarioGeneratorProps = {}) {
  const [specialty, setSpecialty] = useState<MedicalSpecialty>('cardiology');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');

  const {
    currentScenario,
    isGeneratingScenario,
    scenarioError,
    generateScenario,
    clearError,
    startDialogue,
    capabilities,
  } = useStore();

  const handleGenerate = () => {
    generateScenario({ specialty, difficulty });
  };

  const handleStartDialogue = () => {
    if (currentScenario) {
      startDialogue(currentScenario);
      onStartDialogue?.();
    }
  };

  const isOffline = capabilities?.prompt === 'unavailable';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Clinical Scenario Generator</h2>
        <p className="mt-2 text-gray-600">
          Generate realistic medical cases to practice clinical reasoning and German medical terminology
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
              <h3 className="text-sm font-medium text-amber-800">Chrome AI Offline</h3>
              <p className="mt-1 text-sm text-amber-700">
                Showing cached scenarios. Enable Chrome AI flags for unlimited generation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Medical Specialty
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value as MedicalSpecialty)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isGeneratingScenario}
          >
            {SPECIALTIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Difficulty Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                disabled={isGeneratingScenario}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  difficulty === d.value
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                } ${isGeneratingScenario ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="font-semibold text-gray-900">{d.label}</div>
                <div className="text-sm text-gray-500 mt-1">{d.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGeneratingScenario}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isGeneratingScenario ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Scenario...
            </span>
          ) : (
            'Generate New Scenario'
          )}
        </button>
      </div>

      {/* Error Display */}
      {scenarioError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{scenarioError}</p>
            </div>
            <button
              onClick={() => clearError('scenario')}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Scenario Display */}
      {currentScenario && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">{currentScenario.title}</h3>
            <div className="mt-2 flex items-center gap-4 text-sm text-blue-100">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                {SPECIALTIES.find(s => s.value === currentScenario.specialty)?.label}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                {currentScenario.difficulty}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Chief Complaint / Hauptbeschwerde
              </h4>
              <p className="text-gray-900">{currentScenario.chiefComplaint}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Clinical Presentation / Klinisches Bild
              </h4>
              <p className="text-gray-900 leading-relaxed">{currentScenario.description}</p>
            </div>

            {currentScenario.vitalSigns && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Vital Signs / Vitalzeichen
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {currentScenario.vitalSigns.bp && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">BP / RR</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentScenario.vitalSigns.bp}
                      </div>
                    </div>
                  )}
                  {currentScenario.vitalSigns.hr && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">HR / HF</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentScenario.vitalSigns.hr} bpm
                      </div>
                    </div>
                  )}
                  {currentScenario.vitalSigns.rr && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">RR / AF</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentScenario.vitalSigns.rr} /min
                      </div>
                    </div>
                  )}
                  {currentScenario.vitalSigns.temp && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Temp / Temperatur</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentScenario.vitalSigns.temp}°C
                      </div>
                    </div>
                  )}
                  {currentScenario.vitalSigns.spo2 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">SpO₂</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentScenario.vitalSigns.spo2}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleStartDialogue}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Start Patient Dialogue / Patientengespräch beginnen →
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentScenario && !isGeneratingScenario && (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No scenario generated</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a specialty and difficulty, then click "Generate New Scenario"
          </p>
        </div>
      )}
    </div>
  );
}