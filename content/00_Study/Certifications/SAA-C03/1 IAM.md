---
title: IAM
date: 2026-02-01
updated: 2026-02-01
tags:
  - AWS
  - Certification
  - SAA-C03
  - Security
  - IAM
draft: false
---

> **IAM = Identity and Access Management**
> AWS 계정과 리소스에 대한 **인증(Authentication)** 과 **권한 부여(Authorization)** 를 관리하는 **글로벌 서비스**

- IAM은 **Global Service**
- AWS 계정 생성 시 **Root Account** 자동 생성
    - **공유 금지**
    - **일상적인 작업에 사용 금지**

---

## 👤 IAM: Users & Groups

### 👥 Users

- 조직 내 **실제 사람(Physical User)** 을 나타냄
- 각 User는:
    - AWS Console 접근용 비밀번호 보유 가능
    - Access Key 보유 가능

### 👨‍👩‍👧 Groups

- **Users만 포함 가능**
- **다른 Group 포함 불가**
- 목적:
    - 공통 권한을 묶어서 관리

### 🔁 소속 규칙

- User는:
    - **Group에 속하지 않아도 됨**
    - **여러 Group에 동시에 속할 수 있음**

> 예시 구조
> - Developers 그룹
> - Operations 그룹
> - Audit Team
> - 일부 사용자는 단독(User only)

---

## 📜 IAM: Permissions (권한)

> **권한은 JSON 형식의 Policy로 정의**

- 권한 부여 대상
    - **User**
    - **Group**

### 🔒 최소 권한 원칙 (Least Privilege Principle)

> 필요한 권한만 부여
> → 불필요한 액션은 절대 허용하지 않음

### 📄 Policy 예시

```json
{
"Version":"2012-10-17",
"Statement":[
{
"Effect":"Allow",
"Action":"ec2:Describe*",
"Resource":"*"
},
{
"Effect":"Allow",
"Action":"elasticloadbalancing:Describe*",
"Resource":"*"
},
{
"Effect":"Allow",
"Action":[
"cloudwatch:ListMetrics",
"cloudwatch:GetMetricStatistics",
"cloudwatch:Describe*"
],
"Resource":"*"
}
]
}
```

---

## 🔗 IAM Policies Inheritance (상속 구조)

> 사용자가 여러 Group에 속한 경우
> 👉 **모든 Group Policy가 합산 적용**

```
User
 ├─Group: Developers
 │   └─Policy A
 ├─Group: Operations
 │   └─Policy B
 └─InlinePolicy
```

- **Inline Policy**
    - 특정 User에게 직접 연결된 Policy
- 최종 권한 = 모든 Policy의 합집합

---

## 🧱 IAM Policy 구조 (구성 요소)

### 📦 Policy 전체 구조

- **Version**
    - Policy 언어 버전
    - 항상 `"2012-10-17"` 사용
- **Id** (선택)
    - Policy 식별자
- **Statement** (필수)
    - 하나 이상의 Statement 포함

### 🧩 Statement 구성 요소

- **Sid** (선택)
    - Statement 식별자
- **Effect**
    - `Allow` 또는 `Deny`
- **Principal**
    - 적용 대상 (account / user / role)
- **Action**
    - 허용 또는 거부할 API 액션
- **Resource**
    - 적용 대상 리소스
- **Condition** (선택)
    - 조건부 정책 적용

---

## 🔑 IAM – Password Policy

> 강력한 비밀번호 = 계정 보안의 기본

설정 가능 항목:

- 최소 비밀번호 길이
- 필수 문자 유형
    - 대문자
    - 소문자
    - 숫자
    - 특수문자
- 사용자가 **자신의 비밀번호 변경 허용**
- 비밀번호 **만료 주기 설정**
- **이전 비밀번호 재사용 방지**

---

## 🛡️ Multi Factor Authentication (MFA)

> 비밀번호만으로는 부족함

### MFA 개념

- **MFA =**
    - 내가 아는 것 (Password)
    - - 내가 가진 것 (Security Device)

### MFA의 핵심 이점

> 비밀번호가 유출되더라도
> **계정이 바로 탈취되지 않음**

- Root Account 보호 필수
- IAM User 보호 필수

---

## 📱 MFA 디바이스 옵션 (AWS 지원)

### 📲 Virtual MFA Device

- **Google Authenticator** (폰)
- **Authy** (폰)
- 특징
    - 하나의 기기에서 **여러 토큰 지원**

### 🔐 U2F Security Key

- **YubiKey (Yubico)** – 3rd party
- 특징
    - 하나의 키로 **여러 Root / IAM User 지원**

### 🔘 Hardware Key Fob

- **Gemalto** (일반)
- **SurePassID** (AWS GovCloud US 전용)

---

## 🔓 AWS 접근 방식 (3가지)

> AWS 리소스에 접근하는 방법은 정확히 3가지

### 1️⃣ AWS Management Console

- 웹 기반 UI
- **Password + MFA**로 보호

### 2️⃣ AWS CLI

- 커맨드라인 도구
- **Access Key** 사용

### 3️⃣ AWS SDK

- 코드에서 AWS API 호출
- **Access Key** 사용

---

## 🗝️ Access Keys

> **프로그램 접근 전용 자격 증명**

- Access Key는:
    - AWS Console에서 생성
    - **각 User가 직접 관리**
- 구성
    - **Access Key ID** ≈ Username
    - **Secret Access Key** ≈ Password
- ⚠️ **절대 공유 금지**

## 🖥️ AWS CLI
> 콘솔 없이 AWS를 제어하는 공식 도구

- 기능
    - AWS 서비스 API 직접 호출
    - 스크립트로 리소스 관리 가능
- 오픈소스
    - [https://github.com/aws/aws-cli](https://github.com/aws/aws-cli)
- AWS Management Console의 대안
---
## 🧑‍💻 AWS SDK

> 애플리케이션 내부에서 AWS를 제어

### 특징

- 언어별 라이브러리 제공
- 코드에서 AWS 서비스 접근
- 애플리케이션에 **내장**
### 지원 범위

- 서버 SDK
    - JavaScript, Python, PHP, .NET, Ruby, Java, Go, Node.js, C++
- 모바일 SDK
    - Android, iOS
- IoT SDK
    - Embedded C, Arduino 등

> 참고
> **AWS CLI는 Python용 AWS SDK 위에서 동작**
---
## 🎭 IAM Roles (서비스용 권한)

> AWS 서비스가 **사용자 대신 AWS API 호출**해야 할 때 사용

### Role의 목적
- Access Key 없이
- 임시 자격 증명으로 권한 부여

### 대표 예시
- **EC2 Instance Role**
- **Lambda Function Role**
- **CloudFormation Role**

---
## 🔍 IAM Security Tools
### 📄 IAM Credentials Report (Account-level)

- 계정 내 모든 User 목록
- 각 User의 자격 증명 상태 확인

### 🧠 IAM Access Advisor (User-level)

- User에게 부여된 서비스 권한
- **마지막 사용 시점 표시**
- 정책 정리·축소에 활용
---
## ✅ IAM Guidelines & Best Practices

> 반드시 지켜야 할 운영 원칙

- Root Account는 초기 설정 외 사용 금지
- **1명 = 1 IAM User**
- 권한은 **Group 기반으로 관리**
- 강력한 Password Policy 설정
- MFA 필수 적용
- AWS 서비스에는 **Role 사용**
- CLI / SDK 접근은 Access Key 사용
- Credentials Report & Access Advisor로 정기 감사
- **IAM User / Access Key 절대 공유 금지**
---
## 🧾 IAM Section Summary

- **Users**: 실제 사용자, 콘솔 비밀번호 보유
- **Groups**: Users만 포함
- **Policies**: 권한을 정의하는 JSON 문서
- **Roles**: EC2 및 AWS 서비스용 권한
- **Security**: MFA + Password Policy
- **AWS CLI**: 커맨드라인 관리
- **AWS SDK**: 코드 기반 관리
- **Access Keys**: CLI / SDK 접근용
- **Audit**: Credential Reports & Access Advisor