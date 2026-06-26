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
      ...(data.announcements || []).map((item) => record("Announcement", item.title, `${item.type} ${item.message}`, "index.html"))
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
