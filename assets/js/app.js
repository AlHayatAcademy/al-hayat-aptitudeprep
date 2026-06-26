(function () {
  const WHATSAPP_NUMBER = "923354910481";
  const page = document.body.dataset.page || "home";
  const app = document.querySelector("#app");

  document.addEventListener("DOMContentLoaded", async () => {
    renderShell();
    try {
      const data = await window.AHData.loadAllData();
      window.AH_SITE_DATA = data;
      renderPage(data);
    } catch (error) {
      console.error(error);
      if (app) {
        app.innerHTML = `<section class="empty-state"><h1>Data could not load</h1><p>Please open the site through a local server or GitHub Pages.</p></section>`;
      }
    }
  });

  function renderShell() {
    const header = document.querySelector("[data-site-header]");
    const footer = document.querySelector("[data-site-footer]");
    if (header) header.innerHTML = headerHTML();
    if (footer) footer.innerHTML = footerHTML();

    const menuButton = document.querySelector("#menuButton");
    const nav = document.querySelector("#primaryNav");
    menuButton?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  function renderPage(data) {
    if (!app) return;
    const routes = {
      home: renderHome,
      tests: renderTests,
      skills: renderSkills,
      subjects: renderSubjects,
      practice: () => window.AHPractice.initPracticeEngine(data, app),
      mocks: () => window.AHMocks.initMockEngine(data, app),
      resources: renderResources,
      compare: renderCompare,
      glossary: renderGlossary,
      choose: renderChooseTest,
      strategies: renderStrategies,
      mistakes: renderMistakes,
      "daily-plan": renderDailyPlan,
      worksheets: renderWorksheets,
      assignments: renderAssignments,
      "score-guide": renderScoreGuide,
      roadmap: renderRoadmap,
      changelog: renderChangelog,
      "contributor-guide": renderContributorGuide,
      "question-bank": renderQuestionBank,
      "vocabulary-bank": renderVocabularyBank,
      "formula-bank": renderFormulaBank,
      "question-sets": renderQuestionSets,
      diagnostic: renderDiagnostic,
      flashcards: renderFlashcards,
      "error-log": renderErrorLog,
      "premium-notes": renderPremiumNotes,
      "study-plans": renderStudyPlans,
      progress: renderProgress,
      reviews: renderReviews,
      media: renderMedia,
      share: renderShare,
      faq: renderFAQ,
      about: renderAbout,
      contact: renderContact,
      trial: renderTrial,
      search: () => window.AHSearch.initSearchEngine(data, app)
    };
    (routes[page] || renderHome)(data);
    wireAccordions();
    wireResourceButtons(data);
    wireResourceFilters();
    wireTrialForm();
    wireShareTools();
    wireDailyChecklist();
  }

  function headerHTML() {
    return `
      <a class="skip-link" href="#app">Skip to content</a>
      <header class="site-header">
        <a class="brand" href="${url("index.html")}" aria-label="Al-Hayat AptitudePrep home">
          <span class="brand-mark">AH</span>
          <span><strong>Al-Hayat</strong><small>AptitudePrep</small></span>
        </a>
        <button class="menu-button" id="menuButton" type="button" aria-expanded="false" aria-controls="primaryNav">Menu</button>
        <nav class="primary-nav" id="primaryNav" aria-label="Primary navigation">
          ${navLink("Home", "index.html")}
          ${navDropdown("Tests", [
            ["Medical Entry Tests", "MDCAT, NMDCAT, NUMS, AMC", "tests.html#medical-entry-tests"],
            ["Engineering & CS Tests", "FAST, NUST NET, ECAT, PIEAS", "tests.html#engineering-cs-tests"],
            ["Graduate & International", "GAT, GRE, GMAT, SAT, IELTS", "tests.html"]
          ])}
          ${navDropdown("Skills", [
            ["Verbal Skills", "Vocabulary, grammar, reading", "skills.html#vocabulary"],
            ["Reasoning Skills", "Quantitative, analytical, logical", "skills.html#quantitative-reasoning"]
          ])}
          ${navLink("Subjects", "subjects.html")}
          ${navLink("Practice", "practice.html")}
          ${navLink("Mock Tests", "mock-tests.html")}
          ${navLink("Resources", "resources.html")}
          ${navDropdown("More", [
            ["Choose My Test", "Find the right route", "choose-test.html"],
            ["Diagnostic Test", "Find strengths and weak areas", "diagnostic.html"],
            ["Flashcards", "Revise core items fast", "flashcards.html"],
            ["Error Log", "Track repeated mistakes", "error-log.html"],
            ["Premium Notes", "Preview and purchase notes", "premium-notes.html"],
            ["Compare Tests", "Formats, sections and strategies", "compare.html"],
            ["Glossary", "Aptitude and mock-test terms", "glossary.html"],
            ["Strategies", "How to solve smarter", "strategies.html"],
            ["Daily Plan", "Today’s study checklist", "daily-plan.html"],
            ["Common Mistakes", "Avoid repeated errors", "mistakes.html"],
            ["Worksheets", "Printable-style practice", "worksheets.html"],
            ["Assignments", "Classwork and homework packs", "assignments.html"],
            ["Score Guide", "Understand mock scores", "score-guide.html"],
            ["Question Bank", "Expansion targets", "question-bank.html"],
            ["Vocabulary Bank", "Words, synonyms and examples", "vocabulary-bank.html"],
            ["Formula Bank", "Math and science formulas", "formula-bank.html"],
            ["Question Sets", "Curated starter drills", "question-sets.html"],
            ["Roadmap", "Version and content plan", "roadmap.html"],
            ["Contributor Guide", "Content quality rules", "contributor-guide.html"],
            ["Changelog", "Version history", "changelog.html"],
            ["Book Trial Class", "Online or physical class lead form", "book-trial-class.html"],
            ["Reviews", "Student feedback and success stories", "reviews.html"],
            ["Media", "YouTube, Facebook, Instagram, TikTok", "media.html"],
            ["Share", "Copy or send the website link", "share.html"],
            ["FAQ", "Student questions and help", "faq.html"],
            ["About & Contact", "Mission, trust and contact details", "about.html"]
          ])}
          <a class="nav-cta" href="${url("book-trial-class.html")}">Book Trial</a>
        </nav>
      </header>
    `;
  }

  function footerHTML() {
    return `
      <footer class="site-footer">
        <div>
          <strong>Al-Hayat AptitudePrep</strong>
          <p>Entry Tests, Aptitude Skills, Mock Tests & Smart Practice.</p>
        </div>
        <div class="footer-links">
          ${navLink("Search", "search.html")}
          ${navLink("Progress", "progress.html")}
          ${navLink("Share", "share.html")}
          ${navLink("FAQ", "faq.html")}
          ${navLink("Glossary", "glossary.html")}
          ${navLink("Daily Plan", "daily-plan.html")}
          ${navLink("Diagnostic", "diagnostic.html")}
          ${navLink("Flashcards", "flashcards.html")}
          ${navLink("Premium Notes", "premium-notes.html")}
          ${navLink("Score Guide", "score-guide.html")}
          ${navLink("Roadmap", "roadmap.html")}
          ${navLink("Vocabulary", "vocabulary-bank.html")}
          ${navLink("Contact", "contact.html")}
        </div>
      </footer>
    `;
  }

  function renderHome(data) {
    app.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Entry Tests • Skills • Practice • Mocks</p>
          <h1>Al-Hayat AptitudePrep</h1>
          <p class="lead">A connected learning hub for MDCAT, FAST, NUST NET, NAT, GAT, SAT, GRE and future aptitude preparation.</p>
          <div class="hero-actions">
            <a class="btn primary" href="${url("tests.html")}">Prepare by Test</a>
            <a class="btn secondary" href="${url("skills.html")}">Practice by Skill</a>
            <a class="btn ghost" href="${url("book-trial-class.html")}">Book Trial Class</a>
          </div>
        </div>
        <div class="hero-panel" aria-label="Learning system summary">
          <div class="mini-map">
            <span>Tests</span><span>Skills</span><span>Subjects</span><span>Questions</span><span>Mocks</span>
          </div>
          <p>One question bank can serve many tests through clean tags: test, skill, subject, topic, difficulty and exam style.</p>
        </div>
      </section>
      <section class="quick-actions" aria-label="Main actions">
        ${actionCard("Tests", "Choose MDCAT, FAST and future test routes.", "tests.html")}
        ${actionCard("Practice", "Attempt tagged sample MCQs with instant feedback.", "practice.html")}
        ${actionCard("Mock Tests", "Run timed sample mocks and save progress.", "mock-tests.html")}
        ${actionCard("Resources", "Preview notes and purchase premium resources.", "resources.html")}
        ${actionCard("Premium Notes", "Open structured note previews.", "premium-notes.html")}
        ${actionCard("Choose Test", "Find the best route for your goal.", "choose-test.html")}
        ${actionCard("Diagnostic", "Check your current level quickly.", "diagnostic.html")}
        ${actionCard("Flashcards", "Revise words, formulas and rules.", "flashcards.html")}
        ${actionCard("Daily Plan", "Follow a practical study checklist.", "daily-plan.html")}
        ${actionCard("Worksheets", "Use class-ready practice packs.", "worksheets.html")}
        ${actionCard("Question Bank", "Track expansion targets.", "question-bank.html")}
        ${actionCard("Vocabulary", "Study exam words in context.", "vocabulary-bank.html")}
        ${actionCard("Formulas", "Revise key formulas quickly.", "formula-bank.html")}
      </section>
      <section class="stat-grid" aria-label="Version 3 platform snapshot">
        ${statCard(data.tests.length, "Tests")}
        ${statCard(data.skills.length, "Skills")}
        ${statCard(data.topics.length, "Topics")}
        ${statCard(data.questions.length, "Sample Questions")}
        ${statCard(data.mocks.length, "Mock Structures")}
        ${statCard(data.resources.length, "Resources")}
      </section>
      <section class="section-head">
        <p class="eyebrow">Quick Start</p>
        <h2>Choose A Student Pathway</h2>
      </section>
      <section class="card-grid">
        ${data.pathways.map((pathway) => pathwayCard(pathway)).join("")}
      </section>
      <section class="section-head">
        <p class="eyebrow">Updates</p>
        <h2>Latest Announcements</h2>
      </section>
      <section class="announcement-strip">
        ${data.announcements.map((item) => announcementCard(item)).join("")}
      </section>
      <section class="section-head">
        <p class="eyebrow">Expandable Structure</p>
        <h2>Start With A Test Group</h2>
      </section>
      <section class="accordion-list">
        ${data.groups.map((group) => groupAccordion(group, data)).join("")}
      </section>
      <section class="section-head">
        <p class="eyebrow">Shared Skill Bank</p>
        <h2>Practice Once, Use Across Tests</h2>
      </section>
      <section class="card-grid">
        ${data.skills.map((skill) => skillCard(skill, data)).join("")}
      </section>
    `;
  }

  function renderTests(data) {
    app.innerHTML = `
      ${pageHero("Tests", "Prepare By Test", "Open a group, choose a test, then move to overview, practice, resources or mock tests.")}
      <section class="accordion-list">
        ${data.groups.map((group) => groupAccordion(group, data, true)).join("")}
      </section>
    `;
  }

  function renderSkills(data) {
    app.innerHTML = `
      ${pageHero("Skills", "Practice By Skill", "Build shared aptitude skills that connect to multiple entry tests.")}
      <section class="card-grid">
        ${data.skills.map((skill) => skillCard(skill, data, true)).join("")}
      </section>
    `;
  }

  function renderSubjects(data) {
    app.innerHTML = `
      ${pageHero("Subjects", "Subject-Wise Preparation", "Connect academic subjects to their tests, topics, resources and mocks.")}
      <section class="card-grid">
        ${data.subjects.map((subject) => {
          const tests = subject.connectedTestIds.map((id) => findName(data.tests, id)).join(", ");
          return `
            <article class="feature-card" id="${subject.id}">
              <p class="eyebrow">${escapeHTML(subject.group)}</p>
              <h2>${escapeHTML(subject.name)}</h2>
              <p>${escapeHTML(subject.description)}</p>
              <p class="connected-line">Connected tests: ${escapeHTML(tests)}</p>
              <div class="button-row">
                <a class="btn primary small" href="${url(`practice.html?subject=${subject.id}`)}">Practice</a>
                <a class="btn secondary small" href="${url("mock-tests.html")}">Subject Mock</a>
              </div>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderResources(data) {
    const categories = [...new Set(data.resources.map((resource) => resource.category))].sort();
    app.innerHTML = `
      ${pageHero("Resources", "Free Resources And Premium Notes", "Show a limited preview first, then guide interested students to WhatsApp purchase or counselling.")}
      <section class="toolbar-panel" aria-label="Resource filters">
        <label>Category
          <select id="resourceCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label>Access
          <select id="resourceAccess">
            <option value="all">All access types</option>
            <option value="Open">Free / Open</option>
            <option value="Limited Preview">Limited Preview</option>
          </select>
        </label>
        <label class="search-field">Search
          <input id="resourceSearch" type="search" placeholder="Search notes, test, subject...">
        </label>
      </section>
      <section class="card-grid">
        ${data.resources.map((resource) => resourceCard(resource)).join("")}
      </section>
      <dialog id="resourceDialog" class="preview-dialog">
        <button class="dialog-close" data-close-dialog type="button" aria-label="Close preview">×</button>
        <div id="resourceDialogContent"></div>
      </dialog>
    `;
  }

  function renderCompare(data) {
    const rows = data.testFormats.map((format) => {
      const test = data.tests.find((item) => item.id === format.testId);
      return `
        <tr>
          <td><strong>${escapeHTML(test?.name || format.testId)}</strong><br><span>${escapeHTML(format.title)}</span></td>
          <td>${format.sections.map((section) => `<span class="pill">${escapeHTML(section)}</span>`).join("")}</td>
          <td>${escapeHTML(format.questionStyle)}</td>
          <td>${escapeHTML(format.bestStrategy)}</td>
        </tr>
      `;
    }).join("");
    app.innerHTML = `
      ${pageHero("Compare", "Compare Major Test Formats", "See sections, question style and preparation strategy before choosing a route.")}
      <section class="table-wrap">
        <table class="compare-table">
          <thead><tr><th>Test</th><th>Sections</th><th>Question Style</th><th>Best Strategy</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <section class="card-grid">
        ${data.testFormats.map((format) => formatCard(format, data)).join("")}
      </section>
    `;
  }

  function renderGlossary(data) {
    const categories = [...new Set(data.glossary.map((item) => item.category))].sort();
    app.innerHTML = `
      ${pageHero("Glossary", "Aptitude And Mock-Test Terms", "Understand common words used in preparation, testing, progress and website structure.")}
      <section class="toolbar-panel">
        <label>Category
          <select id="glossaryCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="glossarySearch" type="search" placeholder="Search MCQ, mock, aptitude...">
        </label>
      </section>
      <section class="card-grid" id="glossaryList">
        ${data.glossary.map((item) => glossaryCard(item)).join("")}
      </section>
    `;

    const category = app.querySelector("#glossaryCategory");
    const search = app.querySelector("#glossarySearch");
    const filter = () => {
      const selected = category.value;
      const term = search.value.trim().toLowerCase();
      app.querySelectorAll("[data-glossary-card]").forEach((card) => {
        const categoryOk = selected === "all" || card.dataset.category === selected;
        const textOk = !term || card.textContent.toLowerCase().includes(term);
        card.hidden = !(categoryOk && textOk);
      });
    };
    category.addEventListener("change", filter);
    search.addEventListener("input", filter);
  }

  function renderChooseTest(data) {
    app.innerHTML = `
      ${pageHero("Choose My Test", "Find The Right Preparation Route", "Answer the route question closest to your goal and open the connected test group.")}
      <section class="card-grid">
        ${data.decisionGuide.map((item) => decisionCard(item, data)).join("")}
      </section>
      <section class="content-band">
        <h2>Still unsure?</h2>
        <p>Book a trial class or send a WhatsApp message with your class, background and target admission route.</p>
        <div class="button-row">
          <a class="btn primary" href="${url("book-trial-class.html")}">Book Trial Class</a>
          <a class="btn secondary" href="${url("compare.html")}">Compare Tests</a>
        </div>
      </section>
    `;
  }

  function renderStrategies(data) {
    const categories = [...new Set(data.strategies.map((item) => item.category))].sort();
    app.innerHTML = `
      ${pageHero("Strategies", "Exam Strategies That Students Can Apply", "Use these compact strategies for vocabulary, reading, quantitative reasoning, analytical reasoning, mocks and writing.")}
      <section class="toolbar-panel">
        <label>Category
          <select id="strategyCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="strategySearch" type="search" placeholder="Search strategy, skill, test...">
        </label>
      </section>
      <section class="card-grid">
        ${data.strategies.map((item) => strategyCard(item, data)).join("")}
      </section>
    `;
    wireSimpleCardFilter("#strategyCategory", "#strategySearch", "[data-strategy-card]");
  }

  function renderMistakes(data) {
    const categories = [...new Set(data.commonMistakes.map((item) => item.category))].sort();
    app.innerHTML = `
      ${pageHero("Common Mistakes", "Avoid The Errors That Waste Preparation Time", "Each card names a common student mistake and gives a direct correction method.")}
      <section class="toolbar-panel">
        <label>Category
          <select id="mistakeCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="mistakeSearch" type="search" placeholder="Search mistakes...">
        </label>
      </section>
      <section class="card-grid">
        ${data.commonMistakes.map((item) => mistakeCard(item, data)).join("")}
      </section>
    `;
    wireSimpleCardFilter("#mistakeCategory", "#mistakeSearch", "[data-mistake-card]");
  }

  function renderDailyPlan(data) {
    const completed = JSON.parse(localStorage.getItem("ah-daily-checklist") || "{}");
    const totalMinutes = data.dailyChecklist.reduce((sum, item) => sum + item.minutes, 0);
    const doneCount = data.dailyChecklist.filter((item) => completed[item.id]).length;
    app.innerHTML = `
      ${pageHero("Daily Plan", "A Practical Study Checklist For Today", "Mark tasks complete in this browser and use the links to jump directly into practice.")}
      <section class="stat-grid">
        ${statCard(data.dailyChecklist.length, "Daily Tasks")}
        ${statCard(totalMinutes, "Minutes")}
        ${statCard(doneCount, "Completed")}
      </section>
      <section class="checklist-panel">
        ${data.dailyChecklist.map((item) => dailyTaskCard(item, completed[item.id])).join("")}
      </section>
      <section class="content-band">
        <h2>How to use this plan</h2>
        <p>Complete the checklist before moving to random practice. Short daily consistency is better than occasional long sessions without review.</p>
        <div class="button-row">
          <button class="btn ghost" id="resetDailyChecklist" type="button">Reset Today</button>
          <a class="btn primary" href="${url("progress.html")}">View Progress</a>
        </div>
      </section>
    `;
  }

  function renderWorksheets(data) {
    const categories = [...new Set(data.worksheets.map((item) => item.category))].sort();
    app.innerHTML = `
      ${pageHero("Worksheets", "Class-Ready Worksheet Previews", "Use worksheet cards for focused classroom practice, homework or printable PDF planning.")}
      <section class="toolbar-panel">
        <label>Category
          <select id="worksheetCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="worksheetSearch" type="search" placeholder="Search worksheet, skill, test...">
        </label>
      </section>
      <section class="card-grid">
        ${data.worksheets.map((item) => worksheetCard(item, data)).join("")}
      </section>
    `;
    wireSimpleCardFilter("#worksheetCategory", "#worksheetSearch", "[data-worksheet-card]");
  }

  function renderAssignments(data) {
    app.innerHTML = `
      ${pageHero("Assignments", "Classwork And Homework Packs", "Give students clear weekly tasks, submission mode and teacher-checking focus.")}
      <section class="card-grid">
        ${data.assignments.map((item) => assignmentCard(item, data)).join("")}
      </section>
    `;
  }

  function renderScoreGuide(data) {
    app.innerHTML = `
      ${pageHero("Score Guide", "Understand Mock Scores And Next Steps", "Use score bands to decide whether a student needs concept rebuilding, mixed practice or full mock simulation.")}
      <section class="card-grid">
        ${data.scoreBands.map((item) => scoreBandCard(item)).join("")}
      </section>
      <section class="content-band">
        <h2>How to use score bands</h2>
        <p>Do not judge only by percentage. Also check timing, repeated mistakes, topic weakness and confidence during mock review.</p>
        <div class="button-row">
          <a class="btn primary" href="${url("mock-tests.html")}">Attempt Mock</a>
          <a class="btn secondary" href="${url("mistakes.html")}">Review Mistakes</a>
        </div>
      </section>
    `;
  }

  function renderRoadmap(data) {
    app.innerHTML = `
      ${pageHero("Roadmap", "Version And Content Expansion Plan", "Track what has been built and what should be expanded next.")}
      <section class="card-grid">
        ${data.roadmap.map((item) => roadmapCard(item)).join("")}
      </section>
    `;
  }

  function renderChangelog(data) {
    app.innerHTML = `
      ${pageHero("Changelog", "Website Version History", "A compact history of the main improvements added to Al-Hayat AptitudePrep.")}
      <section class="timeline-list">
        ${data.changelog.map((item) => changelogCard(item)).join("")}
      </section>
    `;
  }

  function renderContributorGuide(data) {
    app.innerHTML = `
      ${pageHero("Contributor Guide", "Quality Rules For Future Content", "Use these rules when adding questions, explanations, resources and notes.")}
      <section class="card-grid">
        ${data.contributorGuide.map((item) => contributorGuideCard(item)).join("")}
      </section>
    `;
  }

  function renderQuestionBank(data) {
    const totalTarget = data.questionBankTargets.reduce((sum, item) => sum + item.targetCount, 0);
    const totalCurrent = data.questionBankTargets.reduce((sum, item) => sum + item.currentSampleCount, 0);
    app.innerHTML = `
      ${pageHero("Question Bank", "Expansion Targets And Priorities", "Track what the question bank should become test by test, skill by skill and topic by topic.")}
      <section class="stat-grid">
        ${statCard(data.questionBankTargets.length, "Target Areas")}
        ${statCard(totalTarget, "Target Questions")}
        ${statCard(totalCurrent, "Current Samples")}
      </section>
      <section class="table-wrap">
        <table>
          <thead><tr><th>Priority</th><th>Test</th><th>Skill</th><th>Topic</th><th>Current</th><th>Target</th></tr></thead>
          <tbody>${data.questionBankTargets.map((item) => questionTargetRow(item, data)).join("")}</tbody>
        </table>
      </section>
    `;
  }

  function renderVocabularyBank(data) {
    const levels = [...new Set(data.vocabularyBank.map((item) => item.level))].sort();
    app.innerHTML = `
      ${pageHero("Vocabulary Bank", "Exam Words With Context", "Study meanings, synonyms, antonyms and example sentences connected to target tests.")}
      <section class="toolbar-panel">
        <label>Level
          <select id="vocabLevel">
            <option value="all">All levels</option>
            ${levels.map((level) => `<option value="${escapeHTML(level)}">${escapeHTML(level)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="vocabSearch" type="search" placeholder="Search word, meaning, synonym...">
        </label>
      </section>
      <section class="card-grid">
        ${data.vocabularyBank.map((item) => vocabularyCard(item, data)).join("")}
      </section>
    `;
    wireSimpleCardFilter("#vocabLevel", "#vocabSearch", "[data-vocab-card]");
  }

  function renderFormulaBank(data) {
    const subjects = [...new Set(data.formulaBank.map((item) => findName(data.subjects, item.subjectId)))].sort();
    app.innerHTML = `
      ${pageHero("Formula Bank", "Key Formulas With Examples", "Revise math, physics and chemistry formulas with use cases and exam examples.")}
      <section class="toolbar-panel">
        <label>Subject
          <select id="formulaSubject">
            <option value="all">All subjects</option>
            ${subjects.map((subject) => `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="formulaSearch" type="search" placeholder="Search formula, topic, test...">
        </label>
      </section>
      <section class="card-grid">
        ${data.formulaBank.map((item) => formulaCard(item, data)).join("")}
      </section>
    `;
    wireSimpleCardFilter("#formulaSubject", "#formulaSearch", "[data-formula-card]");
  }

  function renderQuestionSets(data) {
    app.innerHTML = `
      ${pageHero("Question Sets", "Curated Starter Practice Sets", "Use short sets to practise a focused exam route before taking full mock tests.")}
      <section class="card-grid">
        ${data.questionSets.map((item) => questionSetCard(item, data)).join("")}
      </section>
    `;
  }

  function renderDiagnostic(data) {
    const previous = JSON.parse(localStorage.getItem("ah-diagnostic-result") || "null");
    app.innerHTML = `
      ${pageHero("Diagnostic Test", "Find Your Starting Level", "Attempt a short mixed diagnostic and receive skill-wise next steps for practice.")}
      <section class="stat-grid">
        ${statCard(data.diagnosticQuiz.length, "Diagnostic Items")}
        ${statCard(new Set(data.diagnosticQuiz.map((item) => item.skillId)).size, "Skills Checked")}
        ${statCard(previous ? `${previous.score}/${previous.total}` : "New", "Last Result")}
      </section>
      <section class="question-list diagnostic-list">
        ${data.diagnosticQuiz.map((item, index) => diagnosticQuestionCard(item, index, data)).join("")}
      </section>
      <section class="content-band">
        <button class="btn primary" id="scoreDiagnostic" type="button">Score Diagnostic</button>
        <button class="btn ghost" id="resetDiagnostic" type="button">Reset Diagnostic</button>
        <div id="diagnosticResult" class="diagnostic-result" aria-live="polite"></div>
      </section>
    `;
    wireDiagnosticQuiz(data);
  }

  function renderFlashcards(data) {
    const categories = [...new Set(data.flashcards.map((item) => item.category))].sort();
    const mastered = readJSON("ah-flashcard-mastered", {});
    const masteredCount = Object.values(mastered).filter(Boolean).length;
    app.innerHTML = `
      ${pageHero("Flashcards", "Quick Revision Cards", "Use small cards for vocabulary, formulas, grammar rules and reasoning reminders.")}
      <section class="stat-grid">
        ${statCard(data.flashcards.length, "Cards")}
        ${statCard(masteredCount, "Mastered")}
        ${statCard(data.flashcards.length - masteredCount, "To Revise")}
      </section>
      <section class="toolbar-panel">
        <label>Category
          <select id="flashcardCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="flashcardSearch" type="search" placeholder="Search card, topic, test...">
        </label>
      </section>
      <section class="card-grid">
        ${data.flashcards.map((item) => flashcardCard(item, data, mastered[item.id])).join("")}
      </section>
    `;
    wireSimpleCardFilter("#flashcardCategory", "#flashcardSearch", "[data-flashcard-card]");
    wireFlashcards();
  }

  function renderErrorLog(data) {
    const skillOptions = data.skills.map((skill) => `<option value="${skill.id}">${escapeHTML(skill.name)}</option>`).join("");
    app.innerHTML = `
      ${pageHero("Error Log", "Turn Mistakes Into Revision Targets", "Record repeated errors, identify the cause and connect each mistake to a next action.")}
      <section class="split-layout">
        <aside class="side-panel">
          <h2>Add Mistake</h2>
          <form id="errorLogForm" class="lead-form single-column">
            <label>Skill
              <select name="skillId" required>${skillOptions}</select>
            </label>
            ${input("questionRef", "Question / Topic Reference", "text", true)}
            <label>Cause
              <select name="cause">
                <option>Concept gap</option>
                <option>Careless reading</option>
                <option>Time pressure</option>
                <option>Formula issue</option>
                <option>Vocabulary confusion</option>
              </select>
            </label>
            <label>Correction Plan
              <textarea name="plan" rows="4" placeholder="What will you revise before attempting again?" required></textarea>
            </label>
            <button class="btn primary" type="submit">Save Error</button>
            <button class="btn ghost" id="clearErrorLog" type="button">Clear Log</button>
          </form>
        </aside>
        <section class="table-wrap">
          <h2>Saved Error Log</h2>
          <table>
            <thead><tr><th>Skill</th><th>Reference</th><th>Cause</th><th>Plan</th><th>Date</th></tr></thead>
            <tbody id="errorLogRows"></tbody>
          </table>
        </section>
      </section>
      <section class="section-head">
        <p class="eyebrow">Correction Prompts</p>
        <h2>Common Causes To Watch</h2>
      </section>
      <section class="card-grid">
        ${data.errorLogPrompts.map((item) => errorPromptCard(item, data)).join("")}
      </section>
    `;
    wireErrorLog(data);
  }

  function renderPremiumNotes(data) {
    const subjects = [...new Set(data.premiumNotes.map((item) => findName(data.subjects, item.subjectId)))].sort();
    app.innerHTML = `
      ${pageHero("Premium Notes", "Structured Previews And Purchase Flow", "Preview selected notes before purchase. Each note is connected to tests, subjects, topics and WhatsApp guidance.")}
      <section class="toolbar-panel">
        <label>Subject
          <select id="premiumSubject">
            <option value="all">All subjects</option>
            ${subjects.map((subject) => `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="premiumSearch" type="search" placeholder="Search MDCAT, FAST, vocabulary, biology...">
        </label>
      </section>
      <section class="card-grid note-grid">
        ${data.premiumNotes.map((note) => premiumNoteCard(note, data)).join("")}
      </section>
    `;
    wireSimpleCardFilter("#premiumSubject", "#premiumSearch", "[data-premium-note]");
  }

  function renderStudyPlans(data) {
    app.innerHTML = `
      ${pageHero("Study Plans", "Roadmaps For Focused Preparation", "Keep test-wise weekly or monthly plans in JSON and connect them to practice and mocks.")}
      <section class="card-grid">
        ${data.studyPlans.map((plan) => `
          <article class="feature-card">
            <p class="eyebrow">${escapeHTML(findName(data.tests, plan.testId))}</p>
            <h2>${escapeHTML(plan.title)}</h2>
            <p>${escapeHTML(plan.duration)}</p>
            <ol class="clean-list">${plan.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
            <a class="btn primary small" href="${url(`practice.html?test=${plan.testId}`)}">Start Practice</a>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderProgress(data) {
    const topicProgress = JSON.parse(localStorage.getItem("ah-aptitude-progress") || "{}");
    const mockProgress = JSON.parse(localStorage.getItem("ah-aptitude-mocks") || "[]");
    const topicRows = Object.entries(topicProgress).map(([topicId, item]) => {
      const topic = data.topics.find((entry) => entry.id === topicId);
      const accuracy = item.attempts ? Math.round((item.correct / item.attempts) * 100) : 0;
      return `<tr><td>${escapeHTML(topic?.name || topicId)}</td><td>${item.attempts}</td><td>${item.correct}</td><td>${accuracy}%</td></tr>`;
    }).join("");
    const mockRows = mockProgress.map((item) => `<tr><td>${escapeHTML(item.title)}</td><td>${item.score}/${item.total}</td><td>${new Date(item.date).toLocaleString()}</td></tr>`).join("");
    app.innerHTML = `
      ${pageHero("Progress", "Local Progress Tracker", "Practice and mock attempts are saved in this browser through localStorage.")}
      <section class="table-wrap">
        <h2>Topic Practice</h2>
        <table><thead><tr><th>Topic</th><th>Attempts</th><th>Correct</th><th>Accuracy</th></tr></thead><tbody>${topicRows || `<tr><td colspan="4">No practice attempts yet.</td></tr>`}</tbody></table>
      </section>
      <section class="table-wrap">
        <h2>Mock Attempts</h2>
        <table><thead><tr><th>Mock</th><th>Score</th><th>Date</th></tr></thead><tbody>${mockRows || `<tr><td colspan="3">No mock attempts yet.</td></tr>`}</tbody></table>
      </section>
    `;
  }

  function renderReviews(data) {
    app.innerHTML = `
      ${pageHero("Reviews", "Student Feedback And Success Stories", "Add authentic reviews gradually as the programme grows.")}
      <section class="card-grid">
        ${data.reviews.map((review) => `
          <article class="feature-card">
            <p class="stars">${"★".repeat(review.rating)}</p>
            <h2>${escapeHTML(review.studentName)}</h2>
            <p class="connected-line">${escapeHTML(review.targetTest)}</p>
            <p>“${escapeHTML(review.quote)}”</p>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderMedia(data) {
    app.innerHTML = `
      ${pageHero("Media", "Lectures, Shorts, Reels And Playlists", "Connect YouTube, Facebook, Instagram, TikTok and other media channels when ready.")}
      <section class="card-grid">
        ${data.media.map((item) => `
          <article class="feature-card">
            <p class="eyebrow">${escapeHTML(item.platform)}</p>
            <h2>${escapeHTML(item.title)}</h2>
            <p>${escapeHTML(item.description)}</p>
            <a class="btn secondary small" href="${item.url}" target="_blank" rel="noopener">Open Channel</a>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderShare() {
    const cleanUrl = "https://alhayatacademy.github.io/al-hayat-aptitudeprep/";
    const shareText = "Al-Hayat AptitudePrep: Entry Tests, Aptitude Skills, Mock Tests and Smart Practice.";
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${cleanUrl}`)}`;
    app.innerHTML = `
      ${pageHero("Share", "Share Al-Hayat AptitudePrep", "Send the website link to students, parents, colleagues and study groups.")}
      <section class="contact-grid">
        <article class="feature-card">
          <h2>Website Link</h2>
          <p class="connected-line">${cleanUrl}</p>
          <div class="button-row">
            <button class="btn primary" data-copy-link="${cleanUrl}" type="button">Copy Link</button>
            <a class="btn secondary" href="${whatsappUrl}" target="_blank" rel="noopener">Share on WhatsApp</a>
          </div>
          <p id="copyStatus" class="hint" aria-live="polite"></p>
        </article>
        <article class="feature-card">
          <h2>Suggested Message</h2>
          <p>${shareText}</p>
          <p>Prepare for MDCAT, FAST, NUST NET, NAT, GAT, SAT, GRE, IELTS and more through connected practice and mock tests.</p>
        </article>
      </section>
    `;
  }

  function renderFAQ(data) {
    const categories = [...new Set(data.faqs.map((faq) => faq.category))].sort();
    app.innerHTML = `
      ${pageHero("FAQ", "Student Questions And Help", "Clear answers about preparation routes, practice, mocks, resources, progress and trial classes.")}
      <section class="toolbar-panel">
        <label>Category
          <select id="faqCategory">
            <option value="all">All categories</option>
            ${categories.map((category) => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("")}
          </select>
        </label>
        <label class="search-field">Search
          <input id="faqSearch" type="search" placeholder="Search FAQs...">
        </label>
      </section>
      <section class="accordion-list" id="faqList">
        ${data.faqs.map((faq) => faqCard(faq)).join("")}
      </section>
      <section class="content-band">
        <h2>Need Direct Guidance?</h2>
        <p>For a personal study route or trial class, use WhatsApp or the Book Trial Class form.</p>
        <div class="button-row">
          <a class="btn primary" href="${url("book-trial-class.html")}">Book Trial Class</a>
          <a class="btn secondary" href="${url("contact.html")}">Contact</a>
        </div>
      </section>
    `;

    const category = app.querySelector("#faqCategory");
    const search = app.querySelector("#faqSearch");
    const filter = () => {
      const selected = category.value;
      const term = search.value.trim().toLowerCase();
      app.querySelectorAll("[data-faq-card]").forEach((card) => {
        const categoryOk = selected === "all" || card.dataset.category === selected;
        const textOk = !term || card.textContent.toLowerCase().includes(term);
        card.hidden = !(categoryOk && textOk);
      });
    };
    category.addEventListener("change", filter);
    search.addEventListener("input", filter);
  }

  function renderAbout() {
    app.innerHTML = `
      ${pageHero("About", "A Connected Aptitude Learning System", "Al-Hayat AptitudePrep is designed as a clean, expandable preparation hub rather than disconnected pages.")}
      <section class="content-band">
        <h2>Mission</h2>
        <p>To help students prepare for entry tests through clear concepts, exam-oriented practice, timed mocks, premium notes and guided trial classes.</p>
        <h2>Teaching Model</h2>
        <p>The platform connects every test to its required skills, subjects, topics, question bank, resources and mock tests. Shared skills are reused through tags so students do not waste time studying the same material in separate places.</p>
        <h2>Version 2 Focus</h2>
        <p>This build expands the test catalogue, skill map, subject routes, sample questions, resources, mocks, study plans and sharing tools while keeping the site easy to grow.</p>
      </section>
    `;
  }

  function renderContact() {
    const message = encodeURIComponent("Assalamualaikum, I want information about Al-Hayat AptitudePrep.");
    app.innerHTML = `
      ${pageHero("Contact", "Talk To Al-Hayat AptitudePrep", "Use WhatsApp for quick guidance, trial class queries, resources and admission-test planning.")}
      <section class="contact-grid">
        <article class="feature-card">
          <h2>WhatsApp</h2>
          <p>Message for trial classes, resources, premium notes and test-preparation guidance.</p>
          <a class="btn primary" href="https://wa.me/${WHATSAPP_NUMBER}?text=${message}" target="_blank" rel="noopener">Message on WhatsApp</a>
        </article>
        <article class="feature-card">
          <h2>Email</h2>
          <p>Use email for formal queries and longer messages.</p>
          <a class="text-link" href="mailto:drimranhayatmalik@gmail.com">drimranhayatmalik@gmail.com</a>
        </article>
      </section>
    `;
  }

  function renderTrial(data) {
    app.innerHTML = `
      ${pageHero("Book Trial Class", "Book An Online Or Physical Trial Class", "Submit the details and the page will prepare a WhatsApp message for follow-up.")}
      <section class="form-shell">
        <form id="trialForm" class="lead-form">
          ${input("studentName", "Student Name", "text", true)}
          ${input("level", "Class / Level", "text", true)}
          <label>Target Test
            <select name="targetTest" required>
              ${data.tests.map((test) => `<option>${escapeHTML(test.name)}</option>`).join("")}
              <option>Other</option>
            </select>
          </label>
          ${input("city", "City", "text", false)}
          ${input("whatsapp", "WhatsApp Number", "tel", true)}
          ${input("preferredTime", "Preferred Time", "text", false)}
          <label>Mode
            <select name="mode"><option>Online</option><option>Physical</option><option>Both possible</option></select>
          </label>
          <label>Message
            <textarea name="message" rows="4" placeholder="Write the student need or question"></textarea>
          </label>
          <button class="btn primary" type="submit">Send Trial Request on WhatsApp</button>
        </form>
      </section>
    `;
  }

  function groupAccordion(group, data, expanded = false) {
    const tests = data.tests.filter((test) => test.groupId === group.id);
    return `
      <details class="accordion-card" id="${group.id}" ${expanded ? "open" : ""}>
        <summary>
          <span><strong>${escapeHTML(group.name)}</strong><small>${escapeHTML(group.description)}</small></span>
          <span class="summary-icon">+</span>
        </summary>
        <div class="accordion-body">
          <p class="planned-line">Planned coverage: ${escapeHTML(group.plannedTests.join(", "))}</p>
          <div class="card-grid compact-grid">
            ${tests.map((test) => testCard(test, data)).join("") || `<p>No active sample test yet.</p>`}
          </div>
        </div>
      </details>
    `;
  }

  function statCard(value, label) {
    return `<div class="stat-card"><strong>${value}</strong><span>${escapeHTML(label)}</span></div>`;
  }

  function pathwayCard(pathway) {
    return `
      <article class="feature-card">
        <p class="eyebrow">Pathway</p>
        <h2>${escapeHTML(pathway.title)}</h2>
        <p>${escapeHTML(pathway.bestFor)}</p>
        <ol class="clean-list">${pathway.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
        <a class="btn primary small" href="${url(pathway.primaryLink)}">Open Pathway</a>
      </article>
    `;
  }

  function announcementCard(item) {
    return `
      <article class="announcement-card">
        <span>${escapeHTML(item.type)} • ${escapeHTML(item.date)}</span>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.message)}</p>
      </article>
    `;
  }

  function faqCard(faq) {
    return `
      <details class="accordion-card" data-faq-card data-category="${escapeHTML(faq.category)}">
        <summary>
          <span><strong>${escapeHTML(faq.question)}</strong><small>${escapeHTML(faq.category)}</small></span>
          <span class="summary-icon">+</span>
        </summary>
        <div class="accordion-body">
          <p>${escapeHTML(faq.answer)}</p>
        </div>
      </details>
    `;
  }

  function formatCard(format, data) {
    const test = data.tests.find((item) => item.id === format.testId);
    const skills = format.prioritySkills.map((id) => findName(data.skills, id)).join(", ");
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(test?.name || format.testId)}</p>
        <h2>${escapeHTML(format.title)}</h2>
        <p>${escapeHTML(format.questionStyle)}</p>
        <p class="connected-line">Priority skills: ${escapeHTML(skills)}</p>
        <div class="tag-row">${format.sections.map((section) => `<span>${escapeHTML(section)}</span>`).join("")}</div>
        <div class="button-row">
          <a class="btn primary small" href="${url(`practice.html?test=${format.testId}`)}">Practice</a>
          <a class="btn secondary small" href="${url("mock-tests.html")}">Mock</a>
        </div>
      </article>
    `;
  }

  function glossaryCard(item) {
    return `
      <article class="feature-card" data-glossary-card data-category="${escapeHTML(item.category)}">
        <p class="eyebrow">${escapeHTML(item.category)}</p>
        <h2>${escapeHTML(item.term)}</h2>
        <p>${escapeHTML(item.definition)}</p>
        <p class="connected-line">Example: ${escapeHTML(item.example)}</p>
      </article>
    `;
  }

  function decisionCard(item, data) {
    const tests = item.testIds.map((id) => findName(data.tests, id)).join(", ");
    return `
      <article class="feature-card">
        <p class="eyebrow">Decision Guide</p>
        <h2>${escapeHTML(item.question)}</h2>
        <p>${escapeHTML(item.recommendation)}</p>
        <p class="connected-line">Related tests: ${escapeHTML(tests)}</p>
        <a class="btn primary small" href="${url(item.link)}">Open Recommended Route</a>
      </article>
    `;
  }

  function strategyCard(item, data) {
    const tests = item.bestFor.map((id) => findName(data.tests, id)).join(", ");
    const skill = findName(data.skills, item.skillId);
    return `
      <article class="feature-card" data-strategy-card data-category="${escapeHTML(item.category)}">
        <p class="eyebrow">${escapeHTML(item.category)} • ${escapeHTML(skill)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <ol class="clean-list">${item.steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
        <p class="connected-line">Quick tip: ${escapeHTML(item.quickTip)}</p>
        <p>Best for: ${escapeHTML(tests)}</p>
      </article>
    `;
  }

  function mistakeCard(item, data) {
    const skills = item.relatedSkillIds.map((id) => findName(data.skills, id)).join(", ");
    return `
      <article class="feature-card" data-mistake-card data-category="${escapeHTML(item.category)}">
        <p class="eyebrow">${escapeHTML(item.category)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <p><strong>Problem:</strong> ${escapeHTML(item.problem)}</p>
        <p class="connected-line">Fix: ${escapeHTML(item.fix)}</p>
        <p>Related skills: ${escapeHTML(skills)}</p>
      </article>
    `;
  }

  function dailyTaskCard(item, completed) {
    return `
      <article class="daily-task ${completed ? "done" : ""}" data-daily-task="${item.id}">
        <label>
          <input type="checkbox" data-daily-check="${item.id}" ${completed ? "checked" : ""}>
          <span>
            <strong>${escapeHTML(item.title)}</strong>
            <small>${escapeHTML(item.category)} • ${item.minutes} minutes</small>
          </span>
        </label>
        <p>${escapeHTML(item.task)}</p>
        <a class="text-link" href="${url(item.link)}">Open task</a>
      </article>
    `;
  }

  function worksheetCard(item, data) {
    const skills = item.linkedSkillIds.map((id) => findName(data.skills, id)).join(", ");
    const tests = item.linkedTestIds.map((id) => findName(data.tests, id)).join(", ");
    return `
      <article class="feature-card" data-worksheet-card data-category="${escapeHTML(item.category)}">
        <p class="eyebrow">${escapeHTML(item.category)} • ${escapeHTML(item.level)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <p class="connected-line">${item.estimatedMinutes} minutes • ${escapeHTML(item.status)}</p>
        <ul class="clean-list">${item.preview.map((point) => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
        <p>Skills: ${escapeHTML(skills)}</p>
        <p>Tests: ${escapeHTML(tests)}</p>
        <div class="button-row">
          <a class="btn primary small" href="${url("practice.html")}">Practise Online</a>
          <a class="btn ghost small" href="${url("contact.html")}">Request Printable</a>
        </div>
      </article>
    `;
  }

  function assignmentCard(item, data) {
    const test = findName(data.tests, item.targetTestId);
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(test)} • ${escapeHTML(item.duration)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <ol class="clean-list">${item.tasks.map((task) => `<li>${escapeHTML(task)}</li>`).join("")}</ol>
        <p class="connected-line">Submission: ${escapeHTML(item.submissionMode)}</p>
        <p>Teacher note: ${escapeHTML(item.teacherNote)}</p>
      </article>
    `;
  }

  function scoreBandCard(item) {
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(item.range)}</p>
        <h2>${escapeHTML(item.label)}</h2>
        <p>${escapeHTML(item.meaning)}</p>
        <p class="connected-line">Next step: ${escapeHTML(item.nextStep)}</p>
      </article>
    `;
  }

  function roadmapCard(item) {
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(item.phase)} • ${escapeHTML(item.status)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.focus)}</p>
        <ol class="clean-list">${item.nextActions.map((action) => `<li>${escapeHTML(action)}</li>`).join("")}</ol>
      </article>
    `;
  }

  function changelogCard(item) {
    return `
      <article class="announcement-card">
        <span>${escapeHTML(item.version)} • ${escapeHTML(item.date)}</span>
        <h2>${escapeHTML(item.version)}</h2>
        <p>${escapeHTML(item.summary)}</p>
      </article>
    `;
  }

  function contributorGuideCard(item) {
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(item.category)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <ul class="clean-list">${item.guidelines.map((guide) => `<li>${escapeHTML(guide)}</li>`).join("")}</ul>
      </article>
    `;
  }

  function questionTargetRow(item, data) {
    return `
      <tr>
        <td>${escapeHTML(item.priority)}</td>
        <td>${escapeHTML(findName(data.tests, item.testId))}</td>
        <td>${escapeHTML(findName(data.skills, item.skillId))}</td>
        <td>${escapeHTML(findName(data.topics, item.topicId))}</td>
        <td>${item.currentSampleCount}</td>
        <td>${item.targetCount}</td>
      </tr>
    `;
  }

  function vocabularyCard(item, data) {
    const tests = item.connectedTestIds.map((id) => findName(data.tests, id)).join(", ");
    return `
      <article class="feature-card" data-vocab-card data-category="${escapeHTML(item.level)}">
        <p class="eyebrow">${escapeHTML(item.level)}</p>
        <h2>${escapeHTML(item.word)}</h2>
        <p>${escapeHTML(item.meaning)}</p>
        <p><strong>Synonyms:</strong> ${escapeHTML(item.synonyms.join(", "))}</p>
        <p><strong>Antonyms:</strong> ${escapeHTML(item.antonyms.join(", "))}</p>
        <p class="connected-line">Example: ${escapeHTML(item.example)}</p>
        <p>Connected tests: ${escapeHTML(tests)}</p>
      </article>
    `;
  }

  function formulaCard(item, data) {
    const subject = findName(data.subjects, item.subjectId);
    const topic = findName(data.topics, item.topicId);
    const tests = item.connectedTestIds.map((id) => findName(data.tests, id)).join(", ");
    return `
      <article class="feature-card" data-formula-card data-category="${escapeHTML(subject)}">
        <p class="eyebrow">${escapeHTML(subject)} • ${escapeHTML(topic)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <p class="formula-box">${escapeHTML(item.formula)}</p>
        <p>${escapeHTML(item.useCase)}</p>
        <p class="connected-line">Example: ${escapeHTML(item.example)}</p>
        <p>Connected tests: ${escapeHTML(tests)}</p>
      </article>
    `;
  }

  function questionSetCard(item, data) {
    const test = findName(data.tests, item.testId);
    const skills = item.skillIds.map((id) => findName(data.skills, id)).join(", ");
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(test)} • ${item.recommendedMinutes} minutes</p>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.purpose)}</p>
        <p class="connected-line">Skills: ${escapeHTML(skills)}</p>
        <p>Questions: ${escapeHTML(item.questionIds.join(", "))}</p>
        <a class="btn primary small" href="${url(`practice.html?test=${item.testId}`)}">Practise This Route</a>
      </article>
    `;
  }

  function diagnosticQuestionCard(item, index, data) {
    const skill = findName(data.skills, item.skillId);
    const topic = findName(data.topics, item.topicId);
    return `
      <article class="question-card" data-diagnostic-question="${item.id}">
        <div class="meta-row">
          <span>Question ${index + 1}</span>
          <span>${escapeHTML(skill)}</span>
          <span>${escapeHTML(item.difficulty)}</span>
        </div>
        <h2>${escapeHTML(item.stem)}</h2>
        <div class="options-grid">
          ${item.options.map((option, optionIndex) => `
            <label class="option selectable-option">
              <input type="radio" name="${item.id}" value="${optionIndex}">
              <span>${escapeHTML(option)}</span>
            </label>
          `).join("")}
        </div>
        <p class="connected-line">${escapeHTML(topic)} • ${escapeHTML(item.levelSignal)}</p>
        <p class="hint" data-diagnostic-feedback="${item.id}" hidden>${escapeHTML(item.explanation)}</p>
      </article>
    `;
  }

  function flashcardCard(item, data, mastered) {
    const skill = findName(data.skills, item.skillId);
    const topic = findName(data.topics, item.topicId);
    const tests = item.connectedTestIds.map((id) => findName(data.tests, id)).join(", ");
    return `
      <article class="feature-card flashcard ${mastered ? "done" : ""}" data-flashcard-card data-category="${escapeHTML(item.category)}" data-flashcard-id="${item.id}">
        <p class="eyebrow">${escapeHTML(item.category)} • ${escapeHTML(item.level)}</p>
        <h2>${escapeHTML(item.front)}</h2>
        <details class="mini-details">
          <summary>Show Answer</summary>
          <p>${escapeHTML(item.back)}</p>
        </details>
        <p class="connected-line">${escapeHTML(skill)} • ${escapeHTML(topic)}</p>
        <p>Connected tests: ${escapeHTML(tests)}</p>
        <label class="mastery-check">
          <input type="checkbox" data-flashcard-mastered="${item.id}" ${mastered ? "checked" : ""}>
          <span>Mark as mastered</span>
        </label>
      </article>
    `;
  }

  function errorPromptCard(item, data) {
    const skills = item.relatedSkillIds.map((id) => findName(data.skills, id)).join(", ");
    return `
      <article class="feature-card">
        <p class="eyebrow">${escapeHTML(item.category)}</p>
        <h2>${escapeHTML(item.title)}</h2>
        <p>${escapeHTML(item.diagnosis)}</p>
        <p class="connected-line">Correction: ${escapeHTML(item.correctionPrompt)}</p>
        <p>Related skills: ${escapeHTML(skills)}</p>
        <a class="btn secondary small" href="${url(item.actionLink)}">Open Action</a>
      </article>
    `;
  }

  function premiumNoteCard(note, data) {
    const subject = findName(data.subjects, note.subjectId);
    const tests = note.testIds.map((id) => findName(data.tests, id)).join(", ");
    const topics = note.topicIds.map((id) => findName(data.topics, id)).join(", ");
    const message = encodeURIComponent(note.whatsappText);
    return `
      <article class="feature-card note-card" data-premium-note data-category="${escapeHTML(subject)}">
        <p class="eyebrow">${escapeHTML(note.access)} • ${escapeHTML(subject)}</p>
        <h2>${escapeHTML(note.title)}</h2>
        <p>${escapeHTML(note.summary)}</p>
        <p class="price">${escapeHTML(note.price)}</p>
        <p class="connected-line">Tests: ${escapeHTML(tests)}</p>
        <p>Topics: ${escapeHTML(topics)}</p>
        <div class="note-preview">
          ${note.previewSections.map((section) => `
            <section>
              <h3>${escapeHTML(section.heading)}</h3>
              <p>${escapeHTML(section.body)}</p>
            </section>
          `).join("")}
        </div>
        <details class="mini-details">
          <summary>Premium Includes</summary>
          <ul>${note.premiumIncludes.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </details>
        <div class="button-row">
          <a class="btn primary small" href="https://wa.me/${WHATSAPP_NUMBER}?text=${message}" target="_blank" rel="noopener">Ask / Purchase on WhatsApp</a>
          <a class="btn ghost small" href="${url(`resources.html#${note.resourceId}`)}">Related Resource</a>
        </div>
      </article>
    `;
  }

  function testCard(test, data) {
    const skills = test.skillIds.map((id) => findName(data.skills, id)).join(", ");
    const subjects = test.subjectIds.map((id) => findName(data.subjects, id)).join(", ");
    return `
      <article class="feature-card" id="${test.id}">
        <p class="eyebrow">${escapeHTML(test.fullName)}</p>
        <h2>${escapeHTML(test.name)}</h2>
        <p>${escapeHTML(test.description)}</p>
        <p class="connected-line">Skills: ${escapeHTML(skills)} • Subjects: ${escapeHTML(subjects)}</p>
        <details class="mini-details">
          <summary>Format and sections</summary>
          <ul>${test.format.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </details>
        <div class="button-row">
          <a class="btn primary small" href="${url(`practice.html?test=${test.id}`)}">Practice</a>
          <a class="btn secondary small" href="${url("mock-tests.html")}">Mock</a>
          <a class="btn ghost small" href="${url("resources.html")}">Resources</a>
        </div>
      </article>
    `;
  }

  function skillCard(skill, data, includeActions = false) {
    const tests = skill.connectedTestIds.map((id) => findName(data.tests, id)).join(", ");
    return `
      <article class="feature-card" id="${skill.id}">
        <p class="eyebrow">${escapeHTML(skill.category)}</p>
        <h2>${escapeHTML(skill.name)}</h2>
        <p>${escapeHTML(skill.description)}</p>
        <p class="connected-line">Connected tests: ${escapeHTML(tests)}</p>
        <div class="tag-row">${skill.practiceModes.map((mode) => `<span>${escapeHTML(mode)}</span>`).join("")}</div>
        ${includeActions ? `<div class="button-row"><a class="btn primary small" href="${url(`practice.html?skill=${skill.id}`)}">Skill Practice</a><a class="btn secondary small" href="${url("mock-tests.html")}">Skill Mock</a></div>` : ""}
      </article>
    `;
  }

  function resourceCard(resource) {
    const isPremium = resource.type.toLowerCase().includes("premium");
    const message = encodeURIComponent(resource.whatsappText);
    return `
      <article class="feature-card resource-card" id="${resource.id}" data-resource-card data-category="${escapeHTML(resource.category)}" data-access="${escapeHTML(resource.access)}" data-search="${escapeHTML(`${resource.title} ${resource.category} ${resource.type} ${resource.access} ${resource.format} ${resource.testIds.join(" ")} ${resource.subjectIds.join(" ")}`.toLowerCase())}">
        <p class="eyebrow">${escapeHTML(resource.category)}</p>
        <h2>${escapeHTML(resource.title)}</h2>
        <p>${escapeHTML(resource.type)} • ${escapeHTML(resource.access)} • ${escapeHTML(resource.format)}</p>
        <p class="price">${escapeHTML(resource.price)}</p>
        <div class="button-row">
          <button class="btn secondary small" data-preview="${resource.id}" type="button">View Preview</button>
          <a class="btn ${isPremium ? "primary" : "ghost"} small" href="https://wa.me/${WHATSAPP_NUMBER}?text=${message}" target="_blank" rel="noopener">${isPremium ? "Purchase on WhatsApp" : "Ask on WhatsApp"}</a>
        </div>
      </article>
    `;
  }

  function wireResourceButtons(data) {
    const dialog = document.querySelector("#resourceDialog");
    if (!dialog) return;
    document.querySelectorAll("[data-preview]").forEach((button) => {
      button.addEventListener("click", () => {
        const resource = data.resources.find((item) => item.id === button.dataset.preview);
        document.querySelector("#resourceDialogContent").innerHTML = `
          <p class="eyebrow">${escapeHTML(resource.access)}</p>
          <h2>${escapeHTML(resource.title)}</h2>
          <ul class="clean-list">${resource.preview.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        `;
        dialog.showModal();
      });
    });
    document.querySelector("[data-close-dialog]")?.addEventListener("click", () => dialog.close());
  }

  function wireResourceFilters() {
    const category = document.querySelector("#resourceCategory");
    const access = document.querySelector("#resourceAccess");
    const search = document.querySelector("#resourceSearch");
    if (!category || !access || !search) return;
    const filter = () => {
      const selectedCategory = category.value;
      const selectedAccess = access.value;
      const term = search.value.trim().toLowerCase();
      document.querySelectorAll("[data-resource-card]").forEach((card) => {
        const categoryOk = selectedCategory === "all" || card.dataset.category === selectedCategory;
        const accessOk = selectedAccess === "all" || card.dataset.access === selectedAccess;
        const searchOk = !term || card.dataset.search.includes(term);
        card.hidden = !(categoryOk && accessOk && searchOk);
      });
    };
    [category, access, search].forEach((control) => control.addEventListener("input", filter));
    category.addEventListener("change", filter);
    access.addEventListener("change", filter);
  }

  function wireTrialForm() {
    const form = document.querySelector("#trialForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const lines = [
        "Assalamualaikum, I want to book a trial class.",
        `Student Name: ${data.get("studentName")}`,
        `Class / Level: ${data.get("level")}`,
        `Target Test: ${data.get("targetTest")}`,
        `City: ${data.get("city")}`,
        `WhatsApp Number: ${data.get("whatsapp")}`,
        `Preferred Time: ${data.get("preferredTime")}`,
        `Mode: ${data.get("mode")}`,
        `Message: ${data.get("message")}`
      ];
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
    });
  }

  function wireShareTools() {
    const button = document.querySelector("[data-copy-link]");
    if (!button) return;
    button.addEventListener("click", async () => {
      const status = document.querySelector("#copyStatus");
      try {
        await navigator.clipboard.writeText(button.dataset.copyLink);
        if (status) status.textContent = "Link copied.";
      } catch {
        if (status) status.textContent = "Copy failed. Select and copy the link manually.";
      }
    });
  }

  function wireDailyChecklist() {
    const controls = document.querySelectorAll("[data-daily-check]");
    if (!controls.length) return;
    const key = "ah-daily-checklist";
    const read = () => JSON.parse(localStorage.getItem(key) || "{}");
    const write = (value) => localStorage.setItem(key, JSON.stringify(value));
    controls.forEach((control) => {
      control.addEventListener("change", () => {
        const current = read();
        current[control.dataset.dailyCheck] = control.checked;
        write(current);
        const card = document.querySelector(`[data-daily-task="${control.dataset.dailyCheck}"]`);
        if (card) card.classList.toggle("done", control.checked);
      });
    });
    document.querySelector("#resetDailyChecklist")?.addEventListener("click", () => {
      localStorage.removeItem(key);
      controls.forEach((control) => {
        control.checked = false;
        const card = document.querySelector(`[data-daily-task="${control.dataset.dailyCheck}"]`);
        if (card) card.classList.remove("done");
      });
    });
  }

  function wireDiagnosticQuiz(data) {
    const scoreButton = document.querySelector("#scoreDiagnostic");
    const resetButton = document.querySelector("#resetDiagnostic");
    const result = document.querySelector("#diagnosticResult");
    if (!scoreButton || !result) return;

    scoreButton.addEventListener("click", () => {
      let score = 0;
      const skillTotals = {};
      const skillCorrect = {};

      data.diagnosticQuiz.forEach((item) => {
        const selected = document.querySelector(`input[name="${item.id}"]:checked`);
        const chosen = selected ? Number(selected.value) : -1;
        const correct = chosen === item.answerIndex;
        const skill = findName(data.skills, item.skillId);
        skillTotals[skill] = (skillTotals[skill] || 0) + 1;
        skillCorrect[skill] = (skillCorrect[skill] || 0) + (correct ? 1 : 0);
        score += correct ? 1 : 0;

        const card = document.querySelector(`[data-diagnostic-question="${item.id}"]`);
        const feedback = document.querySelector(`[data-diagnostic-feedback="${item.id}"]`);
        if (card) card.classList.toggle("done", correct);
        if (feedback) {
          feedback.hidden = false;
          feedback.textContent = `${correct ? "Correct." : "Review this."} ${item.explanation}`;
        }
      });

      const weakSkills = Object.keys(skillTotals).filter((skill) => skillCorrect[skill] < skillTotals[skill]);
      const nextStep = weakSkills.length
        ? `Revise: ${weakSkills.join(", ")}.`
        : "Strong start. Move to timed practice and mocks.";
      const payload = { score, total: data.diagnosticQuiz.length, weakSkills, date: new Date().toISOString() };
      localStorage.setItem("ah-diagnostic-result", JSON.stringify(payload));
      result.innerHTML = `
        <h2>Diagnostic Result: ${score}/${data.diagnosticQuiz.length}</h2>
        <p>${escapeHTML(nextStep)}</p>
        <div class="button-row">
          <a class="btn primary small" href="${url("practice.html")}">Start Practice</a>
          <a class="btn secondary small" href="${url("error-log.html")}">Open Error Log</a>
        </div>
      `;
    });

    resetButton?.addEventListener("click", () => {
      localStorage.removeItem("ah-diagnostic-result");
      document.querySelectorAll("[data-diagnostic-question]").forEach((card) => card.classList.remove("done"));
      document.querySelectorAll("[data-diagnostic-feedback]").forEach((feedback) => {
        feedback.hidden = true;
        feedback.textContent = "";
      });
      document.querySelectorAll("input[type='radio']").forEach((input) => {
        input.checked = false;
      });
      result.innerHTML = "";
    });
  }

  function wireFlashcards() {
    const controls = document.querySelectorAll("[data-flashcard-mastered]");
    if (!controls.length) return;
    const key = "ah-flashcard-mastered";
    controls.forEach((control) => {
      control.addEventListener("change", () => {
        const current = readJSON(key, {});
        current[control.dataset.flashcardMastered] = control.checked;
        localStorage.setItem(key, JSON.stringify(current));
        const card = document.querySelector(`[data-flashcard-id="${control.dataset.flashcardMastered}"]`);
        if (card) card.classList.toggle("done", control.checked);
      });
    });
  }

  function wireErrorLog(data) {
    const form = document.querySelector("#errorLogForm");
    const rows = document.querySelector("#errorLogRows");
    const clear = document.querySelector("#clearErrorLog");
    if (!form || !rows) return;
    const key = "ah-error-log";

    const renderRows = () => {
      const entries = readJSON(key, []);
      rows.innerHTML = entries.length
        ? entries.map((entry) => `
          <tr>
            <td>${escapeHTML(findName(data.skills, entry.skillId))}</td>
            <td>${escapeHTML(entry.questionRef)}</td>
            <td>${escapeHTML(entry.cause)}</td>
            <td>${escapeHTML(entry.plan)}</td>
            <td>${escapeHTML(new Date(entry.date).toLocaleDateString())}</td>
          </tr>
        `).join("")
        : `<tr><td colspan="5">No saved mistakes yet. Add one after practice or mocks.</td></tr>`;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const entries = readJSON(key, []);
      entries.unshift({
        skillId: formData.get("skillId"),
        questionRef: formData.get("questionRef"),
        cause: formData.get("cause"),
        plan: formData.get("plan"),
        date: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(entries.slice(0, 30)));
      form.reset();
      renderRows();
    });

    clear?.addEventListener("click", () => {
      localStorage.removeItem(key);
      renderRows();
    });

    renderRows();
  }

  function wireSimpleCardFilter(categorySelector, searchSelector, cardSelector) {
    const category = document.querySelector(categorySelector);
    const search = document.querySelector(searchSelector);
    if (!category || !search) return;
    const filter = () => {
      const selected = category.value;
      const term = search.value.trim().toLowerCase();
      document.querySelectorAll(cardSelector).forEach((card) => {
        const categoryOk = selected === "all" || card.dataset.category === selected;
        const textOk = !term || card.textContent.toLowerCase().includes(term);
        card.hidden = !(categoryOk && textOk);
      });
    };
    category.addEventListener("change", filter);
    search.addEventListener("input", filter);
  }

  function wireAccordions() {
    document.querySelectorAll(".accordion-card").forEach((details) => {
      details.addEventListener("toggle", () => {
        const icon = details.querySelector(".summary-icon");
        if (icon) icon.textContent = details.open ? "−" : "+";
      });
    });
  }

  function pageHero(label, title, copy) {
    return `
      <section class="page-hero compact">
        <div>
          <p class="eyebrow">${escapeHTML(label)}</p>
          <h1>${escapeHTML(title)}</h1>
          <p>${escapeHTML(copy)}</p>
        </div>
      </section>
    `;
  }

  function actionCard(title, copy, href) {
    return `<a class="action-card" href="${url(href)}"><strong>${escapeHTML(title)}</strong><span>${escapeHTML(copy)}</span></a>`;
  }

  function navLink(label, href) {
    return `<a href="${url(href)}">${label}</a>`;
  }

  function navDropdown(label, items) {
    return `
      <details class="nav-dropdown">
        <summary>${label}</summary>
        <div class="dropdown-panel">
          ${items.map(([title, copy, href]) => `
            <a href="${url(href)}">
              <strong>${escapeHTML(title)}</strong>
              <span>${escapeHTML(copy)}</span>
            </a>
          `).join("")}
        </div>
      </details>
    `;
  }

  function input(name, label, type, required) {
    return `<label>${label}<input name="${name}" type="${type}" ${required ? "required" : ""}></label>`;
  }

  function url(path) {
    return window.AHData.rootUrl(path);
  }

  function findName(items, id) {
    return items.find((item) => item.id === id)?.name || id;
  }

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
