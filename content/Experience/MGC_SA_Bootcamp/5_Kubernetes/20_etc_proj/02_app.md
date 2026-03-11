---
title: 테트리스 게임 개발
draft: false
date: 2026-03-05
updated: 2026-03-06
tags:
  - Kubernetes
  - VM
  - Claude Code
  - React
  - FastAPI
  - PostgreSQL
  - Redis
---

### 진행 내용 요약

- **Claude Code로 애플리케이션 생성**
	- React FE
	- FastAPI BE
	- PostgreSQL
	- Redis 연동 구조
	- WebSocket 포함

- **Docker 이미지화**
	- FE Dockerfile
	- BE Dockerfile
	- 이미지 빌드

- **쿠버네티스 설계**
	- Namespace
	- Deployment / StatefulSet
	- Service
	- ConfigMap / Secret
	- PV / PVC
	- ServiceAccount / RBAC
	- Probe
	- HPA
	- Ingress

- **Helm Chart 패키징**
	- templates 분리
	- `values.yaml` 작성
	- 환경값 관리

---

Claude Code 프롬프트
```
나는 Kubernetes 클러스터에 배포할 실시간 웹 게임 서비스를 만들려고 한다.  
  
목표는 Kubernetes 기능을 최대한 활용하는 것이며  
React(FE) + FastAPI(BE) + PostgreSQL + Redis 구조의 애플리케이션을 개발하려고 한다.  
  
아래 요구사항을 기반으로 전체 프로젝트 코드를 생성해줘.  
  
---  
  
# 프로젝트 개요  
  
서비스는 간단한 **테트리스 게임**이다.  
  
구성  
  
- Frontend : React  
- Backend : FastAPI  
- Database : PostgreSQL  
- Cache / Ranking : Redis  
- 통신 : REST API + WebSocket  
  
---  
  
# 기능 요구사항  
  
## 1. 게임 기능  
  
- 브라우저에서 실행되는 테트리스 게임  
- 게임 종료 시 점수 생성  
- 점수 서버 전송  
  
---  
  
## 2. 실시간 랭킹  
  
Redis Sorted Set을 이용하여 랭킹 관리  

ZADD leaderboard <score> <user_id>

  
랭킹 조회 API  

GET /ranking

  
상위 20명 반환  
  
---  
  
## 3. 게임 기록 저장  
  
게임 종료 시  
  
PostgreSQL에 기록 저장  

INSERT INTO game_logs (user_id, score)

  
---  
  
## 4. 사용자 최고 기록 조회  
  
API  

GET /best-score/{user_id}

  
SQL  

SELECT MAX(score) FROM game_logs WHERE user_id=?

  
---  
  
# Backend 요구사항  
  
Framework  
  
FastAPI  
  
구현  
  
- REST API  
- WebSocket endpoint  
- Redis 연결  
- PostgreSQL 연결  
- BackgroundTasks 사용 (DB 기록 비동기 처리)  
  
API 목록  
  
POST /score  
GET /ranking  
GET /best-score/{user_id}  
WS /ws/ranking  
  
---  
  
# Frontend 요구사항  
  
React 기반 테트리스 UI  
  
구성  
  
- Game Board  
- Score 표시  
- Ranking Panel  
- WebSocket으로 실시간 랭킹 갱신  
  
기능  
  
- 게임 종료 시 API 호출  
- 랭킹 API 조회  
- WebSocket 연결  
  
---  
  
# 프로젝트 구조  
  
Backend  

backend/  
app/  
main.py  
api/  
models/  
services/  
db/  
requirements.txt  
Dockerfile

  
Frontend  

frontend/  
src/  
public/  
package.json  
Dockerfile

  
---  
  
# Docker 요구사항  
  
각 서비스 Dockerfile 작성  
  
Backend  
  
- Python  
- uvicorn 실행  
  
Frontend  
  
- Node build  
- nginx serve  
  
---  
  
# 환경 변수  
  
환경 변수로 DB/Redis 연결  
  
Backend ENV  

POSTGRES_HOST  
POSTGRES_PORT  
POSTGRES_USER  
POSTGRES_PASSWORD  
POSTGRES_DB

REDIS_HOST  
REDIS_PORT

  
---  
  
# Health Check  
  
Kubernetes 배포를 고려하여  
  
Backend에 아래 endpoint 추가  

GET /health

  
응답  

{"status":"ok"}

  
---  
  
# 추가 요구  
  
코드는 다음을 고려하여 작성  
  
- Kubernetes Deployment 배포 가능  
- 환경 변수 기반 설정  
- Stateless 구조  
- Redis / DB 외부 연결  
  
---  
  
전체 프로젝트 코드를 생성해줘.
```

- `k8s_tetris` 폴더 생성하고 vs code terminal 에서 `claude` 입력하여 실행
	- 이후 Docker 이미지 빌드나 Kubernetes YAML 파일 검토까지 시키기 위해 CLI 버전 사용

- 생성된 폴더 tree : `tree`
```
C:./k8s_tetris
├─backend
│  └─app
│      ├─api
│      ├─db
│      ├─models
│      └─services
└─frontend
    ├─public
    └─src
        ├─api
        ├─components
        └─hooks
```

- Backend Dockerfile
```
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

```

- Frontend Dockerfile
```
# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Serve stage ──────────────────────────────────────────────
FROM nginx:1.27-alpine

# nginx 공식 이미지는 /etc/nginx/templates/ 의 *.template 파일을
# envsubst 처리 후 /etc/nginx/conf.d/ 에 자동 배치한다.
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV API_HOST=backend
ENV API_PORT=8000

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

```

이후 `./k8s_tetris/` 위치에서
```
docker build -t tetris-backend ./backend  
docker build -t tetris-frontend ./frontend
```

![364](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260309-7.png)

---

### Docker Image

- 이미지 태그 설정
```
docker tag tetris-backend username/tetris-backend:1.0
docker tag tetris-frontend username/tetris-frontend:1.0
```

- docker 로그인 : `docker login`

- push
```
docker push username/tetris-backend:1.0
docker push username/tetris-frontend:1.0
```

![464](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260309-8.png)

![464](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260309-9.png)

→ 이제 Kubernetes 에서 : `image: hj2346/tetris-backend:1.0` 으로 사용 가능
- worker 노드가 자동으로 pull 할거임

---

## 수행 내용

**Claude Code를 활용하여 게임 서비스 코드 생성**

#### Frontend
- React 기반 테트리스 UI
- WebSocket 기반 랭킹 조회
- nginx 기반 정적 서빙

구조
```
frontend
 ├ public
 ├ src
 │  ├ api
 │  ├ components
 │  └ hooks
 └ Dockerfile
```

#### Backend
- FastAPI
- WebSocket 랭킹 API
- Redis + PostgreSQL 연동

구조
```
backend
 ├ app
 │  ├ api
 │  ├ db
 │  ├ models
 │  └ services
 └ Dockerfile
```

> Docker Image 생성  
> Container Registry 업로드 → Docker Hub 사용  

> VM 클러스터 구축  
> kubeadm 클러스터  
> CNI (Calico)  
> Metrics Server  
> 앱 코드 생성  
> Docker 이미지 생성  
> Docker Registry Push  
> 완료
