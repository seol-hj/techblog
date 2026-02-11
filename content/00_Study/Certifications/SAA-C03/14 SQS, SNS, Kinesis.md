---
title: SQS, SNS, Kinesis
date: 2026-02-01
updated: 2026-02-01
tags:
  - aws
  - certification
  - saa-c03
  - integration
  - sqs
  - sns
  - kinesis
draft: false
---
## 1️. 애플리케이션 간 통신

여러 애플리케이션을 배포하기 시작하면 **서로 통신**이 필요해짐.

### 애플리케이션 통신 패턴 2가지

### 1. 동기식 통신 (Synchronous)

```
ApplicationA ──▶ ApplicationB
```

### 2. 비동기 / 이벤트 기반 통신 (Asynchronous)

```
ApplicationA ──▶ Queue ──▶ ApplicationB
```

> 구매 서비스 ↔ 배송 서비스처럼 직접 호출하는 구조 vs
> 구매 서비스 → 큐 → 배송 서비스 구조

---

## 2️. 동기식 통신의 한계와 디커플링 필요성

### 문제 상황

- 트래픽이 갑자기 폭증할 경우 취약
- 예: 평소 10개 영상 인코딩 → 갑자기 1000개 요청

### 해결 전략: **디커플링(Decoupling)**

> 애플리케이션을 직접 연결하지 않고 **중간 매개체**를 둠

### AWS가 제공하는 디커플링 서비스

- **SQS**: Queue 기반 모델
- **SNS**: Pub / Sub 모델
- **Kinesis**: 실시간 스트리밍 모델

➡ 애플리케이션과 **독립적으로 확장 가능**

---

## 3️. Amazon SQS 개념

### Queue 구조

```
Producer ──▶ SQS Queue ──▶ Consumer
```

- 여러 Producer 가능
- 여러 Consumer 가능
- Producer는 메시지를 **보내기만**
- Consumer는 메시지를 **가져가서 처리**

---

## 4️. Amazon SQS – Standard Queue

### 기본 특성

- 10년 이상 사용된 가장 오래된 메시징 서비스
- 완전관리형
- 애플리케이션 디커플링 목적

### 주요 속성

- **무제한 처리량**
- **큐 메시지 수 제한 없음**
- 메시지 보관 기간
    - 기본 4일
    - 최대 14일
- **낮은 지연 시간** (< 10ms)
- 메시지 최대 크기: **256KB**

### 전달 특성

- **At-least-once delivery**
    - 중복 메시지 가능
- **Best-effort ordering**
    - 순서 보장 ❌

---

## 5️. SQS – 메시지 생성 (Producing)

### 흐름

```
Producer ──SendMessageAPI ──▶SQS
```

- SDK 사용
- 메시지는 Consumer가 삭제할 때까지 SQS에 저장

### 메시지 예시

- Order ID
- Customer ID
- 사용자 정의 Attribute

---

## 6️. SQS – 메시지 소비 (Consuming)

### Consumer 동작

```
Consumer ──▶ ReceiveMessage (최대10개)
           └─▶ 처리 (예: RDS 저장)
           └─▶ DeleteMessage
```

- EC2, 서버, Lambda 가능
- **삭제(Delete)** 하지 않으면 다시 처리됨

---

## 7️. 다중 Consumer 구조

### 특징

- 여러 Consumer가 병렬 처리
- 수평 확장 가능
- At-least-once 보장
- Best-effort 순서

```
SQS Queue
 ├─ Consumer1
 ├─ Consumer2
 └─ Consumer3
```

---

## 8️. SQS + Auto Scaling Group

### 자동 확장 구조

```
CloudWatch (Queue Length)
        ↓
Auto Scaling Group
        ↓
EC2 Consumers
```

- 지표: `ApproximateNumberOfMessages`
- 메시지 많아지면 Consumer 자동 증가

---

## 9️. 애플리케이션 계층 분리 아키텍처

```
Front-endApp
   │SendMessage
   ▼
SQSQueue(무한 확장)
   │ReceiveMessage
   ▼
Back-endProcessingApp
```

➡ 프론트엔드와 백엔드 완전 분리

---

## 10. Amazon SQS – 보안

### 암호화

- 전송 중 암호화: HTTPS
- 저장 시 암호화: KMS
- Client-side 암호화 가능

### 접근 제어

- IAM Policy
- SQS Access Policy
    - Cross-account 접근
    - SNS, S3가 큐에 쓰기 허용 가능

---

## 1️1. Message Visibility Timeout

### 개념

- Consumer가 메시지를 가져가면 **일시적으로 숨김**
- 기본값: **30초**

### 타임라인

```
ReceiveMessage
 └─Visibility Timeout (30s)
     ├─ 처리 성공 → Delete
     └─ 실패 → 다시 Visible
```

### 주의점

- 너무 짧으면 중복 처리
- 너무 길면 장애 시 재처리 지연
- `ChangeMessageVisibility` API로 연장 가능

---

## 1️2. Long Polling

### 개념

- 메시지가 없을 때 **기다렸다가 수신**

### 장점

- API 호출 수 감소
- 비용 절감
- 지연 시간 감소

### 설정

- 1~20초 (20초 권장)
- Queue 레벨 or API 레벨(`WaitTimeSeconds`)

---

## 1️3. SQS FIFO Queue

### 특징

- **순서 보장 (First In First Out)**
- Exactly-once send
- 중복 제거 (Deduplication ID)
- Message Group ID 필수

### 처리량

- 300 msg/s (batch ❌)
- 3000 msg/s (batch ⭕)

---

## 1️4. 데이터베이스 보호를 위한 SQS 버퍼

### 문제

- 트래픽 급증 시 DB 직접 쓰기 → 장애 가능

### 해결

```
App ──▶ SQS ──▶ Consumer ──▶ DB
```

➡ DB write를 큐로 완충

---

## 1️5. Amazon SNS

> **하나의 메시지를 여러 구독자에게 전달**

### 구조

```
Producer ──▶ SNS Topic ──▶ Subscribers
```

### Subscriber 예시

- SQS
- Lambda
- HTTP(S)
- Email
- SMS
- Mobile Push

---

## 1️6. SNS 특징

- Producer는 **Topic 하나만 알면 됨**
- Subscriber 수 제한: **12,500,000**
- Topic 최대 100,000개
- 메시지 기본적으로 **모두 전달**
- (신규 기능) 메시지 필터링 가능

---

## 1️7. SNS + AWS 서비스 통합

SNS로 이벤트를 직접 보내는 서비스들:

- CloudWatch Alarms
- S3 Events
- Auto Scaling Notifications
- CloudFormation
- AWS Budgets
- Lambda
- DMS
- DynamoDB
- RDS Events

---

## 1️8. SNS 메시지 발행 방식

### Topic Publish

1. Topic 생성
2. Subscription 생성
3. Topic에 Publish

### Direct Publish (모바일)

- Platform Application
- Platform Endpoint
- GCM / APNS / ADM

---

## 1️9. SNS 보안

- HTTPS 전송 암호화
- KMS 저장 암호화
- IAM 정책
- SNS Access Policy
    - Cross-account
    - S3 등 타 서비스 Publish 허용

---

## 2️0. SNS + SQS Fan-Out 패턴

### 구조

```
Producer
   │
SNS Topic
 ├─ SQSQueue(Service A)
 ├─ SQSQueue(Service B)
 └─ SQSQueue(Service C)
```

### 장점

- 완전 디커플링
- 메시지 유실 없음
- 재시도 / 지연 처리 가능
- 구독자 자유롭게 추가
- Cross-Region 가능

---

## 2️1. S3 Event → 다중 Queue

### 제약

- 동일 이벤트 + prefix 조합은 **S3 Event 규칙 1개만 가능**

### 해결

```
S3Event ──▶ SNS ──▶ Multiple SQS
```

---

## 2️2. SNS → Kinesis Data Firehose → S3

```
SNS Topic
   │
KinesisData Firehose
   │
Amazon S3
```

- SNS는 Firehose로 전달 가능

---

## 2️3. SNS FIFO Topic

### 특징

- 메시지 순서 보장
- Deduplication 지원
- Message Group ID 사용
- SQS FIFO / Standard 구독 가능
- 처리량 제한 (SQS FIFO와 동일)

---

## 2️4. SNS FIFO + SQS FIFO Fan-Out

> **Fan-out + Ordering + Deduplication 필요 시**

```
SNS FIFO Topic
 ├─ SQS FIFO Queue
 └─ SQS FIFO Queue
```

---

## 2️5. SNS 메시지 필터링

### JSON 기반 필터 정책

- Subscription 단위로 설정
- 필터 없으면 모든 메시지 수신

### 예시

- State = Placed
- State = Declined
- State = Cancelled

---

## 2️6. Amazon Kinesis Data Streams

> **실시간 스트리밍 데이터 수집**

### 사용 사례

- Click Stream
- IoT
- Metrics / Logs

### 구성

```
Producers ──▶ KinesisData Streams ──▶ Consumers
```

---

## 2️7. Kinesis Data Streams 특징

- 데이터 보관: 최대 365일
- 데이터 재처리 가능 (Replay)
- 데이터 삭제 불가 (만료 시 삭제)
- 레코드 최대 1MB
- Partition Key 단위 순서 보장
- KMS / HTTPS 암호화

---

## 2️8. Kinesis 용량 모드

### Provisioned

- Shard 수 직접 지정
- 1 shard = 1MB/s in, 2MB/s out
- 시간당 shard 비용

### On-Demand

- 자동 확장
- 기본 4MB/s
- 시간 + 데이터 기반 요금

---

## 2️9. Amazon Data Firehose

### 개요

- 완전관리형
- 서버리스
- 자동 확장
- Near Real-Time

### 대상

- S3
- Redshift
- OpenSearch
- Splunk / Datadog / MongoDB / NewRelic
- Custom HTTP Endpoint

---

## 3️0. Firehose 아키텍처

```
Producers
 └─▶ Firehose
      ├─ (Optional) LambdaTransform
      ├─▶ Destination
      └─▶ S3 Backup (All / Failed)
```

---

## 3️1. Firehose 주요 기능

- CSV / JSON / Parquet / Avro / Raw / Binary
- Parquet / ORC 변환
- gzip / snappy 압축
- Lambda 기반 데이터 변환

---

## 3️2. Kinesis Streams vs Firehose

|항목|Kinesis Streams|Firehose|
|---|---|---|
|실시간|⭕|준실시간|
|데이터 저장|최대 365일|❌|
|Replay|⭕|❌|
|관리|직접|완전관리|
|확장|수동/자동|자동|

---

## 3️3. SQS vs SNS vs Kinesis 요약

### SQS

- Pull 모델
- 메시지 소비 후 삭제
- FIFO에서만 순서 보장

### SNS

- Push 모델
- Pub/Sub
- 데이터 저장 ❌
- Fan-out 가능

### Kinesis

- 실시간 대용량 스트리밍
- Shard 단위 순서
- Replay 가능

---

## 3️4. Amazon MQ

### 배경

- 기존 온프레미스 앱은 MQTT, AMQP, STOMP 사용

### Amazon MQ

- 관리형 메시지 브로커
- Queue + Topic 지원
- SQS/SNS보다 확장성 낮음
- Multi-AZ Failover 지원

---

## 3️5. Amazon MQ 고가용성

```
AZ-A (ACTIVE)
AZ-B (STANDBY)
   │
Shared Storage (EFS)
   │
Client Failover
```