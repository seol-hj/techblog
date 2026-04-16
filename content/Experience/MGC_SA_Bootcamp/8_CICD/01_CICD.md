---
title: CI/CD 개요
draft: false
date: 2026-04-16
updated: 2026-04-16
tags:
  - DevOps
  - CI/CD
---

**DevOps = Development + Operations**

문제점
- 사일로(Silo) 구조의 문제 : 팀별 역할이 강하게 분리
- 수동 배포의 한계 : 재현성과 일관성 떨어짐

핵심 요소
- 문화 : 협업 문화
- 자동화 : 휴먼에러 감소
- 측정과 모니터링
- 공유 : 지식의 공유 구조


**CI/CD**

**CI = Continuous Integration 지속적 통합**

목적
- 통합 시점의 충돌 최소화
- 빌드 실패 조기 발견
- 테스트 자동화
- 코드 품질 유지
- 배포 가능한 상태를 지속적으로 유지

**CD = Continuous Delivery / Continuous Deployment**

**Continuous Delivery** : 언제든 운영 배포 가능한 상태로 소프트웨어를 유지
- 배포 직전까지 자동화, 운영 배포 버튼은 사람이 누를 수 있는 상태

**Continuous Deployment** : 사람 개입 없이 운영 환경까지 자동 반영

| 구분                    | 의미              | 자동화 범위              | 운영 배포 승인 |
| --------------------- | --------------- | ------------------- | -------- |
| CI                    | 코드 통합과 검증 자동화   | 빌드, 테스트 중심          | 포함되지 않음  |
| Continuous Delivery   | 배포 가능한 상태까지 자동화 | 빌드, 테스트, 패키징, 배포 준비 | 사람 승인 가능 |
| Continuous Deployment | 운영 반영까지 자동화     | 코드 변경부터 운영 배포까지     | 자동       |


**CI/CD 파이프라인 기본 구조**
```
Source
 → Build
 → Test
 → Package
 → Publish Artifact
 → Deploy
 → Verify
```
1. Source : Git과 같은 곳에 코드를 커밋
2. Build : 소스코드를 실행 가능한 형태로 변환
3. Test : 자동 테스트 수행
4. Package / Artifact : 빌드 결과물을 배포 가능한 단위로 묶음
5. Deploy : 특정 환경으로 배포
6. Verify : 정상 동작 여부 확인

![](Experience/MGC_SA_Bootcamp/8_CICD/img/20260416.png)
```
개발자 코드 변경
   ↓
형상관리 시스템(GitHub)
   ↓
CI 도구(Jenkins / GitHub Actions)
   ↓
빌드 및 테스트
   ↓
아티팩트 생성(Docker Image 등)
   ↓
배포 대상 환경 반영
   ↓
운영 모니터링 및 피드백
```