---
title: Linux
draft: false
date: 2026-02-01
updated: 2026-02-01
tags:
  - Linux
  - ubuntu
---
# 1. 리눅스란 무엇인가

## 1.1 리눅스의 탄생

- **리누스 토르발즈**가 1991년 개발
- 유닉스 기반 운영체제를 개인도 쓸 수 있도록 만들기 위해 시작
- **MINIX → Linux Kernel**로 발전

### GNU + Linux

|구성|역할|
|---|---|
|GNU|컴파일러, 쉘, coreutils|
|Linux Kernel|하드웨어 제어|
|→ GNU/Linux|우리가 사용하는 리눅스|

> 리눅스 = 커널 + GNU 도구

---

## 1.2 Unix와의 관계

- Unix 특징
    - 멀티유저
    - 멀티태스킹
    - C 언어 기반
    - 모듈형 구조
- Linux는 Unix의 철학을 계승

---

## 1.3 리눅스 배포판

|계열|특징|예|
|---|---|---|
|Debian|안정성|Ubuntu|
|RedHat|기업 서버|RHEL, CentOS|
|Arch|최신 패키지|Arch Linux|

> 실습 환경: Ubuntu 22.04 LTS

---

## 1.4 왜 서버는 리눅스를 쓰는가

|이유|설명|
|---|---|
|오픈소스|비용 0|
|보안|취약점 빠른 패치|
|서버 친화|CLI 중심|
|자동화|스크립트, cron, CI/CD|

---

# 2. 리눅스 설치

## 2.1 Windows에서 리눅스 사용

### 방법 1 – WSL

```bash
wsl --install
wsl --list --online
wsl --install -d Ubuntu
```

---

### 방법 2 – VirtualBox

설정

|항목|값|
|---|---|
|OS|Ubuntu 22.04 LTS|
|CPU|2|
|RAM|4GB|
|Disk|25GB|
|User|guru / 1234|

설치 후 GUI → CLI 전환

```bash
sudo systemctl set-default multi-user.target
sudo reboot
```

---

## 2.2 SSH 접속

```bash
sudo apt update
sudo apt install openssh-server
sudo systemctlenable ssh
sudo systemctl start ssh
```

VirtualBox NAT 포트 포워딩

```
Host2222→Guest22
```

MobaXterm 설정:

- Host: localhost
- Port: 2222
- User: guru

---

# 3. 리눅스 파일 시스템

## 3.1 파일 시스템이란

> 저장장치에 파일 위치 + 메타데이터를 관리하는 체계

파일 메타데이터:

- 경로
- 크기
- 권한
- 생성시간
- 블록 위치

---

## 3.2 디렉토리 구조

|디렉토리|역할|
|---|---|
|`/`|루트|
|`/home`|사용자 홈|
|`/etc`|설정|
|`/var`|로그, 가변 데이터|
|`/bin`|기본 명령|
|`/usr`|사용자 프로그램|
|`/tmp`|임시|
|`/dev`|디바이스|
|`/root`|관리자 홈|

---

# 4. 리눅스 명령어

## 4.1 명령어 구조

```
command[option][argument]
```

예:

```bash
ls -lh /var/log
```

---

## 4.2 주요 명령어

### 파일 관리

```bash
ls -la
cd /home/guru
mkdir -p a/b
cp -r src dst
mv old new
rm -rfdir
```

### 내용 보기

```bash
cat file
less file
nano file
vim file
```

### 시스템

```bash
df -h
du -sh /var
top
ps
uname -a
```

---

# 5. 파이프 & 리디렉션

```bash
ls -l | grep".txt"
echo"Hello" > hello.txt
ps -ef | grep bash > bash.txt
```

---

# 6. 사용자 & 그룹

## 6.1 사용자 개념

|종류|설명|
|---|---|
|root|UID 0, 최고 관리자|
|일반 사용자|UID ≥ 1000|
|시스템 사용자|www-data, nobody 등|

> 시스템 사용자는 최소 권한 원칙을 위해 존재

---

## 6.2 사용자 명령어

```bash
useradd -m user1
passwd user1
usermod -aGsudo guru
userdel -r user1
```

---

## 6.3 sudo & root

- root 직접 로그인 금지
- sudo로 필요한 명령만 관리자 권한

```bash
PermitRootLogin no# /etc/ssh/sshd_config
```

---

# 7. 파일 권한

## 7.1 권한 구조

```
-rwxr-xr--
│ │  │  │
│ │  │  └ others
│ │  └group
│ └owner
└ filetype
```

|값|의미|
|---|---|
|r|4|
|w|2|
|x|1|

```bash
chmod 755 file
chmod 644 file
```

---

## 7.2 소유자 변경

```bash
chown user:group file
```

---

## 7.3 umask

```bash
umask 022
파일: 666 - 022 = 644
디렉토리: 777 - 022 = 755
```

---

# 8. 패키지 관리 (APT)

```bash
sudo apt update
sudo apt install nginx
sudo apt remove nginx
```

> 리눅스 서버 운영의 핵심:
> **패키지 관리자 + 서비스 + 권한**