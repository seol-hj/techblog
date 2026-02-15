---
title: AWS 네트워크 기초
draft: false
date: 2026-02-01
updated: 2026-02-01
tags:
  - Network
  - AWS
  - VPC
---
## 1. 클라우드 & AWS 개요

### 클라우드란?

인터넷을 통해 **서버, 스토리지, 네트워크, 소프트웨어** 같은 IT 자원을
**필요할 때만, 사용한 만큼** 제공받는 방식

|전통적 IT|클라우드|
|---|---|
|서버 직접 구매|AWS가 서버 제공|
|증설 느림|몇 분 안에 확장|
|초기 비용 큼|사용한 만큼만 과금|

---

### 클라우드 서비스 3가지

|구분|설명|예|
|---|---|---|
|IaaS|서버, 네트워크 제공|EC2|
|PaaS|플랫폼 제공|Elastic Beanstalk|
|SaaS|완성된 서비스|Gmail, Slack|

---

### CSP vs MSP

|구분|의미|
|---|---|
|CSP|AWS, Azure, GCP (클라우드 제공자)|
|MSP|클라우드를 대신 설계·운영해주는 회사|

---

### AWS란?

- 세계 1위 클라우드 서비스
- 200개 이상의 서비스 제공
- EC2, S3, RDS, VPC 등

---

## 2. AWS 리전 & 가용영역

### 리전 (Region)

- AWS 데이터센터가 있는 **지리적 지역**
- 예:
    - 서울 `ap-northeast-2`
    - 도쿄 `ap-northeast-1`
    - 미국 동부 `us-east-1`

**왜 나뉘는가?**

- 속도 (가까울수록 빠름)
- 법규 (국내 데이터 보관)
- 장애 대응 (다른 리전으로 복구)

---

### 가용영역 (AZ)

- 리전 안에 있는 **독립 데이터센터**
- 예: 서울 리전 → 2a, 2b, 2c

**역할**

- 하나의 AZ가 죽어도 서비스 유지
- 고가용성(HA)

---

### 리전 vs AZ

|구분|리전|가용영역|
|---|---|---|
|범위|큰 지역|리전 내부|
|물리 분리|완전|전원·네트워크 분리|
|목적|재해 복구|고가용성|

---

## 3. EC2 (서버)

### EC2란?

AWS에서 제공하는 **가상 서버**

- CPU
- 메모리
- 디스크
- OS

---

### 인스턴스 타입

형식:

`<패밀리><세대>.<크기>`

예: `t3.micro`, `m5.large`

|패밀리|용도|
|---|---|
|T|저비용 범용|
|M|균형형|
|C|CPU 최적화|
|R|메모리 최적화|
|G|GPU|

---

### EC2 요금

|방식|특징|
|---|---|
|On-Demand|바로 사용, 비쌈|
|Reserved|1~3년 약정, 쌈|
|Spot|남는 자원, 매우 쌈(중단 가능)|

---

### AMI (이미지)

> 서버 템플릿

AMI 안에 포함됨:

- OS
- 프로그램
- 설정

→ 동일한 서버를 여러 대 복제 가능

---

### Elastic IP

- EC2 기본 IP는 **동적**
- **고정 IP** 필요하면 Elastic IP 사용

---

### 보안 그룹 (Security Group)

> EC2 방화벽

- 허용 규칙만 가능
- 포트 + IP 기준
- Stateful (응답 자동 허용)

---

### Key Pair (SSH)

- 비밀번호 대신 키로 로그인
- 훨씬 안전

---

### User Data

> EC2 부팅 시 자동 실행 스크립트

예:

```bash
#!/bin/bash
yum install nginx -y
systemctl start nginx

```

---

## 4. VPC (네트워크)

### VPC란?

AWS에서 만드는 **나만의 전용 네트워크**

- IP 대역 지정
- 서브넷 분리
- 라우팅 설정

---

### IP 대역 (CIDR)

예:

```
10.0.0.0/16

```

→ 10.0.0.0 ~ 10.0.255.255

---

### 서브넷

VPC를 쪼갠 것

|구분|특징|
|---|---|
|Public Subnet|인터넷 연결됨|
|Private Subnet|인터넷 차단|

서브넷은 **하나의 AZ에만 존재**

---

### Internet Gateway (IGW)

VPC ↔ 인터넷 연결 통로

---

### Route Table

> 트래픽 길 안내판

|목적지|대상|
|---|---|
|10.0.0.0/16|local|
|0.0.0.0/0|igw-xxxx|

→ 이게 있으면 Public Subnet

---

### NAT Gateway

Private Subnet에서 **인터넷 나가기 전용**

|방향|가능|
|---|---|
|Private → Internet|O|
|Internet → Private|X|

---

### VPC Endpoint

> 인터넷 없이 AWS 서비스 접근

|종류|대상|
|---|---|
|Gateway|S3, DynamoDB|
|Interface|나머지 서비스|

---

## 5. 보안

### NACL vs Security Group

|항목|NACL|Security Group|
|---|---|---|
|적용|서브넷|인스턴스|
|규칙|허용+차단|허용만|
|상태|Stateless|Stateful|

---

## 6. VPC 연결

### VPC Peering

- 두 VPC 직접 연결
- 많이 생기면 관리 어려움

---

### Transit Gateway

> 중앙 허브

모든 VPC 연결 가능

대규모 환경에 필수

---

## 7. 최종 아키텍처 실습 요약

### 목표

- Dev / Prod 완전 분리
- Bastion 서버를 통해서만 접속
- Prod만 인터넷 허용

### 구성

|VPC|CIDR|
|---|---|
|Management|10.0.0.0/16|
|Prod|10.1.0.0/16|
|Dev|10.2.0.0/16|

### 결과

|테스트|결과|
|---|---|
|Bastion → Prod|OK|
|Bastion → Dev|OK|
|Prod → Internet|OK|
|Dev → Internet|❌|
|Dev ↔ Prod|❌|