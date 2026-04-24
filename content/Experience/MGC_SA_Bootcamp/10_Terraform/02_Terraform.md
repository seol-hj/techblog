---
title: Terraform 사용
draft: false
date: 2026-04-24
updated: 2026-04-24
tags:
  - IaC
  - Terraform
---

**Terraform 의 기본 원리**
→ 현재 디렉터리에 어떤 `.tf` 파일이 있는지
- Terraform 은 현재 디렉터리 안의 `.tf`파일을 모두 읽음
→ 어떤 원하는 상태가 정의되어 있는지 기준으로 동작

## `.tf`

Terraform 설정 파일

ex)
- `main.tf`
- `variables.tf`
- `outputs.tf`
- `provider.tf`

→ 현재 디렉터리 안의 모든 `.tf` 파일을 읽어 하나의 구성처럼 처리

가독성과 관리 편의성 측면
보통
- `main.tf` → 모듈 호출
- `providers.tf` → AWS 접속 등 테라폼 설정
- `variables.tf` → 전체 프로젝트 용 입력 변수
- `terraform.tfvars` → 실제 값 주입 (Git 제외 - `.gitignore`)
- `outputs.tf` → 최종 결과 출력
- `modules/` → 재사용할 모듈들을 모아두는 폴더

## 명령어

**`terraform init` : 초기화**
- 현재 디렉터리의 Terraform 설정 파일을 읽음
- Provider 분석
- 필요한 Provider 플러그인 다운로드
- 작업 디렉터리 Terraform 실행 가능 상태로 준비

`init` 필요한 경우
- 처음 해당 디렉터리에서 Terraform 사용 시
- Provider 설정 변경 시
- 모듈 추가 시
- 백엔드 설정 변경 시

**`terraform fmt` : 자동 정렬**
- 들여쓰기
- 공백
- 블록 정렬
- 표현식 정렬

장점
- 가독성이 좋음
- 협업 시 스타일 통일
- 리뷰 쉬움
- 불필요한 drift 줄어듦

**`terraform validate` : 문법 검사**
- 문법 확인
- 블록 구조 확인
- 기본적인 참조 구문에 문제점 확인

**`terraform plan` : 작업 미리보기**
- 실제 리소스 생성 X
- 어떤 리소스를 생성할 지
- 어떤 속성 값으로 생성할 지
- 변경 또는 삭제 대상 유무

- `+` : 생성
- `~` : 수정
- `-` : 삭제

**`terraform apply` : 실제 적용**

`apply`후 `terraform.tfstate` 파일 생성
→ 현재 관리 중인 상태를 저장하는 파일

**`terraform destroy` : 삭제**