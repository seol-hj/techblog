---
title: GCP Cloud Storage
draft: false
date: 2026-04-15
updated: 2026-04-15
tags:
  - GCP
  - Cloud Storage
  - Storage
---
## Cloud Storage

- 객체 스토리지 서비스

**특징**
- 버킷 이름 전역적으로 고유
- 접근 제어 IAM 중심, Uniform bucket-level access 사용 권장
	- ACL은 비활성화, 버킷 수준 IAM만 사용
- CLI 작업 시 `gsutil` 보다 `gcloud storage`명령 사용 권장

### Bucket

- 객체를 담는 최상위 컨테이너
- 특징
	- 버킷명 전역적으로 고유
	- 위치(Location)와 기본 Storage Class 가짐
	- Lifecycle, 접근 제어, 버전 관리 같은 설정 가질 수 있음

**객체**
- 실제 저장 데이터
- 특징
	- 파일 X, 객체 단위 저장
	- 변경 불가능 데이터로 다뤄짐

**위치**
- 버킷은 생성 시 위치를 가짐
- Region
- Dual-region
- Multi-region


#### Storage Class

1. **Standard**
	- 자주 접근
	- ex)
		- 웹 애플리케이션 업로드 파일
		- 정적 웹 자원
		- 분석용 핫 데이터
		- 자주 읽는 백업 파일

2. **Nearline**
	- 한 달에 한 번 이하 데이터
	- ex)
		- 월 단위 백업
		- 드물게 복구하는 파일

3. **Coldline**
	- 더 드물게 접근
	- ex)
		- 장기 보관 백업
		- 분기 단위 아카이브

4. **Archive**
	- 장기 보관용
	- ex)
		- 규제 보관 데이터
		- 거의 접근 X, 장기 보관 데이터


**Lifecycle 관리 & 버전 관리**
- 버킷에 규칙 설정
- ex) TTL 등

**접근제어**
- Uniform bucket-level access
	- ACL 사용 X
	- 버킷 수준 IAM 권한만 사용
	- 권한 관리 방식 단순화
	- 일부 기능 사용을 위한 선행 조건


#### CLI 명령어

버킷 이름 생성
```
PROJECT_ID=$(gcloud config get-value project)
BUCKET_NAME="${PROJECT_ID}-storage-$(date +%Y%m%d%H%M%S)"
echo$BUCKET_NAME
```

버킷 생성
```
gcloud storage buckets create gs://$BUCKET_NAME \
--location=asia-northeast3 \
--default-storage-class=STANDARD \
--uniform-bucket-level-access
```

버킷 확인 : `gcloud storage ls`

특정 버킷 상세 확인 : `gcloud storage buckets describe gs://$BUCKET_NAME`

단일 파일 업로드 : `gcloud storage cp ~/gcs-lab/index.html gs://$BUCKET_NAME/`

추가 파일 업로드 : `gcloud storage cp ~/gcs-lab/backup.txt gs://$BUCKET_NAME/`

폴더처럼 보이게 업로드 : `gcloud storage cp ~/gcs-lab/backup.txt gs://$BUCKET_NAME/backups/backup.txt`

버킷 내용 조회 : `gcloud storage ls gs://$BUCKET_NAME`

하위 경로 포함 조회 : `gcloud storage ls --recursive gs://$BUCKET_NAME`

객체 다운로드 :
```
mkdir-p ~/gcs-download
gcloud storage cp gs://$BUCKET_NAME/index.html ~/gcs-download/
gcloud storage cp gs://$BUCKET_NAME/backups/backup.txt ~/gcs-download/
ls -l ~/gcs-download
```

버킷 IAM 정책 조회 : `gcloud storage buckets get-iam-policy gs://$BUCKET_NAME`

공개 읽기 IAM 부여 :
```
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
--member=allUsers \
--role=roles/storage.objectViewer
```

공개 URL 테스트 : `https://storage.googleapis.com/BUCKET_NAME/index.html`

원상 복구 : 
```
gcloud storage buckets remove-iam-policy-binding gs://$BUCKET_NAME \
--member=allUsers \
--role=roles/storage.objectViewer
```

Lifecycle 규칙 파일 예시 :
```
cat > lifecycle.json<<'EOF'
{
  "rule": [
    {
      "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
      "condition": { "age": 30 }
    },
    {
      "action": { "type": "Delete" },
      "condition": { "age": 365 }
    }
  ]
}
EOF
```
- 생성 후 30일 지난 객체 Nearline 전환
- 생성 후 365일 지난 객체 삭제

적용 : 
```
gcloud storage buckets update gs://$BUCKET_NAME \
--lifecycle-file=lifecycle.json
```

결과 확인 : `gcloud storage buckets describe gs://$BUCKET_NAME`

객체 삭제 : `gcloud storage rm --recursive gs://$BUCKET_NAME/**`

버킷 삭제 : `gcloud storage buckets delete gs://$BUCKET_NAME`

>[!info] 요약
>Cloud Storage → 비정형 데이터 저장 객체 스토리지 서비스  
>데이터 → 버킷 내 객체 형태로 저장 / 객체 → 변경 불가능한 데이터 조각  
>버킷명 → 전역적으로 고유  
>Storage Class → 접근 빈도와 보관 목적에 따라 선택  
>Lifecycle 규칙 → 클래스 전환과 자동 삭제 설정 가능  
>접근 제어 → IAM 중심, Uniform bucket-level access 기준  
>CLI → `gsutil`보다 `gcloud storage` 권장
>