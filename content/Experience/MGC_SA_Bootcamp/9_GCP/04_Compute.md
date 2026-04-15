---
title: GCP Compute Engine
draft: false
date: 2026-04-15
updated: 2026-04-15
tags:
  - GCP
  - VM
  - Compute Engine
---

## GCP Compute Engine

= Google Cloud에서 가상머신을 실행하는 서비스

- AWS EC2와 유사
- OS 수준까지 제어 가능한 IaaS 컴퓨팅 서비스

#### 구성요소

- 이름
- Region / Zone
- 머신 타입
- OS 이미지
- 부팅 디스크
- 네트워크와 서브넷
- 외부 IP 여부
- 방화벽 대상 태그
- Service Account
- Startup Script


**머신 패밀리, 시리즈, 머신 타입**

1. **머신 패밀리** : 큰 범주의 용도 구분
	- 범용
	- 컴퓨팅 최적화
	- 메모리 최적화

2. **머신 시리즈** : 같은 패밀리 내 세대나 특성 구분
	- E2
	- N2
	- C 계열

3. **머신 타입** : 실제 선택 VM 크기


**이미지(Image)와 부팅 디스크(Boot Disk)**

- 이미지 (Image) : 운영체제와 기본 소프트웨어 구성이 담긴 탬플릿
	- Debian
	- Ubuntu
	- Rocky Linux
	- Windows Server

- 부팅 디스크 (Boot Disk) : 실제 인스턴스 부팅 시 사용하는 디스크
	- 이미지 기반 생성, OS 파일 시스템 존재

- AWS AMI ↔ GCP Image
- AWS 루트 볼륨 (EBS 기반) ↔ GCP Boot Disk


**Persistent Disk**

- 특징
	- 네트워크 기반 블록 스토리지
	- 부팅 디스크 또는 데이터 디스크로 사용 가능
	- 인스턴스와 분리된 지속성 제공
	- 필요 시 크기 조정 가능
	- 추가 디스크를 붙여 데이터 분리 가능


**외부 IP / 내부 IP**

- 내부 IP
	- 같은 VPC 또는 연결된 네트워크 안 사설 IP
- 외부 IP
	- 인터넷 또는 외부 네트워크에서 공인 IP

- 정적 외부 IP (Static External IP)
	- 동적 할당 가능, 정적 예약 가능
	- DNS 특성 서버에 고정 연결, 운영 서버의 외부 주소 고정 등
	- AWS EIP와 유사


**Startup Script**

- VM 부팅 시 실행 스크립트
- 초기 설정 반복 작업 수행
- AWS User Data와 유사


**메타데이터 (Metadata)**

- ex) Startup Script


**Service Account와 VM**

- VM안의 애플리케이션이 GCP API에 접근 가능
- AWS EC2 Instance Profile과 IAM Role 연결과 유사


**네트워크 태그와 VM**

- `target-tags=[tag]` 로 활용


#### CLI 명령어로 VM 설정

Startup Script 예시 파일
```
cat > startup-web.sh<<'EOF'
#!/bin/bash
apt-get update -y
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
echo "<h1>GCP Compute Engine Web Server</h1>" > /var/www/html/index.html
EOF
```

VM 생성
```
gcloud compute instances create web-vm-01 \
--zone=asia-northeast3-a \
--machine-type=e2-micro \
--subnet=initial-subnet-web \
--tags=web \
--image-family=debian-12 \
--image-project=debian-cloud \
--metadata-from-file=startup-script=startup-web.sh
```

인스턴스 목록 조회 : `gcloud compute instances list`

특정 인스턴스 상세 확인
```
gcloud compute instances describe web-vm-01 \
--zone=asia-northeast3-a
```

gcloud로 SSH 접속 : `gcloud compute ssh web-vm-01 --zone=asia-northeast3-a`

정적 외부 IP 예약 및 연결

예약 :
```
gcloud compute addresses create web-ip-01 \
--region=asia-northeast3
```
확인 : `gcloud compute addresses list`

연결 :
```
gcloud compute instances delete-access-config web-vm-01 \
--zone=asia-northeast3-a \
--access-config-name="external-nat"

gcloud compute instances add-access-config web-vm-01 \
--zone=asia-northeast3-a \
--access-config-name="external-nat" \
--address=web-ip-01
```

추가 데이터 디스크 생성 및 연결

추가 디스크 생성 :
```
gcloud compute disks create web-data-disk-01 \
--zone=asia-northeast3-a \
--size=20GB \
--type=pd-balanced
```

인스턴스 연결 :
```
gcloud compute instances attach-disk web-vm-01 \
--zone=asia-northeast3-a \
--disk=web-data-disk-01
```

Service Account 확인
```
gcloud compute instances describe web-vm-01 \
--zone=asia-northeast3-a \
--format="get(serviceAccounts)"
```

>[!info] 요약
>Compute Engine = Google Cloud의 VM 서비스  
>머신 패밀리/시리즈/타입 구조로 자원 선택  
>Persistent Disk = 인스턴스와 분리된 네트워크 블록 스토리지  
>Startup Script = 메타데이터 통해 전달, 부팅 시 자동 실행