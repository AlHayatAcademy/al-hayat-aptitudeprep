# Al-Hayat AptitudePrep

Version 10 static website for GitHub Pages.

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
- Add individual deep pages later under `/pages`.
- WhatsApp and email are configured in `assets/js/app.js`.
