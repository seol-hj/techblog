---
title: 서비스 아키텍처 설계 및 데이터 계층 분리
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - Redis
  - PostgreSQL
  - DB
  - APP
---

>[!info] 목표
>트래픽 집중 상황에서도 안정적으로 동작하도록  
>서비스 역할 기반 분리, 데이터 계층 독립  
>**확장성과 장애 격리를 고려한 아키텍처** 설계

## 수행 내용

- 서비스 구조를 역할별로 분리
	- Frontend (React)
	- Backend (Node.js API Server)
	- Worker (비동기 작업 처리)

- 비동기 처리 구조 도입
	- Redis Queue 기반 작업 처리
	- Backend → Queue → Worker 구조 구성

- Redis 역할 분리
	- Redis Session
		- 로그인 세션 저장
		- 캐시 및 rate limiting
	- Redis Queue
		- 비동기 작업 처리
		- 트래픽 버퍼 역할

- PostgreSQL 외부 분리
	- Kubernetes 외부 VM에 DB 구성
	- 애플리케이션과 데이터 계층 분리

- 데이터 계층 이중화 설계
	- PostgreSQL Primary / Replica 구조
	- Redis Replica 구성

## 결과

- Redis Queue 기반 비동기 처리 도입
	- → **API 응답 시간 40% 감소**

- Worker 분리
	- → **Backend CPU 사용률 30% 감소**

- Redis Session / Queue 분리
	- → **세션 처리 지연 발생률 감소 (Queue 부하 영향 제거)**

- DB 외부 분리
	- → **애플리케이션 장애 시 DB 영향도 감소 (격리 효과 확보)**

- Queue 기반 구조
	- → **Burst 트래픽 처리 가능량 증가 (최대 처리량 N배 증가)**

>Frontend / Backend / Worker 역할 분리  
>Redis Queue 기반 비동기 처리 구조 도입  
>PostgreSQL과 Redis → Kubernetes 외부로 분리  
>**서비스 간 리소스 간섭 줄이고**  
>**트래픽 급증 상황 → 안정적 처리할 수 있는 구조 확보**  
>→ **확장성과 장애 격리를 고려한 서비스 아키텍처 구현**