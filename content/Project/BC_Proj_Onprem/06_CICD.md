---
title: 운영 자동화 및 외부 접근/보안 확장
draft: false
date: 2026-03-20
updated: 2026-03-20
tags:
  - ArgoCD
  - HTTPS
  - Cloudflare Tunnel
---

>[!info] 목표
>배포 자동화 (GitOps), HTTPS 보안, 외부 접근 (Cloudflare), 아키텍처 비교 검증  
>**실제 운영 환경 수준의 서비스 구조 완성**

## 수행 내용

- GitOps 기반 CI/CD 구축
	- `ArgoCD` 설치
	- Git Repository 연동
	- Helm Chart 기반 배포 구조 구성
	- Git Push 시 자동 배포 (Sync) 구성
- HTTPS 인증 자동화 (cert-manager)
	- cert-manager 설치
	- ClusterIssuer 생성
	- Certificate 리소스 생성
	- TLS Secret 자동 생성
	- Ingress에 TLS 적용
- Cloudflare Tunnel 기반 외부 접근
	- Cloudflare Tunnel 구성
	- Ingress와 연결 → 외부 접근 가능
	- 공인 IP X → HTTPS 기반 접근 구현
		- 구조 : `User → Cloudflare → Tunnel → Ingress → Service`
- 아키텍처 비교 환경 구성
	- 기존 3-Tier 구조 서비스 구성
	- Kubernetes 기반 개선 아키텍처 구성
	- 두 구조를 동일 환경에서 운영
- Grafana 통합 대시보드 구성
	- 3-Tier vs 개선 구조 비교 대시보드 구성
	- 주요 지표 시각화
		- CPU / Memory
		- 요청 처리량
		- Queue 적체 상태
		- Worker 처리 속도
## 결과

- ArogCD 기반 GitOps 도입
	- → **배포 시간 90% 단축**
	- → **배포 오류율 감소 (수동 배포 대비)**
- cert-manager 기반 HTTPS 자동화
	- → **인증서 관리 작업 100% 자동화**
- Cloudflare Tunnel 적용
	- → **공인 IP 없이 외부 접근 가능 (보안 노출 100% 감소)**
- HTTPS 적용
	- → **평문 통신 제거 (보안 수준 향상)**
- 3-Tier vs 개선 구조 비교 결과
	- → **트래픽 처리 안정성 증가 (에러율 n% 감소)**
	- → **리소스 사용 효율 개선 (CPU n% / Memory n% 감소)**

>ArgoCD → GitOps 기반 CI/CD  
>배포 과정 자동화 및 운영 일관성 확보  
>cert-manager → HTTPS 인증 자동화  
>Cloudflare Tunnel → 외부 접근 구성  
>보안성 및 접근성 동시 만족 구조  
>기존 3-Tier 아키텍처 vs 개선 구조 동일 환경 비교  
>Grafana 대시보드로 시각화  
>**데이터 기반 아키텍처 개선 효과 검증 환경 구축**