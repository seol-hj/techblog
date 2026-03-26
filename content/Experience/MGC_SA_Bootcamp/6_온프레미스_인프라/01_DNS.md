---
title: DNS
draft: false
date: 2026-03-05
updated: 2026-03-26
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

![563](Experience/MGC_SA_Bootcamp/6_온프레미스_인프라/img/20260326.png)

- 재귀 질의를 수행
- 응답을 TTL 동안 캐시에 저장

**동작** :
1. 클라이언트 질의
2. 루트 → TLD → 권한 서버 질의
3. 결과 수신
4. TTL 동안 캐시 저장
5. 동일 질의는 캐시 응답
	- TTL(Time To Live) = 캐시 유지 시간

**보안**
- 외부 개방 시 Open Resolver
	- DNS 증폭 공격
	- DDoS 반사 공격
→ allow-recursion 은 내부망으로 제한 필요

ex) **Caching DNS**

**설치** : `sudo apt install -y bind9 bind9-utils bind9-dnsutils`
- `bind9` : DNS 서버 프로그램 (named)
- `bind9-utils` : DNS 관리 도구
- `bind9-dnsutils` : dig, nslookup 같은 테스트 도구

**확인** :

서비스 상태 확인 : `systemctl status bind9`
시작 or 중지 :
```
sudo systemctl start bind9
sudo systemctl stop bind9
sudo systemctl restart bind9
```
부팅 시 자동 실행 : `sudo systemctl enable bind9`

설정 파일 : `/etc/bind`에 존재
ex)
```
named.conf
named.conf.options
named.conf.local
named.conf.default-zones
```
- `named.conf` : 메인 설정 파일
- `named.conf.options` : DNS 서버 기본 옵션
- `named.conf.local` : 사용자 정의 zone
- `named.conf.default-zones` : 기본 zone

test : `dig @192.168.80.110 www.google.com`
- `@127.0.0.1` : 질의할 DNS 서버
- `google.com` : 조회할 도메인
	- 두번째 실행시 응답 속도 빠르면 → 캐시 정상

**DNS 전송 계층 프로토콜**

- `UDP`
	- 포트번호 : `53`
	- 용도 : 일반 DNS 질의
- `TCP`
	- 포트번호 : `53`
	- 용도 : zone transfer, 큰 응답

## Authoritative Name Server

- **재귀 질의 기능**
- **DNS 서버**가 클라이언트를 대신하여 **도메인 조회**를 수행하는 기능
- DNS 서버가 관리하지 않는 질의 → **루트 DNS**부터 **TLD DNS**, **Authoritative DNS** 순서로 질의를 진행, 결과를 클라이언트에게 반환

- BIND의 기본 설정 = recursion 활성 상태
	- 필요 시 `options`블록에서 recursion 비활성화 가능
ex)
```
options { 
	recursion no;
};
```
- DNS 서버는 자신이 관리하는 zone 정보만 응답
- 외부 도메인 조회 수행 X

- → Resolver 기능 X / Authoritative DNS 역할만 수행

**이론**
- Authoritative DNS → 특정 zone의 원본 데이터를 보유하고 정답 제공

**특징**
- 재귀 수행 X
- 자신이 관리하는 zone만 응답
- SOA 포함
- NS 레코드 정의 필수

**Domain vs Zone**
- Domain → 이름 공간
- Zone → DNS 서버가 관리하는 단위

## Zone 등록

#### Zone (Domain)

`/etc/named.rfc1912.zones` 파일에 도메인 등록
ex)
```
zone "example.com" IN {
type master;
file "example.zone";
};
```
- zone 파일은 `/var/named` 디렉토리에 위치 필수

#### Zone File

DNS의 실제 데이터베이스 파일

위치 : `/etc/bind`

#### 구조

```
$TTL 86400
@   IN  SOA ns1.example.com. admin.example.com. (
        2026022101
        3600
        900
        604800
        86400
)

    IN  NS  ns1.example.com.

ns1 IN  A   192.168.80.53
www IN  A   192.168.80.100
```

#### Zone transfer 항목

|항목|의미|
|---|---|
|Serial|변경 버전 번호|
|Refresh|Slave 확인 주기|
|Retry|재시도 간격|
|Expire|만료 시간|
|Minimum|기본 TTL|

- Serial 증가 X → Slave 갱신 X

#### 주요 레코드

- A → IPv4
- PTR → 역방향
- NS → 권한 서버
- CNAME → 별칭
- MX → 메일 서버

##### ex) Authoritative DNS

example.com Zone 정의
```
zone "example.com" IN {
    type master;
    file "example.com.zone";
};
```

test.com Zone 정의
```
zone "test.com" IN {
    type master;
    file "test.com.zone";
};
```

example.com Zone File
```
$TTL 86400
@   IN  SOA ns1.example.com. admin.example.com. (
        2026022101
        3600
        900
        604800
        86400
)

    IN  NS  ns1.example.com.

ns1 IN  A   192.168.80.53
www IN  A   192.168.80.100
```

test.com Zone File
```
$TTL 86400
@   IN  SOA ns1.test.com. admin.test.com. (
        2026022101
        3600
        900
        604800
        86400
)

    IN  NS  ns1.test.com.

ns1 IN  A   192.168.80.53
www IN  A   192.168.80.110
```

점검
```
named-checkconf
named-checkzone example.com /var/named/example.com.zone
named-checkzone test.com /var/named/test.com.zone
```

재시작
```
systemctl restart named
```

## Zone Transfer

- Master의 Zone 데이터를 Slave로 복제하는 과정
- 종류
	- AXFR → 전체 전송
	- IXFR → 증분 전송

- Slave는 SOA Serial 비교 후 동기화
- TCP 53 사용

#### Master / Slave

Master 설정
```
zone "example.com" IN {
    type master;
    file "example.com.zone";
    allow-transfer { 192.168.80.54; };
};
```

Slave 설정
```
zone "example.com" IN {
    type slave;
    file "slaves/example.com.zone";
    masters { 192.168.80.53; };
};
```

Slave 시작
```
systemctl restart named
```

## named-chroot

#### chroot

- 프로세스의 루트 디렉터리 변경하는 보안 기술

**DNS 서버에 사용 이유**
- DNS 서버 → 외부와 직접 통신
- 취약점 발생 시
	- 파일 시스템 접근
	- 시스템 파일 탈취
	- 권한 상승 시도

- if) chroot 사용 시
	- 접근 가능한 디렉터리 범위 제한
	- 시스템 전체 파일 접근 차단
	- 침해 발생 시 피해 범위 최소화
- → **보안 격리 목적**

**named-chroot 구조**
```
/var/named/chroot/
├── etc/
│   └── named.conf
├── var/
│   └── named/
│       ├── example.com.zone
│       └── slaves/
├── dev/
└── run/
```