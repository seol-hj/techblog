---
title: 서비스 고도화 (HPA 오토 스케일링, 모니터링, CI/CD 구축)
draft: false
date: 2026-03-10
updated: 2026-03-10
tags:
  - Kubernetes
  - VM
  - HPA
  - Monitoring
  - Prometheus
  - Grafana
  - GitHub Actions
---

>[!info] 목표  
>Backend에 **HPA 기반 오토스케일링**  
>**Prometheus + Grafana** 기반 모니터링 대시보드 구성  
>**GitHub Actions** 기반 CI/CD 자동 배포 구축

최종 아키텍처
```
User
 ↓
Cloudflare Tunnel
 ↓
HTTPS
 ↓
Ingress
 ↓
Frontend
 ↓
Backend API
 ↓
Redis / PostgreSQL
 ↓
Prometheus / Grafana
 ↓
GitHub Actions CI/CD
```

#### 남은 작업

1. **HPA 오토스케일링 설정**
	- Backend Deployment에 HPA 적용
	- CPU 기준 오토스케일링 설정
	- scale out / scale in 동작 확인

2. **모니터링 구성**
	- `kube-prometheus-stack` 설치
	- Prometheus + Grafana 대시보드 구성
	- CPU / Memory / Pod 상태 / HPA 변화 시각화

3. **CI/CD 구축**
	- GitHub Actions 워크플로우 작성
	- 코드 Push 시
		- Docker 이미지 빌드
		- Docker Hub push
		- Helm upgrade 자동화

---

## HPA Auto Scaling

>**HPA** → Deployment 같은 워크로드의 Pod 개수를 자동으로 늘리거나 줄여줌

구조
`Pod -> kubelet -> metrics-server -> Metrics API -> HPA controller -> Deployment replicas 조정`

- Backend Deployment에 requests/limits 가 반드시 필요
- 현재 사용량 / requested CPU 비율 기준 계산

1. metrics-server 이 있는지 확인

```
kubectl get deployment -A | grep metrics-server
kubectl get apiservice | grep metrics.k8s.io
```

```
kubectl top nodes
kubectl top pods -n game
```
- `kubectl top` : metrics-server 있어야 동작

- 처음에 미리 설치 완

2. Backend Deployment resources 부분

![208](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-6.png)

- `values.yaml`에 작성 완

3. HPA 매니페스트 작성
- `autoscaling/v2` 추천
- Deployment/StatefulSet 대상 replicas 조정

- 기존 `minReplicas: 1` → `minReplicas: 2`로 변경
	- 가용성 목적

3. Helm Chart에 HPA 추가

- `backend-hpa.yaml`로 작성 완

- behavior 추가

![273](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-7.png)

배포 전 렌더링 확인 :
```
helm lint ./charts/game
helm template game ./charts/game -n game
```
- `helm lint`, `helm template --debug`, `helm install --dry-run --debug`로 템플릿 검증
- 기본 디버깅 방법


적용 : `helm upgrade --install tetris ./helm/tetris -n game`

확인 : `kubectl get hpa -n game`

![495](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-8.png)

>[!info] Tip
>**HPA 대상 Pod에 liveness/readiness probe 설정 필**    
>**CPU request를 너무 작게 잡기 X**  
>부하 테스트는 Backend Service 주소 기준  

---

## Kubernetes 모니터링

> 크게 두 층  
> 1. 클러스터 계층  
> → Node 상태, Pod 상태, CPU / Memory / Network, HPA / Deployment 상태  
> 2. 애플리케이션 계층  
> → FastAPI 응답 시간, 에러율, Redis / PostgreSQL 성능, 요청량  

- `kube-prometheus-stack` 사용
	- Prometheus Operator 중심
	- Prometheus, Alertmanager, Grafana, exporters, rules, dashboards 묶은 차트


1. `kube-prometheus-stack` Helm 설치

Helm repo 추가 : 
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

![468](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311-4.png)

네임스페이스 생성 :
```
kubectl create namespace monitoring
```

![465](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311-5.png)

설치 :
```
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring
```

- Prometheus Operator 기반
- Prometheus / Grafana / Alertmanager / 기본 규칙과 대시보드 포함


2. `values.yaml` 수정

- 로컬 VM 환경 persistent volume과 서비스 노출 방식 명확히
```
grafana:
  adminUser: admin
  adminPassword: strong-password
  service:
    type: ClusterIP
  persistence:
    enabled: true
    size: 5Gi

prometheus:
  prometheusSpec:
    retention: 15d
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 20Gi

alertmanager:
  alertmanagerSpec:
    storage:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 5Gi
```

적용 :
```
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  -n monitoring -f monitoring-values.yaml
```

![471](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311-6.png)

**`values.yaml`관리할 때 경로 설정**

기본적으로 경로설정이 다름
- 차트 경로 : `helm upgrade --install <release명> <chart경로>`
- values 파일 경로 : `-f <values파일경로>`


상태 확인 :
```
kubectl get pods -n monitoring
kubectl get svc -n monitoring
```


**Prometheus 구조 요약**

- **Exporter / kube-state-metrics / node-exporter / kubelet** → 메트릭 노출
- **Prometheus** → scrape
- **Prometheus TSDB 저장**
- **Grafana** → Prometheus 데이터 소스로 조회
- **Alertmanager** → 알림

`kube-prometheus-stack` =
- `prometheus-operator`
- `prometheus` → 수집/저장
- `alertmanager`
- `grafana` → 시각화
- `kube-state-metrics` → Deployment, Pod, HPA, StatefulSet 같은 Kubernetes object 상태
- `node-exporter` → 노드 CPU / Memory / Disk
- 포함


3. **Grafana 접속**
- 접속하는 다양한 방식 존재
- 포트포워딩 사용
```
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

이후 브라우저 접속 : `http://localhost:3000`
- 로그인 계정은 설치 시 넣은 `adminUser`, `adminPassword` 사용

if) Password 를 values로 안넣었으면 Secret 확인
```
kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 -d
echo
```

Prometheus 접속 : 
```
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
```

**Kubernetes 기본 대시보드**

Grafana 로그인 후 확인 가능 대시보드 :
- Kubernetes / Compute Resources / Node, Pod, Namespace (Pods)
- Kubernetes / Networking, API server
- Kubernetes / Views / Nodes, Pods

위 대시보드로
- 노드 별 CPU / Memory 사용량
- 네임스페이스 별 Pod 사용량
- 특정 Pod의 CPU / Memory 추이
- 재시작 횟수
- Pending / CrashLoopBackOff 여부


4. 테스트

- Pod / Node 모니터링
	- Grafana에서 Node 대시보드 열기
	- Worker Node 2대의 CPU / Memory 그래프 확인
	- `game` namespace의 Pod 그래프 확인

- HPA / CPU / Memory 모니터링
	- 기본 대시보드로도 확인은 가능
	- HPA 상태는 `kube-state-metrics` 기반 메트릭으로 패널 생성이 권장

`sum(rate(container_cpu_usage_seconds_total{namespace="game", pod=~"game-backend.*"}[2m])) by (pod)`
`sum(container_memory_working_set_bytes{namespace="game", pod=~"game-backend.*"}) by (pod)`
`kube_deployment_status_replicas{namespace="game", deployment="game-backend"}`
`kube_horizontalpodautoscaler_status_current_replicas{namespace="game", horizontalpodautoscaler="game-backend-hpa"}`
`kube_horizontalpodautoscaler_status_desired_replicas{namespace="game", horizontalpodautoscaler="game-backend-hpa"}`


이외 권장 사항
1. Prometheus / Grafana PVC 사용
2. 모니터링은 `monitoring` namespace 분리
3. Grafana는 처음엔 port-forward, 이후 Cloudflare Tunnel 뒤에서 Ingress 노출
4. Alertmanager는 이후 Slack/Discord/Webhook 알림 연결

---

## GitHub Actions 기반 CI/CD

흐름
1. GitHub에 push
2. GitHub Actions가 Docker 이미지 build
3. Docker Hub push
4. 배포 서버 또는 Control Plane에서 `helm upgrade --install`
5. Deployment 이미지 태그 변경으로 롤링 업데이트

- Deployment 는 Pod template이 바뀔 때만 새로운 rollout revision이 생성
- 이미지 태그 변경은 rollout을 발생시키는 대표 사례

>핵심  
>이미지 태그 명확히 관리  
>Helm values에서 이미지 tag 변경  
>helm upgrade로 반영  
>롤링 업데이트 상태 확인

- 설정 방식으로는 두 가지 존재
	1. GitHub Actions가 kubeconfig로 클러스터에 직접 배포
		- 가장 단순
		- 구현 쉽고 바로 동작 가능
		- But, GitHub Actions 러너가 클러스터 API에 접근 가능해야 함
		- kubeconfig를 GitHub Secret으로 안전하게 관리해야 함

	2. GitHub Actions는 이미지까지만 푸시, 배포는 내부 배포 서버가 수행
		- 더 안전
		- 구성 복잡도는 상승

초기 → 1번 방식 사용 / 이후 self-hosted runner 또는 GitOps(ArgoCD/Flux)로 옮기는 게 좋음

