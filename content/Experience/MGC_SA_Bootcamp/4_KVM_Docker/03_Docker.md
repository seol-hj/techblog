---
title: Docker와 명령어
draft: false
date: 2026-02-24
updated: 2026-02-24
tags:
  - Container
  - Docker
  - Docker Image
  - Docker Architecture
---

## Docker

- 애플리케이션과 그 실행 환경(라이브러리/설정)을 '이미지(Image)'로 패키징해 어디서든 동일하게 실행 가능하게 한 컨테이너 플랫폼
	- 컨테이너 관리 도구
	- 컨테이너 → 프로세스 격리 기술 / Docker → 사용하기 쉽게 만든 것

- 장점
	- 재현성(Reproduciblity) : 같은 이미지면 어디서든 같은 결과
	- 이식성(Portability) : 서버가 바뀌어도 실행 환경 동일
	- 배포 속도 : 이미지 pull → container run (빠름) = 경량
	- 확장성 : 컨테이너 단위로 복제/증설 쉬움
	- 격리성 : 서로 다른 앱이 서로 영향을 덜 줌 (파일시스템/네트워크/프로세스 격리)

- 한계
	- 커널 공유 : 리눅스 컨테이너 → 리눅스 커널 기능에 의존 (Windows는 별도 구조)
	- 보안 : VM보다 격리 약함 → 운영 보안 설정 중요
	- 상태 저장 앱(Stateful) : 데이터가 중요한 서비스(DB) → 볼륨/백업 설계 필수

**아키텍처 (Client ↔ Daemon ↔ Registry)**
![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260224.png)

1. Docker Client
	- 사용자 입력 명령어 도구 (ex `docker run`, `docker ps`)
	- 실제 컨테이너 만드는 것 → Daemon

2. Docker Daemon (dockerd)
	- 컨테이너 실제 작업 담당 (실행/중지/삭제, 이미지 다운로드, 네트워크/볼륨 관리 등)
	- 백그라운드 서비스 (systemd 서비스로 동작)

3. Docker Registry
	- 이미지 저장 원격 저장소
	- 대표적 Docker Hub, 사내 Private Registry, GitHub Container Registry 등

>Docker 명령은 dockerd에 요청, dockerd가 컨테이너/이미지 관리

### Image / Container / Registry

1. 이미지 (Image)
	- 컨테이너를 만들기 위한 템플릿 / 설계도
	- OS 전체 X, 앱 실행 필요한 파일 시스템 묶음 + 메타데이터
	- 읽기 전용과 유사

2. 컨테이너 (Container)
	- 이미지 기반 실행된 인스턴스
	- 내부적으로 격리된 프로세스
	- 컨테이너 실행 시 쓰기 가능한 레이어를 하나 더 얹어서 동작

3. 레지스트리 (Registry)
	- 이미지 공유/배포 저장소
	- `docker pull` : 레지스트리에서 이미지 내려받는 동작
	- `docker push` : 이미지 업로드 동작

>[!note] Docker은 플랫폼  
>컨테이너 기술 기반 애플리케이션 개발, 배포, 실행, 관리 제공 플랫폼  
>컨테이너 기반 애플리케이션의 전체 수명주기를 지원

### 제공 영역

| 영역               | Docker가 제공하는 기능           |
| ---------------- | ------------------------- |
| 실행(Runtime)      | 컨테이너 실행, 격리               |
| 빌드(Build)        | Dockerfile, 이미지 빌드        |
| 배포(Distribution) | Registry, Image Push/Pull |
| 네트워크(Network)    | bridge, DNS, 포트 포워딩       |
| 스토리지(Storage)    | Volume, Bind Mount        |
| 리소스 관리           | CPU / Memory 제한           |
| 운영 관리            | 로그, 모니터링, 수명주기 관리         |
| 오케스트레이션 연계       | Compose, Kubernetes 연동    |

### 구성요소

- 단일 프로그램 X → 여러 컴포넌트 유기적 연결 생태계

1. Docker Engine (핵심 실행부)
	- 컨테이너 실행 주체
	- Linux 커널 기능(namespace, cgroup) 사용
	- 컨테이너 생명주기 관리
	플랫폼의 커널 역햘

2. Docker CLI (사용자 인터페이스)
```
docker run  
docker build  
docker ps
```
	- Engine API 호출 클라이언트
	- 플랫폼의 조작 도구

3. Docker Image & Registry

4. Docker Compose
	- 멀티 컨테이너 애플리케이션 정의
	- 서비스 단위 실행/종료
	- 선언형 구성 (YAML)
	플랫폼의 서비스 조합 계층

> Docker로  
> 1. 환경 차이 문제    
> 	- 실행 환경 이미지 고정  
> 	- 어디서 실행해도 동일  
> 2. 배포 복잡성 문제  
> 	- 이미지 기반 배포  
> 	- 설치 과정 제거  
> 	- 동일 이미지 재사용  
> 해결 가능  

- dockerd : 실제 컨테이너/이미지 관리 데몬
- docker CLI : 사용자 입력 명령어 도구
- containerd / runc : 컨테이너 실행 담당 저수준 런타임

- 저장 구조
`/var/lib/docker` : 데이터 디렉터리
	- images : 이미지 레이어 저정
	- containers : 컨테이너 메타데이터
	- volumes : 볼륨 데이터
	- overlay2 : 실제 파일시스템 레이어

### 기본 명령어

```
docker <대상> <명령> [옵션]
```

- 대상(Object) 예시
	- `container` (혹은 생략)
	- `image`
	- `volume`
	- `network`

| 대상        | 대표 명령                    |
| --------- | ------------------------ |
| container | run, ps, start, stop, rm |
| image     | pull, ls, rm, inspect    |
| volume    | create, ls, inspect      |
| network   | ls, create               |

- `docker run`
	- 여러 단계 한 번에 수행
		1. 이미지 존재 여부 (`docker images`)
		2. 없으면 Registry 에서 pull
		3. 컨테이너 생성 (`docker create`)
		4. 컨테이너 시작 (`docker start`)
		5. 터미널 연결 (`docker attach`)
```
docker run = pull + create + start + attach
```

- `docker create` vs `docker start`
	- `create` : 컨테이너 틀만 생성 (실행 X)
	- `start` : 이미 만들어진 컨테이너 실행

#### 컨테이너 실행 옵션

1. `-it` : ex) `docker run -it ubuntu:22.04 bash`
	- `i` : 표준 입력 유지
	- `t` : 터미널 형태 출력
- 쉘 기반 컨테이너 거의 필수 옵션

2. `-d` : ex) `docker run -d nginx`
	- `d` (detached mode) : 백그라운드 실행
	- 터미널 점유 X
	- 서버형 컨테이너(웹/DB)에 필수

3. `--name` : ex) `docker run --name web01 nginx`
	- 사람이 기억하기 쉬운 이름 부여
	- 이름 미지정 시 랜덤
		- 운영시 name 지정 권장

4. `--rm` : ex) `docker run --rm ubuntu echo "test"`
	- 컨테이너 종료 시 자동 삭제
	- 테스트/일회성 작업에 적합

#### 컨테이너 제어 명령

1. 컨테이너 중지 : `docker stop <컨테이너ID|이름>`
	- SIGTERM → 일정 시간 후 SIGKILL
	- 정상 종료를 유도

2. 컨테이너 강제 종료 : `docker kill <컨테이너ID|이름>`
	- 즉시 SIGKILL
	- 장애 상황에서만 사용

3. 컨테이너 재시작 : `docker restart <컨테이너ID|이름>`

4. 중지된 컨테이너 삭제 : `docker rm <컨테이너ID>`

5. 실행 중 컨테이너 삭제 : `docker rm -f <컨테이너ID>`
	- `-f` : stop + rm

#### 컨테이너 내부 접근

1. `docker attach` : `docker attach <컨테이너ID>`
	- STDOUT/STDIN에 직접 연결
	- 쉘 종료 시 컨테이너도 종료될 수 있음

2. `docker exec` (권장) : `docker exec -it <컨테이너ID> bash`
	- 실행 중인 컨테이너에 새 프로세스로 접속
	- attach 보다 exec 권장

#### 컨테이너 로그 확인

- 로그 조회 : `docker logs <컨테이너ID>`
- 실시간 로그 : `docker logs -f <컨테이너ID>`

#### 컨테이너 상태 확인

- 상세 정보 : `docker inspect <컨테이너ID>`
	- JSON 형식
	- 네트워크, 마운트, PID, 리소스 설정 확인 가능

- 리소스 사용량 : `docker stats`
	- CPU/메모리 실시간 확인