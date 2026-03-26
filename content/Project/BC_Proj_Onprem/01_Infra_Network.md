---
title: 인프라 및 네트워크 기반 구축
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - Infra
  - Network
  - GNS3
  - Bastion Host
  - VM
---

>[!info] 목표
>단일 물리 장비 환경에서 다중 서버 구조를 가상화  
>네트워크 분리 및 접근 제어를 포함한 **온프레미스 인프라 기반을 구축**

## 수행 내용

- 단일 노트북에 VM 7대 구성하여 다중 서버 환경 구현

- 각 VM 역할 분리
	- Bastion Host
	- Control Plane (2대)
	- Worker Node (2대)
	- PostgreSQL
	- Redis (Session / Queue)

- 네트워크 대역 통일 및 내부 통신 구조 설계

- Bastion Host를 단일 진입 지점으로 구성
	- 내부 노드 → Bastion을 통해서만 접근 가능

- GNS3 기반 네트워크 시뮬레이션 환경 구성
	- 내부망 / 외부망 분리
	- 네트워크 흐름 설계

- 방화벽 정책 구성
	- 필요한 포트만 허용
	- 서비스 간 통신 경로 명시적 정의

- Gateway 이중화 구성
	- 단일 장애 지점 제거
	- Failover 구조 설계

---

## 인프라 구성

#### 물리 환경 / VM 구성 및 역할 분리

프로젝트의 온프레미스 인프라는 총 7대의 VM으로 구성된다. 각 VM은 역할에 따라 명확히 분리되어 있으며, 단일 VM의 장애가 전체 서비스에 미치는 영향을 최소화하는 것을 설계 원칙으로 하였다.

| VM 역할         | 수량  | 주요 기능                                          | 배치 위치 |
| ------------- | --- | ---------------------------------------------- | ----- |
| Bastion Host  | 1   | 외부 접근 관문, SSH 터널링, 접근 감사 로그                    | DMZ   |
| Control Plane | 2   | Kubernetes API Server, etcd, Scheduler (HA 구성) | 내부망   |
| Worker Node   | 2   | 애플리케이션 Pod 실행, 서비스 워크로드                        | 내부망   |
| PostgreSQL    | 1   | 관계형 DB, 클러스터 외부 독립 운영                          | 내부망   |
| Redis         | 1   | Session / Queue 분리 운영                          | 내부망   |

#### Control Plane HA 구성

 단일 Control Plane은 Kubernetes 클러스터 전체의 단일 장애점이 된다. 이를 방지하기 위해 Control Plane을 2대로 구성하여 고가용성(HA)을 확보하였다. 두 Control Plane은 동일한 etcd 클러스터를 공유하며, API Server 앞단에 로드 밸런서(MetalLB)를 배치하여 어느 한 Control Plane이 다운되더라도 클러스터 운영이 중단되지 않도록 설계하였다.
 etcd 클러스터의 쿼럼(quorum) 유지를 위해 2대 구성이 최소 요건이며, 실제 프로덕션 환경에서는 3대 이상을 권장한다. 본 프로젝트에서는 온프레미스 VM 자원의 현실적인 제약을 고려하여 2대 구성을 채택하였으며, 추후 3대로 확장 가능한 구조로 설계하였다.

#### Before vs After : 인프라 구성

| 구분    | Before (기존)            | After (개선)              | 개선 효과            |
| ----- | ---------------------- | ----------------------- | ---------------- |
| 서버 구성 | 단일 물리 서버 중심 운영         | 역할별 VM 7대 분산 배치         | SPOF 제거, 장애 격리   |
| 확장 방식 | 수직 확장(Scale-Up), 수동    | 수평 확장(Scale-Out), 자동    | 비용 효율, 빠른 대응     |
| DB 위치 | Application 서버와 동일 호스트 | 독립 VM 분리 배치             | I/O 경합 제거, 독립 관리 |
| 가용성   | 단일 프로세스, 복구 수동         | HA Control Plane, 자동 복구 | 서비스 연속성 보장       |

#### 인프라 구조 구성도

![](Project/BC_Proj_Onprem/img/20260326-1.png)


#### VM 설정 과정

- 각 VM hostname 설정 (서로 hostname으로 통신), kubernetes vm swap 비활성화, 필수 커널 모듈 적용, 네트워크 및 커널 설정

![](Project/BC_Proj_Onprem/img/20260326-2.png)

![](Project/BC_Proj_Onprem/img/20260326-3.png)

![](Project/BC_Proj_Onprem/img/20260326-4.png)

![](Project/BC_Proj_Onprem/img/20260326-5.png)

![](Project/BC_Proj_Onprem/img/20260326-6.png)

- Container Runtime 설치, Kubernetes 구성 요소 설치, Control Plane 초기화, kubectl 설정, Calico CNI 설치, Control Plane 및 Worker Node join, Ingress NGINX 설치, MetalLB 설치, 기본 StorageClass 생성, Namespace 생성

![](Project/BC_Proj_Onprem/img/20260326-7.png)

![](Project/BC_Proj_Onprem/img/20260326-8.png)

![](Project/BC_Proj_Onprem/img/20260326-9.png)

![](Project/BC_Proj_Onprem/img/20260326-10.png)

![](Project/BC_Proj_Onprem/img/20260326-11.png)

## 네트워크 및 보안 설계

#### Bastion Host 기반 접근 제어

Bastion Host는 외부 인터넷에서 내부 인프라로의 유일한 SSH 진입점으로 설계되었다. 외부 개발자 및 운영자는 반드시 Bastion을 경유해야만 내부 VM에 접근할 수 있으며, Bastion 자체에는 최소한의 서비스만 허용하여 공격 표면(Attack Surface)을 최소화하였다.  
Bastion에는 접근 시도 및 명령어 실행에 대한 감사 로그(Audit Log)가 기록되며, 비인가 접근 시도에 대한 자동 차단 정책이 적용된다. 이를 통해 내부망 전체를 외부 인터넷으로부터 효과적으로 격리할 수 있다.

•  내부 인프라에 대한 직접 접근 완전 차단
•  외부 → Bastion → 내부 노드 단일 진입 경로만 허용
•  SSH 및 kubectl 관리 전용 접근 제어 서버

>Bastion을 단일 진입점으로 설계하면 보안 감사(Security Audit) 시 모든 인프라 접근 이력을 단일 지점에서 조회할 수 있어 컴플라이언스 대응에도 유리하다.


#### Before vs After : 네트워크 및 보안

| 구분      | Before (기존)       | After (개선)           | 개선 효과           |
| ------- | ----------------- | -------------------- | --------------- |
| 외부 접근   | SSH 직접 접근 허용      | Bastion 경유, 단일 진입점   | 공격 표면 최소화       |
| 네트워크 분리 | 단일 네트워크 혼재 운영     | DMZ / 내부망 이중 분리      | 내부 시스템 직접 노출 차단 |
| 보안 정책   | 단일 Firewall 규칙    | ACL + Firewall 이중 적용 | 다층 방어, 누락 위험 감소 |
| Gateway | 단일 Gateway (SPOF) | HSRP 이중화 Gateway     | 네트워크 장애 자동 복구   |


---
## 결과

- Bastion Host 도입을 통해 내부 노드 직접 접근 차단
	- → **외부 노출 IP 수 감소** (6개 → 1개)

- 방화벽 정책 적용 → 불필요한 포트 차단
	- → **허용 포트 수 약 70~90% 감소**

- Gateway 이중화 구성으로 네트워크 SPOF 제거
	- → **Gateway 장애 시 서비스 중단 시간 100% → 0% (Failover 시 지속 운영)**

- 내부/외부 네트워크 분리 적용
	- → **직접 접근 가능한 내부 리소스 수 0개 (완전 격리)**

>단일 노트북 환경에서도 VM 기반 분리를 통해  
>**다중 서버 구조와 네트워크 계층을 포함한 온프레미스 인프라 재현**
>Bastion Host, 방화벽 정책, Gateway 이중화를 적용함으로  
>**보안과 가용성을 고려한 네트워크 구조를 구현**