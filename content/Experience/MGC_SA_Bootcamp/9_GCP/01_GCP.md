---
title: GCP 개요
draft: false
date: 2026-04-15
updated: 2026-04-15
tags:
  - GCP
---

## 서비스 및 특징

> 글로벌 백본 네트워크 (구글 자체 백본망)  
> AI/데이터 분석 강점  
> 프로젝트 중심 운영  

#### 기본 서비스 구조

1. [**컴퓨팅 (Compute)**](Experience/MGC_SA_Bootcamp/9_GCP/04_Compute.md)
	- **Compute Engine**
		- 가상머신(VM)을 생성해서 사용
		- 운영체제, CPU, 메모리, 디스크, 네트워크 인터페이스 등 직접 구성 가능
		- **AWS EC2 ↔ Compute Engine**

	- [**Google Kubernetes Engine (GKE)**](Experience/MGC_SA_Bootcamp/9_GCP/11_GKE.md)
		- 관리형 쿠버네티스 클러스터
		- **AWS EKS ↔ GKE**

	- **Cloud Run**
		- 컨테이너 서버리스 실행
		- 컨테이너 이미지 기반 애플리케이션 실행
		- **AWS ECS Fargate / App Runner ↔ Cloud Run**

	- **App Engine**
		- 코드 중심 애플리케이션 배포 및 운영 플랫폼
		- 코드만 올리면 자동 배포

2. [**네트워크 (Network)**](Experience/MGC_SA_Bootcamp/9_GCP/03_Network.md)
	- **VPC**
		- 클라우드 안 네트워크 구성 기본 단위
		- IP 대역, 서브넷, 라우팅, 방화벽 정책 등
		- **AWS VPC와 유사 / But, 글로벌 VPC**

	- **[Cloud Load Balancing](Experience/MGC_SA_Bootcamp/9_GCP/07_LB.md)**
		- 트래픽 분산 로드밸런서 서비스
		- 글로벌 L7/L4 로드밸런서
		- **AWS ELB ↔ Cloud Load Balancing**

	- **Cloud CDN**

	- **Cloud DNS**
		- 도메인 연결 DNS 서비스
		- **AWS Route 53 ↔ Cloud DNS**

	- **Cloud VPN**
		- 온프레미스 or 다른 클라우드와 GCP 연결
		- **AWS Site-to-Site VPN ↔ Cloud VPN**

	- **Interconnect**
		- 전용선 기반의 안정적인 네트워크 연결 필요 시 사용

	- **Firewall Rules**
		- 트래픽 허용 및 차단 정책 정의

3. **[스토리지 (Storage)](Experience/MGC_SA_Bootcamp/9_GCP/05_Storage.md) 및 데이터베이스 (DataBase)**
	- **Cloud Storage**
		- 객체 스토리지 서비스
		- 파일, 이미지, 로그, 백업 파일, 정적 웹 콘텐츠 등 저장
		- **AWS S3 ↔ Cloud Storage**

	- [**Cloud SQL**](Experience/MGC_SA_Bootcamp/9_GCP/06_SQL.md)
		- 관리형 관계형 데이터베이스
		- MySQL, PostgreSQL, SQL Server 등 운영
		- **AWS RDS ↔ Cloud SQL**

	- **AlloyDB**
		- PostgreSQL 호환 고성능 데이터베이스 서비스
		- 고성능 처리와 확장성
		- **AWS Aurora ↔ AlloyDB 일부분**

	- **BigQuery**
		- GCP의 초대형 데이터 분석 서비스

	- **Bigtable**
		- 대규모 분산 NoSQL 데이터 저장소

	- **Firestore**
		- 문서형 NoSQL 데이터베이스
		- 유연한 데이터 구조
		- Firebase 기반 DB
		- **AWS DynamoDB ↔ Firestore / Bigtable 용도에 따라**

	- **Persistent Disk**
		- VM에 연결하는 블록 스토리지
		- **AWS EBS ↔ Persistent Disk**

	- **FileStore**
		- 공유 파일 시스템
		- 관리형 파일 스토리지 서비스
		- **AWS EFS ↔ FileStore**

4. **DevOps & 운영**
	- **Cloud Build**

	- **Artifact Registry**

	- **[Cloud Monitoring](Experience/MGC_SA_Bootcamp/9_GCP/08_Monitoring_Logging.md)**
		- 메트릭, 상태, 알림 중심 → Cloud Monitoring

	- **[Cloud Logging](Experience/MGC_SA_Bootcamp/9_GCP/08_Monitoring_Logging.md)**
		- 로그 수집, 조회, 분석 중심 → Cloud Logging
		- **AWS CloudWatch ↔ Cloud Monitoring / Cloud Logging**

5. **AI / ML**
	- **Vertex AI**
	- **Vision AI**
	- **Speech-to-Text**

	- AWS 보다 강함

6. **보안 및 거버넌스**
	- [**IAM**](Experience/MGC_SA_Bootcamp/9_GCP/02_IAM.md)
		- **↔ AWS IAM**

	- **Resource Manager**

	- **Organization Policy**
		- **↔ SCP 일부**

	- **Cloud Audit Logs**

	- GCP 리소스 계층 구조
		```
		- Organization
			  - Folder
				    - Project
					      - Resources
		```

>[!info] 정리
>GCP = AWS처럼 컴퓨팅, 스토리지, 네트워크, 데이터베이스 등 다양한 서비스 제공하는 종합 클라우드 플랫폼  
>운영 관점 Project 중심 구조가 강하게 작동  
>글로벌 네트워크 기반 인프라 강조, 일부 자원은 글로벌 관점 이해 필요  
>Region과 Zone = 배치와 장애 격리의 기본 단위  
>리소스 계층 구조 = Organization → Folder → Project → Resources  
>VPC = 글로벌 리소스, Subnet = 리전 리소스

---

### 주요 명령어

- Cloud Shell : 브라우저에서 바로 사용
- gcloud CLI : 로컬 CLI 도구

버전 확인 : `gcloud version`

gcloud 초기화 (초기 설정) : `gcloud init`
- Google 계정 인증
- 기본 프로젝트 선택
- 기본 설정 저장
- 필요시 기본 Compute Engine zone 선택

현재 프로젝트 확인 : `gcloud config list`
- 현재 로그인한 계쩡
- 현재 기본 프로젝트
- 기타 설정값

현재 프로젝트만 확인 : `gcloud config get-value project`

프로젝트 변경 : `gcloud config set project [Project_ID]`

사용 가능한 리전 확인 : `gcloud compute regions list`

사용 가능한 존 확인 : `gcloud compute zones list`

인증된 계정 확인 : `gcloud auth list`