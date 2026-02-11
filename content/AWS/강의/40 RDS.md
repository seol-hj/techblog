# 🧠 RDS

---

## 1️. Amazon RDS 기초

### 핵심 개념

- **Amazon RDS**는 AWS가 제공하는 **관리형 관계형 데이터베이스 서비스**
- DB 설치, 패치, 백업, 장애 대응을 **AWS가 대신 관리**
- 사용자는 애플리케이션 개발에 집중 가능

### 핵심 포인트

- 관계형 DB 전용 (MySQL, PostgreSQL 등)
- VPC 내부에서 동작
- **Multi-AZ**로 고가용성 구성 가능
- **Read Replica**로 읽기 성능 확장 가능

📌 한 줄

> _“RDS는 관계형 DB 운영을 AWS에 위임하는 서비스”_

---

## 2️. RDS 인증과 접속

### 핵심 개념

- RDS는 **고정 IP를 제공하지 않음**
- 항상 **DNS Endpoint**로 접속해야 함

### 접속 구조 핵심

- Production DB는 **Private Subnet**
- 외부 접근 시
    - Bastion Host
    - Instance Connect Endpoint
    - VPN / Direct Connect 사용

### 인증 방식

- Username / Password
- **IAM DB 인증** (15분 토큰)
- Kerberos (엔터프라이즈)

📌 한 줄

> _“RDS는 Private Subnet + DNS + 보안 인증이 기본 전제”_

---

## 3️. Amazon Aurora

### 핵심 개념

- **AWS가 직접 개발한 고성능 관계형 DB**
- MySQL / PostgreSQL 호환
- RDS 계열이지만 **구조가 완전히 다름**

### 구조적 차이

- 컴퓨트(인스턴스) ↔ 스토리지 **분리**
- 스토리지는 **3 AZ / 6중 복제**
- Reader / Writer 구조

### 장점

- 빠른 Failover
- 읽기 확장 용이
- 고가용성 기본 내장

📌 한 줄

> _“Aurora는 RDS의 상위 개념이 아니라, 구조부터 다른 AWS 네이티브 DB”_

---

## 4️. Aurora Serverless

### 핵심 개념

- Aurora의 **자동 확장형(Serverless) 배포 옵션**
- 인스턴스 크기·개수 직접 관리 ❌
- 트래픽에 따라 자동으로 확장/축소

### 핵심 요소

- **ACU (Aurora Capacity Unit)** 기반 스케일링
- Auto Pause 가능 (비용 절감)
- Cold Start 존재

### 사용 적합성

- 개발 / 테스트
- 간헐적 트래픽
- 초기 서비스

📌 한 줄

> _“Aurora Serverless는 ‘항상 켜둘 필요 없는 Aurora’”_

---

## 5️. Amazon RDS Proxy

### 핵심 개념

- 애플리케이션과 DB 사이의 **관리형 프록시**
- **DB 커넥션 풀링을 AWS가 관리**

### 왜 필요한가?

- Lambda / ECS / EKS 환경에서
    - 커넥션 폭증 문제
    - DB 장애 발생 가능

### 효과

- 커넥션 수 제한
- Failover 시 연결 안정성
- Secrets Manager와 연동

📌 한 줄

> _“RDS Proxy는 DB 커넥션 문제를 해결하는 중간 계층”_

---

## 6️. AWS Secrets Manager

### 핵심 개념

- DB 비밀번호, API Key 같은 **민감 정보 관리 서비스**
- 코드나 설정 파일에 비밀 정보 저장 ❌

### 주요 기능

- KMS 기반 암호화
- IAM 기반 접근 제어
- **자동 비밀번호 회전(Rotation)**

### 실무 조합

- RDS / Aurora + Secrets Manager
- RDS Proxy와 함께 사용 시 효과 극대화

📌 한 줄

> _“Secrets Manager는 비밀 정보의 표준 저장소”_

---

## 🔗 전체 흐름

```
Application
   ↓
RDSProxy
   ↓ (Secret 조회)
SecretsManager
   ↓
RDS /Aurora
```

- DB는 Private Subnet
- 인증 정보는 코드에 없음
- 커넥션은 Proxy가 관리
- 장애·회전·확장은 AWS가 처리

---

## 🧠 선택 기준

- ✔️ 단순 서비스 → **RDS**
- ✔️ 고성능·고가용성 → **Aurora**
- ✔️ 불규칙 트래픽 → **Aurora Serverless**
- ✔️ 서버리스 환경 → **RDS Proxy**
- ✔️ 비밀번호 관리 → **Secrets Manager**

---

## ✨ 최종 한 문장

> **Amazon RDS 생태계는 관계형 데이터베이스를 안전하고 확장 가능하게 운영하기 위해 DB(Aurora/RDS), 접속(RDS Proxy), 인증(Secrets Manager)을 역할별로 분리해 제공하는 구조다.**