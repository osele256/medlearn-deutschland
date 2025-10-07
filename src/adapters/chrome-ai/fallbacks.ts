// src/adapters/chrome-ai/fallbacks.ts
// Cached content for offline/unavailable scenarios

import { Scenario, ScenarioParams, DialogueResponse } from './types';

const CACHED_SCENARIOS: Record<string, Scenario[]> = {
  cardiology: [
    {
      id: "cached-cardio-1",
      specialty: "cardiology",
      difficulty: "beginner",
      title: "Chest Pain Evaluation",
      description:
        "A 55-year-old male presents with central chest pain that started 2 hours ago. The pain is described as pressure-like and radiates to the left arm.",
      chiefComplaint: "Chest pain for 2 hours",
      vitalSigns: {
        bp: "150/95",
        hr: 92,
        rr: 18,
        temp: 37.1,
        spo2: 96,
      },
      createdAt: Date.now(),
    },
    {
      id: "cached-cardio-2",
      specialty: "cardiology",
      difficulty: "intermediate",
      title: "Atrial Fibrillation Management",
      description:
        "A 68-year-old female with known atrial fibrillation presents with palpitations and dizziness for the past 6 hours.",
      chiefComplaint: "Palpitations and dizziness",
      vitalSigns: {
        bp: "110/70",
        hr: 145,
        rr: 20,
        temp: 36.8,
        spo2: 94,
      },
      createdAt: Date.now(),
    },
  ],
  pediatrics: [
    {
      id: "cached-peds-1",
      specialty: "pediatrics",
      difficulty: "beginner",
      title: "Fever in a Toddler",
      description:
        "A 2-year-old boy is brought in by his mother with a fever of 39.5°C for the past day. The child is irritable and pulling at his right ear.",
      chiefComplaint: "Fever and ear pain",
      vitalSigns: {
        bp: "90/60",
        hr: 130,
        rr: 28,
        temp: 39.5,
        spo2: 98,
      },
      createdAt: Date.now(),
    },
  ],
  emergency: [
    {
      id: "cached-emerg-1",
      specialty: "emergency",
      difficulty: "intermediate",
      title: "Motor Vehicle Collision",
      description:
        "A 32-year-old male arrives via ambulance following a motor vehicle collision. Patient was the driver, restrained, airbag deployed. Complains of neck and chest pain.",
      chiefComplaint: "Trauma from MVA",
      vitalSigns: {
        bp: "100/65",
        hr: 110,
        rr: 24,
        temp: 36.5,
        spo2: 95,
      },
      createdAt: Date.now(),
    },
  ],
  surgery: [
    {
      id: "cached-surg-1",
      specialty: "surgery",
      difficulty: "beginner",
      title: "Acute Appendicitis",
      description:
        "A 24-year-old male presents with right lower quadrant abdominal pain that started 12 hours ago. Pain initially periumbilical, now localized to RLQ.",
      chiefComplaint: "Abdominal pain",
      vitalSigns: {
        bp: "125/80",
        hr: 95,
        rr: 18,
        temp: 38.2,
        spo2: 99,
      },
      createdAt: Date.now(),
    },
  ],
  psychiatry: [
    {
      id: "cached-psych-1",
      specialty: "psychiatry",
      difficulty: "beginner",
      title: "Major Depressive Episode",
      description:
        "A 28-year-old female presents with persistent low mood, loss of interest in activities, and difficulty sleeping for the past 3 weeks.",
      chiefComplaint: "Feeling depressed",
      vitalSigns: {
        bp: "115/75",
        hr: 72,
        rr: 14,
        temp: 36.9,
        spo2: 99,
      },
      createdAt: Date.now(),
    },
  ],
  neurology: [
    {
      id: "cached-neuro-1",
      specialty: "neurology",
      difficulty: "intermediate",
      title: "Acute Stroke Evaluation",
      description:
        "A 72-year-old male brought in by family after sudden onset of right-sided weakness and slurred speech 1 hour ago.",
      chiefComplaint: "Sudden weakness and speech difficulty",
      vitalSigns: {
        bp: "180/100",
        hr: 88,
        rr: 16,
        temp: 37.0,
        spo2: 97,
      },
      createdAt: Date.now(),
    },
  ],
  nursing: [
    {
      id: "cached-nursing-1",
      specialty: "nursing",
      difficulty: "beginner",
      title: "Wound Care Assessment",
      description:
        "An 80-year-old patient has a pressure ulcer on the sacrum (Stage II). The wound is 3cm in diameter with slight drainage. Patient is bed-bound but cooperative.",
      chiefComplaint: "Pressure ulcer care",
      vitalSigns: {
        bp: "130/85",
        hr: 78,
        rr: 16,
        temp: 36.8,
        spo2: 96,
      },
      createdAt: Date.now(),
    },
    {
      id: "cached-nursing-2",
      specialty: "nursing",
      difficulty: "intermediate",
      title: "Medication Administration",
      description:
        "Patient receiving multiple medications via NG tube. Needs assistance with daily wound dressing change and mobility. Family requesting education on home care.",
      chiefComplaint: "Complex medication management",
      vitalSigns: {
        bp: "140/90",
        hr: 82,
        rr: 18,
        temp: 37.2,
        spo2: 94,
      },
      createdAt: Date.now(),
    },
  ],
  geriatrics: [
    {
      id: "cached-geri-1",
      specialty: "geriatrics",
      difficulty: "beginner",
      title: "Fall Risk Assessment",
      description:
        "An 85-year-old female with recent fall at home. Patient lives alone, uses walker. Daughter concerned about safety. Patient has mild cognitive impairment.",
      chiefComplaint: "Fall prevention and safety assessment",
      vitalSigns: {
        bp: "145/88",
        hr: 72,
        rr: 16,
        temp: 36.5,
        spo2: 97,
      },
      createdAt: Date.now(),
    },
    {
      id: "cached-geri-2",
      specialty: "geriatrics",
      difficulty: "intermediate",
      title: "Polypharmacy Management",
      description:
        "A 78-year-old male taking 12 different medications. Reports confusion about medication schedule. Recent hospitalization for dizziness. Lives with spouse.",
      chiefComplaint: "Medication review and simplification",
      vitalSigns: {
        bp: "138/82",
        hr: 68,
        rr: 14,
        temp: 36.9,
        spo2: 98,
      },
      createdAt: Date.now(),
    },
  ],
  nursing: [
    {
      id: "cached-nursing-1",
      specialty: "nursing",
      difficulty: "beginner",
      title: "Wound Care Assessment",
      description:
        "An 80-year-old patient has a pressure ulcer on the sacrum (Stage II). The wound is 3cm in diameter with slight drainage. Patient is bed-bound but cooperative.",
      chiefComplaint: "Pressure ulcer care",
      vitalSigns: {
        bp: "130/85",
        hr: 78,
        rr: 16,
        temp: 36.8,
        spo2: 96,
      },
      createdAt: Date.now(),
    },
    {
      id: "cached-nursing-2",
      specialty: "nursing",
      difficulty: "intermediate",
      title: "Medication Administration",
      description:
        "Patient receiving multiple medications via NG tube. Needs assistance with daily wound dressing change and mobility. Family requesting education on home care.",
      chiefComplaint: "Complex medication management",
      vitalSigns: {
        bp: "140/90",
        hr: 82,
        rr: 18,
        temp: 37.2,
        spo2: 94,
      },
      createdAt: Date.now(),
    },
  ],
  geriatrics: [
    {
      id: "cached-geri-1",
      specialty: "geriatrics",
      difficulty: "beginner",
      title: "Fall Risk Assessment",
      description:
        "An 85-year-old female with recent fall at home. Patient lives alone, uses walker. Daughter concerned about safety. Patient has mild cognitive impairment.",
      chiefComplaint: "Fall prevention and safety assessment",
      vitalSigns: {
        bp: "145/88",
        hr: 72,
        rr: 16,
        temp: 36.5,
        spo2: 97,
      },
      createdAt: Date.now(),
    },
    {
      id: "cached-geri-2",
      specialty: "geriatrics",
      difficulty: "intermediate",
      title: "Polypharmacy Management",
      description:
        "A 78-year-old male taking 12 different medications. Reports confusion about medication schedule. Recent hospitalization for dizziness. Lives with spouse.",
      chiefComplaint: "Medication review and simplification",
      vitalSigns: {
        bp: "138/82",
        hr: 68,
        rr: 14,
        temp: 36.9,
        spo2: 98,
      },
      createdAt: Date.now(),
    },
  ],
};

const CACHED_DIALOGUE_RESPONSES: DialogueResponse[] = [
  {
    message: "The pain started suddenly while I was watching TV. It feels like pressure on my chest.",
    emotion: "anxious",
    suggestions: [
      "Does the pain radiate anywhere?",
      "Have you had similar episodes before?",
      "Are you taking any medications?"
    ],
  },
  {
    message: "Yes, it goes down my left arm. I'm really worried it's my heart.",
    emotion: "anxious",
  },
  {
    message: "I have diabetes and high blood pressure. I take metformin and lisinopril.",
    emotion: "calm",
  },
  {
    message: "The pain is about 7 out of 10. It's worse when I take a deep breath.",
    emotion: "uncomfortable",
  },
  {
    message: "No, I've never had anything like this before. Should I be worried?",
    emotion: "anxious",
  },
];

export function getCachedScenario(params: ScenarioParams): Scenario {
  const scenarios = CACHED_SCENARIOS[params.specialty] || [];
  
  // Try to find matching difficulty
  const match = scenarios.find(s => s.difficulty === params.difficulty);
  if (match) return { ...match, id: `cached-${Date.now()}` };
  
  // Fallback to any scenario in specialty
  if (scenarios.length > 0) {
    return { ...scenarios[0], id: `cached-${Date.now()}` };
  }
  
  // Ultimate fallback
  return {
    id: `fallback-${Date.now()}`,
    specialty: params.specialty,
    difficulty: params.difficulty,
    title: 'Sample Medical Scenario',
    description: `This is a sample ${params.difficulty} level ${params.specialty} scenario. The Chrome AI API is currently unavailable, so this cached content is being displayed instead.`,
    chiefComplaint: 'Sample chief complaint',
    vitalSigns: {
      bp: '120/80',
      hr: 75,
      rr: 16,
      temp: 37.0,
      spo2: 98,
    },
    createdAt: Date.now(),
  };
}

export function getCachedDialogueResponse(): DialogueResponse {
  const randomIndex = Math.floor(Math.random() * CACHED_DIALOGUE_RESPONSES.length);
  return CACHED_DIALOGUE_RESPONSES[randomIndex];
}

export function getAllCachedScenarios(): Scenario[] {
  return Object.values(CACHED_SCENARIOS).flat();
}