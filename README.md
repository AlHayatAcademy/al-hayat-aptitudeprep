# Al-Hayat AptitudePrep

Version 5 static website for GitHub Pages.

## What Is Included

- Home, Tests, Skills, Subjects, Practice, Mock Tests, Resources, Study Plans, Progress, Book Trial Class, Reviews, Media, About, Contact and Search pages.
- Share page with copy-link and WhatsApp share actions.
- FAQ page with searchable student help.
- Compare Tests, Glossary and Choose My Test pages.
- Strategies, Common Mistakes and Daily Plan pages.
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
- Add individual deep pages later under `/pages`.
- WhatsApp and email are configured in `assets/js/app.js`.
