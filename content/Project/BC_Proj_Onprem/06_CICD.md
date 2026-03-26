---
title: 운영 자동화 및 외부 접근/보안 확장
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - ArgoCD
  - HTTPS
  - Cloudflare Tunnel
---

>[!info] 목표
>배포 자동화 (GitOps), HTTPS 보안, 외부 접근 (Cloudflare), 아키텍처 비교 검증  
>**실제 운영 환경 수준의 서비스 구조 완성**

## 수행 내용

- GitOps 기반 CI/CD 구축
	- `ArgoCD` 설치
	- Git Repository 연동
	- Helm Chart 기반 배포 구조 구성
	- Git Push 시 자동 배포 (Sync) 구성

- HTTPS 인증 자동화 (cert-manager)
	- cert-manager 설치
	- ClusterIssuer 생성
	- Certificate 리소스 생성
	- TLS Secret 자동 생성
	- Ingress에 TLS 적용

- Cloudflare Tunnel 기반 외부 접근
	- Cloudflare Tunnel 구성
	- Ingress와 연결 → 외부 접근 가능
	- 공인 IP X → HTTPS 기반 접근 구현
		- 구조 : `User → Cloudflare → Tunnel → Ingress → Service`

- 아키텍처 비교 환경 구성
	- 기존 3-Tier 구조 서비스 구성
	- Kubernetes 기반 개선 아키텍처 구성
	- 두 구조를 동일 환경에서 운영

- Grafana 통합 대시보드 구성
	- 3-Tier vs 개선 구조 비교 대시보드 구성
	- 주요 지표 시각화
		- CPU / Memory
		- 요청 처리량
		- Queue 적체 상태
		- Worker 처리 속도
---

## CI/CD 구축 및 운영 자동화

#### 배경 및 도입 이유

수동 배포 환경에서는 서버 직접 접속 → 명령 실행 방식으로 인해 휴먼 에러와 환경 불일치가 빈번히 발생한다. ArgoCD 기반 GitOps를 도입하여 Git 저장소를 단일 진실 공급원(Single Source of Truth)으로 삼는 선언적 배포 체계를 구축하였다.

#### 배포 흐름

```
코드 Push → Git 저장소 → ArgoCD 감지
→ Helm Chart 렌더링 → Kubernetes API 적용 → Pod 롤링 업데이트
```

 CI/CD 파이프라인은 GitOps 방법론을 기반으로 구성하였다. Git 저장소가 인프라 및 애플리케이션 배포 상태의 단일 진실 공급원(Single Source of Truth)으로 기능하며, 저장소의 상태가 곧 클러스터의 목표 상태(Desired State)를 의미한다.
 이 흐름에서 개발자는 코드를 Git에 Push하는 것만으로 배포가 완료된다. 수동으로 kubectl 명령을 실행하거나 서버에 직접 접근하는 과정이 완전히 제거된다.

#### Helm Chart 구조

 각 서비스(Frontend, Backend, Worker)는 독립적인 Helm Chart로 패키징된다. Helm Chart는 Deployment, Service, HPA, ConfigMap, Secret 리소스를 포함하며, 환경별(개발/스테이징/프로덕션) values.yaml을 통해 동일한 Chart를 다른 환경에 일관되게 적용할 수 있다.
 Helm을 선택한 이유는 Kubernetes 리소스의 패키징 표준화, 버전 관리를 통한 롤백 용이성, 그리고 values.yaml을 통한 환경별 구성 분리가 가능하기 때문이다.

#### ArgoCD 자동 배포

 ArgoCD는 Git 저장소를 주기적으로 폴링하여 클러스터의 현재 상태와 저장소의 목표 상태를 비교한다. 차이(Diff)가 감지되면 자동 또는 수동 승인을 거쳐 클러스터에 변경 사항을 동기화한다.
 ArgoCD UI를 통해 배포 이력, 현재 상태, 차이점을 시각적으로 확인할 수 있어 운영 가시성이 크게 향상된다.

#### Before vs After : CI/CD

| 구분     | Before (기존)      | After (개선)              | 개선 효과                  |
| ------ | ---------------- | ----------------------- | ---------------------- |
| 배포 방식  | 서버 직접 접속 후 수동 배포 | Git Push → ArgoCD 자동 배포 | 배포 시간 60~90% 단축        |
| 배포 일관성 | 담당자별 배포 방법 상이    | Helm Chart 기반 표준화       | 인적 오류 최소화              |
| 롤백     | 이전 버전 수동 복원      | ArgoCD UI 원클릭 롤백        | 장애 복구 시간 단축            |
| 배포 이력  | 별도 문서화 필요        | Git 커밋 이력 자동 추적         | 감사 추적(Audit Trail) 자동화 |

#### 설정 과정

- ArgoCD 설치 및 대시보드 활용
![512](Project/BC_Proj_Onprem/img/20260326-14.png)

![](Project/BC_Proj_Onprem/img/20260326-15.png)

---
## 결과

- ArogCD 기반 GitOps 도입
	- → **배포 시간 90% 단축**
	- → **배포 오류율 감소 (수동 배포 대비)**

- cert-manager 기반 HTTPS 자동화
	- → **인증서 관리 작업 100% 자동화**

- Cloudflare Tunnel 적용
	- → **공인 IP 없이 외부 접근 가능 (보안 노출 100% 감소)**

- HTTPS 적용
	- → **평문 통신 제거 (보안 수준 향상)**

- 3-Tier vs 개선 구조 비교 결과
	- → **트래픽 처리 안정성 증가 (에러율 감소)**
	- → **리소스 사용 효율 개선**

>ArgoCD → GitOps 기반 CI/CD  
>배포 과정 자동화 및 운영 일관성 확보  
>cert-manager → HTTPS 인증 자동화  
>Cloudflare Tunnel → 외부 접근 구성  
>보안성 및 접근성 동시 만족 구조  
>기존 3-Tier 아키텍처 vs 개선 구조 동일 환경 비교  
>Grafana 대시보드로 시각화  
>**데이터 기반 아키텍처 개선 효과 검증 환경 구축**