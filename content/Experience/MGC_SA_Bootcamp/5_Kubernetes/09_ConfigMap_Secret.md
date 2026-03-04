---
title: ConfigMap과 Secret
draft: false
date: 2026-03-04
updated: 2026-03-04
tags:
  - Containers
  - Kubernetes
  - ConfigMap
  - Secret
---

|항목|ConfigMap|Secret|
|---|---|---|
|**목적**|일반 설정 데이터 저장|민감한 데이터 저장|
|**데이터 형식**|평문(Plain text)|Base64로 인코딩|
|**사용 예**|로그 레벨, 포트 번호|비밀번호, API 키, 토큰|
|**보안**|낮음 (암호화 없음)|조금 높음 (암호화 권장)|
|**크기 제한**|1MB|1MB|

- ConfigMap과 Secret
	- 애플리케이션 코드와 설정 데이터를 분리하기 위해 사용
	- 소스코드 수정 X, 환경에 따라 설정 바꿀 수 있게 하는 저장소 역할

---

## ConfigMap

- **설정 데이터를 키-값 쌍으로 저장**
- 데이터 평문 저장
- 환경변수, 설정 파일로 Pod에 전달
- 수정 후 Pod 재시작 후 반영
- 재배포 없이 설정 변경 가능

#### 생성 방법

1. **YAML**
ex)
```
apiVersion: v1  
kind: ConfigMap  
metadata:  
  name: app-config  
  namespace:   
data:  
  LOG_LEVEL: "info"  
  DATABASE_URL: "postgres://db.default.svc.cluster.local:5432"  
  CACHE_TTL: "3600"  
  MAX_CONNECTIONS: "100"  
```
- `data` 섹션에 키-값 쌍 저장
- 모든 값 문자열 형식 (숫자도 문자열화)

2. **kubectl 명령어**
ex)
```
# 1. 직접 입력  
kubectl create configmap app-config \  
  --from-literal=LOG_LEVEL=info \  
  --from-literal=DATABASE_URL=postgres://db:5432 \  
  --from-literal=CACHE_TTL=3600  
  
# 2. 파일에서 생성  
kubectl create configmap app-config --from-file=config.properties  
  
# 3. 디렉토리 파일들로 생성  
kubectl create configmap app-config --from-file=/etc/config/  
```

3. **멀티라인 데이터 (파일 형식)**
```
apiVersion: v1  
kind: ConfigMap  
metadata:  
  name: nginx-config  
data:  
  nginx.conf: |  
    server {  
      listen 80;  
      server_name example.com;  
    
      location / {  
        proxy_pass http://backend:8080;  
      }  
    }  
  
  default.conf: |  
    upstream backend {  
      server backend1:8080;  
      server backend2:8080;  
    }  
```
- `|` 로 여러 줄 파일 내용 저장
- 설정 파일 전체 ConfigMap에 보관 가능

#### 조회

```
# ConfigMap 목록 조회  
kubectl get configmap   
  
# 상세 정보 조회  
kubectl describe configmap app-config  
  
# YAML 형식으로 조회  
kubectl get configmap app-config -o yaml  
  
# 특정 값 조회  
kubectl get configmap app-config -o jsonpath='{.data.LOG_LEVEL}'  
```

#### Pod에서 ConfigMap 사용

**방식 1. 환경변수**
```
apiVersion: v1  
kind: Pod  
metadata:  
  name: app-pod  
spec:  
  containers:  
  - name: app  
    image: myapp:latest  
    env:  
    # 직접 환경변수 설정  
    - name: LOG_LEVEL  
      valueFrom:  
        configMapKeyRef:  
          name: app-config        # ConfigMap 이름  
          key: LOG_LEVEL          # ConfigMap의 키  
  
    # 여러 환경변수를 한 번에 로드  
    envFrom:  
    - configMapRef:  
        name: app-config          # app-config의 모든 키-값이 환경변수가 됨  
```
- 차이점
	- `valueFrom` : 특정 키만 선택
	- `envFrom` : ConfigMap의 모든 키-값 사용

**방식 2. 파일로 마운트**
```
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: nginx-deployment  
spec:  
  replicas: 1  
  selector:  
    matchLabels:  
      app: nginx  
  template:  
    metadata:  
      labels:  
        app: nginx  
    spec:  
      containers:  
      - name: nginx  
        image: nginx:latest  
        ports:  
        - containerPort: 80  
        volumeMounts:  
        - name: config-volume  
          mountPath: /etc/nginx/conf.d  # 파일들이 위치할 폴더  
          readOnly: true  
      volumes:  
      - name: config-volume  
        configMap:  
          name: nginx-config  
          items:  
          - key: nginx.conf        # configmap의 key  
            path: custom.conf     # pod내에 생성될 파일  
         
          # items를 생략하면 data 아래의 모든 key가 파일로 생성된다.  
```
- `items` 생략 : `volumes` 에서 생략, `data` 아래 `nginx.conf`, `default.conf`가 각각 파일명으로 자동 생성
- `mountPath` 위치 : 컨테이너 내부의 `/etc/nginx/conf.d/` 경로 확인 시 파일 2개 (`/etc/nginx/conf.d/nginx.conf`, `/etc/nginx/conf.d/default.conf` 생성)

- `kubectl edit cm nginx-config` 로 내용 수정/저장
	- 컨테이너 내부 파일 내용 자동 업데이트
	- But, Nginx 는 설정 리로드 필요 (`kubectl exec -it <파드명> -- nginx -s reload`)

#### 수정 및 삭제

```
# ConfigMap 수정  
kubectl edit configmap app-config  
  
# ConfigMap 삭제  
kubectl delete configmap app-config  
  
# 여러 ConfigMap 삭제  
kubectl delete configmap app-config db-config cache-config
```
- Pod 재시작 필수
```
# Pod 재시작으로 새 설정 적용  
kubectl rollout restart deployment/myapp  
  
# 특정 Pod만 재시작  
kubectl delete pod <pod-name>  
```

---

## Secret

- **민감한 데이터 저장**
- Base64 인코딩 (암호화 X, 단순 인코딩)
- ConfigMap과 유사, But 민감한 데이터 용도
- etcd에 암호화되어 저장하도록 설정 가능
- 최대 1MB 크기 제한

|Secret 타입|용도|예시|
|---|---|---|
|`Opaque` (기본값)|일반 비밀 데이터|비밀번호, API 키|
|`kubernetes.io/basic-auth`|기본 인증|username, password|
|`kubernetes.io/ssh-auth`|SSH 인증|SSH 개인키|
|`kubernetes.io/dockercfg`|Docker 설정|Docker 레지스트리 인증|
|`kubernetes.io/service-account-token`|서비스 어카운트 토큰|(자동 생성)|

#### 생성 방법

1. **YAML (Base64 인코딩)**
```
# 먼저 데이터를 Base64로 인코딩  
echo -n "admin" | base64  
# 출력: YWRtaW4=  
  
echo -n "secretpassword123" | base64  
# 출력: c2VjcmV0cGFzc3dvcmQxMjM=  
```
```
apiVersion: v1  
kind: Secret  
metadata:  
  name: db-secret  
type: Opaque  
data:  
  username: YWRtaW4=                    # base64로 인코딩된 "admin"  
  password: c2VjcmV0cGFzc3dvcmQxMjM=   # base64로 인코딩된 "secretpassword123"  
```

2. **평문 작성 (권장)**
```
apiVersion: v1  
kind: Secret  
metadata:  
  name: db-secret  
type: Opaque  
stringData:                    # 평문으로 작성 (자동 인코딩됨)  
  username: admin  
  password: secretpassword123  
```
- 평문 작성 시 쿠버네티스가 자동으로 Base64로 인코딩

#### 조회

```
# Secret 목록 조회  
kubectl get secret  
  
# 상세 정보 조회 (Base64로 보임)  
kubectl describe secret db-secret  
  
# YAML 형식으로 조회 (Base64로 인코딩된 상태)  
kubectl get secret db-secret -o yaml  
  
# 디코딩해서 실제 값 조회  
kubectl get secret db-secret -o jsonpath='{.data.password}' | base64 -d  
  
# 모든 Secret 값 디코딩해서 보기  
kubectl get secret db-secret -o go-template='{{range $k,$v := .data}}{{$k}}: {{$v|base64decode}}{{"\n"}}{{end}}'  
```

#### Pod에서 Secret 사용

**방식 1. 환경 변수**
```
apiVersion: v1  
kind: Pod  
metadata:  
  name: app-pod  
spec:  
  containers:  
  - name: app  
    image: alpine  
    command: ["sleep", "3600"]  # 1시간 유지  
    env:  
    # 특정 Secret 키를 환경변수로  
    - name: DB_USERNAME  
      valueFrom:  
        secretKeyRef:  
          name: db-secret         # Secret 이름  
          key: username           # Secret의 키  
  
    - name: DB_PASSWORD  
      valueFrom:  
        secretKeyRef:  
          name: db-secret  
          key: password  
  
    # 모든 Secret 값을 환경변수로 로드  
    envFrom:  
    - secretRef:  
        name: db-secret  
```

**방식 2. 파일로 마운트**
```
apiVersion: v1  
kind: Pod  
metadata:  
  name: app-pod  
spec:  
  containers:  
  - name: app  
    image: alpine  
    command: ["sleep", "3600"]  # 1시간 유지  
    volumeMounts:  
    - name: secret-volume  
      mountPath: /etc/secrets/db  
      readOnly: true  
  volumes:    
  - name: secret-volume  
    secret:  
      secretName: db-secret  
      defaultMode: 0400  
```
- 컨테이너 내부 : 
	- `/etc/secrets/db/username` : admin 내용
	- `/etc/secrets/db/password` : secretpassword123 내용
- 파일 읽기 : `cat /etc/secrets/db/username`