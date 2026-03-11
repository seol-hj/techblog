---
title: Kubernetes 매니페스트 및 Helm 패키징
draft: false
date: 2026-03-05
updated: 2026-03-06
tags:
  - Kubernetes
  - VM
  - Helm
---

>[!info] 목표  
>애플리케이션을 Kubernetes 에서 실행하기 위해  
>컨테이너 이미지 기반으로 **Kubernetes 리소스 정의** & **Helm Chart로 패키징** 함  


## 진행 내용 요약

**Kubernetes 배포**

|리소스|용도|
|---|---|
|Namespace|서비스 격리|
|Deployment|frontend / backend|
|Service|내부 통신|
|Ingress|외부 접속|
|ConfigMap|환경 변수|
|Secret|DB 비밀번호|
|PV / PVC|DB 데이터 저장|
|StorageClass|볼륨 관리|
|StatefulSet|PostgreSQL|
|HPA|자동 스케일링|
|Probe|health check|
|ServiceAccount|권한 관리|
|RBAC|접근 제어|
|QoSClass|리소스 관리|

**네트워크 및 외부 노출**
```
Internet  
   │  
Ingress  
   │   
Service  
   │  
Frontend Pod  
   │  
Backend Service  
   │  
Backend Pod  
   │  
Redis / PostgreSQL
```
- Ingress Controller (nginx)
- MetalLB (external IP)

**데이터 스토리지**

- Redis
	- Deployment
	- Service
- PostgreSQL
	- StatefulSet
	- PersistentVolume
	- PersistentVolumeClaim

>1. Helm 차트 뼈대 만들기  
>2. values.yaml 작성  
>3. ConfigMap / Secret 작성  
>4. PostgreSQL / Redis 작성  
>5. Backend / Frontend 작성  
>6. Service / Ingress / HPA / RBAC 작성

---

1. 디렉토리 구조 생성
`mkdir -p helm/tetris/templates`

2. Helm 차트 기본 파일 생성
`helm/tetris/Chart.yaml`

```
apiVersion: v2
name: tetris
description: Tetris game service on Kubernetes
type: application
version: 0.1.0
appVersion: "1.0.0"
```

`helm/tetris/values.yaml`

```
namespace: game

frontend:
  name: frontend
  replicaCount: 1
  image:
    repository: DOCKER_ID/tetris-frontend
    tag: "1.0"
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 80
    targetPort: 80

backend:
  name: backend
  replicaCount: 2
  image:
    repository: DOCKER_ID/tetris-backend
    tag: "1.0"
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 8000
    targetPort: 8000
  resources:
    requests:
      cpu: "200m"
      memory: "256Mi"
    limits:
      cpu: "500m"
      memory: "512Mi"

redis:
  name: redis
  replicaCount: 1
  image:
    repository: redis
    tag: "7"
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 6379
    targetPort: 6379

postgres:
  name: postgres
  image:
    repository: postgres
    tag: "16"
    pullPolicy: IfNotPresent
  service:
    port: 5432
    targetPort: 5432
  storage:
    size: 5Gi
    storageClassName: local-storage

config:
  postgresHost: postgres
  postgresPort: "5432"
  postgresDb: tetris
  redisHost: redis
  redisPort: "6379"

secret:
  postgresUser: tetris
  postgresPassword: tetris123

ingress:
  enabled: true
  className: nginx
  host: tetris.local
  frontendPath: /
  backendPath: /api
  websocketPath: /ws

hpa:
  enabled: true
  minReplicas: 1
  maxReplicas: 5
  averageUtilization: 70
```

`helm/tetris/templates` 아래

```
namespace.yaml
configmap.yaml
secret.yaml
postgres-service.yaml
postgres-statefulset.yaml
redis-deployment.yaml
redis-service.yaml
backend-serviceaccount.yaml
backend-role.yaml
backend-rolebinding.yaml
backend-deployment.yaml
backend-service.yaml
frontend-deployment.yaml
frontend-service.yaml
ingress.yaml
backend-hpa.yaml
```
순서대로 생성

- `ConfigMap / Secret` 먼저 있어야 앱 설정 주입 가능
- `PostgreSQL / Redis` 있어야 Backend 의존성 연결 가능
- `Backend` 살아야 `Frontend`가 API 호출 가능
- 마지막 `Ingress / HPA / RBAC`

`## namespace.yaml`

```
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .Values.namespace }}
```
- ns 지정 안할거면 사용
	- 현재 `game` 로 직접 만들고 지정할거라 사용 X
	- 추후 `-n game` 옵션으로 네임스페이스 지정하여 사용 혹은 현재 네임스페이스를 변경하여 사용

`configmap.yaml`

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: tetris-config
  namespace: {{ .Values.namespace }}
data:
  POSTGRES_HOST: {{ .Values.config.postgresHost | quote }}
  POSTGRES_PORT: {{ .Values.config.postgresPort | quote }}
  POSTGRES_DB: {{ .Values.config.postgresDb | quote }}
  REDIS_HOST: {{ .Values.config.redisHost | quote }}
  REDIS_PORT: {{ .Values.config.redisPort | quote }}
```

`secret.yaml`

```
apiVersion: v1
kind: Secret
metadata:
  name: tetris-secret
  namespace: {{ .Values.namespace }}
type: Opaque
stringData:
  POSTGRES_USER: {{ .Values.secret.postgresUser | quote }}
  POSTGRES_PASSWORD: {{ .Values.secret.postgresPassword | quote }}
```

---

`postgres-service.yaml`

```
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.postgres.name }}
  namespace: {{ .Values.namespace }}
spec:
  clusterIP: None
  selector:
    app: {{ .Values.postgres.name }}
  ports:
    - port: {{ .Values.postgres.service.port }}
      targetPort: {{ .Values.postgres.service.targetPort }}
```

`postgres-statefulset.yaml`

```
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ .Values.postgres.name }}
  namespace: {{ .Values.namespace }}
spec:
  serviceName: {{ .Values.postgres.name }}
  replicas: 1
  selector:
    matchLabels:
      app: {{ .Values.postgres.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.postgres.name }}
    spec:
      containers:
        - name: {{ .Values.postgres.name }}
          image: "{{ .Values.postgres.image.repository }}:{{ .Values.postgres.image.tag }}"
          imagePullPolicy: {{ .Values.postgres.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.postgres.service.targetPort }}
          env:
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: tetris-config
                  key: POSTGRES_DB
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: tetris-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: tetris-secret
                  key: POSTGRES_PASSWORD
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: {{ .Values.postgres.storage.storageClassName }}
        resources:
          requests:
            storage: {{ .Values.postgres.storage.size }}
```

---

`redis-deployment.yaml`

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.redis.name }}
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.redis.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.redis.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.redis.name }}
    spec:
      containers:
        - name: {{ .Values.redis.name }}
          image: "{{ .Values.redis.image.repository }}:{{ .Values.redis.image.tag }}"
          imagePullPolicy: {{ .Values.redis.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.redis.service.targetPort }}
```

`redis-service.yaml`

```
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.redis.name }}
  namespace: {{ .Values.namespace }}
spec:
  selector:
    app: {{ .Values.redis.name }}
  ports:
    - port: {{ .Values.redis.service.port }}
      targetPort: {{ .Values.redis.service.targetPort }}
  type: {{ .Values.redis.service.type }}
```

---

`backend-serviceaccount.yaml`

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ .Values.backend.name }}-sa
  namespace: {{ .Values.namespace }}
```

`backend-role.yaml`

```
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: {{ .Values.backend.name }}-role
  namespace: {{ .Values.namespace }}
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
```

`backend-rolebinding.yaml`

```
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: {{ .Values.backend.name }}-rolebinding
  namespace: {{ .Values.namespace }}
subjects:
  - kind: ServiceAccount
    name: {{ .Values.backend.name }}-sa
    namespace: {{ .Values.namespace }}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: {{ .Values.backend.name }}-role
```

`backend-deployment.yaml`

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.backend.name }}
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.backend.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.backend.name }}
    spec:
      serviceAccountName: {{ .Values.backend.name }}-sa
      containers:
        - name: {{ .Values.backend.name }}
          image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
          imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.backend.service.targetPort }}
          env:
            - name: POSTGRES_HOST
              valueFrom:
                configMapKeyRef:
                  name: tetris-config
                  key: POSTGRES_HOST
            - name: POSTGRES_PORT
              valueFrom:
                configMapKeyRef:
                  name: tetris-config
                  key: POSTGRES_PORT
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: tetris-config
                  key: POSTGRES_DB
            - name: REDIS_HOST
              valueFrom:
                configMapKeyRef:
                  name: tetris-config
                  key: REDIS_HOST
            - name: REDIS_PORT
              valueFrom:
                configMapKeyRef:
                  name: tetris-config
                  key: REDIS_PORT
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: tetris-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: tetris-secret
                  key: POSTGRES_PASSWORD
          resources:
            requests:
              cpu: {{ .Values.backend.resources.requests.cpu | quote }}
              memory: {{ .Values.backend.resources.requests.memory | quote }}
            limits:
              cpu: {{ .Values.backend.resources.limits.cpu | quote }}
              memory: {{ .Values.backend.resources.limits.memory | quote }}
          readinessProbe:
            httpGet:
              path: /health
              port: {{ .Values.backend.service.targetPort }}
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: {{ .Values.backend.service.targetPort }}
            initialDelaySeconds: 20
            periodSeconds: 10
```

`backend-service.yaml`

```
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.backend.name }}
  namespace: {{ .Values.namespace }}
spec:
  selector:
    app: {{ .Values.backend.name }}
  ports:
    - port: {{ .Values.backend.service.port }}
      targetPort: {{ .Values.backend.service.targetPort }}
  type: {{ .Values.backend.service.type }}
```

---

`frontend-deployment.yaml`

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.frontend.name }}
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.frontend.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.frontend.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.frontend.name }}
    spec:
      containers:
        - name: {{ .Values.frontend.name }}
          image: "{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}"
          imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.frontend.service.targetPort }}
          readinessProbe:
            httpGet:
              path: /
              port: {{ .Values.frontend.service.targetPort }}
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /
              port: {{ .Values.frontend.service.targetPort }}
            initialDelaySeconds: 20
            periodSeconds: 10
```

`frontend-service.yaml`

```
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.frontend.name }}
  namespace: {{ .Values.namespace }}
spec:
  selector:
    app: {{ .Values.frontend.name }}
  ports:
    - port: {{ .Values.frontend.service.port }}
      targetPort: {{ .Values.frontend.service.targetPort }}
  type: {{ .Values.frontend.service.type }}
```

---

`ingress.yaml`

```
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tetris-ingress
  namespace: {{ .Values.namespace }}
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    nginx.ingress.kubernetes.io/websocket-services: {{ .Values.backend.name | quote }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: {{ .Values.ingress.frontendPath }}
            pathType: Prefix
            backend:
              service:
                name: {{ .Values.frontend.name }}
                port:
                  number: {{ .Values.frontend.service.port }}
          - path: {{ .Values.ingress.backendPath }}
            pathType: Prefix
            backend:
              service:
                name: {{ .Values.backend.name }}
                port:
                  number: {{ .Values.backend.service.port }}
          - path: {{ .Values.ingress.websocketPath }}
            pathType: Prefix
            backend:
              service:
                name: {{ .Values.backend.name }}
                port:
                  number: {{ .Values.backend.service.port }}
{{- end }}
```

`backend-hpa.yaml`

```
{{- if .Values.hpa.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Values.backend.name }}-hpa
  namespace: {{ .Values.namespace }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Values.backend.name }}
  minReplicas: {{ .Values.hpa.minReplicas }}
  maxReplicas: {{ .Values.hpa.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.hpa.averageUtilization }}
{{- end }}
```

---

- `helm/tetris/templates`
```
namespace.yaml
configmap.yaml
secret.yaml
postgres-service.yaml
postgres-statefulset.yaml
redis-deployment.yaml
redis-service.yaml
backend-serviceaccount.yaml
backend-role.yaml
backend-rolebinding.yaml
backend-deployment.yaml
backend-service.yaml
frontend-deployment.yaml
frontend-service.yaml
ingress.yaml
backend-hpa.yaml
```
생성

---

### helm

- Helm Chart 구조 검사
`helm lint ./helm/tetris` → `1 chart(s) linted, 0 chart(s) failed`

![530](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260309-10.png)

- Helm 템플릿 렌더링 확인
	- 실제 kubernetes YAML로 변환되는지 확인

`helm template tetris ./helm/tetris`
- `helm values.yaml` + `templates/*.yaml` 을 합쳐 실제 Kubernetes YAML을 출력함

- 실제 배포 명령어
	- `helm install tetris ./helm/tetris -n game`
		- `-n game` : ns 지정
	- 이미 존재할 시 → `helm upgrade --install tetris ./helm/tetris`

![503](Experience/MGC_SA_Bootcamp/5_Kubernetes/20_etc_proj/img/20260309-11.png)

- 배포 확인
	- `helm list` → Helm Release 확인
	- `kubectl get ns` → Namespace 확인
	- `kubectl get all -n game` → 전체 리소스 확인
	- `kubectl get pvc -n game` → DB 볼륨 확인
	- `kubecetl get ingress -n game` → Ingress 확인
	- `kubectl get hpa -n game` → HPA 확인
	- `kubectl get pods -n game` → Pod 상태 확인
	- `kubectl logs deployment/backend -n game` → Backend 로그 확인 (문제 발생 시)
	- `kubectl logs postgres-0 -n game` → Postgres 로그 확인 (문제 발생 시)

- 삭제
	- `helm uninstall tetris` → Helm release 삭제

---

#### 번외 1. 로컬에서 vm kubernetes 연결

- VM 의 kubeconfig를 로컬로 가져와서 사용

구조
```
Windows VSCode
   ├ kubectl
   ├ helm
   └ kubeconfig (VM cluster 연결)

        │
        ▼

VM Kubernetes Cluster
```

1. VM에서 kubeconfig 가져오기

cp VM 에서
`sudo cat /etc/kubernetes/admin.conf` 내용 복사

2. 로컬에 kubeconfig 만들기

windows 에서 `C:\Users\내_ID\.kube` 폴더 생성
→ config 파일 생성 후 붙여넣기

3. kubeconfig 수정

기존 config 내용
`server: https://127.0.0.1:6443`
→ Control Plane IP로 변경 : `server: https://192.168.80.110:6443`

4. 로컬에 kubectl 설치

if) Windows PowerShell 이면
`winget install Kubernetes.kubectl`
or
직접 다운로드 : https://kubernetes.io/docs/tasks/tools/

확인 : `kubectl get nodes`

- 같은 vs code 터미널이더라도
	- wsl 우분투 터미널인 경우 → `/home/USER/.kube/config`
	- PowerShell → `C:\Users\USER\.kube\config`
	- 경로가 다르므로 config 파일 경로 잘 생각해야함


---

#### 번외 2. Helm 설치

Helm 공식 설치 스크립트 사용
```
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

확인 : `helm version`

---

