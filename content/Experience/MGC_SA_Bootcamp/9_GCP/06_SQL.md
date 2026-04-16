---
title: GCP Cloud SQL
draft: false
date: 2026-04-15
updated: 2026-04-15
tags:
  - GCP
  - Cloud SQL
  - RDBMS
---

**완전 관리형 관계형 데이터베이스 서비스**
- DB 엔진 설치, 패치, 기본 운영 부담 줄여줌
- 일반적인 RDBMS처럼 접속해서 사용
- AWS RDS와 유사

**vs RDS**
- 공통점
	- 관리형 관계형 데이터베이스 서비스
	- MySQL, PostgreSQL 같은 엔진 지원
	- 백업, 복구, 고가용성 기능 제공
	- 애플리케이션과 네트워크 경로 설계 필수
- 차이점
	- GCP 연결 설계 시 Public IP / Private IP / Auth Proxy 조합을 더 명시적으로 설명하는 흐름
	- Public IP 사용 시 허용 네트워크 별도 관리
	- Private IP는 VPC 사설 연결 설계와 같이 관리
	- 일부 고급 DB 권한이나 OS 수준 제어는 제한

## 구성 요소

- DB 엔진
- 버전
- 인스턴스 이름
- 리전
- 머신/컴퓨팅 크기
- 스토리지 크기
- 백업 설정
- 고가용성 여부
- Public IP / Private IP
- 인증 및 연결 정책

#### Public IP / Private IP

**Public IP** : Cloud SQL 인스턴스가 공인 주소를 통해 접근 가능
- 특정 IP 또는 IP 범위를 authorized networks로 추가해 접속 허용 가능 / 사설 대역은 불가능
- 장점
	- 초기 테스트
	- 로컬 PC나 외부 환경에서 접속 테스트
- 단점
	- 네트워크 노출 면적 큼
	- 허용 IP 관리 필요

**Private IP** : Cloud SQL 인스턴스를 사설 네트워크 경로로 연결
- 생성 중 VPC 네트워크 선택해 private IP 구성 가능
- 장점
	- 인터넷 직접 노출 X
	- 애플리케이션과 DB 내부망 연결
	- 운영 관점에서 더 안전
- 단점
	- VPC 및 사설 연결 구성 이해 필요
	- 로컬 PC에서 바로 접속 복잡

#### Cloud SQL Auth Proxy

- Public / Private IP 모두에서 동작
- 사용자 or 서비스 계정 자격 증명으로 연결 검증
- Cloud SQL 인스턴스로의 보안 연결 제공
- 권장 연결 방식

- 역할
	- Cloud SQL 인증 처리 보조
	- 보안 연결 구성
	- 애플리케이션에서 로컬 포트처럼 DB에 접근하는 형태 제공

#### 인증 방식

**Built-in Authentication** : 전통적인 DB 사용자 계정 방식

**IAM Database Authentication** : IAM 기반 데이터베이스 인증

#### 백업

- 자동 백업 운영 중요
- 인스턴스에 맞는 백업 구성 선택
- 백업 관리 문서 = 자동 백업 시간 창 설정 가능

- 장애 시 복구 가능성 확보
- 실수로 삭제/손상된 데이터 복원 대비
- 운영 안정성 확보

#### 고가용성 (HA)

- 생성 시 혹은 기존 인스턴스에서 활성화 가능

- 단일 장애 지점 완화
- 장애 발생 시 서비스 지속성 향상
- 운영 환경 신뢰성 강화

#### 연결 방식 예시

1. `로컬 PC → Public IP → Cloud SQL`
	- 초기 테스트
	- 관리자 점검
	- 특징
		- 쉽고 빠름
		- 운영용 X

2. `Compute Engine → Private IP → Cloud SQL`
	- 전형적인 내부망 애플리케이션 구조
	- 웹/앱 서버와 DB 분리 구조
	- 특징
		- 운영에 적합
		- 보안적 유리
		- VPC 구조 이해 필요

3. `애플리케이션 → Auth Proxy → Cloud SQL`
	- 인증과 보안 연결 일관성
	- 서비스 계정과 함께 안전한 연결 구성
	- 특징
		- 실무적
		- 권장 패턴

#### CLI 명령어

Cloud SQL 인스턴스 생성
```
gcloud sql instances create mysql-lab-01 \
--database-version=MYSQL_8_0 \
--cpu=2 \
--memory=4GB \
--region=asia-northeast3 \
--root-password='MySecurePass123!'
```

인스턴스 정보 조회 : `gcloud sql instances describe mysql-lab-01`

>[!info] 요약
>Cloud SQL = MySQL, PostgreSQL, SQL Server 지원하는 완전관리형 관계형 데이터베이스 서비스  
>Public IP, Private IP, 또는 둘 다를 통해 연결  
>Public IP → authorized networks 등 접근 제어 중요  
>Private IP → PVC 기반 내부망 연결 구조 만드는데 적합  
>Cloud SQL, Auth Proxy → 권장 연결 방식, 인증과 보안 연결 단순화  
>자동 백업과 고가용성 중요