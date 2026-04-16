---
title: GKE Cluster 설계 요소
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - GCP
  - GKE
  - Kubernetes
---

**클러스터 생성 시**

1. [운영 모드](Experience/MGC_SA_Bootcamp/9_GCP/12_GKE_Mode.md)
	- Standard
	- Autopilot

2. 배치 범위
	- Zonal - 존형
	- Regional - 리전형

3. 네트워크 구조
	- VPC
	- Subnet
	- Pod IP / Service IP 할당

4. 노드 운영 방식
	- 노드풀
	- 역할별 분리

결정

---

## 배치 범위 : Zonal / Regional

#### Zonal - 존형 클러스터

하나의 Zone을 중심으로 제어 평면과 노드가 배치

**특징**
- 구조 단순
- 테스트 및 학습용
- 비용과 구성 단순
- 단일 존 장애 도메인 영향을 더 직접적으로 받음

#### Regional - 리전형 클러스터

여러 Zone에 걸쳐 더 높은 가용성 제공

**특징**
- 고가용성
- 운영 환경에 적합
- 제어 평면과 노드가 다중 존에 분산
- 비용과 구성 복잡

---

### VPC-native 클러스터

- Pod IP가 VPC 내부에서 직접 라우팅 가능
- 네트워크 설계 일관성
- Compute Engine, Cloud SQL 같은 GCP 리소스와 연결성 좋음
- GKE 권장 네트워크 모델

### Pod CIDR & Service CIDR

**Pod CIDR**
- Pod들이 사용할 IP 대역
- VPC-native 클러스터 → 보통 서브넷의 secondary range를 Pod IP 용도로 사용

**Service CIDR**
- ClusterIP 같은 Service 리소스가 사용할 IP 대역

### Secondary Range

GKE VPC-native 클러스터는 보통 서브넷의 secondary range 사용

구조 ex)
- Primary subnet range : 노드 IP
- Secondary range 1 : Pod IP
- Secondary range 2 : Service IP

- 역할별 주소 공간 분리
- 충돌 방지
- 운영 가시성 향상
- 멀티 클러스터 및 하이브리드 확장에 유리

---

### Node Pool - 노드풀

GKE 클러스터 안에서 동일한 구성의 노드 그룹
Standard 모드에서는 노드풀 설계 중요

- 역할별 워크로드 분리
- 머신 타입 분리
- 스케일링 정책 분리
- 운영 정책 분리

### 릴리스 채널과 버전 선택

클러스터 생성 시 릴리스 채널 선택 가능
클러스터 업그레이드 수신 방식에 영향
Autopilot → 릴리스 채널 등록 필수
Standard → 선택 가능

### Private Cluster 여부

Private Cluster는 노드가 내부 IP만 사용
제어 평면 접근 범위를 조정할 수 있는 VPC-native 클러스터 유형

---

### `kubectl` 접근과 인증 흐름

1. GKE 클러스터 생성
2. `gcloud`로 클러스터 자격증명 가져오기
3. `kubeconfig` 업데이트
4. `kubectl`로 API 서버 접근

```
gcloud container clusters get-credentials CLUSTER_NAME \
  --region REGION
```
Zonal 일 경우 :
```
gcloud container clusters get-credentials CLUSTER_NAME \
  --zone ZONE
```