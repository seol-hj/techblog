---
title: Helm
draft: false
date: 2026-03-04
updated: 2026-03-04
tags:
  - Containers
  - Kubernetes
  - Helm
---

- 쿠버네티스에서 애플리케이션 배포 시 여러 리소스 (Deployment, Service, ConfigMap, Secret, Ingress 등) 작성 필요
	- 리소스가 늘어나면
		- YAML 파일이 너무 많아짐
		- 환경별 (dev/stage/prod) 설정 값만 바꿔야 하는데 YAML을 복사해서 관리하게 됨
		- 업그레이드/롤백 시점 관리가 어려워짐
		- 배포 표준화가 깨짐
- → Helm은 **패키지(Chart) + 변수(values) + 버전(release revision)** 으로 해결

#### 용어

1. **Chart** : 쿠버네티스 매니페스트 탬플릿 묶음
	- `templates/` : Deployment/Service 등의 탬플릿 YAML이 들어감
	- `values.yaml` : 탬플릿에 주입할 기본 변수 값
	- `Chart.yaml` : 차트 메타정보(이름/버전/설명 등)

2. **Release** : 차트를 특정 클러스터/네임스페이스에 설치한 실제 배포 인스턴스
	- 같은 Chart라도 Release이름이 다르면 서로 다른 배포로 관리
	- ex) chart: bitnami/nginx / release: `nginx-dev`, `nginx-prod`

3. **Repository** : 차트 저장소 (apt같은 패키지 저장소와 유사)

#### 확인

`helm version`
- Helm 클라이언트 설치 확인

`kubectl get nodes`
- Helm은 쿠버네티스 API 통해 리소스 생성
- kubectl이 정상 동작해야 Helm도 정상 동작

ex) `helm repo add bitnami https://charts.bitnami.com/bitnami`
- `repo add` : 원격 차트 저장소를 로컬 Helm에 등록
- `bitnami` : 저장소 별칭(alias), 이후 `bitnami/nginx` 형태로 참조
- URL : 실제 차트 인덱스가 있는 저장소 주소

`helm repo list`
- 로컬에 등록된 repo 목록 확인

`helm repo update`
- repo의 index 정보를 최신으로 갱신

`helm search repo nginx`
- repo에 있는 차트 키워드 검색
- `bitnami/nginx` 같은 결과를 확인

ex) **Helm으로 Nginx 설치**
`helm install nginx bitnami/nginx -n nginx --create-namespace`
- `install` : 차트 설치
- `nginx` : release 명 (사용자 정의)
- `bitnami/nginx` : repo/chart 이름
- `-n nginx` : 설치할 네임스페이스 지정
- `--create-namespace` : 네임스페이스 없을 시 자동 생성

- 설치 확인 : `helm list -n nginx`
	- 지정한 namespace의 release 목록 확인
- 리소스 확인 : 
	```
	kubectl get pod -n nginx -o wide  
	kubectl get svc -n nginx  
	kubectl get endpoints -n nginx
	```
	- Pod가 Running 인지 확인
	- Service 타입과 ClusterIP/External-IP 상태 확인
	- Endpoints가 비어 있으면 selector/label 매칭이 깨졌을 가능성 O

- `helm get values nginx -n nginx` : 현재 설치된 release의 values 확인
	- 설치 시 실제 적용된 values (사용자 override 값) 보여줌
- `helm get manifest nginx -n nginx` : 전체 매니페스트 확인
	- 템플릿이 렌더링된 최종 YAML 확인
	- Helm이 실제로 생성한 것 추적할 때 사용
- `helm show values bitnami/nginx > values-nginx-default.yaml`
	- `show values` : 차트의 기본 values.yaml 출력
	- `>` : 표준출력 파일로 저장 (리다이렉션)
- ex)
	```
	service:  
	  type: LoadBalancer  
	    
	  replicaCount: 2
	```
	- `service.type: LoadBalancer` 로 변경 시 MetalLB 같은 LB 환경에서 External-IP (VIP) 할당
	- `replicaCount`로 파드 개수 조절
- `helm upgrade nginx bitnami/nginx -n nginx -f my-values.yaml`
	- `upgrade` : 기존 release를 새로운 설정으로 업데이트
	- `f my-values.yaml` : values 오버라이드 파일 적용
	- `upgrade`는 차트 재설치 X → release revision 증가 + 변경 반영

- `helm rollback nginx 1 -n nginx` : 롤백
	- `rollback` : 특정 revision 상태로 되돌림
	- `1` : 되돌릴 revision 번호
	- 롤백 후에도 revision 하나 더 증가 (롤백 자체 = 새 revision)

- `helm uninstall nginx -n nginx` : 삭제
	- 해당 release가 생성했던 리소스 제거
	- 네임스페이스는 자동 삭제 X
		- `kubectl delete namespace nginx`
			- namespace 삭제 시 내부 리소스 전부 삭제