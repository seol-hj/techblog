---
title: ArgoCD
draft: false
date: 2026-04-17
updated: 2026-04-17
tags:
  - DevOps
  - CI/CD
  - GitOps
  - ArgoCD
---

GitOps 도구 → Git과 Kubernetes 사이에서 상태 동기화 컨트롤러 역할

## ArgoCD

>Kubernetes 환경에서 GitOps 방식 배포를 구현하기 위한 오픈소스 도구  
>→ Git 저장소 기준 클러스터 상태를 지속적으로 관리하는 도구


if) CI 도구가 직접 배포하는 경우 (Jenkins or GitHub Actions)
- CI 도구가 클러스터에 대한 많은 권한 필요
- 지속적 상태 관리 한계

**기본 동작 흐름**
```
Git 저장소에 매니페스트 존재
   ↓
Argo CD가 저장소 감시
   ↓
변경 감지
   ↓
원하는 상태 렌더링
   ↓
클러스터의 실제 상태와 비교
   ↓
차이가 있으면 Sync 수행
   ↓
클러스터 상태를 Git 기준으로 맞춤
```

#### 핵심 구성

1. **Application** : 배포 및 동기화 관리의 기본 단위
2. **Source** : 원하는 상태가 어디에 정의되어 있는지 의미
3. **Destination** : 실제로 반영할 대상 위치
4. **Sync Policy** : Git 상태를 실제 클러스터에 어떤 방식으로 반영할지 결정

#### 상태 개념

1. **Sync Status** : Git에 정의된 원하는 상태와 클러스터 실제 상태가 일치하는가
	- `Synced` : Git 기준 상태와 실제 클러스터 상태가 일치
	- `OutOfSync` : Git 기준 상태와 실제 상태 다름

2. **Health Status** : 애플리케이션 리소스가 정상적으로 동작하고 있는가
	- `Healthy`
	- `Progressing`
	- `Degraded`
	- `Missing`

#### 수동 동기화 / 자동 동기화

1. **수동 동기화(Manual Sync)**

Git에 변경이 있어도 운영자가 확인 후 Sync 수행

**장점**
- 운영 반영 전에 사람이 확인 가능
- 실수 반영 줄임
- 운영 승인 절차와 결합

**한계**
- 자동화 수준 낮아짐
- 반영 지연 가능
- 운영자 개입이 필요

→ 통제 중심 운영

2. **자동 동기화(Auto Sync)**

ArgoCD가 Git 변경 감지 → 자동으로 클러스터에 반영

**장점**
- 완전한 Git 중심 운영 가능
- 반영 속도 빠름
- 수동 개입 감소
- 운영 표준화

**한계**
- 잘못된 Git 변경 바로 반영 가능성
- 리뷰/승인 구조가 약하면 위험

#### Drift 감지 / 복원

**Drift** : Git에 정의된 상태와 실제 클러스터 상태가 어긋나는 현상

ArgoCD → Git 상태와 실제 상태를 비교해서 OutOfSync 표시
- 운영 환경의 무단 또는 임시 변경을 감지하는 감시 장치 역할

#### Git 저장소 구조

단일 앱 단일 환경
- `app1/dev`
- `app1/prod`

다중 앱 다중 환경
- `apps/app1/dev`
- `apps/app1/prod`
- `apps/app2/dev`
- `apps/app2/prod`

→ Git 저장소 안에서 환경 구분과 애플리케이션 구분이 명확해야함

#### 장점

1. Git 중심 운영 가시성
2. Drift 감지
3. 수동/자동 동기화 선택 가능
4. 멀티 애플리케이션 관리 용이
5. GitOps 운영 실현

#### 주의점

1. Git 변경 통제 중요
2. 클러스터 직접 수정 줄여야 함
3. Sync와 Health를 구분해서 봐야 함
4. 저장소 구조 설계가 중요
5. ArgoCD 자체도 운영 대상

## 정리

ArgoCD 운영 구조
```
Application Source Repository
   ↓
CI Pipeline
   ├─ Build
   ├─ Test
   └─ Image Push
   ↓
GitOps Repository
   └─ Kubernetes Manifest / Helm / Kustomize
   ↓
Argo CD
   ├─ Git 감시
   ├─ 상태 비교
   ├─ Sync 수행
   └─ Health 확인
   ↓
Kubernetes Cluster
```

>[!info] 요약
>ArgoCD → Kubernetes 환경에서 GitOps 구현 대표 도구  
>Git 저장소의 원하는 상태와 클러스터 실제 상태 비교 및 동기화  
>핵심 객체 → Application / Source와 Destination 연결  
>Sync Status = Git과의 일치 여부 / Health Status = 실제 동작 정상 여부  
>수동 동기화 & 자동 동기화 → 운영 통제 수준에 따라 선택 가능  
>CI 대체 X → 빌드가 아닌 배포 상태 동기화 담당