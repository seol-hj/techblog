---
title: AWS 클라우드 기초
date: 2026-02-01
updated: 2026-02-01
tags:
  - AWS
draft: false
---
## 1️. 클라우드 기초

- 인터넷을 통해 **서버·스토리지·네트워크를 필요할 때 사용**
- 소유 ❌ → 사용(OPEX)
- 장점
    - 초기 비용 감소
    - 빠른 확장
    - 글로벌 서비스 가능

**핵심 키워드**

- On-demand
- Pay as you go
- Scalability

---

## 2️. 클라우드 컴퓨팅 모델

### IaaS

- 인프라 제공
- 사용자가 OS~앱 관리
- 예: EC2, VPC

### PaaS

- 플랫폼 제공
- 개발자는 코드만 작성
- 예: Elastic Beanstalk, Lambda 성격

### SaaS

- 완성된 서비스 제공
- 관리 없음
- 예: Gmail, Slack

👉 **위로 갈수록 편해지고, 제어권은 줄어듦**

---

## 3️. 클라우드 용어

- **Availability**: 사용 가능 상태 유지
- **Scalability**: 트래픽 증가 대응
- **Elasticity**: 확장 + 축소
- **High Availability**: 장애 발생해도 서비스 유지
- **Fault Tolerance**: 일부 고장에도 정상 동작
- **Latency**: 지연 시간
- **SLA**: 서비스 보장 수준

---

## 4️. 가상화 (Virtualization)

- 하나의 물리 서버 → 여러 가상 서버
- 하이퍼바이저가 자원 분배
- 클라우드의 기반 기술

**구성**

- VM
- Hypervisor (Type 1 / Type 2)

**AWS**

- EC2 = 가상 머신

---

## 5️. AWS 구조 (Global Infrastructure)

- **Region**: 지리적 단위
- **AZ**: 고가용성 단위 (리전 내 독립 데이터센터)
- **Edge Location**: 사용자와 가까운 CDN

👉 기본 설계 원칙: **Multi-AZ**

---

## 6️. AWS 계정과 프리티어

- AWS 계정 = 리소스·과금·보안의 경계
- Root 계정
    - 모든 권한
    - 일상 사용 ❌
- 프리티어
    - 12개월 무료
    - 항상 무료
    - 체험용 무료

👉 프리티어 초과 시 **즉시 과금**

---

## 7️. IAM 기초 (보안 핵심)

- **누가 / 무엇을 / 어디까지**
- 구성 요소
    - User
    - Group
    - Policy
    - Role

**보안 원칙**

- Root 계정 잠그기
- 최소 권한 원칙
- MFA 필수
- Role 사용 권장

---

## 8️. AWS 사용과 인증 방식

### 접근 방법

- Console (사람)
- CLI (자동화)
- SDK/API (애플리케이션)

### 인증 수단

- Console: ID / Password + MFA
- CLI: Access Key
- SDK/서버: **IAM Role**

👉 **서버에 키 저장 ❌**

---

## 9️. AWS 사용과 인증 실습 흐름

1. Root 계정 보안 설정
2. IAM User 생성
3. Group + Policy 연결
4. Console 로그인
5. CLI 인증 설정
6. Role 기반 접근 이해

👉 실습의 목적 = **보안 습관 체득**

---

## 10. 프리티어 추가 크레딧

- AWS 비용을 차감해 주는 크레딧
- 유효 기간 있음
- 크레딧 소진 후 과금 발생

**과금 방지 필수**

- Budget 설정
- 비용 알림
- 리소스 정리 (EC2 종료 ❌ → 삭제)

---

## 🎯 전체 요약

> AWS Cloud 기초개념은 **클라우드의 장점 → 구조 → 보안 → 사용 → 비용 관리**까지 이어지는 하나의 흐름이다.