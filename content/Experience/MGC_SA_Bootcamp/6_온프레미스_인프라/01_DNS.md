---
title: DNS
draft: false
date: 2026-03-05
updated: 2026-03-05
tags:
  - DNS
---

## DNS (Domain Name System)

- **도메인 이름을 IP 주소로 변환**
- 계층적 분산 데이터베이스 시스템
- 네트워크 통신 IP 기반 → 사용자는 이름을 사용

#### DNS 계층 구조

![](Experience/MGC_SA_Bootcamp/6_온프레미스_인프라/img/20260305.png)
- 트리 구조
- 구성 요소 : 
	- `.` : Root → ICANN 관리
	- `com` : TLD → 각 등록기관 관리 (.com, .net, .kr 등)
	- `example` : 2차 도메인
	- `www` : 호스트 이름

- 도메인은 **임대** → 1년 단위 갱신
	- 사용자 → Registrar(등록 대행 업체)를 통해 도메인 임대

#### 조회

| 구분    | 정방향      | 역방향     |
| ----- | -------- | ------- |
| 방향    | 이름 → IP  | IP → 이름 |
| 레코드   | A / AAAA | PTR     |
| 필수 여부 | 필수       | 선택적     |
|       |          |         |

- PTR은 DNS 동작에 필수 X
	- → But, 메일 서버 운영 시 매우 중요

#### nslookup과 PTR

nslookup 실행 시 : `Server: ns1.example.com`
- 해당 DNS 서버 IP에 대한 PTR 레코드 있어야 출력
- if) PTR X → IP로 표시, DNS 동작과는 무관

## Caching Name Server

