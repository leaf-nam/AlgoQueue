# SolveQueue

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
