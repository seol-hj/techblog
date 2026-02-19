---
title: Giscus로 댓글 기능 만들기
draft: false
date: 2026-02-12
updated: 2026-02-12
tags:
  - Obsidian
  - Quartz
  - Giscus
---

## 1. Giscus

giscus 는 GitHub Discussions를 댓글 DB처럼 사용해 Quartz에 댓글을 달 수 있게 함
방문자는 GitHub 로그인으로 댓글을 남길 수 있고, 댓글은 내 GitHub 레포의 Discussions에 저장됨

---

## 2. Giscus 붙이기

1. GitHub의 Discussions를 켜기
![](Project/Obsidian/img/20260219.png)

2. giscus 앱을 내 GitHub 에 설치
3. 댓글 저장소 레포 접근 권한 주기

4. [Giscus](https://giscus.app/ko) 에 들어가 원하는대로 설정값을 생성
![](Project/Obsidian/img/20260219-1.png)

5. 해당 스크립트를 `quartz.layout.ts` 에서 Comments 컴포넌트를 추가
	- `quartz.layout.ts`의 afterBody 에 Comment를 넣고
	- `quartz.config.ts` 에 giscus 설정값을 넣기