# Data Expansion Guide

Use this guide before adding large amounts of content. The site is now structurally ready; expansion should happen in small, validated batches.

## Expansion Order

1. Expand foundation files first:
   - `data/groups.json`
   - `data/tests.json`
   - `data/skills.json`
   - `data/subjects.json`
   - `data/topics.json`
2. Expand learning support files:
   - `data/topic-study.json`
   - `data/lessons.json`
   - `data/chapter-maps.json`
   - `data/formula-bank.json`
   - `data/vocabulary-bank.json`
   - `data/flashcards.json`
3. Expand practice files:
   - `data/questions.json`
   - `data/question-sets.json`
   - `data/diagnostic-quiz.json`
   - `data/mocks.json`
4. Expand guidance and commercial files:
   - `data/resources.json`
   - `data/premium-notes.json`
   - `data/download-center.json`
   - `data/teacher-toolkit.json`
   - `data/parent-guide.json`

## ID Rules

- Use lowercase kebab-case IDs only.
- Keep IDs stable after publishing.
- Prefix IDs by content type where useful:
  - Tests: `mdcat`, `fast-nu`, `nat-nts`
  - Skills: `quantitative-reasoning`, `verbal-ability`
  - Topics: `percentages`, `ratios`, `sentence-completion`
  - Questions: `q-percentages-001`, `q-analogies-001`
  - Mocks: `mock-mdcat-starter-01`
- Never reuse the same ID for two records in the same file.
- Any referenced ID must already exist in its source file.

## MCQ Schema Checklist

Every item in `data/questions.json` should include:

- `id`
- `testIds`
- `skillId`
- `subjectId`
- `topicId`
- `difficulty`
- `examStyle`
- `stem`
- `options`
- `answerIndex`
- `explanation`
- `urduExplanation`

Rules:

- `options` should have exactly 4 options unless the target exam requires otherwise.
- `answerIndex` must match the correct option position, starting from `0`.
- `skillId`, `subjectId` and `topicId` must refer to existing records.
- Explanation should teach the method, not only state the answer.
- Urdu explanation should explain the same reasoning in student-friendly Urdu.

## Batch Size

Recommended batch sizes:

- Foundation records: 5 to 20 per batch.
- Topic study cards: 5 to 10 per batch.
- MCQs: 10 to 25 per batch.
- Mocks: 1 mock at a time.
- Resources/premium notes: 5 to 10 per batch.

After each batch, validate before adding more.

## Validation Commands

Run these from the project folder:

```bash
node --check assets/js/app.js
node --check assets/js/data-loader.js
node --check assets/js/search-engine.js
node --check assets/js/practice-engine.js
node --check assets/js/mock-engine.js
find data -name '*.json' -print -exec node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'))" {} \;
```

Use this deeper reference check after MCQ or mock expansion:

```bash
node scripts/validate-data.js
```

If `scripts/validate-data.js` is not available in your local copy yet, use the checklist manually before committing.

## Pre-Commit Checklist

- JSON parses without errors.
- New IDs are unique.
- All referenced IDs exist.
- Practice page loads.
- At least one new MCQ appears in the correct skill/topic filter.
- Mock test opens and can submit.
- Search finds the new item.
- Sitemap does not need changes unless a new root `.html` page was added.

## Data Expansion Sequence For This Project

Start with:

1. Add all target test groups and tests.
2. Add skills and subjects.
3. Add topics under each skill and subject.
4. Add 10 MCQs per major topic.
5. Add topic study cards for those same topics.
6. Add one starter mock per target test.
7. Add resources and premium notes for the same topics.

This keeps practice, study, mocks and resources connected as the dataset grows.
