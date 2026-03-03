---
title: Service - ClusterIP, NodePort, LoadBalancer
draft: false
date: 2026-03-03
updated: 2026-03-03
tags:
  - Containers
  - Kubernetes
  - Service
  - ClusterIP
  - NodePort
  - LoadBalancer
---

![](Experience/MGC_SA_Bootcamp/5_Kubernetes/img/20260303-1.png)

- Pod의 특징
	- Pod IP는 동적으로 생성
	- Pod 재생성 시 IP 변경
	- 직접 IP 접근은 불안정
- → **Service 사용**
> Pod 집합에 대한 고정된 네트워크 진입점

- Service 기능
	1. 고정 가상 IP (ClusterIP)
	2. 라벨 기반 Pod 선택
	3. 자동 로드밸런싱

- Service 내부 구조
```
Client  
   ↓  
Service (Virtual IP)  
   ↓  
kube-proxy (iptables/IPVS)  
   ↓  
Pod 여러 개로 분산  
```
	- kube-proxy가 실제 트래픽 전달 담당

- Service 타입 3가지

|타입|외부 접근|사용 목적|
|---|---|---|
|ClusterIP|❌|내부 통신|
|NodePort|O|테스트|
|LoadBalancer|O|운영|

---

## ClusterIP

