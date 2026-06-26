(function () {
  function initMockEngine(data, mount) {
    let activeMock = null;
    let answers = {};
    let timer = null;
    let secondsLeft = 0;

    renderPicker();

    function renderPicker() {
      clearInterval(timer);
      mount.innerHTML = `
        <section class="page-hero compact">
          <div>
            <p class="eyebrow">Mock Tests</p>
            <h1>Start a Timed Sample Mock</h1>
            <p>Version 1 includes short sample mocks. Add more question IDs in <code>data/mocks.json</code> for full simulations.</p>
          </div>
        </section>
        <section class="card-grid">
          ${data.mocks.map(mockCard).join("")}
        </section>
      `;
      mount.querySelectorAll("[data-start-mock]").forEach((button) => {
        button.addEventListener("click", () => startMock(button.dataset.startMock));
      });
    }

    function mockCard(mock) {
      const test = data.tests.find((item) => item.id === mock.testId);
      return `
        <article class="feature-card">
          <p class="eyebrow">${escapeHTML(mock.mockType)}</p>
          <h2>${escapeHTML(mock.title)}</h2>
          <p>${escapeHTML(test?.name || mock.testId)} • ${escapeHTML(mock.section)}</p>
          <div class="meta-row"><span>${mock.durationMinutes} minutes</span><span>${mock.questionIds.length} sample question</span></div>
          <button class="btn primary" data-start-mock="${mock.id}" type="button">Start Mock</button>
        </article>
      `;
    }

    function startMock(mockId) {
      activeMock = data.mocks.find((mock) => mock.id === mockId);
      answers = {};
      secondsLeft = activeMock.durationMinutes * 60;
      renderMock();
      timer = setInterval(() => {
        secondsLeft -= 1;
        const clock = mount.querySelector("#mockClock");
        if (clock) clock.textContent = formatTime(secondsLeft);
        if (secondsLeft <= 0) submitMock();
      }, 1000);
    }

    function renderMock() {
      const questions = getMockQuestions();
      mount.innerHTML = `
        <section class="toolbar-panel sticky-tools">
          <div>
            <p class="eyebrow">${escapeHTML(activeMock.mockType)}</p>
            <h1>${escapeHTML(activeMock.title)}</h1>
          </div>
          <div class="timer" id="mockClock">${formatTime(secondsLeft)}</div>
          <button class="btn primary" id="submitMock" type="button">Submit Mock</button>
        </section>
        <section class="instruction-box">
          ${activeMock.instructions.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}
        </section>
        <section class="question-list">
          ${questions.map(mockQuestionCard).join("")}
        </section>
      `;

      mount.querySelector("#submitMock").addEventListener("click", submitMock);
      mount.querySelectorAll("[data-mock-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          answers[button.dataset.question] = Number(button.dataset.mockAnswer);
          renderAnswerStates();
        });
      });
    }

    function mockQuestionCard(question, index) {
      return `
        <article class="question-card">
          <div class="meta-row"><span>Question ${index + 1}</span><span>${escapeHTML(question.examStyle)}</span></div>
          <h2>${escapeHTML(question.stem)}</h2>
          <div class="options-grid">
            ${question.options.map((option, optionIndex) => `
              <button class="option" data-question="${question.id}" data-mock-answer="${optionIndex}" type="button">${escapeHTML(option)}</button>
            `).join("")}
          </div>
        </article>
      `;
    }

    function renderAnswerStates() {
      mount.querySelectorAll("[data-mock-answer]").forEach((button) => {
        const chosen = answers[button.dataset.question];
        button.classList.toggle("selected", chosen === Number(button.dataset.mockAnswer));
      });
    }

    function submitMock() {
      clearInterval(timer);
      const questions = getMockQuestions();
      const score = questions.filter((question) => answers[question.id] === question.answerIndex).length;
      saveMockAttempt(activeMock, score, questions.length);
      mount.innerHTML = `
        <section class="page-hero compact">
          <div>
            <p class="eyebrow">Result</p>
            <h1>${escapeHTML(activeMock.title)}</h1>
            <p>You scored <strong>${score}</strong> out of <strong>${questions.length}</strong>.</p>
            <div class="hero-actions">
              <button class="btn primary" id="tryAgain" type="button">Try Again</button>
              <button class="btn secondary" id="backToMocks" type="button">Choose Another Mock</button>
            </div>
          </div>
        </section>
        <section class="question-list">
          ${questions.map(reviewCard).join("")}
        </section>
      `;
      mount.querySelector("#tryAgain").addEventListener("click", () => startMock(activeMock.id));
      mount.querySelector("#backToMocks").addEventListener("click", renderPicker);
    }

    function reviewCard(question) {
      const correct = answers[question.id] === question.answerIndex;
      return `
        <article class="question-card">
          <h2>${escapeHTML(question.stem)}</h2>
          <p class="${correct ? "success-text" : "danger-text"}">${correct ? "Correct" : "Incorrect"}: ${escapeHTML(question.options[question.answerIndex])}</p>
          <p>${escapeHTML(question.explanation)}</p>
        </article>
      `;
    }

    function getMockQuestions() {
      return activeMock.questionIds
        .map((id) => data.questions.find((question) => question.id === id))
        .filter(Boolean);
    }
  }

  function saveMockAttempt(mock, score, total) {
    const key = "ah-aptitude-mocks";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    current.unshift({ mockId: mock.id, title: mock.title, score, total, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(current.slice(0, 20)));
  }

  function formatTime(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const rest = String(safe % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AHMocks = { initMockEngine };
})();
