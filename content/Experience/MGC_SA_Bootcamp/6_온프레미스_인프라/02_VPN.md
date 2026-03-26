---
title: VPN
draft: false
date: 2026-03-26
updated: 2026-03-26
tags:
  - VPN
  - Tunneling
  - IPsec
  - Site-to-Site VPN
  - Remote VPN
---

>공용 네트워크 (인터넷 등)을 이용하여 안전한 사설 네트워크를 구축하는 기술  
>VPN을 통해 사용자는 원격에서 내부 네트워크에 접속하거나 보안이 강화된 통신을 수행할 수 있음

**필요성**
- 인터넷을 통한 안전한 데이터 전송
- 원격 근무 및 외부 접속 지원
- 기업 간 네트워크 연결

#### 주요 개념

1. **터널링 (Tunneling)**
	- 원본 헤더에 새로운 헤더 추가 → 추가된 새로운 헤더 이용하여 라우팅
	- 통과할 수 없는 네트워크 이동 가능하게 함
	- 공중망을 통한 사설 네트워크 간 통신, IPv6망을 통한 IPv4네트워크간 통신 등

2. **암호화 (Encryption)**
	- 터널링 자체 암호화 기능 X → 보안 취약
	- 일반적으로 AES (Advanced Encryption Standard) 같은 강력한 암호화 알고리즘 사용

3. **인증 (Authentication)**
	- 사용자 ID/PW 인증
	- 디지털 인증서 기반 인증

#### 유형

1. **원격 액세스 VPN (Remote Access VPN)**
	- 개별 사용자 인터넷을 통해 기업 or 조직 내부 네트워크 안전하게 접속할 수 있게 하는 VPN

2. **사이트 간 VPN (Site-to-Site VPN)**
	- 기업 or 조직 간 여러 네트워크 인터넷을 통해 연결하는 방식
	- 인트라넷 VPN : 동일 조직 내 자사 간 네트워크 연결
	- 엑스트라넷 VPN : 서로 다른 조직 간 네트워크 연결

#### VPN 프로토콜

1. **IPSec VPN**
	- 네트워크 계층 (Layer 3)에서 동작
	- IP 패킷 암호화하여 공용 네트워크를 통해 두 네트워크 간 안전한 통신 제공

2. **SSL VPN**
	- TLS/SSL 암호화 이용
	- 사용자 - 네트워크 간 안전한 접속 제공
	- 원격 사용자가 내부 네트워크에 접속

3. **OpenVPN**
	- TLS 기반 암호화, 오픈소스 VPN 솔루션
	- 사용자 - 서버 or 네트워크 간 안전한 터널 생성 → 원격 접속 or 네트워크 연결 제공
	- 원격 사용자 접속, 클라우드 서버 접속 시 사용

>[!info] 정리
>VPN은 현대 인터넷 환경에서 보안과 프라이버시 보호를 위한 필수적인 기술  
>다양한 유형과 프로토콜을 이해하고 적절한 VPN 서비스를 선택하는 것이 중요

---

### 터널링 (Tunneling)

> 암호화가 적용되지 않은 터널링 → 패킷 암호화 X, encapsulation해서 다른 네트워크를 통해 전송  
> 대표적으로 GRE (Generic Routing Encapsulation) 터널  
> 다양한 프로토콜을 IP 네트워크를 통해 전달할 수 있도록 함

#### GRE (Generic Routing Encapsulation)

- **비암호화 터널링 프로토콜**
	- 서로 다른 네트워크 연결
- 다양한 프로토콜 (IPv4, IPv6, MPLS, AppleTalk 등)을 IP 네트워크를 통해 전달할 수 있도록 지원
- IPsec과 달리 **암호화 기능 X**, 무결성이나 인증 제공 X

**특징**
- **암호화 X** : 데이터 암호화 X (보안 취약)
- **다양한 프로토콜 지원** : IPv4. IPv6, IPX 등 다양한 프로토콜 캡슐화 가능
- **오버헤드 증가** : GRE 헤더(4바이트)와 새로운 IP 헤더(20바이트) 추가
- **멀티캐스트 지원** : OSPF, EIGRP 등의 동적 라우팅 프로토콜 사용 가능

#### GRE 터널 구성

**동작 방식**
1. **GRE 헤더 추가** : 원본 패킷에 GRE 헤더와 새로운 IP 헤더 추가
2. **IP 네트워크를 통해 전송** : GRE 패킷이 공중망을 통해 전송
3. **수신측에서 해제** : GRE 헤더를 제거, 원본 패킷 목적지로 전달

**구조**
```
| New IP Header | GRE Header | Original Packet |
```
- `New IP Header` : 터널의 출발지와 목적지 정의
- `GRE Header` : 캡슐화된 패킷의 프로토콜 유형 등을 포함
- `Original Packet` : 원래 전송하고자 했던 데이터

**예제) Cisco GRE 터널 설정**

환경 :
- 라우터 A (Tunnel Source: 192.168.1.1)
- 라우터 B (Tunnel Destination: 192.168.2.1)
- 터널 인터페이스: **Tunnel 0**

라우터 A 설정
```
interface Tunnel0
 ip address 10.1.1.1 255.255.255.0
 tunnel source 192.168.1.1
 tunnel destination 192.168.2.1
!
ip route 192.168.2.0 255.255.255.0 10.1.1.2
```

라우터 B 설정
```
interface Tunnel0
 ip address 10.1.1.2 255.255.255.0
 tunnel source 192.168.2.1
 tunnel destination 192.168.1.1
!
ip route 192.168.1.0 255.255.255.0 10.1.1.1
```

**검증 및 문제 해결**

GRE 터널 상태 확인 :
```
show ip interface brief
show interfaces tunnel 0
show ip route
```

터널 통신 테스트 :
```
ping 10.1.1.2
```

일반적인 문제 해결 방법

| 문제                    | 해결 방법                                                |
| --------------------- | ---------------------------------------------------- |
| 터널 인터페이스가 **down** 상태 | `show interfaces tunnel 0` 명령어로 확인 후, 소스 및 목적지 주소 검토 |
| **핑(Ping)이 안됨**       | `show ip route` 확인, 터널 인터페이스의 경로 추가                  |
| **MTU 문제 발생**         | `ip mtu 1400` 및 `tunnel path-mtu-discovery` 명령어 추가   |

#### GRE 터널의 장단점

**장점**
- 다양한 프로토콜 캡슐화 가능 (IPv4, IPv6, MPLS 등)
- 동적 라우팅 프로토콜(OSPF, EIGRP) 지원
- 멀티캐스트 트래픽 전송 가능

**단점**
- 암호화 기능이 없음 (보안 취약)
- 추가적인 오버헤드 발생 (GRE + IP 헤더 증가)
- 패킷 필터링 및 방화벽 설정 필요 (IP 프로토콜 47 허용 필요)

>[!info] 결론
>- GRE는 다양한 프로토콜을 캡슐화할 수 있는 강력한 터널링 기술이지만, 보안 기능이 부족하므로 IPsec과 함께 사용하는 것이 일반적  
>- 멀티캐스트, 동적 라우팅 프로토콜을 사용할 경우 GRE 터널이 적합  
>- 보안이 필요한 경우 GRE over IPsec을 고려해야 함

---

### IPsec (Internet Protocol Security)

> IP계층에서 보안 기능 제공하는 프로토콜 스위트  
> 데이터 무결성, 기밀성, 인증 및 재전송 방지(Anit-Replay) 기능 제공  
> 주로 VPN, 사이트 간 보안 통신, 원격 접속 보안에 사용

#### 주요 기능

| 기능                        | 설명                                               |
| ------------------------- | ------------------------------------------------ |
| **기밀성 (Confidentiality)** | 암호화를 통해 데이터 보호 (예: AES, 3DES)                    |
| **무결성 (Integrity)**       | 데이터 변경 여부를 검증 (예: HMAC-SHA, HMAC-MD5)            |
| **인증 (Authentication)**   | 통신하는 장치 간 신뢰성 확보 (예: Pre-Shared Key, RSA, X.509) |
| **재전송 방지 (Anti-Replay)**  | 패킷 재전송 공격 방어 (일련번호 기반)                           |

#### 주요 구성 요소

>보안 서비스 제공 방식과 동작 모드에 따라 설정

##### 1. 보안 프로토콜

IPsec는 두 가지 주요 프로토콜 사용

1. AH (Authentication Header)
	- 데이터 무결성과 인증 제공
		- 암호화 X
	- 데이터 변경 여부 확인 가능
	- `IP 프로토콜 번호 51` 사용

2. ESP (Encapsulating Security Payload)
	- 데이터 암호화 + 무결성 + 인증 제공
	- `IP 프로토콜 번호 50` 사용
	- 일반적으로 AH 대신 ESP를 사용

| 비교 항목   | AH (Authentication Header) | ESP (Encapsulating Security Payload) |
| ------- | -------------------------- | ------------------------------------ |
| 암호화 지원  | ❌ (암호화 X)                  | ✅ (암호화 O)                            |
| 무결성 검증  | ✅                          | ✅                                    |
| 인증      | ✅                          | ✅                                    |
| 재전송 방지  | ✅                          | ✅                                    |
| 일반적인 사용 | 보안 강화 (암호화 불필요)            | VPN, 보안 통신 (암호화 필수)                  |

##### 2. IPsec의 동작 모드

- 트래픽 보호 범위에 따라 **전송모드**와 **터널모드**로 나뉨

| 모드                         | 설명                         | 사용 예시                   |
| -------------------------- | -------------------------- | ----------------------- |
| **전송 모드 (Transport Mode)** | 원본 IP 헤더 유지, 페이로드(데이터)만 보호 | 호스트 간 통신 보호 (예: SSH 보안) |
| **터널 모드 (Tunnel Mode)**    | 전체 IP 패킷을 캡슐화하여 새 IP 헤더 추가 | VPN, 사이트 간 통신           |

- 전송 모드 (Host-to-Host)
```
[원본 패킷]  | IP 헤더 | TCP/UDP 데이터 |
[AH 적용]    | IP 헤더 | AH | TCP/UDP 데이터 |
[ESP 적용]   | IP 헤더 | ESP Header | 암호화된 데이터 | ESP Trailer |
```

- 터널 모드 (Site-to-Site VPN)
```
[원본 패킷]  | 원본 IP 헤더 | TCP/UDP 데이터 |
[터널 모드]  | 새 IP 헤더 | ESP Header | 암호화된 원본 패킷 | ESP Trailer |
```

#### IPsec 작동 과정 (ISAKMP & SA)

- 두 장치 간 보안 협상을 위해 SA (Security Association) 설정

##### 1. IKE (Internet Key Exchange) - 키 교환

- 암호화 키와 보안 매개변수를 설정

1. **IKE Phase 1 (ISAKMP SA 설정)**
	- 장치 간 보안 채널 수립
	- 메시지 인증 및 키 교환
	- 세션 연결 : 메인 모드(Main Mode), 공격 대응용 빠른 모드(Aggressive Mode)

2. **IKE Phase 2 (IPsec SA 설정)**
	- 실제 IPsec 트래픽 보호할 보안 연결(SA) 설정
	- ESP 또는 AH 사용
	- 세션 연결 : 빠른 모드(Quick Mode)

##### SA (Security Association) - 보안 연결 설정

- **IPsec SA** : 두 장비 간 보안 정책을 설정하고 유지하는 데이터베이스
- SA는 단방향으로 설정 (양방향 통신 시 SA 2개 필요)
- SA는 SPI(Security Parameter Index) 값을 통해 구분
```
show crypto ipsec sa # SA 상태 확인 명령어
```

#### IPsec의 암호화 및 인증 알고리즘

1. **암호화 알고리즘 (Encryption)**

| 알고리즘 | 키 길이            | 보안성 | 비고       |
| ---- | --------------- | --- | -------- |
| DES  | 56-bit          | 낮음  | 사용 지양    |
| 3DES | 168-bit         | 중간  | 성능 저하 가능 |
| AES  | 128/192/256-bit | 높음  | 강력한 보안   |

2. **무결성 검증 알고리즘 (Integrity)**

| 알고리즘    | 해시 크기   | 보안성        |
| ------- | ------- | ---------- |
| MD5     | 128-bit | 낮음 (충돌 가능) |
| SHA-1   | 160-bit | 중간 (보안 취약) |
| SHA-256 | 256-bit | 높음         |
| SHA-512 | 512-bit | 매우 높음      |

**예제) IPsec VPN 구성 (Cisco)**

Cisco 장비에서 Site-to-Site IPsec VPN 설정 명령어

1. IKE Phase 1 설정
```
crypto isakmp policy 10
 encr aes 256
 hash sha256
 authentication pre-share
 group 5
 lifetime 86400
```

2. IKE Phase 2 (IPsec SA) 설정
```
crypto ipsec transform-set MYSET esp-aes esp-sha-hmac
```

3. VPN 피어(상대 라우터) 및 키 설정
```
crypto isakmp key MY_SECRET_KEY address 192.168.2.1
```

4. 암호화 맵 적용
```
crypto map MYMAP 10 ipsec-isakmp
 set peer 192.168.2.1
 set transform-set MYSET
 match address 101
```

5. 인터페이스에 암호화 적용
```
interface GigabitEthernet0/0
 crypto map MYMAP
```

#### IPsec의 장단점

**장점**
- **강력한 보안** (암호화 + 무결성 + 인증)
- **유연한 사용 가능** (VPN, 원격 접속 등)
- **공용 네트워크에서도 안전한 통신 가능**

**단점**
- **설정이 복잡** (SA, 키 교환, 암호화 설정 필요)
- **암호화로 인한 네트워크 성능 저하 가능**
- **방화벽에서 ESP (IP 프로토콜 50) 및 AH (IP 프로토콜 51) 허용 필요**

>[!info] 결론
>- IPsec은 **VPN, 원격 보안 접속, 네트워크 보안**에 필수적인 프로토콜  
>- **ESP 모드**(암호화 포함)가 일반적으로 사용됨  
>- **터널 모드**는 VPN 연결에 최적, **전송 모드**는 호스트 간 보호에 적합  
>- **IKE를 통한 SA(Security Association) 설정이 중요**


---

### Site-to-Site IPsec VPN

- 두 개의 네트워크를 보안 터널을 통해 안전하게 연결하는 방식
- IPsec을 사용하여 데이터를 암호화하고 보호

**Site-to-Site VPN 특징**
- 기업 네트워크 간 보안 연결
- 라우터 또는 방화벽 장비에서 설정
- 사용자가 개별 VPN 접속 없이 자동으로 통신 가능

##### 동작 과정

1. Phase 1 : IKE SA (Security Association) 설정
	- ISAKMP (Security Association Key Management Protocol) 사용 → 보안 정책 협상
	- Diffie-Hellman 키 교환 → 암호화 키 안전하게 공유
	- 인증(Authentication) 및 암호화 알고리즘 결정
과정
```
라우터A                      라우터B
   |--- 1. IKE SA 협상 요청 --->  |
   |<--- 2. IKE SA 응답   ----    |
   |--- 3. Diffie-Hellman 키 교환  |
   |<--- 4. 인증 및 암호화 설정 완료 |
```

2. Phase 2 : IPSec SA (Security Association) 설정
	- ESP (Encapsulating Security Payload) 또는 AH (Authentication Header) 사용 → 데이터 암호화
	- IP 패킷 터널링(Tunneling) → 안전한 데이터 전송
과정
```
라우터A                      라우터B
   |--- 5. IPSec SA 협상 요청 --->  |
   |<--- 6. IPSec SA 응답   ----    |
   |--- 7. 터널 생성 및 데이터 암호화 전송 |
   |<--- 8. 암호화된 데이터 수신 및 복호화 |
```

**Site-to-Site IPSec VPN 그림**
```
+-------------+      IPSec VPN Tunnel      +-------------+
| 라우터 A    |==========================>| 라우터 B    |
| (본사)      |                            | (지사)      |
| Private LAN |                            | Private LAN |
+-------------+                            +-------------+

단계 1: IKE Phase 1 (키 교환 및 SA 설정)
단계 2: IKE Phase 2 (데이터 암호화 및 터널링)
단계 3: 암호화된 데이터 전송
```

##### IPSec 주요 파라미터

| 설정 항목        | 설명                                                                 |
| ------------ | ------------------------------------------------------------------ |
| **암호화 알고리즘** | AES, 3DES                                                          |
| **인증 알고리즘**  | SHA-256, SHA-512                                                   |
| **키 교환 방식**  | Diffie-Hellman Group 1, 2, 5,14, 19                                |
| **IPSec 모드** | 터널 모드(Tunnel Mode), 전송 모드(Transport Mode)                          |
| **보안 프로토콜**  | ESP (Encapsulating Security Payload) 또는 AH (Authentication Header) |

>[!info] 결론
>**Phase 1**: IKE SA 설정 → **보안 정책 협상 & 키 교환**
>**Phase 2**: IPSec SA 설정 → **데이터 암호화 및 안전한 통신**
>**IPSec VPN 터널을 통해 두 라우터 간 안전한 연결을 유지**

---

### Remote VPN

**VPN 서버**: Cisco Router (공인 IP: `203.0.113.1`)
**VPN 클라이언트**: Windows PC 또는 Cisco AnyConnect, StrongSwan 등
**VPN 유형**: IPSec Remote Access VPN
**VPN 연결 목적**: 원격 사용자가 내부 네트워크(192.168.10.0/24)에 안전하게 접근

##### VPN 접속 과정

**1️. VPN 클라이언트의 연결 요청**

1. **VPN 클라이언트**(Windows PC 또는 Cisco AnyConnect)는 **VPN 서버의 공인 IP**(`203.0.113.1`)로 접속을 시도합니다.
2. 클라이언트는 IKE Phase 1 (ISAKMP)를 시작하여 보안 협상을 수행합니다.
    - 클라이언트와 서버는 암호화 방식(AES-256), 해시 알고리즘(SHA-256), 키 교환(DH Group 14)을 협상합니다.
3. VPN 서버(Cisco Router)가 클라이언트를 인증합니다.
    - 클라이언트는 **사전 공유 키(PSK, Pre-Shared Key)** 또는 사용자 계정(vpnuser/vpnpass)을 사용하여 인증합니다.

**2️. IKE Phase 1 - 보안 채널 생성**

1. VPN 서버와 클라이언트는 ISAKMP Security Association (SA)를 설정하여 보안 터널을 생성합니다.
2. **Diffie-Hellman 키 교환**을 수행하여 안전한 공유 키를 생성합니다.
3. **IKE Phase 1이 완료되면 양측이 보안 연결을 확립**합니다.

**3️. IKE Phase 2 - IPSec 터널 생성**

1. 클라이언트는 VPN 서버와 **IKE Phase 2** 협상을 시작합니다.
2. VPN 서버와 클라이언트는 IPSec 변환 세트(Transform Set)를 협상합니다.
    - 암호화: **AES-256**
    - 무결성 검사: **HMAC-SHA1**
3. **VPN 서버는 클라이언트에게 가상 IP 주소(예: 192.168.10.100)를 할당**합니다.
4. **IPSec 터널이 설정되며 VPN 데이터 통신이 가능해집니다**.

**4. VPN 터널을 통한 내부 네트워크 접근**

1. VPN 클라이언트는 **터널을 통해 내부 네트워크(192.168.10.0/24)에 접속**합니다.
2. VPN을 통해 사설 IP를 받은 클라이언트는 **내부 서버, 파일 공유, 프린터 등 사내 자원에 접근**할 수 있습니다.

**5️. VPN 세션 유지 및 종료**

1. 클라이언트가 **VPN 세션을 유지하는 동안 터널을 통해 보안 통신**을 수행합니다.
2. VPN 세션이 만료되거나 클라이언트가 연결을 종료하면 **ISAKMP 및 IPSec 터널이 해제**됩니다.
3. 클라이언트는 **VPN 접속을 해제**하고 **일반 인터넷 연결로 전환**됩니다.

**VPN 접속 과정**
```
[VPN 클라이언트]             [VPN 서버(Cisco Router)]          [내부 네트워크]
    (Windows PC)                         (203.0.113.1)                  (192.168.10.0/24)
          |                                      |                              |
          |-- (1) VPN 연결 요청 (ISAKMP) ----->   |                               |
          |                                      |                              |
          |<-- (2) IKE Phase 1 완료 ----------   |                               |
          |                                      |                              |
          |-- (3) IKE Phase 2 시작 ----------->  |                              |
          |<-- (4) IPSec 터널 생성 -------------  |                              |
          |                                      |                              |
          |-- (5) 내부 네트워크 접근 --------->   |---> 사내 서버, 프린터 사용     |
          |                                      |                              |
          |-- (6) VPN 세션 종료 -------------->   |                               |
```

![](Experience/MGC_SA_Bootcamp/6_온프레미스_인프라/img/20260326-1.png)

>[!info] 결론
>**Cisco Router를 VPN 서버로 사용하여 원격 접속을 설정하는 과정**  
>1️. VPN 클라이언트가 **VPN 서버(203.0.113.1)에 접속 시도**  
>2️. **IKE Phase 1** 협상을 통해 보안 채널 생성  
>3️. **IKE Phase 2** 협상을 통해 IPSec 터널 생성    
>4️. VPN 클라이언트가 **가상 IP 할당 후 내부 네트워크(192.168.10.0/24) 접근  **  
>5️. 클라이언트가 **VPN 접속을 유지하며 사내 자원 이용  **  
>6️. **VPN 세션 종료 후 터널 해제  **  