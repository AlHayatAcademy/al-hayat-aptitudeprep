(function () {
  function initPracticeEngine(data, mount, filters = {}) {
    const params = new URLSearchParams(window.location.search);
    const state = {
      testId: filters.testId || params.get("test") || "all",
      skillId: filters.skillId || params.get("skill") || "all",
      subjectId: filters.subjectId || params.get("subject") || "all",
      responses: {}
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
      state.responses = {};
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
      const attempted = Object.values(state.responses).filter((item) => item.attempted).length;
      const correct = Object.values(state.responses).filter((item) => item.correct).length;
      mount.querySelector("#practiceStats").innerHTML = `
        ${metric("Questions", questions.length)}
        ${metric("Attempted", attempted)}
        ${metric("Correct", correct)}
      `;
      mount.querySelector("#questionList").innerHTML = questions.length
        ? questions.map((question, index) => questionCard(question, questions[index + 1])).join("")
        : `<div class="empty-state"><h2>No questions found</h2><p>Add matching records in <code>data/questions.json</code> or clear the filters.</p></div>`;

      mount.querySelectorAll("[data-select-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const question = data.questions.find((item) => item.id === button.dataset.question);
          const chosen = Number(button.dataset.answer);
          const current = state.responses[question.id] || {};
          if (current.attempted) return;
          state.responses[question.id] = { ...current, chosen, attempted: false };
          render();
        });
      });

      mount.querySelectorAll("[data-attempt-question]").forEach((button) => {
        button.addEventListener("click", () => {
          const question = data.questions.find((item) => item.id === button.dataset.attemptQuestion);
          const current = state.responses[question.id] || {};
          if (current.chosen === undefined || current.attempted) return;
          const correct = current.chosen === question.answerIndex;
          state.responses[question.id] = { ...current, attempted: true, correct };
          savePracticeAttempt(question, correct);
          render();
        });
      });

      mount.querySelectorAll("[data-toggle-panel]").forEach((button) => {
        button.addEventListener("click", () => {
          const target = mount.querySelector(`#${button.dataset.togglePanel}`);
          target.hidden = !target.hidden;
        });
      });

      mount.querySelectorAll("[data-next-question]").forEach((button) => {
        button.addEventListener("click", () => {
          const target = mount.querySelector(`#${button.dataset.nextQuestion}`);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    function questionCard(question, nextQuestion) {
      const response = state.responses[question.id] || {};
      const selected = response.chosen;
      const attempted = Boolean(response.attempted);
      const topicRecord = data.topics.find((item) => item.id === question.topicId);
      const topic = topicRecord?.name || question.topicId;
      const optionButtons = question.options.map((option, index) => {
        const isSelected = selected === index;
        const isAnswer = attempted && index === question.answerIndex;
        const isWrongSelection = attempted && isSelected && index !== question.answerIndex;
        const resultClass = [
          isSelected ? "selected" : "",
          isAnswer ? "correct" : "",
          isWrongSelection ? "wrong" : "",
          attempted && !isSelected && !isAnswer ? "muted" : ""
        ].filter(Boolean).join(" ");
        return `<button class="option ${resultClass}" data-question="${question.id}" data-answer="${index}" data-select-answer type="button" ${attempted ? "disabled" : ""}>${escapeHTML(option)}</button>`;
      }).join("");
      const result = !attempted
        ? `<p class="hint">${selected === undefined ? "Select one option, then click Attempt." : "Option selected. Click Attempt to check."}</p>`
        : `<p class="${response.correct ? "success-text" : "danger-text"}">${response.correct ? "Correct." : "Not correct."}</p>`;
      const answerText = question.options[question.answerIndex];
      return `
        <article class="question-card" id="practice-${question.id}">
          <div class="meta-row">
            <span>${escapeHTML(topic)}</span>
            <span>${escapeHTML(question.difficulty)}</span>
            <span>${escapeHTML(question.examStyle)}</span>
          </div>
          <h2>${escapeHTML(question.stem)}</h2>
          <div class="options-grid">${optionButtons}</div>
          ${result}
          <div class="button-row practice-actions">
            <button class="btn primary small" data-attempt-question="${question.id}" type="button" ${selected === undefined || attempted ? "disabled" : ""}>Attempt</button>
            <button class="btn secondary small" data-toggle-panel="answer-${question.id}" type="button" ${attempted ? "" : "disabled"}>Show Answer</button>
            <button class="btn ghost small" data-toggle-panel="explanation-${question.id}" type="button" ${attempted ? "" : "disabled"}>Explanation</button>
            <button class="btn ghost small" data-toggle-panel="urdu-${question.id}" type="button" ${attempted ? "" : "disabled"}>اردو وضاحت</button>
            <button class="btn ghost small" data-next-question="practice-${nextQuestion?.id || question.id}" type="button" ${nextQuestion ? "" : "disabled"}>Next Question</button>
            <a class="btn ghost small" href="${rootUrl(`topic-study.html?topic=${question.topicId}`)}">Study Topic</a>
          </div>
          <div id="answer-${question.id}" class="practice-panel answer-panel" hidden>
            <strong>Answer:</strong> ${escapeHTML(answerText)}
          </div>
          <div id="explanation-${question.id}" class="practice-panel" hidden>
            <strong>Explanation:</strong> ${escapeHTML(question.explanation)}
          </div>
          <div id="urdu-${question.id}" class="urdu-note" hidden>${escapeHTML(question.urduExplanation)}</div>
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

  function rootUrl(path) {
    return window.AHData.rootUrl(path);
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
