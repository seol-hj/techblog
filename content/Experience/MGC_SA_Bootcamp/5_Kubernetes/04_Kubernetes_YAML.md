---
title: YAML
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Containers
  - Kubernetes
  - YAML
---

## YAML

- 내가 원하는 클러스터 상태 정의 **설계도**
- Kubernetes → 선언형 시스템

- Kubernetes 리소스 필드

| 필드         | 의미         |
| ---------- | ---------- |
| apiVersion | API 그룹과 버전 |
| kind       | 생성할 리소스 종류 |
| metadata   | 리소스 식별 정보  |
| spec       | 원하는 상태 정의  |
- 모든 리소스 동일 적용

---

### apiVersion

- 해당 리소스 속한 API 그룹과 버전 지정

|apiVersion|사용 리소스|
|---|---|
|v1|Pod, Service, ConfigMap|
|apps/v1|Deployment, StatefulSet|
|batch/v1|Job, CronJob|
|networking.k8s.io/v1|Ingress|

---

### kind

- 생성할 리소스 종류 지정
- API Server → kind로 내부 객체 타입 결정

---

### metadata

- 리소스 식별 및 분류 정보

ex)
```
metadata:  
  name: web  
  namespace: dev  
  labels:  
    app: web  
    tier: frontend  
  annotations:  
    description: "frontend app"  
```

1. name
	- ns 내 유일 / 동일 ns 내 같은 이름 존재 X
	- 소문자, 숫자, 하이픈만

2. namespace
	- 지정 X → `default`

3. labels
	- 리소스 선택, 그룹화 기준

4. annotations
	- 설명 목적 메타데이터
		- selector 로 사용 X
		- 긴 문자열 O
		- 배포 기록 등에 사용

---

### spec

- 리소스 실제 동작 정의

#### Pod spec

ex)
```
spec:  
  containers:  
  - name: web  
    image: nginx  
    ports:  
    - containerPort: 80  
    env:  
    - name: ENV  
      value: "prod"   
    resources:   
      requests:  
        cpu: "100m"    
        memory: "128Mi"  
      limits:  
        cpu: "500m"  
        memory: "256Mi"  
```

1. containers
	- Pod 내 실행할 컨테이너 목록
		- name : Pod 내부 유일
		- image : 실행할 컨테이너 이미지 (`[registry]/[repository]:[tag]`)

2. ports
	- 컨테이너 내부 열려있는 포트
	- Service 에서 targetPort로 참조 가능

3. env
	- 숫자 → 반드시 문자열로 작성

4. resources
	- requests
		- 스케줄러가 노드 선택할 때 참고
		- 최소 보장 자원
	- limits
		- 절대 초과 불가 자원
		- 초과시 : 
			- Memory → OOMKilled
			- CPU → throttling 발생

#### Deployment spec

ex)
```
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: web-deploy  
spec:  
  replicas: 3  
  selector:  
    matchLabels:  
      app: web  
  template:  
    metadata:  
      labels:  
        app: web  
    spec:  
      containers:  
      - name: nginx  
        image: nginx  
```

1. replicas
	- 유지할 Pod 개수
		- Controller가 항상 3개 유지
		- 죽으면 자동 재생성

2. selector
	- 관리 대상 Pod 선택 기준

3. template
	- 실제 생성될 Pod 설계도
	- 구조는 Pod과 동일

#### Service spec

ex)
```
apiVersion: v1  
kind: Service  
metadata:  
  name: web-svc  
spec:  
  type: ClusterIP  
  selector:  
    app: web  
  ports:  
  - port: 80  
    targetPort: 8080  
```

1. type

|타입|설명|
|---|---|
|ClusterIP|내부 통신|
|NodePort|노드 포트로 외부 접근|
|LoadBalancer|클라우드 LB|

2. port / targetPort
	- port → Service 포트
	- targetPort → Pod 내부 포트

---

### 내부 동작
```
1. kubectl apply  
2. API Server 저장  
3. etcd 기록  
4. Controller 감지   
5. 현재 상태와 비교  
6. 차이 수정  
```
- YAML → Desired State 선언서

>[!note]
>1. 모든 리소스 → apiVersion, kind, metadata, spec 구조
>2. spec → 리소스마다 다름
>3. labels → 선택의 기준
>4. selector → 반드시 template, labels 와 일치
>→ YAML이 Kubernetes 의 핵심

