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
      "study-plans": renderStudyPlans,
      progress: renderProgress,
      reviews: renderReviews,
      media: renderMedia,
      about: renderAbout,
      contact: renderContact,
      trial: renderTrial,
      search: () => window.AHSearch.initSearchEngine(data, app)
    };
    (routes[page] || renderHome)(data);
    wireAccordions();
    wireResourceButtons(data);
    wireTrialForm();
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
            ["Book Trial Class", "Online or physical class lead form", "book-trial-class.html"],
            ["Reviews", "Student feedback and success stories", "reviews.html"],
            ["Media", "YouTube, Facebook, Instagram, TikTok", "media.html"],
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
    app.innerHTML = `
      ${pageHero("Resources", "Free Resources And Premium Notes", "Show a limited preview first, then guide interested students to WhatsApp purchase or counselling.")}
      <section class="card-grid">
        ${data.resources.map((resource) => resourceCard(resource)).join("")}
      </section>
      <dialog id="resourceDialog" class="preview-dialog">
        <button class="dialog-close" data-close-dialog type="button" aria-label="Close preview">×</button>
        <div id="resourceDialogContent"></div>
      </dialog>
    `;
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

  function renderAbout() {
    app.innerHTML = `
      ${pageHero("About", "A Connected Aptitude Learning System", "Al-Hayat AptitudePrep is designed as a clean, expandable preparation hub rather than disconnected pages.")}
      <section class="content-band">
        <h2>Mission</h2>
        <p>To help students prepare for entry tests through clear concepts, exam-oriented practice, timed mocks, premium notes and guided trial classes.</p>
        <h2>Teaching Model</h2>
        <p>The platform connects every test to its required skills, subjects, topics, question bank, resources and mock tests. Shared skills are reused through tags so students do not waste time studying the same material in separate places.</p>
        <h2>Version 1 Focus</h2>
        <p>This build creates the full structure with small sample data. Future updates can add full question banks, real notes, media playlists and complete test patterns.</p>
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
          <p>Replace the placeholder number in <code>assets/js/app.js</code> with your real number.</p>
          <a class="btn primary" href="https://wa.me/${WHATSAPP_NUMBER}?text=${message}" target="_blank" rel="noopener">Message on WhatsApp</a>
        </article>
        <article class="feature-card">
          <h2>Email</h2>
          <p>Add your official email here when ready.</p>
          <p class="connected-line">Email: To be added</p>
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
      <article class="feature-card resource-card" id="${resource.id}">
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

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
