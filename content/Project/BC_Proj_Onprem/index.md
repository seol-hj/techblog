---
title: Bootcamp Onpremises Project
draft: false
tags:
  - Onpremises
  - Project
---

> 부트캠프에서 진행한 2주 기간의 온프레미스 프로젝트 개요

---

## 문제점

#### 기존 3-tier 아키텍처의 한계

초기 아키텍처를 일반적인 3-tier 아키텍처라고 생각했을 때
- Web / WAS / DB 계층으로 구성
- 애플리케이션 서버가 직접 DB와 캐시, 백그라운드 처리까지 담당
- 단일 또는 소수 서버 중심 운영
- 수동 배포 및 수동 장애 대응 방식에 가까움

→ **특정 시간대에 트래픽이 급증하는 구조** 를 가정하면 여러 문제가 발생한다

1. **애플리케이션과 인프라 역할 강하게 결합**

기존 구조 :
FE, API Server, 백그라운드 작업, 세션 관리, 캐시, 큐 처리 등
한 구성요소의 부하가 다른 구성요소에 직접 영향

**역할 분리가 충분 X) 특정 기능의 부하 = 전체 서비스 품질 저하**

2. **확장 단위가 비효율적**

기존 구조 :
보통 서버 단위로 확장
실제로 모든 구성요소가 같은 비율로 부하 받지 않음

**필요한 부분만 늘리는 것 X, 서버 전체를 늘려야 하는 비효율 발생**

3. **비동기 처리 분리가 부족할 시 순간 트래픽에 취약**

기존 구조 :
순간적으로 요청이 몰리는 서비스 (ex) 수강신청, 래플, 선착순 이벤트, 대량 등록 처리 등)
모든 요청을 동기적으로 즉시 처리 → 병목 발생

**burst traffic을 흡수하는 완충 지점(buffer) 부족**

4. **장애 격리 수준 낮음**

기존 구조 :
적은 수의 서버에 여러 역할 → 특정 장애가 전체 서비스 영향

**장애 국소화 X → 전체 장애로 확산**

5. **운영 자동화와 배포 일관성 부족**

기존 구조 :
서버 접속 후 직접 배포 or 환경마다 수동으로 설정 맞춰야 함

**유지보수 비용 증가**

## 아키텍처 개선 방향

**온프레미스 Kubernetes 기반의 분리형 서비스 아키텍처**로 발전

- Kubernetes 기반으로 서비스 실행 환경 표준화
- FE / BE / Worker 역할 분리
- PostgreSQL 외부 분리
- Redis 역할 분리
	- Redis Session
	- Redis Queue
- DB / Redis에 Replica 구성
- Control Plane 이중화
- Ingress + MetalLB 기반 외부 진입 구조 정리
- ArgoCD 기반 GitOps 운영 구조 도입
- Prometheus + Grafana 모니터링 구조 도입
	- Grafana Alert 기반 Slack 알람 기능 도입

> 즉, 단순한 3-Tier X  
> **서비스 계층 분리 + 운영 자동화 + 확장성 + 장애 대응성**  
> 을 강화한 방향으로 발전

#### Kubernetes 도입

1. 애플리케이션 실행 환경 표준화

- 프런트엔드, 백엔드, 워커를 각각 독립된 Deployment 로 관리
- 서비스별 실행 방식, 재시작 정책, 리소스 제한, 복제 개수 등 선언적 관리 가능
	- YAML로 정의
- **운영 절차의 코드화**

2. 서비스별 독립 확장 가능

- 부하 특성에 따라 개별적으로 replicas 늘리기 가능
- **부하가 발생한 서비스만 선택적으로 확장**

3. 자가 복구 (Self-healing)

- 선언된 desired state를 유지하기 위해 자가 복구
- 기존 구조 → 장애 발생 후 사람이 복구
- Kubernetes 도입 후 → 시스템이 기본적으로 원하는 상태를 자동 유지

4. 배포 일관성 & GitOps

- ArgoCD와 연계 → Git 저장소의 매니페스트 = 배포 기준
	- 현재 운영 상태 Git 으로 추적 가능
	- 변경 이력 관리 가능
	- 동일한 방식으로 재현 가능
	- 롤백 명확
- **배포를 수동 작업에서 형상관리 기반 운영으로 전환**

#### DB를 Kubernetes 외부로 분리

1. 상태 저장소와 애플리케이션 워크로드 분리

- 변화가 잦은 영역과 안정성이 중요한 영역 분리

2. 운영 책임 분리와 관리 용이성

3. 장애 영향 범위 축소

#### Redis - Session용과 Queue 용으로 분리

1. 서로 다른 성격의 워크로드 분리

- Redis Session → 빠른 조회와 짧은 응답 시간
- Redis Queue → 처리량과 적체 관리

2. 상호 간섭 방지

- 핵심 사용자 요청 경로와 백그라운드 처리 경로 분리

3. 확장 및 튜닝 포인트 분리

- 운영 목적에 맞는 최적화를 가능하게 하는 구조적 선택

#### Replica 구성

1. 서비스 가용성 향상
2. 읽기 부하 분산 및 복구 기반 마련

> 해당 프로젝트의 replica 구성은  
> 논리적/운영적 고가용성 구조를 학습하고 검증하는 목적  
> 물리 장비 이중화의 HA와는 구분


#### Control Plane 2개 배치

- cp 구성 요소 분산
- 단일 cp 대비 관리 평면 이중화 방향성 확보
- kubeadm 기반 멀티 cp 구조

> etcd quorum 관점 완전한 HA 구성 X  
> cp를 2개로 구성함으로 단일 마스터 구조보다 관리 평면 분산 구조  
> 완전한 HA 제어 평면 관점 → quorum 확보를 위해 3개 이상의 cp 또는 별도 etcd 설계가 더 바람직  


>[!info] 아키텍처 종합적 개선 효과  
>단일 서버 중심 구조 → 역할 분리 구조
>수동 운영 중심 → 선언적 운영 구조  
>동기 처리 중심 → 비동기 처리 포함 구조  
>단일 장애 지점 많은 구조 → 분산 및 복제 구조  

---

## 목적

>단순 3-tier 구조에서 시작  
>실제 서비스 환경을 가정한 확장성과 안정성을 고려한 아키텍처로 점진적으로 발전시키는것

#### 1. 기본 3-Tier 구조 설계

- 전통적인 Web / WAS / DB 구조를 기반으로 설계
	- FE + BE 중심 구조
	- 단일 DB 사용
	- 동기 처리 중심 로직 구성

#### 2. 역할 분리 및 비동기 처리 도입

- 트래픽 집중 상황을 고려하여 구조 개선 진행
	- Backend와 Worker 분리
	- Redis Queue 도입 (비동기 처리)
	- 요청 처리와 작업 처리를 분리

>burst traffic을 흡수할 수 있는 구조  
>API 응답 성능과 처리 안정성 개선

#### 3. 상태 저장소 분리

- 애플리케이션과 데이터 계층 분리 진행
	- PostgreSQL을 Kubernetes 외부로 분리
	- Redis를 Session / Queue 용도로 분리

>데이터 안정성 확보  
>역할별 리소스 간섭 최소화  
>운영 관리 포인트 명확화

#### 4. Kubernetes 기반 실행 환경 전환

- 서비스 실행 환경을 Kubernetes 로 전환
	- FE / BE / Worker를 각각 Deployment로 구성
	- Service / Ingress 기반 네트워크 구조 정리
	- MetalLB를 통한 온프레미스 LoadBalancer 구성

>서비스 배포 표준화  
>확장 단위의 세분화  
>자가 복구 기반 확보

#### 5. 가용성 및 확장성 강화

- Pod Replica 구성 (FE / BE / Worker)
- PostgreSQL / Redis replica 구성
- Control Plane 다중화

>단일 장애 지점 감소  
>서비스 연속성 확보  
>확장 기반 마련

#### 6. 운영 자동화 및 GitOps 도입

- ArgoCD를 통한 선언적 배포 관리
- Git 저장소를 단일 진실 소스로 활용
- 이미지 버전 기반 자동 배포 흐름 구성

>배포 일관성 확보  
>변경 이력 추적 가능  
>운영 자동화 기반 구축

---

## 로드맵

#### 1. [인프라 및 네트워크 기반 구축](Project/BC_Proj_Onprem/01_Infra_Network.md)

**목표**
- 온프레미스 환경에서 **네트워크 + 보안 + 접근 구조** 포함 인프라 기반 구성

**수행 내용**
- VM 7대 구성
- Bastion Host 기반 접근 구조 설계
- 내부 네트워크 / 외부 접근 경로 분리
- GNS3 기반 네트워크 시뮬레이션
- 방화벽 정책 구성
- Gateway 이중화 구성

>[!info] 포인트
>보안 구조까지 포함된 인프라  
>네트워크 레벨에서 단일 장애 지점 제거

#### 2. [Kubernetes 클러스터 구축 및 운영 기반 구성](Project/BC_Proj_Onprem/02_Kubernetes.md)

**목표**
- 서비스 실행을 위한 Kubernetes 환경 구축

**수행 내용**
- `kubeadm` 기반 클러스터 구성
- `Control Plane` 이중화
- `Worker Node` 구성
- `Calico CNI` 적용
- `MetalLB` / `Ingress` / `metrics-server` / `storage` 구성

>[!info] 포인트
>온프레미스에서 **LoadBalancer 구현**  
>Kubernetes 기반 **서비스 실행 표준화**

#### 3. [모니터링 및 관측 환경 구축](Project/BC_Proj_Onprem/03_Monitoring.md)

**목표**
- 서비스 상태를 실시간으로 관측하고 장애 대응 체계 구축

**수행 내용**
- Prometheus / Grafana 구축
- 리소스 및 서비스 상태 시각화
- Alertmanager + Slack 연동
- 장애 알림 자동화

>[!info] 포인트
>단순 모니터링 → **운영 대응**까지 포함  
>보는것 → **알림 받는것**까지 확장

#### 4. [서비스 아키텍처 설계 및 데이터 계층 분리](Project/BC_Proj_Onprem/04_Archi.md)

**목표**
- 확장성과 안정성을 고려한 서비스 구조 설계

**수행 내용**
- Frontend / Backend / Worker 분리
- Redis Queue 기반 비동기 처리 도입
- Redis Session / Queue 분리
- PostgreSQL 외부 분리
- DB / Redis Replica 구성

>[!info] 포인트
>동기 구조 → **비동기 구조** 전환  
>단일 저장소 → **역할별 데이터 계층 분리**

#### 5. [Kubernetes 기반 서비스 배포 및 고가용성 적용](Project/BC_Proj_Onprem/05_HA.md)

**목표**
- 서비스를 Kubernetes 환경에서 안정적으로 운영

**수행 내용**
- Deployment / Service / Ingress 구성
- Pod Replica 적용
- Control Plane 이중화 유지
- 장애 상황 대응 테스트

>[!info] 포인트
>서비스 실행 → **서비스 안정성 확보**  
>Pod 단위 확장 및 복구

#### 6. [운영 자동화 및 외부 접근/보안 확장](Project/BC_Proj_Onprem/06_CICD.md)

**목표**
- 운영 자동화 + 외부 접근 + 보안 + 검증 포함

**수행 내용**
- ArgoCD 기반 GitOps 구축
- Helm 기반 배포 구조
- cert-manager 기반 HTTPS 구성
- Cloudflare Tunnel 외부 노출
- 3-Tier vs 개선 아키텍처 비교 환경 구성
- Grafana 통합 대시보드 구성

>[!info] 포인트
>수동 운영 → **GitOps 자동화**  
>내부 서비스 → **외부 접근 가능 서비스**  
>단일 구조 → **비교 가능한 아키텍처**