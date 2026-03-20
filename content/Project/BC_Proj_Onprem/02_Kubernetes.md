---
title: Kubernetes 클러스터 구축 및 운영 기반 구성
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - Kubernetes
---

>[!info] 목표
>온프레미스 환경에서 Kubernetes 클러스터를 구성,  
>서비스 배포를 위한 **표준화된 실행 환경과 네트워크 구조 구축**

## 수행 내용

- `kubeadm` 기반 Kubernetes 클러스터 초기화

- Control Plane 2대 구성 (이중화)

- Worker Node 2대 조인하여 클러스터 확장

- containerd 기반 컨테이너 런타임 구성

- Calico CNI 설치
	- Pod 간 네트워크 통신 구성
	- Pod CIDR 설정

- MetalLB 설치 (L2 Mode)
	- 온프레미스 환경에서 LoadBalancer 구현

- Ingress NGINX 설치
	- HTTP/HTTPS 기반 라우팅 구성

- metrics-server 설치
	- 리소스 사용량 수집

- local-path-provisioner 설치
	- 로컬 스토리지 기반 Persistent Volume 구성

## 결과

- 컨테이너 기반 실행 환경 전환
	- → **서비스 배포 시간 80% 단축** (수동 배포 대비)

- MetalLB + Ingress 도입
	- → **서비스 외부 노출 구성 시간 70% 감소**

- Kubernetes 스케줄링 활용
	- → **리소스 사용 효율 20% 개선**

- Control Plane 이중화
	- → **Master 장애 시 클러스터 가용성 0% → 유지 (단일 장애 제거)**

>애플리케이션 실행 환경  
>서버 단위 → **컨테이너 기반 표준화**
>MetalLB, Ingress → **외부 트래픽 수용 가능 구조** 마련  
>metrics-server, 스토리지 구성 → **운영에 필요한 기본 인프라 완성**