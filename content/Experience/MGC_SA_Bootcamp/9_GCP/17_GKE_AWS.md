---
title: GKE와 AWS 통신
draft: false
date: 2026-04-22
updated: 2026-04-22
tags:
  - GCP
  - GKE
  - AWS
---

**VPN 사용 시**
- GCP VPC CIDR ↔ AWS VPC CIDR 간 사설 경로
- BGP 기반 동적 경로 교환
- 장애 시 우회 가능한 기본 네트워크 기반

But,
- **광고 대역**
	- GCP VPC 서브넷만 광고
	- GKE 노드 대역 포함
	- GKE Pod 대역 포함
	- 특정 대역만 제한적으로 광고

- **보안 그룹 / 방화벽 허용 여부**
	- 방화벽과 보안그룹 같이 봐야한다
		- AWS 보안그룹에서 GKE Pod 대역 또는 Node 대역 허용
		- GCP 방화벽에서 AWS VPC 대역 허용
		- 필요한 포트만 최소 허용
		- SSH/RDP 같은 관리 포트는 IAP나 제한된 소스만 허용 권장

- **DNS 이름 해석**
	- **forwarding zones** → 쿼리를 다른 이름 서버로 전달
	- **peering zone** → 다른 VPC 네트워크의 이름 해석 권한을 재사용

- **GKE 내부 Service 접근 방식**
	- ClusterIP : 보통 외부 VPC 접근 대상으로 부적합
	- NodePort : 가능, 운영형 구조로 거칠고 관리 불편
	- Internal LoadBalancer Service : 운영형 내부 진입점으로 적합
	- Gateway/Load Balancer 기반 내부 노출 : 더 표준화된 구조 가능

- **Pod 대역 or Node 대역 사용 여부**

- **애플리케이션 레벨 인증/권한**
해결 필요


**GKE와 AWS 통신을 위해 정리**
1. **Node IP**
	- GKE 노드 VM이 사용하는 IP
	- GCP VPC 서브넷의 기본 주소 체계 소속
2. **Pod IP**
	- GKE Pod가 사용하는 IP
	- VPC-native 클러스터에서는 alias IP기반 할당
	- VPC 안 라우팅 가능한 주소 체계로 설계
3. **Service IP**
	- Cluster IP 같은 Kubernetes Service가 사용하는 가상 IP
	- 일반적으로 클러스터 내부용 / 다른 VPC에서 그대로 접근 대상 X

if)
1. **GKE Pod → AWS 내부 API 호출**
	- GCP에서 AWS 경로 존재
	- AWS에서 GCP Pod 대역 또는 Node 대역에 대한 응답 경로 존재
	- AWS 보안 그룹이 GKE 쪽 소스 대역 허용
	- DNS 이름 사용 경우 이름 해석 경로 존재
2. **AWS EC2/EKS → GKE 내부 서비스**
	- GKE Service를 내부용 LoadBalancer 형태로 노출
	- Gateway/LoadBalancer 구조로 내부 진입점 구성
	- AWS는 내부 VIP 또는 내부 LB 주소로 접근
3. **GKE Pod ↔ AWS DB 또는 내부 서비스**

>[!info] 요약
>AWS-GCP VPN → 애플리케이션 통신 완성 X  
>멀티 클라우드 통신 → Node IP, Pod IP, Service IP 구분 / GKE → VPC-native/alias IP 기반 구조 사용  
>GKE Pod → AWS 내부 API : 직관적 / AWS → GKE 내부 서비스 : 내부 노출 방식 설계 중요  
>DNS → VPN과 별개로 설계, forwarding/peering 같은 이름 해석 전략 필요  
>멀티 클라우드 보안 → GCP 방화벽 & AWS 보안그룹  
>장애 분석 → 터널, BGP, 라우트, 보안정책, DNS, 애플리케이션 순으로 계층적으로 봐야함