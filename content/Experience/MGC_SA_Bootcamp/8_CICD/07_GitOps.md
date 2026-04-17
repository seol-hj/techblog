---
title: GitOps
draft: false
date: 2026-04-17
updated: 2026-04-17
tags:
  - DevOps
  - CI/CD
  - GitOps
---

**선언형(Declarative) 관리**
- 원하는 최종 상태(desired state)를 Git에 적어두고, 시스템이 그 상태에 동기화

**Git을 단일 진실 공급원(Single Source of Truth)으로 사용**
- Git을 운영 상태 기록과 통제의 중심으로 활용

**자동 동기화(Reconciliation)**
- 계속해서 원하는 상태를 유지

```
개발자 코드 변경
   ↓
CI 도구 빌드 / 테스트 / 이미지 Push
   ↓
Git 저장소에 배포 매니페스트 변경 반영
   ↓
GitOps 도구가 Git 변경 감지
   ↓
클러스터에 동기화
```
- GitOps Pull 기반 배포

---

**Git에 선언형 설정 저장**
- Kubernetes YAML 매니페스트
- Helm chart 또는 values 파일
- Kustomize overlay
- 환경별 설정
- 이미지 태그 버전
- 네임스페이스 구조
- 배포 전략 관련 설정

**애플리케이션 저장소와 운영 저장소 분리**

1. 애플리케이션 저장소
	- 소스코드
	- Dockerfile
	- 테스트 코드
	- CI Workflow

2. 운영 저장소 (GitOps 저장소)
	- Kubernetes 매니페스트
	- 환경별 배포 설정
	- 이미지 태그
	- 운영 구성 정보

### 기본 동작 흐름

```
개발자 코드 변경
   ↓
CI 실행
   ├─ Build
   ├─ Test
   └─ Image Push
   ↓
GitOps 저장소의 이미지 태그 또는 매니페스트 갱신
   ↓
GitOps 도구가 변경 감지
   ↓
클러스터에 적용
   ↓
실제 상태와 Git 상태 동기화 유지
```

### 장점

1. 변경 이력 추적 쉬움
	- 모든 운영 변경이 Git commit으로 남기 쉬움
	- 감사 추적성과 운영 투명성에서 중요

2. 롤백이 쉬움
	- Git의 버전관리로, 특정 커밋 상태로 되돌리는 방식 가능

3. 운영 상태 가시성 좋아짐
	- Git만 보면 원하는 상태를 알 수 있다

4. Drift 감지와 복구 가능성
	- 수동 변경이 누적되면서 운영 환경이 망가지는 문제 X

5. 보안상 유리한 구조
	- GitOps는 Pull 기반으로 인바운드 접근을 줄이는 구조

### 한계

1. Git에 반영되지 않는 수동 변경 → 문제 발생
	- 운영 원칙 준수 중요

2. 모든 작업이 GitOps에 맞지는 않음
	- 배포와 상태 관리에 강점
	- 모든 운영 절차를 선언형으로 만들순 X

3. 저장소 구조와 승인 절차 설계 중요
	- 저장소 전략과 권한 정책 함께 설계 필요

### GitOps 의 CI/CD

GitOps는 CI 대체 X → CD와 운영 반영 측면의 방식
- 배포 반영의 주체와 경로를 변경하는 방식

## 정리

- Kubernetes 중심 환경
- 컨테이너 이미지 기반 배포 환경
- 여러 환경을 일관되게 운영해야 하는 경우
- 운영 감사 추적이 중요한 경우
- 수동 변경을 줄이고 싶은 경우
**→ GitOps O**

- 선언형 관리 경험 부족
- Kubernetes나 컨테이너 기반 X
- 운영 수동 변경이 잦은 문화
- 저장소와 승인 구조가 미정리 되었을 경우
**→ GitOps X**

```
Application Source Repository
   ↓
CI Pipeline
   ├─ Build
   ├─ Test
   └─ Image Push
   ↓
GitOps Repository
   └─ Deployment Manifest / Image Tag / Config
   ↓
GitOps Controller
   ↓
Kubernetes Cluster
```

>[!info] 요약
>GitOps → Git을 운영 상태의 기준점으로 삼는 운영 방식  
>핵심 개념 = 선언형 관리, Single Source of Truth, 자동 동기화  
>기존 Push 기반 배포 X → Pull 기반 상태 동기화 구조 사용  
>장점 : 변경 추적, 롤백, Drift 감지, 운영 가시성  
>수동 변경 통제, 저장소 설계, 승인 정책 중요  
>GitOps 는 CI 대체 X → 주로 CD와 운영 반영 방식 재구성