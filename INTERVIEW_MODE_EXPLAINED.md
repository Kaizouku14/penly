# How Interview Mode Works in Penly

## Quick Overview

Interview Mode transforms Penly into an **AI-powered interview practice platform**. Users upload their resume, get targeted interview questions, practice answering them, and receive AI-powered critiques with performance tracking.

---

## Complete Interview Mode Flow

### **Phase 1: Resume Upload & Question Generation**

```
┌─────────────────────────────────────────────────────────────┐
│ USER UPLOADS PDF RESUME                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    File Validation
                    (PDF type check)
                            ↓
        ┌───────────────────────────────────────┐
        │   API Endpoint: POST /api/resume       │
        │                                       │
        │   1. Validate PDF format              │
        │   2. Extract text from PDF            │
        │   3. Generate questions via Groq LLM  │
        │   4. Parse into structured format     │
        └───────────────────────────────────────┘
                            ↓
            Question Categories Generated:
              • Experience (3-4 questions)
              • Skills (2-3 questions)
              • Projects (2-3 questions)
              • Education (1-2 questions)
              • Soft Skills (1-2 questions)
                            ↓
        ┌───────────────────────────────────────┐
        │ Questions loaded into Interview Mode  │
        │ useInterviewMode hook activated       │
        └───────────────────────────────────────┘
                            ↓
        Questions stored as InterviewQuestion[]
        ├─ id: "q1", "q2", etc.
        ├─ text: "Describe your experience with..."
        ├─ category: "experience" | "skills" | etc.
        └─ Accessible via currentQuestion property
```

**Key Points:**
- Questions are **generated from actual resume content** (not generic)
- Groq LLM with llama-3.3-70b-versatile model ensures quality
- Questions are **traceable to resume sections**
- 10-15 questions typically generated per resume

---

### **Phase 2: Question Navigation & Display**

```
┌──────────────────────────────────────────────────────────┐
│         Interview Mode Active                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Question 1 of 12                                  │ │
│  │                                                   │ │
│  │ "Tell us about your experience with React        │ │
│  │  and how you've used it in production..."        │ │
│  │                                                   │ │
│  │ Category: Experience                             │ │
│  │ ┌─────────────────────────────────────────────┐  │ │
│  │ │ [Textarea for typing answer]                │  │ │
│  │ │                                             │  │ │
│  │ │ OR                                          │  │ │
│  │ │                                             │  │ │
│  │ │ [🎤 Start Recording] [⏸ Stop Recording]     │  │ │
│  │ └─────────────────────────────────────────────┘  │ │
│  │                                                   │ │
│  │ Word Count: 0 words                              │ │
│  │                                                   │ │
│  │ ┌─────────────────────────────────────────────┐  │ │
│  │ │ [Previous] [Evaluate Answer] [Next]         │  │ │
│  │ └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

Navigation Features:
├─ Previous Question (disabled on first question)
├─ Next Question (disabled on last question)
└─ Can retake same question multiple times
```

**State Management:**
- `useInterviewMode` hook tracks current question index
- `currentQuestion` property shows active question
- `hasNextQuestion` / `hasPreviousQuestion` flags for button states
- Questions never change unless new resume uploaded

---

### **Phase 3: Answer Input (Two Methods)**

#### **Method A: Typed Answer**
```
User types response directly in textarea
        ↓
Live character & word count updated
        ↓
User clicks "Evaluate Answer"
        ↓
Answer sent to AI evaluation
```

#### **Method B: Voice Recording**
```
User clicks "Start Recording"
        ↓
Browser requests microphone permission
        ↓
MediaRecorder captures audio as user speaks
        ↓
User clicks "Stop Recording"
        ↓
Audio processing:
  ├─ Converts Blob to ArrayBuffer
  ├─ Decodes using Web Audio API
  ├─ Generates waveform visualization (100-point array)
  └─ Calculates recording duration
        ↓
Optional: User can play back recording
        ↓
Recording duration stored with answer
        ↓
User clicks "Evaluate Answer"
```

**Voice Recording Data:**
- Stored as `.webm` audio format
- Waveform visualization for user feedback
- Duration tracked in seconds
- Optional - users can still evaluate with typed answer

---

### **Phase 4: AI-Powered Answer Evaluation**

```
┌──────────────────────────────────────────────────────────┐
│ User clicks "Evaluate Answer"                           │
└──────────────────────────────────────────────────────────┘
                            ↓
        ┌────────────────────────────────────────┐
        │ Validate Answer                        │
        │ ├─ Question not empty                 │
        │ ├─ Answer not empty                   │
        │ └─ Both trimmed of whitespace         │
        └────────────────────────────────────────┘
                            ↓
        ┌────────────────────────────────────────┐
        │ Call AI Critique Service               │
        │ evaluateInterviewAnswer()              │
        │                                        │
        │ Sends to Groq API:                    │
        │  • System Prompt: Interview evaluator │
        │  • Question text                       │
        │  • Candidate's answer                  │
        └────────────────────────────────────────┘
                            ↓
        ┌────────────────────────────────────────┐
        │ AI Evaluation Criteria:                │
        │ • Content relevance & completeness    │
        │ • Clarity of communication            │
        │ • Technical accuracy                  │
        │ • Confidence & professionalism        │
        │ • Specific examples provided          │
        │ • Problem-solving approach            │
        │ • Self-awareness demonstrated        │
        └────────────────────────────────────────┘
                            ↓
        ┌────────────────────────────────────────┐
        │ AI Returns Structured Response:       │
        │ {                                     │
        │   "strengths": [                     │
        │     "Clear explanation",             │
        │     "Used specific examples",        │
        │     "Demonstrated leadership"        │
        │   ],                                 │
        │   "areasForImprovement": [           │
        │     "Could add more metrics",        │
        │     "Briefly mention learning",      │
        │   ],                                 │
        │   "overallFeedback":                 │
        │     "Strong answer showing...",      │
        │   "rating": 8,                       │
        │   "confidence": 92                   │
        │ }                                     │
        └────────────────────────────────────────┘
                            ↓
        ┌────────────────────────────────────────┐
        │ Critique Results Displayed            │
        │ ✓ Rating: 8/10 (Color-coded)         │
        │ ✓ Strengths (green section)          │
        │ ✓ Areas to Improve (amber section)   │
        │ ✓ Overall Feedback (blue section)    │
        │ ✓ Confidence: 92%                    │
        └────────────────────────────────────────┘
```

**Critique Data Structure:**
```typescript
interface InterviewCritique {
  strengths: string[];              // What you did well
  areasForImprovement: string[];    // How to improve
  overallFeedback: string;          // 2-3 sentence summary
  rating: number;                   // 1-10 score
  confidence: number;               // 0-100 confidence %
}
```

---

### **Phase 5: History & Performance Tracking**

#### **Answer History Tracking**
```
When answer is evaluated:
        ↓
┌───────────────────────────────────────┐
│ Save to Answer History                │
│                                       │
│ AnswerAttempt {                       │
│   id: "q1-1704067200000",            │
│   text: "User's answer text...",     │
│   timestamp: 1704067200000,          │
│   critique: {...},                  │
│   wordCount: 145,                   │
│   recordingDuration?: 52.5          │
│ }                                     │
│                                       │
│ Stored in:                           │
│ questionHistories.get("q1")          │
│   └─ attempts: [attempt1, attempt2]  │
└───────────────────────────────────────┘
        ↓
User can later:
├─ View all previous attempts for this question
├─ Compare current rating to best score
├─ See improvement trend
└─ Review answer text and critique
```

#### **Performance Analytics Tracking**
```
When answer is evaluated:
        ↓
┌───────────────────────────────────────┐
│ Add Performance Metric                │
│                                       │
│ PerformanceMetric {                   │
│   questionId: "q1",                  │
│   rating: 8,                         │
│   timestamp: 1704067200000,          │
│   category: "experience",            │
│   confidence: 92                     │
│ }                                     │
└───────────────────────────────────────┘
        ↓
Auto-calculated Trend:
├─ Average Rating: 7.3 (across all questions)
├─ Highest Rating: 9
├─ Lowest Rating: 5
├─ Total Attempts: 8
├─ Category Averages:
│  ├─ Experience: 7.5
│  ├─ Skills: 7.0
│  ├─ Projects: 8.2
│  ├─ Education: 6.8
│  └─ Soft Skills: 7.1
│
└─ Improvement Rate: +15.4%
   (comparing first half vs second half attempts)
```

---

### **Phase 6: Feedback Display**

```
┌─────────────────────────────────────────────────────────┐
│              ENHANCED FEEDBACK DISPLAY                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Rating: 8/10 (Excellent) | Confidence: 92%         │
│                                                         │
│  ✅ STRENGTHS                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Clear explanation of technical approach       │   │
│  │ • Provided specific metrics and results         │   │
│  │ • Demonstrated leadership in team environment  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🎯 AREAS FOR IMPROVEMENT                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Could elaborate more on technical challenges │   │
│  │ • Consider mentioning lessons learned          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  💡 OVERALL FEEDBACK                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Strong response showing real-world experience   │   │
│  │ and technical depth. Your ability to quantify  │   │
│  │ impact makes this compelling. Adding more      │   │
│  │ detail on your learning process would enhance. │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Show Performance Trends]  [Next Question]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Performance Trends View (Optional):**
```
┌─────────────────────────────────────────────────────┐
│          PERFORMANCE TRENDS & ANALYTICS             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Average Score: 7.3/10 (Solid) | 8 Attempts      │
│  Improvement Rate: +15.4% (Excellent Progress!)  │
│                                                     │
│  Best Score: 9/10 | Weakest Area: 5/10          │
│                                                     │
│  Performance by Category:                         │
│  ┌──────────────────────────────────────┐         │
│  │ Skills ████████░░ 7.0/10 (2 attempts) │        │
│  │ Experience ██████████░ 7.5/10 (3)     │        │
│  │ Projects ███████████░ 8.2/10 (2)      │        │
│  │ Education ██████░░░░░ 6.8/10 (1)      │        │
│  │ Soft Skills ████████░░ 7.1/10 (2)     │        │
│  └──────────────────────────────────────┘         │
│                                                     │
│  📈 Improvement Insights:                          │
│  "Your Skills category has improved most!         │
│   Keep focusing on providing specific examples."   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **Phase 7: Continue or Exit**

```
After viewing critique & feedback:

User has 3 options:

┌─ Option 1: Next Question ────────────────────┐
│ • Advances to next question                 │
│ • Clears textarea for new answer            │
│ • Clears any recording                      │
│ • Previous attempt history preserved        │
│ • Can navigate back anytime                 │
└──────────────────────────────────────────────┘

┌─ Option 2: Retake Same Question ────────────┐
│ • User can attempt same question again     │
│ • New attempt added to history             │
│ • Previous rating shown for comparison     │
│ • Improvement tracked automatically        │
│ • All attempts saved per question          │
└──────────────────────────────────────────────┘

┌─ Option 3: Exit Interview Mode ─────────────┐
│ • All data persists in memory              │
│ • Can re-enter without losing data         │
│ • Quiz ends and returns to normal mode     │
│ • Performance analytics still accessible   │
│ • Or can upload new resume to restart      │
└──────────────────────────────────────────────┘
```

---

## Key Features Explained

### **1. Question Generation**
- **Source:** Resume PDF uploaded by user
- **Method:** Groq LLM analyzes resume content
- **Quality:** Questions are specific to user's background
- **Categories:** Experience, Skills, Projects, Education, Soft Skills
- **Coverage:** Typically 10-15 questions per resume

### **2. Answer Input Methods**
| Method | Use Case | Tracking |
|--------|----------|----------|
| **Typed** | Quick practice, detailed answers | Word count, character count |
| **Voice** | Real interview simulation, speech practice | Duration, waveform, text (if transcribed) |

### **3. AI-Powered Critique**
- **Evaluator:** Groq LLM with interview expertise
- **Criteria:** Content, clarity, technical accuracy, professionalism, examples, problem-solving
- **Output:** Structured feedback (strengths, improvements, overall score)
- **Rating Scale:** 1-10 (1=Poor, 10=Excellent)
- **Confidence:** 0-100% (AI's confidence in evaluation)

### **4. Answer History**
- **Scope:** Per question (all attempts for that question)
- **Data:** Text, timestamp, critique, word count, recording duration
- **Usage:** Compare progress, review previous answers, track improvement

### **5. Performance Analytics**
- **Tracking:** Every attempt adds to performance data
- **Metrics:** Average score, best/worst score, category averages
- **Improvement Rate:** Calculated as: `(second_half_avg - first_half_avg) / first_half_avg * 100`
- **Purpose:** Visualize progress, identify weak areas

### **6. Navigation**
- **Sequential:** Move through questions in order
- **Bidirectional:** Go back to previous questions
- **Flexible:** Retake any question, skip around
- **Tracking:** Progress visible (e.g., "Question 5 of 12")

---

## Data Flow Diagram

```
┌─────────────┐
│User Uploads │
│   Resume    │
└──────┬──────┘
       │
       │ PDF → /api/resume
       ↓
┌─────────────────────────────┐
│  PDF Text Extraction        │
│  + Question Generation      │
│  (Groq LLM)                 │
└──────┬──────────────────────┘
       │
       │ InterviewQuestion[]
       ↓
┌──────────────────────────┐
│useInterviewMode Hook     │
│├─ isInterviewMode = true │
│├─ questions array        │
│└─ currentQuestion        │
└──────┬───────────────────┘
       │
       │ (user types or records answer)
       ↓
┌──────────────────────────────┐
│useInterviewCritique Hook     │
│├─ fetchCritique()            │
│├─ Groq evaluates answer      │
│└─ Returns InterviewCritique  │
└──────┬───────────────────────┘
       │
       ├─→ useAnswerHistory.saveAnswer()
       │   └─ Stores: text, critique, timestamp
       │
       └─→ usePerformanceAnalytics.addMetric()
           └─ Stores: rating, category, confidence
               (recalculates trend automatically)
                       │
                       ↓
                ┌─────────────────┐
                │Display Feedback │
                │+ Trends         │
                └─────────────────┘
                       │
                       ├─→ Next Question (loop back)
                       ├─→ Retake Question (loop back)
                       └─→ Exit Interview Mode
```

---

## Behind the Scenes: Hook Coordination

```
┌─────────────────────────────────────────────────────┐
│  EDITOR COMPONENT (Main Orchestrator)              │
└──────┬──────────────────────────────────────────────┘
       │
       │ initializes all hooks:
       │
       ├─ useInterviewMode
       │  ├─ tracks: isInterviewMode, currentQuestion
       │  ├─ provides: nextQuestion(), previousQuestion()
       │  └─ state: questions[], currentQuestionIndex
       │
       ├─ useInterviewCritique
       │  ├─ tracks: critique, isCritiquing
       │  ├─ provides: fetchCritique()
       │  └─ calls: Groq API via interviewService
       │
       ├─ useAnswerHistory
       │  ├─ tracks: Map<questionId, QuestionHistory>
       │  ├─ provides: saveAnswer(), getQuestionHistory()
       │  └─ stores: all attempts with timestamps
       │
       ├─ usePerformanceAnalytics
       │  ├─ tracks: PerformanceMetric[], trend
       │  ├─ provides: addMetric(), getImprovementRate()
       │  └─ calculates: averages, category breakdown
       │
       └─ useVoiceRecording
          ├─ tracks: recordedAudio, waveformData
          ├─ provides: startRecording(), stopRecording()
          └─ uses: MediaRecorder, Web Audio API
```

---

## Complete Example Walkthrough

### **User Journey:**

**1. Resume Upload**
- User clicks "Upload Resume"
- Selects `resume.pdf`
- API processes: extracts text, generates questions
- Returns: 12 interview questions

**2. Question Display**
- Question 1 appears: "Describe your experience with React..."
- Category badge: "Experience"
- Textarea shows: word count updates in real-time

**3. User Types Answer**
```
"I've been working with React for 3 years. In my current role,
I led a team of 4 developers to rebuild our legacy application
using React, Redux, and TypeScript. We reduced bundle size by 40%
and improved performance by 60%. I'm experienced with hooks,
context API, and have also contributed to open-source projects."
```
- Word count: 56 words
- User clicks "Evaluate Answer"

**4. AI Evaluation**
- Groq LLM evaluates answer
- Returns rating: 8/10
- Confidence: 89%
- Strengths identified
- Areas for improvement suggested

**5. Feedback Display**
```
Rating: 8/10 ✅
Confidence: 89%

Strengths:
✓ Quantified impact (40% reduction, 60% improvement)
✓ Leadership experience shown
✓ Mentioned relevant technologies

Areas to Improve:
• Could mention specific architectural decisions
• Elaborate on challenges overcome
```

**6. History Tracking**
- Answer saved with timestamp
- Rating logged for analytics
- Category tracked: "Experience"
- Performance updated: avg = 8.0, trend = 8.0

**7. Next Question**
- User clicks "Next Question"
- Question 2 appears
- Textarea cleared, ready for new answer
- All previous data preserved

**8. Session End**
- After 12 questions, user exits
- Performance trends show: avg=7.3, improvement=+12%
- All data available if user re-enters

---

## State Persistence

**During Session:**
- ✅ All data in memory (fast)
- ✅ No page refresh needed
- ✅ Complete history preserved
- ✅ Can navigate between questions

**On Page Refresh:**
- ❌ Interview data lost (by design)
- ✅ Can re-upload resume to restart
- ✅ For production: could add localStorage/database

**Across Sessions:**
- ❌ Currently not saved
- ℹ️ Future: Could implement:
  - LocalStorage for browser persistence
  - Database for cloud sync
  - Export results as PDF/CSV

---

## Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Question Generation | Groq LLM (llama-3.3-70b-versatile) | AI-powered question creation |
| Answer Evaluation | Groq LLM (same model) | AI-powered critique |
| PDF Processing | pdfjs or pdf-parse library | Text extraction from resume |
| Voice Recording | MediaRecorder API | Browser-based audio capture |
| Audio Visualization | Web Audio API | Waveform generation |
| State Management | React Hooks | Interview flow orchestration |
| Markup | JSX + TypeScript | Component structure |
| Styling | Shadcn UI + Tailwind CSS | Professional UI |

---

## Summary

**Interview Mode** is a complete interview practice system that:

1. ✅ **Extracts** resume content from PDF
2. ✅ **Generates** relevant interview questions via AI
3. ✅ **Accepts** answers via typing or voice recording
4. ✅ **Evaluates** answers with professional interview criteria
5. ✅ **Tracks** answer history per question
6. ✅ **Calculates** performance analytics and improvement trends
7. ✅ **Displays** structured feedback with actionable insights
8. ✅ **Enables** retakes and flexible navigation

All coordinated through React hooks with a clean architecture separating UI, state management, and AI services.

