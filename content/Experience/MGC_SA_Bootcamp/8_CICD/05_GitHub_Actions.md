---
title: GitHub Actions
draft: false
date: 2026-04-17
updated: 2026-04-17
tags:
  - DevOps
  - CI/CD
  - GitHub Actions
---

>GitHub 이벤트 기준 동작하는 자동화 플랫폼  
>→ GitHub 안에서 바로 자동화 워크플로우를 정의하고 실행할 수 있게 한 구조

## 역할

1. **CI 자동화 도구**

GitHub 저장소에 코드를 push 할 때
- 소스코드 체크아웃
- 의존성 설치
- 빌드 수행
- 테스트 실행
- 결과 표시
가능

→ **GitHub 기반 CI 도구로 바로 사용** 가능

2. **CD 파이프라인 일부 또는 전부 수행**

- Docker 이미지 빌드 후 레지스트리 업로드
- 클라우드 환경에 배포
- Kubernetes 매니페스트 변경
- GitOps 저장소 자동 업데이트
- 릴리스 생성 및 태그 배포

→ CI 전용 외 **CI/CD 전체에 활용** 가능

3. **저장소 이벤트 기반 자동화**

GitHub 이벤트를 자연스럽게 자동화 트리거로 삼음

ex)
- `push`
- `pull_request`
- `workflow_dispatch`
- `release`
- `schedule`
- `issue`
- `tag`
- `repository_dispatch`

→ **GitHub 내부 이벤트를 기준으로 작동**하는 자동화 엔진

## 동작 구조

1. **Workflow** : 자동화 절차 전체를 정의하는 단위

보통 하나의 YAML파일로 작성
저장소 내 `.github/workflows` 디렉터리에 위치

ex)
```
my-repo/
 └─ .github/
     └─ workflows/
         ├─ ci.yml
         ├─ deploy.yml
         └─ release.yml
```

→ 하나의 목적을 가진 자동화 흐름을 정의하는 파일 단위

2. **Job** : Workflow 안에서 실행되는 작업 단위

하나의 Workflow 안에 여러 Job 가능
순차적 / 병렬 실행 가능

3. **Step** : Job 안에서 수행되는 개별 실행 단위

보통
- 쉘 명령 실행
- GitHub Action 재사용
- 스크립트 호출
- 환경 설정 수행

→ Job 안에서 실제로 수행되는 가장 작은 실행 단위

4. **Runner** : GitHub Actions Workflow를 실제로 실행하는 환경

크게 두 가지
- GitHub-hosted Runner
- Self-hosted Runner

#### GitHub-hosted Runner & Self-hosted Runner

**GitHub-hosted Runner** : GitHub 제공하는 실행 환경
- 사용자가 별도 서버 직접 운영 X
- 특징
	- GitHub가 실행 환경 제공
	- 운영체제 선택 가능 (Ubuntu, Windows, macOS)
	- 실행 후 초기화되는 일회성 환경
	- 빠르게 시작 가능
	- 관리 부담 적음

**Self-hosted Runner** : 사용자가 직접 운영하는 서버나 환경에 Runner 설치해서 사용
- 사용 이유
	- 사내망 리소스 접근 필요
	- 특정 도구나 SDK 필요
	- 장시간 빌드나 고성능 자원 필요
	- 네트워크/보안 정책상 외부 Runner 사용 제한
	- 자체 인프라에서 실행해야 하는 규정 존재

|항목|GitHub-hosted Runner|Self-hosted Runner|
|---|---|---|
|운영 주체|GitHub|사용자|
|관리 부담|낮음|높음|
|시작 속도|빠름|환경에 따라 다름|
|커스터마이징|제한적|높음|
|사내망 접근|어려울 수 있음|가능|
|보안 통제|GitHub 의존|직접 통제 가능|

### 이벤트 기반 구조

**이벤트** : GitHub 안에서 발생하는 특정 행동이나 상태 변화
→ GitHub Actions가 이런 이벤트를 감지해서 Workflow 실행

저장소와 자동화 시스템이 같은 플랫폼 안에 존재
→ 트리거 구조가 자연스럽고 간단

## 장점

1. **GitHub 통합성**

저장소, 브랜치, Pull Request, Release, Secret, Environment와 연결

2. **빠른 시작과 낮은 진입 장벽**

YAML 파일 하나로 빠르게 시작 가능

3. **워크플로우 파일 기반 관리**

Git으로 YAML 파일 버전 관리 가능
- 변경 이력 추적 가능
- Pull Request 리뷰 가능
- 브랜치별 워크플로우 차별화 가능
- 저장소와 자동화 정의를 함께 관리 가능
→ Workflow as Code

4. **Marketplace 기반 재사용**

재사용 가능한 컴포넌트처럼 활용 가능

5. **GitHub 중심 협업 흐름과 연계**

## 한계와 고려사항

1. **GitHub 종속성이 커짐**

저장소 중심 구조가 GitHub에 맞춰짐
타 플랫폼 이식성이 떨어짐
조직 정책상 GitHub 사용이 제한되면 활용 어려움

2. **복잡한 자체 인프라 제어에 한계**

GitHub-hosted Runner로 부족
→ Self-hosted Runner 사용 시 운영 부담 늘어남

3. **실행 시간과 비용, 자원 제한 고려 필요**

사용량이 늘어날 시
→ 실행 시간, 동시성, 비용, 제한 정책 고려

4. **Workflow가 지나치게 비대해질 수 있음**

복잡해지면 공통 모듈화, 재사용 전략, Runner 정책 필요

## Jenkins vs GitHub Actions

1. **설치형 vs 플랫폼 내장형**
	- Jenkins → 사용자가 직접 설치하고 운영하는 자동화 서버
	- GitHub Actions → GitHub 플랫폼 내부 내장 자동화 기능

2. **플러그인 중심 vs Action 재사용 중심**
	- Jenkins → Plugin 생태계가 핵심
	- GitHub Actions → 재사용 가능한 Action과 YAML 기반 조합이 핵심
	- → 둘 다 확장성은 존재, 구조 다름

3. **Controller / Agent 사고 vs Workflow / Runner 사고**
	- Jenkins → Controller가 있고 Agent에 작업 분산 구조
	- GitHub Actions → Workflow가 있고 Runner가 작업 실행 구조
	- → 운영 책임과 구조 복잡도는 Jenkins가 더 큼

4. **운영 부담 차이**
	- Jenkins → 서버, 보안, 백업, 플러그인, 업그레이드 직접 관리
	- GitHub Actions → hosted runner 기준 운영 부담 낮음

## 정리

**GitHub Actions 기본 구조**
```
Developer
   ↓
GitHub Repository
   ↓
GitHub Event 발생
   ↓
Workflow 실행
   ↓
Runner에서 Job / Step 수행
   ↓
Artifact / Image / Deploy 결과 생성
   ↓
GitHub UI에서 결과 확인
```

>[!info] 요약
>GitHub Actions → GitHub 이벤트 기반 동작 자동화 플랫폼  
>CI 뿐만 아니라 CD, 릴리스, 배포, GitOps 연계까지 확장 가능  
>핵심 구성 요소 = Workflow, Job, Step, Runner  
>GitHub-hosted Runner → 관리 부담 적음, 빠르게 시작 가능  
>Self-hosted Runner → 자체 인프라와 연결 가능  
>장점 → GitHub과 높은 통합성  
>단점 → GitHub 종속성, Runner 운영, 복잡한 워크플로우 관리 이슈