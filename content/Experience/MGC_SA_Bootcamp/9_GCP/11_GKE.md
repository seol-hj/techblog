---
title: GKE 개요
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - GCP
  - GKE
  - Kubernetes
---

**Google Cloud의 관리형 Kubernetes 서비스**
- Google Cloud에서 Kubernetes 클러스터를 운영하기 위한 서비스
- 사용자가 직접 Kubernetes Control Plane을 설치, 운영 X
- 노드, 네트워크, 보안, 업그레이드, 운영 통합 기능 제공

**vs AWS EKS**
- **Autopilot** 운영 모드를 통해 노드/스케일링/보안 기본 구성을 더 강하게 관리
- **Release Channel** 중심 버전 운영 전략
	- Autopilot 클러스터는 반드시 릴리스 채널에 등록
	- Standard는 등록/미등록 선택 가능
	- 모든 클러스터는 Regular 채널에 등록
- **Workload Identity Federation for GKE** 권장
	- 서비스 계정 키 없이 워크로드 권한 연결
- Google Cloud 네트워크와 결합된 **Private Cluster, Gateway API, Fleet** 제공

- 공통점
	- 관리형 Kubernetes
	- 클러스터 기반 운영
		- `kubectl` 사용
		- YAML 기반 배포
		- Kubernetes API 사용
		- 노드풀/노드그룹 개념 활용
	- 클라우드 네트워크와 권한 체계 위 존재
		- IAM 연계
		- VPC 연계
		- Load Balancer 연계
		- 로그/모니터링 연계

- 차이
	- [운영 모드](Experience/MGC_SA_Bootcamp/9_GCP/12_GKE_Mode.md) : Standard vs Autopilot
	- 버전 운영 : Release Channel
	- 권한 설계 : Workload Identity Federation for GKE
	- 다중 클러스터 운영 : Fleet