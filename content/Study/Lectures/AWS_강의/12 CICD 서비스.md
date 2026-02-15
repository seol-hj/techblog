---
title: CI/CD 서비스
date: 2026-02-01
updated: 2026-02-01
tags:
  - AWS
  - DevOps
  - Architecture
draft: false
---
## 🧭 CI/CD

### CI (Continuous Integration)

- 코드 변경 사항을 **자주 병합**
- 병합 시마다 **자동 빌드 + 테스트**
- 문제를 **초기에 발견**하여 수정 비용 최소화

### CD (Continuous Delivery / Deployment)

- 검증된 결과물을 **자동으로 배포 단계까지 전달**
- Delivery: 배포 준비까지 자동화 (승인 필요)
- Deployment: 승인 없이 자동 배포까지 수행

👉 핵심 목표

**빠른 배포 + 안정성 + 반복 작업 제거**

---

## 🧱 AWS CI/CD 서비스 구성

|단계|서비스|역할|
|---|---|---|
|Source|GitHub / CodeCommit|소스 코드 저장|
|Orchestration|CodePipeline|전체 흐름 제어|
|Build / Test|CodeBuild|빌드 및 테스트|
|Artifact|Amazon S3|결과물 저장|
|Deploy|CodeDeploy|실제 배포|

---

## 🧩 서비스별 핵심 역할

## 🔹 AWS CodePipeline

### 역할

- CI/CD 전체를 **연결하고 제어하는 오케스트레이터**
- 직접 빌드·배포는 수행하지 않음

### 핵심 개념

- Pipeline → Stage → Action → Artifact 구조
- 이벤트 기반 자동 실행
- 승인 단계 포함 가능
- Serverless 기반

### 중요 포인트

- **흐름만 관리**, 실제 작업은 다른 서비스가 수행
- S3 Artifact가 모든 단계의 중심

---

## 🔹 AWS CodeBuild

### 역할

- **빌드 + 테스트 전담**
- CI 단계의 핵심 서비스

### 특징

- 컨테이너 기반 빌드 환경 자동 생성
- 서버 관리 불필요
- 필요할 때만 실행 → 비용 효율적

### 핵심 요소

- `buildspec.yml`
    - install / pre_build / build / post_build
- 캐싱 전략
    - S3 Cache
    - Local Cache (Source / Docker Layer / Custom)

### 포인트

- buildspec 이해도가 곧 CodeBuild 이해도
- 캐싱 전략에 따라 빌드 속도 차이 큼

---

## 🔹 AWS CodeDeploy

### 역할

- 빌드된 결과물을 **실제 서비스 환경에 배포**
- CD 단계 담당

### 지원 대상

- EC2
- Lambda
- ECS / Fargate
- On-Premise

### 배포 방식

- In-Place / Rolling
- Blue/Green (무중단 배포 시)

### 필수 요소

- CodeDeploy Application
- Deployment Group
- CodeDeploy Agent (EC2)

### 포인트

- 배포 전략 선택이 **서비스 안정성에 직결**
- 실패 시 자동 롤백은 큰 장점

---

## 🔄 CI/CD 전체 흐름 (End-to-End)

```
1. 개발자가 코드 수정
2. GitHub에 Push
3. CodePipeline 자동 실행
4. CodeBuild에서 빌드 및 테스트
5. 결과물 S3 저장
6. CodeDeploy가 배포 수행
7. EC2 / Lambda에서 서비스 실행
```

---

## 🧪 CI/CD Demo로 확인한 핵심 흐름

- 코드 변경 → 자동 배포까지 **사람 개입 최소화**
- 각 서비스는 **역할이 명확히 분리**
- 문제 발생 시 **어느 단계에서 실패했는지 즉시 확인 가능**

---

## 🧠 핵심 정리

### ✅ 개념 관점

- CI/CD는 도구가 아니라 **개발·배포 문화**
- “자주, 작게, 자동으로”

### ✅ 구조 관점

- CodePipeline이 중심
- Artifact(S3)가 단계 간 연결 고리

### ✅ 운영 관점

- Serverless 기반 → 관리 부담 적음
- 승인 단계로 안정성 확보 가능
- 로그/상태는 CloudWatch로 추적

### ✅ 실무 관점

- CodePipeline: 설계가 핵심
- CodeBuild: buildspec + 캐싱
- CodeDeploy: 배포 전략 선택이 가장 중요

---

## 📌 한 줄 정리

> **AWS CI/CD는 CodePipeline이 흐름을 잡고, CodeBuild가 품질을 보장하며, CodeDeploy가 안전하게 서비스를 전달하는 구조**