---
title: Pod
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Containers
  - Kubernetes
  - Pod
---

> Kubernetes 에서 가장 작은 배포 단위
- 1개 이상 컨테이너 포함
- 같은 네트워크 네임스페이스 공유
- 같은 IP 주소 공유
- Volume 공유 가능

### Pod 구조
```
Pod  
 ├─ pause container  ← 네트워크 유지  
 ├─ main container  
 └─ sidecar container  
```

- Pause 컨테이너
	- Pod의 네트워크 네임스페이스 유지
	- 사용자 직접 관리 X
	- kubelet이 자동 생성

### Pod 생성

1. 명령어
```
kubectl run my-nginx --image=nginx:1.21
```
- 확인 : `kubectl get pods`, `kubectl get pods -o wide`
- 분석 : `kubectl describe pod my-nginx`

2. YAML
```
apiVersion: v1  
kind: Pod  
metadata:  
  name: my-web  
  labels:  
    app: web  
spec:  
  containers:  
  - name: nginx  
    image: nginx:1.21  
    ports:  
    - containerPort: 80  
```
- 적용 : `kubectl apply -f nginx-pod.yaml`

### Pod 네트워크

- Pod 는 고유 IP를 가짐
- Pod 내부 컨테이너 → localhost 공유

### Init Container

- Pod 시작 전 실행되는 준비 컨테이너
	- 반드시 성공해야 메인 컨테이너 실행
	- 순차 실행
	- 준비 작업 전용

### Pod 접속 및 로그

1. 로그
```
kubectl logs my-web  
kubectl logs my-web -f  
kubectl logs my-web --tail=20  
```

- 컨테이너 접속 : `kubectl exec -it my-web -- /bin/bash`

### Port Forward

- Pod는 외부 접근 X
```
kubectl port-forward my-web 8080:80
```

### Pod 상태

- `kubectl get pods`

|상태|의미|
|---|---|
|Pending|스케줄 대기|
|Running|실행 중|
|CrashLoopBackOff|반복 실패|
|Completed|종료|

### Pod 리소스 제한

```
resources:  
  requests:   
    cpu: "100m"  
    memory: "128Mi"  
  limits:  
    cpu: "500m"  
    memory: "256Mi"
```
- requests → 최소 보장
- limits → 최대 사용

### Pod 동작 흐름

```
1. kubectl apply  
2. API Server 저장  
3. etcd 기록  
4. Scheduler가 Node 선택  
5. kubelet이 Pod 생성  
6. containerd가 컨테이너 실행  
```

- Pod를 직접 운영시
	- 자동 복구 X
	- 스케일링 불편
	- 업데이트 어려움
	- IP 변경
- → **ReplicaSet / Deployment**

>[!note]
>1. Pod → 최소 배포 단위
>2. 하나 이상 컨테이너 포함
>3. 같은 IP 공유
>4. Init Container → 준비 작업용
>5. 직접 운영용 X → 관리 객체 필요

