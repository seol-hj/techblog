---
title: Cloudflare 연결과 커스텀 도메인 설정
draft: false
date: 2026-02-12
updated: 2026-02-12
tags:
  - Obsidian
  - GitHub
  - Cloudflare
---

## 0. 전체 흐름 구조

```
Obsidian (content 폴더에 글 작성)  
        ↓  
GitHub (v4 브랜치 push)  
        ↓  
Cloudflare Pages (자동 빌드)  
        ↓  
내 블로그 URL로 연결
```

---

## 1. Cloudflare Pages 프로젝트 생성

1. Cloudflare 로그인
2. 왼쪽 상단 `+추가` 의 `Pages` 선택하여 생성
![](Project/Obsidian/img/20260215-2.png)

3. `기존 Git 리포지토리 가져오기` 선택
4. 전에 만들었던 Git 리포지토리를 선택해서 `설정 시작`
![](Project/Obsidian/img/20260215-3.png)

---

## 2. 설정

1. 프로덕션 분기
	- `v4`

2. 빌드 설정
	1. 프레임워크 미리 설정
		- -> none
	2. 빌드 명령
		- `npx quartz build`
	3. 빌드 출력 디렉터리
		- `/public`

![](Project/Obsidian/img/20260215-4.png)

---

## 3. 이후 동작 방식

- 이제  
  `git push origin v4`  
  하면
	- Cloudflare 자동 감지
	- 자동 빌드 및 배포

> [!note]
> 커뮤니티 플러그인 사용 시
> 우측 사이드 바에 `commit` 과 `push` 버튼으로
> 생략 가능

---

## 4. 커스텀 도메인 연결

1. Cloudflare Pages → 사용자 설정 도메인
	> - 도메인이 있는 경우 → 사용 가능
	> - 도메인이 없는 경우 → 구매 가능
- 나는 새로운 도메인 (`hyungjoon.kim`) 구매
![](Project/Obsidian/img/20260215-5.png)

2. 도메인 추가
3. DNS 자동 설정

---

## 5. 최종 구조

```
Obsidian  
   ↓  
content 폴더 저장  
   ↓  
git push (v4)  
   ↓  
GitHub  
   ↓  
Cloudflare Build  
   ↓  
실제 블로그 사이트  
```