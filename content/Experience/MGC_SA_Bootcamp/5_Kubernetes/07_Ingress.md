---
title: Ingress
draft: false
date: 2026-03-04
updated: 2026-03-04
tags:
  - Containers
  - Kubernetes
  - Ingress
---

**if) Service 만으로 외부 공개 시**
1. NodePort
	- 노드 IP + 고정 포트로 접근
	- 포트가 30000~32767 범위 강제
	- 서비스 증가 시 포트 관리 복잡
	- 도메인 기반 분기(Host)나 URL 경로 기반 분기(Path) 직접 처리 어려움
2. LoadBalancer
	- 클라우드 → Service를 LoadBalancer로 만들면 외부 로드밸런서 자동 생성, IP 붙음
		- But, 서비스마다 LoadBalancer 생성 시 외부IP/로드밸런서 여러 개 필요
	- 온프레미스 → 자동 생성 X → 추가 구성 필요

**→ Ingress**
- 도메인 기반 라우팅 : `app.local`, `app2.local`
- 경로 기반 라우팅 : `/`, `/api`, `/admin`
- TLS(HTTPS) 종료 : 인증서 하나로 여러 서비스 처리 가능
- 단일 진입점 : 외부 IP 하나로 여러 서비스 라우팅

- 구조
```
Client(브라우저)  
   ↓ (외부 IP:80/443)  
Service(ingress-nginx-controller, LoadBalancer/NodePort)  
   ↓  
Ingress Controller Pod(NGINX)  
   ↓ (Ingress 규칙 적용)  
Service(app1/app2 등, ClusterIP)  
   ↓  
Pod  
```
- 반드시 Ingress Controler 필요
- **Ingress 리소스** : 라우팅 규칙(정책) 정의
	- 안내용 YAML 파일
- **Ingress Controller** : 실제로 HTTP 요청을 받아 규칙대로 전달하는 엔진
	- YAML 파일을 읽고 실제 트래픽 처리 프로그램
	- ex) Nginx, HAProxy, Traefik 등

ex)
```
apiVersion: networking.k8s.io/v1  
kind: Ingress  
metadata:  
  name: example-ingress  
spec:  
  ingressClassName: nginx  
  rules:  
  - host: app1.local  
    http:  
      paths:  
      - path: /  
        pathType: Prefix  
        backend:  
          service:  
            name: app1  
            port:  
              number: 80  
  - host: app2.local   
    http:  
      paths:  
      - path: /  
        pathType: Prefix  
        backend:  
          service:  
            name: app2  
            port:  
              number: 80  
```
- 옵션
	- `ingressClassName: nginx`
		- 어떤 Ingress Controller 가 규칙 처리할지 지지어
		- if X → `CLASS <none>` 상태, Controller 가 무시해서 404

	- `rules.host`
		- 요청의 Host 헤더와 일치해야 라우팅
		- 브라우저에서 도메인으로 접근

	- `pathType: Prefix`
		- `/`로 시작하는 모든 경로 매칭
		- `/api` 같은 경로 나누고 싶으면 path 추가

	- `backend.service.name/port`
		- 라우팅 대상 Service 이름/포트 지정

- 적용 : `kubectl apply -f ingress.yaml`
- 확인 : `kubectl get ingress`
	- `kubectl describe ingress example-ingress`

- 오류
	- 404 Not Found
		- Ingress Controller 은 응답, 규칙 매칭 X
		- `ingressClassName: nginx` 확인
		- hosts 파일 VIP로 매핑 확인
		- Ingress 설정 `host`가 요청과 일치하는지 확인
	- EXTERNAL-IP가 `<pending>`
		- MetalLM가 VIP 할당 X
		- IPAddressPool/L2Advertisement 존재 확인
		- speaker Pod가 모든 노드에 Running 확인
		- IP 대역 실제 노드 네트워크랑 같은지 확인
	- webhook 오류
		- DNS/CoreDNS 문제
		- CoreDNS 1/1 Running 확인
		- DNS 질의 간헐 timeout 확인

---

### **호스트 기반 인그레스 (Host-based Ingress)**

- 도메인 이름(ex `app1.local`)로 구분

### **경로 기반 인그레스 (Path-based Ingress)**

- 하나의 도메인 뒤에 붙는 경로(`/blog`, `/shop` 등)에 따라 트래픽을 다른 서비스로 보냄

ex)
```
apiVersion: networking.k8s.io/v1  
kind: Ingress  
metadata:  
  name: path-based-ingress  
  namespace: test-ns  
  annotations:  
    # / # 외부 경로(/app1)는 무시하고, 실제 서비스의 루트(/)로 연결해라  
    nginx.ingress.kubernetes.io/rewrite-target: /  
spec:  
  ingressClassName: nginx  
  tls:  
  - hosts:   
    - example.local  
    secretName: app-tls-secret # 아까 만든 SAN 인증서(example.local 포함 필요)  
  rules:  
  - host: example.local # 하나의 도메인만 사용  
    http:   
      paths:  
      - path: /app1 # example.local/app1 로 접속 시  
        pathType: Prefix  
        backend:  
          service:  
            name: app1  
            port:  
              number: 80  
      - path: /app2 # example.local/app2 로 접속 시  
        pathType: Prefix  
        backend:  
          service:  
            name: app2  
            port:  
              number: 80  
```
- `example.local` 이라는 주소 하나 사용 / 뒤에 붙는 경로에 따라 `app1` , `app2` 서비스로 전달
- `pathType: Prefix` : 지정한 경로로 시작하는 모든 요청을 해당 서비스로 보냄
- `rewrite-target: /` :
	- 웹 브라우저는 `example.local/app1`로 요청 → 실제 `app1` 파드 안 웹 서버는 root 경로(`/`)에서 실행 중일 수 있음
	- if 설정 X → 인그레스가 중간에서 `/app1` 경로 삭제 후 파드에게 `/`로 요청 전달 → 404 에러 가능성

- 경로 기반 인그레스 → 하나의 인증서만 관리
	- 기존 `san.cnf` 파일의 `[ alt_names ]` 섹션의 `DNS.3 = example.local` 추가하여 인증서를 다시 만들면 HTTPS 적용 가능

>[!note]
>Ingress = 규칙 / Ingress Controller = Engine
>온프레미스 LoadBalancer → MetalLB 같은 구현체 필요
>Ingress Controller Service를 LoadBalancer로 변경 시 MetalLB가 VIP 할당
>Ingress에 `ingressClassName` X → 404
>CoreDNS 불안정 → MetalLB/Ingress 모두 연쇄 장애

---

#### 추가. SAN 인증서

- SAN = Subject Alternative Name
> 하나의 인증서에 여러 도메인 이름을 포함할 수 있게 해주는 확장 필드

- 과거 → CN(Common Name)에 도메인 1개
- 현재 → SAN 필수

- 특징
	- 서로 다른 루트 도메인 가능
	- 정확히 필요한 도메인만 포함
	- 도메인 추가 시 인증서 재발급 필요