---
title: GCP IAM
draft: false
date: 2026-04-15
updated: 2026-04-15
tags:
  - GCP
  - IAM
---

**GCP IAM의 관점**
1. 어느 리소스 범위에 권한을 줄 것인가
2. 누구에게 줄 것인가
3. 어떤 Role을 줄 것인가

- 특정 리소스 범위에 대해 Principal과 Role을 Binding 하는 구조

- 최소 권한 원칙 / 적절한 범위 설정 중요

**GCP 리소스 계층 구조**
```
- Organization
	  - Folder
		    - Project
			      - Resource
```
- 권한이 상위에서 하위로 상속 가능

## GCP IAM

#### Principal

- 권한을 받는 주체

ex)
- 사용자 계정
- Google 그룹
- Service Account
- 도메인
```
user:alice@example.com
group:dev-team@example.com
serviceAccount:web-sa@my-project.iam.gserviceaccount.com
```


#### Permission

- 실제 수행 가능한 개별 작업

ex)
- VM 조회
- VM 생성
- Storage 객체 읽기
- 로그 조회
```
compute.instances.get
compute.instances.create
storage.objects.get
storage.objects.create
```

- 가장 작은 권한 단위, 보통 Role로 묶어서 관리


#### Role

- 여러 Permission을 묶은 권한 집합

ex)
- Compute Viewer
- Storage Object Viewer
- Logging Viewer
- Compute Admin

- 실제 권한 부여는 Role 단위

- **종류**
1. **Basic Role**
	- 가장 기본적이고 범위가 넓은 역할
		- Viewer
		- Editor
		- Owner
	- 특징
		- 이해하기 쉽다
		- 범위가 넓다
		- 실습에는 편하지만 실무에는 과할 수 있다

2. **Predefined Role**
	- Google이 서비스별로 미리 정의해 둔 역할
	- ex)
		- `roles/compute.viewer`
		- `roles/compute.instanceAdmin.v1`
		- `roles/storage.objectViewer`
		- `roles/logging.viewer`
	- 특징
		- 서비스별로 세분화
		- Basic Role보다 정밀
		- 최소 권한 원칙을 적용하기 좋다
	- 보통 Predefined Role 우선 사용

3. **Custom Role**
	- 조직이나 프로젝트에서 직접 만드는 사용자 정의 역할
	- 특징
		- 필요한 Permission만 골라 매우 정밀하게 설계 가능
		- 유지관리 부담 O
	- Predefined Role만으로 정확히 맞추기 어려울 때 사용


#### Policy Binding

- 누구에게
- 어떤 Role을
- 어느 리소스 범위에 연결할 지

ex)
하나의 Binding
- `alice@example.com` 에게
- `roles/viewer` 를
- 특정 Project에 부여

- GCP IAM = **Principal + Role + Resource Scope**를 연결하는 구조


#### 권한 상속 (Inheritance)

- 상위 계층에서 부여한 권한 → 하위 계층 영향
- 범위가 넓을수록 관리 효율 좋음 / 불필요한 접근 늘어날 수 있다

- 가능한 필요한 범위에만 권한 부여
- Project 단위 권한 설계부터 이해
- 상위 계층 권한 신중하게 사용


#### Service Account

- 사람 X
- 애플리케이션이나 워크로드가 사용하는 계정

ex)
- VM이 Cloud Storage에 접근 시
- 애플리케이션이 Secret을 읽을 시
- 서버 애플리케이션이 GCP API를 호출할 시

1. Service Account 생성
2. 필요한 Role 부여
3. VM 또는 서비스에 연결
4. 애플리케이션이 해당 권한으로 GCP API 접근

- 결국, Principal의 한 종류


#### AWS IAM vs GCP IAM

**운영 경계**
- AWS
	- Account 중심 운영
	- 계정 단위 권한 경계 강함
- GCP
	- Project 중심 운영
	- Organization / Folder / Project 구조와 상속 고려

**권한 부여 방식**
- AWS
	- Policy를 작성하고 User / Group / Role 에 부착
- GCP
	- 특정 리소스 범위에 Principal과 Role을 Binding 함

**워크로드 권한**
- AWS
	- IAM Role
	- AssumeRole
	- IRSA
- GCP
	- Service Account
	- Worload Identity 계열


#### 주요 명령어

프로젝트 IAM 정책 조회 : `gcloud projects get-iam-policy [Project_ID]`

CLI로 권한 부여
```
gcloud projects add-iam-policy-binding [PROJECT_ID] \  
--member="user:user1@example.com" \  
--role="roles/viewer"
```

Service Account 생성
```
gcloud iam service-accounts create web-sa \  
--display-name="web service account"
```
결과 : `web-sa@[PROJECT_ID].iam.gserviceaccount.com`

Service Account 권한 부여
```
gcloud projects add-iam-policy-binding [PROJECT_ID] \  
--member="serviceAccount:web-sa@[PROJECT_ID].iam.gserviceaccount.com" \  
--role="roles/storage.objectViewer"
```