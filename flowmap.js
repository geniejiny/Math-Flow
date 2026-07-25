(() => {
  "use strict";

  
  /*
   * Math Flow Alpha 0.4
   * Library에 입력된 Lesson을 기준으로
   * 계통별 현재 위치를 계산해 표시합니다.
   */

  const FLOW_TRACKS = [
    {
      id: "calculation",
      number: 1,
      name: "자연수 계산",
      color: "#4b9562",
      light: "#eff8f1",
      chapters: [
        "3-1 덧셈과 뺄셈",
        "3-1 나눗셈",
        "3-1 곱셈",
        "3-2 곱셈",
        "3-2 나눗셈",
        "4-1 큰 수",
        "4-1 곱셈과 나눗셈",
        "5-1 자연수의 혼합 계산",
        "5-2 수의 범위와 어림하기"
      ]
    },
    {
      id: "fraction",
      number: 2,
      name: "분수·소수",
      color: "#3979bd",
      light: "#f0f6fc",
      chapters: [
        "3-1 분수와 소수",
        "3-2 분수",
        "4-2 분수의 덧셈과 뺄셈",
        "4-2 소수의 덧셈과 뺄셈",
        "5-1 약수와 배수",
        "5-1 약분과 통분",
        "5-1 분수의 덧셈과 뺄셈",
        "5-2 분수의 곱셈",
        "5-2 소수의 곱셈",
        "6-1 분수의 나눗셈",
        "6-1 소수의 나눗셈",
        "6-2 분수의 나눗셈",
        "6-2 소수의 나눗셈"
      ]
    },
    {
      id: "geometry",
      number: 3,
      name: "도형",
      color: "#8658a6",
      light: "#f7f2fa",
      chapters: [
        "3-1 평면도형",
        "3-2 원",
        "4-1 각도",
        "4-1 평면도형의 이동",
        "4-2 삼각형",
        "4-2 사각형",
        "4-2 다각형",
        "5-2 합동과 대칭",
        "5-2 직육면체",
        "6-1 각기둥과 각뿔",
        "6-2 공간과 입체",
        "6-2 원기둥·원뿔·구"
      ]
    },
    {
      id: "measurement",
      number: 4,
      name: "측정",
      color: "#d9863b",
      light: "#fff6ed",
      chapters: [
        "3-1 길이와 시간",
        "3-2 들이와 무게",
        "5-1 다각형의 둘레와 넓이",
        "6-1 직육면체의 겉넓이와 부피",
        "6-2 원의 넓이"
      ]
    },
    {
      id: "pattern",
      number: 5,
      name: "규칙·비례",
      color: "#338b8b",
      light: "#eef9f9",
      chapters: [
        "4-1 규칙 찾기",
        "5-1 규칙과 대응",
        "6-1 비와 비율",
        "6-2 비례식과 비례배분"
      ]
    },
    {
      id: "data",
      number: 6,
      name: "자료와 가능성",
      color: "#c75e86",
      light: "#fff1f6",
      chapters: [
        "3-2 자료의 정리",
        "4-1 막대그래프",
        "4-2 꺾은선그래프",
        "5-2 평균과 가능성",
        "6-1 여러 가지 그래프"
      ]
    }
  ];

  function installFlowMap() {
    addFlowStyles();
    addFlowScreen();
    addFlowNavigation();
    connectToExistingRender();
    renderFlowMap();
  }

  function addFlowStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .bottom-nav {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .flow-current-card {
        position: relative;
        overflow: hidden;
        margin-bottom: 11px;
        padding: 15px;
        border: 1px solid #cad7e5;
        border-radius: 17px;
        color: white;
        background:
          linear-gradient(135deg, #143b67 0%, #3979bd 100%);
        box-shadow: 0 6px 22px rgba(20, 59, 103, 0.18);
      }

      .flow-current-card::after {
        content: "";
        position: absolute;
        top: -60px;
        right: -55px;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.09);
      }

      .flow-current-label {
        position: relative;
        z-index: 1;
        margin-bottom: 7px;
        color: #d8e8fa;
        font-size: 11px;
        font-weight: 850;
      }

      .flow-current-title {
        position: relative;
        z-index: 1;
        margin: 0;
        font-size: 22px;
        font-weight: 900;
        letter-spacing: -0.7px;
      }

      .flow-current-track {
        position: relative;
        z-index: 1;
        margin-top: 5px;
        color: #edf6ff;
        font-size: 12px;
        font-weight: 700;
      }

      .flow-next {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.23);
        color: #ffffff;
        font-size: 11px;
      }

      .flow-next strong {
        font-weight: 900;
      }

      .flow-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
        margin-top: 12px;
      }

      .flow-summary-item {
        min-width: 0;
        padding: 8px 5px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.10);
        text-align: center;
      }

      .flow-summary-item strong {
        display: block;
        font-size: 15px;
        font-weight: 900;
      }

      .flow-summary-item span {
        display: block;
        margin-top: 2px;
        color: #d8e8fa;
        font-size: 9px;
        font-weight: 750;
      }

      .flow-track-card {
        --flow-color: #3979bd;
        --flow-light: #f0f6fc;

        overflow: hidden;
        margin-bottom: 11px;
        border: 1.5px solid var(--flow-color);
        border-radius: 16px;
        background: white;
        box-shadow: var(--shadow);
      }

      .flow-track-header {
        display: flex;
        align-items: center;
        gap: 9px;
        width: 100%;
        min-height: 58px;
        padding: 11px 12px;
        border: 0;
        background:
          linear-gradient(90deg, var(--flow-light), white);
        text-align: left;
      }

      .flow-track-number {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        width: 31px;
        height: 31px;
        border-radius: 50%;
        color: white;
        background: var(--flow-color);
        font-size: 12px;
        font-weight: 900;
      }

      .flow-track-info {
        flex: 1;
        min-width: 0;
      }

      .flow-track-info strong {
        display: block;
        color: var(--navy);
        font-size: 16px;
        font-weight: 900;
      }

      .flow-track-info small {
        display: block;
        margin-top: 3px;
        color: var(--muted);
        font-size: 10px;
        font-weight: 750;
      }

      .flow-track-rate {
        flex: 0 0 auto;
        color: var(--flow-color);
        font-size: 14px;
        font-weight: 900;
      }

      .flow-track-arrow {
        flex: 0 0 auto;
        color: var(--muted);
        font-size: 18px;
        transition: transform 0.2s ease;
      }

      .flow-track-card.open .flow-track-arrow {
        transform: rotate(90deg);
      }

      .flow-path {
        display: none;
        padding: 7px 11px 12px;
        border-top: 1px solid var(--line);
        background: #fbfcfd;
      }

      .flow-track-card.open .flow-path {
        display: block;
      }

      .flow-node {
        position: relative;
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
        min-height: 56px;
      }

      .flow-node:not(:last-child)::after {
        content: "";
        position: absolute;
        left: 15px;
        top: 40px;
        bottom: -16px;
        width: 2px;
        background: #d8dee7;
      }

      .flow-node.complete:not(:last-child)::after {
        background: var(--flow-color);
      }

      .flow-node-marker {
        position: relative;
        z-index: 1;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        border: 2px solid #cbd4df;
        border-radius: 50%;
        color: #8a95a3;
        background: white;
        font-size: 11px;
        font-weight: 900;
      }

      .flow-node.complete .flow-node-marker {
        color: white;
        border-color: var(--flow-color);
        background: var(--flow-color);
      }

      .flow-node.progress .flow-node-marker {
        color: white;
        border-color: #d9863b;
        background: #d9863b;
        box-shadow: 0 0 0 4px rgba(217, 134, 59, 0.13);
      }

      .flow-node.ready .flow-node-marker {
        color: var(--flow-color);
        border-color: var(--flow-color);
        background: var(--flow-light);
      }

      .flow-node-info {
        min-width: 0;
        padding: 9px 0;
      }

      .flow-node-title {
        display: block;
        color: var(--text);
        font-size: 13px;
        font-weight: 900;
        overflow-wrap: anywhere;
      }

      .flow-node-detail {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 10px;
        font-weight: 700;
      }

      .flow-node-status {
        min-width: 48px;
        padding: 5px 6px;
        border-radius: 999px;
        color: #75808e;
        background: #eef1f4;
        font-size: 9px;
        font-weight: 900;
        text-align: center;
        white-space: nowrap;
      }

      .flow-node.complete .flow-node-status {
        color: #34784b;
        background: #e8f5eb;
      }

      .flow-node.progress .flow-node-status {
        color: #a55c1e;
        background: #fff0e1;
      }

      .flow-node.ready .flow-node-status {
        color: #2c6da8;
        background: #eaf3fc;
      }

      .flow-map-note {
        margin-top: 11px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 13px;
        color: var(--muted);
        background: white;
        font-size: 11px;
        line-height: 1.6;
      }

      @media (min-width: 700px) {
        .flow-track-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
          align-items: start;
        }

        .flow-track-card {
          margin-bottom: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function addFlowScreen() {
    const main = document.querySelector("main");
    const libraryScreen = document.getElementById("libraryScreen");

    if (!main || !libraryScreen) {
      console.error("Flow Map 화면을 추가할 위치를 찾지 못했습니다.");
      return;
    }

    const screen = document.createElement("section");
    screen.id = "flowScreen";
    screen.className = "screen";

    screen.innerHTML = `
      <div class="card">
        <h1 class="screen-title">Flow Map</h1>

        <p class="screen-description">
          Library에 입력한 Lesson과 완료 날짜를 기준으로
          계통수학의 현재 위치를 보여줍니다.
        </p>
      </div>

      <div id="flowCurrentPosition"></div>
      <div id="flowTrackGrid" class="flow-track-grid"></div>

      <div class="flow-map-note">
        <b>진행률 계산 기준</b><br>
        각 대단원에 등록된 모든 문제집의 Lesson 중
        완료 날짜가 기록된 비율로 계산합니다.
        Lesson을 아직 등록하지 않은 대단원은
        <b>미등록</b>으로 표시됩니다.
      </div>
    `;

    main.insertBefore(screen, libraryScreen);
  }

  function addFlowNavigation() {
    const nav = document.querySelector(".bottom-nav");
    const libraryButton = nav?.querySelector(
      '[data-screen="libraryScreen"]'
    );

    if (!nav || !libraryButton) {
      console.error("Flow Map 메뉴를 추가할 위치를 찾지 못했습니다.");
      return;
    }

    const button = document.createElement("button");

    button.className = "nav-button";
    button.type = "button";
    button.dataset.screen = "flowScreen";

    button.innerHTML = `
      <strong>⌁</strong>
      Flow Map
    `;

    button.addEventListener("click", () => {
      if (typeof window.showScreen === "function") {
        window.showScreen("flowScreen");
      }

      renderFlowMap();
    });

    nav.insertBefore(button, libraryButton);
  }

  function connectToExistingRender() {
    if (typeof window.renderAll !== "function") {
      return;
    }

    const originalRenderAll = window.renderAll;

    window.renderAll = function patchedRenderAll() {
      originalRenderAll();
      renderFlowMap();
    };
  }

  function getAllLessons() {
    if (!window.state || !Array.isArray(window.state.books)) {
      return [];
    }

    return window.state.books.flatMap(book =>
      (book.lessons || []).map(lesson => ({
        ...lesson,
        bookId: book.id,
        bookName: book.name,
        bookColor: book.color
      }))
    );
  }

  function getChapterStats(chapterName) {
    const lessons = getAllLessons().filter(
      lesson => lesson.chapter === chapterName
    );

    const completed = lessons.filter(
      lesson => Boolean(lesson.completedDate)
    ).length;

    let status = "empty";

    if (lessons.length > 0 && completed === lessons.length) {
      status = "complete";
    } else if (completed > 0) {
      status = "progress";
    } else if (lessons.length > 0) {
      status = "ready";
    }

    return {
      total: lessons.length,
      completed,
      percent: lessons.length
        ? Math.round((completed / lessons.length) * 100)
        : 0,
      status
    };
  }

  function getTrackStats(track) {
    const chapterStats = track.chapters.map(chapterName => ({
      chapterName,
      ...getChapterStats(chapterName)
    }));

    const totalLessons = chapterStats.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const completedLessons = chapterStats.reduce(
      (sum, item) => sum + item.completed,
      0
    );

    return {
      chapterStats,
      totalLessons,
      completedLessons,
      percent: totalLessons
        ? Math.round(
            (completedLessons / totalLessons) * 100
          )
        : 0
    };
  }

  function findCurrentPosition() {
    const allChapters = FLOW_TRACKS.flatMap(track =>
      track.chapters.map(chapterName => ({
        track,
        chapterName,
        stats: getChapterStats(chapterName)
      }))
    );

    const inProgress = allChapters.find(
      item => item.stats.status === "progress"
    );

    if (inProgress) {
      return inProgress;
    }

    const ready = allChapters.find(
      item => item.stats.status === "ready"
    );

    if (ready) {
      return ready;
    }

    const completedIndexes = allChapters
      .map((item, index) => ({
        index,
        complete: item.stats.status === "complete"
      }))
      .filter(item => item.complete);

    if (completedIndexes.length > 0) {
      const lastCompletedIndex =
        completedIndexes[completedIndexes.length - 1].index;

      return (
        allChapters[lastCompletedIndex + 1] ||
        allChapters[lastCompletedIndex]
      );
    }

    return allChapters[0] || null;
  }

  function findNextChapter(current) {
    if (!current) {
      return null;
    }

    const chapters = current.track.chapters;
    const index = chapters.indexOf(current.chapterName);

    if (index >= 0 && index < chapters.length - 1) {
      return chapters[index + 1];
    }

    const trackIndex = FLOW_TRACKS.findIndex(
      track => track.id === current.track.id
    );

    return FLOW_TRACKS[trackIndex + 1]?.chapters[0] || null;
  }

  function renderCurrentPosition() {
    const target = document.getElementById(
      "flowCurrentPosition"
    );

    if (!target) {
      return;
    }

    const current = findCurrentPosition();

    if (!current) {
      target.innerHTML = "";
      return;
    }

    const nextChapter = findNextChapter(current);
    const allStats = FLOW_TRACKS.map(getTrackStats);

    const totalLessons = allStats.reduce(
      (sum, item) => sum + item.totalLessons,
      0
    );

    const completedLessons = allStats.reduce(
      (sum, item) => sum + item.completedLessons,
      0
    );

    const activeChapters = FLOW_TRACKS
      .flatMap(track => track.chapters)
      .filter(
        chapter =>
          getChapterStats(chapter).status !== "empty"
      ).length;

    target.innerHTML = `
      <section class="flow-current-card">
        <div class="flow-current-label">
          📍 현재 위치
        </div>

        <h2 class="flow-current-title">
          ${escapeFlow(current.chapterName)}
        </h2>

        <div class="flow-current-track">
          ${escapeFlow(current.track.name)} 계통
          · ${current.stats.percent}% 진행
        </div>

        <div class="flow-summary">
          <div class="flow-summary-item">
            <strong>${completedLessons}</strong>
            <span>완료 Lesson</span>
          </div>

          <div class="flow-summary-item">
            <strong>${totalLessons}</strong>
            <span>등록 Lesson</span>
          </div>

          <div class="flow-summary-item">
            <strong>${activeChapters}</strong>
            <span>등록 대단원</span>
          </div>
        </div>

        <div class="flow-next">
          <span>다음 흐름</span>
          <strong>
            ${nextChapter
              ? escapeFlow(nextChapter)
              : "현재 계통 완료"}
          </strong>
        </div>
      </section>
    `;
  }

  function renderFlowTracks() {
    const target = document.getElementById("flowTrackGrid");

    if (!target) {
      return;
    }

    target.innerHTML = FLOW_TRACKS.map(track => {
      const stats = getTrackStats(track);

      const nodes = stats.chapterStats
        .map((chapter, index) => {
          const marker = getMarkerText(chapter.status);
          const statusText = getStatusText(chapter.status);

          return `
            <div class="flow-node ${chapter.status}">
              <span class="flow-node-marker">
                ${marker}
              </span>

              <div class="flow-node-info">
                <span class="flow-node-title">
                  ${escapeFlow(chapter.chapterName)}
                </span>

                <span class="flow-node-detail">
                  ${chapter.total > 0
                    ? `${chapter.completed} / ${chapter.total} Lesson 완료`
                    : "Library에서 Lesson을 입력하세요"}
                </span>
              </div>

              <span class="flow-node-status">
                ${statusText}
              </span>
            </div>
          `;
        })
        .join("");

      return `
        <section
          class="flow-track-card"
          data-flow-track="${track.id}"
          style="
            --flow-color:${track.color};
            --flow-light:${track.light};
          ">

          <button
            class="flow-track-header"
            type="button"
            data-flow-toggle="${track.id}">

            <span class="flow-track-number">
              ${track.number}
            </span>

            <span class="flow-track-info">
              <strong>${escapeFlow(track.name)}</strong>
              <small>
                ${stats.completedLessons}
                /
                ${stats.totalLessons}
                Lesson 완료
              </small>
            </span>

            <span class="flow-track-rate">
              ${stats.percent}%
            </span>

            <span class="flow-track-arrow">›</span>
          </button>

          <div class="flow-path">
            ${nodes}
          </div>
        </section>
      `;
    }).join("");

    target
      .querySelectorAll("[data-flow-toggle]")
      .forEach(button => {
        button.addEventListener("click", () => {
          const id = button.dataset.flowToggle;

          target
            .querySelector(
              `[data-flow-track="${id}"]`
            )
            ?.classList.toggle("open");
        });
      });
  }

  function getMarkerText(status) {
    switch (status) {
      case "complete":
        return "✓";
      case "progress":
        return "●";
      case "ready":
        return "→";
      default:
        return "○";
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "complete":
        return "완료";
      case "progress":
        return "진행 중";
      case "ready":
        return "준비됨";
      default:
        return "미등록";
    }
  }

  function renderFlowMap() {
    renderCurrentPosition();
    renderFlowTracks();
  }

  function escapeFlow(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      installFlowMap
    );
  } else {
    installFlowMap();
  }
})();
