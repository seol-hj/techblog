---
title: Terraform Block & Provider
draft: false
date: 2026-04-24
updated: 2026-04-24
tags:
  - IaC
  - Terraform
---

## HCL 기본 구조

```
블록종류 "라벨1" "라벨2" {
  인자이름 = 값
  인자이름 = 값
}
```

ex)
```
provider "aws" {
  region = "ap-northeast-2"
}
```
- `provider` → 블록 종류
- `"aws"` → 블록 라벨
- `{ ... }` → 블록 본문
- `region = "ap=northeast-2"` → 인자 (argument)
→ HCL은 블록을 중심으로 구성 / 블록 안에 인자가 들어감

#### 블록 & 인자

블록 (block) : 특정한 설정의 범위
ex)
- `terraform`
- `provider`
- `resource`
- `data`
- `variable`
- `output`
- `locals`

인자 (argument) : 블록 내부에서 실제 값을 지정하는 항목 = 설정값

>블록 → 설정의 큰 틀  
>인자 → 틀 안의 구체적인 값

## terraform 블록

`terraform` 블록 : Terraform 자체의 동작 조건을 정의
ex)
- Terraform 버전 조건
- 필요한 Provider 정보
- Backend 설정
- 실험적 기능 또는 기타 동작 옵션

`required_version` : 어떤 Terraform CLI 버전에서 실행 가능한지 제한

ex)
```
terraform {
  required_version = ">= 1.5.0"
}
```

`required_providers` : 어떤 Provider를 필요로 하는지, 어느 소스에서 어떤 버전 범위를 사용할 지

ex)
```
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

- `source` : Provider를 어디서 가져올지
- `version` : Provider 버전 제약 조건

## provider 블록

`provider` 블록 : Provider를 어떤 방식으로 사용할 것인가
ex)
- `region`
- `profile`
- `access_key`
- `secret_key`
→ 가능 한 액세스 키 하드코딩 X

#### AWS Provider

ex)
```
terraform {
  required_version = ">= 1.5.0, < 2.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-2"
}
```

- AWS 인증은 보통
	- 환경 변수
	- `~/.aws/credentials`
	- `~/.aws/config`
	- IAM Role
- → 코드 안에 키 X

#### terraform init + Provider

Provider를 사용하기 위해 필요한 플러그인 다운 + 작업 디렉터리 초기화
→ `terraform init`

1. 작업 디렉터리 초기화
2. Provider 다운로드
3. 내부 메타데이터 생성

ex) `terraform init`
- `.terraform/` 디렉터리 생성
	- 다운로드 된 Provider 플러그인과 내부 메타데이터 저장
	- 사용자 수정 X
- `.terraform.lock.hcl` 파일 생성
	- Provider 잠금 파일