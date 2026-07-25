"use strict";

const MF_STORAGE_KEY = "math-flow-alpha-1-state";

let mfState = loadState();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

function loadState() {
  try {
    const saved = localStorage.getItem(MF_STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : clone(MF_INITIAL_STATE);
  } catch {
    return clone(MF_INITIAL_STATE);
  }
}

function saveState(message = true) {
  localStorage.setItem(
    MF_STORAGE_KEY,
    JSON.stringify(mfState)
  );

  if (message) {
    showToast("저장되었습니다.");
  }
}

function allLessons() {
  return mfState.books.flatMap(book =>
    book.lessons.map(lesson => ({
      ...lesson,
      bookId: book.id,
      bookName: book.name,
      bookColor: book.color
    }))
  );
}

function chapterStats(chapterName) {
  const lessons = allLessons().filter(
    lesson => lesson.chapter === chapterName
  );

  const done = lessons.filter(
    lesson => Boolean(lesson.completedDate)
  ).length;

  let status = "empty";

  if (lessons.length > 0 && done === lessons.length) {
    status = "complete";
  } else if (done > 0) {
    status = "progress";
  } else if (lessons.length > 0) {
    status = "ready";
  }

  return {
    total: lessons.length,
    done,
    percent: lessons.length
      ? Math.round((done / lessons.length) * 100)
      : 0,
    status
  };
}

function trackStats(track) {
  const chapters = track.chapters.map(chapter => ({
    name: chapter,
    ...chapterStats(chapter)
  }));

  const total = chapters.reduce(
    (sum, chapter) => sum + chapter.total,
    0
  );

  const done = chapters.reduce(
    (sum, chapter) => sum + chapter.done,
    0
  );

  return {
    chapters,
    total,
    done,
    percent: total
      ? Math.round((done / total) * 100)
      : 0
  };
}

function findCurrentPosition() {
  const registered = MF_TRACKS.flatMap(track =>
    track.chapters.map(chapter => ({
      track,
      chapter,
      stats: chapterStats(chapter)
    }))
  ).filter(item => item.stats.total > 0);

  const progress = registered.find(
    item => item.stats.status === "progress"
  );

  if (progress) {
    return progress;
  }

  const ready = registered.find(
    item => item.stats.status === "ready"
  );

  if (ready) {
    return ready;
  }

  return registered.at(-1) || null;
}

function nextChapter(current) {
  if (!current) {
    return null;
  }

  const index = current.track.chapters.indexOf(
    current.chapter
  );

  return current.track.chapters[index + 1] || null;
}

function renderAll() {
  renderCurrentPosition();
  renderToday();
  renderFlowMap();
  renderReports();
  renderLibrary();
}

function renderCurrentPosition() {
  const todayTarget = document.getElementById(
    "currentPosition"
  );

  const flowTarget = document.getElementById(
    "flowSummary"
  );

  const current = findCurrentPosition();

  if (!current) {
    const empty = `
      <div class="empty">
        현재 위치를 계산할 Lesson이 없습니다.<br>
        Library에서 문제집 진도를 입력해주세요.
      </div>
    `;

    todayTarget.innerHTML = empty;
    flowTarget.innerHTML = empty;
    return;
  }

  const next = nextChapter(current);

  const html = `
    <section class="current-card">
      <div class="current-label">📍 현재 위치</div>

      <h2 class="current-title">
        ${escapeHtml(current.chapter)}
      </h2>

      <div class="current-detail">
        ${escapeHtml(current.track.name)} 계통
        · ${current.stats.done}/${current.stats.total} Lesson 완료
        · ${current.stats.percent}%
      </div>

      <div class="current-next">
        다음 흐름
        <strong>
          ${next ? escapeHtml(next) : "현재 계통 완료"}
        </strong>
      </div>
    </section>
  `;

  todayTarget.innerHTML = html;
  flowTarget.innerHTML = html;
}

function renderToday() {
  const target = document.getElementById("todayList");

  const nextItems = mfState.books
    .map(book => {
      const lesson = book.lessons.find(
        item => !item.completedDate
      );

      return lesson ? { book, lesson } : null;
    })
    .filter(Boolean);

  if (nextItems.length === 0) {
    target.innerHTML = `
      <div class="empty">
        다음에 풀 Lesson이 없습니다.<br>
        Library에서 Lesson을 입력하거나 완료 기록을 확인해주세요.
      </div>
    `;
    return;
  }

  target.innerHTML = nextItems.map(item => `
    <article
      class="today-card"
      style="--book-color:${item.book.color}">

      <div class="today-head">
        <span class="book-dot"></span>

        <div class="today-info">
          <div class="today-book">
            ${escapeHtml(item.book.name)}
          </div>

          <div class="today-chapter">
            ${escapeHtml(item.lesson.chapter)}
          </div>

          <div class="today-lesson">
            ${escapeHtml(item.lesson.name)}
          </div>

          <div class="today-page">
            ${pageText(item.lesson)}
          </div>
        </div>

        <button
          class="complete-button"
          type="button"
          onclick="completeLesson(
            '${item.book.id}',
            '${item.lesson.id}'
          )">
          완료
        </button>
      </div>
    </article>
  `).join("");
}

function renderFlowMap() {
  const target = document.getElementById("flowMap");

  target.className = "flow-grid";

  target.innerHTML = MF_TRACKS.map(track => {
    const stats = trackStats(track);

    const open = mfState.openTracks.includes(track.id);

    const nodes = stats.chapters.map(chapter => `
      <div class="flow-node ${chapter.status}">
        <span class="node-marker">
          ${statusMarker(chapter.status)}
        </span>

        <div class="node-info">
          <span class="node-title">
            ${escapeHtml(chapter.name)}
          </span>

          <span class="node-detail">
            ${chapter.total > 0
              ? `${chapter.done}/${chapter.total} Lesson 완료`
              : "Library에서 Lesson을 입력하세요"}
          </span>
        </div>

        <span class="node-status">
          ${statusText(chapter.status)}
        </span>
      </div>
    `).join("");

    return `
      <section
        class="flow-track ${open ? "open" : ""}"
        style="
          --track-color:${track.color};
          --track-light:${track.light};
        ">

        <button
          class="track-header"
          type="button"
          onclick="toggleTrack('${track.id}')">

          <span class="track-number">
            ${track.number}
          </span>

          <span class="track-info">
            <strong>${escapeHtml(track.name)}</strong>

            <small>
              ${stats.done}/${stats.total} Lesson 완료
            </small>
          </span>

          <span class="track-rate">
            ${stats.percent}%
          </span>

          <span class="track-arrow">›</span>
        </button>

        <div class="flow-path">
          ${nodes}
        </div>
      </section>
    `;
  }).join("");
}

function renderReports() {
  const bookTarget = document.getElementById("bookReport");
  const trackTarget = document.getElementById("trackReport");

  bookTarget.className = "report-grid";

  bookTarget.innerHTML = mfState.books.map(book => {
    const total = book.lessons.length;
    const done = book.lessons.filter(
      lesson => lesson.completedDate
    ).length;

    const percent = total
      ? Math.round((done / total) * 100)
      : 0;

    return `
      <div class="report-box">
        <strong style="color:${book.color}">
          ${escapeHtml(book.shortName)}
        </strong>

        <span class="report-number">
          ${done}/${total}
        </span>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="
              width:${percent}%;
              background:${book.color};
            ">
          </div>
        </div>
      </div>
    `;
  }).join("");

  trackTarget.innerHTML = MF_TRACKS.map(track => {
    const stats = trackStats(track);

    return `
      <div class="track-report-row">
        <div class="track-report-head">
          <strong>${escapeHtml(track.name)}</strong>
          <span>${stats.percent}%</span>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="
              width:${stats.percent}%;
              background:${track.color};
            ">
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderLibrary() {
  const target = document.getElementById("libraryList");

  target.className = "library-grid";

  target.innerHTML = mfState.books.map(book => {
    const options = MF_CHAPTERS.map(chapter => `
      <option value="${escapeAttribute(chapter)}">
        ${escapeHtml(chapter)}
      </option>
    `).join("");

    const grouped = groupLessons(book.lessons);

    const lessonHtml = Object.entries(grouped)
      .map(([chapter, lessons]) => `
        <section class="chapter-group">
          <div class="chapter-title">
            ${escapeHtml(chapter)}
          </div>

          ${lessons.map(lesson => `
            <div class="lesson-row
              ${lesson.completedDate ? "done" : ""}">

              <div>
                <span class="lesson-name">
                  ${escapeHtml(lesson.name)}
                </span>

                <span class="lesson-page">
                  ${pageText(lesson)}
                </span>
              </div>

              <button
                class="date-button
                  ${lesson.completedDate ? "done" : ""}"
                type="button"
                onclick="editLessonDate(
                  '${book.id}',
                  '${lesson.id}'
                )">

                ${lesson.completedDate
                  ? shortDate(lesson.completedDate)
                  : "완료"}
              </button>

              <button
                class="delete-button"
                type="button"
                onclick="deleteLesson(
                  '${book.id}',
                  '${lesson.id}'
                )">
                ×
              </button>
            </div>
          `).join("")}
        </section>
      `)
      .join("");

    return `
      <article
        class="book-card ${book.open ? "open" : ""}"
        style="--book-color:${book.color}">

        <button
          class="book-header"
          type="button"
          onclick="toggleBook('${book.id}')">

          <span class="book-icon">
            ${escapeHtml(book.shortName.slice(0, 1))}
          </span>

          <span class="book-title">
            <strong>${escapeHtml(book.name)}</strong>

            <small>
              ${book.lessons.filter(item => item.completedDate).length}
              /
              ${book.lessons.length}
              Lesson 완료
            </small>
          </span>

          <span class="book-arrow">›</span>
        </button>

        <div class="book-content">
          <div class="field">
            <label for="chapter-${book.id}">
              입력할 대단원
            </label>

            <select id="chapter-${book.id}">
              ${options}
            </select>
          </div>

          <div class="field">
            <label for="bulk-${book.id}">
              Lesson 빠른 입력
            </label>

            <textarea
              id="bulk-${book.id}"
              placeholder="분수의 의미, 12, 15&#10;단위분수, 16, 18&#10;분수 비교, 19, 22"></textarea>
          </div>

          <p class="input-help">
            한 줄에 하나씩
            <b>Lesson 이름, 시작 페이지, 끝 페이지</b>를 입력하세요.
          </p>

          <button
            class="import-button"
            type="button"
            onclick="importLessons('${book.id}')">
            입력한 Lesson 한 번에 추가
          </button>

          ${lessonHtml || `
            <div class="empty" style="margin-top:10px">
              아직 입력된 Lesson이 없습니다.
            </div>
          `}
        </div>
      </article>
    `;
  }).join("");
}

function importLessons(bookId) {
  const book = findBook(bookId);

  const chapterInput = document.getElementById(
    `chapter-${bookId}`
  );

  const bulkInput = document.getElementById(
    `bulk-${bookId}`
  );

  if (!book || !chapterInput || !bulkInput) {
    return;
  }

  const chapter = chapterInput.value;

  const lines = bulkInput.value
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    alert("입력할 Lesson을 적어주세요.");
    return;
  }

  const lessons = [];

  lines.forEach(line => {
    const parts = line
      .split(/[,\t]/)
      .map(value => value.trim());

    const name = parts[0];

    if (!name) {
      return;
    }

    lessons.push({
      id: makeId(),
      chapter,
      name,
      startPage: normalizePage(parts[1]),
      endPage: normalizePage(parts[2]),
      completedDate: ""
    });
  });

  if (lessons.length === 0) {
    alert("추가할 수 있는 Lesson이 없습니다.");
    return;
  }

  book.lessons.push(...lessons);
  bulkInput.value = "";

  saveState();
  renderAll();
}

function completeLesson(bookId, lessonId) {
  const lesson = findLesson(bookId, lessonId);

  if (!lesson) {
    return;
  }

  lesson.completedDate = todayIso();

  saveState();
  renderAll();
}

function editLessonDate(bookId, lessonId) {
  const lesson = findLesson(bookId, lessonId);

  if (!lesson) {
    return;
  }

  const value = prompt(
    "완료 날짜를 입력하세요.\n" +
    "예: 2026-07-25\n\n" +
    "완료 기록을 삭제하려면 빈칸으로 저장하세요.",
    lesson.completedDate || todayIso()
  );

  if (value === null) {
    return;
  }

  const date = value.trim();

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    alert("날짜를 2026-07-25 형식으로 입력해주세요.");
    return;
  }

  lesson.completedDate = date;

  saveState();
  renderAll();
}

function deleteLesson(bookId, lessonId) {
  const book = findBook(bookId);
  const lesson = findLesson(bookId, lessonId);

  if (!book || !lesson) {
    return;
  }

  if (!confirm(`"${lesson.name}"을 삭제할까요?`)) {
    return;
  }

  book.lessons = book.lessons.filter(
    item => item.id !== lessonId
  );

  saveState();
  renderAll();
}

function toggleBook(bookId) {
  const book = findBook(bookId);

  if (!book) {
    return;
  }

  book.open = !book.open;

  saveState(false);
  renderLibrary();
}

function toggleTrack(trackId) {
  if (mfState.openTracks.includes(trackId)) {
    mfState.openTracks = mfState.openTracks.filter(
      id => id !== trackId
    );
  } else {
    mfState.openTracks.push(trackId);
  }

  saveState(false);
  renderFlowMap();
}

function findBook(bookId) {
  return mfState.books.find(book => book.id === bookId);
}

function findLesson(bookId, lessonId) {
  return findBook(bookId)?.lessons.find(
    lesson => lesson.id === lessonId
  );
}

function groupLessons(lessons) {
  return lessons.reduce((groups, lesson) => {
    groups[lesson.chapter] ||= [];
    groups[lesson.chapter].push(lesson);
    return groups;
  }, {});
}

function normalizePage(value) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0
    ? String(number)
    : "";
}

function pageText(lesson) {
  if (lesson.startPage && lesson.endPage) {
    return `${lesson.startPage}~${lesson.endPage}페이지`;
  }

  if (lesson.startPage) {
    return `${lesson.startPage}페이지부터`;
  }

  return "페이지 미입력";
}

function statusMarker(status) {
  return {
    complete: "✓",
    progress: "●",
    ready: "→",
    empty: "○"
  }[status];
}

function statusText(status) {
  return {
    complete: "완료",
    progress: "진행 중",
    ready: "준비됨",
    empty: "미등록"
  }[status];
}

function todayIso() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function shortDate(date) {
  const parts = String(date).split("-");

  return parts.length === 3
    ? `${Number(parts[1])}/${Number(parts[2])}`
    : date;
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle(
      "active",
      screen.id === screenId
    );
  });

  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.screen === screenId
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.mfToastTimer);

  window.mfToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1300);
}

function exportBackup() {
  const backup = {
    app: "Math Flow",
    version: "Alpha 1.0",
    exportedAt: new Date().toISOString(),
    state: mfState
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "Math_Flow_Alpha1_Backup.json";
  link.click();

  URL.revokeObjectURL(link.href);
}

function restoreBackup(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);

      if (!backup.state?.books) {
        throw new Error("Invalid backup");
      }

      mfState = backup.state;
      saveState(false);
      renderAll();

      alert("백업을 복원했습니다.");
    } catch {
      alert("올바른 Math Flow 백업 파일이 아닙니다.");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value ?? "");
}

document.querySelectorAll(".nav-button").forEach(button => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screen);
  });
});

renderAll();
