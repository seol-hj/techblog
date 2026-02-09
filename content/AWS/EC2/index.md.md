# 🧠 Amazon EC2 전체 요약

## EC2 한 문장 정의

> **EC2는 “언제든 생성·삭제·교체 가능한 컴퓨팅 자원”이며, 클라우드에서는 서버를 관리하지 않고 시스템을 설계한다.**

---

## 1️⃣ EC2 기본 개념 흐름

### EC2 = 서버

- CPU / 메모리 / 네트워크를 가진 가상 서버
- 필요할 때 생성, 필요 없으면 종료
- 사용한 만큼만 비용 지불

### 핵심 사고 전환

- ❌ 서버를 오래 유지한다
- ✅ 서버는 언제든 사라져도 괜찮아야 한다

---

## 2️⃣ 인스턴스 구조 핵심

### EC2 인스턴스 구성

- **AMI**: 서버 설계도
- **인스턴스 타입**: 성능 결정
- **EBS**: 데이터 저장
- **ENI**: 네트워크
- **보안 그룹**: 방화벽
- **IAM Role**: 권한
- **User Data**: 초기 자동 설정

> 👉 컴퓨팅 / 스토리지 / 네트워크 / 권한은 **반드시 분리**

---

## 3️⃣ 스토리지 정리 (EBS / AMI / Snapshot / EFS)

### EBS

- EC2에 붙는 디스크
- 인스턴스 종료해도 데이터 유지
- 대부분의 운영 서버 표준

### Snapshot

- EBS의 특정 시점 백업
- 증분 백업
- 복구 및 AMI 생성에 사용

### AMI

- EC2를 찍어내는 이미지
- Auto Scaling, 표준 서버 구성의 핵심

### EFS

- 여러 EC2가 동시에 쓰는 공유 파일 시스템
- Auto Scaling 환경에서 파일 공유용

---

## 4️⃣ 네트워크 핵심 (ENI / IP / 보안)

### ENI

- EC2의 가상 네트워크 카드
- IP, 보안 그룹은 **ENI에 붙음**

### Public IP / Elastic IP

- 기본 Public IP는 재시작 시 변경
- Elastic IP 사용 시 고정

### 보안 그룹

- 인스턴스 방화벽
- 기본 차단, 허용만 설정
- 실무 보안의 80%

---

## 5️⃣ 접속 & 권한

### EC2 접속

- SSH: 기본 방식
- Session Manager: 운영 환경 권장
- Instance Connect / Serial Console: 보조 수단

### 권한 부여

- ❌ Access Key 직접 저장
- ✅ IAM Role 사용 (정답)

---

## 6️⃣ EC2 생명주기

### 상태 흐름

- pending → running → stopping → stopped → terminated

### 핵심 차이

- **Stop**: 다시 켤 수 있음
- **Terminate**: 완전 삭제

> 👉 서버 종료 ≠ 데이터 삭제 (EBS 기준)

---

## 7️⃣ 요금 모델 요약

### EC2 요금

- On-Demand: 즉시 사용, 비쌈
- Reserved / Savings Plan: 장기 약정, 저렴
- Spot: 매우 저렴, 중단 가능

### ELB 요금

- 시간 요금 + 트래픽 요금
- ALB: LCU
- NLB: NLCU

---

## 8️⃣ Auto Scaling & Load Balancing

### Auto Scaling

- 인스턴스 수 자동 관리
- 핵심은 **스케일링 정책**

### 정책 종류

- Target Tracking (실무 기본)
- Step Scaling
- Simple Scaling

### 기타 기능

- 헬스 체크 기반 자동 교체
- Lifecycle Hook
- Instance Protection
- 스케줄 스케일링
- Mixed Instances Policy

---

### ELB (Load Balancer)

- 사용자와 서버 사이 완충지대
- Auto Scaling과 필수 조합

### 종류

- ALB: HTTP/HTTPS (가장 많이 사용)
- NLB: TCP/UDP (고성능)
- GWLB: 보안 장비용

### ALB 핵심

- 리스너: 포트/프로토콜
- 규칙: 라우팅 로직
- 대상 그룹: 실제 서버 묶음

---

## 9️⃣ 모니터링 & 자동화

### CloudWatch

- 지표 수집
- 알람
- Auto Scaling 판단 기준

### 기본 지표

- CPU / 네트워크 / 디스크
- 메모리는 커스텀 필요

> 👉 **모니터링 = 자동화의 눈**

---

## 🔟 User Data & Metadata

### User Data

- EC2 최초 부팅 시 자동 실행 스크립트
- 서버 세팅 자동화의 시작

### Metadata

- EC2 자기 자신 정보
- IMDS v2 사용 권장 (보안)

---

## 1️⃣1️⃣ 인스턴스 타입 전략

### T 타입

- Burst 기반
- 저비용
- 웹/개발/테스트에 적합

### 타입 선택 기준

- CPU 지속 사용 → C/M/R
- 트래픽 들쭉날쭉 → T
- ARM 가능 → Graviton 고려

---

## 1️⃣2️⃣ 인스턴스 변경 전략

### 변경 가능

- Stop 후 타입/사이즈 변경
- EBS, 보안 그룹, IAM Role 유지

### 실무 권장

- 운영 서버: **AMI 기반 재생성**
- Auto Scaling: **Launch Template 수정 후 교체**

---

## 🧩 EC2 설계 핵심 원칙 7가지

1. EC2는 **소모품**
2. 상태는 **외부로 분리**
3. Auto Scaling 전제 설계
4. ELB와 항상 함께 사용
5. 권한은 IAM Role
6. 자동화(User Data) 우선
7. 모니터링 없으면 운영 아님

---

## 🧠 최종 한 문장 요약

> **EC2를 잘 쓴다는 것은 서버를 잘 다루는 게 아니라, 서버가 없어도 시스템이 유지되게 설계하는 것이다.**


## EC2 기초
- [[01-ec2-기초]]