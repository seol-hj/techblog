# 📌 VPC

### 1️. 네트워크 기본

- VPC = 사설망
- CIDR = IP 범위 설계의 핵심

### 2️. 서브넷

- AZ 단위
- Public / Private는 라우팅 차이

### 3️. 인터넷 통신

- Inbound: IGW
- Outbound: NAT Gateway / Endpoint

### 4️. 보안

- 보안 그룹 = 주력
- NACL = 보조

### 5️. AWS 서비스 접근

- S3 / DynamoDB → Gateway Endpoint
- 나머지 → Interface Endpoint

### 6️. 서버 접속

- SSH ❌
- SSM ⭕

### 7️. VPC 연결

- Peering (소규모)
- Transit Gateway (대규모)

### 8️. 설계 원칙

- 크게 시작
- 계층 분리
- 멀티 AZ
- 인터넷 최소화