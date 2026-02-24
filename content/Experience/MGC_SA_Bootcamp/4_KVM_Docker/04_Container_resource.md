---
title: 컨테이너 리소스 관리
draft: false
date: 2026-02-24
updated: 2026-02-24
tags:
  - Container
  - Docker
---

### 컨테이너 리소스 제한

>가볍지만 기본적으로 제한 X  
>제한 설정 X = 호스트 전체 자원 사용 가능  
>→ 반드시 제한 설정

## cgroup (Control Group)

- Linux 커널 기능
- 프로세스 그룹 단위로 자원 제한 가능
	- CPU
	- Memory
	- Block I/O
	- PIDs
	- HugePages

- Docker 내부
	- 전용 cgroup 생성
	- 해당 컨테이너 프로세스 묶음
	- 설정값 cgoup 파일에 기록

---

## CPU 리소스 제한

- cpu = 시간 제한
- docker 은 CFS(Completely Fair Scheduler) 사용
	- 기본 기준 100ms (0.1s) = period

#### quota / period

- `quota = period × cpus 값` (기본 period = 100ms)

#### CPU Shares (상대 우선 순위)

- `docker run -d --cpu-shares=512 nginx`
- 기본값 1024
- 경쟁 상황에서만 의미
- 단독 실행 시 효과 X

#### cpuset-cpus (코어 고정)

- `docker run -d --cpuset-cpus="0" nginx`
- 특정 코어만 사용
- NUMA(Non-Uniform Memory Access) 환경에서 중요

---

## Memory 리소스 제한

- cpu → 느려짐 / mem → 프로세스 종료

- 기본 제한 : `docker run -d --memory=256m ubuntu sleep infinity`
	- 최대 RAM 256MB
	- 초과 시 reclaim 후 OOM

#### swap

```
docker run -d \  
  --memory=256m \  
  --memory-swap=512m \  
  ubuntu
```
- RAM 256MB
- RAM + swap 총합 512MB

**swap 완전 금지**

```
docker run -d \  
  --memory=256m \  
  --memory-swap=256m \  
  ubuntu
```
→ swap 사용 X

- Exit Code 137
	- `128 + 9 (SIGKILL)`
	- OOM Killer 가 프로세스 강제 종료

---

## 리소스 확인 명령어

1. `docker stats`
	- CPU %
	- Memory / Limit
	- 네트워크
	- Block I/O

2. `docker inspect` : ex) `docker inspect mem_test`
	- CpuQuota
	- CpuPeriod
	- Memory

---

## 실행 중 리소스 변경

```
docker update --cpus=0.3 --memory=200m mem_test
```
- 재시작 X → 즉시 적용


>[!note] 기본 원칙  
>모든 컨테이너 Memory 제한 설정  
>CPU quota 설정  
>swap 정책 명확히  
>DB/Cache는 여유 있게