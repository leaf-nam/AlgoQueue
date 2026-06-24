# AlgoQueue

코딩 테스트 문제 풀이 기록 및 복습 관리 플랫폼

## Overview

SolveQueue는 코딩 테스트 학습 과정에서 푼 문제와 풀어야 할 문제를 체계적으로 관리하기 위한 서비스입니다.

단순히 문제를 저장하는 것이 아니라, 풀이 기록을 기반으로 복습 우선순위를 계산하여 다음에 풀어야 할 문제를 자동으로 추천합니다.

## Features

### 문제 관리

* 푼 문제 목록 조회
* 문제 분류 및 카테고리 관리
* 문제 숨김 처리 기능
* 언어별 풀이 기록 관리

### 복습 추천

다음에 풀어야 할 문제를 자동으로 추천합니다.

추천 우선순위

1. 문제 풀이 실패
2. 목표 시간 초과
3. 마지막 풀이 후 3일 이상 경과
4. 최근에 풀이하지 않은 문제

### 풀이 기록

* 풀이 성공 여부 기록
* 실제 풀이 시간 기록
* 목표 풀이 시간 설정
* 풀이 이력 조회

### 타이머

* 문제 풀이 시간 측정
* 목표 시간 대비 결과 확인

### 언어 관리

지원 언어

* Java
* C++

## System Architecture

```text
Client (React)
        │
        ▼
Spring Boot API
        │
        ▼
      MySQL
```

## Tech Stack

### Backend

* Java 21
* Spring Boot
* Spring Data JPA
* QueryDSL
* Gradle

### Frontend

* React
* TypeScript

### Database

* MySQL

### Infrastructure

* Docker
* Nginx
* AWS EC2
* GitHub Actions

## Database Model

### Problem

문제 정보 관리

### Category

문제 분류 정보 관리

### ProblemSetting

문제별 목표 시간 및 언어 설정 관리

### SolveHistory

풀이 이력 관리

## Future Plans

* 백준 문제 연동
* 프로그래머스 문제 연동
* 복습 주기 자동 계산
* 언어별 통계 제공
* 카테고리별 정답률 제공
* GitHub 풀이 기록 연동

## License

This project is for personal learning and portfolio purposes.

<h2 class="sr-only">코테 자동기록 프로그램 API 목록</h2>

<style>
  .api-wrap { padding: 1rem 0; font-size: 14px; }
  .section { margin-bottom: 2rem; }
  .section-title {
    font-size: 13px; font-weight: 500; color: var(--color-text-secondary);
    text-transform: uppercase; letter-spacing: 0.08em;
    margin: 0 0 10px; padding-bottom: 6px;
    border-bottom: 0.5px solid var(--color-border-tertiary);
  }
  .api-row {
    display: grid; grid-template-columns: 72px 230px 1fr;
    align-items: start; gap: 10px;
    padding: 8px 0; border-bottom: 0.5px solid var(--color-border-tertiary);
  }
  .api-row:last-child { border-bottom: none; }
  .badge {
    display: inline-block; font-size: 11px; font-weight: 500;
    padding: 2px 8px; border-radius: 4px; letter-spacing: 0.03em;
  }
  .GET    { background: #E6F1FB; color: #0C447C; }
  .POST   { background: #EAF3DE; color: #27500A; }
  .PUT    { background: #FAEEDA; color: #633806; }
  .DELETE { background: #FCEBEB; color: #791F1F; }
  .endpoint { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-primary); word-break: break-all; }
  .desc { font-size: 13px; color: var(--color-text-secondary); padding-top: 1px; }
</style>

<div class="api-wrap">

  <div class="section">
    <p class="section-title">Problem — 문제 관리</p>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/problems</span><span class="desc">문제 목록 조회 (플랫폼·카테고리·숨김 필터, 정렬 포함)</span></div>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/problems/{id}</span><span class="desc">문제 단건 조회</span></div>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/problems</span><span class="desc">문제 등록</span></div>
    <div class="api-row"><span class="badge PUT">PUT</span><span class="endpoint">/api/problems/{id}</span><span class="desc">문제 수정 (제목·난이도·카테고리)</span></div>
    <div class="api-row"><span class="badge PUT">PUT</span><span class="endpoint">/api/problems/{id}/hidden</span><span class="desc">문제 숨김 여부 토글</span></div>
    <div class="api-row"><span class="badge DELETE">DELETE</span><span class="endpoint">/api/problems/{id}</span><span class="desc">문제 삭제</span></div>
  </div>

  <div class="section">
    <p class="section-title">Recommend — 추천 문제</p>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/users/{userId}/problems/recommend</span><span class="desc">다음으로 풀어야 할 문제 조회 (실패 → 목표초과 → 3일경과 → 오래된 순)</span></div>
  </div>

  <div class="section">
    <p class="section-title">Category — 문제 분류</p>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/categories</span><span class="desc">카테고리 목록 조회 (숨김 필터 포함)</span></div>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/categories</span><span class="desc">카테고리 생성</span></div>
    <div class="api-row"><span class="badge PUT">PUT</span><span class="endpoint">/api/categories/{id}</span><span class="desc">카테고리명 수정</span></div>
    <div class="api-row"><span class="badge PUT">PUT</span><span class="endpoint">/api/categories/{id}/hidden</span><span class="desc">카테고리 숨김 여부 토글</span></div>
    <div class="api-row"><span class="badge DELETE">DELETE</span><span class="endpoint">/api/categories/{id}</span><span class="desc">카테고리 삭제</span></div>
  </div>

  <div class="section">
    <p class="section-title">ProblemSetting — 문제별 사용자 설정</p>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/users/{userId}/problem-settings</span><span class="desc">사용자 전체 문제 설정 조회</span></div>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/users/{userId}/problem-settings/{problemId}</span><span class="desc">특정 문제 설정 조회 (목표시간·언어·체감난이도)</span></div>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/users/{userId}/problem-settings</span><span class="desc">문제 설정 생성 (언어·목표시간·체감난이도)</span></div>
    <div class="api-row"><span class="badge PUT">PUT</span><span class="endpoint">/api/users/{userId}/problem-settings/{problemId}</span><span class="desc">문제 설정 수정</span></div>
  </div>

  <div class="section">
    <p class="section-title">SolveHistory — 풀이 이력</p>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/users/{userId}/solve-histories</span><span class="desc">풀이 이력 목록 조회 (문제·성공여부·언어·날짜 필터, 정렬)</span></div>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/users/{userId}/solve-histories/{id}</span><span class="desc">풀이 이력 단건 조회</span></div>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/users/{userId}/solve-histories</span><span class="desc">풀이 이력 기록 (성공여부·풀이시간·언어·회고)</span></div>
    <div class="api-row"><span class="badge PUT">PUT</span><span class="endpoint">/api/users/{userId}/solve-histories/{id}/memo</span><span class="desc">회고(memo) 수정</span></div>
    <div class="api-row"><span class="badge DELETE">DELETE</span><span class="endpoint">/api/users/{userId}/solve-histories/{id}</span><span class="desc">풀이 이력 삭제</span></div>
  </div>

  <div class="section">
    <p class="section-title">Timer — 타이머</p>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/timer/start</span><span class="desc">타이머 시작 (problemId·userId 전달, 서버 시작 시각 기록)</span></div>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/timer/stop</span><span class="desc">타이머 종료 → elapsed_time 계산 후 반환</span></div>
  </div>

  <div class="section">
    <p class="section-title">User — 사용자</p>
    <div class="api-row"><span class="badge POST">POST</span><span class="endpoint">/api/users</span><span class="desc">사용자 등록</span></div>
    <div class="api-row"><span class="badge GET">GET</span><span class="endpoint">/api/users/{id}</span><span class="desc">사용자 정보 조회</span></div>
  </div>

</div>

