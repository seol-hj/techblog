---
title: gcloud 설치 및 인증
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - GCP
---

# 1. Google Cloud CLI 설치 및 로그인

[Google Cloud CLI 설치 페이지](https://docs.cloud.google.com/sdk/docs/install-sdk?hl=ko)

Windows 용 설치 프로그램 설치 및 실행 후

cmd 에서 확인 : `gcloud version`
![200](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420.png)

설치 후 로그인 명령어 : `gcloud auth login`
- CLI용 로그인 명령어 → 별도 ADC 구성 필요 (아래에서 설정 추가)

로그인 명령어 입력하게 되면 브라우저가 열리고 google 로그인
![350](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-1.png)

# 2. 초기 설정

`gcloud init`으로 초기 설정 수행

![295](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-2.png)

위와 같이 configuraton 을 설정하고
→ project 선택
→ default zone 이나 region 선택

![454](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-3.png)
- 서울 = `asia-northeast3`

# 3. 확인

`gcloud auth list` : 현재 로그인 계정 확인
![290](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-4.png)

`gcloud config list` : 현재 프로젝트 확인
![285](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-5.png)

or `gcloud config get-value project`

`gcloud config set project <프로젝트 ID>` : 프로젝트 변경

1. `gcloud projects list` : 프로젝트 리스트
![355](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-6.png)

2. `gcloud compute zones list` : zone 리스트
![353](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-7.png)

- 위 2개와 같이 간단한 명령어로 동작하는지 확인 가능

---

# ADC 구성

- auth login = CLI용

`gcloud auth application-default login`
→ 브라우저 열리고 권한 및 로그인 허용 하게되면
![363](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-8.png)![419](Experience/MGC_SA_Bootcamp/9_GCP/20_실습/img/20260420-9.png)

- 확인 : `gcloud auth application-default print-access-token`
	- 토큰이 출력되면 ADC 준비 완

---

# Linux ver.

- 리눅스 버전 설치 명령어들 순서대로

패키지 다운로드
```
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
```

압축 해제
```
tar -xf google-cloud-cli-linux-x86_64.tar.gz
```

설치 스크립트 실행
```
./google-cloud-sdk/install.sh
```

쉘 반영
```
source ~/.bashrc
```

if) zsh 라면
```
source ~/.zshrc
```

확인
```
gcloud version
```

사용자 로그인
```
gcloud auth login
```

초기 설정
```
gcloud init
```

로그인 계정 확인
```
gcloud auth list
```

프로젝트 확인
```
gcloud config list
```

프로젝트 변경
```
gcloud config set project <프로젝트ID>
```

테스트 명령
```
gcloud projects list
```
```
gcloud compute regions list
```

**ADC**

실행
```
gcloud auth application-default login
```

확인
```
gcloud auth application-default print-access-token
```

로그아웃
```
gcloud auth revoke
```

특정 계정 삭제
```
gcloud auth revoke user@example.com
```

ADC 제거 또는 정리
```
gcloud init
```