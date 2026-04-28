# Grammar Checker App — Full Build Prompt

## What to Build
A single-page, full-stack grammar checker web app. Clean and professional like Notion.
No auth, no database, no multiple pages.

---

## Tech Stack
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- LanguageTool free API (no key needed)
- Groq API (`GROQ_API_KEY` in `.env.local`, server-side only)

---

## Project Structure
```
grammar-checker/
├── app/
│   ├── api/
│   │   ├── grammar/route.ts
│   │   ├── feedback/route.ts
│   │   ├── tone/route.ts
│   │   └── rewrite/route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── editor/
│   │   ├── editor.tsx
│   │   └── helper.tsx
│   ├── ClarityLayer.tsx
│   ├── FeedbackPanel.tsx
│   ├── WritingDNA.tsx
│   ├── WritingDNABottomSheet.tsx
│   ├── ToneBar.tsx
│   ├── Toolbar.tsx
│   └── FloatingActionButton.tsx
├── hooks/
│   ├── useGrammarCheck.ts
│   ├── useFeedback.ts
│   ├── useRewrite.ts
│   ├── useToneAnalysis.ts
│   ├── useWritingDNA.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── clarity.ts
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
- Body: `application/x-www-form-urlencoded` with `{ text, language: "en-US" }`
- Returns the LanguageTool JSON response as-is
- Use AbortController to cancel duplicate requests

### `app/api/feedback/route.ts`
- POST — receives `{ message: string, ruleDescription: string, errorText: string }`
- Calls Groq (`llama3-8b-8192`) using `process.env.GROQ_API_KEY`
- System prompt: `"You are a helpful English writing assistant. Explain grammar errors in simple, friendly language in 2-3 sentences."`
- User prompt: `Explain this grammar error: "${message}" for the word/phrase "${errorText}". Rule: ${ruleDescription}`
- Returns `{ explanation: string }`

### `app/api/tone/route.ts`
- POST — receives `{ text: string }`
- Calls Groq (`llama3-8b-8192`) using `process.env.GROQ_API_KEY`
- System prompt: `"You are a writing tone analyzer. Respond ONLY with valid JSON — no markdown, no backticks, no explanation."`
- User prompt:
```
Analyze the tone and return ONLY this JSON shape:
{
  "primary": "one of: formal, casual, confident, uncertain, positive, negative, neutral",
  "secondary": "one of the remaining tones or null",
  "summary": "one sentence describing the tone in plain English"
}
Text: "${text}"
```
- Parse response safely with try/catch
- Returns `{ primary, secondary, summary }` or 400 on parse failure

### `app/api/rewrite/route.ts`
- POST — receives `{ text: string, errorOffset: number, errorLength: number, suggestion: string }`
- Calls Groq (`llama3-8b-8192`) using `process.env.GROQ_API_KEY`
- System prompt: `"You are a helpful writing assistant. Rewrite the sentence naturally and clearly, maintaining the original meaning and context. Respond only with the rewritten sentence."`
- User prompt: `Rewrite this sentence naturally: "${before}[${suggestion}]${after}"\n\nContext before: "${contextBefore}"\nContext after: "${contextAfter}"\n\nKeep it concise and clear."`
- Returns `{ rewritten: string }` — the full rewritten sentence using context

---

## Hooks

### `useGrammarCheck.ts`
- Accepts `text: string`
- Debounces 500ms internally
- Uses `AbortController` to cancel previous requests
- Calls `POST /api/grammar`
- Returns `{ result: Match[] | null, isChecking: boolean }`
- Only fires when debounced text is 3+ characters
- Wraps `setIsChecking(true)` in `setTimeout(..., 0)` — never synchronous in effect body
- Silently swallows `AbortError`

### `useFeedback.ts`
- Accepts `match: Match | null` and `errorText: string`
- Calls `POST /api/feedback` when match is selected
- Returns `{ explanation: string | null, isLoading: boolean }`

### `useToneAnalysis.ts`
- Accepts `text: string`
- Debounces 1500ms
- Only fires when word count is 30+
- Calls `POST /api/tone`
- Returns `{ tone: ToneResult | null, isAnalyzing: boolean }`

### `useRewrite.ts`
- Accepts `match: Match | null` and `text: string`
- Calls `POST /api/rewrite` when match is selected
- Passes error context to AI for natural rewriting
- Returns `{ rewritten: string | null, isRewriting: boolean }`

### `useWritingDNA.ts`
- Accepts `text: string`
- Debounces 300ms — all calculations are client-side, no API
- Only computes when word count >= 30
- Returns:
```ts
{
  vocabularyRichness: number;       // 0–100 (type-token ratio)
  avgSentenceLength: number;        // word count per sentence
  passivePercent: number;           // 0–100
  gradeLevel: number;               // Flesch-Kincaid grade
  gradLabel: string;                // old format (deprecated)
  personality: { label: string; description: string };
  isReady: boolean;                 // true when word count >= 30
}
```

### `useMediaQuery.ts`
```ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}
```

---

## `lib/clarity.ts` (all client-side, no API)

```ts
// Split text into sentences
export function splitIntoSentences(text: string): string[]

// Syllable count per word (for Flesch-Kincaid)
export function syllableCount(word: string): number

// Clarity score per sentence (0–100)
export function getSentenceClarity(sentence: string): number
// Factors: sentence length penalty, avg word length, passive voice, filler words

// Map clarity score to Tailwind color class
export function getClarityColor(score: number): string
// 80–100 → "border-emerald-400" | 60–79 → "border-amber-400" | 0–59 → "border-red-400"

// Map LanguageTool issueType to Category
export function getCategoryFromIssueType(issueType: string): Category
// "misspelling" → "spelling" | "grammar" → "grammar"
// "typographical" → "punctuation" | "style"/"register" → "style" | else → "other"

// Writing personality from combined metrics
export function getWritingPersonality(
  richness: number, avgLen: number, passive: number, grade: number
): { label: string; description: string }
// "Sharp Communicator" | "Academic Writer" | "Conversational"
// "Formal Reporter" | "Deep Thinker" | "Balanced Writer"

// Extract sentence at a given character offset
export function getSentenceAtOffset(
  text: string, offset: number
): { sentence: string; start: number; end: number }

// CEFR mapping from grade level
export function getGradeLabel(grade: number): string
```

---

## `lib/utils.ts`

```ts
export interface CEFRLevel {
  level: string;
  label: string;
}

export function gradeToCEFR(grade: number): CEFRLevel
// ≤3 → { level: "A1", label: "Beginner" }
// ≤5 → { level: "A2", label: "Elementary" }
// ≤7 → { level: "B1", label: "Intermediate" }
// ≤10 → { level: "B2", label: "Upper Intermediate" }
// ≤13 → { level: "C1", label: "Advanced" }
// 14+ → { level: "C2", label: "Mastery" }
```

---

## Components

### `Editor.tsx` (`components/editor/editor.tsx`)
- `"use client"` — three absolutely stacked layers inside a relative container
- Layer 1 (bottom): ClarityLayer with `pointer-events: none`
- Layer 2 (middle): HighlightLayer with `pointer-events: none`
- Layer 3 (top): Textarea with `text-transparent caret-foreground bg-transparent resize-none`
- All layers: identical font, size, padding, line-height, word-break — must be pixel-perfect
- Use `w-full h-full` — never fixed `size-96` or `w-96`
- Height: `h-56 lg:h-80`
- **Scroll sync**: Textarea `onScroll` handler syncs `scrollTop`/`scrollLeft` to overlay layers via refs
- Both overlay layers: `overflow-hidden` (no independent scrolling)

### `ClarityLayer.tsx`
- Wraps each sentence in a `<span>` with a colored left border based on clarity score
- `pointer-events: none` — decorative only
- Uses `getSentenceClarity()` and `getClarityColor()` from `lib/clarity.ts`

### `FeedbackPanel.tsx`
- Filter bar: All · Spelling · Grammar · Punctuation · Style
  - Mobile: `overflow-x-auto flex gap-2 scrollbar-none`
  - Desktop: wrapping pills
- Error list: clickable buttons showing error word (red) + truncated message
- Selected match shows:
  - Rule description, full message
  - Up to 5 suggestion buttons (apply fix directly)
  - AI explanation from `useFeedback` shown below suggestions
  - **Rewritten sentence** from `useRewrite` with "Apply rewrite" button
- Mobile: `max-h-72 overflow-y-auto` | Desktop: `max-h-72 overflow-y-auto`

### `WritingDNA.tsx`
- Only renders when `isReady` is true (30+ words)
- Shows placeholder message when not ready (< 30 words)
- Layout (Notion-style, clean):
```
✦ Writing DNA

[Personality label — large, bold]
[Personality description — muted]

Vocabulary richness
████████░░  73% — Varied

Avg sentence length
14 words — Short & punchy

Passive voice
██░░░░░░░░  8% — Active voice

Reading level
C1 · Advanced
```
- Progress bars: `h-1 rounded-full bg-muted` track with colored fill
- Animate metric values with count-up on first render using `requestAnimationFrame`
- Personality badge has a colored left border accent
- CEFR level displays using `gradeToCEFR()` from `lib/utils.ts`

### `WritingDNABottomSheet.tsx` (mobile only — `lg:hidden`)
- Trigger: pill button fixed at `bottom-20 left-1/2 -translate-x-1/2` showing personality label + `↑`
- Sheet: slides up from bottom, `h-[60vh]`, `rounded-t-2xl`, drag handle bar at top
- Backdrop closes the sheet on tap
- Renders `<WritingDNA />` inside

### `ToneBar.tsx`
- Only shows when `tone` is not null
- Primary tone colored pill + optional secondary pill + one-sentence summary
- Tone badge colors: formal → blue | casual → green | confident → purple | uncertain → amber | positive → emerald | negative → red | neutral → gray
- "Analyzing tone..." placeholder when `isAnalyzing` and word count is 30+
- Hides entirely below 30 words
- Badges wrap with `flex-wrap` on narrow screens

### `Toolbar.tsx`
- Mobile: inline header, `bg-background`, app name left + status right, hide Clear/Copy buttons
- Desktop: (`lg:flex`) shows all buttons (Copy, Clear)
- Status indicator: pulsing amber dot (checking) | green dot (clean) | red dot + count (errors)

### `FloatingActionButton.tsx` (mobile only — `lg:hidden`)
- Fixed `bottom-4 right-4`, circular `w-12 h-12 rounded-full bg-foreground text-background`
- Tap to expand action menu above it: Copy text + Clear text
- Menu animates with `scale` + `opacity` transition
- Shows `⋯` when closed, `×` when open

---

## Page Layout (`app/page.tsx`)

### Mobile (default)
Single column, top to bottom:
1. `<Toolbar />` (sticky, desktop buttons hidden)
2. `<Editor />`
3. `<FeedbackPanel />`
4. `<ToneBar />`
5. `<WritingDNABottomSheet />` (fixed, triggered by pill)
6. `<FloatingActionButton />` (fixed)

### Desktop (`lg:`)
Flex or grid with sidebar:
- Main area: Toolbar (inline) + Editor + FeedbackPanel + ToneBar
- Sidebar (sticky): WritingDNA

---

## Helper Functions (`components/editor/helper.tsx`)

```ts
export function useDebounce<T>(value: T, delay: number): T

export function getCategoryFromIssueType(issueType: string): Category

export function getDecorationColorClass(category: Category): string

export function getCategoryBgClass(category: Category): string

export function getCategoryLabel(category: Category): string

export function highlightText(
  text: string,
  matches: Match[],
  selectedMatch: Match | null,
  onSelect: (match: Match) => void
): React.ReactNode[]
// Renders text with error underlining, clickable marks, selection highlighting

export function getSentenceAtOffset(
  text: string,
  offset: number
): { sentence: string; start: number; end: number }
```

---

## Hard Rules
1. **No API keys in the browser** — Groq key only used in `/api/*` route handlers
2. **No setState synchronously in useEffect** — always wrap in `setTimeout(..., 0)` or call inside `.then()`
3. **Always use AbortController** for grammar check — silently swallow AbortError
4. **Editor layers must be pixel-perfect** — identical font, padding, line-height on all three layers
5. **Writing DNA is 100% client-side** — no API calls, no Groq, pure JS math in `lib/clarity.ts`
6. **All Groq JSON responses** must be parsed inside try/catch
7. **No fixed widths on editor** — always `w-full h-full`
8. **Mobile-first** — base Tailwind classes for mobile, `lg:` for desktop enhancement
9. **No `overflow: hidden` on page body** — breaks sticky toolbar
10. **No `any` types** — TypeScript strict mode throughout
11. **Scroll sync required** — textarea `onScroll` handler must sync overlay layers
12. **All layers must use identical styling** — font-mono, text-sm, p-3, break-words, leading-relaxed
