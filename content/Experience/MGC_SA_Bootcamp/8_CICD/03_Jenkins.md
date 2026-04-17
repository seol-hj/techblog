---
title: Jenkins
draft: false
date: 2026-04-17
updated: 2026-04-17
tags:
  - DevOps
  - CI/CD
  - Jenkins
---

>소스 변경부터 배포 전후 작업까지 연결하는 자동화 플랫폼  
>정해진 절차를 서버에서 일관되게 자동 실행

## 역할

#### CI 실행 엔진

CI 자동화
ex)
1. GitHub에 코드 push
2. Jenkins가 변경 감지
3. 저장소에서 코드 가져옴
4. 빌드 수행
5. 테스트 수행
6. 결과 저장 및 성공/실패 표시

#### CD 파이프라인 제어 도구

ex)
- Docker 이미지 생성
- 레지스트리 업로드
- 원격 서버에 배포 스크립트 실행
- Kubernetes 배포 명령 실행
- Helm 배포 수행

#### 오케스트레이션 서버

오케스트레이션 역할 → 여러 단계 순서대로 실행 / 조건에 따라 분기

ex)
- Build 성공 시에만 Test 실행
- Test 성공 시에만 Docker Build 실행
- main 브랜치일 때만 Release Job 실행
- 운영 배포 전 승인 단계 대기

→ **절차를 정의하고 제어하는 엔진**

---

## 특징

1. **오픈소스 기반**
	- 자유롭게 설치 및 확장 가능

2. **Plugin 기반 확장성**
	- 다양한 플러그인 추가 가능
		- GitHub 연동
		- Docker 연동
		- Kubernetes 연동
		- Slack 알림
		- Maven / Gradle 지원
		- 테스트 리포트 표시
		- 인증 연동
		- 보안 스캔 연동
	- **조직 환경에 맞게 확장**

3. **파이프라인 코드화 (Pipeline as Code)**
	- `Jenkinsfile`을 저장소에 배치 → 파이프라인 자체를 코드처럼 관리
	- 장점
		- 파이프라인 변경 이력이 Git에 남음
		- 코드와 파이프라인 정의를 함께 관리 가능
		- 리뷰와 버전 관리 쉬움
		- 환경 재현성 높음
	- **파이프라인 정의 자체를 코드로 다루는 방식**

4. **분산 실행 가능**
	- 필요 시 여러 노드에 작업 분산하여 실행 가능

---

## 아키텍처

Jenkins → Controller / Agend 구조

#### Controller

Jenkins의 중심 서버

역할
- Jenkins 웹 UI 제공
- Job / Pipeline 설정 저장
- 빌드 요청 수신
- 실행 스케줄 관리
- Agent에 작업 할당
- 플러그인 관리
- 사용자 및 권한 관리
- 빌드 결과 기록
→ Jenkins의 메인 제어

#### Agent

실제 작업 수행하는 실행 노드

역할
- Git clone
- Maven build
- npm install
- Docker build
- Test 실행
- 스크립트 실행행

#### Controller / Agent 분리 목적

1. **부하 분산**
	- build & test → CPU, Memory, Disk I/O 사용량 높음
	- 전부 Controller 에서 수행 시 Jenkins 느려짐

2. **실행 환경 분리**
	- 프로젝트 특성에 맞는 실행 환경 사용 가능

3. **보안 분리**
	- 빌드 실행 노드 분리 → 격리 효과

4. **확장성**
	- 빌드 양 많을 시 → Agent 늘림

#### Controller / Agent 구조

**동작 흐름**
```
개발자 코드 변경
   ↓
Git 저장소 이벤트 발생
   ↓
Jenkins Controller가 Job 트리거
   ↓
Controller가 실행 가능한 Agent 선택
   ↓
Agent가 작업 디렉터리 생성 후 소스코드 다운로드
   ↓
빌드 / 테스트 / 배포 명령 수행
   ↓
실행 결과를 Controller에 전달
   ↓
Controller가 UI와 로그에 결과 표시
```

#### Workspace

Jenkins가 작업을 실행하는 특정 디렉터리

보통
- 소스코드 다운로드
- 의존성 설치
- 빌드 산출물 생성
- 테스트 결과 파일 생성

#### Executor

Jenkins Agent의 동시 실행 단위

if) Agent 1개에 Executor 2개 → 동시 2 개 Job 가능

병렬성이 중요 / But, 동시에 실행 가능한 범위는 인프라 자원과 작업 성격 고려 필요

---

## 구성 요소

#### Job

Jenkins에서 실행 가능한 작업 단위
가장 기본적인 자동화 단위

**유형**
1. **Freestyle Project**
	- 웹 UI에서 빌드 명령, 트리거, 후처리 작업 설정 가능
	- 특징
		- 입문 쉬움
		- 간단한 작업 구성
		- UI 기반 → 빠르게 생성 가능
	- 한계
		- 설정 이력 관리 어려움
		- 복잡한 흐름 표현이 불편
		- 재사용성과 코드 리뷰 약함

2. **Pipeline**
	- 단계별 흐름을 코드로 정의
	- 특징
		- 버전 관리 가능
		- 복잡한 절차 표현 가능
		- 조건 분기, 병렬 처리 가능
		- 코드 리뷰 가능
		- 재현성 높음

3. **Multibranch Pipeline**
	- 여러 브랜치 자동 인식 → 각 브랜치의 Jenkinsfile 기준 파이프라인 실행
	- 장점
		- 브랜치별 자동 파이프라인
		- PR 기반 흐름, Git 중심 운영에 유리

#### Project

Job을 프로젝트 형태로 관리
Freestyle Project, Pipeline Project, Multibranch Pipeline 등

#### Build

Job이 한 번 실행된 결과
Job 실행 이력 단위

#### Node

작업을 수행할 수 있는 실행 대상

#### Label

특정 Agent 분류 태그

---

### Pipeline 중요성

1. UI 설정보다 코드 관리 유리
	- `Jenkinsfile` → Git에 저장
		- 변경 이력 추적
		- 코드 리뷰
		- 브랜치별 분리
		- 프로젝트와 함께 관리

2. 복잡한 흐름 표현 쉬움

### Plugin 구조의 장점 / 주의점

필요한 기능을 Plugin으로 추가 가능
→ 관리 포인트 많아짐

### Jenkins 잘 맞는 환경

- 자체 인프라 중심 환경
- 복잡한 커스텀 파이프라인
- 다양한 실행 환경이 필요한 경우
- 기존 레거시 자동화 자산이 많은 경우

### 한계 및 고려사항

1. 직접 운영 부담
2. 플러그인 의존성
3. UI 중심 운영의 위험
4. Controller 과부하 가능성
5. 보안 관리 중요

## 최종

아키텍처 관점
```
Developer
   ↓
Git Repository
   ↓
Jenkins Controller
   ↓
Jenkins Agent
   ↓
Build / Test / Package
   ↓
Artifact Repository / Container Registry
   ↓
Deployment Target
```
- Jenkins가 트리거를 받고 파이프라인 실행, 결과를 다음 단계로 넘기는 중심 허브 역할

>[!info] 요약
>Jenkins → CI/CD 자동화를 위한 오픈소스 자동화 서버  
>단순 빌드 도구 X, 파이프라인 실행과 흐름 제어 담당  
>기본 구조 = Controller / Agent  
>Jenkins 활용의 핵심 → Pipeline as Code + Jenkinsfile