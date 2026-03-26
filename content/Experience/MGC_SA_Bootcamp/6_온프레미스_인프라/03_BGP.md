---
title: BGP
draft: false
date: 2026-03-26
updated: 2026-03-26
tags:
  - BGP
---

>**BGP (Border Gateway Protocol)**  
>인터넷에서 자율 시스템(AS, Autonomous System) 간의 라우팅 정보 교환 프로토콜  
>여러 네트워크 간 **최적의 경로를 찾고 유지**하는 역할


**특징**
- **인터넷의 핵심 라우팅 프로토콜**
- **AS(자율 시스템) 간의 경로를 설정하고 최적화**
- **경로 벡터 프로토콜(Path Vector Protocol)** 사용
- **Path Attribute (경로 속성)를 기반으로 라우팅 결정**
- **신뢰성이 높은 연결을 위해 TCP(포트 179) 사용**


작동 방식

1. BGP 라우터 간의 관계
	- AS 간 경로 관리 위해 BGP 피어링(Peering) 설정

- BGP 라우터 간의 관계 2가지
	1. eBGP (External BGP)
 