---
title: Docker Compose
draft: false
date: 2026-02-24
updated: 2026-02-24
tags:
  - Container
  - Docker
  - Docker Compose
---

>Docker Compose는  
>여러 컨테이너 하나의 서비스 스택으로 정의  
>실행/중지/삭제를 한 번의 명령으로 처리  
>설정을 코드(yaml)로 관리 (IaC)

**docker run을 코드로 작성한 것이 Docker Compose**

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260224-2.png)

---

## docker-compose.yml 구조

```
services:       # 컨테이너 서비스 정의  
  service_name:  
    # 서비스 설정  
  
volumes:        # 볼륨 정의 (선택사항)  
  volume_name:  
  
networks:       # 네트워크 정의 (선택사항)  
  network_name:  
```
- Compose 파일의 핵심 = service

|키|의미|
|---|---|
|services|컨테이너 정의|
|volumes|볼륨 정의|
|networks|네트워크 정의|

---

### Service 정의

1. image
```
services:  
  web:  
    image: nginx:latest
```
	- Docker Hub 이미지 사용
	- `docker run nginx`와 동일

2. container_name
```
container_name: web01
```
	- 컨테이너 이름 고정
	- 대규모 운영 시 충돌 주의

3. ports
```
ports:  
  - "8080:80"
```
	- 호스트:컨테이너 포트 매핑
	- 문자열로 작성 권장

4. environment
```
environment:  
  - APP_ENV=production
```

5. volumes
```
volumes:  
  - webdata:/usr/share/nginx/html
```
	- Docker Volume 연결

6. depends_on
```
depends_on:  
  - db
```
	- 컨테이너 실행 순서 보장
	- 서비스 준비 완료 보장은 X

---

### 네트워크 & DNS

- Compose는 프로젝트 별 사용자 정의 bridge 네트워크 자동 생성
- 서비스 이름 = DNS 이름

---

**명령어 및 비교**

| 명령                   | 의미       |
| -------------------- | -------- |
| docker compose up    | 서비스 실행   |
| docker compose up -d | 백그라운드 실행 |
| docker compose down  | 전체 종료    |
| docker compose ps    | 상태 확인    |
| docker compose logs  | 로그 확인    |

| 항목      | docker run | Docker Compose |
| ------- | ---------- | -------------- |
| 단일 컨테이너 | ⭕          | ⭕              |
| 멀티 컨테이너 | ❌          | ⭕              |
| 설정 관리   | 분산         | YAML로 통합       |
| 재현성     | 낮음         | 높음             |
| 협업      | 어려움        | 쉬움             |
