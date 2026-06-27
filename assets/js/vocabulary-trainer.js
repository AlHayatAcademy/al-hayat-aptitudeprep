(function () {
  const STORAGE_KEY = "ah-vocabulary-srs-v1";
  const MINUTE = 60 * 1000;
  const DAY = 24 * 60 * MINUTE;
  const NEW_WORD_LIMIT = 10;
  const DUE_WORD_LIMIT = 20;

  function init(items, mount, options = {}) {
    if (!mount || !Array.isArray(items) || !items.length || mount.dataset.trainerReady) return;
    mount.dataset.trainerReady = "true";

    const state = {
      progress: readProgress(),
      queue: [],
      current: null,
      revealed: false,
      typedResult: null,
      session: { reviewed: 0, correct: 0, again: 0 },
      mode: "daily"
    };

    mount.innerHTML = `
      <section class="vocabulary-trainer-launch" aria-labelledby="vocabularyTrainerTitle">
        <div>
          <p class="eyebrow">Adaptive Vocabulary Trainer</p>
          <h2 id="vocabularyTrainerTitle">Recall, Apply, Review</h2>
          <p>Retrieve the answer before revealing it. Ratings schedule the next review in this browser.</p>
        </div>
        <div class="trainer-launch-actions">
          <button class="btn primary" type="button" data-trainer-start="daily">Start Daily Session</button>
          <button class="btn secondary" type="button" data-trainer-start="due">Review Due Words</button>
          <button class="btn ghost" type="button" data-trainer-start="new">Learn 10 New Words</button>
        </div>
      </section>
      <section class="trainer-stats" id="trainerStats" aria-label="Vocabulary learning progress"></section>
      <section class="vocabulary-trainer" id="trainerWorkspace" hidden aria-live="polite"></section>
    `;

    mount.addEventListener("click", (event) => {
      const startButton = event.target.closest("[data-trainer-start]");
      if (startButton) {
        startSession(startButton.dataset.trainerStart);
        return;
      }

      const revealButton = event.target.closest("[data-trainer-reveal]");
      if (revealButton) {
        revealAnswer();
        return;
      }

      const ratingButton = event.target.closest("[data-trainer-rating]");
      if (ratingButton) {
        rateCurrent(ratingButton.dataset.trainerRating);
        return;
      }

      const pronunciationButton = event.target.closest("[data-trainer-pronounce]");
      if (pronunciationButton) {
        pronounce(pronunciationButton.dataset.trainerPronounce, pronunciationButton.dataset.voiceLocale);
        return;
      }

      if (event.target.closest("[data-trainer-close]")) {
        mount.querySelector("#trainerWorkspace").hidden = true;
        mount.querySelector(".vocabulary-trainer-launch").hidden = false;
        return;
      }

      if (event.target.closest("[data-trainer-reset]")) {
        if (!window.confirm("Reset all vocabulary learning progress in this browser?")) return;
        localStorage.removeItem(STORAGE_KEY);
        state.progress = {};
        state.queue = [];
        state.current = null;
        state.session = { reviewed: 0, correct: 0, again: 0 };
        renderStats();
        renderWelcome();
      }
    });

    mount.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.matches("[data-trainer-input]") && !state.revealed) {
        event.preventDefault();
        revealAnswer();
      }
      if (!state.revealed || !["1", "2", "3", "4"].includes(event.key)) return;
      const rating = { "1": "again", "2": "hard", "3": "good", "4": "easy" }[event.key];
      rateCurrent(rating);
    });

    function startSession(mode) {
      state.mode = mode;
      state.session = { reviewed: 0, correct: 0, again: 0 };
      const now = Date.now();
      const due = items
        .filter((item) => state.progress[item.id] && state.progress[item.id].dueAt <= now)
        .sort((a, b) => state.progress[a.id].dueAt - state.progress[b.id].dueAt);
      const unseen = items.filter((item) => !state.progress[item.id]);

      if (mode === "due") state.queue = due.slice(0, DUE_WORD_LIMIT);
      else if (mode === "new") state.queue = unseen.slice(0, NEW_WORD_LIMIT);
      else state.queue = [...due.slice(0, DUE_WORD_LIMIT), ...unseen.slice(0, NEW_WORD_LIMIT)];

      mount.querySelector(".vocabulary-trainer-launch").hidden = true;
      mount.querySelector("#trainerWorkspace").hidden = false;
      nextCard();
    }

    function nextCard() {
      state.current = state.queue.shift() || null;
      state.revealed = false;
      state.typedResult = null;
      if (!state.current) {
        renderSessionComplete();
        renderStats();
        return;
      }
      renderCard();
    }

    function promptFor(item) {
      const record = state.progress[item.id] || { repetitions: 0 };
      if (record.repetitions === 0) {
        return {
          type: "meaning",
          label: "Recall the meaning",
          prompt: item.word,
          instruction: "Say the meaning aloud or explain it in your own words before revealing the answer.",
          input: false
        };
      }
      if (record.repetitions % 3 === 1) {
        return {
          type: "reverse",
          label: "Recall the word",
          prompt: item.meaning,
          instruction: "Type the headword that matches this meaning.",
          input: true
        };
      }
      if (record.repetitions % 3 === 2) {
        return {
          type: "context",
          label: "Complete the context",
          prompt: clozeExample(item.example, item.word),
          instruction: "Type the missing vocabulary word.",
          input: true
        };
      }
      return {
        type: "synonym",
        label: "Recall from related meanings",
        prompt: (item.synonyms || []).slice(0, 3).join(", ") || item.meaning,
        instruction: "Type the headword suggested by these related meanings.",
        input: true
      };
    }

    function renderCard() {
      const item = state.current;
      const prompt = promptFor(item);
      const completed = state.session.reviewed;
      const total = completed + state.queue.length + 1;
      const workspace = mount.querySelector("#trainerWorkspace");
      workspace.innerHTML = `
        <div class="trainer-session-bar">
          <div>
            <span>${escapeHTML(sessionName(state.mode))}</span>
            <strong>${completed + 1} of ${total}</strong>
          </div>
          <button class="btn ghost small" type="button" data-trainer-close>Close session</button>
        </div>
        <article class="trainer-card" data-prompt-type="${prompt.type}">
          <p class="eyebrow">${escapeHTML(prompt.label)} • ${escapeHTML(item.level)}</p>
          <h2>${escapeHTML(prompt.prompt)}</h2>
          <p class="trainer-instruction">${escapeHTML(prompt.instruction)}</p>
          ${prompt.input ? `
            <label class="trainer-answer-input">Your answer
              <input type="text" data-trainer-input autocomplete="off" autocapitalize="none" spellcheck="false">
            </label>
          ` : ""}
          <button class="btn primary" type="button" data-trainer-reveal>${prompt.input ? "Check and reveal" : "Reveal answer"}</button>
        </article>
      `;
      workspace.querySelector("[data-trainer-input]")?.focus();
    }

    function revealAnswer() {
      if (!state.current || state.revealed) return;
      const input = mount.querySelector("[data-trainer-input]");
      if (input) {
        const accepted = [state.current.word, ...(state.current.sourceForms || [])].map(normalizeAnswer);
        state.typedResult = accepted.includes(normalizeAnswer(input.value));
      }
      state.revealed = true;
      renderRevealedCard();
    }

    function renderRevealedCard() {
      const item = state.current;
      const prompt = promptFor(item);
      const pronunciation = item.pronunciation || {};
      const record = state.progress[item.id] || {};
      const ratingLabels = scheduleLabels(record);
      const result = state.typedResult === null
        ? "Compare your recalled answer honestly, then choose a rating."
        : state.typedResult
          ? "Correct retrieval."
          : `Not yet. The answer is ${item.word}.`;
      const resultClass = state.typedResult === false ? "danger-text" : state.typedResult === true ? "success-text" : "hint";
      mount.querySelector(".trainer-card").innerHTML = `
        <p class="eyebrow">Answer • ${escapeHTML(item.level)}${item.partOfSpeech ? ` • ${escapeHTML(item.partOfSpeech)}` : ""}</p>
        <h2>${escapeHTML(item.word)}</h2>
        <p class="${resultClass}">${escapeHTML(result)}</p>
        ${(pronunciation.ipaUK || pronunciation.ipaUS) ? `
          <div class="vocab-pronunciation">
            ${pronunciation.ipaUK ? `<span><strong>UK</strong> ${escapeHTML(pronunciation.ipaUK)}</span>` : ""}
            ${pronunciation.ipaUS ? `<span><strong>US</strong> ${escapeHTML(pronunciation.ipaUS)}</span>` : ""}
          </div>
          <div class="button-row">
            <button class="btn ghost small" type="button" data-trainer-pronounce="${escapeHTML(item.word)}" data-voice-locale="en-GB">Listen UK</button>
            <button class="btn ghost small" type="button" data-trainer-pronounce="${escapeHTML(item.word)}" data-voice-locale="en-US">Listen US</button>
          </div>
        ` : ""}
        <p class="trainer-definition">${escapeHTML(item.meaning)}</p>
        ${item.urduMeaning ? `<p class="vocab-urdu" lang="ur" dir="rtl"><strong>اردو:</strong> ${escapeHTML(item.urduMeaning)} <span>زیرِ جائزہ</span></p>` : ""}
        ${(item.synonyms || []).length ? `<p><strong>Synonyms:</strong> ${escapeHTML(item.synonyms.join(", "))}</p>` : ""}
        ${(item.antonyms || []).length ? `<p><strong>Antonyms:</strong> ${escapeHTML(item.antonyms.join(", "))}</p>` : ""}
        <p class="vocab-example"><strong>Example:</strong> ${escapeHTML(item.example)}</p>
        <fieldset class="trainer-rating-group">
          <legend>How difficult was retrieval?</legend>
          <button class="rating-button again" type="button" data-trainer-rating="again"><strong>Again</strong><span>${ratingLabels.again}</span><kbd>1</kbd></button>
          <button class="rating-button hard" type="button" data-trainer-rating="hard"><strong>Hard</strong><span>${ratingLabels.hard}</span><kbd>2</kbd></button>
          <button class="rating-button good" type="button" data-trainer-rating="good"><strong>Good</strong><span>${ratingLabels.good}</span><kbd>3</kbd></button>
          <button class="rating-button easy" type="button" data-trainer-rating="easy"><strong>Easy</strong><span>${ratingLabels.easy}</span><kbd>4</kbd></button>
        </fieldset>
        ${prompt.input && state.typedResult === false ? `<p class="hint">A wrong typed answer should normally be rated Again.</p>` : ""}
      `;
    }

    function rateCurrent(rating) {
      if (!state.current || !state.revealed) return;
      const item = state.current;
      const previous = state.progress[item.id] || {
        repetitions: 0,
        intervalDays: 0,
        lapses: 0,
        dueAt: Date.now()
      };
      const schedule = calculateSchedule(previous, rating);
      state.progress[item.id] = {
        ...previous,
        ...schedule,
        lastRating: rating,
        lastReviewedAt: Date.now(),
        updatedAt: new Date().toISOString()
      };
      saveProgress(state.progress);
      state.session.reviewed += 1;
      if (rating === "again") {
        state.session.again += 1;
        const retryIndex = Math.min(3, state.queue.length);
        state.queue.splice(retryIndex, 0, item);
      } else if (state.typedResult !== false) {
        state.session.correct += 1;
      }
      renderStats();
      window.dispatchEvent(new CustomEvent("ah:vocabulary-progress", { detail: { wordId: item.id, rating } }));
      nextCard();
    }

    function renderSessionComplete() {
      const workspace = mount.querySelector("#trainerWorkspace");
      const accuracy = state.session.reviewed
        ? Math.round((state.session.correct / state.session.reviewed) * 100)
        : 0;
      workspace.innerHTML = `
        <section class="trainer-complete">
          <p class="eyebrow">Session Complete</p>
          <h2>${state.session.reviewed ? "Review saved" : "No words are due"}</h2>
          <div class="trainer-complete-stats">
            <span><strong>${state.session.reviewed}</strong> reviewed</span>
            <span><strong>${accuracy}%</strong> successful</span>
            <span><strong>${state.session.again}</strong> repeated</span>
          </div>
          <p>${state.session.reviewed ? "Return when the next words become due. Difficult words will reappear sooner." : "Try learning new words or return after a scheduled review becomes due."}</p>
          <div class="button-row">
            <button class="btn primary" type="button" data-trainer-start="new">Learn New Words</button>
            <button class="btn secondary" type="button" data-trainer-start="daily">Start Another Session</button>
            <button class="btn ghost" type="button" data-trainer-close>Back To Bank</button>
          </div>
        </section>
      `;
    }

    function renderWelcome() {
      mount.querySelector("#trainerWorkspace").hidden = true;
      mount.querySelector(".vocabulary-trainer-launch").hidden = false;
    }

    function renderStats() {
      const now = Date.now();
      const records = Object.values(state.progress);
      const due = records.filter((record) => record.dueAt <= now).length;
      const learning = records.filter((record) => !isMastered(record)).length;
      const mastered = records.filter(isMastered).length;
      const unseen = Math.max(0, items.length - records.length);
      mount.querySelector("#trainerStats").innerHTML = `
        ${stat("Due now", due)}
        ${stat("New", unseen)}
        ${stat("Learning", learning)}
        ${stat("Mastered", mastered)}
        <button class="trainer-reset" type="button" data-trainer-reset>Reset progress</button>
      `;
    }

    renderStats();
    if (options.autoStart) startSession("daily");
  }

  function calculateSchedule(previous, rating, now = Date.now()) {
    const oldInterval = Number(previous.intervalDays) || 0;
    const repetitions = Number(previous.repetitions) || 0;
    if (rating === "again") {
      return {
        dueAt: now + 10 * MINUTE,
        intervalDays: 0,
        repetitions: Math.max(0, repetitions - 1),
        lapses: (Number(previous.lapses) || 0) + 1
      };
    }
    const intervalDays = rating === "hard"
      ? Math.max(1, oldInterval ? Math.round(oldInterval * 1.3) : 1)
      : rating === "easy"
        ? Math.max(4, oldInterval ? Math.round(oldInterval * 3.5) : 4)
        : Math.max(1, oldInterval ? Math.round(oldInterval * 2.3) : 1);
    return {
      dueAt: now + intervalDays * DAY,
      intervalDays,
      repetitions: repetitions + 1,
      lapses: Number(previous.lapses) || 0
    };
  }

  function scheduleLabels(record) {
    return {
      again: "this session",
      hard: formatInterval(calculateSchedule(record, "hard", 0).dueAt),
      good: formatInterval(calculateSchedule(record, "good", 0).dueAt),
      easy: formatInterval(calculateSchedule(record, "easy", 0).dueAt)
    };
  }

  function formatInterval(milliseconds) {
    const days = Math.max(1, Math.round(milliseconds / DAY));
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  function isMastered(record) {
    return Number(record.repetitions) >= 4 && Number(record.intervalDays) >= 14;
  }

  function clozeExample(example, word) {
    if (!example) return `Use ______ in a suitable sentence.`;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const replaced = example.replace(new RegExp(`\\b${escaped}\\b`, "i"), "______");
    return replaced === example ? `${example} (Target word: ______)` : replaced;
  }

  function normalizeAnswer(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z-]/g, "");
  }

  function sessionName(mode) {
    return mode === "new" ? "New words" : mode === "due" ? "Due review" : "Daily session";
  }

  function stat(label, value) {
    return `<div><strong>${value}</strong><span>${label}</span></div>`;
  }

  function pronounce(word, locale) {
    if (!("speechSynthesis" in window) || !word) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = locale || "en-US";
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      console.warn("Vocabulary progress could not be read.", error);
      return {};
    }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.AHVocabularyTrainer = {
    init,
    calculateSchedule,
    isMastered
  };
})();
