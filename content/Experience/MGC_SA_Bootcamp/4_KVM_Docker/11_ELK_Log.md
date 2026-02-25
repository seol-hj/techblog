---
title: ELK 로그 수집
draft: false
date: 2026-02-25
updated: 2026-02-25
tags:
  - Container
  - Docker
  - Logs
---
![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260225.png)
- Docker 컨테이너 로그 → 중앙 로그 시스템 → Kibana 시각화

- 구조
```
[Web Container]  
   │  stdout/stderr  
   ▼  
[Docker JSON Log File]  
   │  
   ▼  
[Filebeat]  
   │  
   ▼  
[Logstash]  
   │  
   ▼  
[Elasticsearch]  
   │  
   ▼  
[Kibana]  
```

> 컨테이너는 로그를 파일에 직접 작성 X
> 로그는 stdout / stderr → Docker 로그 드라이버 로 전달
> ELK는 로그를 중앙에서 수집·검색·시각화 하는 시스템


>[!note]
>컨테이너 로그는 파일 X stdout/stderr  
>Docker는 로그 → 호스트 파일(JSON) 로 저장  
>Filebeat → 로그 파일 읽는 수집기  
>Logstash → 가공/필터링  
>Elasticsearch → 저장/검색  
>Kibana → 시각화/UI