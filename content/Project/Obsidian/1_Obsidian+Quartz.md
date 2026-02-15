---
title: 🪨Obsidian + ⚡Quartz
draft: false
date: 2026-02-12
updated: 2026-02-12
tags:
  - Obsidian
---
# 🪨 옵시디언(Obsidian) + ⚡ Quartz

---

## 🪨 Obsidian으로 선택한 이유
---
### 1. Markdown 기반

- 노션에 있는 글을 가져오기 편함

### 2. Quartz + Cloudflare

```
Obsidian (Markdown 작성)  
    ↓   
GitHub push  
    ↓   
Quartz build  
    ↓   
Cloudflare Pages 배포  
```

✔ 서버 필요 없음  
✔ 비용 X  
✔ Cloudflare -> HTTPS 적용  
✔ 정적 사이트라 빠름

### 3. 로컬 First 💾

- 내 글을 로컬에 저장
- 인터넷 없이도 작성 가능
- GitHub와 연동해 백업 관리 가능

### 4. 시각적

- Graph View 지원
	- 노트 간 연결 구조를 시각적으로 파악하기 쉬움

---
## ⚡Quartz
---
### 1. 역할

- Obsidian Markdown을 웹사이트로 변환
- 정적 사이트 생성기

> Obsidian은 작성도구
> Quartz는 배포 엔진

### 2. 특징

- 커스터마이징 가능
	- 레이아웃 수정
	- 컴포넌트 추가

- Obsidian 구조 그대로 반영
	- 폴더 구조 유지
	- 내부 링크 자동 반영
	- Graph View 구현 가능

- 정적 사이트 생성
	- 서버 필요 X

> [!note]
> Obsidian + Quartz로
> ✍ 글쓰기 + ⚙ 인프라 + 🌐 웹 배포
> 가능