---
title: Amazon RDS
date: 2026-02-01
updated: 2026-02-01
tags:
  - aws
  - certification
  - saa-c03
  - database
  - rds
  - aurora
  - elasticache
draft: false
---

> **RDS (Relational Database Service)**
> SQL 기반 관계형 데이터베이스를 **완전관리형**으로 제공하는 AWS 서비스

### 지원 엔진

- PostgreSQL
- MySQL
- MariaDB
- Oracle
- Microsoft SQL Server
- IBM DB2
- **Amazon Aurora (AWS 전용 DB)**

---

## ⚖️ RDS vs EC2 직접 DB 설치

> RDS를 사용하는 이유 = **운영 부담 제거**

### RDS 장점

- 자동 프로비저닝
- OS 패치 자동화
- **지속적 백업 + 시점 복구 (PITR)**
- 모니터링 대시보드
- **Read Replica**
- **Multi-AZ (DR)**
- 유지보수 윈도우
- 수직 / 수평 스케일링
- EBS 기반 스토리지

### 제한 사항

- ❌ DB 서버에 **SSH 접근 불가**

---

## 📈 RDS Storage Auto Scaling

> 스토리지 부족을 **자동으로 감지 & 확장**

### 동작 조건

- Free Storage < 10%
- 상태가 **5분 이상 지속**
- 마지막 확장 후 **6시간 경과**
- **Maximum Storage Threshold** 사전 설정 필요

### 특징

- 수동 확장 불필요
- 예측 불가능한 워크로드에 적합
- **모든 RDS 엔진 지원**

---

## 📚 RDS Read Replicas (읽기 확장)

> 읽기 성능 향상을 위한 **비동기 복제**

### 핵심 특징

- 최대 **15개 Read Replica**
- 위치
    - Same AZ
    - Cross AZ
    - Cross Region
- **ASYNC 복제**
    - Eventually Consistent
- Read Replica → 독립 DB로 승격 가능
- 애플리케이션에서 **Read 전용 엔드포인트 분리 필요**

```
Writes → Master
Reads  → Read Replicas
```

---

## 🧪 Read Replica 사용

- 프로덕션 DB는 정상 운영
- 분석 / 리포팅 워크로드 추가
- Read Replica에서 SELECT 전용 처리
- **쓰기 부하에 영향 없음**

---

## 💸 Read Replica – 네트워크 비용

- **Same Region**
    - Cross AZ 포함 → ❌ 비용 없음
- **Cross Region**
    - ✅ 네트워크 비용 발생

---

## 🛡️ RDS Multi-AZ (Disaster Recovery)

> **고가용성 목적 (스케일링 아님)**

### 구조

- Master DB (AZ A)
- Standby DB (AZ B)
- **SYNC 복제**
- 단일 DNS
- 자동 Failover

### 특징

- AZ / 네트워크 / 인스턴스 / 스토리지 장애 대응
- 애플리케이션 수정 ❌

---

## 🔄 Single-AZ → Multi-AZ 전환

> **무중단 전환 가능**

### 내부 동작

1. DB Snapshot 생성
2. 다른 AZ에 Standby DB 복원
3. Master ↔ Standby 동기화

---

## 🧩 RDS Custom

> **OS & DB에 직접 접근 가능한 RDS**

### 제공 기능

- Oracle / SQL Server
- OS & DB 설정 변경
- 패치 설치
- 네이티브 기능 활성화
- **SSH / SSM Session Manager 접근 가능**

### 비교

- RDS: AWS가 전부 관리
- RDS Custom: **Full Admin 권한**

---

## 🚀 Amazon Aurora

> **AWS 전용 고성능 관계형 DB**

### 핵심 특징

- MySQL / PostgreSQL 호환
- 성능
    - MySQL RDS 대비 **5배**
    - PostgreSQL RDS 대비 **3배**
- 스토리지
    - 10GB 단위 자동 확장
    - 최대 **128TB**
- 최대 **15개 Replica**
- Replica Lag < 10ms
- **Failover 거의 즉시**
- 비용
    - RDS 대비 약 **20% 비쌈**
    - 효율은 더 높음

---

## 🏗️ Aurora High Availability 구조

> 스토리지 레벨에서 고가용성 내장

### 구조

- **3 AZ에 6개 데이터 복제본**
- Write: 6개 중 4개 필요
- Read: 6개 중 3개 필요
- Peer-to-peer 복제
- Self-Healing
- 수백 개 볼륨에 데이터 스트라이핑

---

## 🔌 Aurora Cluster 엔드포인트

- **Writer Endpoint**
    - Master 인스턴스
- **Reader Endpoint**
    - Read Replica 로드밸런싱
- **Shared Storage Volume**
    - 모든 인스턴스 공유

---

## ⚙️ Aurora 주요 기능

- 자동 Failover
- 백업 & 복구
- 보안 & 격리
- 컴플라이언스
- 버튼 클릭 스케일링
- 무중단 패치
- 고급 모니터링
- **Backtrack**
    - 백업 없이 특정 시점 복원

---

## 📊 Aurora Replica Auto Scaling

> 읽기 부하에 따라 Replica 자동 증감

- CPU / 요청량 기반
- Reader Endpoint 자동 확장

---

## 🎯 Aurora Custom Endpoints

> 특정 워크로드를 특정 Replica로 분리

- 예: 분석 쿼리는 고사양 Replica로
- Reader Endpoint 대신 **Custom Endpoint 사용**

---

## ⚡ Aurora Serverless

> 사용량 기반 **완전 자동 DB**

### 특징

- 자동 인스턴스 생성 / 스케일
- 간헐적·예측 불가 워크로드에 적합
- 용량 계획 ❌
- 초 단위 과금
- 경우에 따라 비용 ↑

---

## 🌍 Aurora Cross-Region & Global Database

### Cross-Region Read Replica

- DR 목적
- 간단한 구성

### Aurora Global Database (권장)

- Primary Region (Read/Write)
- 최대 **5개 Secondary Region**
- 각 Secondary Region당 최대 16 Replica
- Replication Lag < 1초
- Region 승격 RTO < 1분
- 글로벌 지연 시간 감소

---

## 🤖 Aurora Machine Learning

> SQL에서 바로 ML 예측 수행

### 연동 서비스

- Amazon SageMaker
- Amazon Comprehend

### 사용 예

- 추천 시스템
- 사기 탐지
- 감성 분석
- 광고 타게팅

---

## 💾 RDS Backups

### Automated Backups

- Daily Full Backup
- Transaction Log: 5분 간격
- **Point-in-Time Restore**
- 보존 기간: 1 ~ 35일
- 0 → 비활성화

### Manual Snapshots

- 수동 생성
- 무기한 보존 가능

> ⚠️ RDS 중지 상태에서도 스토리지 비용 발생
> 
> → 장기 중지 시 Snapshot + Restore 권장

---

## 💾 Aurora Backups

- Automated Backup
    - 1 ~ 35일
    - **비활성화 불가**
- Manual Snapshot
    - 무기한 보존

---

## ♻️ Restore 옵션

- Restore 시 **항상 새 DB 생성**
- MySQL RDS
    - On-Prem → S3 → RDS
- MySQL Aurora
    - Percona XtraBackup → S3 → Aurora

---

## 🧬 Aurora Database Cloning

> **Snapshot보다 빠른 복제**

### 특징

- Copy-on-Write
- 초기 스토리지 공유
- 변경 시에만 분리
- 매우 빠르고 비용 효율적
- **프로덕션 → 스테이징 DB**에 최적

---

## 🔐 RDS & Aurora 보안

### At-rest Encryption

- KMS 기반
- 생성 시 설정 필수
- Master 미암호화 → Replica 암호화 ❌

### In-flight Encryption

- TLS 기본 지원

### IAM Authentication

- 비밀번호 대신 IAM Role

### Network Security

- Security Group 기반 제어
- SSH 접근 ❌ (RDS Custom 제외)

### Audit Logs

- CloudWatch Logs 연동 가능

---

## 🧵 Amazon RDS Proxy

> DB 연결을 효율적으로 관리하는 **중간 프록시**

### 특징

- Connection Pooling
- DB 부하 감소
- Failover 시간 최대 **66% 단축**
- Serverless / Multi-AZ
- Lambda와 궁합 좋음
- Secrets Manager 연동
- **Public 접근 불가 (VPC 내부 전용)**

---

## ⚡ Amazon ElastiCache Overview

> **인메모리 캐시 DB (Redis / Memcached)**

### 목적

- DB Read 부하 감소
- 초저지연
- 애플리케이션 Stateless화

### 특징

- AWS가 운영 전부 관리
- **애플리케이션 코드 변경 필수**

---

## 🧱 ElastiCache – DB Cache 패턴

```
Cache Hit  → ElastiCache
Cache Miss → RDS →Cache 저장
```

- 반드시 **Cache Invalidation 전략 필요**

---

## 👤 ElastiCache – Session Store 패턴

- 사용자 세션을 캐시에 저장
- 어떤 EC2로 요청 와도 로그인 유지

---

## 🆚 Redis vs Memcached

### Redis

- Multi-AZ + Auto Failover
- Read Replica
- 영속성 (AOF)
- 백업 / 복구
- Sets / Sorted Sets 지원

### Memcached

- 샤딩 기반
- HA ❌
- 비영속
- 멀티스레드
- 단순 캐시용

---

## 🔐 ElastiCache 보안

### Redis

- IAM Authentication
- Redis AUTH (비밀번호)
- SSL In-flight Encryption

### Memcached

- SASL 인증 지원

---

## 🧠 ElastiCache 사용 패턴

- **Lazy Loading**
    - 캐시 미스 시 DB 조회
    - Stale Data 가능
- **Write Through**
    - DB write 시 캐시 동시 갱신
- **Session Store**
    - TTL 기반 세션 저장

> 인용
> 
> “캐시 무효화와 이름 짓기가 컴퓨터 과학에서 가장 어렵다”

---

## 🏆 Redis 대표 사용 사례

> **게임 리더보드**

- Sorted Set 사용
- 실시간 순위 계산
- 고성능 & 정렬 보장