---
title: Google Analytics로 블로그 모니터링 하기
draft: false
date: 2026-02-12
updated: 2026-02-12
tags:
  - Obsidian
  - Cloudflare
  - Google_Analytics
---

> 생성된 블로그가 얼마나 조회되는가를 보고싶어 Google Analytics 를 사용하기로 했다

---

## 1. 측정 생성

![](Project/Obsidian/img/20260219-2.png)

- google 아이디로 로그인을 하고 google analytics 를 접속하여 측정시작을 누른다
- 설정값은 개인에 맞춰 설정

---

## 2. 측정 스트림 생성

- 블로그 url을 넣어 스트림을 생성해준다
- 측정 ID를 복사하여 `quartz.config.ts` 에 넣어줘야 한다
![](Project/Obsidian/img/20260219-3.png)

---

## 결과

![](Project/Obsidian/img/20260219-4.png)
- 설정 완료 후 잠시 기다리면 이렇게 조회가 가능하다

![](Project/Obsidian/img/20260219-5.png)
- 다양한 기준으로 조회가 가능하니 확인해보자