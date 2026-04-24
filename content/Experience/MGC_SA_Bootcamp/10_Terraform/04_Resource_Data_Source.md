---
title: Terraform Resource & Data Source
draft: false
date: 2026-04-24
updated: 2026-04-24
tags:
  - IaC
  - Terraform
---

> **Resource** → 새로 생성하거나 관리 대상으로 선언하는 것  
> **Data Source** → 이미 존재하는 것을 조회해서 가져오는 것

## Resource

`resource` : Terraform이 생성, 변경, 삭제를 관리하는 대상

**기본 구조**
```
resource "리소스타입" "이름" {
  인자 = 값
}
```

- 리소스 타입 → Provider가 제공하는 리소스 타입
- 이름 → 코드 내에서 리소스를 식별하기 위한 이름

## Data Source

`data source` : Terraform이 이미 존재하는 외부 정보를 조회해서 가져오는 대상

**기본 구조**
```
data "데이터타입" "이름" {
  조건 = 값
}
```

ex)
```
data "aws_vpc" "selected" {
  id = "vpc-1234567890abcdef0"
}
```
이와 같이 조회 후
```
data.aws_vpc.selected.id
```
```
data.aws_vpc.selected.cidr_block
```
→ 참조 가능

### 참조 방식

1. **Resource 참조 방식**
```
리소스타입.이름.속성
```

2. **Data Source 참조 방식**
```
data.데이터타입.이름.속성
```

### 자동 조회 / 실행 시 선택 / 직접 지정

1. **직접 지정**
```
resource "aws_instance" "web" {
  ami           = "ami-0abc123456789def0"
  instance_type = "t3.micro"
}
```

- 리전 변경 시 ID 변경 가능
- 이미지 업데이트 반영 X
- 코드 이식성이 떨어질 수 있음

2. **Data Source로 자동 조회**
```
ami = data.aws_ami.amazon_linux.id
```

**장점**
- 최신 이미지 자동 반영 가능
- 리전별 차이를 코드가 흡수 가능
- 하드코딩 줄일 수 있음

**단점**
- 필터 조건이 불명확하면 예상과 다른 결과 출력
- 조회 결과가 변동되면 재현성 낮아짐

3. **변수로 직접 선택**
```
variable "ami_id" {
  type = string
}

resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = "t3.micro"
}
```

**장점**
- 환경 별 값 제어 쉬움
- 운영에서 승인된 값만 주입 가능
- 재현성이 높음

**단점**
- 사용자가 값 관리 필요
- 자동화 수준은 낮아짐

#### 비교 및 활용

**직접 지정**
- 가장 단순함
- 고정값
- 실습 초반에 이해하기 쉬움

**자동 조회**
- 유연함
- 최신값 활용 가능
- 실무에서 자주 사용됨

**변수 입력**
- 통제력이 높음
- 운영에서 많이 사용됨
- 환경별 관리에 유리함

> 공통 인프라는 조회, 애플리케이션은 생성  
> 승인된 골든 이미지 조회  
> 환경 분리와 결합