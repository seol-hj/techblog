---
title: Kubernetes의 권한
draft: false
date: 2026-03-04
updated: 2026-03-04
tags:
  - Containers
  - Kubernetes
  - RBAC
  - ServiceAccount
---
### 쿠버네티스의 API 요청 처리

```
 Authentication (인증)  
 Authorization (인가)  
 Admission Control
```

1. Authentication (인증)
	- 목적 : 누구인지 식별
	- 방식 : Client Certificate, Bearer Token, Service Account Token, OIDC, Webhook
	- API Server 처리
		- 누구인지 확인 후 내부적으로 `system:serviceaccount:<namespace>:<sa-name>` 표현

2. Authorization (인가)
	- 목적 : 권한 확인
	- 인가 모듈 종류 : RBAC (가장 일반적), ABAC, Webhook, Node Authorizer

---

## RBAC (Role Based Access Control)

- 구성요소
	```
	Role  
    ClusterRole  
    RoleBinding  
    ClusterRoleBinding
	```

#### Role (네임스페이스 단위 권한 정의)

- 특정 네임스페이스 안에서 어떤 리소스에 어떤 작업 허용할지 정의
- 특징 : 
	- namespace 범위
	- 권한 정의만 함
	- 계정과 직접 연결 X

- 내부 구조
	```
	rules:  
    - apiGroups:  
	  resources:  
	  verbs:
	```

**apiGroups** : 리소스가 속한 API 그룹

| 리소스         | apiGroup            |
| ----------- | ------------------- |
| pods        | "" (core)           |
| services    | ""                  |
| deployments | "apps"              |
| ingresses   | "networking.k8s.io" |
- core 그룹은 반드시 `""` 로 작성

**resources** : 접근할 리소스 이름
- ex) `resources: ["pods", "services"]`

**verbs** : 수행 가능한 동작

| verb   | 의미    |
| ------ | ----- |
| get    | 단일 조회 |
| list   | 목록 조회 |
| watch  | 변경 감시 |
| create | 생성    |
| update | 수정    |
| patch  | 일부 수정 |
| delete | 삭제    |

> Role은 권한 정의서
> Role만 생성 시 아무일도 안일어남
> → Binding 있어야 한다


#### ClusterRole (클러스터 범위 권한 정의)

- 네임스페이스를 초월하는 권한 정의
- ex) nodes 접근, cluster-wide 조회, CRD 접근, 여러 namespace 공통 권한
- 특징 : 
	- ClusterRoleBinding으로 클러스터 전체 적용
	- RoldBinding으로 특정 namespace에만 적용

#### RoleBinding (권한 연결 객체)

- Role 또는 ClusterRole을 특정 계정(User/Group/ServiceAccount)에 연결하는 객체
- if) Binding 이 없으면 → 권한 적용 X
- 구조
	```
	subjects:  
	- kind:  
	  name:  
	roleRef:  
	  kind:  
	  name:
	```

**subjects** : 권한 부여 대상

| kind           | 설명      |
| -------------- | ------- |
| User           | 외부 사용자  |
| Group          | 사용자 그룹  |
| ServiceAccount | Pod용 계정 |

**roleRef** : 연결할 권한 정의 객체
- Role
- ClusterRole

#### ClusterRoleBinding

- ClusterRole을 클러스터 전체 범위로 연결
- ex) `kind: ClusterRoleBinding`
	- namespace 필드 X → 전체 클러스터 적용

---

## ServiceAccount

- Pod가 Kubernetes API에 접근할 때 사용하는 계정
- Namespace 단위로 존재
- 확인 : `kubectl get sa -n dev`

- 동작
	- Pod가 생성 시
		1. ServiceAccount 지정
		2. API Server가 토큰 생성
		3. 토큰이 Pod 내부에 자동 마운트
	- 경로 : `/var/run/secrets/kubernetes.io/serviceaccount/`
	- 포함 파일
		- token
		- ca.crt
		- namespace

- `automountServiceAccountToken` : `automountServiceAccountToken: false`
	- 필요 없으면 차단 가능
	1. ServiceAccount 레벨 (기본값)
		```
		apiVersion: v1  
		kind: ServiceAccount  
		metadata:  
		  name: build-robot  
		  namespace: resource-lab  
		automountServiceAccountToken: false  # 이 SA를 쓰는 Pod는 기본적으로 토큰 마운트 안 함
		```
	2. Pod 레벨 (개별 설정)
		```
		apiVersion: v1  
		kind: Pod  
		metadata:  
		  name: my-pod  
		  namespace: resource-lab  
		spec:  
		  automountServiceAccountToken: false  # 이 Pod 내부에 토큰 파일을 생성하지 않음  
		  containers:  
		  - name: my-container  
		    image: nginx
		```
		- 특정 Pod 하나에만 적용 or ServiceAccount의 설정 무시 & 개별적으로 강제하고 싶을 때 사용
		- `spec` 바로 아래 위치

---

#### 권한 검증 및 삭제

| **명령어**        | **용도**               | **권장 상황**           |
| -------------- | -------------------- | ------------------- |
| `can-i --as`   | 특정 액션 가능 여부 즉시 확인    | 설정 직후 빠른 검증 시       |
| `can-i --list` | 사용자의 전체 권한 범위 확인     | 권한 누락이나 과다 부여 확인 시  |
| `describe`     | Role과 User의 연결 관계 확인 | 설정값이 꼬였을 때 디버깅용     |
| `--kubeconfig` | 실제 환경과 동일한 테스트       | 최종 배포 전 사용자 경험 확인 시 |

| **구분**                 | **범위 (Scope)** | **대상 자원**                   | **주요 용도**           |
| ---------------------- | -------------- | --------------------------- | ------------------- |
| **Role**               | Namespace      | Pod, Service 등 NS 내 자원      | 팀별/프로젝트별 권한 격리      |
| **RoleBinding**        | Namespace      | Role/ClusterRole을 특정 NS에 연결 | 특정 방 안에서만 놀 수 있게 허용 |
| **ClusterRole**        | Cluster        | Node, PV, 모든 NS의 Pod 등      | 관리자 권한, 인프라 자원 관리   |
| **ClusterRoleBinding** | Cluster        | ClusterRole을 클러스터 전체에 연결    | 클러스터 전체 통행증 발급      |

---

#### 설계 원칙

1. 최소 권한 원칙
	- `*` 사용 금지
	- cluster-admin 남발 금지
	- namespace 분리 활용

2. 권한 설계 순서
	```
	1. 계정 정의  
	2. 필요한 리소스 정의  
	3. 필요한 verbs 정의  
	4. namespace 범위 결정  
	5. Binding 연결  
	6. can-i 검증
	```

>[!summary]
>Role → namespace 권한 정의
>ClusterRole → 클러스터 범위 권한 정의
>RoleBinding → namespace 내 권한 연결
>ClusterRoleBinding → 클러스터 전체 연결
>ServiceAccount → Pod 전용 계정

