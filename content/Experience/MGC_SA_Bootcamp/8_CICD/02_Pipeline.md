---
title: CI/CD Pipeline
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - DevOps
  - CI/CD
---
![](Experience/MGC_SA_Bootcamp/8_CICD/img/20260416-1.png)
```
 → Source
 → Build
 → Test
 → Package
 → Publish
 → Deploy
 → Verify
```

### Source

보통 Git 저장소에 코드 변경 발생 시 파이프라인 시작

주요 이벤트
- `push`
- `pull request`
- `merge`
- `tag 생성`
- `release 생성`

**형상관리 시스템**
- 보통 GitHub, GitLab, Bitbucket 같은 Git 기반 저장소 사용

**브랜치 전략**
ex)
- `feature/*` 브랜치 : 빌드와 단위 테스트만 수행
- `develop` 브랜치 : 통합 테스트 수행
- `main` 브랜치 : 운영 배포 후보 생성
- `tag` : 릴리스용 아티팩트 생성

**트리거 방식**
- 저장소 변경이 생겼을 때 파이프라인 시작 방식 결정
- ex)
	- Polling 방식 : 저장소를 주기적으로 확인
	- Webhook 방식 : 저장소에서 변경을 통지
	- 수동 실행
	- 일정 기반 실행
- 보통 Webhook 기반 구성

산출물
- 특정 커밋 해시 (commit SHA)
- 브랜치 이름
- 태그 이름
- 변경된 소스코드 작업 디렉터리

### Build

소스코드를 실행 가능하거나 배포 가능한 형태로 변환

언어에 따라 조금 다름
- Java : `compile`, `package`
- Node.js : 정적 파일 번들링
- Python : 의존성 설치 및 패키징 준비
- Go : 바이너리 생성
- Docker 기반 애플리케이션 : 이미지 빌드
→ 배포 가능한 산출물을 만들기 위한 준비 과정 전체

**수행 작업**
- 소스코드 체크아웃
- 의존성 다운로드
- 컴파일
- 정적 리소스 번들링
- 패키징
- 컨테이너 이미지 생성

산출물
- `.jar`, `.war`
- 실행 바이너리
- 정적 웹 파일
- Python package
- Docker image

### Test

동작 검증

**종류**
1. **Unit Test**
	- 가장 작은 단위 함수나 모듈 검증
	- 속도 빠름
2. **Integration Test**
	- 여러 모듈 또는 서비스 간 상호작용 검증
	- DB 연결, API 호출 등 테스트
3. **End-to-End Test**
	- 전체 흐름 검증
	- 비용 높고 오래걸림
4. **Lint / Static Analysis**
	- 코드 스타일, 잠재적 오류, 보안 취약 패턴 등 점검
5. **Security Scan**
	- 오픈소스 의존성 취약점, 이미지 취약점, 시크릿 노출 여부 검사

**품질 게이트 (Quality Gate)**
- 특정 기준을 통과해야 다음 단계로 넘어가게 제어

### Package / Artifact

Build 결과물을 배포 가능한 단위로 정리하는 과정 → Artifact

ex)
- Java의 JAR / WAR
- Python wheel 파일
- Node.js 빌드 결과물
- Docker image
- Helm chart
- 압축 패키지 (zip, tar.gz)

보통 한 번 생성한 Artifact를 여러 환경으로 승격(promote)하는 구조 지향

### Publish 단계

생성된 Artifact를 저장소나 레지스트리에 업로드

ex)
- Maven Repository
- npm Registry
- Docker Hub
- GitHub Container Registry
- Amazon ECR
- Nexus Repository
- JFrog ARtifactory
- S3 버킷

**관리 필요**
1. **버전**
	- 버전 식별 가능해야함
	- ex) `1.0.0` `1.0.1`
2. **무결성**
	- 결과물 손상 여부
3. **추적성**
	- 어떤 커밋인지 확인
4. **재사용성**
	- 동일한 Artifact를 여러 환경에서 재사용 가능 여부

### Deploy

Publish된 Artifact를 실제 실행 환경에 반영

**배포 환경 분리** → 하나의 환경만 사용 X, 여러 환경 분리해 운영

**배포 방식**
1. **In-place Deployment**
	- 기존 애플리케이션 직접 교체
	- 실패 시 영향이 큼

2. **Rolling Deployment**
	- 인스턴스 하나씩 순차적 교체
	- 무중단에 가까운 배포 가능

3. **Blue/Green Deployment**
	- 기존 버전과 새 버전을 동시에 두고 전환
	- 롤백 쉬움

4. **Canary Deployment**
	- 일부 트래픽에만 새 버전 우선 적용
	- 리스크 낮음

### Verify

실제 환경에서 서비스가 정상적으로 동작하는지 확인

**확인 요소**
- 애플리케이션 프로세스 정상 가동 여부
- 헬스체크 API 응답 여부
- 주요 페이지 응답 여부
- 기본 기능 동작 여부
- 오류 로그 증가 여부
- 모니터링 지표 변화 여부

---

### 실패

**처리 원칙**

1. 조기 실패 (Fail Fast)
	- 문제 발견 시 빨리 멈춰야 함

2. 명확한 로그
	- 어디서 왜 실패했는지 추적

3. 알림
	- 실패 시 인지

4. 재실행 가능성
	- 일시적 오류는 재시도

5. 롤백 고려
	- 운영 반영 후 Verify 실패 시 이전 버전으로 롤백

### 승인 지점과 자동화 범위

승인 지점
ex)
- 운영 배포 직전 수동 승인
- 보안 점검 결과 확인 후 승인
- 변경관리 회의 이후 승인
- 특정 시간대에만 배포 허용

### 브랜치 전략 & 파이프라인

ex)
`feature branch`
- 빌드
- 단위 테스트
- 간단한 코드 검사

`develop branch`
- 통합 테스트
- 패키징
- 테스트 환경 배포

`main branch`
- 릴리스 아티펙트 생성
- 운영 배포 후보 생성

`tag`
- 정식 버전 릴리스
- 프로덕션 배포

### 환경 승격 (Promotion)

동일한 Artifact를 더 높은 환경으로 이동
- 매 환경마다 빌드 X
- 같은 Artifact를 검증된 상태 그대로

### 전체 흐름

```
Developer
   ↓
Git Repository
   ↓
CI Pipeline Trigger
   ↓
Build / Test
   ↓
Artifact Repository or Container Registry
   ↓
Deployment Target
   ↓
Verification / Monitoring
```

>[!info] 요약
>파이프라인 → 소스 변경부터 배포 후 검증까지 연결한 자동화 흐름  
>Artifact → 검증된 결과물을 여러 환경에서 재사용하게 해주는 핵심 요소  
>품질 게이트 / 승인 지점 → 파이프라인 통제에 중요  
>브랜치 전략, 환경 분리, 승격 구조 → 파이프라인 설계의 핵심  
>배포 성공과 서비스 정상 동작은 다름 → Verify 필수
