(function () {
  const PAGE_SIZE = 10;
  const RESPONSE_STORAGE_KEY = "ah-practice-responses-v2";

  function initPracticeEngine(data, mount, filters = {}) {
    const params = new URLSearchParams(window.location.search);
    const state = {
      testId: filters.testId || params.get("test") || "all",
      skillId: filters.skillId || params.get("skill") || "all",
      subjectId: filters.subjectId || params.get("subject") || "all",
      mode: params.get("mode") === "quiz" ? "quiz" : "set",
      questionPage: Math.max(1, Number(params.get("set")) || 1),
      quizIndex: 0,
      vocabLevel: "all",
      vocabQuery: "",
      vocabPage: 1,
      responses: readResponses()
    };

    mount.innerHTML = `
      <section class="page-hero compact">
        <div>
          <p class="eyebrow">Practice Engine</p>
          <h1>Practice by Test, Skill or Subject</h1>
          <p>Work through focused 10-question sets, or switch to Quiz Mode for one question at a time.</p>
        </div>
      </section>
      <section class="toolbar-panel practice-filter-bar" aria-label="Practice filters">
        <label>Test <select id="practiceTest">${optionList(data.tests, "All tests")}</select></label>
        <label>Skill <select id="practiceSkill">${optionList(data.skills, "All skills")}</select></label>
        <label>Subject <select id="practiceSubject">${optionList(data.subjects, "All subjects")}</select></label>
        <button class="btn secondary" id="resetPractice" type="button">Reset filtered answers</button>
      </section>
      <section id="practiceVocabularyBank" class="vocabulary-study-panel" hidden></section>
      <section class="practice-overview" aria-labelledby="practiceSummaryTitle">
        <div class="practice-overview-heading">
          <p class="eyebrow">Your Progress</p>
          <h2 id="practiceSummaryTitle">Practice Summary</h2>
        </div>
        <div id="practiceStats" class="practice-metric-grid"></div>
      </section>
      <section id="practiceWorkspace" class="practice-workspace">
        <div id="practiceSetHeader"></div>
        <nav id="questionPaginationTop" class="question-pagination" aria-label="Question sets"></nav>
        <div id="questionList" class="question-list"></div>
        <nav id="questionPaginationBottom" class="question-pagination" aria-label="Question sets"></nav>
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
        syncUrl();
        render();
      });
    });

    mount.querySelector("#resetPractice").addEventListener("click", () => {
      const questions = filteredQuestions();
      const attempted = questions.filter((question) => state.responses[question.id]?.attempted).length;
      if (!attempted || !window.confirm(`Reset answers for ${attempted} attempted question${attempted === 1 ? "" : "s"} in the current filters?`)) return;
      questions.forEach((question) => delete state.responses[question.id]);
      saveResponses(state.responses);
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
      const studyPageButton = event.target.closest("[data-study-vocab-page]");
      if (studyPageButton && !studyPageButton.disabled) {
        state.vocabPage = Number(studyPageButton.dataset.studyVocabPage);
        renderVocabularyStudyResults();
        return;
      }

      const speechButton = event.target.closest("[data-study-pronounce]");
      if (speechButton) {
        pronounceWord(speechButton.dataset.studyPronounce, speechButton.dataset.voiceLocale);
        return;
      }

      const modeButton = event.target.closest("[data-practice-mode]");
      if (modeButton) {
        state.mode = modeButton.dataset.practiceMode;
        state.quizIndex = state.mode === "quiz" ? firstUnansweredIndex(currentSetQuestions(), state.responses) : 0;
        syncUrl();
        render({ focus: true });
        return;
      }

      const pageButton = event.target.closest("[data-question-page]");
      if (pageButton && !pageButton.disabled) {
        state.questionPage = Number(pageButton.dataset.questionPage);
        state.quizIndex = state.mode === "quiz" ? firstUnansweredIndex(currentSetQuestions(), state.responses) : 0;
        syncUrl();
        render({ focus: true, scroll: true });
        return;
      }

      const quizButton = event.target.closest("[data-quiz-step]");
      if (quizButton && !quizButton.disabled) {
        const questions = filteredQuestions();
        const setQuestions = questions.slice((state.questionPage - 1) * PAGE_SIZE, state.questionPage * PAGE_SIZE);
        state.quizIndex = clamp(state.quizIndex + Number(quizButton.dataset.quizStep), 0, setQuestions.length - 1);
        render({ focus: true, scroll: true });
        return;
      }

      const answerButton = event.target.closest("[data-select-answer]");
      if (answerButton) {
        answerQuestion(answerButton.dataset.question, Number(answerButton.dataset.answer));
        return;
      }

      const toggleButton = event.target.closest("[data-toggle-panel]");
      if (toggleButton) {
        const target = mount.querySelector(`#${toggleButton.dataset.togglePanel}`);
        if (!target) return;
        target.hidden = !target.hidden;
        toggleButton.setAttribute("aria-expanded", String(!target.hidden));
        return;
      }

      const nextQuestionButton = event.target.closest("[data-next-question]");
      if (nextQuestionButton) {
        const target = mount.querySelector(`#${nextQuestionButton.dataset.nextQuestion}`);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        target?.focus({ preventScroll: true });
        return;
      }

      const resetSetButton = event.target.closest("[data-reset-set]");
      if (resetSetButton) {
        currentSetQuestions().forEach((question) => delete state.responses[question.id]);
        saveResponses(state.responses);
        state.quizIndex = 0;
        render({ focus: true });
        return;
      }

      const retryButton = event.target.closest("[data-retry-incorrect]");
      if (retryButton) {
        currentSetQuestions().forEach((question) => {
          if (state.responses[question.id]?.attempted && !state.responses[question.id]?.correct) delete state.responses[question.id];
        });
        saveResponses(state.responses);
        state.mode = "quiz";
        state.quizIndex = Math.max(0, currentSetQuestions().findIndex((question) => !state.responses[question.id]?.attempted));
        syncUrl();
        render({ focus: true });
      }
    });

    function filteredQuestions() {
      return data.questions.filter((question) => {
        const testOk = state.testId === "all" || (question.testIds || []).includes(state.testId);
        const skillOk = state.skillId === "all" || question.skillId === state.skillId;
        const subjectOk = state.subjectId === "all" || question.subjectId === state.subjectId;
        return question.status === "published" && testOk && skillOk && subjectOk;
      });
    }

    function currentSetQuestions() {
      const questions = filteredQuestions();
      const start = (state.questionPage - 1) * PAGE_SIZE;
      return questions.slice(start, start + PAGE_SIZE);
    }

    function answerQuestion(questionId, chosen) {
      const question = data.questions.find((item) => item.id === questionId);
      if (!question || state.responses[question.id]?.attempted) return;
      const correct = chosen === question.answerIndex;
      state.responses[question.id] = {
        chosen,
        attempted: true,
        correct,
        answeredAt: new Date().toISOString()
      };
      saveResponses(state.responses);
      savePracticeAttempt(question, correct);
      render();
      requestAnimationFrame(() => mount.querySelector(`#result-${cssEscape(question.id)}`)?.focus({ preventScroll: true }));
    }

    function render(options = {}) {
      const questions = filteredQuestions();
      const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
      state.questionPage = clamp(state.questionPage, 1, totalPages);
      const start = (state.questionPage - 1) * PAGE_SIZE;
      const setQuestions = questions.slice(start, start + PAGE_SIZE);
      state.quizIndex = clamp(state.quizIndex, 0, Math.max(0, setQuestions.length - 1));

      renderStats(questions);
      renderVocabularyStudyBank();
      renderSetHeader(questions, setQuestions, start, totalPages);

      const visibleQuestions = state.mode === "quiz" ? setQuestions.slice(state.quizIndex, state.quizIndex + 1) : setQuestions;
      mount.querySelector("#questionList").innerHTML = visibleQuestions.length
        ? visibleQuestions.map((question) => {
            const setIndex = setQuestions.findIndex((item) => item.id === question.id);
            const overallIndex = start + setIndex;
            const nextQuestion = state.mode === "set" ? setQuestions[setIndex + 1] : null;
            return questionCard(question, nextQuestion, overallIndex, questions.length, setIndex, setQuestions.length);
          }).join("")
        : `<div class="empty-state"><h2>No questions found</h2><p>Try broader filters or choose another test, skill or subject.</p></div>`;

      const pagination = questions.length ? paginationMarkup(totalPages) : "";
      mount.querySelector("#questionPaginationTop").innerHTML = pagination;
      mount.querySelector("#questionPaginationBottom").innerHTML = pagination;

      if (options.scroll) mount.querySelector("#practiceWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (options.focus) requestAnimationFrame(focusPracticeHeading);
    }

    function renderStats(questions) {
      const responses = questions.map((question) => state.responses[question.id]).filter((response) => response?.attempted);
      const correct = responses.filter((response) => response.correct).length;
      const wrong = responses.length - correct;
      mount.querySelector("#practiceStats").innerHTML = `
        ${metric("Published MCQs", questions.length)}
        ${state.skillId === "vocabulary" ? metric("Ready-to-learn words", data.vocabularyBank?.length || 0) : ""}
        ${state.skillId === "vocabulary" ? metric("Master curriculum", data.vocabularyRelease?.curriculumTotal || data.vocabularyBank?.length || 0) : ""}
        ${metric("Attempted", responses.length)}
        ${metric("Correct", correct)}
        ${metric("Wrong", wrong)}
      `;
    }

    function renderSetHeader(questions, setQuestions, start, totalPages) {
      const attempted = setQuestions.filter((question) => state.responses[question.id]?.attempted).length;
      const correct = setQuestions.filter((question) => state.responses[question.id]?.correct).length;
      const wrong = attempted - correct;
      const percent = setQuestions.length ? Math.round((attempted / setQuestions.length) * 100) : 0;
      const complete = setQuestions.length && attempted === setQuestions.length;
      const showingEnd = Math.min(start + setQuestions.length, questions.length);

      mount.querySelector("#practiceSetHeader").innerHTML = `
        <header class="practice-set-header">
          <div>
            <p class="eyebrow">${state.mode === "quiz" ? "Set-wise Quiz" : "Guided Practice"}</p>
            <h2 class="practice-set-heading" tabindex="-1">Set ${state.questionPage} of ${totalPages}</h2>
            <p class="practice-progress-copy">${questions.length ? `Showing ${start + 1}-${showingEnd} of ${questions.length} questions` : "No matching questions"}</p>
          </div>
          <div class="practice-mode-switch" role="group" aria-label="Practice mode">
            <button type="button" data-practice-mode="set" aria-pressed="${state.mode === "set"}" class="${state.mode === "set" ? "active" : ""}">Practice Set</button>
            <button type="button" data-practice-mode="quiz" aria-pressed="${state.mode === "quiz"}" class="${state.mode === "quiz" ? "active" : ""}">Quiz Mode</button>
          </div>
        </header>
        <div class="set-progress-panel">
          <div class="set-progress-labels">
            <strong>${attempted} of ${setQuestions.length} attempted</strong>
            <span>${correct} correct${wrong ? ` • ${wrong} wrong` : ""}</span>
          </div>
          <progress max="${setQuestions.length || 1}" value="${attempted}">${percent}%</progress>
          <button class="btn ghost small" type="button" data-reset-set ${attempted ? "" : "disabled"}>Reset this set</button>
        </div>
        ${state.mode === "quiz" && setQuestions.length ? `
          <div class="quiz-stepper" aria-label="Quiz question navigation">
            <button class="btn secondary small" type="button" data-quiz-step="-1" ${state.quizIndex === 0 ? "disabled" : ""}>&larr; Previous question</button>
            <strong>Question ${state.quizIndex + 1} of ${setQuestions.length}</strong>
            <button class="btn secondary small" type="button" data-quiz-step="1" ${state.quizIndex === setQuestions.length - 1 ? "disabled" : ""}>Next question &rarr;</button>
          </div>
        ` : ""}
        ${complete ? setCompletionMarkup(correct, wrong, setQuestions.length, totalPages) : ""}
      `;
    }

    function setCompletionMarkup(correct, wrong, total, totalPages) {
      const score = Math.round((correct / total) * 100);
      return `
        <section class="set-complete" aria-label="Set complete">
          <div>
            <p class="eyebrow">Set Complete</p>
            <h3>${correct} of ${total} correct <span>${score}%</span></h3>
            <p>${score >= 80 ? "Strong result. Review any missed explanations before continuing." : "Review the missed questions, then retry them to strengthen recall."}</p>
          </div>
          <div class="button-row">
            ${wrong ? `<button class="btn secondary small" type="button" data-retry-incorrect>Retry incorrect</button>` : ""}
            ${state.questionPage < totalPages ? `<button class="btn primary small" type="button" data-question-page="${state.questionPage + 1}">Next set &rarr;</button>` : ""}
          </div>
        </section>
      `;
    }

    function paginationMarkup(totalPages) {
      if (totalPages <= 1) return "";
      const tokens = pageTokens(state.questionPage, totalPages);
      return `
        <button class="pagination-arrow" type="button" data-question-page="${state.questionPage - 1}" ${state.questionPage === 1 ? "disabled" : ""} aria-label="Previous question set">&larr; <span>Previous</span></button>
        <div class="pagination-pages">
          ${tokens.map((token) => token === "ellipsis"
            ? `<span class="pagination-ellipsis" aria-hidden="true">...</span>`
            : `<button type="button" data-question-page="${token}" class="pagination-page ${token === state.questionPage ? "active" : ""}" ${token === state.questionPage ? `aria-current="page"` : ""} aria-label="Question set ${token}">${token}</button>`
          ).join("")}
        </div>
        <button class="pagination-arrow" type="button" data-question-page="${state.questionPage + 1}" ${state.questionPage === totalPages ? "disabled" : ""} aria-label="Next question set"><span>Next</span> &rarr;</button>
      `;
    }

    function renderVocabularyStudyBank() {
      const panel = mount.querySelector("#practiceVocabularyBank");
      const show = state.skillId === "vocabulary" && Array.isArray(data.vocabularyBank) && data.vocabularyBank.length;
      panel.hidden = !show;
      if (!show) return;
      if (!panel.dataset.ready) {
        const levels = [...new Set(data.vocabularyBank.map((item) => item.level))].sort();
        panel.innerHTML = `
          <details class="practice-study-support">
            <summary>
              <span>
                <span class="eyebrow">Optional Study Support</span>
                <strong>Review vocabulary before practising</strong>
                <small>${data.vocabularyBank.length.toLocaleString()} ready-to-learn words available</small>
              </span>
              <span class="study-support-action">Open study words</span>
            </summary>
            <div class="study-support-body">
              <div class="vocabulary-study-heading">
                <p>Use this reference only when you need a refresher. For stronger learning, attempt the MCQs before checking a word.</p>
                <div class="button-row">
                  <a class="btn primary small" href="${rootUrl("vocabulary-bank.html?mode=learn")}">Start Daily Review</a>
                  <a class="btn secondary small" href="${rootUrl("vocabulary-bank.html")}">Open Full Bank</a>
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
            </div>
          </details>
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
      state.vocabPage = clamp(state.vocabPage, 1, totalPages);
      const start = (state.vocabPage - 1) * pageSize;
      const visible = filtered.slice(start, start + pageSize);
      panel.querySelector("#practiceVocabCount").textContent = filtered.length
        ? `Showing ${start + 1}-${start + visible.length} of ${filtered.length} study words`
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

    function questionCard(question, nextQuestion, overallIndex, totalQuestions, setIndex, setLength) {
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
        return `<button class="option ${resultClass}" data-question="${escapeHTML(question.id)}" data-answer="${index}" data-select-answer type="button" ${attempted ? "disabled" : ""}><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHTML(option)}</span></button>`;
      }).join("");
      const result = !attempted
        ? `<p class="hint">Choose the best answer. Feedback appears immediately.</p>`
        : `<p id="result-${escapeHTML(question.id)}" tabindex="-1" role="status" class="answer-result ${response.correct ? "success-text" : "danger-text"}">${response.correct ? "Correct." : "Not correct."} ${response.correct ? "Your answer matches the tested meaning." : "Review the correct answer and explanation before continuing."}</p>`;
      const answerText = question.options[question.answerIndex];
      return `
        <article class="question-card" id="practice-${escapeHTML(question.id)}" tabindex="-1">
          <div class="question-position"><strong>${state.mode === "quiz" ? `Question ${setIndex + 1} of ${setLength}` : `Question ${overallIndex + 1} of ${totalQuestions}`}</strong><span>Set ${state.questionPage}</span></div>
          <div class="meta-row">
            <span>${escapeHTML(topic)}</span>
            <span>${escapeHTML(question.difficulty)}</span>
            <span>${escapeHTML(question.examStyle)}</span>
          </div>
          <h2>${escapeHTML(question.stem)}</h2>
          <div class="options-grid">${optionButtons}</div>
          ${result}
          ${attempted ? `
            <div class="button-row practice-actions">
              <button class="btn secondary small" data-toggle-panel="answer-tools-${escapeHTML(question.id)}" aria-expanded="false" type="button">Review answer and explanation</button>
              ${state.mode === "set" && nextQuestion ? `<button class="btn ghost small" data-next-question="practice-${escapeHTML(nextQuestion.id)}" type="button">Next question &darr;</button>` : ""}
            </div>
            <div id="answer-tools-${escapeHTML(question.id)}" class="practice-panel answer-tools" hidden>
              <p><strong>Correct answer:</strong> ${escapeHTML(answerText)}</p>
              <p><strong>Explanation:</strong> ${escapeHTML(question.explanation || "Compare each option with the exact meaning required by the question.")}</p>
              ${question.urduExplanation ? `<div class="urdu-note">${escapeHTML(question.urduExplanation)}</div>` : ""}
              <div class="button-row practice-reference-links">
                <a class="text-link" href="${rootUrl(`topic-study.html?topic=${question.topicId}`)}">Review this topic</a>
              </div>
            </div>
          ` : ""}
        </article>
      `;
    }

    function syncUrl() {
      const url = new URL(window.location.href);
      setUrlParam(url, "test", state.testId);
      setUrlParam(url, "skill", state.skillId);
      setUrlParam(url, "subject", state.subjectId);
      if (state.mode === "quiz") url.searchParams.set("mode", "quiz");
      else url.searchParams.delete("mode");
      if (state.questionPage > 1) url.searchParams.set("set", String(state.questionPage));
      else url.searchParams.delete("set");
      window.history.replaceState({}, "", url);
    }

    function focusPracticeHeading() {
      mount.querySelector(".practice-set-heading")?.focus({ preventScroll: true });
    }

    render();
  }

  function pageTokens(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
    if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));
    const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
    const tokens = [];
    sorted.forEach((page, index) => {
      if (index && page - sorted[index - 1] > 1) tokens.push("ellipsis");
      tokens.push(page);
    });
    return tokens;
  }

  function firstUnansweredIndex(questions, responses) {
    const index = questions.findIndex((question) => !responses[question.id]?.attempted);
    return index < 0 ? 0 : index;
  }

  function optionList(items, allLabel) {
    return [`<option value="all">${allLabel}</option>`]
      .concat(items.map((item) => `<option value="${item.id}">${escapeHTML(item.name)}</option>`))
      .join("");
  }

  function metric(label, value) {
    return `<div class="metric"><strong>${Number(value).toLocaleString()}</strong><span>${escapeHTML(label)}</span></div>`;
  }

  function setUrlParam(url, key, value) {
    if (!value || value === "all") url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function rootUrl(path) {
    return window.AHData.rootUrl(path);
  }

  function readResponses() {
    try {
      const saved = JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch {
      return {};
    }
  }

  function saveResponses(responses) {
    try {
      localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(responses));
    } catch {
      // Practice remains usable when storage is unavailable.
    }
  }

  function savePracticeAttempt(question, correct) {
    const key = "ah-aptitude-progress";
    try {
      const current = JSON.parse(localStorage.getItem(key) || "{}");
      const topic = current[question.topicId] || { attempts: 0, correct: 0 };
      topic.attempts += 1;
      topic.correct += correct ? 1 : 0;
      current[question.topicId] = topic;
      localStorage.setItem(key, JSON.stringify(current));
    } catch {
      // A blocked storage API should not block answering.
    }
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

  function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(value) : String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AHPractice = { initPracticeEngine, pageTokens, firstUnansweredIndex };
})();
