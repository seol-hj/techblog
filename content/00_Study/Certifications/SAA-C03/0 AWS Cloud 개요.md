---
title: ☁️ AWS Cloud 개요
date: 2026-02-01
updated: 2026-02-01
tags:
  - aws
  - certification
  - saa-c03
  - cloud
  - architecture
draft: false
---

> AWS는 단순한 서버 호스팅을 넘어
> **글로벌 규모의 인프라를 서비스 형태로 제공하는 클라우드 플랫폼**

---

## 🕰️ AWS Cloud History

### 📌 연도별 흐름

- **2002**
    - Amazon 내부 인프라로 최초 사용 시작
- **2003**
    - Amazon 인프라가 회사의 핵심 강점으로 인식됨
    - 내부 인프라를 외부에 서비스로 제공하자는 아이디어 등장
- **2004**
    - **SQS(Simple Queue Service)** 와 함께 최초 공개 출시
- **2006**
    - **SQS, S3, EC2** 를 포함해 본격적인 AWS로 재출시
- **2007**
    - 유럽 리전 출시 → 글로벌 확장 시작

> Dropbox, Airbnb, Netflix, NASA 등
> **대규모 트래픽·글로벌 서비스 기업들이 AWS를 채택**

---

## 📊 AWS Cloud Number Facts

> AWS의 시장 지배력과 규모를 수치로 확인

- **2023년 연 매출**
    
    → **$90 Billion**
    
- **2024년 1분기 기준 시장 점유율**
    
    → **31% (1위)**
    
    → Microsoft Azure: 25% (2위)
    
- **13년 연속 클라우드 시장 리더**
    
- **1,000,000+ 활성 사용자**
    
- **Gartner Magic Quadrant**
    
    - Strategic Cloud Platform Services 부문
    - **Leader 영역에 AWS 위치**

---

## 🧩 AWS Cloud Use Cases

### AWS가 가능한 이유

- 고도로 **확장 가능한 애플리케이션** 구축 지원
- 산업군 제한 없이 적용 가능

### 주요 활용 사례

- **Enterprise IT**
- **Backup & Storage**
- **Big Data Analytics**
- **Website Hosting**
- **Mobile & Social Applications**
- **Gaming**

> 실제 사용 기업 예시
> McDonald’s / 21st Century Fox / Activision / Netflix

---

## 🌍 AWS Global Infrastructure

### 구성 요소

- **AWS Regions**
- **AWS Availability Zones**
- **AWS Data Centers**
- **AWS Edge Locations (Points of Presence)**

> 공식 인프라 맵
> [https://infrastructure.aws/](https://infrastructure.aws/)

---

## 🌎 AWS Regions

### Region 개념

- AWS는 **전 세계에 여러 Region**을 운영
- Region 이름 예시
    - `us-east-1`
    - `eu-west-3`
- **Region = 여러 Data Center의 집합**
- 대부분의 AWS 서비스는 **Region 단위로 범위가 제한됨**

> Region 정보 확인
> [https://aws.amazon.com/about-aws/global-infrastructure/](https://aws.amazon.com/about-aws/global-infrastructure/)

---

## 🧭 AWS Region 선택 기준

> 새로운 애플리케이션을 배포한다면, 어디에 배포해야 할까?

### 고려 요소

- **법적·컴플라이언스 요구사항**
    - 데이터는 명시적 허가 없이는 Region 밖으로 이동하지 않음
- **고객과의 물리적 거리**
    - 가까울수록 **지연 시간(Latency) 감소**
- **서비스 가용성**
    - 모든 Region에 최신 서비스·기능이 존재하지 않음
- **가격**
    - Region별 요금 상이
    - 모든 요금은 AWS 공식 페이지에 투명하게 공개

---

## 🏢 AWS Availability Zones (AZ)

### AZ 구조

- 각 Region은 **보통 3개 이상의 AZ**로 구성
    
    (최소 3, 최대 6)
    
- AZ 이름 예시
    
    - `ap-southeast-2a`
    - `ap-southeast-2b`
    - `ap-southeast-2c`

### AZ 특징

- 각 AZ는 **하나 이상의 독립된 데이터 센터**
- 전력·네트워크·연결이 **완전히 분리**
- **재해 격리** 목적
- AZ 간 연결
    - **초고속**
    - **초저지연 네트워크**

> 예시
> Sydney Region (`ap-southeast-2`)
> ├─ ap-southeast-2a
> ├─ ap-southeast-2b
> └─ ap-southeast-2c

---

## 🌐 AWS Points of Presence (Edge Locations)

### Edge Infrastructure

- **400+ Edge Locations**
- **10+ Regional Caches**
- **90+ 도시 / 40+ 국가**

### 목적

- 사용자와 가까운 위치에서 콘텐츠 제공
- **지연 시간 최소화**
- 주로 **CloudFront** 와 함께 사용

> CloudFront Edge 정보
> [https://aws.amazon.com/cloudfront/features/](https://aws.amazon.com/cloudfront/features/)

---

## 🧠 AWS 서비스 범위 개념

### 🌍 Global Services

> 전 세계 공통으로 제공되는 서비스

- **IAM** (Identity and Access Management)
- **Route 53** (DNS)
- **CloudFront** (CDN)
- **WAF** (Web Application Firewall)

---

### 📍 Region-Scoped Services

> 특정 Region에 종속되는 서비스

- **EC2** – IaaS
- **Elastic Beanstalk** – PaaS
- **Lambda** – FaaS
- **Rekognition** – SaaS

> Region별 서비스 제공 현황
> [https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services)

---

## 🧩 핵심 구조 (아키텍처 개념)

```
Global
 ├─ IAM
 ├─ Route53
 ├─ CloudFront
 └─ WAF

Region (ex. ap-northeast-2)
 ├─ AZ-a
 │   └─ Data Center
 ├─ AZ-b
 │   └─ Data Center
 └─ AZ-c
     └─ Data Center

Edge Locations
 └─ 사용자와 가장 가까운 캐시 노드
```