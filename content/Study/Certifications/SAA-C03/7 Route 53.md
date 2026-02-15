---
title: Route 53
date: 2026-02-01
updated: 2026-02-01
tags:
  - AWS
  - Certification
  - SAA-C03
  - Network
  - Route53
  - DNS
draft: false
---
## 🧠 DNS

> **DNS (Domain Name System)**
> 사람이 이해하기 쉬운 도메인 이름을 **기계가 이해하는 IP 주소로 변환**하는 시스템

- 예시
    
    ```
    www.google.com → 172.217.18.36
    ```
    
- 인터넷의 **핵심 인프라**
    
- **계층적 구조(Hierarchical Naming Structure)** 사용
    

### DNS 계층 구조 예시

```
.com
└─ example.com
   ├─ api.example.com
   └─ www.example.com
```

---

## 🧩 DNS 용어

- **Domain Registrar**
    - 도메인을 구매/등록하는 서비스
    - 예: Route 53, GoDaddy
- **DNS Record**
    - A, AAAA, CNAME, NS 등
- **Zone File**
    - DNS 레코드 집합
- **Name Server**
    - DNS 쿼리를 처리
    - Authoritative / Non-Authoritative
- **TLD (Top Level Domain)**
    - `.com`, `.org`, `.kr` 등
- **SLD (Second Level Domain)**
    - `amazon.com`, `google.com`
- **FQDN**
    - Fully Qualified Domain Name

---

## 🔄 DNS 동작 흐름

```
Web Browser
  ↓ example.com?
Local DNSServer (캐시 확인)
  ↓
Root DNSServer
  ↓
TLD DNSServer (.com)
  ↓
SLD DNSServer (example.com)
  ↓
IP 반환 (9.10.11.12)
  ↓
WebServer 접근
```

- **TTL(Time To Live)** 동안 Local DNS에 캐싱
- Root: ICANN
- TLD: IANA
- SLD: Domain Registrar 관리

---

## ☁️ Amazon Route 53

> **고가용성·확장성·완전관리형 Authoritative DNS 서비스**

### 핵심 특징

- 사용자가 **DNS 레코드를 직접 관리**
- **Domain Registrar 역할도 수행**
- 리소스 상태 **Health Check** 가능
- **AWS 유일 100% SLA 제공 서비스**
- 숫자 **53 = DNS 기본 포트**

---

## 📄 Route 53 – DNS Record 구성 요소

각 레코드는 다음 정보를 포함

- Record Name (도메인 / 서브도메인)
- Record Type (A, AAAA, CNAME 등)
- Value (IP 또는 대상)
- **Routing Policy**
- **TTL**

### 지원 Record Type

- 필수
    - A / AAAA / CNAME / NS
- 고급
    - CAA / MX / TXT / SOA / PTR / SRV 등

---

## 🧾 Record Type

### A / AAAA

- **A**: IPv4 매핑
- **AAAA**: IPv6 매핑

### CNAME

- 도메인 → 도메인 매핑
- **Zone Apex(루트 도메인)에는 사용 불가**
    - ❌ [example.com](http://example.com)
    - ✅ [www.example.com](http://www.example.com/)

### NS

- Hosted Zone의 Name Server 정의

---

## 📦 Hosted Zone

> 도메인과 서브도메인 트래픽 제어를 위한 컨테이너

### Public Hosted Zone

- 인터넷 공개 도메인
- 예: `example.com`

### Private Hosted Zone

- VPC 내부 전용 도메인
- 예: `api.example.internal`

💰 비용: **$0.50 / Hosted Zone / 월**

---

## 🌍 Public vs Private Hosted Zone 구조

### Public

```
Client → Route53 → ALB / CloudFront / EC2
```

### Private

```
VPC 내부
  ├─ api.example.internal →10.0.0.10
  └─ db.example.internal  →10.0.0.35
```

---

## ⏱️ TTL (Time To Live)

> DNS Resolver가 레코드를 캐싱하는 시간

### High TTL (예: 24시간)

- Route 53 트래픽 ↓
- 레코드 변경 반영 느림

### Low TTL (예: 60초)

- 변경 반영 빠름
- Route 53 쿼리 비용 ↑

⚠️ **Alias Record는 TTL 설정 불가**

---

## 🔁 CNAME vs Alias

### CNAME

- 어떤 도메인이든 대상 가능
- **루트 도메인 불가**
- 비용 없음

### Alias (Route 53 전용)

- AWS 리소스로 직접 연결
- **루트 도메인 가능**
- TTL 설정 ❌
- Health Check 자동 연동
- 비용 ❌

---

## 🔗 Alias Record 대상 리소스

- Elastic Load Balancer
- CloudFront
- API Gateway
- Elastic Beanstalk
- S3 Website
- VPC Interface Endpoint
- Global Accelerator
- 같은 Hosted Zone 내 Route 53 Record

❌ EC2 자체 DNS 이름은 Alias 불가

---

## 🚦 Routing Policy 개요

> DNS 응답 방식을 정의 (트래픽을 “전달”하는 것이 아님)

지원 정책:

- Simple
- Weighted
- Failover
- Latency-based
- Geolocation
- Multi-Value
- Geoproximity (Traffic Flow 필요)
- IP-based Routing

---

## 📍 Simple Routing

- 단일 리소스 응답
- 여러 값 설정 가능
- **클라이언트가 랜덤 선택**
- Health Check 연결 ❌
- Alias 사용 시 리소스 1개만 가능

---

## ⚖️ Weighted Routing

> 요청 비율 제어

- 각 레코드에 **가중치 설정**
- 합계 100일 필요 ❌
- Health Check 연동 가능
- Weight = 0 → 트래픽 차단
- A/B 테스트, 점진적 배포에 활용

---

## 🚀 Latency-based Routing

> 사용자 기준 **가장 지연 시간이 낮은 Region** 선택

- 사용자 ↔ AWS Region 지연 기준
- 지리적으로 멀어도 더 빠르면 선택 가능
- Health Check 연동 → 장애 시 Failover

---

## 🩺 Route 53 Health Checks

### 3가지 유형

1. **Endpoint 모니터링**
    - HTTP / HTTPS / TCP
2. **Calculated Health Check**
    - 여러 Health Check 조합 (AND / OR / NOT)
3. **CloudWatch Alarm 기반**
    - Private 리소스 모니터링 가능

---

## 🌐 Endpoint Health Check 상세

- 전 세계 약 **15개 Health Checker**
- 기본 조건
    - Interval: 30초 (최소 10초)
    - Threshold: 3
- **2xx / 3xx 응답만 정상**
- 응답 본문 텍스트 검사 가능 (5120 bytes)
- 보안 그룹에서 **Route 53 IP 허용 필수**

---

## 🧮 Calculated Health Check

- 최대 **256개 Child Health Check**
- OR / AND / NOT 조합
- 유지보수 중에도 서비스 정상 처리 가능

---

## 🔒 Private Hosted Zone Health Check 제약

- Route 53 Health Checker는 **VPC 외부**
- Private 엔드포인트 직접 접근 ❌

### 해결 방식

```
Private Resource
 → CloudWatch Metric
 → CloudWatch Alarm
 → Route53 HealthCheck
```

---

## 🔁 Failover Routing (Active-Passive)

- Primary + Secondary 구조
- **Primary Health Check 필수**
- Primary 장애 시 Secondary 응답

---

## 🌍 Geolocation Routing

> **사용자 위치 기준 라우팅**

- Continent / Country / US State
- 가장 구체적인 위치 우선
- **Default Record 필수**
- 지역별 콘텐츠 제공, 접근 제한

---

## 🧭 Geoproximity Routing

> 사용자 + 리소스 위치 기준

- **Bias 값**으로 트래픽 비율 조정
    - +1 ~ +99: 확장
    - 1 ~ -99: 축소
- AWS / Non-AWS 리소스 모두 가능
- **Route 53 Traffic Flow 필요**

---

## 🧩 IP-based Routing

> **클라이언트 IP CIDR 기준 라우팅**

- ISP / 네트워크 단위 제어
- 성능 최적화, 비용 절감 목적
- CIDR Collection 필요

---

## 🧠 Multi-Value Routing

- 여러 정상 리소스 반환
- 최대 **8개 Healthy Record**
- Health Check 연동 가능
- **ELB 대체 수단 아님**

---

## 🏷️ Domain Registrar vs DNS Service

- **Registrar**
    - 도메인 구매
- **DNS Service**
    - DNS 레코드 관리

### 가능 구조

- GoDaddy에서 도메인 구매
- Route 53에서 DNS 관리

---

## 🔄 3rd Party Registrar + Route 53 연동 절차

1. Route 53에서 Hosted Zone 생성
2. 생성된 **NS Record** 확인
3. 외부 Registrar에 NS 값 등록

> Registrar ≠ DNS Service
> 대부분 Registrar는 기본 DNS 제공하지만 **분리 사용 가능**