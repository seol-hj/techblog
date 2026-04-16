---
title: Workload Identity Federation for GKE
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - GCP
  - GKE
  - Kubernetes
  - Workload Identity Federation for GKE
---

**클러스터 안에서 실행되는 애플리케이션이 Google Cloud 리소스에 접근할 자격 관리**

- IAM 정책 기반
- Google Cloud API 접근 권한 부여

- Pod에 키파일 X
- Kubernetes Service Account 기준 워크로드 아이덴티티 생성
- 해당 아이덴티티에 IAM 권한 연결
- 워크로드별 세분화된 권한 설계 가능
- GKE와 Google Cloud가 기본 인프라 관리

**형식** : `PROJECT_ID.svc.id.goog`
- IAM이 Kubernetes 자격 증명을 신뢰하고 이해할 수 있도록 하는 이름 체계 역할
- 클러스터 모두 삭제해도 프로젝트에서 제거 X

**흐름**
1. 클러스터에서 Workload Identity Federation for GKE 활성화
2. Kubernetes ServiceAccount 생성
3. 해당 ServiceAccount 기준 IAM 권한 부여
4. Pod가 그 ServiceAccount로 실행
5. Pod가 Google Cloud API 접근

### Direct Access & Service Account Impersonation

**Direct Access**
- Federated principal 에 직접 리소스 권한 부여
- 중간 Google Cloud 서비스 계정 없이 바로 접근

**Service Account Impersonation**
- Kubernetes 워크로드가 특정 IAM Service Account 대신 사용
- 조직 내 기존 서비스 계쩡 운영 체계와 연결하기 좋음

### Autopilot과 Standard에서 차이

**Autopilot**
- 기본 활성화
- 별도 활성화 절차 부담 적음
- 보안 기본값 관점과 잘 맞음

**Standard**
- 클러스터 수준 활성화 필요
- 이후 노드풀 수준 활성화 필요
- 기존 환경 마이그레이션 시 단계적 적용 고려 필요

### EKS IRSA (IAM Roles for Service Accounts)와 비교

공통점
- Kubernetes ServiceAccount 기준 워크로드 권한 연결
- 장기 키 파일 없이 클라우드 API 접근
- 워크로드별 최소 권한 원칙 적용 가능
- OIDC 기반 신뢰 구조

차이점
- GKE에서 프로젝트 수준의 Workload Identity Pool을 GKE가 관리
- 외부 IdP 별도 필요 X
- GKE에서 Google Cloud IAM과 더 직접적 연결