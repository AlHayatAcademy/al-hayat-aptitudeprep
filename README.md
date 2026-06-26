# Al-Hayat AptitudePrep

Version 23 static website for GitHub Pages.

## What Is Included

- Home, Tests, Skills, Subjects, Practice, Mock Tests, Resources, Study Plans, Progress, Book Trial Class, Reviews, Media, About, Contact and Search pages.
- Share page with copy-link and WhatsApp share actions.
- FAQ page with searchable student help.
- Compare Tests, Glossary and Choose My Test pages.
- Strategies, Common Mistakes and Daily Plan pages.
- Worksheets, Assignments and Score Guide pages.
- Roadmap, Changelog, Contributor Guide and Question Bank pages.
- Vocabulary Bank, Formula Bank and Question Sets pages.
- Diagnostic Test, Flashcards and Error Log pages.
- Premium Notes Preview page with test, subject, topic and WhatsApp purchase links.
- Results Report page for practice, mock, diagnostic, flashcard and error-log progress.
- Lessons page with concepts, worked examples, strategy, mistakes and connected practice links.
- Teacher Toolkit page with class plans, agendas, homework and follow-up messages.
- Parent Guide page with progress, trial-class, routine and resource guidance.
- Admissions Timeline page with phased preparation plans for major test seasons.
- Download Center page for printable packs, worksheets, handouts and checklists.
- Question Review page for wrong-answer patterns, review methods and revision links.
- Test Routes page with connected preparation pathways for major test families.
- Student Dashboard page with route selection, progress signals and next actions.
- Test Pages hub with dedicated deep-page records for MDCAT, FAST, NAT and GAT.
- Improved MCQ practice engine with Attempt, Show Answer, Explanation, Urdu Explanation, Next Question and Study Topic controls.
- Subject Chapter Maps page for Biology, Chemistry, Physics, Mathematics and English.
- Question Builder page with MCQ templates, quality checks and JSON examples.
- Expandable desktop/mobile navigation.
- JSON-driven content model in `/data`.
- Working sample practice engine.
- Working sample mock-test engine.
- Premium notes preview with WhatsApp purchase buttons.
- Trial-class lead form that opens WhatsApp with the submitted details.
- Expanded test groups, tests, skills, subjects, topics, sample questions, mocks, resources and study plans.
- Homepage stats, student pathways, announcements and filtered resources.
- Test format summaries, decision guide and glossary search.
- Practical strategy cards, mistake correction cards and a browser-saved daily checklist.
- Classroom worksheet previews, assignment packs and score-band guidance.
- Site management tools for tracking versions, content quality and question-bank expansion targets.
- First real content-bank expansion for words, formulas and curated starter drills.
- Browser-saved diagnostic result, flashcard mastery and student error log.
- Structured note previews connected to existing premium resource cards.
- Local report insights with weak-topic table and next-step actions.
- Lesson library foundation connected to tests, skills, subjects, topics, notes and mocks.
- Classroom toolkit connected to lessons, worksheets and assignments.
- Parent-facing guidance connected to results report, trial class and WhatsApp support.
- Timeline planner connected to study plans, diagnostics, mocks and trial class.
- Download center connected to worksheets, teacher toolkit, parent guide and timelines.
- Question review connected to practice, error log, strategies, flashcards and results report.
- Test routes connected to tests, lessons, mocks, resources, timelines and question sets.
- Student dashboard connected to local progress, routes, lessons, mocks, downloads and results report.
- Test pages connected to test routes, lessons, mocks, resources, timelines and question sets.
- Practice questions now support staged answer checking and topic study panels.
- Chapter maps connect subjects, topics, lessons, resources, questions and practice.
- Question builder supports future question-bank expansion with consistent required fields and review rules.

## How To Use

Open `index.html` through a local server, or publish the full folder to GitHub Pages.

For quick local testing:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## Main Expansion Points

- Add full-length question banks in `data/questions.json`.
- Add real prices and fuller previews in `data/resources.json`.
- Add real social media URLs in `data/media.json`.
- Add more FAQs in `data/faqs.json`.
- Add student pathways in `data/pathways.json`.
- Add announcements in `data/announcements.json`.
- Add test format summaries in `data/test-formats.json`.
- Add glossary terms in `data/glossary.json`.
- Add route-selection cards in `data/decision-guide.json`.
- Add strategy cards in `data/strategies.json`.
- Add mistake cards in `data/common-mistakes.json`.
- Add daily checklist tasks in `data/daily-checklist.json`.
- Add worksheet previews in `data/worksheets.json`.
- Add assignment packs in `data/assignments.json`.
- Add score-band guidance in `data/score-bands.json`.
- Add roadmap milestones in `data/roadmap.json`.
- Add version history in `data/changelog.json`.
- Add content rules in `data/contributor-guide.json`.
- Add question-bank targets in `data/question-bank-targets.json`.
- Add vocabulary items in `data/vocabulary-bank.json`.
- Add formulas in `data/formula-bank.json`.
- Add curated sets in `data/question-sets.json`.
- Add diagnostic items in `data/diagnostic-quiz.json`.
- Add flashcards in `data/flashcards.json`.
- Add mistake prompts in `data/error-log-prompts.json`.
- Add premium note previews in `data/premium-notes.json`.
- Add result insight bands in `data/result-insights.json`.
- Add lessons in `data/lessons.json`.
- Add teacher class plans in `data/teacher-toolkit.json`.
- Add parent guidance cards in `data/parent-guide.json`.
- Add admission timelines in `data/admissions-timelines.json`.
- Add download/print records in `data/download-center.json`.
- Add question-review guides in `data/question-review.json`.
- Add test-route pathways in `data/test-routes.json`.
- Add dashboard action cards in `data/dashboard.json`.
- Add test-specific page records in `data/test-pages.json`.
- Add subject chapter maps in `data/chapter-maps.json`.
- Add question-builder templates in `data/question-bank-builder.json`.
- Add individual deep pages later under `/pages`.
- WhatsApp and email are configured in `assets/js/app.js`.
