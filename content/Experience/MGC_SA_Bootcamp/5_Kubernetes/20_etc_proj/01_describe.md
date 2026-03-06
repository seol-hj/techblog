---
title: 쿠버네티스 클러스터 기본 인프라 구축
draft: false
date: 2026-03-05
updated: 2026-03-06
tags:
  - Kubernetes
  - VM
---
#### 1. **VM 기본 네트워크 구성**

- VM 3대 준비
	- `192.168.80.110` → Control Plane
	- `192.168.80.120` → Worker1
	- `192.168.80.130` → Worker2
- 각 VM 간 네트워크 통신 확인
- `/etc/hosts`에 노드 정보 등록

#### 2. **기본 시스템 설정**

- 각 VM hostname 설정
- swap 비활성화 (`swapoff -a`)
- `/etc/fstab`에서 swap 제거
- Kubernetes 네트워크를 위한 커널 모듈 활성화
	- `overlay`
	- `br_netfilter`

1. hostname 설정
`Control Plane` → `sudo hostnamectl set-hostname k8s-cp`
`Worker1` → `sudo hostnamectl set-hostname k8s-w1`
`Worker2` → `sudo hostnamectl set-hostname k8s-w2`

![238](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306.png)
![244](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-1.png)
![240](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-2.png)

2. hosts 설정
`sudo vi /etc/hosts`
- 쓰다보니 vi 가 편해서 vi 사용했는데 nano 해도 됨
![472](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-3.png)
VM 3개 모두 설정하고 `esc` `:wq` 로 작성해서 나옴

확인 : `ping k8s-cp` `ping k8s-w1` `ping k8s-w2`
상대로 ping을 날려보면
![458](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-4.png)
![450](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-5.png)
다 잘 통신되는걸 확인할 수 있음

3. swap 비활성화
- Kubernetes는 swap 사용 불가능
모든 노드에서 `sudo swapoff -a`
영구 적용 `sudo vi /etc/fstab` → swap 라인 주석 처리 `# /swap.img none swap sw 0 0`
![489](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-6.png)


확인 : `free -h` → swap 이 0B 여야함
![503](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-7.png)

4. 필수 커널 모듈
	- Kubernetes는 **Linux bridge 네트워크 설정** 필요
```
sudo modprobe overlay  
sudo modprobe br_netfilter
```

영구적용
```
sudo tee /etc/modules-load.d/k8s.conf << EOF  
overlay  
br_netfilter  
EOF
```
![500](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-8.png)

5. 네트워크 설정
```
sudo tee /etc/sysctl.d/k8s.conf <<EOF  
net.bridge.bridge-nf-call-iptables = 1  
net.bridge.bridge-nf-call-ip6tables = 1  
net.ipv4.ip_forward = 1  
EOF
```

적용
```
sudo sysctl --system
```

의미
- `ip_forward` → Pod 네트워크 라우팅
- `bridge-nf-call-iptables` → Pod 트래픽 iptables 처리

6. Container Runtime 설치 (containerd)
```
sudo apt update  
sudo apt install -y containerd
```

설정 파일 생성
```
sudo mkdir -p /etc/containerd  
containerd config default | sudo tee /etc/containerd/config.toml
```

cgroup 설정 변경
`sudo vi /etc/containerd/config.toml`
`SystemdCgroup = false` → `SystemdCgroup = true` 로 변경
![311](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260306-9.png)
- containerd 재시작 필요
	```
	sudo systemctl restart containerd  
	sudo systemctl enable containerd
	```
확인 : `systemctl status containerd`

7. Kubernetes 설치
패키지 repo 추가
```
sudo apt-get update  
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
```

Kubernetes GPG key
```
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | \  
sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
```

repository 등록
```
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \  
https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | \  
sudo tee /etc/apt/sources.list.d/kubernetes.list
```

설치
```
sudo apt update  
sudo apt install -y kubelet kubeadm kubectl
```
버전 고정 : `sudo apt-mark hold kubelet kubeadm kubectl`

- `kubeadm` → 클러스터 생성
- `kubelet` → 노드 agent
- `kubectl` → Kubernetes CLI

8. Coltrol Plane 초기화
110번 서버에서만
```
sudo kubeadm init \  
--apiserver-advertise-address=192.168.80.110 \  
--pod-network-cidr=192.168.0.0/16
```









#### 3. **네트워크 및 커널 설정**

- Kubernetes 네트워크 정책 활성화
	- `net.bridge.bridge-nf-call-iptables = 1`
	- `net.bridge.bridge-nf-call-ip6tables = 1`
	- `net.ipv4.ip_forward = 1`
- - `sysctl --system`으로 설정 적용

#### 4. Container Runtime 설치  

- `containerd` 설치  
- 기본 설정 파일 생성  
- `SystemdCgroup = true` 설정  
- containerd 서비스 활성화 및 재시작

#### 5. Kubernetes 구성 요소 설치  

- Kubernetes apt repository 등록  
- 다음 패키지 설치  
	- `kubelet`  
	- `kubeadm`  
	- `kubectl`  
- 버전 고정 (`apt-mark hold`)

#### 6. Control Plane 초기화  

- Control Plane 노드에서 실행  
	- `kubeadm init`  
	- `--apiserver-advertise-address` 설정  
	- `--pod-network-cidr` 지정

#### 7. kubectl 설정  

- Control Plane에서 kubectl 사용을 위한 kubeconfig 설정  
	- `$HOME/.kube/config` 생성  
	- `/etc/kubernetes/admin.conf` 복사

#### 8. CNI 설치  

- Calico 네트워크 플러그인 설치  
- Pod 네트워크 구성

#### 9. Worker 노드 클러스터 참여 

- Worker 노드에서 `kubeadm join` 실행  
	- Control Plane에서 생성된 join 명령어 사용  
	- Worker 노드 클러스터 연결

#### 10. 클러스터 상태 확인  

- Control Plane에서 확인  
	- `kubectl get nodes`  
	- 모든 노드 `Ready` 상태 확인

---

### 완료

- Kubernetes 클러스터 정상 구성
- Control Plane 1대 + Worker 2대 연결
- Pod 네트워크 정상 동작
- `kubectl`로 클러스터 관리 가능