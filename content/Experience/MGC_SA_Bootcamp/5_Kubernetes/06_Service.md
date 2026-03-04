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
  - MetalLB
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

- 기본 Service 타입
- 클러스터 내부에서만 접근 가능

- 구조
```
Pod A
Pod B
Pod C
   ↑
Service (ClusterIP)
   ↑
다른 Pod
```

ex)
```
apiVersion: v1  
kind: Service  
metadata:  
  name: web-clusterip  
spec:  
  type: ClusterIP  
  selector:  
    app: web  
  ports:  
  - port: 80  
    targetPort: 80  
```

---

## NodePort

- 노드 IP + 포트로 외부 접근 가능
- 모든 노드에서 동일 포트 오픈

- 구조
```
Internet  
   ↓  
NodeIP:30007  
   ↓  
Service  
   ↓  
Pod  
```

- 특징
	- 포트 범위 : 30000 ~ 32767
	- 내부적으로 ClusterIP 포함
	- 운영보다는 테스트 환경

---

## LoadBalancer

- 외부 Load Balancer 생성 요청
- 클라우드 환경에서 자동 생성
- 운영 환경에서 사용

- 구조
```
Internet
   ↓
External LoadBalancer
   ↓
NodePort
   ↓
ClusterIP
   ↓
Pod
```

>LoadBalancer ⊃ NodePort ⊃ ClusterIP

---

### 클라우드 / 온프레미스

- 클라우드 동작 과정
```
Service 생성  
   ↓  
Cloud Controller Manager 감지  
   ↓  
클라우드 API 호출  
   ↓  
외부 LB 생성  
   ↓  
Public IP 자동 할당  
```

- 온프레미스
```
EXTERNAL-IP  <pending>
```
	- 클라우드 API X
	- 외부 LB 자동 생성 X

- MetalLB
	- 온프레미스에서 LoadBalancer 구현
	- IP Pool 에서 IP 자동 할당
	```
	Service (LoadBalancer)  
             ↓  
          MetalLB  
             ↓  
        외부 IP 할당
	```

- 클라우드 vs 온프레미스
	- 클라우드 LoadBalancer
		- `type: LoadBalancer` Service 생성 시
		- 클라우드 컨트롤러가 외부 LB 생성
		- EXTERNAL-IP 자동 할당
	- 온프레미스 LoadBalancer
		- 클라우드 API X
		- `type: LoadBalancer`로 만들어도 EXTERNAL-IP가 `<pending>`
		- LoadBalancer 역할 대신해줄 구성요소 → MetalLB

---

### 트러블 슈팅

- 외부 접속 X
	- 보안 그룹 확인
	- 방화벽 확인
	- NodePort 범위 확인

- EXTERNAL-IP 계속 Pending
	- 클라우드 환경인지 확인
	- MetalLB 설치 여부 확인

>[!note]
>**Service**
>- Pod 집합에 대한 고정 진입점
>- 라벨 기반 연결
>- 자동 로드밸런싱
>
>Type
>- ClusterIP → 내부 전용
>- NodePort → 노드 포트 외부 접근
>- LoadBalancer → 클라우드 외부 서비스
>
>환경 차이
>- 클라우드 → 자동 IP
>- 온프레미스 → 추가 구성 필요 (MetalLB)