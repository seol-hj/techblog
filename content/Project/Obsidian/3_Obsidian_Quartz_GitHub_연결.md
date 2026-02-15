---
title: GitHub Repository 연결
draft: false
date: 2026-02-12
updated: 2026-02-12
tags:
  - Obsidian
  - GitHub
---

## 0. 전체 흐름

- Obsidian 👉 로컬에서 글 작성 (Markdown)
- GitHub Repository 👉 글 저장 + 버전 관리
- Quartz 👉 Markdown → 정적 사이트 변환

---

## 1. GitHub Repo 생성

1. GitHub 접속 후
2. New Repository
![](Project/Obsidian/img/20260215.png)

---

## 2. Quartz 레포 clone

1.  Quartz 레포 clone
	`git clone https://github.com/jackyzha0/quartz.git`
	`cd quartz`
2. v4 브랜치 사용
	`git checkout v4`

> Obsidian 에서 content/ 만 vault 로 open

---

## 3. 글작성 → GitHub 반영

1. Obsidian 에서 글 작성
	- ex) `content/AWS/EC2.md`

2. 터미널에서
	```
	cd quartz
	git add .
	git commit -m "EC2 post"
	git push origin v4
	```


> [!info] 자동화 방법
> - Obsidian → Community plugins → **Git**
> 설정하면 :
> - 자동 commit
> - 자동 push 가능
> 
> ![](Project/Obsidian/img/20260215-1.png)
