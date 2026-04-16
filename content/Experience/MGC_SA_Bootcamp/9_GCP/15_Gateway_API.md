---
title: GKE Service & Gateway API
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - GCP
  - GKE
  - Kubernetes
  - Gateway API
---

### Kubernetes Service 노출 방식

**Cluster IP**
- 클러스터 내부 전용
- 외부 직접 접근 불가
- 서비스 간 내부 통신용

**NodePort**
- 각 노드의 특정 포트를 열어 외부 접근 가능
- 운영형 구조로는 다소 거칠고 직접적
- 테스트용

**LoadBalancer Service**
- 클라우드 로드밸런서를 붙이는 방식
- 단일 서비스 노출에는 직관적
- 복잡한 라우팅, 역할 분리, 고급 정책은 한계점 존재

### Ingress

여러 서비스 앞에 하나의 HTTP(S) 진입점
호스트/경로 기반 라우팅 구성

- 여러 서비스를 하나의 진입점 뒤로 숨김
- 경로 기반 라우팅 가능
- TLS 설정 가능
- 애플리케이션 외부 노출 구조를 단순화

한계
- 역할 분리가 명확 X
- 고급 정책 확장에 제약
- 구현이 컨트롤러별로 달라짐
- 각 팀간의 책임을 분리해 표현 어려움

## Gateway API

- Ingress 보다 더 구조적이고 역할 분리 가능한 API
- 진입점(Gateway)과 라우팅(HTTPRoute 등) 분리
- 각 팀별 리소스 나누기 쉬움
- GKE에서 Google Cloud Load Balancer와 연결

#### Gateway API 핵심 리소스

1. **GatewayClass** : 어떤 종류의 Gateway를 어떤 구현체가 처리할 것인가
	- StorageClass, IngressClass 유사
	- GKE에서
		- GKE Gateway controller가 이해하는 클래스 사용
		- 외부/내부 Application Load Balancer 종류와 연결

2. **Gateway** : 실제 트래픽 진입점
	- 역할 : 어떤 포트, 프로토콜, 리스너, Route 붙을지 결정
	- Ingress 보다 더 명시적인 진입 장치

3. **Listener** : Gateway가 요청 받는 방식 정의
	- 외부에서 들어오는 요청을 어떤 포트/프로토콜/호스트 기준으로 받을지 결정

4. **HTTPRoute** : 들어온 HTTP 요청을 어떤 서비스로 어떻게 보낼지 정의
	- 경로 기반 / 호스트 기반 라우팅, 백엔드 서비스 연결, 일부 정책 적용
	- Ingress의 URL routing rules를 더 구조적으로 분리

#### Ingress vs Gateway API

**Ingress**
- 한 리소스 안에 진입과 라우팅 포함
- 단순, 익숙
- 앱 중심 관점에서 보기 쉬움

**Gateway API**
- 진입점(Gateway)과 라우팅(HTTPRoute) 분리
- 역할 기반 분리 쉬움
- 정책과 운영 모델이 더 명확
- 각 팀간 협업에 유리

>Ingress → 서비스를 노출하는 입구  
>Gateway API → 운영 가능한 트래픽 진입 구조

#### 역할 분리

운영 환경에서 모든 팀이 하나의 Ingerss 리소스 점검시 충돌
Gateway API는 더 잘 분리 가능

ex)
Prod Team / Network Team
- GatewayClass 정의
- Gateway 생성
- 외부 진입 정책 관리
- TLS와 공통 정책 관리

APP Team
- HTTPRoute 작성
- 경로와 서비스 정의
- 앱 단위 라우팅 룰 제출

#### GKE에서 Gateway API

GKE에서 Gateway API 리소스 적용
→ GKE Gateway controller이 읽고
→ 적절한 Google Cloud Load Balancer 생성/갱신

- Kubernetes 리소스 작성
- GKE가 Google Cloud 로드밸런서 조정

- Gateway API는 쿠버네티스 객체 / But, GKE에서 클라우드 로드밸런서까지 제어하는 인터페이스

>GKE에서 Gateway API → 단순 Ingress 대체제 X  
>운영 가능한 트래픽 진입 구조 설계하는 핵심 도구