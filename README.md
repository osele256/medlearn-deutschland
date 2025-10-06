# MedLearn für Deutschland 🇩🇪

AI-powered medical learning platform for healthcare workers moving to Germany.

## Features

- 🏥 **Scenario Generator** - Realistic medical cases
- 💬 **Dialogue Simulator** - Practice patient conversations  
- 🌍 **Medical Translator** - English ↔ German terminology
- ✍️ **Grammar Checker** - Proofread medical documentation

## Requirements

- Chrome Canary browser
- Enable Chrome AI flags (see setup guide)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Chrome AI Setup

1. Install Chrome Canary
2. Navigate to `chrome://flags`
3. Enable these flags:
   - `#optimization-guide-on-device-model`
   - `#prompt-api-for-gemini-nano`
   - `#translation-api`
   - `#text-safety-classifier`
4. Restart Chrome
5. Download Gemini Nano model (~1.5GB)

## Tech Stack

- React 18 + TypeScript
- Vite
- Zustand (state)
- Tailwind CSS
- Chrome AI APIs

## License

MIT
