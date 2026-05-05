# Penly UI/UX Improvements Guide

**Date:** May 5, 2026  
**Status:** Comprehensive UI/UX Analysis & Recommendations  
**Design Constraints:** Maintain Playfair Display + Noto Sans, OKLch color system, Shadcn UI, dark theme  

---

## Executive Summary

Your application is well-structured with a solid foundation. The improvements focus on:
1. **Information hierarchy** - Clear separation of sections using Shadcn Cards
2. **Visual feedback** - Better status indicators and loading states
3. **Component composition** - Leveraging Shadcn's full potential
4. **Accessibility** - Enhanced contrast and focus states
5. **Consistency** - Unified spacing and visual patterns
6. **User flow** - Reduced cognitive load through better organization

**Key Principle:** No design overhaul—only refinement and optimization.

---

## 1. MAIN PAGE LAYOUT (app/page.tsx)

### Current State
```
Header (Centered title)
Main Content (2-column: Editor + Writing DNA sidebar)
```

### Issues Identified
- No visual hierarchy between sections
- Sidebar doesn't feel integrated into the layout
- Missing visual separation/grouping
- Limited breathing room

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Header** | Simple centered text | Shadcn Card wrapper with icon + description | Creates visual weight and introduces users to the app |
| **Main layout** | Flex with no grouping | Shadcn Card containers for editor + analytics | Better visual separation and focus |
| **Sidebar relationship** | Floating sidebar | Integrated as a grouped panel | More cohesive, professional appearance |
| **Spacing** | Generic gaps | Consistent gap-6/gap-8 with gutter margins | Better visual rhythm |

#### Recommended Code Structure

```tsx
// app/page.tsx - Enhanced layout
export default function Home() {
  const [text, setText] = React.useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <Card className="border-b border-border rounded-none">
        <CardHeader className="py-6 px-6 md:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✦</span>
            <CardTitle className="text-2xl md:text-3xl font-heading">
              Penly
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Grammar checker & writing analysis for professionals
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto 
                      py-6 px-4 md:px-6 lg:px-8 h-full">
        {/* Primary Column */}
        <div className="flex-1 lg:min-w-0">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Editor onTextChange={setText} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Secondary Column */}
        <aside className="hidden lg:flex lg:flex-col w-80 gap-4 flex-shrink-0">
          <WritingDNA text={text} />
          {/* Additional analytics cards can go here */}
        </aside>
      </main>

      {/* Mobile Analytics */}
      <WritingDNABottomSheet text={text} />
    </div>
  );
}
```

#### Suggested Shadcn Components
- **Card** - Wrapper for header and main sections
- **CardHeader, CardTitle, CardDescription** - Hierarchy and metadata
- **CardContent** - Clean content container

---

## 2. TOOLBAR (components/Toolbar.tsx)

### Current State
- Horizontal layout with mixed button styles
- Status indicator text-only
- No clear visual hierarchy
- Buttons don't use Shadcn Button variants effectively

### Issues Identified
- Status text color (blue-600) breaks semantic consistency
- No visual separation between action groups (Status vs. Actions)
- "Copy" feedback is text-only (hard to see)
- No tooltip hints for icon-only buttons on mobile
- Tool menu is a separate dropdown without obvious relationship

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Status display** | Text only with custom colors | Shadcn Badge component with semantic colors | Better visual weight, consistent styling |
| **Button groups** | All buttons mixed together | Divided into logical groups with separators | Clear intention and action priority |
| **Copy feedback** | Text change only | Badge + icon change + Toast notification | More discoverable feedback |
| **Disabled states** | opacity-50 | Full Shadcn disabled styling with cursor-not-allowed | Better UX clarity |
| **Spacing** | gap-2 (tight) | gap-3 with grouped sections | Better visual scanning |

#### Recommended Code Structure

```tsx
// components/Toolbar.tsx - Enhanced version
export const Toolbar = ({
  text,
  onClear,
  onUndo,
  onParaphrase,
  onAiDetect,
  onJobMode,
  canUndo = false,
  isChecking = false,
  errorCount = 0,
  isJobMode = false,
}: ToolbarProps) => {
  const [copied, setCopied] = React.useState(false);
  const hasText = text.trim().length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between w-full gap-4">
      {/* Left: Title */}
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Grammar Checker
      </h2>

      {/* Right: Controls Group */}
      <div className="flex items-center gap-3">
        
        {/* Status Badge */}
        <div className="flex-shrink-0">
          {isJobMode ? (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
              Interview Mode
            </Badge>
          ) : isChecking ? (
            <Badge variant="outline" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              Checking...
            </Badge>
          ) : errorCount > 0 ? (
            <Badge variant="destructive" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-red-400" />
              {errorCount} {errorCount === 1 ? "issue" : "issues"}
            </Badge>
          ) : hasText ? (
            <Badge variant="secondary" className="gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Good
            </Badge>
          ) : null}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-border" />

        {/* Action Buttons - Primary Actions */}
        <div className="flex items-center gap-1">
          {canUndo && onUndo && (
            <Button
              onClick={onUndo}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Undo paraphrase"
            >
              <RotateCcw className="size-4" />
              <span className="hidden lg:inline">Undo</span>
            </Button>
          )}

          {onJobMode && (
            <Button
              onClick={onJobMode}
              variant={isJobMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
              title={isJobMode ? "Exit Interview Mode" : "Enter Interview Mode"}
            >
              <Briefcase className="size-4" />
              <span className="hidden lg:inline">
                {isJobMode ? "Exit" : "Interview"}
              </span>
            </Button>
          )}
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-border" />

        {/* Action Buttons - Secondary Actions */}
        <div className="flex items-center gap-1">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!hasText}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
            <span className="hidden lg:inline">
              {copied ? "Copied" : "Copy"}
            </span>
          </Button>

          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!hasText}
            title="Clear editor"
          >
            <Trash2 className="size-4" />
            <span className="hidden lg:inline">Clear</span>
          </Button>

          {onParaphrase && onAiDetect && (
            <ToolsMenu
              onParaphrase={onParaphrase}
              onAiDetect={onAiDetect}
              hasText={hasText}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

#### Suggested Shadcn Components
- **Badge** - Status display with semantic variants
- **Button** - All action buttons with proper variants
- **Separator/Divider** - Visual grouping with `h-px w-5 bg-border`

---

## 3. FEEDBACK PANEL (components/FeedbackPanel.tsx)

### Current State
- Basic list of errors with inline categories
- Filter buttons lack visual hierarchy
- Error suggestions are basic buttons
- No visual grouping or card structure
- Empty state is minimal

### Issues Identified
- Category filter buttons don't use Shadcn Tabs or proper styling
- No card separation for "Detail view" vs "List view"
- Suggestion buttons don't match Button variant system
- Error cards lack visual breathing room
- No empty state illustration or guidance

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Error filtering** | Basic button styling | Shadcn Tabs component | Industry standard, better UX |
| **Detail view** | Inline div | Shadcn Card with slots | Clear separation, better readability |
| **Suggestions** | Custom styled buttons | `Button variant="secondary"` | Consistency with design system |
| **Error list items** | Plain buttons | Card-based items with better spacing | More professional, scannable |
| **Empty state** | Text only | Icon + descriptive message | Better guidance and onboarding |
| **Explanation section** | Border divider | Clear Card section with background | Better visual hierarchy |

#### Recommended Code Structure

```tsx
// components/FeedbackPanel.tsx - Enhanced version
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FeedbackPanel = ({
  result,
  selectedMatch,
  text,
  onSelectMatch,
  onApplySuggestion,
}: FeedbackPanelProps) => {
  const [activeFilter, setActiveFilter] = React.useState<Category | "all">("all");
  const errorCount = result?.length ?? 0;

  const errorText = selectedMatch
    ? text.slice(selectedMatch.offset, selectedMatch.offset + selectedMatch.length)
    : "";

  const selectedCategory = selectedMatch
    ? getCategoryFromIssueType(selectedMatch.rule.issueType)
    : null;

  const { explanation, isLoading } = useFeedback(selectedMatch, errorText);

  const filteredErrors = React.useMemo(() => {
    if (!result) return [];
    if (activeFilter === "all") return result;
    return result.filter(
      (m) => getCategoryFromIssueType(m.rule.issueType) === activeFilter,
    );
  }, [result, activeFilter]);

  // Detail view - when error is selected
  if (selectedMatch) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-sm">
                {selectedMatch.rule?.description ?? "Grammar issue"}
              </CardTitle>
              {selectedCategory && (
                <Badge variant="secondary" className="w-fit">
                  {getCategoryLabel(selectedCategory)}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectMatch(null)}
              className="h-fit"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Message */}
          <p className="text-sm text-muted-foreground">
            {selectedMatch.message}
          </p>

          {/* Suggestions */}
          {selectedMatch.replacements && selectedMatch.replacements.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.replacements.slice(0, 5).map((r, i) => (
                  <Button
                    key={i}
                    onClick={() =>
                      onApplySuggestion(
                        r.value,
                        selectedMatch.offset,
                        selectedMatch.length,
                      )
                    }
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    {r.value}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {(explanation || isLoading) && (
            <div className="rounded-lg bg-accent/50 border border-border/50 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                AI Explanation
              </p>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {explanation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Grammar Issues</CardTitle>
        <CardDescription>
          {errorCount > 0 && text.length > 0
            ? `${filteredErrors.length} issue${filteredErrors.length !== 1 ? "s" : ""} found`
            : "No issues detected"}
        </CardDescription>
      </CardHeader>

      {errorCount > 0 && text.length > 0 ? (
        <>
          {/* Category Filter Tabs */}
          <div className="border-t border-border px-4">
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <TabsList className="w-full h-auto gap-0 bg-transparent p-0 rounded-none border-b-0 -mb-px">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs"
                >
                  All ({result?.length})
                </TabsTrigger>
                {(["spelling", "grammar", "punctuation", "style"] as const).map(
                  (category) => {
                    const count = result?.filter(
                      (m) => getCategoryFromIssueType(m.rule.issueType) === category,
                    ).length ?? 0;
                    return (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs"
                      >
                        {getCategoryLabel(category)} ({count})
                      </TabsTrigger>
                    );
                  },
                )}
              </TabsList>
            </Tabs>
          </div>

          {/* Error List */}
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((m, i) => (
                  <Button
                    key={i}
                    onClick={() => onSelectMatch(m)}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-auto rounded-none border-0 px-4 py-2.5 text-left"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <code className="font-mono text-destructive font-semibold">
                          {text.slice(m.offset, m.offset + m.length)}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.shortMessage || m.message}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
                  </Button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No errors in this category
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        <CardContent className="py-8 text-center">
          <AlertCircle className="size-6 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            {text.trim().length < 3
              ? "Type at least a few words to begin checking."
              : "No issues detected. Great writing!"}
          </p>
        </CardContent>
      )}
    </Card>
  );
};
```

#### Suggested Shadcn Components
- **Card** - Main container with header/content slots
- **Tabs** - Category filtering with semantic tab list
- **Badge** - Category display
- **Button** - Action buttons with ghost variant
- **Skeleton** - Loading state for AI explanation

---

## 4. WRITING DNA (components/WritingDNA.tsx)

### Current State
- Good animated numbers and metric visualization
- Personality badge with colored border
- Metrics display is clean but could be better organized
- Loading state is basic

### Issues Identified
- Personality badge uses custom border styling (could use Card)
- Metrics section lacks visual grouping/sections
- Loading state shows placeholder bars (could show shimmer skeleton)
- No clear call-to-action or interpretation guide
- Icons are missing (could add lucide icons for visual interest)

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Personality section** | Border-left box | Shadcn Card with icon and subtle background | Better visual grouping, professional |
| **Metrics layout** | Flat list | Divided into collapsible sections or cards | Better information hierarchy |
| **Loading state** | Placeholder bars | Shadcn Skeleton with animated shimmer | More modern, less jarring |
| **Icons** | Text-only | Lucide icons (Brain, TrendingUp, etc.) | Visual clarity and engagement |
| **Reading level** | Text only | Badge with color-coded level | Better at-a-glance understanding |
| **Empty state** | Text only | Illustration or icon guidance | Better onboarding |

#### Recommended Code Structure

```tsx
// components/WritingDNA.tsx - Enhanced version
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, TrendingUp, MessageCircle, BookOpen, Zap 
} from "lucide-react";

export const WritingDNA = ({ text }: WritingDNAProps) => {
  const dna = useWritingDNA(text);

  if (!dna.isReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="size-4" />
            Writing DNA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Write at least 30 words to unlock your writing analysis.
          </p>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="space-y-0">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="size-4" />
          Writing DNA
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-6">
        
        {/* Personality Section */}
        <Card className="border-l-4 border-l-accent/50 bg-accent/30 border-border">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {dna.personality.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dna.personality.description}
                </p>
              </div>
              <Brain className="size-4 text-accent flex-shrink-0 mt-0.5" />
            </div>
          </CardContent>
        </Card>

        {/* Metrics - Tabs for organization */}
        <div className="space-y-3">
          
          {/* Vocabulary Richness */}
          <MetricCard
            icon={<MessageCircle className="size-4" />}
            label="Vocabulary Richness"
            value={dna.vocabularyRichness}
            suffix="%"
            description={getVocabularyLabel(dna.vocabularyRichness)}
            color={getVocabularyColor(dna.vocabularyRichness)}
            tooltip="Measure of diverse word usage. Higher is better."
          />

          {/* Sentence Length */}
          <MetricCard
            icon={<TrendingUp className="size-4" />}
            label="Avg Sentence Length"
            value={dna.avgSentenceLength}
            suffix=" words"
            description={getSentenceLengthLabel(dna.avgSentenceLength)}
            color="accent"
            tooltip="Well-balanced length is 15-25 words per sentence."
          />

          {/* Passive Voice */}
          <MetricCard
            icon={<BookOpen className="size-4" />}
            label="Passive Voice Usage"
            value={dna.passivePercent}
            suffix="%"
            description={getPassiveVoiceLabel(dna.passivePercent)}
            color={getPassiveVoiceColor(dna.passivePercent)}
            tooltip="Lower is better for active, engaging writing."
          />

          {/* Reading Level */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Reading Level</span>
            </div>
            <Badge variant="outline">
              {gradeToCEFR(dna.gradeLevel).level} — {gradeToCEFR(dna.gradeLevel).label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for metric cards
const MetricCard = ({
  icon,
  label,
  value,
  suffix,
  description,
  color,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  description: string;
  color: "emerald" | "amber" | "red" | "accent";
  tooltip?: string;
}) => {
  const colorClasses = {
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-red-500",
    accent: "text-accent",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
         title={tooltip}>
      <div className="flex items-center gap-2">
        <span className={`${colorClasses[color]}`}>{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
};
```

#### Suggested Shadcn Components
- **Card** - Main container and personality section
- **Badge** - Reading level display
- **Skeleton** - Loading shimmer state
- **Tabs** - Optional for metric organization (advanced)

---

## 5. TONE BAR (components/ToneBar.tsx)

### Current State
- Displays tone with primary and secondary badges
- Color-coded by tone type
- Shows summary text

### Issues Identified
- Tone background colors don't use design tokens (hardcoded brand colors)
- Should be integrated into a Card for consistency
- No icon representation
- Could benefit from better visual hierarchy

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Container** | Bare flex | Shadcn Card | Consistent visual grouping |
| **Tone badges** | Custom colors | Semantic Badge variants | Consistency with design system |
| **Icons** | Text labels only | Lucide icons for each tone | Quick visual recognition |
| **Layout** | Inline flex | Column with better spacing | Better readability |
| **Empty state** | Nothing | Hidden (already done) | Keep as-is |

#### Recommended Code Structure

```tsx
// components/ToneBar.tsx - Enhanced version
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap, MessageCircle, CheckCircle2, HelpCircle, Smile, AlertCircle
} from "lucide-react";

const TONE_ICONS: Record<Tone, React.ReactNode> = {
  formal: <MessageCircle className="size-3" />,
  casual: <Zap className="size-3" />,
  confident: <CheckCircle2 className="size-3" />,
  uncertain: <HelpCircle className="size-3" />,
  positive: <Smile className="size-3" />,
  negative: <AlertCircle className="size-3" />,
  neutral: <MessageCircle className="size-3" />,
};

const TONE_VARIANTS: Record<Tone, "default" | "secondary" | "destructive" | "outline"> = {
  formal: "secondary",
  casual: "default",
  confident: "default",
  uncertain: "outline",
  positive: "default",
  negative: "destructive",
  neutral: "outline",
};

export const ToneBar = ({ tone, isAnalyzing, text }: ToneBarProps) => {
  const wordCount = text.toLowerCase().match(/\b[a-z]+\b/g)?.length ?? 0;
  const shouldShow = wordCount >= 30;

  if (!shouldShow) return null;

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {isAnalyzing && !tone && (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">Analyzing tone...</p>
          </div>
        )}

        {tone && (
          <div className="space-y-3">
            {/* Tone Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={TONE_VARIANTS[tone.primary]} className="gap-1.5">
                {TONE_ICONS[tone.primary]}
                {getToneLabel(tone.primary)}
              </Badge>
              {tone.secondary && (
                <Badge
                  variant={TONE_VARIANTS[tone.secondary]}
                  className="gap-1.5 opacity-70"
                >
                  {TONE_ICONS[tone.secondary]}
                  {getToneLabel(tone.secondary)}
                </Badge>
              )}
            </div>

            {/* Tone Summary */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tone.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### Suggested Shadcn Components
- **Card** - Main container
- **Badge** - Tone display with variants

---

## 6. EDITOR SECTION (components/editor/editor.tsx)

### Current State
- Large textarea with syntax highlighting overlay
- Toolbar integrated at top
- Feedback panel below
- Tone bar below feedback
- File input for resume upload (interview mode)

### Issues Identified
- Missing visual container/card separation
- Toolbar should be in a consistent Card header
- Textarea could use better visual focus feedback
- File input is hidden and not obvious
- Word count display is missing or unclear
- No clear section labels/headers

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Container** | No card wrapper | Shadcn Card with sections | Visual hierarchy and grouping |
| **Toolbar** | Inline div | CardHeader with Toolbar component | Consistent header styling |
| **Editor focus** | Basic outline | Enhanced ring focus + shadow on active | Better visual feedback |
| **Textarea area** | Plain textarea | Textarea wrapped in CardContent | Visual consistency |
| **Stats** | Separate line | CardFooter with word/char count | Clear metrics placement |
| **Resume input** | Hidden file input | Visible button in toolbar or card header | Better discoverability |

#### Recommended Code Structure

```tsx
// components/editor/editor.tsx - Layout improvements
export const Editor = ({ onTextChange }: EditorProps) => {
  // ... existing hooks and state ...

  return (
    <div className="space-y-4 w-full">
      {/* Main Editor Card */}
      <Card>
        {/* Toolbar Header */}
        <div className="border-b border-border px-4 py-3">
          <Toolbar
            text={text}
            onClear={handleClear}
            onUndo={canUndo ? handleParaphraseUndo : undefined}
            onParaphrase={() => setIsParaphraseDialogOpen(true)}
            onAiDetect={() => setIsAiDetectDialogOpen(true)}
            onJobMode={onJobMode}
            canUndo={canUndo}
            isChecking={isChecking}
            errorCount={errorCount}
            isJobMode={isInterviewMode}
          />
        </div>

        {/* Highlight Layer + Textarea */}
        <div className="relative p-4">
          <div
            ref={highlightLayerRef}
            className="absolute inset-0 overflow-hidden rounded-none pointer-events-none
                      font-mono text-sm text-transparent p-4"
            dangerouslySetInnerHTML={{
              __html: highlightText(text, result || []),
            }}
          />
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onScroll={handleScroll}
            placeholder="Start writing or paste your text here..."
            className="relative font-mono text-sm resize-none
                      bg-background/50 focus-visible:ring-2 focus-visible:ring-offset-0
                      focus-visible:bg-background transition-colors"
            style={{
              minHeight: "300px",
              textShadow: "0 0 0 transparent",
            }}
          />
        </div>

        {/* File Input Section (Interview Mode) */}
        {isInterviewMode && (
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Upload className="size-4" />
                Upload Resume
              </Button>
              {resumeFileName && (
                <span className="text-xs text-muted-foreground">
                  {resumeFileName}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer - Stats */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span>
              Words: <strong className="text-foreground">{wordCount}</strong>
            </span>
            <span>
              Characters: <strong className="text-foreground">{text.length}</strong>
            </span>
          </div>
          {text.length > 0 && (
            <span className="text-xs text-accent">
              Reading time: ~{Math.ceil(wordCount / 200)} min
            </span>
          )}
        </div>
      </Card>

      {/* Feedback Section */}
      <div className="space-y-3">
        {/* Tone Analysis */}
        {text.length > 0 && (
          <ToneBar tone={tone} isAnalyzing={isAnalyzing} text={text} />
        )}

        {/* Grammar Feedback */}
        <FeedbackPanel
          result={result}
          selectedMatch={selectedMatch}
          text={text}
          onSelectMatch={setSelectedMatch}
          onApplySuggestion={handleApplySuggestion}
        />
      </div>

      {/* Interview Mode Panel */}
      {isInterviewMode && currentQuestion && (
        <JobModePanel {...jobModePanelProps} />
      )}

      {/* Dialogs */}
      <ParaphraseDialog
        isOpen={isParaphraseDialogOpen}
        onOpenChange={setIsParaphraseDialogOpen}
        paraphrase={paraphrase}
        isParaphrasing={isParaphrasing}
        onApply={handleApplyParaphrase}
      />

      <AIDetectDialog
        isOpen={isAiDetectDialogOpen}
        onOpenChange={setIsAiDetectDialogOpen}
        isAiGenerated={isAiGenerated}
        confidence={confidence}
        analysis={analysis}
        isDetecting={isDetecting}
      />
    </div>
  );
};
```

#### Suggested Shadcn Components
- **Card** - Main editor container
- **CardHeader** - For toolbar (or just border-b)
- **CardContent** - For textarea area
- **CardFooter** - For word/character count
- **Input** (hidden file input) - For resume upload
- **Button** - Upload trigger

---

## 7. JOB MODE PANEL (components/JobModePanel.tsx)

### Current State
- Colored cards for question and critique sections
- Progress indicator (Question X of Y)
- Navigation buttons
- Shows rating and confidence

### Issues Identified
- Hard-coded color styles (blue, green) instead of semantic colors
- Using custom Card styling instead of Shadcn's CardHeader/CardContent
- Critique section mixing concerns (rating, feedback, suggestions)
- No clear section hierarchy
- Missing visual grouping for related content

### ✅ Improvements

#### Before → After Reasoning

| Aspect | Before | After | Why |
|--------|--------|-------|-----|
| **Color usage** | Hard-coded blue/green | Semantic primary/accent colors | Consistency with design tokens |
| **Card structure** | Custom styling | Full Shadcn Card composition | Professional appearance |
| **Sections** | Inline layout | Proper Card sections with clear hierarchy | Better readability |
| **Rating display** | Large number + confidence | Badge + progress visual | Better metric presentation |
| **Feedback items** | List format | Card-based items with better spacing | Scannable and organized |
| **Navigation** | Button pair at bottom | Header with previous/next buttons | Consistent pattern |

#### Recommended Code Structure

```tsx
// components/JobModePanel.tsx - Enhanced version
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle } from "lucide-react";

export const JobModePanel = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  critique,
  isCritiquing,
  onNext,
  onPrevious,
  onEvaluate,
  onClose,
  hasNextQuestion,
  hasPreviousQuestion,
}: JobModePanelProps) => {
  if (!currentQuestion) return null;

  const ratingPercentage = critique ? (critique.rating / 10) * 100 : 0;
  const isGoodRating = critique && critique.rating >= 7;

  return (
    <div className="space-y-4">
      {/* Question Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                  Question {currentIndex + 1} of {totalQuestions}
                </Badge>
              </div>
              <CardTitle className="text-base">
                {currentQuestion.text}
              </CardTitle>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-fit"
              title="Exit Interview Mode"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground capitalize">
            Category: <strong className="text-foreground">{currentQuestion.category.replace("-", " ")}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Progress</p>
        <Progress value={((currentIndex + 1) / totalQuestions) * 100} />
      </div>

      {/* Critique Results */}
      {critique && (
        <Card className={`border-l-4 ${isGoodRating ? "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm">Interview Response Rating</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${isGoodRating ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {critique.rating}/10
                </div>
                <div className="flex items-center gap-1">
                  {isGoodRating ? (
                    <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {critique.confidence}% confident
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Feedback Sections */}
            {critique.strengths && critique.strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Strengths
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {critique.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle className="size-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {critique.improvements && critique.improvements.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Areas to Improve
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {critique.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertCircle className="size-3 mt-0.5 flex-shrink-0 text-amber-500" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {critique.summary && (
              <div className="rounded-lg bg-background/50 border border-border p-3">
                <p className="text-xs text-muted-foreground">
                  {critique.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isCritiquing && (
        <Card className="bg-accent/20 border-accent/30">
          <CardContent className="pt-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-accent animate-pulse" />
            <p className="text-xs text-accent">Evaluating your response...</p>
          </CardContent>
        </Card>
      )}

      {/* Evaluate Button */}
      {!critique && !isCritiquing && (
        <Button onClick={onEvaluate} className="w-full gap-2">
          <Zap className="size-4" />
          Evaluate Response
        </Button>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onPrevious}
          disabled={!hasPreviousQuestion}
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasNextQuestion}
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
```

#### Suggested Shadcn Components
- **Card** - Main container with semantic background
- **CardHeader, CardTitle, CardDescription** - Clear hierarchy
- **Badge** - Progress indicator
- **Progress** - Visual progress bar
- **Button** - Navigation and actions
- **Icons** - Visual indicators (CheckCircle, AlertCircle, etc.)

---

## 8. GLOBAL IMPROVEMENTS

### Spacing & Consistency

**Issue:** Inconsistent gap usage across components

**Solution:**
```tsx
// Establish gap hierarchy
- gap-1 (4px): Tight groupings (badges, inline elements)
- gap-2 (8px): Related elements
- gap-3 (12px): Section separations
- gap-4 (16px): Major layout sections
- gap-6 (24px): Page-level separation
- gap-8 (32px): Top-level layout
```

### Focus States

**Issue:** Focus rings are minimal in some components

**Solution:**
```css
/* Enhanced focus state */
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-background
focus-visible:ring-offset-2
transition-all duration-200

/* For keyboard navigation */
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Loading States

**Recommendation:** Use Skeleton component consistently

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Loading state pattern
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-2/3" />
  </div>
) : (
  <ContentComponent />
)}
```

### Empty States

**Pattern for all sections:**

```tsx
<div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
  <AlertCircle className="size-8 text-muted-foreground/40" />
  <div className="space-y-1">
    <p className="text-sm font-medium text-foreground">No data available</p>
    <p className="text-xs text-muted-foreground">Description of why it's empty</p>
  </div>
</div>
```

### Accessibility Improvements

| Issue | Solution |
|-------|----------|
| **Low contrast** | Use semantic colors from CSS variables |
| **Missing labels** | Add `aria-label` to icon-only buttons |
| **Tab focus invisible** | Use `focus-visible:ring-*` |
| **Missing status** | Use `aria-live="polite"` for updates |
| **Dialog accessibility** | Ensure Dialog uses Radix dialog (already done) |

Example:
```tsx
<Button
  size="sm"
  className="gap-2"
  title="Copy to clipboard"
  aria-label="Copy to clipboard"
>
  <Copy className="size-4" />
  <span className="hidden lg:inline">Copy</span>
</Button>
```

---

## 9. COMPONENT LIBRARY EXPANSION (Suggested)

Consider adding these shadcn components for future enhancements:

| Component | Use Case | Priority |
|-----------|----------|----------|
| **Tabs** | Category filtering, section navigation | High |
| **Badge** | Status indicators, tags, metrics | High |
| **Skeleton** | Loading states | High |
| **Tooltip** | Hover hints, keyboard help | Medium |
| **Toast** | Success/error notifications | Medium |
| **AlertDialog** | Confirm actions (clear all, etc.) | Medium |
| **Sheet** | Mobile navigation sidebar | Medium |
| **Collapsible** | Expandable sections | Low |
| **Table** | Interview history, analytics | Low |

---

## 10. IMPLEMENTATION PRIORITY

### Phase 1 (High Impact, Quick Wins)
1. Wrap sections in Shadcn Cards with proper structure
2. Add Badge component for status indicators
3. Enhance Toolbar visual hierarchy with separators
4. Replace placeholder colors with design tokens

### Phase 2 (Medium Effort, High Value)
1. Implement Tabs for feedback category filtering
2. Add Skeleton loading states
3. Improve empty state illustrations
4. Better focus states globally

### Phase 3 (Polish & Enhancement)
1. Add icons to metric displays
2. Improve animations and transitions
3. Better mobile responsiveness refinements
4. Accessibility audit and fixes

---

## Summary of Shadcn Components to Use

- **Card** (with Header/Content/Footer) - Main structural component
- **Button** - All interactions with proper variants
- **Badge** - Status, tags, metrics
- **Tabs** - Category/section filtering
- **Skeleton** - Loading states
- **Progress** - Progress indicators
- **Dialog** - Modals (already using)
- **Textarea** - Text input (already using)
- **Dropdown Menu** - Action menus (already using)
- **Popover** - Contextual information (already using)
- **Scroll Area** - Scrollable content (already using)

**All improvements preserve:**
- ✅ Playfair Display + Noto Sans typography
- ✅ OKLch color system & design tokens
- ✅ Dark theme aesthetic
- ✅ Shadcn UI component library
- ✅ Existing brand identity

