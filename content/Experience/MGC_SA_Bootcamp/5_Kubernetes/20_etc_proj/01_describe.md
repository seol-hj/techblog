---
title: 쿠버네티스 클러스터 기본 인프라 구축
draft: false
date: 2026-03-05
updated: 2026-03-06
tags:
  - Kubernetes
  - VM
---

### 수행 내용

1. **VM 기본 네트워크 구성**
	- VM 3대 준비
		- `192.168.80.110` → Control Plane
		- `192.168.80.120` → Worker1
		- `192.168.80.130` → Worker2
	- 각 VM 간 네트워크 통신 확인
	- `/etc/hosts`에 노드 정보 등록

2. **기본 시스템 설정**
	- 각 VM hostname 설정
	- swap 비활성화 (`swapoff -a`)
	- `/etc/fstab`에서 swap 제거
	- Kubernetes 네트워크를 위한 커널 모듈 활성화
		- `overlay`
		- `br_netfilter`

3. **네트워크 및 커널 설정**
	- Kubernetes 네트워크 정책 활성화
		- `net.bridge.bridge-nf-call-iptables = 1`
		- `net.bridge.bridge-nf-call-ip6tables = 1`
		- `net.ipv4.ip_forward = 1`
	- - `sysctl --system`으로 설정 적용

4. Container Runtime 설치  
	- `containerd` 설치  
	- 기본 설정 파일 생성  
	- `SystemdCgroup = true` 설정  
	- containerd 서비스 활성화 및 재시작

5. Kubernetes 구성 요소 설치  
	- Kubernetes apt repository 등록  
	- 다음 패키지 설치  
		- `kubelet`  
		- `kubeadm`  
		- `kubectl`  
	- 버전 고정 (`apt-mark hold`)

6. Control Plane 초기화  
	- Control Plane 노드에서 실행  
		- `kubeadm init`  
		- `--apiserver-advertise-address` 설정  
		- `--pod-network-cidr` 지정

7. kubectl 설정  
	- Control Plane에서 kubectl 사용을 위한 kubeconfig 설정  
		- `$HOME/.kube/config` 생성  
		- `/etc/kubernetes/admin.conf` 복사

8. CNI 설치  
	- Calico 네트워크 플러그인 설치  
	- Pod 네트워크 구성

9. Worker 노드 클러스터 참여 
	- Worker 노드에서 `kubeadm join` 실행  
		- Control Plane에서 생성된 join 명령어 사용  
		- Worker 노드 클러스터 연결

10. 클러스터 상태 확인  
	- Control Plane에서 확인  
		- `kubectl get nodes`  
		- 모든 노드 `Ready` 상태 확인
### 완료

- Kubernetes 클러스터 정상 구성
- Control Plane 1대 + Worker 2대 연결
- Pod 네트워크 정상 동작
- `kubectl`로 클러스터 관리 가능