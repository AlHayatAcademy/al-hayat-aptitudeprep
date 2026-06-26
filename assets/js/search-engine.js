(function () {
  function initSearchEngine(data, mount) {
    const index = buildIndex(data);
    mount.innerHTML = `
      <section class="page-hero compact">
        <div>
          <p class="eyebrow">Search</p>
          <h1>Find Tests, Skills, Topics, Resources and Questions</h1>
          <p>Search is local and JSON-driven, so new content becomes searchable as soon as it is added to the data files.</p>
        </div>
      </section>
      <section class="toolbar-panel">
        <label class="search-field">Search <input id="siteSearch" type="search" placeholder="Try MDCAT, vocabulary, percentages..." autofocus></label>
      </section>
      <section id="searchResults" class="search-results"></section>
    `;

    const input = mount.querySelector("#siteSearch");
    const results = mount.querySelector("#searchResults");
    input.addEventListener("input", () => render(input.value));
    render("");

    function render(term) {
      const needle = term.trim().toLowerCase();
      const matches = needle
        ? index.filter((item) => item.haystack.includes(needle))
        : index.slice(0, 8);
      results.innerHTML = matches.length
        ? matches.map((item) => `
          <article class="result-card">
            <span>${escapeHTML(item.type)}</span>
            <h2>${escapeHTML(item.title)}</h2>
            <p>${escapeHTML(item.description)}</p>
            <a class="text-link" href="${item.href}">Open</a>
          </article>
        `).join("")
        : `<div class="empty-state"><h2>No result found</h2><p>Add more content to the JSON files or try a broader keyword.</p></div>`;
    }
  }

  function buildIndex(data) {
    return [
      ...data.tests.map((item) => record("Test", item.name, item.description, `tests.html#${item.id}`)),
      ...data.skills.map((item) => record("Skill", item.name, item.description, `skills.html#${item.id}`)),
      ...data.subjects.map((item) => record("Subject", item.name, item.description, `subjects.html#${item.id}`)),
      ...data.topics.map((item) => record("Topic", item.name, item.description, `practice.html?skill=${item.skillId}`)),
      ...data.resources.map((item) => record("Resource", item.title, `${item.category} ${item.type} ${item.access}`, `resources.html#${item.id}`)),
      ...data.questions.map((item) => record("Question", item.stem, `${item.examStyle} ${item.difficulty}`, `practice.html?skill=${item.skillId}`)),
      ...(data.faqs || []).map((item) => record("FAQ", item.question, `${item.category} ${item.answer}`, "faq.html")),
      ...(data.pathways || []).map((item) => record("Pathway", item.title, `${item.bestFor} ${item.steps.join(" ")}`, item.primaryLink)),
      ...(data.announcements || []).map((item) => record("Announcement", item.title, `${item.type} ${item.message}`, "index.html")),
      ...(data.testFormats || []).map((item) => record("Test Format", item.title, `${item.sections.join(" ")} ${item.questionStyle} ${item.bestStrategy}`, "compare.html")),
      ...(data.glossary || []).map((item) => record("Glossary", item.term, `${item.category} ${item.definition} ${item.example}`, "glossary.html")),
      ...(data.decisionGuide || []).map((item) => record("Decision Guide", item.question, `${item.recommendation} ${item.testIds.join(" ")}`, "choose-test.html")),
      ...(data.strategies || []).map((item) => record("Strategy", item.title, `${item.category} ${item.quickTip} ${item.steps.join(" ")}`, "strategies.html")),
      ...(data.commonMistakes || []).map((item) => record("Common Mistake", item.title, `${item.category} ${item.problem} ${item.fix}`, "mistakes.html")),
      ...(data.dailyChecklist || []).map((item) => record("Daily Checklist", item.title, `${item.category} ${item.task}`, "daily-plan.html")),
      ...(data.worksheets || []).map((item) => record("Worksheet", item.title, `${item.category} ${item.level} ${item.preview.join(" ")}`, "worksheets.html")),
      ...(data.assignments || []).map((item) => record("Assignment", item.title, `${item.duration} ${item.tasks.join(" ")} ${item.teacherNote}`, "assignments.html")),
      ...(data.scoreBands || []).map((item) => record("Score Band", item.label, `${item.range} ${item.meaning} ${item.nextStep}`, "score-guide.html")),
      ...(data.roadmap || []).map((item) => record("Roadmap", item.title, `${item.phase} ${item.status} ${item.focus} ${item.nextActions.join(" ")}`, "roadmap.html")),
      ...(data.changelog || []).map((item) => record("Changelog", item.version, `${item.date} ${item.summary}`, "changelog.html")),
      ...(data.contributorGuide || []).map((item) => record("Contributor Guide", item.title, `${item.category} ${item.guidelines.join(" ")}`, "contributor-guide.html")),
      ...(data.questionBankTargets || []).map((item) => record("Question Bank Target", item.id, `${item.priority} ${item.targetCount} ${item.currentSampleCount}`, "question-bank.html")),
      ...(data.vocabularyBank || []).map((item) => record("Vocabulary", item.word, `${item.level} ${item.meaning} ${item.synonyms.join(" ")} ${item.antonyms.join(" ")} ${item.example}`, "vocabulary-bank.html")),
      ...(data.formulaBank || []).map((item) => record("Formula", item.title, `${item.formula} ${item.useCase} ${item.example}`, "formula-bank.html")),
      ...(data.questionSets || []).map((item) => record("Question Set", item.title, `${item.purpose} ${item.skillIds.join(" ")}`, "question-sets.html")),
      ...(data.diagnosticQuiz || []).map((item) => record("Diagnostic", item.stem, `${item.difficulty} ${item.levelSignal} ${item.skillId} ${item.topicId}`, "diagnostic.html")),
      ...(data.flashcards || []).map((item) => record("Flashcard", item.front, `${item.back} ${item.category} ${item.level} ${item.skillId}`, "flashcards.html")),
      ...(data.errorLogPrompts || []).map((item) => record("Error Log Prompt", item.title, `${item.category} ${item.diagnosis} ${item.correctionPrompt}`, "error-log.html")),
      ...(data.premiumNotes || []).map((item) => record("Premium Note", item.title, `${item.access} ${item.summary} ${item.previewSections.map((section) => `${section.heading} ${section.body}`).join(" ")} ${item.premiumIncludes.join(" ")}`, "premium-notes.html")),
      ...(data.resultInsights || []).map((item) => record("Results Report", item.band, `${item.message} ${item.nextActions.join(" ")}`, "results-report.html")),
      ...(data.lessons || []).map((item) => record("Lesson", item.title, `${item.level} ${item.concept} ${item.workedExample} ${item.strategy} ${item.commonMistake} ${item.testIds.join(" ")} ${item.topicIds.join(" ")}`, "lessons.html")),
      ...(data.teacherToolkit || []).map((item) => record("Teacher Toolkit", item.title, `${item.classType} ${item.agenda.join(" ")} ${item.teacherNotes} ${item.homework} ${item.skillIds.join(" ")}`, "teacher-toolkit.html")),
      ...(data.parentGuide || []).map((item) => record("Parent Guide", item.title, `${item.category} ${item.concern} ${item.guidance} ${item.recommendedAction}`, "parent-guide.html")),
      ...(data.admissionsTimelines || []).map((item) => record("Admissions Timeline", item.title, `${item.season} ${item.urgency} ${item.targetTestIds.join(" ")} ${item.milestones.map((milestone) => `${milestone.phase} ${milestone.task}`).join(" ")}`, "admissions-timeline.html")),
      ...(data.downloadCenter || []).map((item) => record("Download", item.title, `${item.category} ${item.audience} ${item.format} ${item.includes.join(" ")} ${item.printNote}`, "download-center.html")),
      ...(data.questionReview || []).map((item) => record("Question Review", item.title, `${item.category} ${item.wrongAnswerPattern} ${item.reviewMethod} ${item.questionIds.join(" ")} ${item.revisionLinks.join(" ")}`, "question-review.html")),
      ...(data.testRoutes || []).map((item) => record("Test Route", item.title, `${item.category} ${item.audience} ${item.targetTestIds.join(" ")} ${item.prioritySkills.join(" ")} ${item.prioritySubjects.join(" ")} ${item.successMap.join(" ")}`, "test-routes.html"))
    ];
  }

  function record(type, title, description, href) {
    const fullHref = window.AHData.rootUrl(href);
    const haystack = `${type} ${title} ${description}`.toLowerCase();
    return { type, title, description, href: fullHref, haystack };
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AHSearch = { initSearchEngine };
})();
