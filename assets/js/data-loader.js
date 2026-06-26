(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL("../../", scriptUrl);
  const dataRoot = new URL("data/", siteRoot);

  const files = {
    groups: "groups.json",
    tests: "tests.json",
    skills: "skills.json",
    subjects: "subjects.json",
    topics: "topics.json",
    questions: "questions.json",
    mocks: "mocks.json",
    resources: "resources.json",
    studyPlans: "study-plans.json",
    reviews: "reviews.json",
    media: "media.json",
    faqs: "faqs.json",
    announcements: "announcements.json",
    pathways: "pathways.json",
    testFormats: "test-formats.json",
    glossary: "glossary.json",
    decisionGuide: "decision-guide.json",
    strategies: "strategies.json",
    commonMistakes: "common-mistakes.json",
    dailyChecklist: "daily-checklist.json",
    worksheets: "worksheets.json",
    assignments: "assignments.json",
    scoreBands: "score-bands.json",
    roadmap: "roadmap.json",
    changelog: "changelog.json",
    contributorGuide: "contributor-guide.json",
    questionBankTargets: "question-bank-targets.json",
    vocabularyBank: "vocabulary-bank.json",
    formulaBank: "formula-bank.json",
    questionSets: "question-sets.json",
    diagnosticQuiz: "diagnostic-quiz.json",
    flashcards: "flashcards.json",
    errorLogPrompts: "error-log-prompts.json",
    premiumNotes: "premium-notes.json",
    resultInsights: "result-insights.json",
    lessons: "lessons.json",
    teacherToolkit: "teacher-toolkit.json",
    parentGuide: "parent-guide.json",
    admissionsTimelines: "admissions-timelines.json",
    downloadCenter: "download-center.json"
  };

  async function loadJSON(file) {
    const response = await fetch(new URL(file, dataRoot));
    if (!response.ok) {
      throw new Error(`Could not load ${file}: ${response.status}`);
    }
    return response.json();
  }

  async function loadAllData() {
    const entries = await Promise.all(
      Object.entries(files).map(async ([key, file]) => [key, await loadJSON(file)])
    );
    return Object.fromEntries(entries);
  }

  function rootUrl(path = "") {
    return new URL(path, siteRoot).href;
  }

  window.AHData = {
    siteRoot: siteRoot.href,
    rootUrl,
    loadJSON,
    loadAllData
  };
})();
