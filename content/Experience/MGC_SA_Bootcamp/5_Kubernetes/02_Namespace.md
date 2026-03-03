---
title: Namespace
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Containers
  - Kubernetes
  - Namespace
---

> 클러스터 내부 논리적 분리 공간

- 동일한 이름
- 리소스 격리
- 접근 제어

|Namespace|역할|
|---|---|
|default|기본 작업 공간|
|kube-system|시스템 Pod 실행|
|kube-public|공개 리소스|
|kube-node-lease|노드 상태 관리|

---

### Namespace 생성

1. 명령어 생성
```
kubectl create namespace dev   
kubectl create namespace prod
```

2. YAML 생성
```
# dev-ns.yaml   
apiVersion: v1   
kind: Namespace   
metadata:   
  name: dev
```

```
kubectl apply -f dev-ns.yaml
```

### Namespace 안 리소스 생성

- 지정 X → 기본값 : `default`

1. 특정 ns에 pod 생성
```
kubectl run nginx-dev --image=nginx -n dev
```

2. YAML 로 ns 지정
```
apiVersion: v1  
kind: Pod  
metadata:  
  name: nginx-prod  
  namespace: prod  
spec:  
  containers:  
  - name: nginx  
    image: nginx  
```

### Namespace 별 리소스 격리 확인
```
kubectl get pods -n dev  
kubectl get pods -n prod  
kubectl get pods -n default
```

### 기본 Namespace 변경
```
kubectl config set-context --current --namespace=dev
```

### Namespace 삭제
```
kubectl delete namespace dev
```
- 삭제 시 → 내부 모든 리소스 자동 삭제

### Namespace 리소스

1. Namespace 에 속하는 리소스
	- Pod
	- Deployment
	- Service
	- ConfigMap
	- Secret
	- PVC

2. Cluster 범위 리소스
	- Node
	- Namespace
	- PersistentVolume (PV)
	- StorageClass
	- ClusterRole
	- CRD

---

> [!note]
> 1. Namespace → 논리적 분리 공간  
> 2. 이름 충돌 방지  
> 3. 리소스 격리  
> 4. 접근 제어 가능  
> 5. 모든 리소스 NS 속하는 것 X

