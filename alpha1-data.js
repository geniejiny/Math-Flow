"use strict";

const MF_BOOKS = [
  {
    id: "basic",
    name: "왕수학 기본",
    shortName: "기본",
    color: "#4e9562"
  },
  {
    id: "skill",
    name: "왕수학 실력",
    shortName: "실력",
    color: "#3979bd"
  },
  {
    id: "advanced",
    name: "점프왕수학 최상위",
    shortName: "최상위",
    color: "#8658a6"
  }
];

const MF_TRACKS = [
  {
    id: "calculation",
    number: 1,
    name: "자연수 계산",
    color: "#4e9562",
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

const MF_CHAPTERS = MF_TRACKS.flatMap(track => track.chapters);

const MF_INITIAL_STATE = {
  version: "1.0",
  books: MF_BOOKS.map(book => ({
    ...book,
    open: book.id === "basic",
    lessons: []
  })),
  openTracks: ["fraction"]
};
