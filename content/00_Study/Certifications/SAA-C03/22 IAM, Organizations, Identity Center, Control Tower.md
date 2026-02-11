---
title: IAM, Organizations, Identity Center, Control Tower
date: 2026-02-01
updated: 2026-02-01
tags:
  - aws
  - certification
  - saa-c03
  - security
  - governance
draft: false
---
## 1️. AWS Organizations

> **AWS Organizations**
> 여러 AWS 계정을 **중앙에서 관리**하기 위한 글로벌 서비스

### 핵심 개념

- **Global Service**
- **Management Account**
    - 조직의 루트
    - 결제·정책·조직 관리
- **Member Accounts**
    - 하나의 Organization에만 소속 가능

### 주요 기능

- **Consolidated Billing**
    - 모든 계정 단일 결제 수단
- **Usage Aggregation**
    - EC2, S3 등 **볼륨 할인**
- **RI / Savings Plans 공유**
- **API 기반 계정 생성 자동화**

---

## 2️. AWS Organizations 기본 구조

```
Root OU
 └─ Management Account
     ├─ OU (Dev)
     │   ├─ AccountA
     │   └─ AccountB
     ├─ OU (Prod)
     │   ├─ Account C
     │   └─ Account D
     └─ OU (HR / Finance)
```

---

## 3️. Organizational Unit(OU) 설계

### ① 비즈니스 단위 기준

- Sales OU
- Retail OU
- Finance OU

### ② 환경 기준

- Dev OU
- Test OU
- Prod OU

### ③ 프로젝트 기준

- Project 1 OU
- Project 2 OU
- Project 3 OU

> OU는 **정책(SCP) 적용 단위**

---

## 4️. AWS Organizations 운영

- 멀티 계정 전략 권장
    (❌ 단일 계정 + 멀티 VPC)
    
- 태깅 표준 수립 (Billing / Cost Explorer)
    
- **모든 계정 CloudTrail 활성화**
    - 중앙 S3 계정으로 로그 집계
- CloudWatch Logs 중앙 로깅
    
- Cross-Account Admin Role 구성
    
- **SCP로 보안 가드레일 설정**
    

---

## 5️. Service Control Policies (SCP)

> **SCP**
> 계정 또는 OU 수준에서 **최대 권한 한계**를 정의

### 특징

- IAM User / Role에 직접 권한 부여 ❌
- **허용 가능한 최대 범위만 정의**
- **Management Account에는 적용 ❌**
- 기본 동작: **아무 것도 허용하지 않음**
- Root → OU → Account 경로 상 **모든 SCP 허용 필요**

---

## 6️. SCP 계층 구조 예시

```
RootOU
 ├─SandboxOU(DenyS3,DenyEC2)
 │   ├─AccountA
 │   ├─AccountB
 │   └─AccountC
 └─ProdOU(FullAWSAccess)
     ├─AccountE
     └─AccountF
```

- Account A/B/C
    → S3 ❌, EC2 ❌
    
- Prod 계정
    → 전체 허용
    

---

## 7️. SCP 전략 – Blocklist vs Allowlist

### Blocklist 전략

- 기본: `Allow *`
- 특정 서비스만 `Deny`

### Allowlist 전략

- 기본: `Deny *`
- 필요한 서비스만 `Allow`

> 보안 요구가 높은 환경에서는 **Allowlist 전략** 선호

---

## 8️. IAM Conditions – 네트워크 & 리전 제어

### aws:SourceIp

- API 호출 IP 제한

### aws:RequestedRegion

- 특정 리전만 허용

```
Condition:
StringEquals:
aws:RequestedRegion:
-eu-central-1
-eu-west-1
```

---

## 9️. IAM Conditions – 태그 & MFA

### ec2:ResourceTag

- 리소스 태그 기반 제어

### aws:MultiFactorAuthPresent

- **MFA 강제**

```
DenyifMFA=false
```

---

## 10. IAM for Amazon S3 – 권한 범위

### Bucket Level

- `s3:ListBucket`

```
arn:aws:s3:::my-bucket
```

### Object Level

- `s3:GetObject`
- `s3:PutObject`
- `s3:DeleteObject`

```
arn:aws:s3:::my-bucket/*
```

---

## 1️1. Resource Policy & aws:PrincipalOrgID

> **조직 단위 접근 제어**

### 사용 가능 위치

- S3 Bucket Policy
- SNS / SQS / Lambda 등

### 효과

- **Organization 외부 계정 접근 차단**

```
Condition:
StringEquals:
aws:PrincipalOrgID:o-xxxxxxxxxx
```

---

## 1️2. IAM Role vs Resource-Based Policy

### Cross-Account 접근 방식

### ① IAM Role

- 권한 **완전히 전환**
- AssumeRole 필요

### ② Resource-Based Policy

- 기존 권한 유지
- 대상 리소스에서 직접 허용

### 예시

- Account A → Account B S3 접근
    - Role 방식 또는
    - S3 Bucket Policy 방식

---

## 1️3. EventBridge 보안 모델

### Target 권한 부여 방식

- **Resource-based Policy**
    - Lambda
    - SNS
    - SQS
- **IAM Role**
    - EC2 Auto Scaling
    - ECS Task
    - SSM Run Command

---

## 1️4. IAM Permission Boundaries

> **IAM 엔티티가 가질 수 있는 최대 권한 한계**

### 특징

- User / Role에만 적용
- Group ❌
- Managed Policy 사용

### 권한 계산

```
EffectivePermissions=
IAM Policy ∩ Permission Boundary
```

---

## 1️5. Permission Boundaries 사용 목적

- 비관리자에게 **제한된 위임**
- 개발자 Self-Service 허용
- 권한 상승(Privilege Escalation) 방지
- 특정 사용자만 제한하고 싶을 때

---

## 1️6. SCP + Permission Boundary 조합

```
OrganizationsSCP
        ∩
PermissionBoundary
        ∩
Identity-basedPolicy
=
EffectivePermissions
```

---

## 1️7. IAM Policy Evaluation Logic

> **IAM 권한 판단 순서**

1. 기본값: **Deny**
2. Explicit Deny 존재 → Deny
3. SCP 허용 여부 확인
4. Resource-based Policy 확인
5. Identity-based Policy 확인
6. Permission Boundary 확인
7. Session Policy 확인
8. 최종 Allow / Deny 결정

---

## 1️8. IAM Policy 예제

```json
Deny: sqs:*
Allow: sqs:DeleteQueue
```

### 결과

- `CreateQueue` ❌
- `DeleteQueue` ⭕
- `ec2:DescribeInstances` ⭕ (명시적 Deny 없음)

---

## 1️9. AWS IAM Identity Center

> **AWS SSO의 후속 서비스**

### 제공 기능

- AWS Organizations 전체 계정 SSO
- 비즈니스 SaaS 연동
- SAML 2.0 애플리케이션
- Windows EC2 로그인
- 내장 Identity Store
- 외부 IdP 연동
    - AD, Okta, OneLogin 등

---

## 2️0. IAM Identity Center 로그인 흐름

```
UserLogin
 └─ IAMIdentity Center
     └─ Account 선택
         └─ PermissionSet
             └─ AWS Console / CLI 접근
```

---

## 2️1. IAM Identity Center 아키텍처

```
AWS Organization
 └─ IAMIdentity Center
     ├─ Permission Sets
     ├─Identity Store
     └─External IdP (AD/ Okta)
```

---

## 2️2. Permission Sets

> **IAM Policy 묶음**

### 특징

- 멀티 계정 적용
- User / Group 단위 할당
- 계정별 IAM Role 자동 생성

---

## 2️3. ABAC (속성 기반 접근 제어)

### 사용 속성

- costCenter
- title
- locale

### 장점

- 권한 정의 1회
- 속성 변경으로 접근 제어 조정

---

## 2️4. Microsoft Active Directory

### AD란?

- 중앙 사용자·컴퓨터 관리 DB
- Domain / Tree / Forest 구조
- Windows 기반 인증·권한 관리

---

## 2️5. AWS Directory Services

### 유형

- **AWS Managed Microsoft AD**
    - AWS에서 완전 관리
    - MFA 지원
    - On-Prem AD와 Trust 가능
- **AD Connector**
    - 온프레미스 AD 프록시
- **Simple AD**
    - 독립형
    - On-Prem 연동 ❌

---

## 2️6. IAM Identity Center + AD 연동

### 방식

- AWS Managed AD 직접 연결
- Two-way Trust 구성
- AD Connector 사용

---

## 2️7. AWS Control Tower

> **멀티 계정 환경 자동 구축 & 거버넌스**

### 핵심 기능

- Organizations 기반 계정 생성
- 베스트 프랙티스 자동 적용
- 중앙 대시보드 제공
- 정책 위반 탐지 & 자동 조치

---

## 2️8. Control Tower Guardrails

### Preventive Guardrail

- SCP 기반
- 예: 특정 리전 사용 금지

### Detective Guardrail

- AWS Config 기반
- 예: 태그 없는 리소스 감지

```
AWS Config
 └─ NON_COMPLIANT
     └─ SNS / Lambda
         └─ 알림 또는 자동 Remediation
```