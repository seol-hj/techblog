---
title: Cloud Monitoring & Cloud Logging
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - GCP
  - Monitoring
  - Logging
---

**메트릭** : 수치형 상태 데이터
- 특징
	- 대시보드와 알림
	- 임계값 기반 감시
	- 시간에 따른 추세 분석

**로그** : 이벤트 기록 데이터
- 특징
	- 문제 원인 분석
	- 특정 시점의 상세 상황 파악
	- 필터링과 검색 중요

## Cloud Monitoring

- 리소스를 메트릭 기반으로 관찰

- 주요 기능
	- Metrics Explorer
	- Dashboard
	- Alerting Policy
	- Uptime Check
	- SLO/SLI 관련 기능

1. **Compute Engine**
	- CPU 사용률
	- 네트워크 입출력
	- 디스크 사용량
	- 인스턴스 상태

2. **Load Balancer**
	- 요청 수
	- 지연 시간
	- 백엔드 상태
	- 헬스 체크 결과

3. **Cloud SQL**
	- CPU 사용률
	- 메모리 사용률
	- 스토리지 사용량
	- 연결 수
	- 응답 지연 관련 지표

4. **Cloud Storage**
	- 접근 로그, 사용량 분석은 주로 로그/사용량에서 확인
	- 일부 모니터링 지표와 감사 로그 함께 봄

## Cloud Logging

- 로그 데이터 수집, 저장, 검색, 분석 서비스

- 주요 기능
	- Log Explorer
	- Query 기반 검색
	- 로그 라우터
	- 로그 싱크
	- 보관 및 라우팅

#### 대시보드 (Dashboard)

- 대시보드를 생성해 여러 메트릭을 한 화면에서 볼 수 있게 함

#### Alerting Policy

- 특정 조건에서 알림

#### Uptime Check

- 외부에서 특정 엔드포인트가 살아있는지 확인

#### Log Explorer

- 특정 리소스의 로그 검색, 필터링, 시간 범위를 조정해 문제 분석

>[!info] 요약
>**Cloud Monitoring** → 메트릭, 이벤트, 업타임 관찰  
>**Cloud Logging** → 로그 저장, 검색, 분석, 내보내기 담당  
>**메트릭** → 상태를 수치로, **로그** → 이벤트를 기록으로 보여줌  
>**AWS CloudWatch → GCP Monitoring / Logging** 분리  
>**대시보드** → 자주 보는 운영 지표 한 화면에 모아줌  
>**Alerting Policy** → 이상 징후를 임계값 기반으로 알려줌  
>**Log Explorer** → 문제 원인을 추적하는 핵심 도구  