# Al-Hayat AptitudePrep

Version 1 static website for GitHub Pages.

## What Is Included

- Home, Tests, Skills, Subjects, Practice, Mock Tests, Resources, Study Plans, Progress, Book Trial Class, Reviews, Media, About, Contact and Search pages.
- Expandable desktop/mobile navigation.
- JSON-driven content model in `/data`.
- Working sample practice engine.
- Working sample mock-test engine.
- Premium notes preview with WhatsApp purchase buttons.
- Trial-class lead form that opens WhatsApp with the submitted details.

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

- Add more tests in `data/tests.json`.
- Add more skills in `data/skills.json`.
- Add more questions in `data/questions.json`.
- Add real premium previews and prices in `data/resources.json`.
- Replace the placeholder WhatsApp number in `assets/js/app.js`.
- Add the official email address in the contact page renderer inside `assets/js/app.js`.
