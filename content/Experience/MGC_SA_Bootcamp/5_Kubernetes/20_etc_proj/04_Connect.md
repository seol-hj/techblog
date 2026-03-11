---
title: 트래픽 제어 및 외부 노출
draft: false
date: 2026-03-10
updated: 2026-03-10
tags:
  - Kubernetes
  - VM
  - Ingress Controller
  - MetalLB
---

>[!info] 목표  
>외부 사용자가 Kubernetes 애플리케이션에 접근할 수 있도록  
>**Ingress + LoadBalancer(MetalLB)** 구조 구성  


#### 현재 상태

- Helm 차트로 리소스 생성 성공
- 앱 컨테이너 정상 가동 성공
- DB/Redis 연결 성공

#### 진행 내용

- Ingress / MetalLB 외부 노출
- 서비스 동작 검증
- HPA 확인
- Prometheus/Grafana 설치

---

## 1. 서비스 검증

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`

Docker Compose 로 한 번에 실행
`docker-compose up --build -d`

## 2. Ingress 확인

```
kubectl get ingress -n game
kubectl describe ingress -n game
```

![502](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-1.png)

Ingress-nginx 상태 확인

```
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```
- Ingress-nginx controller pod = `Running`
- service 에 `EXTERNAL_IP` 확인

![](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-2.png)

if) `EXTERNAL_IP` = `<none>` 일때
- ingerss-nginx service 가 `LoadBalancer` 타입
- ingress-nginx service 타입 확인 : `kubectl get svc -n ingress-nginx`
- 타입 변경
```
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"LoadBalancer"}}'
```

## 3. MetalLB 확인

`kubectl get svc -A`
- Ingress-nginx 서비스가 `EXTERNAL-IP`를 받았는지 확인

## 4. 접속 테스트

- host 파일 수정

Ingress host 가 `tetris.local` → 로컬 PC 에서 해당 도메인을 `192.168.80.200(EXTERNAL_IP)` 보도록 수정

Windows의 `C:\Windows\System32\drivers\etc\hosts` 파일 아래
`192.168.80.200 tetris.local` 추가

브라우저에서 `http://tetris.local` 접속 성공하면
- frontend 화면
- frontend가 backend API 호출

성공 시
- 외부 공개 X / 내부망 (LAN) 접속 성공

![](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-3.png)

![](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-4.png)

## 5. 외부 접속

- 외부에서 접속하기 위해선 **공인 IP 필요**
- 여러가지 방법이 존재
	- 공유기 포트포워딩
	- Cloudflare Tunnel
- 해당 방법을 전부 정리하지만 Cloudflare Tunnel 사용할거임

#### 방법 1. 공유기 포트포워딩

1. 공유기 관리자 페이지 접속

2. 포트포워딩 규칙 추가
http :

| **항목** | **설정값**        |
| ------ | -------------- |
| 서비스 이름 | tetris-http    |
| 외부 포트  | 80             |
| 내부 IP  | 192.168.80.200 |
| 내부 포트  | 80             |
| 프로토콜   | TCP            |

https :

| **항목** | **설정값**        |
| ------ | -------------- |
| 서비스 이름 | tetris-https   |
| 외부 포트  | 443            |
| 내부 IP  | 192.168.80.200 |
| 내부 포트  | 443            |
| 프로토콜   | TCP            |

3. 공인 IP 확인

`https://ifconfig.me`

![](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260310-5.png)

4. 외부 접속
- 같은 wifi X

브라우저에서 `http://공인IP`

5. 도메인 연결

- 여기에도 다양한 방식이 존재한다
- 결국은 `tetris.mydomain.com` → 공인 IP 인것

5. HTTPS 적용

- 이 부분도 어떻게 진행하느냐에 따라 SSL 인증서를 받는 방식이 변경됨
- `cert-manager`, `Let's Encrypt` 등


#### 방법 2. Cloudflare Tunnel

- 공유기 설정 X / 외부 공개

구조
```
Internet
   ↓
Cloudflare
   ↓
Tunnel
   ↓
Kubernetes Ingress (192.168.80.200)
```

장점
- 공유기 설정 필요 X
- 공인 IP 필요 X
- HTTPS 자동

**설정 방법 1. (다른 방법으로 적용 가능)**
1. Cloudflare 계정 + 도메인 필요
- 이미 Cloudflare 에 구매한 도메인이 존재해 그대로 사용

2. cloudflared 설치

 클러스터 노드 하나에서
 ```
 wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
 ```

확인 : `cloudflared --version`

3. 로그인 : `cloudflared tunnel login`

4. 터널 생성 : `cloudflared tunnel create tetris-tunnel`

5. config 파일 생성

`vi ~/.cloudflared/config.yaml`

```
tunnel: tetris-tunnel
credentials-file: /root/.cloudflared/xxxxx.json

ingress:
  - hostname: tetris.yourdomain.com
    service: http://192.168.80.200
  - service: http_status:404
```

6. 터널 실행

`cloudflared tunnel run tetris-tunnel`

→ 외부에서 `https://tetris.mydomain.com` 접속 가능

**설정 방법 2.**

```
                Internet
                    │
                    ▼
          https://tetris.~~~~.kim
                    │
                    ▼
              Cloudflare
         (DNS + TLS + CDN)
                    │
                    ▼
           Cloudflare Tunnel
                    │
                    ▼
         cloudflared (Pod)
            namespace: game
                    │
                    ▼
        Kubernetes Service
        frontend.game.svc.cluster.local
                    │
                    ▼
            Frontend Pod
                    │
                    ▼
              Backend API
                    │
                    ▼
           backend Service
                    │
                    ▼
             Backend Pod
                    │
            ┌───────┴────────┐
            ▼                ▼
         Redis            Postgres
```

1. CP에서 yaml 파일 작성

`cloudflare-tunnel-secret.yaml`

```
apiVersion: v1
kind: Secret
metadata:
  name: tunnel-token
  namespace: game
type: Opaque
stringData:
  TUNNEL_TOKEN: 여기에_토큰
```
- Token을 Secret에 넣음

`cloudflared-deployment.yaml`

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudflared
  namespace: game
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cloudflared
  template:
    metadata:
      labels:
        app: cloudflared
    spec:
      containers:
        - name: cloudflared
          image: cloudflare/cloudflared:latest
          args:
            - tunnel
            - --no-autoupdate
            - run
          env:
            - name: TUNNEL_TOKEN
              valueFrom:
                secretKeyRef:
                  name: tunnel-token
                  key: TUNNEL_TOKEN
          resources:
            requests:
              cpu: "50m"
              memory: "64Mi"
            limits:
              cpu: "200m"
              memory: "256Mi"
```
- remotely-managed tunnel → `cloudflared tunnel run --token ...` 방식으로 실행

2. 적용
```
kubectl apply -f cloudflare-tunnel-secret.yaml
kubectl apply -f cloudflared-deployment.yaml
```

![366](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311-1.png)

3. 확인
```
kubectl get pods -n game
kubectl get deploy -n game
kubectl logs -n game deploy/cloudflared
```

![313](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311.png)
- 정상적으로 Cloudflare 연결

4. Cloudflare 에서 연결
`http://frontend.game.svc.cluster.local:80` 연결

![348](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311-2.png)

5. 외부 접속 성공 및 HTTPS 구현 완료

![461](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260311-3.png)

추가 사항
if) 백엔드가 WebSocket 서버 → Cloudflare Tunnel 에 route 추가 필요
Hostname `api.~~내 도메인~~` → URL `http://backend.game.svc.cluster.local:8000`


>[!info]
>Cloudflare Tunnel을 사용해  
>Kubernetes 클러스터 내부 서비스(Frontend)를 외부에 안전하게 노출  
>별도의 LoadBalancer나 포트 개방 없이 HTTPS 기반으로 접근 가능한 구조 구축  
