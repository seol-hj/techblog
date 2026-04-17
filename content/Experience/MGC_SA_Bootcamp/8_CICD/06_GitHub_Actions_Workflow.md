---
title: GitHub Actions Workflow
draft: false
date: 2026-04-17
updated: 2026-04-17
tags:
  - DevOps
  - CI/CD
  - GitHub Actions
---

>자동화 절차 전체를 정의하는 단위  
>하나의 Workflow = 보통 하나의 목적

**위치** : `.github/workflows/`
ex)
```
my-app/
 ├─ src/
 ├─ tests/
 ├─ Dockerfile
 └─ .github/
     └─ workflows/
         ├─ ci.yml
         ├─ pr-check.yml
         └─ deploy.yml
```
- 저장소 안의 파일로 정의되고 버전 관리되는 도구

## YAML 기반 Workflow

**YAML** : 구조적 데이터를 사람이 읽기 쉽게 표현하기 위한 형식
- ex) 설정 파일
- 사용 이유
	- 구조를 계층적으로 표현하기 쉬움
	- 텍스트 기반이라 Git으로 관리 쉬움
	- 자동화 정의를 코드처럼 저장 가능
	- 사람이 읽고 수정하기 상대적으로 편함
- → UI 기반 설정보다 파일 기반 선언형 정의 중심

**Workflow 형태**
```
name: CI Workflow

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: 소스코드 체크아웃
        uses: actions/checkout@v4

      - name: 메시지 출력
        run: echo "hello github actions"
```

1. `name`
	- 역할 : Workflow 표시 이름
	- 사용 목적
		- 여러 Workflow 구분용
		- 목적이 명확한 이름일수록 운영성 좋음
		- 빌드용, 배포용, 릴리스용 Workflow 분리해 인식 쉬움

2. `on`
	- 역할 : Workflow가 어떤 이벤트를 기준으로 실행될 것인지 정의
	- 대표 이벤트
		- `push`
		- `pull_request`
		- `workflow_dispatch`
		- `release`
		- `schedule`
		- `pull_request_target`
		- `issues`
	- ex)
		- `on: push: branches: - main` : main 브랜치로 코드가 push 되면 실행
		- `on: pull_request: branches: - main` : main 브랜치를 대상으로 Pull Request가 생성/업데이트 될 때 실행
		- `on: workflow_dispatch:` : GitHub UI에서 사용자가 수동 실행 버튼을 눌렀을 때 실행
	- 하나의 Workflow가 여러 이벤트에 반응 가능

3. `jobs`
	- 역할 : Workflow 안에서 실제로 수행할 작업 단위들 정의
	- Workflow → 전체 자동화 흐름 / Job → 그 안의 큰 작업 블록
	- ex)
		- `build`
		- `test`
		- `docker`
		- `deploy`
	- 독립 실행 환경을 가질 수 있고, 병렬 실행 가능

4. `runs-on`
	- 역할 : 해당 Job이 어떤 Runner 환경에서 실행될지 지정
	- 어떤 OS/환경 사용할지 지정
		- `ubuntu-latest`
		- `windows-latest`
		- `macos-latest`
		- self-hosted
	- Job마다 서로 다른 Runner 사용 가능

5. `steps`
	- 역할 : Job 안에서 실제로 수행할 세부 실행 단계를 나열
	- 순서 → 위에서 아래로 순차 실행 / 앞 단계 실패 시 다음 실행 X

6. `uses` / `run`
	- `uses` : 이미 만들어진 Action을 재사용하는 방식
		- 재사용 가능한 자동화 컴포넌트 호출
	- `run` : Runner 안에서 직접 쉘 명령을 실행하는 방식
		- 직접 명령 실행

**이외 Workflow 구성 요소**

7. `env` : 환경 변수 정의 영역
	- 반복되는 값 Step 안에서 공통으로 참조 가능

8. `defaults` : 기본 실행 옵션을 지정할 때 사용
	- 반복 설정 줄이는 데 사용

9. `if` : 특정 조건에서만 Job 또는 Step이 실행되도록 제어

10. `needs` : Job 간 실행 순서를 정의하는 데 사용
	- 순서 강제 가능

11. `strategy` & `matrix` : 같은 Job을 여러 조건으로 반복 실행할 때 사용


**Job 간 관계**
- 기본은 병렬
- 순차 실행이 필요한 경우 `needs` 이용해 의존 관계 설정

**변수, Secret, 입력값**
- 변수와 Secret
	- 일반 변수 : 환경 이름, 앱 이름, 버전 문자열
	- Secret : 토큰, 비밀번호, API Key
	- → 민감 정보는 `env`에 적기 X / GitHub Secret 기능 사용

- 수동 실행 입력값
	- `workflow_dispatch` 사용 → 수동 실행 시 입력값 받을 수 있음
	- 통제된 수동 실행 가능

## Workflow 설계

1. 너무 크게 만들기 X
	- 목적별로 나누는게 좋음

2. Job 단위 역할 명확히
	- Job 구분 애매 → 로그 해석 어려움

3. 재사용 가능한 Action과 직접 명령을 적절히 조합

4. 브랜치 전략과 Workflow 함께 설계

## GitHub Actions Workflow vs Jenkins Pipeline

|Jenkins|GitHub Actions|
|---|---|
|Jenkinsfile|Workflow YAML|
|Pipeline|Workflow|
|Stage|Job 또는 Step 관점으로 분산|
|Agent|Runner|
|steps 블록|steps|
|environment|env|
|post 처리|별도 step 조건 처리 또는 후속 job|

>[!info] 요약
>Workflow → GitHub Actions의 자동화 흐름 전체 정의  
>Workflow 파일 → `.github/workflows` 경로에 YAML로 저장  
>핵심 구성 요소 → `name`, `on`, `jobs`, `runs-on`, `steps`  
>`on` → 실행 이벤트, `jobs` → 큰 작업 단위, `steps` → 실제 실행 단계  
>`uses` → 재사용 Action 호출, `run` → 직접 명령 실행  
>`env`, `if`, `needs`, `strategy`, `matrix` 등 → 제어 가능  
>Secret과 변수 반드시 구분