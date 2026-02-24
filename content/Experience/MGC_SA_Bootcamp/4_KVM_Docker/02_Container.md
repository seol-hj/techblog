---
title: 컨테이너
draft: false
date: 2026-02-23
updated: 2026-02-23
tags:
  - Container
  - Docker
  - Docker Image
  - Network
  - Docker Volume
---
## 0. 기술의 변화

1. 물리 서버 문제점
	- 물리 서버 1대에 애플리케이션 1개
	- 서버 자원 남음
	- 환경 구축 느림
	- 장애 영향 범위 큼
	- → VM (가상머신) 등장

2. 하이퍼바이저 기반 가상화(VM)
	- 장점
		- OS 수준 완전 분리 (다른 커널, 다른 OS)
		- 강한 격리(보안/장애)
		- 서버 자원 활용률 증가
	- 한계
		- 무거움
		- 느림
		- 이미지가 크다

> VM은 서버를 쪼개는 데 강력  
> 배포/이식/빠른 확장에 부담

---

## 1. 컨테이너

### 1-1. 정의

> 애플리케이션과 그 실행에 필요한 모든 의존성(라이브러리, 설정 파일 등)을 하나의 실행 단위로 패키징한 기술

- 프로세스 격리
- 운영체제 커널 공유
- 가볍고 빠른 실행

**VM과 차이점**
- OS 전체를 가상화하지 않음

### 1-2. 컨테이너 vs 가상머신(VM)

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223-4.png)

| 구분       | 가상머신(VM) | 컨테이너        |
| -------- | -------- | ----------- |
| 가상화 대상   | 하드웨어     | OS 커널       |
| OS 포함 여부 | 포함       | 미포함         |
| 실행 단위    | OS + App | App + 라이브러리 |
| 부팅 속도    | 수십 초 ~ 분 | 수 초         |
| 리소스 사용   | 무거움      | 매우 가벼움      |

> VM : 서버를 가상으로 만듦  
> 컨테이너 : 프로세스를 격리해서 실행

### 1-3. 내부 동작 원리

**컨테이너 = 프로세스**

#### Namespace
- 하나의 리눅스 시스템을 여러 개의 독립된 공간으로 나누는 기능
- 컨테이너마다 Namespace가 다름
	- 프로세스, hostname, 네트워크 분리된 것처럼 보임
	- 실제로는 같은 서버
	- **자기만의 환경을 가진 것처럼 보임**

| Namespace | 역할            |
| --------- | ------------- |
| PID       | 프로세스 ID 격리    |
| NET       | 네트워크 인터페이스 격리 |
| MNT       | 파일시스템 마운트 격리  |
| UTS       | hostname 격리   |
| IPC       | 프로세스 간 통신 격리  |
| USER      | 사용자 ID 격리     |

#### cgroups
- 프로세스가 사용할 수 있는 자원의 양을 제한하는 기술
- CPU, 메모리, 디스크 I/O 사용량 제한을 담당

- CPU 제한 두가지 방식
	1. CPU 사용량 제한
	2. CPU 지정 제한

|구분|의미|
|---|---|
|cpu.max|CPU를 얼마나 쓸 수 있는지|
|cpuset.cpus|어떤 CPU를 쓸 수 있는지|
|cgroup.procs|어떤 프로세스에 적용할지|

#### 정리
|자원|제한 가능 여부|목적|
|---|---|---|
|CPU|⭕|과도한 연산 방지|
|메모리|⭕|메모리 폭주 방지|
|디스크 I/O|⭕|디스크 독점 방지|
|프로세스 수|⭕|시스템 보호|
|네트워크|△|간접적 제어|
> 컨테이너 = Namespace(격리) + cgroups(제어)

---

## 2. 컨테이너 이미지(Image)

> 컨테이너 이미지 = 컨테이너 실행을 위한 템플릿  
> - OS 일부
> - 라이브러리
> - 애플리케이션
> - 설정 파일

### 2-1. 이미지의 Layer 구조

이미지는 읽기 전용 Layer들의 집합

```
[ App Layer ]  
[ Runtime Layer ]  
[ OS Base Layer ]
```

- 공통 Layer는 재사용
- 디스크 절약 + 빌드 속도 향상

👉 컨테이너 실행 시
- 이미지 → 읽기 전용
- 컨테이너 → 쓰기 가능한 Layer 추가

### 2-2. Docker Image

- 읽기 전용 패키지
	- 애플리케이션 실행 파일
	- 라이브러리 및 런타임
	- 설정 파일
	- 환경 변수 정보
	- 기본 실행 명령 (CMD / ENTRYPOINT)

- 이미지는 실행 X
- 이미지를 실행한 결과 → 컨테이너 (Container)

>이미지(Image) : 설계도, 클래스  
>컨테이너(Container) : 실행된 인스턴스, 객체

| 구분  | 이미지 | 컨테이너         |
| --- | --- | ------------ |
| 상태  | 정적  | 동적           |
| 수정  | 불가  | 가능           |
| 실행  | ❌   | ⭕            |
| 수명  | 영구  | 프로세스 종료 시 종료 |

#### 2-2-1. Docker 이미지 레이어 구조

- 이미지 레이어 → 여러 개의 파일시스템 레이어가 쌓인 구조
	- Dockerfile의 각 명령어 = 하나의 레이어
	- 레이어는 불변

```
Layer 1: ubuntu base  
Layer 2: apt install nginx  
Layer 3: copy index.html  
Layer 4: CMD nginx
```

- 컨테이너 실행 시
```
[ Image Layers (Read Only) ]  
[ Container Writable Layer ]
```
	- 파일 수정은 컨테이너 쓰기 레이어에만 기록
	- 이미지 레이어는 변경 X
	- 같은 이미지를 여러 컨테이너가 공유 가능

- 레이어 확인 명령어
```
docker history nginx
```
	- 각 레이어 생성 명령과 용량 확인
	- Dockerfile 최적화의 근거 자료

### 2-3. Dockerfile

- 이미지를 만들기 위한 설계서
- 텍스트 파일
- 위에서 아래로 순차적으로 실행
- 한 줄 = 한 레이어

#### docker build
```
docker build -f <DOCKERFILE_PATH> -t <IMAGE:TAG> <BUILD_CONTEXT>
```

```
docker build -t myimage:1.0 .
```
- `-t` : 이미지 이름과 태그
- `.` : build context (현재 디렉터리)
	- build context 안의 모든 파일은 Docker 데몬으로 전송

- `<BUILD_CONTEXT>`
	- Docker 빌드시 `<BUILD_CONTEXT>` 디렉터리를 스냅샷처럼 묶어서 빌더로 전달
	- Dockerfile의 `COPY`, `ADD`는 컨텍스트 안의 파일만 가져올 수 있음
	- Dockerfile에 상대 경로가 있다면 기준은 항상 빌드 컨텍스트

- `docker build` 주요 옵션

| Option             | Short | 설명                      | 언제 쓰나(실무 관점)       |
| ------------------ | ----- | ----------------------- | ------------------ |
| `--build-arg` (단수) |       | Dockerfile의 `ARG`에 값 전달 | OS/버전 등 빌드 분기      |
| `--file`           | `-f`  | 사용할 Dockerfile 경로 지정    | 여러 Dockerfile 운영   |
| `--label`          |       | 이미지 메타데이터 라벨 추가         | 버전/빌드정보 기록         |
| `--no-cache`       |       | 캐시 없이 처음부터 빌드           | 캐시 오염 의심/최신 패키지 확인 |
| `--platform`       |       | 아키텍처 지정                 | amd64/arm64 교차 빌드  |
| `--pull`           |       | 베이스 이미지 강제 최신 pull      | 보안 패치 반영           |
| `--tag`            | `-t`  | 이미지 이름:태그 지정            | 버전 관리/배포           |

#### 2-3-1. 주요 명령어

1. `FROM` : ex) `FROM ubuntu:22.04`
	- 베이스 이미지 지정
	- Dockerfile 첫 줄 필수

2. `RUN` : ex) `RUN apt update && apt install -y nginx`
	- 빌드 시 실행
	- 결과가 이미지 레이어로 저장
	- 여러 RUN 하나로 묶음 → 레이어 수 감소, 이미지 최적화

3. `COPY / ADD` : ex) `COPY index.html /usr/share/nginx/html/`
	- 호스트 파일 이미지로 복사
	- COPY 권장
	- ADD는 압축 해제, URL 다운로드 등 부가기능 포함

4. `WORKDIR` : ex) `WORKDIR /app`
	- 작업 디렉터리 지정
	- cd 대체

5. `ENV / ARG` : ex) `ARG VERSION ENV APP_ENV=production`
	- 사용 시점
		- ARG → 빌드 타임 / ENV → 런타임
	- 컨테이너 유지
		- ARG → X / ENV → O

6. `EXPOSE` : ex) `EXPOSE 80`
	- 문서화 용도
	- 실제 포트 오픈 → `docker run -p`

7. `CMD vs ENTRYPOINT` : ex) `CMD ["nginx", "-g", "daemon off;"]`
	- `CMD` → 기본 실행 명령 (덮어쓰기 가능)
	- `ENTRYPOINT` → 고정 실행 명령
		- CMD 단독 사용이 가장 흔함

| Instruction  | 설명                    | 동작 시점    |
| ------------ | --------------------- | -------- |
| `FROM`       | 베이스 이미지 지정            | 빌드       |
| `ARG`        | 빌드 타임 변수              | 빌드       |
| `ENV`        | 런타임 환경 변수             | 실행(컨테이너) |
| `ADD`        | 복사 + (압축 해제/URL 등) 기능 | 빌드       |
| `COPY`       | 파일/디렉터리 복사(권장)        | 빌드       |
| `LABEL`      | 이미지 라벨(메타데이터)         | 빌드       |
| `EXPOSE`     | 포트 “문서화” 메타데이터        | 빌드(메타)   |
| `USER`       | 실행 사용자 지정             | 실행       |
| `WORKDIR`    | 작업 디렉터리 지정            | 빌드/실행    |
| `RUN`        | 빌드 중 명령 실행(레이어 생성)    | 빌드       |
| `CMD`        | 기본 실행 명령(덮어쓰기 쉬움)     | 실행       |
| `ENTRYPOINT` | “항상 실행”되는 명령          | 실행       |

>Dockerfile의 모든 명령이 이미지 레이어 X  
>일부 명령은 메타데이터만 변경

**레이어 생성 O 명령 (파일시스템 변경)**
- `FROM` `RUN` `COPY` `ADD`
	- 이미지 레이어 하나씩 추가
	- 파일시스템에 실제 변경 발생
	- `docker history` 에서 용량 변화 확인 가능

**레이어 생성 X 명령 (메타데이터만 변경)**
- `CMD` `ENTRYPOINT`
- `ENV` `ARG`
- `WORKDIR`
- `EXPOSE`
- `LABEL`
- `USER`
- `STOPSIGNAL`
- `ONBUILD`
- `SHELL`
	- 새 레이어 생성 X
	- 이미지 동작 방식 / 속성 만 정의

- 레이어는 기본적으로 파일 시스템 스냅샷
- 메타데이터는 설정 정보

- `ENV`
	- 파일시스템 레이어는 생성 X
	- 이미지 메타데이터에 환경 변수 기록
	- 캐시에 영향
		- ENV 값이 바뀌면 이후 RUN 캐시는 무효화

- `WORKDIR`
	- 디렉터리 없으면 생성 → Docker는 메타데이터 변경으로 처리
	- 용량 증가 X

- `CMD / ENTRYPOINT`
	- 실행 시점에만 사용
	- 이미지 파일시스템과 무관
	- `docker history`에 용량 0B로 표시 (레이어 X)
		- 0B로 표시되는 항목 = 레이어 없는 명령

- `RUN` vs `CMD`
	- `RUN` : 이미지 만들 때 실행 (결과가 이미지 레이어로 굳음)
	- `CMD / ENTRYPOINT` : 컨테이너 시작할 때 실행 (PID 1 프로세스)
#### 2-3-2. dockerignore

- build context 전송 최적화
- 이미지 용량 감소
- 민감 정보 유출 방지

#### 2-3-3. 이미지 캐시

- Dockerfile 각 줄 단위로 캐시 판단
- 변경된 줄 이후는 전부 재빌드

### 2-4. Dangling Image

- 태그가 없는 이미지 (`<none>:<none>`)
	- 이미지 자체는 정상
	- 참조(tag)만 사라진 상태

- 같은 태그로 이미지 재빌드 → 기존 이미지 dangling 상태

```
docker images -f dangling=true  
docker image prune
```

### 2-5. Image Digest (이미지 실제 식별자)

- Digest
	- 이미지 내용 기준으로 계산된 SHA256 해시
	- 이미지 진짜 신원

| 구분    | Tag | Digest |
| ----- | --- | ------ |
| 변경 가능 | ⭕   | ❌      |
| 의미    | 별명  | 고유 지문  |
| 신뢰성   | 낮음  | 높음     |
- Docker는 내부적으로 digest 기준으로 이미지 관리

```
docker images --digests  
docker inspect nginx
```

**Dangling과 관계**
- dangling image도 digest는 유지
- 태그만 X

### 2-6. 많이 사용하는 BASE 이미지

1. scratch
	- 빈 이미지
	- 정적 바이너리(ex Go static) 같은 최소 실행 파일만 넣을 때 사용
	- 레이어를 추가하지 않는다는 의미: scratch 자체는 빈 기반 → 필요한 파일만 올리게 됨

2. alpine
	- 매우 작은 리눅스(경량)
	- 패키지 관리 : `apk`
	- 디버깅 도구 넣기 쉬움, 작고 빠름

3. distroless
	- 실행에 필요한 런타임만 포함 (쉘, 패키지 매니저 X)
	- 운영 환경에서 공격 표면 감소
	- 디버깅은 어렵지만 보안/경량에 유리

### 2-7. Multi-stage build

- 빌드에 필요한 도구 / 실행에 필요한 파일 은 다름
	- 빌드 스테이지 : 컴파일러/빌드도구 포함 (무거워도 O)
	- 런타임 스테이지 : 실행 파일만 포함 (가볍고 안전)
- 이미지 크기 감소
- 보안 강화 (운영 이미지에 bash/curl/gcc 등 제거)
- 운영 표준 패턴

>[!note] 좋은 Docker 이미지  
>작다  
>재현 가능  
>불필요한 파일 X  
>태그와 digest 개념이 명확  
>빌드 캐시를 효율적으로 사용  

---

## 3. 컨테이너 생명 주기

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223-5.png)

### 3-1. 컨테이너 상태 흐름

1. Image Pull
2. Container Create
3. Container Start
4. Running
5. Stopped
6. Removed

### 3-2. 핵심

- 컨테이너는 일시적(Ephemeral)
- 종료 시 메모리 상태 사라짐
- 데이터 → 외부 저장소(Volume) 필요

---

## 4. 컨테이너 네트워크

### 4-1. 구조

- 컨테이너 → 가상 네트워크 인터페이스 가짐
- 브리지 네트워크 통신
```
Container → veth → bridge → host NIC
```

- 포트 포워딩
	- 외부 접근을 위해 필수
```
-p (명령어) 8080:80 (호스트 8080 → 컨테이너 80)
```

### 4-2. Docker 네트워크

> 컨테이너는 기본적으로 격리 (namespace)    
> 	- 프로세스 (PID)  
> 	- 파일 시스템 (MNT)  
> 	- 네트워크 (NET)  
> 외부와 자동으로 통신 X → 네트워크 필요

#### 4-2-1. Docker 네트워크 역할

- 컨테이너에 IP주소 할당
- 컨테이너 ↔ 컨테이너 통신
- 컨테이너 ↔ 호스트 통신
- 외부 ↔ 컨테이너 통신

#### 4-2-2. Docker 네트워크 드라이버

|드라이버|설명|사용 목적|
|---|---|---|
|bridge|가상 브리지 기반|기본값, 가장 많이 사용|
|host|호스트 네트워크 공유|성능 최우선|
|none|네트워크 없음|완전 격리|

##### Bridge 네트워크 (기본)

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223-6.png)

- docker0 브리지
	- Docker 설치 시 자동 생성 가상 브리지 인터페이스
	- 리눅스 브리지
	- 사설 IP 대역 할당 (보통 172.17.0.0/16)
	- 컨테이너는 docker0 연결

- 컨테이너 네트워크 연결 구조
	- veth 인터페이스 2개
		- 컨테이너 내부 `eth0` ↔ 호스트 `docker0`
	- 가상 스위치에 연결된 서버처럼 동작

컨테이너 IP 확인 명령어
```
docker inspect <컨테이너명>
```
or 컨테이너 내부 :
```
ip addr
```

#### 4-2-3. 포트 포워딩 (`p` 옵션)

- 컨테이너는 사설 IP 사용
	- 외부 직접 접근 X
	- 호스트 포트를 통해섬나 접근 가능

- 형식
```
-p [호스트포트]:[컨테이너포트]
```

- 실제 동작
	- iptables NAT 규칙 자동 생성
	- DNAT / SNAT 사용
	- 사용자 iptables 직접 다루지 X

- 포트 확인
```
docker ps
docker port <컨테이너명>
```

##### 사용자 정의 bridge 네트워크

- 기본 bridge 한계
	- 컨테이너 이름 기반 통신 X
	- IP 직접 사용
- 운영 시 사용자 정의 네트워크 사용 기본

- 생성
```
docker network create mynet
```

- 장점
	- 컨테이너 이름으로 통신 O
	- 내장 DNS 제공
	- 네트워크 단위 격리

##### host 네트워크

- 컨테이너가 host 네트워크 그대로 사용
	- IP 분리 X
	- 포트 포워딩 X

- 장단점
	- 성능우수 / 포트 충돌
	- 단순 구조 / 격리 약함
	- NAT 없음 / 보안 위험
- 특수 목적(고성능)에서만 사용

##### none 네트워크

```
docker run --network none ubuntu
```

- 네트워크 인터페이스 X
- 완전 격리
	- 보안 테스트
	- 배치 처리 
	- 네트워크 불필요 작업

#### 4-2-4. 컨테이너 ↔ 호스트 통신

- 컨테이너에서 호스트 접근
	- 기본 bridge → 게이트웨이 IP 사용

- **host.docker.internal**
	- Docker Desktop (Mac/Windows) 제공
	- Linux 서버 환경 기본 제공 X

#### 4-2-5. 명령 요약

```
docker network ls  
docker network inspect mynet  
docker network rm mynet
```
- 사용 중인 컨테이너 있으면 삭제 X

>운영 권장  
>  
>- 외부 공개 서비스:  
>	- 사용자 정의 bridge + 포트 포워딩  
>- 내부 서비스 통신:  
>	- 사용자 정의 bridge + DNS  
>- 고성능 특수 목적:  
>	- host 네트워크  
>- 완전 격리 작업:  
>	- none 네트워크

>[!note]  
>기본 bridge:  
>	- IP 통신 가능  
>	- 이름 기반 통신 불가  
>  
>User-defined bridge:  
>	- 컨테이너 이름 DNS 제공  
>	- 운영 환경 권장  
>  
>`p`:  
>	- 호스트 ↔ 컨테이너 통신  
>	- 컨테이너 간 통신과 무관  
>  
>내부 OK/외부 실패:  
>	- 앱 문제 X  
>	- 네트워크/호스트 OS 문제 가능성

---

## 5. 컨테이너 스토리지 및 데이터 관리

**Volume · Bind Mount · `-mount` · docker cp**
>컨테이너 = 데이터 보관 X  
>데이터는 반드시 컨테이너 외부로 분리

### 5-0. 컨테이너 쓰기 레이어

- 구조
```
[ Image Layers (Read Only) ]  
[ Container Writable Layer ]
```
- 컨테이너 실행 시 → 쓰기 레이어 1개 생성
- 컨테이너 삭제 시 → 쓰기 레이어도 함께 삭제
	- 컨테이너 내부 저장 데이터 → 컨테이너 생명주기와 함께 사라짐

- if)
	- DB 컨테이너 재배포 → 데이터 유실
	- 웹 로그 컨테이너 재시작 → 로그 증발
	- 사용자 업로드 파일 → 컨테이너 삭제와 함께 소멸
- 👉 반드시 데이터는 컨테이너 외부 저장

### 5-1. Docker 의 데이터 관리 방식

Docker는 3가지 방식 제공

| 방식         | 용도     | 지속성 |
| ---------- | ------ | --- |
| Volume     | 운영 표준  | ⭕   |
| Bind Mount | 개발/테스트 | ⭕   |
| docker cp  | 임시/응급  | ❌   |

### 5-2. Volume (Docker Volume - 운영 환경의 표준)

#### **Volume**
- 컨테이너 삭제 시
	- 로그
	- DB 데이터
	- 업로드 파일 모두 삭제
- 해결 방법
	- Volume
	- Bind Mount

> 상태 없는 컨테이너 + 상태 있는 외부 스토리지

#### **Docker Volume**
- Docker가 직접 관리하는 컨테이너 외부 저장소
	- 컨테이너 수명과 분리
	- Docker가 저장 위치 관리
	- 여러 컨테이너에서 공유 가능
- 저장 위치
	- `/var/lib/docker/volumes/`
	- 직접 접근·수정 X
	- 반드시 Docker 명령으로 관리

생성 및 확인 명령어
```
docker volume create myvol  
docker volume ls  
docker volume inspect myvol
```

연결 명령어 (--mount 연결 권장)
```
docker run -d \  
  --name web01 \  
  --mount type=volume,source=myvol,target=/usr/share/nginx/html \  
  nginx
```
- 옵션
	- `type=volume` : Docker Volume 사용
	- `source=myvol` : Volume 이름
	- `target=...` : 컨테이너 내부 경로

##### Volume 초기화

- Volume이 비어 있을 때
	- 컨테이너 내부 디렉터리에 기존 파일이 존재 → Volume로 자동 복사됨
	- (nginx, mysql 이미지 중요)

- Volume에 데이터가 이미 있을 때
	- 컨테이너 내부 파일 무시
	- Volume의 기존 데이터 그대로 사용

> 비어있으면 채우고, 차 있으면 그대로 사용

### 5-3. Bind Mount (개발·테스트 용도)

- 호스트의 실제 디렉터리를 컨테이너에 직접 연결하는 방식

- 특징
	- 파일 변경 즉시 반영
	- 개발 환경에서 매우 편리
	- 호스트 경로 의존성 큼


##### Volume vs Bind Mount

| 항목     | Volume | Bind Mount |
| ------ | ------ | ---------- |
| 관리 주체  | Docker | 사용자        |
| 이식성    | 높음     | 낮음         |
| 운영 안정성 | 높음     | 낮음         |
| 권장 환경  | 운영     | 개발         |

##### `-v` vs `--mount`

- `-v` (축약형)
```
-v myvol:/data
```
	- 짧고 빠름
	- 옵션 의미가 불명확
	- 실수 발생 가능

- `--mount` (명시형, 권장)
```
--mount type=volume,source=myvol,target=/data
```
	- Kubernetes 개념과 일관

### 5-4. 읽기 전용(Read-only) 마운트

- 실수 방지
- 보안 강화
- 운영 안정성
	- 코드 디렉터리는 읽기 전용, 로그 디렉터리만 쓰기 허용 등 설계 가능

### 5-5. Named Volume vs Anonymous Volume

|구분|Named Volume|Anonymous Volume|
|---|---|---|
|이름|있음|없음|
|관리|쉬움|어려움|
|prune 대상|❌|⭕|
|운영 권장|⭕|❌|
- 운영에서 anonymous volume 사용 지양

### 5-6. Volume 공유 (다중 컨테이너)
```
docker volume create sharedvol  
docker run -d --name c1 \  
  --mount type=volume,source=sharedvol,target=/data \  
  ubuntu sleep infinity  
  
docker run -it --name c2 \  
  --mount type=volume,source=sharedvol,target=/data \  
  ubuntu bash
```

### 5-7. Docker cp (임시용 도구)

- 컨테이너 ↔ 호스트 간 파일 직접 복사 명령

- 한계
	- 실시간 동기화 X
	- 자동 반영 X
	- 지속 저장 X
	- 설계용 X / 임시용 O

### 5-8. Stateful 컨테이너 설계

**Stateless**
- 웹 서버, API
- 컨테이너 교체 자유로움

**Stateful**
- DB, 캐시
- 반드시 Volume 사용

### 5-9. Volume 정리 (purne)
```
docker volume prune
```
- 사용 X Volume만 삭제
- 실행 중인 컨테이너 영향 X

> 컨테이너는 상태를 가지지 않음  
> 데이터는 컨테이너 외부에서 관리  
> - Bind Mount :  
> 	- 개발/실습 유용  
> 	- 다중 컨테이너 공유 가능  
> 	- 운영은 X  
> - Volume :  
> 	- 운영 환경 표준  
> 	- 컨테이너 수명과 데이터 수명 분리

---

## 6. 결론

### 6-1. 장점

- 빠른 배포
- 높은 이식성
- 리소스 효율성
- CI/CD 친화적

### 6-2. 한계

- 단일 서버 운영 한계
- 컨테이너 수 증가 시 관리 복잡
- 네트워크/보안 설정 난이도 증가
	- Kubernetes 로 극복 가능

### 6-3. 기술 스택

- Orchestration → Kubernetes
- Runtime → containerd, runc
- Build → Docker
- OS → Linux