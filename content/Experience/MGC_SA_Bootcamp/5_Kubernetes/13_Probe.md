---
title: Health Check
draft: false
date: 2026-03-05
updated: 2026-03-05
tags:
  - Containers
  - Kubernetes
  - Health Check
  - Probe
---
## Probe (Health Check)

- 프로세스 Stop → But, Pod Running 유지
- App 초기화 → But, Service 트래픽 전달
- DB 장애로 기능 X → But, 트래픽 유입
- 포트 Open → But, 내부 로직 실패 계속

- → Probe 사용 시
	- **Readiness 실패** : 트래픽 차단(Service Endpoint 제외) 됨
	- **Liveness 실패** : 컨테이너 재시작 → 자동 복구 시도

| 구분      | Liveness Probe        | Readiness Probe        |
| ------- | --------------------- | ---------------------- |
| 질문      | “컨테이너가 살아있나?”         | “지금 트래픽 받아도 되나?”       |
| 실패 시    | 컨테이너 재시작됨             | Service Endpoint에서 제외됨 |
| 트래픽 영향  | 간접적(재시작으로 다운타임 발생 가능) | 직접적(트래픽 차단)            |
| 주 사용 목적 | Deadlock, 내부 멈춤 복구    | 초기화/의존성 준비 전 트래픽 차단    |

### Probe 방식 3가지 (Readiness / Liveness 공통)

1. **httpGet** : HTTP 응답 코드로 판단

2. **exec** : 컨테이너 내부 명령 실행 exit code로 판단
	- 내가 정한 조건을 만족할 때만 준비 완료로 판단
	- 주의점
		- 주기가 너무 짧으면 컨테이너 내부 명령 실행이 잦아짐 → CPU 사용량 증가
		- 단순한 체크 스크립트로 구성하는 것이 안전

3. **tcpSocket** : 특정 포트로 TCP 연결 가능한지로 판단
	- tcp 방식의 한계
		- 포트가 열려있다는 것만 확인
		- 앱 내부 로직이 고장났는지 판단 X

|옵션|의미|
|---|---|
|initialDelaySeconds|Pod 시작 후 첫 검사까지 대기함|
|periodSeconds|검사 주기임|
|timeoutSeconds|응답/실행 대기 시간임|
|failureThreshold|연속 실패 몇 번이면 실패로 확정할지 결정함|
|successThreshold|연속 성공 몇 번이면 성공으로 확정할지 결정함(readiness에서 자주 의미 있음)|

#### 운영

1. 웹 애플리케이션
	- readiness : HTTP `/health` 권장
	- liveness : HTTP 또는 exec(단순 체크) 권장

2. DB/캐시 같은 TCP 서비스
	- readiness : tcpSocket로 포트 오픈 체크 가능
	- 쿼리 가능 상태까지 보려면 exec/커스텀 스크립트 필요

3. readiness는 의존성 (DB, 외부 API) 체크를 넣는 경우 다수
	- 장애 시 재시작보다 트래픽 차단이 더 안전한 경우 다수