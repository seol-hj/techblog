---
title: CloudFront & Global Accelerator
date: 2026-02-01
updated: 2026-02-01
tags:
  - aws
  - certification
  - saa-c03
  - network
  - cloudfront
  - golbal-accelerator
draft: false
---
## ☁️ Amazon CloudFront

> **Amazon CloudFront = CDN (Content Delivery Network)**
> 전 세계 엣지 로케이션에 콘텐츠를 캐싱하여 **읽기 성능을 획기적으로 개선**

### 핵심 특징

- 콘텐츠를 **Edge Location에 캐싱**
- 사용자 체감 성능 향상
- 전 세계 **216개 이상의 PoP (Edge Locations)**
- 글로벌 분산 구조로 **DDoS 방어**
- **AWS Shield / AWS WAF**와 통합

> → 사용자는 가장 가까운 Edge Location으로 자동 라우팅

---

## 📦 CloudFront – Origin 유형

> CloudFront는 **다양한 Origin**을 지원

### 지원 Origin

- **S3 Bucket**
    - 정적 파일 배포
    - Edge 캐싱
    - **OAC (Origin Access Control)** 사용
        - OAI 대체 기술
- **Custom Origin (HTTP)**
    - Application Load Balancer
    - EC2 Instance
    - S3 Static Website (웹사이트 호스팅 활성화 필요)
    - 기타 모든 HTTP 백엔드

### 추가 기능

- CloudFront를 **Ingress**로 사용해
    - 파일 업로드 → S3 가능

---

## 🧭 CloudFront High-Level 아키텍처

```
User
 ↓GET /beach.jpg
CloudFront EdgeLocation
 ├─Cache Hit  → 즉시 응답
 └─Cache Miss
        ↓
      Origin (S3 / ALB / EC2)
        ↓
   응답 + Edge 캐싱
```

- 요청은 **가장 가까운 Edge**
- Origin에는 **필요할 때만 접근**
- 캐싱된 데이터는 **TTL 동안 유지**

---

## 🔐 CloudFront + S3 (OAC 구조)

> **S3는 Public ❌ / CloudFront만 접근 허용**

```
User
 ↓
CloudFront Edge
 ↓ (OAC)
Private S3 Bucket
```

- S3 Bucket Policy:
    - CloudFront OAC만 허용
- S3 직접 접근 차단
- **보안 + 성능** 동시에 확보

---

## 🆚 CloudFront vs S3 Cross-Region Replication

### CloudFront

- 글로벌 Edge 네트워크
- TTL 기반 캐싱 (예: 1일)
- 전 세계 어디서든 빠른 접근
- **정적 콘텐츠**에 최적

### S3 CRR

- Region 단위 복제
- Near Real-Time 복제
- Read-only 복제본
- **동적 콘텐츠** + 특정 Region 최적화

> **전 세계 빠른 읽기 → CloudFront**
> **몇 개 Region에 최신 데이터 → CRR**

---

## 🧱 CloudFront – ALB / EC2 Origin 보안

> Origin이 ALB 또는 EC2일 경우 **보안 그룹 설정 중요**

### ALB Origin

- ALB는 **Public**
- EC2는 **Private**
- EC2 SG:
    - **ALB SG만 허용**

### EC2 직접 Origin

- EC2는 Public
- SG에서:
    - **CloudFront Edge IP Range만 허용**

> CloudFront IP 목록:
> [https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips](https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips)

---

## 🌍 CloudFront Geo Restriction

> **국가 단위 접근 제어**

### 방식

- **Allowlist**
    - 특정 국가만 허용
- **Blocklist**
    - 특정 국가 차단

### 특징

- 3rd-party Geo-IP DB 사용
- 대표 사용 사례
    - **저작권 / 지역별 콘텐츠 제한**

---

## 💸 CloudFront Pricing 개요

> Edge Location별 **데이터 아웃 비용 상이**

- 지역별 비용 차이 큼
    - 북미/유럽 ↓
    - 아시아/인도 ↑
- 사용량 기반 과금

> → **지역 + 전송량**이 비용 결정 요소

---

## 🧮 CloudFront Price Classes

> **Edge Location 범위를 제한해 비용 절감**

### Price Class 종류

1. **Price Class All**
    - 모든 Region
    - 최고 성능
2. **Price Class 200**
    - 대부분 Region
    - 고비용 Region 제외
3. **Price Class 100**
    - 가장 저렴한 Region만 사용

---

## 🔄 CloudFront Cache Invalidation

> Origin 콘텐츠 변경 시 **TTL 무시하고 즉시 갱신**

### 필요 이유

- CloudFront는 Origin 변경을 자동 인지 ❌
- TTL 만료 전까지는 **이전 데이터 제공**

### Invalidation 방식

- ## 전체:
    
- 경로:
    - `/index.html`
    - `/images/*`

```
Invalidate 요청
 → Edge Cache 삭제
 → 다음 요청 시 Origin 재조회
```

---

## 🌐 글로벌 사용자 문제 (Latency)

> 전 세계 사용자가 **Public Internet**으로 접근 시

- 많은 네트워크 홉
- 지연 시간 증가
- 특히 **동적 애플리케이션**에서 문제

---

## 📡 Unicast IP vs Anycast IP

### Unicast

- 하나의 IP = 하나의 서버
- 사용자 위치와 무관

### Anycast

- **하나의 IP = 여러 서버**
- 사용자는 **가장 가까운 서버**로 라우팅

---

## 🚀 AWS Global Accelerator

> **Anycast IP 기반 글로벌 네트워크 가속 서비스**

### 동작 구조

```
User
 ↓ (Anycast IP)
AWS Edge Location
 ↓ (AWS Global Network)
Application (ALB / EC2 / NLB)
```

- **2개의 고정 Anycast IP** 제공
- Edge → AWS 내부 네트워크로 전달
- Public Internet 홉 최소화

---

## ⚙️ Global Accelerator 특징

- 대상 리소스
    - Elastic IP
    - EC2
    - ALB / NLB
    - Public / Private 모두 가능
- **Consistent Performance**
- **지연 시간 기준 Intelligent Routing**
- **빠른 Regional Failover (< 1분)**
- 클라이언트 캐시 문제 ❌
    - IP 변경 없음
- Health Check 내장
- DR (Disaster Recovery)에 매우 적합

---

## 🔐 Global Accelerator 보안

- 외부에서 허용해야 할 IP:
    - **단 2개 Anycast IP**
- AWS Shield 기반 DDoS 보호
- 보안 그룹 / 방화벽 관리 단순화

---

## 🆚 Global Accelerator vs CloudFront

### 공통점

- AWS 글로벌 네트워크 사용
- Edge Location 활용
- AWS Shield 통합

---

### CloudFront

- HTTP 기반
- **캐시 가능한 콘텐츠**
    - 이미지, 비디오
- **동적 콘텐츠**
    - API Acceleration
- 콘텐츠가 **Edge에서 직접 제공**

---

### Global Accelerator

- TCP / UDP 모두 지원
- **비-HTTP 프로토콜**
    - 게임 (UDP)
    - IoT (MQTT)
    - VoIP
- **고정 IP 필요**한 HTTP 서비스
- **결정적이고 빠른 Regional Failover**

---

## 🧠 선택 기준

> 반드시 구분해야 할 포인트

- 📦 **정적/캐시 가능 콘텐츠**
    
    → **CloudFront**
    
- 🌍 **전 세계 사용자 + 고정 IP + 빠른 Failover**
    
    → **Global Accelerator**
    
- 🎮 **UDP / 실시간 통신**
    
    → **Global Accelerator**
    
- 🖼️ **이미지 / 비디오 / 웹 리소스**
    
    → **CloudFront**