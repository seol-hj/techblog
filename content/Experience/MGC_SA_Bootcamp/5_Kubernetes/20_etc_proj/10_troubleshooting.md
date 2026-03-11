---
title: 트러블슈팅
draft: false
date: 2026-03-10
updated: 2026-03-10
tags:
  - Kubernetes
  - VM
  - Helm
---

## 문제 1.

> Frontend Docker File 에 작성된 환경 변수 값이 내부적으로 중복되어 충돌

- 기존 `BACKEND_HOST: backend`, `BACKEND_PORT: 8000`으로 되어있던 부분을
- → 전부 `API_~` 로 변경하여 해결

---

## 문제 2.

> `postgres`가 `Pending` 상태  
> `PVC Pending` + `postgres Pending`

→ **스토리지 바인딩 문제** 라고 생각

`postgres-statefulset.yaml`에서 `storageClassName: local-storage`를 사용했으나
실제 클러스터에 StorageClass 에 맞는 PV 가 존재하지 않아 발생

`kubectl describe` 결과 적절한 PV를 찾지 못하는 `FailedScheduling` 확인
현재 클러스터에 Dynamic PRovisioner가 없어서 로컬 디스크 경로를 사용하는 PV를 직접 생성하여 PVC 와 Bound 시킴으로 해결

- 방법 1 - 수동 생성 (Static Provisioning)
	- 미리 PV를 만들어 주었음
	- 단점 : PVC 가 늘어날 때마다 관리가자 매번 PV를 직접 생성해줘야해서 확장성이 떨어짐

`postgres-pv.yaml`

```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: local-storage
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data/postgres
```

적용 : `kubectl apply -f postgres-pv.yaml`

확인 : `kubectl get pv` `kubectl get pvc -n game`

결과

![572](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310.png)

- 개선 방법 2 - 동적 할당 (Dynamic Provisioning)
	- PVC 가 요청하면 쿠버네티스가 StorageClass를 보고 Cloud(AWS, GCP)나 온프레미스 스토리지(NFS)에서 자동으로 PV 생성 방식
	- 장점 : 관리자 개입 X
	- 단계
		1. **Provisioner 설치** : NFS-Client Provisioner
		2. **StorageClass 설정** : `is-default-class: "true"` 추가하여 기본 스토리지 클래스로 지정

---

## 문제 3.

>`backend CrashLoopBackOFF` 상태

- 위 <문제 2.> 에서 발생한 Postgres가 안떠서 발생했다고 생각
- DB 연결 실패
- Redis 연결 실패
- 환경 변수 이름 불일치

→ <문제 2.> 해결 후 로그 확인하면서 기다리니 살아남

pod 이름 확인 : `kubectl get pods -n game`

로그 확인 : `kubectl logs <backend-pod-name> -n game --previous`

---

## 문제 4.

>`frontend CrashLoopBackOff` 상태

- nginx 설정 파일 문제
- 프론트 이미지 문제
- 환경 변수 이름 충돌 문제 - <문제 1.>

- 해결 : 
1. `frontend/nginx.conf.template`의 `BACKEND_~` 환경 변수 명 → `API_~` 변경
2. 이미지 다시 빌드 : `docker build -t tetris-frontend ./frontend`
3. Docker Hub에 다시 태그/푸시 : `docker tag tetris-frontend hj2346/tetris-frontend:1.1(업데이트)` → `docker push hj2346/tetris-frontend:1.1(업데이트)`
4. `values.yaml` 이미지 태그 `tag: "1.1"`로 수정
5. Helm 업그레이드 : `helm upgrade --install tetris ./helm/tetris -n game`

- 해결 된 줄 알았으나 여기서 <문제 5.> 발생

---

## 문제 5.

>시간이 지나도 frontend pod가 `ContainerCreating` 에서 진행이 안됨

로그 확인 : `kubectl get pod <frontend-pod-name> -n game -w`

로그를 확인해보니
- frontend 코드 문제 X
- nginx 문제 X
- **k8s-w2 노드에서 Calico CNI가 API 서버에 인증 실패**
- → Pod sandbox 생성 X 멈춤

확인 : `journalctl -u kubelet -n 100 --no-pager`
- `kube-root-ca.crt` ConfigMap 존재 X
- `k8s-w2`노드의 Calico 인증 실패

해결 :
- 현재 Calico 리소스 상태 확인
```
kubectl get pods -n kube-system | grep calico
kubectl get daemonset -n kube-system calico-node
kubectl get deployment -n kube-system calico-kube-controllers
```

- Calico 파드만 재시작
```
kubectl delete pod -n kube-system -l k8s-app=calico-node
kubectl delete pod -n kube-system -l k8s-app=calico-kube-controllers
```

- 새 Pod 다시 생성
```
kubectl delete pod -n game -l app=frontend
kubectl delete pod -n game -l app=backend
```

---

## 문제 6.

>`docker-compose up --build -d` 로 로컬 서비스 검증 시 frontend `Unhealthy`

- Nginx 템플릿 오류
`nginx.conf.template` 파일 내부 `${API_HOST}` 같은 변수 표현식 문법 충돌

해결 :
- `docker-compose.yml`에서 `frontend`의 `healthcheck` 주석처리
- `docker-compose.yml`의 환경 변수 오타 수정

---

## 문제 7.

> Ingress controller 의 yaml 파일을 로컬에서 관리하여    
> `NodePort`가 아니고 `LoadBalancer`로 설정을 영구화 할 수 있음  

- `kubectl patch`는 임시 방편

방법
1. 파일 다운로드 : `curl -o ingress-nginx-deploy.yaml https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml`

2. 파일 수정

`ingress-nginx-deploy.yaml` 파일을 열어서 `kind: Service` 이고 `name: ingress-nginx-controller` 부분을

```
# ingress-nginx-deploy.yaml 수정
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: LoadBalancer  # <--- 이 부분을 NodePort에서 LoadBalancer로 수정
```

3. 다시 배포 : `kubectl apply -f ingress-nginx-deploy.yaml`

- 그러나 이번 프로젝트에서는 특별한 수정 사항이 존재하지 않고,
- 추가적인 작성이 필요하지 않으므로 일회성 패치로 영구 사용

---

## 문제 8.

> Monitoring에서  
> Prometheus/Grafana/Alertmanager → PVC 생성 → 바인딩할 StorageClass/PV 존재 X → Pending

해결 : 
`local-path-provisioner`을 설치해 PVC가 자동으로 PV에 바인딩 되게 만듦

흐름 : `Prometheus/Grafana/Alertmanager → PVC 생성 → local-path StorageClass 사용 → local-path-provisioner가 PV 자동 생성 → Bound → Pod Running`

- 직접 PV를 하나씩 만들기 X → 프로비저너가 자동으로 처리하게 만듦