---
title: 컨테이너 로그 관리
draft: false
date: 2026-02-24
updated: 2026-02-24
tags:
  - Container
  - Docker
  - Logs
  - Docker Logs
---

### 컨테이너 환경에서의 로그

- 기존
	- 애플리케이션이 로그 파일 직접 생성
	- `/var/log/*.log`로 저장
	- 로그 로테이션(logrotate) 필요
	- 서버 단위 로그 관리

- 컨테이너는 언제든 삭제/재생성
- 컨테이너 내부 파일 영구 X / 컨테이너 수 증가 시 로그 파일 관리 불가
- → **로그 스트림**

---

## stdout / stderr 기반 로그 모델

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260224-1.png)

- 컨테이너 로그 기본 원칙
	- 표준 출력 (stdout)
	- 표준 에러 (stderr)

```
애플리케이션  
   ↓  
stdout / stderr  
   ↓  
Docker logging driver  
   ↓  
docker logs / 외부 로그 시스템
```

---

## docker logs 명령

```
docker logs <컨테이너명>
```
- stdout + stderr 출력
- 컨테이너 내부 파일 읽는 것 X → Docker 데몬이 수집한 로그를 출력

- 실시간 로그 확인 : `docker logs -f <컨테이너명>`
	- `f` : follow (tail -f와 유사)

- 로그 범위 제한
```
docker logs --tail 100 <컨테이너명>  
docker logs --since 10m <컨테이너명>  
docker logs --until 2026-02-09T10:00:00 <컨테이너명>
```
	- 장애 시 로그 범위 줄여야 함

- 타임 스탬프 포함 : `docker logs -t <컨테이너명>`

---

## Logging Driver

- 컨테이너 로그를 어디에, 어떻게 저장할지 logging driver로 결정

- 기본 logging driver
	- json-file
	- `/var/lib/docker/containers/.../*.log`
	- docker logs 명령 사용 가능

| Driver    | 설명              | docker logs |
| --------- | --------------- | ----------- |
| json-file | 로컬 JSON 파일      | ⭕           |
| local     | 성능 개선된 로컬       | ⭕           |
| syslog    | syslog 서버 전송    | ❌           |
| journald  | systemd journal | ❌           |
| fluentd   | 로그 수집기 연동       | ❌           |
| awslogs   | CloudWatch Logs | ❌           |
- logging driver에 따라 docker logs 사용 여부

- 현재 설정 확인 : `docker info | grep -i logging`

- 컨테이너 별 logging driver 지정
```
docker run -d \  
  --log-driver=json-file \  
  nginx
```

- 로그 옵션 설정
```
--log-opt max-size=10m  
--log-opt max-file=3
```
	- 로그 무한 증가 방지 (필수)

---

## 로그 로테이션

- json-file 로그 계속 누적 / 디스크 고갈 위험 → 로그 로테이션

ex)
```
docker run -d \  
  --log-driver=json-file \  
  --log-opt max-size=10m \  
  --log-opt max-file=5 \  
  nginx
```
전체설정
```
{   
  "log-driver": "json-file",  
  "log-opts": {  
    "max-size": "10m",  
    "max-file": "5"  
  }  
}
```
경로
`/etc/docker/daemon.json`

- 운영 서버 반드시 설정 필요

>[!note] 컨테이너 로그 설계  
>1. 애플리케이션은 stdout/stderr 로만 로그 출력  
>2. 컨테이너 내부에 로그 파일 생성 X  
>3. 로그 수집은 Docker 외부 시스템 수행 (ex ELK, Fluentd, CloudWatch Logs 등)  
>4. docker logs는 운영자가 즉시 확인하는 1차 도구  
