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


**작동 방식**

1. BGP 라우터 간의 관계
	- AS 간 경로 관리 위해 BGP 피어링(Peering) 설정

	- BGP 라우터 간의 관계 2가지
		1. eBGP (External BGP)
			- 서로 다른 AS 간 BGP 정보 교환
			- 인터넷 서비스 제공자(ISP) 간 사용
			- 직접 연결된 네트워크에서 주로 실행
		2. iBGP (Internal BGP)
			- 같은 AS 내부에서 BGP 정보 공유
			- 여러 라우터 존재 시 AS 내부에서 BGP 경로 유지하기 위해 사용
			- 스플릿 호라이즌 (Split Horizon) 규칙 적용 (Loop 방지)

2. BGP 메시지 유형

| 메시지 유형           | 설명                  |
| ---------------- | ------------------- |
| **OPEN**         | BGP 피어링 관계 설정       |
| **UPDATE**       | 네트워크 경로 정보 업데이트     |
| **KEEPALIVE**    | 피어 간 연결 유지 (주기적 전송) |
| **NOTIFICATION** | 에러 발생 시 피어 연결 종료    |

3. BGP 경로 선택 과정
	- 단순 짧은 경로 선택 X
	1. 선호도 높은 경로 선택 → Weight 값이 높은 경로 우선
	2. Local Preference → 지역 우선순위가 높은 경로 선택
	3. AS Path → 경로가 짧은 AS 선호
	4. Origin Type → IGP > EGP > Unknown 순서로 선호
	5. Multi-Exit Discriminator (MED) 값이 작은 경로 선호
	6. eBGP 경로가 iBGP 경로보다 우선
	7. 라우터 ID 가 작은 경로 선택


**경로 속성**

| 속성               | 설명               | 필수 여부 |
| ---------------- | ---------------- | ----- |
| **AS_PATH**      | 지나온 AS 목록        | ✅ 필수  |
| **NEXT_HOP**     | 다음 목적지 라우터 IP 주소 | ✅ 필수  |
| **LOCAL_PREF**   | AS 내부에서 우선순위 결정  | 선택    |
| **MED (Metric)** | 특정 경로를 선호하도록 조정  | 선택    |
| **COMMUNITY**    | 특정 그룹 내에서 정책 적용  | 선택    |


**BGP vs IGP (내부 게이트웨이 프로토콜)**

| 항목           | BGP (Border Gateway Protocol)           | IGP (OSPF, EIGRP, RIP 등)      |
| ------------ | --------------------------------------- | ----------------------------- |
| **역할**       | AS 간 라우팅 (인터넷)                          | AS 내부 라우팅                     |
| **프로토콜 유형**  | Path Vector Protocol                    | Link-State 또는 Distance Vector |
| **라우팅 대상**   | 인터넷 전체 경로                               | 내부 네트워크 경로                    |
| **경로 결정 기준** | Path Attributes (AS_PATH, LOCAL_PREF 등) | 메트릭 (Cost, Hop Count 등)       |
| **속도**       | 느림 (수초~수분)                              | 빠름 (밀리초~초)                    |
| **규모**       | 대규모 네트워크 (인터넷)                          | 소규모, 중규모 네트워크                 |


**BGP 장단점**

**장점**
- 인터넷 상 **가장 안정적인 라우팅 프로토콜**
- **다양한 경로 선택 기준 제공** (정책 기반 라우팅 가능)
- **대규모 네트워크 확장 가능**

**단점**
- **설정 복잡, 운영 어려움**
- **라우팅 갱신 속도 느림** (Failover 느릴 수 있음)
- **초기 설정 및 튜닝 필요** (Best Path Selection)


예시) BGP 구성 (Cisco 설정)
eBGP (AS 65001 ↔ AS 65002)
```
Router_A(config)# router bgp 65001
Router_A(config-router)# neighbor 192.168.1.2 remote-as 65002
Router_A(config-router)# network 10.10.10.0 mask 255.255.255.0
```

iBGP (AS 65001 내부)
```
Router_B(config)# router bgp 65001
Router_B(config-router)# neighbor 192.168.2.1 remote-as 65001
Router_B(config-router)# network 10.20.20.0 mask 255.255.255.0
```


**활용 사례**

- **ISP (인터넷 서비스 제공자) 간의 연결**
- **대기업 및 클라우드 네트워크 (Google, AWS, Azure)**
- **CDN (Content Delivery Network) 트래픽 관리**
- **멀티홈 네트워크 (하나의 AS가 여러 ISP와 연결된 환경)**

>[!info] 결론
>- BGP는 인터넷에서 사용되는 가장 중요한 라우팅 프로토콜  
>- AS 간에 최적의 경로를 선택하여 안정적인 네트워크 운영  
>- 정책 기반 라우팅 가능하지만 설정 및 운영이 복잡  
>- 인터넷 백본(Backbone) 네트워크를 구성하는 핵심 요소   
>**인터넷 라우팅의 핵심 기술**

---

### AS (Autonomous System) 번호

>**인터넷 상 개별 네트워크 식별 위해 사용되는 고유한 숫자**  
>인터넷 = 여러 개의 독립적인 네트워크(AS) 로 이루어져 있으며,  
>각 AS = **자체적인 라우팅 정책**을 가지고 운영

- 인터넷에서 **라우팅 경로 결정** 시 사용
- BGP(Border Gateway Protocol)을 통해 AS 간 라우팅 정보 교환
- ISP, 대기업, 클라우드 서비스, 정부 기관 등에서 사용

초기 AS 번호 16비트(2바이트) 설계 = 최대 65,536개 (0~65535)
→ 공인 AS 번호 부족 문제 발생
IANA (Internet ASsigned Numbers Authority) 07년도부터
32비트(4바이트) AS 번호 체계 도입 = 최대 42억 개 까지 확장
현재 16비트와 32비트 AS 번호 함께 사용


**공인 AS 번호 (Public AS Number) vs 사설 AS 번호 (Private AS Number)**

1. 공인 AS 번호 (Public AS Number)
	- 공식적으로 사용되는 AS 번호
	- IANA 및 RIR(Regional Internet Registry) 통해 관리
	- ISP, 대기업, 데이터센터, 클라우드 사업자 등 사용
	- BGP 통해 글로벌 인터넷에 연결되는 네트워크에 할당
	- 범위
		- 1 ~ 64511 (16비트)
		- 65536 ~ 4199999999 (32비트)

2. 사설 AS 번호 (Private AS Number)
	- 인터넷 X, 내부 네트워크(기업, 기관, 연구소 등)에서만 사용
	- 인터넷 사용 X, 외부 라우팅 X
	- NAT 또는 BGP 설정을 통해 공인 AS 번호로 변환 가능
	- 범위
		- 64512 ~ 65534 (16비트)
		- 4200000000 ~ 4294967294 (32비트)
	- 예시
		- 기업 내부 BGP 사용한 네트워크 연결
		- 데이터센터 고객 네트워크 분리 및 관리용
		- 클라우드 서비스 가상 네트워크 간 연결

| 구분                    | 설명                            |
| --------------------- | ----------------------------- |
| **AS 번호**             | 인터넷에서 네트워크를 식별하는 고유한 숫자       |
| **16비트 → 32비트 확장 이유** | 인터넷 확장으로 AS 번호 부족 해결          |
| **공인 AS 번호**          | 인터넷에 연결된 네트워크에 사용됨            |
| **사설 AS 번호**          | 내부 네트워크에서만 사용됨 (인터넷에 노출되지 않음) |

>AS 번호 = 인터넷의 라우팅과 트래픽 관리에서 중요한 역할  
>공인 AS 번호 = 인터넷 서비스 제공(ISP) 및 기업에서 사용,   
>사설 AS 번호 = 내부 네트워크 관리에 활용

---

#### BGP Neighbor 연결 과정 (BGP 피어링 과정)

BGP는
**Neighbor(피어, Peer) 라우터와 TCP 연결(Port 179)**
**경로 정보(라우팅 테이블) 공유**


**연결 과정**

| 단계  | 상태 이름             | 설명                                             |
| --- | ----------------- | ---------------------------------------------- |
| 1️⃣ | **Idle**          | BGP 프로세스가 시작되었지만, 아직 연결을 시도하지 않음               |
| 2️⃣ | **Connect**       | TCP(포트 179)를 사용하여 Neighbor와 연결 시도              |
| 3️⃣ | **Active**        | 이전 단계에서 연결 실패 시, 다시 연결을 시도                     |
| 4️⃣ | **OpenSent**      | Open 메시지를 보내고, 상대방의 Open 메시지를 기다림              |
| 5️⃣ | **OpenConfirm**   | Keepalive 메시지를 주고받으며 세션 확인                     |
| 6️⃣ | **Established** ✅ | BGP Neighbor 관계가 성립되고, 경로 정보(UPDATE 메시지) 교환 시작 |

1. **Idle 상태**
	- BGP 프로세스 실행, 아직 Neighbor(피어)와 연결 시도 X
	- 원인 : 초기 상태 or 이전 세션 종료
	- `neighbor` 명령으로 수동 설정 / 라우터 설정 확인

2. **Connect 상태**
	- 라우터가 TCP(포트 179) 사용해 BGP Neighbor와 연결 시도
	- 성공 → OpenSent 상태 / 실패 → Active 상태

3. **Active 상태**
	- Connect 상태에서 TCP 연결 실패 시 변경
	- 다시 TCP 연결 시도
	- if) Active 상태 유지 시
		- Neighbor IP 설정 확인
		- TCP 연결 가능 여부 확인 (`telnet [neighbor IP] 179` 실행)
		- AS 번호 맞는지 확인

4. **OpenSent 상태**
	- TCP 연결 성공 시 BGP Open 메시지 전송
	- 상대방의 Open 메시지 기다리는 상태
	- Open 메시지에 포함
		- BGP 버전
		- AS 번호
		- BGP 라우터 ID
		- 홀드 타임

5. **OpenConfirm 상태**
	- BGP Open 메시지 주고받은 후 Keepalive 메시지 교환
	- BGP Neighbor 정상 동작 확인
	- if 문제 발생 시 → Notification 메시지 보내고 세션 종료

6. **Established 상태**
	- BGP 피어링 성공
	- UPDATE 메시지 교환하여 라우팅 정보 공유
	- BGP 상태가 Established X → 경로 정보 교환 X
		- 확인 : `show ip bgp summary`

**BGP Neighbor 연결 확인**
```
Router# show ip bgp summary
```
- `State` = `Established` → BGP 피어링 성공


**문제 해결**

| 상태          | 원인                       | 해결 방법                    |
| ----------- | ------------------------ | ------------------------ |
| Idle        | BGP 설정 없음, IP 오류, ACL 차단 | `neighbor` 설정 확인, 방화벽 확인 |
| Connect     | TCP 연결 실패                | 상대방 라우터와 네트워크 연결 확인      |
| Active      | 상대방 라우터 응답 없음            | AS 번호, IP 주소, 포트 179 확인  |
| OpenSent    | BGP 버전 불일치               | 같은 BGP 버전 사용하도록 설정       |
| OpenConfirm | Keepalive 메시지 문제         | BGP 설정 다시 확인             |

- 네트워크 연결 확인 : `ping [neighbor IP]` `telnet [neighbor IP] 179`
- BGP 설정 확인 : `show running-config | include bgp`

>[!info] 요약
>- BGP Neighbor 연결 → **6단계의 FSM(State Machine) 과정**
>- **Established 상태가 되어야 정상적인 BGP 피어링 및 경로 교환 가능**
>- **BGP 문제 발생 시, Neighbor IP / AS 번호 / TCP 179 포트 등을 확인**
>- **BGP 설정이 정상이라면 `show ip bgp summary`에서 Established 상태 확인 가능**

---

#### MetalLB + Ingress

- MetalLB → 외부에서 접근 가능한 VIP를 할당하고 BGP로 광고
- Ingress Controller → HTTP/HTTPS 요청을 Host/Path 기준으로 분기
- Service → Ingress Controller가 백엔드 애플리케이션으로 연결
- Pod → 실제 애플리케이션 실행

MetalLB 만 사용 시
→ 서비스마다 LoadBalancer IP가 하나씩 필요 → 외부 IP 많이 사용하게 됨
MetalLB + Ingress
→ Ingress Controller 앞에 VIP 하나만 할당
→ Host/Path 기준으로 여러 서비스 분기 가능

**전체 구조**
```
Client Network
      │
      │
     R1
      │
      │ iBGP
      │
     R2
      │
      │ eBGP
      │
Kubernetes Nodes
      │
      │
MetalLB VIP
      │
      │
Ingress Controller Service (LoadBalancer)
      │
      │
Ingress Controller Pod
      │
 ┌────┴───────────────┐
 │                    │
Service 1          Service 2
 │                    │
Pod 1                Pod 2
```

>MetalLB → 외부 진입점(VIP) 생성  
>Ingress Controller → 그 트래픽을 여러 서비스로 분배

|구성요소|역할|
|---|---|
|MetalLB|외부 접속용 VIP 제공|
|Router|VIP 경로 라우팅|
|Ingress Controller|HTTP/HTTPS 분기|
|Service|Pod 접근용 내부 추상화|
|Pod|실제 애플리케이션 실행|

1. **MetalLB**

Kubernetes에서 `type: LoadBalancer` 사용할 수 있게 하는 구성요소

- LoadBalancer IP(VIP) 할당
- VIP를 BGP 또는 L2로 외부 네트워크에 광고
- 외부 라우터가 해당 VIP로 트래픽을 보낼 수 있게 함

- HTTP 라우팅 X → L4 수준의 진입점 제공자


2. **Ingress Controller**

HTTP/HTTPS 레벨의 요청 분기 장치

- Host 기반 라우팅
- Path 기반 라우팅
- TLS 종료(HTTPS 인증서 처리)
- 여러 서비스에 대한 단일 진입점 제공


3. **Service**

Pod 앞에 위치한 가상 네트워크 객체

- Pod 집합을 하나의 네트워크 엔드포인트처럼 제공
- Pod IP가 바뀌어도 안정적인 접근 경로 제공
- kube-proxy를 통해 로드밸런싱 처리


|항목|MetalLB|Ingress Controller|
|---|---|---|
|역할|외부 IP 제공|HTTP/HTTPS 요청 분기|
|동작 계층|L4 중심|L7 중심|
|처리 기준|IP, TCP/UDP|Host, Path, TLS|
|결과|VIP 생성|여러 서비스 분기|
