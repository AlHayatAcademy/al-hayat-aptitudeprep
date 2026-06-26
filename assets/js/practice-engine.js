(function () {
  function initPracticeEngine(data, mount, filters = {}) {
    const params = new URLSearchParams(window.location.search);
    const state = {
      testId: filters.testId || params.get("test") || "all",
      skillId: filters.skillId || params.get("skill") || "all",
      subjectId: filters.subjectId || params.get("subject") || "all",
      answers: {}
    };

    const testOptions = optionList(data.tests, "All tests");
    const skillOptions = optionList(data.skills, "All skills");
    const subjectOptions = optionList(data.subjects, "All subjects");

    mount.innerHTML = `
      <section class="page-hero compact">
        <div>
          <p class="eyebrow">Practice Engine</p>
          <h1>Practice by Test, Skill or Subject</h1>
          <p>Use small filtered sets now. Later, the same engine can hold thousands of tagged questions.</p>
        </div>
      </section>
      <section class="toolbar-panel" aria-label="Practice filters">
        <label>Test <select id="practiceTest">${testOptions}</select></label>
        <label>Skill <select id="practiceSkill">${skillOptions}</select></label>
        <label>Subject <select id="practiceSubject">${subjectOptions}</select></label>
        <button class="btn primary" id="resetPractice" type="button">Reset Answers</button>
      </section>
      <section class="split-layout">
        <aside class="side-panel">
          <h2>Practice Summary</h2>
          <div id="practiceStats" class="metric-stack"></div>
        </aside>
        <div id="questionList" class="question-list"></div>
      </section>
    `;

    const testSelect = mount.querySelector("#practiceTest");
    const skillSelect = mount.querySelector("#practiceSkill");
    const subjectSelect = mount.querySelector("#practiceSubject");

    testSelect.value = state.testId;
    skillSelect.value = state.skillId;
    subjectSelect.value = state.subjectId;

    [testSelect, skillSelect, subjectSelect].forEach((select) => {
      select.addEventListener("change", () => {
        state.testId = testSelect.value;
        state.skillId = skillSelect.value;
        state.subjectId = subjectSelect.value;
        render();
      });
    });

    mount.querySelector("#resetPractice").addEventListener("click", () => {
      state.answers = {};
      render();
    });

    function filteredQuestions() {
      return data.questions.filter((question) => {
        const testOk = state.testId === "all" || question.testIds.includes(state.testId);
        const skillOk = state.skillId === "all" || question.skillId === state.skillId;
        const subjectOk = state.subjectId === "all" || question.subjectId === state.subjectId;
        return question.status === "published" && testOk && skillOk && subjectOk;
      });
    }

    function render() {
      const questions = filteredQuestions();
      const correct = Object.values(state.answers).filter(Boolean).length;
      mount.querySelector("#practiceStats").innerHTML = `
        ${metric("Questions", questions.length)}
        ${metric("Answered", Object.keys(state.answers).length)}
        ${metric("Correct", correct)}
      `;
      mount.querySelector("#questionList").innerHTML = questions.length
        ? questions.map(questionCard).join("")
        : `<div class="empty-state"><h2>No questions found</h2><p>Add matching records in <code>data/questions.json</code> or clear the filters.</p></div>`;

      mount.querySelectorAll("[data-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const question = data.questions.find((item) => item.id === button.dataset.question);
          const chosen = Number(button.dataset.answer);
          state.answers[question.id] = chosen === question.answerIndex;
          savePracticeAttempt(question, state.answers[question.id]);
          render();
        });
      });

      mount.querySelectorAll("[data-toggle-urdu]").forEach((button) => {
        button.addEventListener("click", () => {
          const target = mount.querySelector(`#${button.dataset.toggleUrdu}`);
          target.hidden = !target.hidden;
        });
      });
    }

    function questionCard(question) {
      const selected = state.answers[question.id];
      const topic = data.topics.find((item) => item.id === question.topicId)?.name || question.topicId;
      const optionButtons = question.options.map((option, index) => {
        const isAnswer = index === question.answerIndex;
        const resultClass = selected === undefined ? "" : isAnswer ? "correct" : "muted";
        return `<button class="option ${resultClass}" data-question="${question.id}" data-answer="${index}" type="button">${escapeHTML(option)}</button>`;
      }).join("");
      const result = selected === undefined
        ? `<p class="hint">Select one option to check your answer.</p>`
        : `<p class="${selected ? "success-text" : "danger-text"}">${selected ? "Correct." : "Not correct yet."} ${escapeHTML(question.explanation)}</p>`;
      return `
        <article class="question-card">
          <div class="meta-row">
            <span>${escapeHTML(topic)}</span>
            <span>${escapeHTML(question.difficulty)}</span>
            <span>${escapeHTML(question.examStyle)}</span>
          </div>
          <h2>${escapeHTML(question.stem)}</h2>
          <div class="options-grid">${optionButtons}</div>
          ${result}
          <button class="btn ghost small" data-toggle-urdu="urdu-${question.id}" type="button">Urdu Explanation</button>
          <p id="urdu-${question.id}" class="urdu-note" hidden>${escapeHTML(question.urduExplanation)}</p>
        </article>
      `;
    }

    function renderInitialFromParams() {
      render();
    }

    renderInitialFromParams();
  }

  function optionList(items, allLabel) {
    return [`<option value="all">${allLabel}</option>`]
      .concat(items.map((item) => `<option value="${item.id}">${escapeHTML(item.name)}</option>`))
      .join("");
  }

  function metric(label, value) {
    return `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`;
  }

  function savePracticeAttempt(question, correct) {
    const key = "ah-aptitude-progress";
    const current = JSON.parse(localStorage.getItem(key) || "{}");
    const topic = current[question.topicId] || { attempts: 0, correct: 0 };
    topic.attempts += 1;
    topic.correct += correct ? 1 : 0;
    current[question.topicId] = topic;
    localStorage.setItem(key, JSON.stringify(current));
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AHPractice = { initPracticeEngine };
})();
