---
title: Storage
draft: false
date: 2026-03-04
updated: 2026-03-04
tags:
  - Containers
  - Kubernetes
  - PV
  - PVC
  - StorageClass
---

- Pod → 일시적 저장소 사용 (default)
	- Pod 삭제 → Pod 내부 파일 시스템 삭제
	- 재스케줄링(다른 노드 이동) → 이전 데이터 접근 X
- → 남아야 하는 데이터 → Pod 내부 저장 X

### PV / PVC / StorageClass

- **PV(PersistentVolume)**
	- 클러스터에 미리 준비된 저장소 자원
	- 관리자가 만들어두는 저장소 객체

- **PVC(PersistentVolumeClaim)**
	- 사용자가 용량/모드 저장소 요청하는 객체
	- Pod는 PV 직접 사용 X → PVC를 통해서만 저장소 사용

- **StorageClass**
	- 저장소 만드는 방식(Provisioner)과 정책 정의 탬플릿
	- PVC가 StorageClass 지정 → 필요 시 PV 가 자동으로 생성 (동적 프로비저닝)

- 동작 흐름 1. 정적 프로비저닝 (Static Provisioning)
```
1) 관리자가 PV를 미리 생성  
   ↓    
2) 사용자가 PVC 생성 (요청)  
   ↓  
3) PVC ↔ PV 바인딩  
   ↓  
4) Pod가 PVC를 마운트해서 사용  
```

- 동작 흐름 2. 동적 프로비저닝 (Dynamic Provisioning) → StorageClass 사용
```
1) 관리자가 StorageClass 생성(또는 클라우드 기본 제공)  
   ↓  
2) 사용자가 PVC 생성(storageClassName 지정)  
   ↓  
3) Provisioner가 PV를 자동 생성  
   ↓  
4) PVC ↔ PV 자동 바인딩  
   ↓  
5) Pod가 PVC 사용  
```

---

## PV (PersistentVolume)

ex)
```
apiVersion: v1  
kind: PersistentVolume  
metadata:  
  name: pv-1  
spec:  
  capacity:  
    storage: 1Gi  
  
  accessModes:  
  - ReadWriteOnce  
  
  persistentVolumeReclaimPolicy: Retain   
  
  storageClassName: manual  
  
  hostPath:  
    path: /mnt/data  
```
- hostPath → 노드 로컬 디렉터리를 저장소로 → 단일 노드 테스트용 (노드 변경 시 데이터 위치 변경 가능)

#### 옵션

- `capacityy.storage: 1Gi`
	- PV가 제공하는 최대 용량
	- PVC 요청이 더 크면 바인딩 X

- `accessModes`
	- PV 붙는 방식 결정
	- PVC와 반드시 호환

- `persistentVolumeReclaimPolicy`
	- PVC 가 삭제된 뒤 PV 처리 결정
		- `Retain` : PV와 실제 데이터 유지 (중요 데이터)
		- `Delete` : PVC 삭제 시 PV 도 삭제 (동적 프로비저닝에서 사용)

- `storageClassName`
	- PV 의 스토리지 클래스 소속
	- 정적 바인딩에서도 같은 storageClassName끼리 자동 바인딩 가능

- `hostPath.path`
	- 실제 노드에 있는 디렉터리 경로
	- 파드가 생성되는 노드에 생성
	- if 디렉터리 X → kubelet이 생성 가능 (But, 권한/보안 주의)


#### 접근 모드 (AccessModes)

- 종류
	1. `ReadWriteOnce(RWO)`
		- 한 번에 하나의 노드 만 Read/Write
		- DB 같은 상태 저장 워크로드

	2. `ReadWriteOncePod(RWOP)`
		- 한 번에 하나의 Pod 만 Read/Write
		- 여러 Pod 공유하면 안 되는 경우 유용

	3. `ReadOnlyMany(ROX)`
		- 여러 노드 ReadOnly
		- 공유 스토리지 필요

	4. `ReadWriteMany(RWX)`
		- 여러 노드 Read/Write
		- NFS 같은 공유 스토리지 자주 사용

	- ROX, RWX → 네트워크 스토리지(NFS/CEPH 등) 필요
	- hostPath → 구조상 RWX의미 X (노드 로컬, 다중 노드 공유 불가)

---

## PVC (PersistentVolumeClaim)

ex)
```
apiVersion: v1  
kind: PersistentVolumeClaim  
metadata:  
  name: app-pvc  
spec:  
  volumeName: pv-1  
  accessModes:  
  - ReadWriteOnce  
  storageClassName: manual  
  resources:  
    requests:  
      storage: 1Gi  
```

#### 옵션

- `volumeName: pv-1`
	- 특정 PV 지정 바인딩
	- 정적 프로비저닝 자주 사용
	- volumeName 사용 시 → 다른 PV와 자동 매칭 X / 해당 PV 만 바라봄

- `storageClassName`
	- 정적 바인딩 → PV/PVC가 같은 storageClassName이면 자동 매칭 쉬움
	- 동적 프로비저닝 → 사실상 필수

- `resources.requests.storage`
	- 요청 용량
	- PV보다 클 시 Pending에서 멈춤
		- `Pending` : 조건 맞는 PV X
		- `Bound` : PV와 연결 완

#### PVC 사용

ex) `pod.yaml`
```
apiVersion: v1  
kind: Pod  
metadata:  
  name: app-pod  
spec:  
  containers:  
  - name: app  
    image: nginx:latest  
    volumeMounts:  
    - name: data-volume  
      mountPath: /data  
  volumes:  
  - name: data-volume  
    persistentVolumeClaim:  
      claimName: app-pvc  
```
- `volumeMounts.mountPath`
	- 컨테이너 내부에서 저장소 연결 경로
- `volumes.persistentVolumeClaim.claimName`
	- 어떤 PVC 마운트할지 지정
	- Pod 는 PV 직접 참조 X (PVC 만 참조)

---

## StorageClass

- 정적 방식 → PV를 사람이 미리 다 생성 → 운영 번거로움
- if) StorageClass
	- PVC만 만들면 → PV 자동생성
	- 자동 바인딩
- → 동적 프로비저닝

- 온프레미스 동적 프로비저닝 → 외부 provisioner 필요 (NFS Provisioner, Longhorn, Rook-Ceph 등)

#### StorageClass 핵심 옵션

- `provisioner`
	- PV를 자동 생성하는 스토리지 플러그인 명
	- ex)
		- AWS EBS : `ebs.csi.aws.com`
		- NFS provisioner : 설치한 provisioner 이름 사용

- `reclaimPolicy`
	- 동적으로 생성된 PV를 PVC 삭제 시 어떻게 처리할지
		- `Delete` : 같이 삭제 (테스트/자동화)
		- `Retain` : PV 유지 (데이터 보호)

- `volumeBindingMode`
	- PV를 언제 생성/바인딩 할지 결정
		- `Immediate` : PVC 생성 즉시 PV 생성/바인딩
		- `WaitForFirstConsumer` : Pod가 어디 노드에 배치될 지 결정 후 바인딩 (멀티 노드에서 권장)

추가
- RWO 볼륨 → 한 번에 하나 노드/하나 Pod
- replicas = 2 → 한 PV/PVC를 여러 Pod 이 동시에 쓰려고 시도할 수 있음
- → **DB는 보통 Deployment 보다 StatefulSet을 권장**하는 이유

#### 주요 사항

- emptyDir
	- `emptyDir` → Pod 삭제 시 데이터 날아감
	- 영속 데이터 반드시 PVC 사용

- accessModes 불일치
	- PV/PVC 모드 맞지 않을 시 Pending 상태로 멈춤

- PVC 요청 용량이 PV보다 큼
	- PVC가 더 크면 PV 찾지 못해 Pending

- hostPath → 노드 로컬 디렉터리
	- 노드 변경시 데이터 위치 변경
	- 멀티노드 공유 스토리지 X

>[!note]
>PV → 저장소 자체
>PVC → 저장소 요청서
>Pod는 PV 직접 사용 X → PVC 사용
>StorageClass → PV를 자동으로 만드는 방식 (동적 프로비저닝)
>온프레미스 동적 프로비저닝 → NFS Provisioner/Longhorn/Rook-Ceph 같은 구성요소 추가 필요


---

### 추가 1. NFS

![](Experience/MGC_SA_Bootcamp/5_Kubernetes/img/20260304.png)

- **NFS (Network File System)** : 네트워크 상의 다른 컴퓨터와 파일을 공유할 수 있게 해주는 프로토콜
	- 주로 Linux/Unix 환경에서 사용

- 사용
	1. 쿠버네티스 노드들이 접근할 수 있는 Linux 서버에 NFS 서비스 활성화
	2. 모든 워커 노드에 NFS 클라이언트 설치
	3. 쿠버네티스 안에 `example.com/nfs` 역할을 할 Provisioner 배포
		- 오픈소스 **nfs-subdir-external-provisioner** 사용
		- `storageClass.provisionerName` 이름이 `StorageClass`의 `provisioner`와 일치
		- Helm 을 사용해 설치
			- `--set storageClass.provisionerName=example.com/nfs` 옵션으로 일치
	4. `StorageClass`을 사용하여 PVC 생성 시 NFS 서버의 `/srv/nfs/kubedata` 안에 자동으로 서브 디렉토리 생성 후 연결

- 흐름
	- PVC 생성
	- → provisioner가 PV 자동 생성
	- → PVC ↔ PV Bound
	- → Pod에서 PVC 사용

- 장점
	- **RWX 지원** : 여러 노드에 흩어진 파드들이 동시에 같은 파일 읽고 쓸 수 있음
	- **관리 효율** : PV를 만들 필요 X, 프로비저너가 NFS 서버 안에 폴더 만들어줌

---

### 추가 2. Longhorn

- 각 노드의 OS 레벨에서 특정 도구들이 설치 필요
	- 모든 워커 노드와 마스터 노드에서 필수 패키지 설치
- Control plane 에서 Helm을 사용하여 Longhorn 설치

- 웹 UI가 가장 큰 장점
	- 기본적으로 `ClusterIP`로 설정
	- 외부 접속시 서비스 노출 필요
		- 대시보드 GUI 접속 가능

- NFS와 차이점
	1. **복제 (Replication)** : 데이터를 여러 노드에 복제해둠
		- 노드 한 대가 죽어도 데이터 유실 X, 다른 노드에서 파드가 바로 살아남
	2. **스냅샷 및 백업** : GUI에서 클릭 한 번으로 시점 복구 포인트 생성 및 S3/NFS로 외부 백업 보낼 수 있음
	3. **리소스 통합** : 별도의 NFS 서버 VM 필요 X, 워커 노드들의 남는 SSD 공간으로 사용

- 주의사항
	- 사양 : Longhorn은 각 노드에서 에이전트 파드 띄움
		- RAM 약간 점유 (노드당 최소 2GB 이상 여유 필요)
	- 디스크 경로 : 기본적으로 `/var/lib/longhorn` 사용