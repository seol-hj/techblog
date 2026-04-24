---
title: IaC - Terraform
draft: false
date: 2026-04-23
updated: 2026-04-23
tags:
  - IaC
  - Terraform
---

## IaC

**Infrastructure as Code**
- 인프라 구성을 코드로 정의
- 코드 기준으로 인프라 관리
- → 원하는 상태를 코드로 선언

1. 선언형 관리
2. 재현성
3. 버전 관리
4. 표준화
5. 자동화

## Terraform

범용 인프라 관리 도구
HCL(HashiCorp Configuration Language) 사용

#### 구성 요소

1. **Provider** : 통신할 플랫폼 정의
2. **Resoruce** : 생성하거나 관리할 인프라 자원
3. **Variable** : 값을 외부로 분리 → 코드 재사용성 향상
4. **Output** : 실행 결과 값 출력
5. **Data Source** : 이미 존재하는 정보 조회
6. **State** : 관리하는 인프라 상태 저장 파일

#### 동작 방식

1. `terraform init`
	- Terraform 작업 디렉터리 초기화 명령
	- 처음 시작 시 가장 먼저 실행

2. `terraform plan`
	- 변경 발생점 미리 계산하여 보여줌
	- 실제 변경 X

3. `terraform apply`
	- `plan` 결과를 실제 인프라에 반영
	- 자동 승인 옵션 : `terraform apply -auto-approve`

4. `terraform destroy`
	- 만든 자원 삭제

#### 사용 이유

1. **가독성**
2. **모듈화와 재사용**
3. **변경 계획 확인**
4. **멀티 환경 관리**
5. **다양한 Provider 지원**

#### vs CloudFormation

**CloudFormation**
- AWS 네이티브 IaC 도구
- AWS 서비스와 통합 용이
- YAML 또는 JSON 형식 템플릿 사용
- 스택 단위로 리소스 관리

|항목|Terraform|CloudFormation|
|---|---|---|
|개발 주체|HashiCorp|AWS|
|지원 범위|멀티 클라우드 및 다양한 플랫폼|AWS 중심|
|구성 언어|HCL|YAML / JSON|
|상태 관리|별도 state 파일 사용|AWS 스택 상태 기반|
|확장성|높음|AWS 내부 운영에 최적화|
|학습 방향|범용 IaC 개념 확장 가능|AWS 네이티브 방식 이해에 적합|

>[!info] 요약
>IaC → 인프라를 코드로 관리  
>수작업 인프라 관리 한계 감소 / 재현성, 일관성 확보  
>Provider, Resource, Variable, Output, Data Source, State 개념으로 동작