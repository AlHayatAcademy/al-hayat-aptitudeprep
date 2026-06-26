# Question Import

The public import checklist is `question-import.html` at the repository root.

Before importing MCQs:

- Read `DATA_EXPANSION_GUIDE.md`.
- Expand foundation files first: tests, skills, subjects and topics.
- Add MCQs in batches of 10 to 25.
- Validate JSON before committing.
- Confirm each question has a valid `skillId`, `subjectId`, `topicId` and `testIds`.
- Confirm `answerIndex` points to the correct option.
- Confirm every question has English and Urdu explanations.
