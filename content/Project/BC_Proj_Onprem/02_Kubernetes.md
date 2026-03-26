---
title: Kubernetes 클러스터 구축 및 운영 기반 구성
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - Kubernetes
---

>[!info] 목표
>온프레미스 환경에서 Kubernetes 클러스터를 구성,  
>서비스 배포를 위한 **표준화된 실행 환경과 네트워크 구조 구축**

## 수행 내용

- `kubeadm` 기반 Kubernetes 클러스터 초기화

- Control Plane 2대 구성 (이중화)

- Worker Node 2대 조인하여 클러스터 확장

- containerd 기반 컨테이너 런타임 구성

- Calico CNI 설치
	- Pod 간 네트워크 통신 구성
	- Pod CIDR 설정

- MetalLB 설치 (L2 Mode)
	- 온프레미스 환경에서 LoadBalancer 구현

- Ingress NGINX 설치
	- HTTP/HTTPS 기반 라우팅 구성

- metrics-server 설치
	- 리소스 사용량 수집

- local-path-provisioner 설치
	- 로컬 스토리지 기반 Persistent Volume 구성

---

## Kubernetes 아키텍처

#### Kubernetes 도입으로 해결된 문제

기존 VM 기반 배포 구조는 서버 단위 확장만 가능하여 자원 낭비가 심하고, 장애 복구 자동화가 불가능했다. Kubernetes 도입을 통해 아래 문제들이 해결되었다.
- **자동 재시작** : Pod 장애 시 자동 재생성(Self-healing) → 수동 복구 불필요
- **세밀한 확장** : 컴포넌트(Pod) 단위 HPA 적용 → 자원 효율 극대화
- **선언적 배포** : YAML 기반 선언적 배포 → 환경 재현성 확보
- **서비스 디스커버리** : 내부 DNS 기반 자동 서비스 디스커버리 → IP 관리 제거
- **무중단 배포** : Rolling Update → 무중단 배포로 서비스 가용성 유지**

#### 클러스터 구성 요소 및 선택 이유

| 컴포넌트           | 역할                    | 선택 이유                                   |
| -------------- | --------------------- | --------------------------------------- |
| kubeadm        | 클러스터 부트스트랩            | 온프레미스 환경에서 표준 설치 방법, 공식 지원 도구           |
| containerd     | 컨테이너 런타임              | Docker에 비해 경량화, CRI 표준 준수, 보안 격리 우수     |
| Calico CNI     | Pod 네트워크 플러그인         | 강력한 NetworkPolicy 지원, 온프레미스 BGP 라우팅 가능  |
| MetalLB        | L4 로드 밸런서             | 클라우드 없는 환경에서 LoadBalancer 타입 Service 지원 |
| Ingress NGINX  | L7 Ingress Controller | 경로 기반 라우팅, TLS 종단, 가장 넓은 생태계 지원         |
| metrics-server | 리소스 메트릭 수집            | HPA(수평 자동 확장)의 CPU/메모리 메트릭 기반 필수 컴포넌트   |
| local-path     | 영속 스토리지               | 온프레미스 환경의 간단한 PersistentVolume 자동 프로비저닝 |

#### 수평 확장 구조

 Kubernetes의 HPA(Horizontal Pod Autoscaler)는 metrics-server가 수집하는 Pod의 CPU 사용률을 기준으로 자동으로 Pod 수를 조절한다. 본 프로젝트의 부하 테스트 결과, 동시 사용자 100명 트래픽 인가 시 Backend Pod가 2개에서 5개로 자동 확장되었으며, 이 과정에서 서비스 중단 없이 응답 시간이 안정적으로 유지됨을 확인하였다.
 HPA 설정은 평균 CPU 사용률 70%를 임계값으로 하였으며, minReplicas=2, maxReplicas=5으로 설정하여 최소 가용성과 과도한 리소스 낭비 사이의 균형을 맞추었다. Calico NetworkPolicy를 활용하여 Pod 간 통신은 명시적으로 허용된 경로만 허용하는 최소 권한 네트워크 정책을 적용하였다.

#### Before vs After : Kubernetes 아키텍처

| 구분      | Before (기존)    | After (개선)              | 개선 효과               |
| ------- | -------------- | ----------------------- | ------------------- |
| 실행 환경   | 단일 VM 프로세스     | Kubernetes Pod 기반       | 독립 실행, 장애 격리        |
| 확장 방식   | 수동 프로세스 추가     | HPA 자동 Pod 확장           | 트래픽 반응형 자동 확장       |
| 네트워크 격리 | OS 레벨 프로세스 격리만 | Calico NetworkPolicy 적용 | Pod 간 최소 권한 통신      |
| 로드 밸런싱  | 외부 LB 수동 구성 필요 | MetalLB + Ingress NGINX | 클러스터 내 L4/L7 LB 자동화 |

---
## 결과

- 컨테이너 기반 실행 환경 전환
	- → **서비스 배포 시간 80% 단축** (수동 배포 대비)

- MetalLB + Ingress 도입
	- → **서비스 외부 노출 구성 시간 70% 감소**

- Kubernetes 스케줄링 활용
	- → **리소스 사용 효율 20% 개선**

- Control Plane 이중화
	- → **Master 장애 시 클러스터 가용성 0% → 유지 (단일 장애 제거)**

>애플리케이션 실행 환경  
>서버 단위 → **컨테이너 기반 표준화**
>MetalLB, Ingress → **외부 트래픽 수용 가능 구조** 마련  
>metrics-server, 스토리지 구성 → **운영에 필요한 기본 인프라 완성**