---
title: GCP Network 기본
draft: false
date: 2026-04-15
updated: 2026-04-15
tags:
  - GCP
  - VPC
  - Subnet
  - Firewall
---

**AWS**
- VPC = 리전 단위 네트워크
- 서브넷 = AZ 단위
- Security Group = 인스턴스 단위 방화벽
- Route Table을 서브넷과 연결해 경로를 제어

**GCP**
- VPC = 글로벌 리소스
- 서브넷 = 리전 리소스
- 방화벽 제어 = VPC Firewall Rule 중심
- 인스턴스 대상 지정에 네트워크 태그나 서비스 계정 활용 가능
- 모든 VPC에는 기본적으로 암시적(implied) 방화벽 규칙이 존재


## GCP VPC

종류
1. **Auto mode VPC**
	- Google Cloud가 서브넷 자동 생성
	- 여러 리전에 대해 기본 대역의 서브넷 자동 준비

	- **장점**
		- 빠르게 시작 가능
		- 초반 구조 확인 쉬움
	- **단점**
		- 네트워크 대역 세밀하게 설계하기 어려움
		- 주소 체계 충돌 가능성
		- 향후 확장이나 하이브리드 연결 불편

2. **Custom mode VPC**
	- 서브넷 직접 설계, 생성
	- 리전별로 필요한 서브넷과 CIDR 대역 정함

	- **장점**
		- 주소 체계 명확히 설계 가능
		- 멀티리전, VPN, 하이브리드 연결 시 유리
	- **단점**
		- 초기 설정 필요


#### Subnet

GCP → 리전 리소스

#### Route

패킷 경로 정보

#### GCP Firewall Rule

분산형 가상 방화벽

- 네트워크 차원에서 정의
- 태그나 서비스 계정으로 지정 가능
- 규칙에 우선순위 존재
- 암시적 인바운드 거부 / 아웃바운드 허용 규칙 존재
	- 명시적으로 인바운드 허용 규칙 만들어야 함


**주요 구성 요소**

1. **Direction**
	- 트래픽 방향
	- `INGRESS` : 외부 또는 다른 소스에서 VM으로 들어오는 트래픽
	- `EGRESS` : VM에서 외부 또는 다른 대상으로 나가는 트래픽

2. **Action**
	- 규칙이 일치할 때 수행할 동작
	- `allow`
	- `deny`

3. **Protocol / Port**
	- 허용 또는 차단할 프로토콜과 포트 지정

4. **Source / Destination**
	- 어디서 오는지, 어디로 가는지 지정

5. **Target**
	- 규칙이 적용될 대상


#### 네트워크 태그 (Network Tag)

VM 인스턴스를 논리적으로 분류하는 데 사용하는 문자열


#### AWS Security Group vs GCP Firewall Rule

AWS
- 인스턴스나 ENI에 연결 느낌
- 상태 저장 (stateful) 방화벽
- 리소스 부착형 보안 제어

GCP
- VPC 차원 정의
- 대상은 태그 또는 서비스 계정 등으로 지정
- 네트워크 중심 제어


#### 주요 명령어 (CLI)

CLI VPC 생성
```
gcloud compute networks create initial-vpc \  
  --subnet-mode=custom
```
확인 : `gcloud compute networks list`

서브넷 생성
```
gcloud compute networks subnets create initial-subnet-web \  
  --network=initial-vpc \  
  --region=asia-northeast3 \  
  --range=10.10.1.0/24
```
확인 : `gcloud compute networks subnets list`

SSH 허용 방화벽 규칙 생성
```
gcloud compute firewall-rules create allow-ssh-web \  
  --network=initial-vpc \  
  --direction=INGRESS \  
  --priority=1000 \  
  --action=ALLOW \  
  --rules=tcp:22 \  
  --source-ranges=0.0.0.0/0 \  
  --target-tags=web
```
HTTP 허용 방화벽 규칙 생성
```
gcloud compute firewall-rules create allow-http-web \
  --network=initial-vpc \
  --direction=INGRESS \
  --priority=1000 \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=web
```
확인 : `gcloud compute firewall-rules list`

VPC 상세 확인 : `gcloud compute networks describe initial-vpc`

서브넷 상세 확인 :
```
gcloud compute networks subnets describe initial-subnet-web \
  --region=asia-northeast3
```

방화벽 규칙 상세 확인 : `gcloud compute firewall-rules describe allow-http-web`

>[!info] 요약
>GCP VPC = 글로벌 리소스  
>서브넷 = 리전 리소스, 하나의 VPC 안에 여러 리전 서브넷 생성 가능  
>방화벽 제어 = VPC Firewall Rule 중심  
>모든 VPC default → 인바운드 거부 / 아웃바운드 허용 암시적 규칙 존재  
>방화벽 규칙 대상 → 네트워크 태그, 서비스 계정으로 지정 가능 
>AWS 보다 네트워크 중심 방화벽 모델