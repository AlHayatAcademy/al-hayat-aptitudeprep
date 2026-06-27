(function () {
  const QUESTION_PAGE_SIZE = 20;
  const VOCAB_STUDY_PAGE_SIZE = 6;

  function initPracticeEngine(data, mount, filters = {}) {
    const params = new URLSearchParams(window.location.search);
    const state = {
      testId: filters.testId || params.get("test") || "all",
      skillId: filters.skillId || params.get("skill") || "all",
      subjectId: filters.subjectId || params.get("subject") || "all",
      vocabLevel: "all",
      vocabQuery: "",
      vocabPage: 1,
      questionPage: Number(params.get("page") || 1),
      practiceMode: params.get("mode") === "quiz" ? "quiz" : "set",
      quizIndex: 0,
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
          <p>Use focused 20-question sets for practice, or switch to one-by-one quiz mode for exam-like flow.</p>
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
        <div class="practice-main-panel">
          <section class="practice-mode-panel" aria-label="Practice mode">
            <div>
              <p class="eyebrow">Hybrid Practice</p>
              <h2 id="practiceModeTitle">Practice Set</h2>
              <p id="practiceModeHelp">Twenty MCQs are shown at a time for manageable topic practice.</p>
            </div>
            <div class="segmented-control" role="tablist" aria-label="Choose practice mode">
              <button class="segment" type="button" data-practice-mode="set">20-MCQ Set</button>
              <button class="segment" type="button" data-practice-mode="quiz">Quiz Mode</button>
            </div>
          </section>
          <div id="questionPagerTop"></div>
          <div id="questionList" class="question-list"></div>
          <div id="questionPagerBottom"></div>
        </div>
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
        state.questionPage = 1;
        state.quizIndex = 0;
        state.vocabPage = 1;
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
      const modeButton = event.target.closest("[data-practice-mode]");
      if (modeButton) {
        state.practiceMode = modeButton.dataset.practiceMode;
        state.quizIndex = 0;
        render();
        return;
      }

      const qPageButton = event.target.closest("[data-question-page]");
      if (qPageButton && !qPageButton.disabled) {
        state.questionPage = Number(qPageButton.dataset.questionPage);
        state.quizIndex = 0;
        render();
        mount.querySelector("#questionList")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const quizMove = event.target.closest("[data-quiz-move]");
      if (quizMove && !quizMove.disabled) {
        moveQuiz(Number(quizMove.dataset.quizMove));
        return;
      }

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
      const totalPages = Math.max(1, Math.ceil(questions.length / QUESTION_PAGE_SIZE));
      state.questionPage = Math.min(Math.max(1, state.questionPage), totalPages);
      const pageStart = (state.questionPage - 1) * QUESTION_PAGE_SIZE;
      const pageQuestions = questions.slice(pageStart, pageStart + QUESTION_PAGE_SIZE);
      state.quizIndex = Math.min(Math.max(0, state.quizIndex), Math.max(0, pageQuestions.length - 1));

      const filteredIds = new Set(questions.map((item) => item.id));
      const filteredResponses = Object.entries(state.responses).filter(([id]) => filteredIds.has(id)).map(([, value]) => value);
      const attempted = filteredResponses.filter((item) => item.attempted).length;
      const correct = filteredResponses.filter((item) => item.correct).length;

      mount.querySelector("#practiceStats").innerHTML = `
        ${metric("Published MCQs", questions.length)}
        ${state.skillId === "vocabulary" ? metric("Ready words", data.vocabularyBank?.length || 0) : ""}
        ${state.skillId === "vocabulary" ? metric("Master curriculum", data.vocabularyRelease?.curriculumTotal || data.vocabularyBank?.length || 0) : ""}
        ${metric("Attempted", attempted)}
        ${metric("Correct", correct)}
      `;

      renderVocabularyStudyBank();
      renderPracticeModeHeader(questions, pageQuestions);
      renderQuestionArea(questions, pageQuestions, pageStart, totalPages);
      bindQuestionButtons();
    }

    function renderPracticeModeHeader(questions, pageQuestions) {
      const title = state.practiceMode === "quiz" ? "Quiz Mode" : "Practice Set";
      const help = state.practiceMode === "quiz"
        ? "One MCQ is shown at a time. Use this when you want exam-like focus."
        : "Twenty MCQs are shown at a time. Use this for easy topic practice and quick review.";
      mount.querySelector("#practiceModeTitle").textContent = title;
      mount.querySelector("#practiceModeHelp").textContent = questions.length
        ? `${help} Current set: ${pageQuestions.length} question${pageQuestions.length === 1 ? "" : "s"}.`
        : "No matching questions are available for these filters.";
      mount.querySelectorAll("[data-practice-mode]").forEach((button) => {
        const active = button.dataset.practiceMode === state.practiceMode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
    }

    function renderQuestionArea(questions, pageQuestions, pageStart, totalPages) {
      const top = mount.querySelector("#questionPagerTop");
      const bottom = mount.querySelector("#questionPagerBottom");
      const list = mount.querySelector("#questionList");

      if (!questions.length) {
        top.innerHTML = "";
        bottom.innerHTML = "";
        list.innerHTML = `<div class="empty-state"><h2>No questions found</h2><p>Add matching records in <code>data/questions.json</code> or clear the filters.</p></div>`;
        return;
      }

      if (state.practiceMode === "quiz") {
        const current = pageQuestions[state.quizIndex];
        const previousQuestion = pageQuestions[state.quizIndex - 1];
        const nextQuestion = pageQuestions[state.quizIndex + 1];
        top.innerHTML = quizControls(questions.length, pageQuestions.length, pageStart);
        bottom.innerHTML = quizControls(questions.length, pageQuestions.length, pageStart, true);
        list.innerHTML = current ? questionCard(current, nextQuestion, previousQuestion, true) : "";
        return;
      }

      const visibleStart = pageStart + 1;
      const visibleEnd = pageStart + pageQuestions.length;
      const pager = questionPagination(questions.length, visibleStart, visibleEnd, totalPages);
      top.innerHTML = pager;
      bottom.innerHTML = pager;
      list.innerHTML = pageQuestions.map((question, index) => questionCard(question, pageQuestions[index + 1], pageQuestions[index - 1], false)).join("");
    }

    function questionPagination(total, start, end, totalPages) {
      if (!total) return "";
      return `
        <nav class="practice-pagination" aria-label="Question pages">
          <p>Showing <strong>${start}–${end}</strong> of <strong>${total}</strong> questions • Page ${state.questionPage} of ${totalPages}</p>
          <div class="pagination-bar compact-pages">
            <button class="btn ghost small" type="button" data-question-page="${state.questionPage - 1}" ${state.questionPage === 1 ? "disabled" : ""}>← Previous</button>
            ${pageNumberButtons(totalPages)}
            <button class="btn ghost small" type="button" data-question-page="${state.questionPage + 1}" ${state.questionPage === totalPages ? "disabled" : ""}>Next →</button>
          </div>
        </nav>
      `;
    }

    function pageNumberButtons(totalPages) {
      const pages = visiblePageNumbers(state.questionPage, totalPages);
      return pages.map((page) => page === "…"
        ? `<span class="page-ellipsis">…</span>`
        : `<button class="page-number ${page === state.questionPage ? "active" : ""}" type="button" data-question-page="${page}" aria-current="${page === state.questionPage ? "page" : "false"}">${page}</button>`
      ).join("");
    }

    function visiblePageNumbers(current, total) {
      if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
      const set = new Set([1, total, current, current - 1, current + 1]);
      if (current <= 3) [2, 3, 4].forEach((page) => set.add(page));
      if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => set.add(page));
      const sorted = [...set].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
      const output = [];
      sorted.forEach((page, index) => {
        if (index && page - sorted[index - 1] > 1) output.push("…");
        output.push(page);
      });
      return output;
    }

    function quizControls(total, setTotal, pageStart, bottom = false) {
      const overall = pageStart + state.quizIndex + 1;
      const totalPages = Math.max(1, Math.ceil(total / QUESTION_PAGE_SIZE));
      const atFirstInSet = state.quizIndex === 0;
      const atLastInSet = state.quizIndex >= setTotal - 1;
      return `
        <nav class="practice-pagination quiz-pagination ${bottom ? "bottom" : ""}" aria-label="Quiz navigation">
          <p>Question <strong>${state.quizIndex + 1}</strong> of <strong>${setTotal}</strong> in this set • Overall ${overall} of ${total}</p>
          <div class="pagination-bar compact-pages">
            <button class="btn ghost small" type="button" data-question-page="${state.questionPage - 1}" ${state.questionPage === 1 && atFirstInSet ? "disabled" : ""}>← Previous Set</button>
            <button class="btn secondary small" type="button" data-quiz-move="-1" ${state.questionPage === 1 && atFirstInSet ? "disabled" : ""}>← Previous</button>
            <span>Set ${state.questionPage} of ${totalPages}</span>
            <button class="btn primary small" type="button" data-quiz-move="1" ${state.questionPage === totalPages && atLastInSet ? "disabled" : ""}>Next →</button>
            <button class="btn ghost small" type="button" data-question-page="${state.questionPage + 1}" ${state.questionPage === totalPages ? "disabled" : ""}>Next Set →</button>
          </div>
        </nav>
      `;
    }

    function moveQuiz(delta) {
      const questions = filteredQuestions();
      const totalPages = Math.max(1, Math.ceil(questions.length / QUESTION_PAGE_SIZE));
      const pageStart = (state.questionPage - 1) * QUESTION_PAGE_SIZE;
      const pageQuestions = questions.slice(pageStart, pageStart + QUESTION_PAGE_SIZE);
      const nextIndex = state.quizIndex + delta;
      if (nextIndex >= 0 && nextIndex < pageQuestions.length) {
        state.quizIndex = nextIndex;
      } else if (delta > 0 && state.questionPage < totalPages) {
        state.questionPage += 1;
        state.quizIndex = 0;
      } else if (delta < 0 && state.questionPage > 1) {
        state.questionPage -= 1;
        const previousStart = (state.questionPage - 1) * QUESTION_PAGE_SIZE;
        state.quizIndex = Math.max(0, questions.slice(previousStart, previousStart + QUESTION_PAGE_SIZE).length - 1);
      }
      render();
      mount.querySelector("#questionList")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function bindQuestionButtons() {
      mount.querySelectorAll("[data-select-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          const question = data.questions.find((item) => item.id === button.dataset.question);
          if (!question) return;
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
          if (!target) return;
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
      const totalPages = Math.max(1, Math.ceil(filtered.length / VOCAB_STUDY_PAGE_SIZE));
      state.vocabPage = Math.min(state.vocabPage, totalPages);
      const start = (state.vocabPage - 1) * VOCAB_STUDY_PAGE_SIZE;
      const visible = filtered.slice(start, start + VOCAB_STUDY_PAGE_SIZE);
      panel.querySelector("#practiceVocabCount").textContent = filtered.length
        ? `Showing ${start + 1}–${start + visible.length} of ${filtered.length} study words`
        : "No study words match these filters.";
      panel.querySelector("#practiceVocabResults").innerHTML = visible.length
        ? visible.map(vocabularyStudyCard).join("")
        : `<div class="empty-state"><h2>No study words found</h2><p>Clear a filter or try another search.</p></div>`;
      panel.querySelector("#practiceVocabPagination").innerHTML = filtered.length > VOCAB_STUDY_PAGE_SIZE ? `
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

    function questionCard(question, nextQuestion, previousQuestion, isQuizMode) {
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
      const quizNav = isQuizMode ? `
        <div class="button-row practice-actions quiz-inline-actions">
          <button class="btn ghost small" type="button" data-quiz-move="-1" ${!previousQuestion && state.questionPage === 1 ? "disabled" : ""}>← Previous</button>
          <button class="btn primary small" type="button" data-quiz-move="1" ${!nextQuestion && state.questionPage >= Math.ceil(filteredQuestions().length / QUESTION_PAGE_SIZE) ? "disabled" : ""}>Next →</button>
        </div>
      ` : "";
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
              ${!isQuizMode ? `<button class="btn ghost small" data-next-question="practice-${nextQuestion?.id || question.id}" type="button" ${nextQuestion ? "" : "disabled"}>Next Question</button>` : ""}
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
          ${quizNav}
        </article>
      `;
    }

    render();
  }

  function optionList(items, allLabel) {
    return [`<option value="all">${allLabel}</option>`]
      .concat(items.map((item) => `<option value="${item.id}">${escapeHTML(item.name)}</option>`))
      .join("");
  }

  function metric(label, value) {
    return `<div class="metric"><strong>${Number(value).toLocaleString()}</strong><span>${label}</span></div>`;
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
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AHPractice = { initPracticeEngine };
})();
