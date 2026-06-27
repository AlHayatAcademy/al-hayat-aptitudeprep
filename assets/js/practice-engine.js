(function () {
  function initPracticeEngine(data, mount, filters = {}) {
    const params = new URLSearchParams(window.location.search);
    const state = {
      testId: filters.testId || params.get("test") || "all",
      skillId: filters.skillId || params.get("skill") || "all",
      subjectId: filters.subjectId || params.get("subject") || "all",
      vocabLevel: "all",
      vocabQuery: "",
      vocabPage: 1,
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
      <section id="practiceVocabularyBank" class="vocabulary-study-panel" hidden></section>
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

    mount.addEventListener("input", (event) => {
      if (event.target.id !== "practiceVocabSearch") return;
      state.vocabQuery = event.target.value;
      state.vocabPage = 1;
      renderVocabularyStudyResults();
    });

    mount.addEventListener("change", (event) => {
      if (event.target.id !== "practiceVocabLevel") return;
      state.vocabLevel = event.target.value;
      state.vocabPage = 1;
      renderVocabularyStudyResults();
    });

    mount.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-study-vocab-page]");
      if (pageButton && !pageButton.disabled) {
        state.vocabPage = Number(pageButton.dataset.studyVocabPage);
        renderVocabularyStudyResults();
        return;
      }
      const speechButton = event.target.closest("[data-study-pronounce]");
      if (speechButton) pronounceWord(speechButton.dataset.studyPronounce, speechButton.dataset.voiceLocale);
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
        ${state.skillId === "vocabulary" ? metric("Reviewed words", data.vocabularyBank?.length || 0) : ""}
        ${state.skillId === "vocabulary" ? metric("Curriculum", data.vocabularyRelease?.curriculumTotal || data.vocabularyBank?.length || 0) : ""}
        ${metric("Attempted", attempted)}
        ${metric("Correct", correct)}
      `;
      renderVocabularyStudyBank();
      mount.querySelector("#questionList").innerHTML = questions.length
        ? questions.map((question, index) => questionCard(question, questions[index + 1])).join("")
        : `<div class="empty-state"><h2>No questions found</h2><p>Add matching records in <code>data/questions.json</code> or clear the filters.</p></div>`;

      mount.querySelectorAll("[data-select-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const question = data.questions.find((item) => item.id === button.dataset.question);
          const chosen = Number(button.dataset.answer);
          const current = state.responses[question.id] || {};
          if (current.attempted) return;
          const correct = chosen === question.answerIndex;
          state.responses[question.id] = { ...current, chosen, attempted: true, correct };
          savePracticeAttempt(question, correct);
          render();
        });
      });

      mount.querySelectorAll("[data-toggle-panel]").forEach((button) => {
        button.addEventListener("click", () => {
          const target = mount.querySelector(`#${button.dataset.togglePanel}`);
          target.hidden = !target.hidden;
          if (button.dataset.revealActions) {
            button.textContent = target.hidden ? "Show Answer" : "Hide Answer Tools";
          }
        });
      });

      mount.querySelectorAll("[data-next-question]").forEach((button) => {
        button.addEventListener("click", () => {
          const target = mount.querySelector(`#${button.dataset.nextQuestion}`);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    function renderVocabularyStudyBank() {
      const panel = mount.querySelector("#practiceVocabularyBank");
      const show = state.skillId === "vocabulary" && Array.isArray(data.vocabularyBank) && data.vocabularyBank.length;
      panel.hidden = !show;
      if (!show) return;
      if (!panel.dataset.ready) {
        const levels = [...new Set(data.vocabularyBank.map((item) => item.level))].sort();
        panel.innerHTML = `
          <div class="section-head vocabulary-study-heading">
            <div>
              <p class="eyebrow">Vocabulary Study Bank</p>
              <h2>Study Words Before The MCQs</h2>
              <p>${data.vocabularyBank.length.toLocaleString()} reviewed learning records are available from the ${Number(data.vocabularyRelease?.curriculumTotal || data.vocabularyBank.length).toLocaleString()}-word curriculum. The question bank is counted separately.</p>
            </div>
            <div class="button-row">
              <a class="btn primary small" href="${rootUrl("vocabulary-bank.html?mode=learn")}">Start Daily Review</a>
              <a class="btn secondary small" href="${rootUrl("vocabulary-bank.html")}">Open Full Vocabulary Bank</a>
            </div>
          </div>
          <div class="toolbar-panel vocabulary-study-toolbar">
            <label>Level
              <select id="practiceVocabLevel">
                <option value="all">All levels</option>
                ${levels.map((level) => `<option value="${escapeHTML(level)}">${escapeHTML(level)}</option>`).join("")}
              </select>
            </label>
            <label class="search-field">Search
              <input id="practiceVocabSearch" type="search" placeholder="Search word or meaning...">
            </label>
          </div>
          <p id="practiceVocabCount" class="connected-line" aria-live="polite"></p>
          <div id="practiceVocabResults" class="vocabulary-mini-grid"></div>
          <nav id="practiceVocabPagination" class="pagination-bar" aria-label="Vocabulary study pages"></nav>
        `;
        panel.dataset.ready = "true";
      }
      renderVocabularyStudyResults();
    }

    function renderVocabularyStudyResults() {
      const panel = mount.querySelector("#practiceVocabularyBank");
      if (!panel || panel.hidden || !panel.dataset.ready) return;
      const term = state.vocabQuery.trim().toLowerCase();
      const filtered = data.vocabularyBank.filter((item) => {
        const levelOk = state.vocabLevel === "all" || item.level === state.vocabLevel;
        const testOk = state.testId === "all" || (item.connectedTestIds || []).includes(state.testId);
        const subjectOk = state.subjectId === "all" || state.subjectId === "english";
        const searchable = [item.word, item.meaning, item.urduMeaning, ...(item.synonyms || []), ...(item.antonyms || [])]
          .filter(Boolean).join(" ").toLowerCase();
        return levelOk && testOk && subjectOk && (!term || searchable.includes(term));
      });
      const pageSize = 6;
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      state.vocabPage = Math.min(state.vocabPage, totalPages);
      const start = (state.vocabPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);
      panel.querySelector("#practiceVocabCount").textContent = filtered.length
        ? `Showing ${start + 1}–${start + visible.length} of ${filtered.length} study words`
        : "No study words match these filters.";
      panel.querySelector("#practiceVocabResults").innerHTML = visible.length
        ? visible.map(vocabularyStudyCard).join("")
        : `<div class="empty-state"><h2>No study words found</h2><p>Clear a filter or try another search.</p></div>`;
      panel.querySelector("#practiceVocabPagination").innerHTML = filtered.length > pageSize ? `
        <button class="btn ghost small" type="button" data-study-vocab-page="${state.vocabPage - 1}" ${state.vocabPage === 1 ? "disabled" : ""}>Previous</button>
        <span>Page ${state.vocabPage} of ${totalPages}</span>
        <button class="btn ghost small" type="button" data-study-vocab-page="${state.vocabPage + 1}" ${state.vocabPage === totalPages ? "disabled" : ""}>Next</button>
      ` : "";
    }

    function vocabularyStudyCard(item) {
      const pronunciation = item.pronunciation || {};
      const synonyms = item.synonyms || [];
      return `
        <article class="feature-card vocabulary-study-card">
          <p class="eyebrow">${escapeHTML(item.level)}${item.partOfSpeech ? ` • ${escapeHTML(item.partOfSpeech)}` : ""}</p>
          <h3>${escapeHTML(item.word)}</h3>
          <p>${escapeHTML(item.meaning)}</p>
          ${item.urduMeaning ? `<p class="vocab-urdu" lang="ur" dir="rtl"><strong>اردو:</strong> ${escapeHTML(item.urduMeaning)}</p>` : ""}
          ${synonyms.length ? `<p><strong>Synonyms:</strong> ${escapeHTML(synonyms.slice(0, 3).join(", "))}</p>` : ""}
          ${(pronunciation.ipaUK || pronunciation.ipaUS) ? `
            <div class="button-row">
              <button class="btn ghost small" type="button" data-study-pronounce="${escapeHTML(item.word)}" data-voice-locale="en-GB">Listen UK</button>
              <button class="btn ghost small" type="button" data-study-pronounce="${escapeHTML(item.word)}" data-voice-locale="en-US">Listen US</button>
            </div>
          ` : ""}
          <a class="text-link" href="${rootUrl(`vocabulary-bank.html?q=${encodeURIComponent(item.word)}`)}">Open complete entry</a>
        </article>
      `;
    }

    function pronounceWord(word, locale) {
      if (!("speechSynthesis" in window) || !word) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = locale || "en-US";
      const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
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
        ? `<p class="hint">Click one option to check your answer instantly.</p>`
        : `<p class="${response.correct ? "success-text" : "danger-text"}">${response.correct ? "Correct. Your selected answer is right." : "Not correct. Review the answer and explanation below."}</p>`;
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
            <button class="btn secondary small" data-toggle-panel="answer-tools-${question.id}" data-reveal-actions="true" type="button">Show Answer</button>
          </div>
          <div id="answer-tools-${question.id}" class="practice-panel answer-tools" hidden>
            <div class="button-row practice-actions">
              <button class="btn ghost small" data-toggle-panel="answer-${question.id}" type="button">Correct Answer</button>
              <button class="btn ghost small" data-toggle-panel="explanation-${question.id}" type="button">Explanation</button>
              <button class="btn ghost small" data-toggle-panel="urdu-${question.id}" type="button">اردو وضاحت</button>
              <button class="btn ghost small" data-next-question="practice-${nextQuestion?.id || question.id}" type="button" ${nextQuestion ? "" : "disabled"}>Next Question</button>
              <a class="btn ghost small" href="${rootUrl(`topic-study.html?topic=${question.topicId}`)}">Back To Topic</a>
              <a class="btn ghost small" href="${rootUrl("index.html")}">Back To Home Page</a>
            </div>
            <div id="answer-${question.id}" class="practice-panel answer-panel" hidden>
              <strong>Correct Answer:</strong> ${escapeHTML(answerText)}
            </div>
            <div id="explanation-${question.id}" class="practice-panel explanation-panel" hidden>
              <strong>Explanation:</strong> ${fullExplanation(question, answerText)}
            </div>
            <div id="urdu-${question.id}" class="urdu-note" hidden>${escapeHTML(question.urduExplanation)}</div>
          </div>
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

  function fullExplanation(question, answerText) {
    const explanation = escapeHTML(question.explanation || "Review the meaning, rule or logic used in the question, then compare each option with the exact demand of the stem.");
    const answer = escapeHTML(answerText);
    const example = escapeHTML(question.stem);
    return `${explanation}<br><br><strong>Example:</strong> In this question, the correct choice is <strong>${answer}</strong>. Read the stem carefully, identify the tested concept, and remove options that do not match that concept. Stem: ${example}`;
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
