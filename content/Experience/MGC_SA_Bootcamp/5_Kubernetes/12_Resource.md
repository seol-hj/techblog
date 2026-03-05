---
title: Resource 관리
draft: false
date: 2026-03-04
updated: 2026-03-04
tags:
  - Containers
  - Kubernetes
  - HPA
---

- **requests**
	- 스케줄러가 이 파드가 최소로 필요로 하는 자원 으로 간주
	- 노드에 파드를 배치할 때, 노드의 allocatable에서 requests 합을 보고 배치
	- **배치(스케줄링)의 기준**
- **limits**
	- 컨테이너가 최대로 쓸 수 있는 자원 상한
	- CPU → CFS quota로 제한
	- Memory → 초과 시 OOMKilled 가능
	- **실행 중 자원 사용 상한(격리)의 기준**

- CPU 단위
	- `500m` = 0.5 코어
	- `1` = 1 코어
	- CPU 압박 시 throttling(느려짐)으로 나타남
- Memory 단위
	- `Mi`, `Gi` 같은 이진 단위
	- Memory는 limits 초과 시 OOMKilled로 종료

### QoS 클래스

- **Guaranteed** : `requests == limits` , CPU/Memory 모두 지정한 경우
- **Burstable** : `requests < limits`
- **BestEffort** : requests/limits 둘 다 미지정
- 노드 메모리 부족 같은 상황에서 퇴출(eviction) 우선 순위
	- `BestEffort → Burstable → Guaranteed`

- 클러스터 자원 확인
	```
	kubectl get nodes  
	kubectl describe node <노드이름> | egrep -n "Allocatable|Capacity|cpu|memory|Pods"
	```
	- `Capacity` → 노드 물리/가사 머신의 전체 자원
	- `Allocatable` → 쿠버네티스가 파드에 할당 가능한 자원 (시스템/쿠버네티스 예약분 제외)
	- Non-terminated Pods
		- 현재 노드에서 실행 중인 Pod가 자원을 얼마나 점유하고 있는지 보여줌


### 조직 정책 적용 (ResourceQuota/LimitRange)

| **구분**    | **ResourceQuota (자원 할당량)**   | **LimitRange (자원 범위 제한)**    |
| --------- | ---------------------------- | ---------------------------- |
| **관리 대상** | **네임스페이스 전체**의 자원 합계         | **개별 컨테이너/파드**의 자원 설정        |
| **주요 목적** | 특정 팀/프로젝트의 자원 독점 방지          | 개별 파드의 잘못된 설정 방지 및 자동화       |
| **주요 기능** | CPU/Mem 합계, 파드 개수, PVC 개수 제한 | 기본값 부여(Default), 최소/최대 범위 강제 |

- 네임 스페이스 단위로 requests/limits 총량 제한
- 팀 별 멀티테넌시 환경에서 필수

### Horizontal Pod Autoscaling

- replicas를 사용하는 리소스에 적용
- cpu, memory 등의 사용량 측정 → 정해진 값 이상 시 replicas를 수평 확장 or 내려갈 시 줄임

- *metrics-server 사용 실습*
	- HPA는 메트릭이 없으면 동작 X
	- CPU, Memory 기준
	- `Prometheus` : 클러스터의 모든 상태를 기록하는 거대한 데이터베이스
	- `Prometheus Adapter` : Prometheus에 쌓인 데이터를 HPA가 이해할 수 있는 규격으로 전달
		- 현재 접속 중인 사용자 수, 대기 중인 메시지 큐의 개수 등을 기준으로 파드 조절
