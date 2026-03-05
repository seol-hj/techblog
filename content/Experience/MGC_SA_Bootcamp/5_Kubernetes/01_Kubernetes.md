---
title: Kubetnetes
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Containers
  - Kubernetes
---

**Docker의 한계**
- 컨테이너가 죽으면
	- 자동 복구 X
	- 관리자 직접 재시작 필요
- 여러 서버 배포시
	- 각 서버 직접 SSH 접속 후 실행 필요
- 로드밸런싱
	- 포트 수동 관리
	- 별도 nginx 혹은 HAProxy 설정 필요

> Docker은 컨테이너 실행 도구
> - 단일 호스트 중심
> - 자동 복구 X
> - 클러스터 관리 불가
> - 선언적 관리 불가

**Kubernetes**
- 선언적 모델
	- 원하는 상태(Desired State)를 선언

| 구분      | Docker  | Kubernetes   |
| ------- | ------- | ------------ |
| 목적      | 컨테이너 실행 | 컨테이너 오케스트레이션 |
| 관리 단위   | 컨테이너    | Pod          |
| 여러 개 관리 | 수동      | Deployment   |
| 자동 복구   | 없음      | 있음           |
| 스케일링    | 수동      | 자동           |
| 로드밸런싱   | 별도 설정   | Service      |

---

## Kubernetes 아키텍처

`Control Plane + Worker Node` 구성

```
                ┌────────────────────┐
                │   Control Plane    │
                │--------------------│
                │  API Server        │
                │  Scheduler         │
                │  Controller Mgr    │
                │  etcd              │
                └──────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼───────┐     ┌────▼───────┐     ┌────▼───────┐
   │ Worker1    │     │ Worker2    │     │ Worker3    │
   │------------│     │------------│     │------------│
   │ kubelet    │     │ kubelet    │     │ kubelet    │
   │ kube-proxy │     │ kube-proxy │     │ kube-proxy │
   │ containerd │     │ containerd │     │ containerd │
   │ Pod        │     │ Pod        │     │ Pod        │
   └────────────┘     └────────────┘     └────────────┘
```

### Contrl Plane

1. API Server
	- 모든 요청의 진입점
	- kubectl 명령 모두 API Server 전달
	- REST API 기반

2. etcd
	- 분산 Key-Value 저장소
	- 클러스터 모든 상태 저장
	- Pod, Service, ConfigMap 등 저장
	- **etcd = Kubernetes 의 DB**

3. Sheduler
	- 새 Pod이 어느 노드에 배치될지 결정
	- CPU, Memory 요청 고려
	- 노드 상태 고려

4. Controller Manager
	- 현재 상태와 원하는 상태 비교
	- 다르면 수정

### Worker Node

1. kubelet
	- 각 노드에서 실행
	- API Server 지시 수신
	- Pod 생성/상태 모니터링

2. kube-proxy
	- Service 네트워크 구현
	- Pod 간 통신 라우팅

3. Container Runtime
	- 실제 컨테이너 실행
	- containerd (표준)
	- Docker 은 CRI 미지원 (제외)

---

## Kubernetes 오브젝트

### [Pod](Experience/MGC_SA_Bootcamp/5_Kubernetes/03_Pod.md)

>컨테이너 실행 최소 단위
- 하나 이상 컨테이너 포함
- 동일 IP 공유
- 쿠버네티스 가장 기본 객체
	- 직접 운영용 X → 보통 Deployment 가 관리

### Deployment

>Pod 관리 오브젝트
- replicas 유지
- Rolling Update 지원
- 자동 재시작
- 롤백 가능
→ 가장 많이 사용

### [Service](Experience/MGC_SA_Bootcamp/5_Kubernetes/06_Service.md)

> Pod 접근 위한 네트워크 추상화
- Pod IP 계속 변경 → Service는 고정된 접근점 제공
- ClusterIP / NodePort / LoadBalancer 제공
→ Pod 외부/내부 접근 시 필수

### [Namespace](Experience/MGC_SA_Bootcamp/5_Kubernetes/02_Namespace.md)

> 리소스 논리적 격리 단위
- 팀 단위 분리
- 환경(dev/prod) 분리
- RBAC 적용 범위 구분

---

## Kubernetes 동작 흐름

1. kubectl apply : ex) `kubectl apply-f pod.yaml`
	- kubectl 은 YAML을 읽음
	- kubeconfig에 있는 API Server 주소로 요청 보냄
	- HTTP REST 요청 형태로 전송 (POST / PATCH)
	- → **원하는 상태 API Server에 전달**

2. API Server 저장
	- API Server = 쿠버네티스 중앙 관문
		- 인증 (Authentication)
		- 권한 확인 (Authorization)
		- 요청 유효성 검사
		- 객체 구조 검증
	- YAML 올바르면 → 내부 오브젝트로 변환
		- 아직 Pod 실행 X
		- 원하는 상태로 준비

3. etcd 기록
	- API Server 최종적으로 상태 etcd 에 저장
		- 분산 Key-Value 저장소
		- 쿠버네티스의 상태 DB
		- 클러스터 모든 리소스 상태 저장
	- etcd에 특정 Pod 존재 필요 데이터 기록
		- 실행 X

4. Controller 감지 - [Controller 종류](Experience/MGC_SA_Bootcamp/5_Kubernetes/05_Controller.md)
	- ex)
		- Deployment Controller
		- ReplicaSet Controller
		- Node Controller 등
	- **현재 상태 ↔ 원하는 상태 비교**
		- Reconciliation Loop

5. Scheduler 가 노드 선택
	- 해당 Pod을 특정 Node에 바인딩
		- = 스케줄링

6. kubelet이 Pod 생성
	- kubelet → API Server 지속적 감시 / Node에 Pod 배치 확인
	- 이후
		- Pod 명세 (spec) 확인
		- 볼륨 준비
		- 네트워크 설정 요청 (CNI)
		- 컨테이너 실행 준비
	- **kubelet = 실제 실행 담당**

7. containerd 가 컨테이너 실행
	- kubelet → Container Runtime에 실행 요청
	- containerd : 범용 컨테이너 런타임 , 쿠버네티스 기본 런타임
		- 이미지 pull
		- 컨테이너 생성
		- namespace 설정
		- cgroup 설정
		- 프로세스 시작
	- CRI-O : 쿠버네티스 전용 런타임

> [!note]
> 1. Kubernetes → 원하는 상태 선언  
> 2. Control Plane → 상태 관리  
> 3. Pod → 최소 배포 단위  
> 4. Service → 로드 밸런싱 제공  
> 5. 모든 상태 → etcd 저장

---

**실습 환경**

```
[ k8s-cp ]       [ k8s-w1 ]       [ k8s-w2 ]  
Controller         Worker           Worker   
kube-apiserver   
etcd   
scheduler   
controller-manager   
  
───────────── Pod Network (Flannel : 10.244.0.0/16) ─────────────
```

```
cat <<'BASH' | sudo tee /root/00-common.sh
#!/usr/bin/env bash
set -e

K8S_VERSION="1.34.3-1.1"

echo "[1] 커널 모듈 로드"
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay
sudo modprobe br_netfilter

echo "[2] sysctl 설정"
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sudo sysctl --system

echo "[3] 필수 패키지"
sudo apt update -y
sudo apt install -y ca-certificates curl gnupg apt-transport-https

echo "[4] containerd 설치"
sudo apt install -y containerd

echo "[5] containerd cgroup 설정"
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd
sudo systemctl enable containerd

echo "[6] Kubernetes v1.34 repo 추가"
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key \
 | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /" \
 | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update -y

echo "[7] kubeadm / kubelet / kubectl 설치"
sudo apt install -y kubelet=${K8S_VERSION} kubeadm=${K8S_VERSION} kubectl=${K8S_VERSION}
sudo apt-mark hold kubelet kubeadm kubectl

echo "[8] kubelet 활성화"
sudo systemctl enable kubelet

echo "공통 설정 완료"
BASH

```