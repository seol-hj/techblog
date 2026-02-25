---
title: Docker Buildx
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Container
  - Docker
  - buildx
---

- 기존 `docker build`
	- 현재 머신 아키텍처 기준 이미지 빌드
- `buildx`
	- 멀티 아키텍처 이미지 한 번에 생성 가능
	- BuildKit 기반 빌드 성능/캐시/병렬 처리 개선

1. **BuildKit**
	- 도커 빌드 엔진
	- 장점
		- 캐시 활용 최적화
		- 병렬 빌드
		- 출력 유형 다양(로컬 로드/레지스트리 푸시 등)

2. `buildx`
	- BuildKit을 CLI에서 사용 도커 플러그인
	- `docker buildx build` 명령으로 BuildKit 기능 사용

- 멀티 아키텍처 이미지(Manifest List)
	- 하나의 태그 아래 amd64 + arm64 이미지를 묶어둔 목록(Manifest List) 생성
	- 클라이언트가 `docker pull myapp:1.0` 하면 자기 CPU에 맞는 이미지 자동 선택

