# Al-Hayat Vocabulary UI Upgrade

This package contains complete replacement files using their repository paths.

## Upload with GitHub Desktop

1. Extract the ZIP.
2. In GitHub Desktop, open the `al-hayat-aptitudeprep` repository.
3. Choose **Repository > Show in Explorer**.
4. Copy the extracted `assets` and `data` folders into the repository root.
5. Choose **Replace the files in the destination**.
6. Return to GitHub Desktop and confirm these five changed files:
   - `assets/css/style.css`
   - `assets/js/app.js`
   - `assets/js/practice-engine.js`
   - `assets/js/search-engine.js`
   - `data/vocabulary-bank.json`
7. Commit with: `Upgrade vocabulary bank and connect practice route`
8. Click **Push origin**.

## What changes

- Full bank: 18 words per page, search, level and test filters.
- Rich cards: part of speech, Urdu draft, UK/US IPA, speech buttons, usage and collocations.
- Empty synonym/antonym rows are hidden.
- Practice vocabulary route: six study words per page above the three published MCQs.
- Vocabulary skill card: displays study-word and MCQ counts and links directly to the full bank.
- Search results link to the matching vocabulary entry.

Urdu and pronunciation remain visibly review-gated. The practice route still contains three MCQs because this upgrade connects the study bank; it does not manufacture new assessment questions.
