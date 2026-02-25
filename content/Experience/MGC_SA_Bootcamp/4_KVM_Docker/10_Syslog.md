---
title: Syslog
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Container
  - Docker
  - Logs
  - System Logging
  - Syslog
---

- **로그 (Log)** : 시스템 발생 이벤트 기록
	- 정보가 시간, 사용자, 프로세스, 원인, 결과 등의 형태로 기록

## Syslog

- 단순 로그 X → 로그를 관리하는 체계

- 표준화 된 형식 : `날짜 시간 호스트명 프로그램명[PID]: 메시지`
	- 자동 분석 도구가 쉽게 해석 가능

#### Syslog 메시지 Facility / Severity

1. **Facility** (어디서 나온 로그인지)
	- ex) `auth`, `authpriv`, `kern`, `daemon`, `mail`, `cron`, `local0~local7` 등

2. **Severity** (Priority Level - 심각도)
	- 낮을수록 심각

|숫자|이름|의미|
|---|---|---|
|0|emerg|시스템 사용 불가 수준|
|1|alert|즉시 조치 필요|
|2|crit|치명적 오류|
|3|err|오류|
|4|warning|경고|
|5|notice|중요한 알림|
|6|info|정보|
|7|debug|디버그|

3. Selector
	- `authpriv.*` : authpriv facility 의 모든 레벨
	- `.info` : 모든 facility의 info 이상
	- `mail.err` : mail facility 의 err 레벨

---

### `journalctl`

- systemd 저널의 전체 로그를 시간순으로 출력
- 페이지 출력으로 뜨며 `q`로 종료

- `-b` : 부팅 단위로 보기
	- `-1` : 바로 이전 부팅
- `-f` : 실시간
- `-u *` : 특정 서비스(Unit) 로그
- `--since "년도-월-날짜" --until "년도-월-날짜 시간"` : 시간 범위 검색
- `-p` : 로그 레벨로 필터

---

- `/var/log/messages` : 일반 시스템 메시지
- `/var/log/secure` : 인증/보안 관련 (SSH 로그인 등)
- `/var/log/cron` : cron 실행 내역
- `/var/log/maillog` : 메일 관련