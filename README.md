# Al-Hayat Practice Stabilization Patch

This patch replaces two existing repository files. It does not change `data/questions.json` or any vocabulary data.

## Upload with GitHub Desktop

1. Extract the ZIP.
2. Open the `al-hayat-aptitudeprep` repository in GitHub Desktop.
3. Choose **Repository > Show in Explorer**.
4. Copy the extracted `assets` folder into the repository root.
5. Choose **Replace the files in the destination**.
6. Confirm these two changed files:
   - `assets/js/practice-engine.js`
   - `assets/css/style.css`
7. Commit with: `Stabilize practice navigation and layout`
8. Click **Push origin**.

## Improvements

- Ten-question practice sets with top and bottom navigation.
- Previous/Next controls, compact page numbers and progress counters.
- Set-wise Quiz Mode with one question at a time.
- Answers persist across sets, modes and page refreshes in the same browser.
- Quiz Mode resumes at the first unanswered question in the selected set.
- Per-set completion result, retry-incorrect and reset-set actions.
- Filters reset safely to Set 1 and update the URL.
- Active page, focus movement and answer feedback are accessibility-aware.
- Practice Summary is full width; the unused left sidebar is removed.
- Study-word cards are collapsed into optional study support.
- Responsive controls avoid clipping on tablets and phones.

After deployment, hard-refresh `practice.html?skill=vocabulary`. Existing saved responses from older versions are not imported into the new response store.
