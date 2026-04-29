# Penly — AI-Powered Writing Assistant

## What to Build
A single-page, full-stack grammar checker and writing assistant web app. Clean and professional like Notion.
Features include grammar checking, AI-powered explanations, tone detection, paraphrasing, and AI-generated content detection.
No auth, no database, no multiple pages.

---

## Features

### Core Features
- ✅ **Grammar & Spelling Check** — Real-time error detection using LanguageTool
- ✅ **Error Categorization** — Spelling, Grammar, Punctuation, Style filters
- ✅ **AI Explanations** — Why each error matters (powered by Groq)
- ✅ **Quick Fixes** — One-click suggestions for each error
- ✅ **Tone Analysis** — Detects writing tone (formal, casual, confident, etc.)
- ✅ **Writing DNA** — Vocabulary richness, sentence length, passive voice %, reading level

### Advanced Features
- ✅ **Paraphrase** — AI-powered text rephrasing with undo support
- ✅ **AI Content Detection** — Detects if text is AI-generated with confidence scores
- ✅ **Tools Dropdown Menu** — Organized UI for Paraphrase & Check AI features
- ✅ **Undo for Paraphrase** — One-level undo for paraphrase changes
- ✅ **CEFR Reading Level** — Maps reading complexity to international standards

---

## Tech Stack
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Dialog, Card, Button, Progress, DropdownMenu)
- LanguageTool free API (no key needed)
- Groq API (`GROQ_API_KEY` in `.env.local`, server-side only)

---

## Project Structure
```
penly/
├── app/
│   ├── api/
│   │   ├── grammar/route.ts          # Grammar check proxy
│   │   ├── feedback/route.ts         # AI explanations
│   │   ├── tone/route.ts             # Tone analysis
│   │   ├── paraphrase/route.ts       # Text paraphrasing
│   │   └── ai-detect/route.ts        # AI content detection
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── editor/
│   │   ├── editor.tsx
│   │   └── helper.tsx
│   ├── ui/                           # shadcn components
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── progress.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   ├── FeedbackPanel.tsx
│   ├── WritingDNA.tsx
│   ├── WritingDNABottomSheet.tsx
│   ├── ToneBar.tsx
│   ├── Toolbar.tsx
│   ├── ToolsMenu.tsx                 # Dropdown for Paraphrase & AI Check
│   ├── ParaphraseDialog.tsx          # Paraphrase UI (shadcn Dialog)
│   ├── AIDetectDialog.tsx            # AI detection UI (shadcn Dialog)
│   └── FloatingActionButton.tsx
├── hooks/
│   ├── useGrammarCheck.ts
│   ├── useFeedback.ts
│   ├── useParaphrase.ts              # Paraphrase hook
│   ├── useAiDetect.ts                # AI detection hook
│   ├── useToneAnalysis.ts
│   ├── useWritingDNA.ts
│   └── useMediaQuery.ts
├── lib/
│   └── utils.ts
├── types/
│   └── match.ts
└── .env.local
```

---

## Types (`types/match.ts`)
```ts
export type Replacement = { value: string };

export type Rule = {
  id: string;
  description: string;
  issueType: string;
};

export type Match = {
  offset: number;
  length: number;
  message: string;
  shortMessage?: string;
  replacements: Replacement[];
  rule: Rule;
};

export type Category = "spelling" | "grammar" | "punctuation" | "style" | "other";

export type Tone =
  | "formal" | "casual" | "confident"
  | "uncertain" | "positive" | "negative" | "neutral";

export type ToneResult = {
  primary: Tone;
  secondary: Tone | null;
  summary: string;
};
```

---

## API Routes

### `app/api/grammar/route.ts`
- POST — receives `{ text: string }`
- Proxies to `https://api.languagetool.org/v2/check`
- Filters out `UNKNOWN_TOKEN` errors (prevents flagging names as mistakes)
- Returns: `{ matches: Match[] }`

### `app/api/feedback/route.ts`
- POST — receives `{ message: string, ruleDescription: string, errorText: string }`
- Calls Groq (`llama-3.3-70b-versatile`)
- Returns: `{ explanation: string }`

### `app/api/tone/route.ts`
- POST — receives `{ text: string }`
- Calls Groq (`llama-3.3-70b-versatile`)
- Returns: `{ primary: Tone, secondary: Tone | null, summary: string }`

### `app/api/paraphrase/route.ts`
- POST — receives `{ text: string }`
- Calls Groq (`llama-3.3-70b-versatile`)
- Generates alternative wording for any text
- Returns: `{ paraphrase: string }`
- Minimum 10 characters required

### `app/api/ai-detect/route.ts`
- POST — receives `{ text: string }`
- Calls Groq (`llama-3.3-70b-versatile`) to analyze if text is AI-generated
- Analyzes: formal tone, repetitive phrasing, perfect grammar, generic language
- Returns:
```ts
{
  isAiGenerated: boolean;
  confidence: number;      // 0-100
  analysis: string;        // Brief explanation
}
```

---

## Hooks

### `useGrammarCheck.ts`
- Accepts `text: string`
- Debounces 500ms internally
- Uses `AbortController` to cancel previous requests
- Calls `POST /api/grammar`
- Returns `{ result: Match[] | null, isChecking: boolean }`

### `useFeedback.ts`
- Accepts `match: Match | null` and `errorText: string`
- Calls `POST /api/feedback` when match is selected
- Returns `{ explanation: string | null, isLoading: boolean }`

### `useParaphrase.ts`
- Accepts `text: string`
- Exposes `fetchParaphrase()` callback for on-demand paraphrasing
- Minimum 10 characters to trigger
- Returns `{ paraphrase: string | null, isParaphrasing: boolean, fetchParaphrase: () => Promise<void> }`

### `useAiDetect.ts`
- Accepts `text: string`
- Exposes `fetchAiDetect()` callback for on-demand AI detection
- Minimum 10 characters to trigger
- Returns `{ isAiGenerated: boolean | null, confidence: number | null, analysis: string | null, isDetecting: boolean, fetchAiDetect: () => Promise<void> }`

### `useToneAnalysis.ts`
- Accepts `text: string`
- Debounces 1500ms
- Only fires when word count is 30+
- Calls `POST /api/tone`
- Returns `{ tone: ToneResult | null, isAnalyzing: boolean }`

### `useWritingDNA.ts`
- Accepts `text: string`
- Debounces 300ms — all calculations are client-side
- Only computes when word count >= 30
- Returns vocabulary richness, sentence length, passive voice %, grade level

### `useMediaQuery.ts`
- Media query hook for responsive design
- Returns `boolean` based on media query match

---

## Components

### `Editor.tsx` (`components/editor/editor.tsx`)
- `"use client"` — two absolutely stacked layers inside a relative container
- Layer 1 (bottom): HighlightLayer with `pointer-events: none`
- Layer 2 (top): Textarea with `text-transparent caret-foreground bg-transparent`
- **Scroll sync**: Textarea `onScroll` handler syncs to highlight layer
- Manages state for:
  - Grammar errors and selected match
  - Paraphrase history (for undo)
  - Dialog visibility (Paraphrase & AI Detect)

### `Toolbar.tsx`
- Status indicator: pulsing dot (checking) | green dot (clean) | red dot + count (errors)
- Actions: Undo (only for paraphrase), Tools (dropdown), Clear, Copy
- Tools dropdown contains: Paraphrase, Check AI Content
- Mobile: compact header | Desktop: full button bar

### `ToolsMenu.tsx`
- Dropdown menu using shadcn `DropdownMenu`
- Single button with `⋯` icon
- Menu items: Paraphrase, Check AI Content
- Only enabled when text is present
- Automatically closes after selection

### `ParaphraseDialog.tsx`
- Modal dialog using shadcn `Dialog` component
- Displays paraphrased text with loading state
- Apply & Cancel buttons
- Undo button appears in Toolbar after applying

### `AIDetectDialog.tsx`
- Modal dialog using shadcn `Dialog` component
- Shows detection result with status badge (✅ Human / ⚠️ AI)
- Confidence score with shadcn `Progress` bar (colored red/amber/green)
- Brief analysis explanation
- Clean, professional layout

### `FeedbackPanel.tsx`
- Filter bar: All · Spelling · Grammar · Punctuation · Style
- Error list: clickable buttons with error word and message
- Selected match shows:
  - Rule description & full message
  - Up to 5 suggestion buttons
  - AI explanation
- Clean categorization and filtering

### `WritingDNA.tsx` & `WritingDNABottomSheet.tsx`
- Shows: Vocabulary richness, sentence length, passive voice %, CEFR reading level
- Uses shadcn `Progress` component for metrics
- Mobile bottom sheet | Desktop sidebar

### `ToneBar.tsx`
- Displays primary & secondary tone with badges
- One-sentence tone summary
- Only shows when word count >= 30

---

## Dialogs & UI Components

### Using shadcn Components
- **Dialog**: `ParaphraseDialog`, `AIDetectDialog`
- **Progress**: Confidence bar in `AIDetectDialog`
- **DropdownMenu**: Tools menu in `Toolbar`
- **Button**: All interactive elements
- **Card**: (Available for future layouts)

All dialogs use shadcn's `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` components for consistency and accessibility.

---

## Hard Rules
1. **No API keys in the browser** — Groq key only used in `/api/*` route handlers
2. **No setState synchronously in useEffect** — always wrap in `setTimeout(..., 0)` or call inside `.then()`
3. **Always use AbortController** for grammar check — silently swallow AbortError
4. **Editor layers must be pixel-perfect** — identical font, padding, line-height
5. **Writing DNA is 100% client-side** — no API calls, pure JS math
6. **All Groq JSON responses** must be parsed inside try/catch
7. **No fixed widths on editor** — always `w-full`
8. **Mobile-first** — base Tailwind classes for mobile, `lg:` for desktop
9. **No `overflow: hidden` on page body** — breaks sticky toolbar
10. **No `any` types** — TypeScript strict mode throughout
11. **Scroll sync required** — textarea `onScroll` handler syncs overlay layers
12. **Filter UNKNOWN_TOKEN from grammar results** — prevents flagging names as errors
13. **Undo only for paraphrase** — no undo for direct error fixes
14. **Use shadcn components** — Dialog, Progress, DropdownMenu for consistency

---

## Environment Setup

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
