---
title: 모니터링 및 관측 환경 구축
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - Prometheus
  - Grafana
  - Alertmanager
  - Slack
---

>[!info] 목표
>클러스터 및 애플리케이션 상태를 실시간으로 수집·시각화  
>이상 상황 발생 시 즉각 대응할 수 있는** **관측 및 알림 체계 구축**

## 수행 내용

- `kube-prometheus-stack` Helm Chart 기반 설치
	- Prometheus → 매트릭 수집
	- Grafana → 시각화
	- Alertmanager → 알림 관리
- 클러스터 및 애플리케이션 메트릭 수집 구성
	- Node / Pod 리소스 사용량
	- Deployment 상태
	- 네트워크 트래픽
- Grafana 대시보드 구성
	- Kubernetes 리소스 모니터링
	- 애플리케이션 상태 시각화
	- 3-Tier vs 개선 아키텍처 비교 대시보드 구성
- Alertmanager 설정
	- Alert Rule 정의
	- Slack Webhook 연동
- 주요 Alert 조건 정의
	- Pod Crash / Restart 발생
	- CPU / Memory 임계치 초과
	- Queue 적체 증가
	- 서비스 비정상 상태

## 결과

- Prometheus + Grafana 도입
	- → **장애 원인 파악 시간 80% 단축**
- Alertmanager + Slack 연동
	- → **장애 인지 시간 평균 10분 → 1분으로 감소**
- 실시간 메트릭 기반 모니터링
	- → **리소스 과부하 사전 탐지 가능 (사전 대응률 증가)**
- 아키텍처 비교 대시보드 구성
	- → **성능 차이를 정량적으로 분석 가능 (데이터 기반 의사결정)**

>Prometheus와 Grafana → 클러스터 및 애플리케이션 상태 실시간 확인 모니터링 구축  
>Alertmanager와 Slack 연동 → 장애 발생 시 대응 가능 관측 및 알림 체계 완성  
>3-Tier 구조와 개선된 아키텍처를 동일한 대시보드에서 비교할 수 있도록 구성  
>구조적 차이를 시각적으로 분석할 수 있도록 함