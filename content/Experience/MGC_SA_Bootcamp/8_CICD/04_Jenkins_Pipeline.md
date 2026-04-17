---
title: Jenkins Pipeline
draft: false
date: 2026-04-17
updated: 2026-04-17
tags:
  - DevOps
  - CI/CD
  - Jenkins
---

>빌드, 테스트, 패키징, 배포 같은 여러 작업을 **단계별 흐름으로 정의하고 실행하는 방식**  
>작업 순서, 실행 조건, 실패 처리, 후속 동작 포함전체 자동화 흐름을 코드형태로 표현

## Pipeline as Code

파이프라인 정의를 코드 파일 형태로 저장소에 함께 보관

Jenkins에서는 `Jenkinsfile`

**장점**
1. **변경 이력 추적 가능**
	- Git 기록
2. **코드 리뷰 가능**
	- Pipeline 변경을 Pull Request 리뷰 대상으로 포함 가능
3. **재현성 향상**
	- 같은 Jenkinsfile로 같은 흐름 생성 가능
4. **프로젝트와 파이프라인 일체화**
	- 소스 변경 & 파이프라인 변경 함께 관리
5. **브랜치별 독립성**
	- 브랜치 목적에 맞는 파이프라인 적용 가능

#### `Jenkinsfile`

Jenkins Pipeline 정의 파일

위치는 보통 저장소 루트
```
my-app/
 ├─ src/
 ├─ tests/
 ├─ Dockerfile
 ├─ package.json
 └─ Jenkinsfile
```

**Pipeline Style**

1. **Declarative Pipeline**

**특징**
- 구조가 명확함
- 읽기 쉬움
- 표준화된 작성 쉬움
- 이해하기 쉬움
- 공통 규칙 적용하기 좋음

**기본 구조**
```
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'checkout'
            }
        }

        stage('Build') {
            steps {
                echo 'build'
            }
        }

        stage('Test') {
            steps {
                echo 'test'
            }
        }
    }

    post {
        success {
            echo 'success'
        }
        failure {
            echo 'failure'
        }
    }
}
```

- `pipeline` : Declarative Pipeline의 최상위 영역
	- Agent, Stage, 환경 변수, 후처리 등 정의
	- Jenkins는 `pipeline {...}` 구조 기준으로 하나의 파이프라인 실행 단위

- `agent` : 어느 실행 환경에서 동작할지 지정
	- `agent any` : 어떤 Agent든 선택해서 실행
	- `label` : 특정 Label이 있는 Agent 에서 실행
		```
		agent {
			label 'docker'
		}
		```
	- `none` : Agent 지정 X, 각 Stage 별 따로 지정할 때 사용

- `stages` : 파이프라인의 주요 절차를 담는 영역
	- ex)
		- Checkout
		- Build
		- Test
		- Package
		- Deploy

- `stage` : 개별 단계 하나 의미

- `steps` : 각 stage 안에서 실제로 수행할 작업 정의
	- ex)
		- `echo` : 간단한 메시지를 로그에 출력
			- `echo '빌드 시작'`
		- `sh` : 리눅스/유닉스 계열 쉘 명령 실행
			- `sh 'mvn clean package'`
		- `bat` : Windows 배치 명령 실행
			- `bat 'dir'`
		- `git` : git 저장소에서 코드를 가져옴
		- `checkout` : 소스코드 체크아웃을 보다 세밀하게 제어할 때 사용

- `post` : Stage가 끝난 뒤 수행할 후처리 작업 정의
	- 성공 시 / 실패 시 후속 처리가 다름
	- ex)
		- `always` : 성공/실패와 관계없이 항상 실행
		- `success` : 성공했을 때만 실행
		- `failure` : 실패했을 때만 실행
		- `unstable` : 테스트 불안정 등으로 상태가 unstable일 때 실행
		- `changed` : 이전 실행과 결과가 다를 때 실행행

**보조 구성 요소**

- `environment` : 환경 변수 정의

- `parameters` : 파이프라인 실행 시 사용자가 값을 입력하거나 선택하도록 설정
	- 제어된 수동 실행 구성

- `tools` : Jenkins에 사전 등록된 도구를 파이프라인에서 사용하도록 선언

- `when` : 특정 조건에서만 Stage 실행하도록 제어

- `input` : 파이프라인 중간에 사람의 승인을 받기 위해 사용
	- 자동화와 통제를 섞은 구조

- `options` : 파이프라인 동작 전반의 실행 정책을 정함


2. **Scripted Pipeline**

Groovy 스크립트 방식 → 보다 자유로움

ex)
```
node {
    stage('Build') {
        echo 'build'
    }
}
```

- **특징**
	- 자유도 높음
	- 복잡한 로직 구현 가능
	- 세밀한 제어 가능

- **한계**
	- 가독성 떨어짐
	- 팀 공통 규칙 유지 어려움


##### Stage 설계

1. 논리적으로 구분
	- ex)
		- Checkout
		- Build
		- Test
		- Package
		- Deploy

2. 실패 원인 빠르게 찾을 수 있어야 함

3. 너무 잘게 쪼개면 X

4. 운영 관점에서 의미 O

##### 병렬 실행 & 조건 분기

**병렬 실행**

ex)
- 여러 테스트 세트 동시 실행
- Linux와 Windows 빌드 동시 수행
- 서비스 별 독립 빌드를 동시 수행
→ 전체 파이프 라인 시간 단축 가능

But, 병렬 실행은 자원 사용량과 로그 해석 난이도 높아짐


**조건 분기**

ex)
- 브랜치가 `main` 일 때만 배포
- 태그가 있을 때만 릴리스 아티팩트 생성
- 파라미터가 `prod`일 때만 승인 단계 실행

##### Freestyle Job 과 Pipeline

| 항목          | Freestyle Job | Pipeline |
| ----------- | ------------- | -------- |
| 설정 방식       | UI 중심         | 코드 중심    |
| 버전 관리       | 어려움           | 쉬움       |
| 복잡한 흐름 표현   | 제한적           | 강력함      |
| 조건 분기/병렬 처리 | 불편함           | 유연함      |
| 코드 리뷰       | 어려움           | 가능       |
| 재현성         | 낮음            | 높음       |

## 정리

```
Jenkinsfile
   ↓
Jenkins Controller가 파이프라인 해석
   ↓
지정된 Agent에서 Stage별 실행
   ↓
각 Stage에서 Steps 수행
   ↓
성공/실패 상태 기록
   ↓
post 처리 및 결과 알림
```

>[!info] 요약
>Jenkins Pipeline → CI/CD 절차를 단계별로 정의하고 실행하는 구조  
>핵심 철학 = Pipeline as Code → `Jenkinsfile`로  
>Declarative Pipeline → 구조 명확, 입문과 표준화에 유리  
>주요 구성 요소 → `pipeline`, `agent`, `stages`, `steps`, `post`  
>`enviornment`, `parameters`, `when`, `input`, `options` 로 제어 가능