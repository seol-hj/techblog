## 프로젝트 개요

음식점 방문 기록과 리뷰를 카카오맵 위에 저장하고 관리하는 웹 애플리케이션

## 프로젝트 구조

---

mzc-myFoodMap/  
├── backend/ # Express.js 서버  
│ ├── app.js # 메인 앱 설정  
│ ├── db.js # Prisma Client 초기화  
│ ├── middleware/  
│ │ └── auth.js # JWT 인증 미들웨어  
│ ├── routes/  
│ │ ├── auth.js # 회원가입/로그인  
│ │ ├── reviews.js # 리뷰 CRUD  
│ │ └── upload.js # 이미지 업로드  
│ ├── prisma/  
│ │ └── schema.prisma # DB 스키마  
│ └── package.json  
│  
└── frontend/ # React + Vite  
├── src/  
│ ├── App.jsx # 라우팅 설정  
│ ├── main.jsx # 진입점  
│ ├── api/  
│ │ └── axios.js # HTTP 클라이언트  
│ ├── hooks/  
│ │ ├── useAuth.js # 로그인 상태 관리  
│ │ ├── useReviews.js # 리뷰 CRUD 로직  
│ │ └── useMapSearch.js# 지도 검색 로직  
│ ├── components/  
│ │ ├── map/  
│ │ │ └── MapContainer.jsx  
│ │ ├── sidebar/  
│ │ │ ├── Sidebar.jsx  
│ │ │ └── ReviewItem.jsx  
│ │ ├── modal/  
│ │ │ └── WriteReviewModal.jsx  
│ │ ├── search/  
│ │ │ └── SearchBar.jsx  
│ │ └── common/  
│ │ ├── StarRating.jsx  
│ │ └── BottomNav.jsx  
│ └── pages/  
│ ├── Home.jsx # 메인 페이지  
│ ├── Login.jsx # 로그인  
│ └── Signup.jsx # 회원가입  
└── package.json

  

### ERD

---

![[image.png]]

  

### API 엔드포인트

---

POST /api/auth/signup - 회원가입  
GET /api/auth/check-username/{id} - 중복확인  
POST /api/auth/login - 로그인 (JWT 발급)

POST /api/reviews - 리뷰 저장 (인증필요)  
GET /api/reviews/{username} - 유저 리뷰 목록 & 통계  
PUT /api/reviews/{reviewId} - 리뷰 수정  
DELETE /api/reviews/{reviewId} - 리뷰 삭제

POST /api/upload - 이미지 업로드 (Multer)

## 인증시스템 분석

---

### Backend: auth.js

---

// 회원가입: username 중복체크 → 비밀번호 bcrypt 암호화 → DB 저장  
// 로그인: username으로 사용자 찾기 → bcrypt 비교 → JWT 발급 (1시간 유효)  
// JWT 토큰: { userId, username } 포함

### Frontend: useAuth.js

---

// sessionStorage에 token, user 저장  
// 로그아웃: sessionStorage 초기화  
// 페이지 새로고침 시 자동 복구

### 보안: axios.js

---

// 요청 인터셉터: 모든 API에 자동으로 토큰 주입  
// 응답 인터셉터: 403 에러 시 자동 로그아웃 + /login 리다이렉트

  

## 리뷰 관리 분석

---

### Backend: reviews.js

---

// POST /reviews  
// ├─ 인증 확인  
// ├─ 입력 유효성 검사 (필수: content, menuName, price)  
// ├─ Restaurant upsert (kakaoId 기준)  
// └─ Review 저장

// GET /reviews/{username}  
// ├─ 사용자의 모든 리뷰 조회  
// ├─ 선택적 날짜 필터링 (startDate ~ endDate)  
// └─ 통계 계산 (총 지출, 평균 평점)

// PUT /reviews/{reviewId}  
// ├─ 리뷰 수정  
// └─ imageUrl 포함 업데이트

// DELETE /reviews/{reviewId}  
// └─ 리뷰 삭제

  

### Frontend: useReviews.js

---

// submitReview()  
// ├─ 이미지 선택 시 → /upload API로 먼저 업로드  
// ├─ 리뷰 데이터 POST/PUT  
// └─ 성공 시 목록 새로고침

// fetchMyReviews()  
// ├─ 날짜 필터 적용하여 조회  
// └─ stats 계산

// deleteReview()  
// └─ 확인 후 삭제

  

## 지도 & 검색 분석

---

### Frontend: useMapSearch.js

---

// searchPlaces(keyword)  
// ├─ Kakao Places API 호출  
// ├─ 지도 중심을 기준으로 반경 10km 검색  
// └─ 결과 없으면 전국 검색으로 폴백

// places 배열에 결과 저장 → MapContainer에서 마커 표시

  

### Frontend: MapContainer.jsx

---

// 마커 관리  
// ├─ 내 리뷰 마커 (⭐): 사용자가 작성한 리뷰  
// └─ 검색 마커 (🔴): 검색 결과 식당

// 중복 제거  
// └─ 같은 좌표(kakaoId)라면 내 리뷰 우선 표시

// 오버레이 (팝업)  
// ├─ 리뷰 마커: 식당명, 사진, 별점, 메뉴, 내용  
// └─ 검색 마커: 식당명, 주소, 전화, 링크

  

## 사이드바 분석

---

### Frontend: Sidebar.jsx

---

// 상단  
// └─ 내 리뷰 (N)개 + 닫기 버튼

// 필터 섹션  
// ├─ 날짜 범위 선택 (startDate ~ endDate)  
// └─ 필터 초기화 (1페이지로 리셋)

// 통계 섹션  
// ├─ 남긴 리뷰 개수  
// ├─ 방문 식당 수  
// ├─ 총 지출액  
// └─ 평균 평점

// 정렬 버튼 (3개)  
// ├─ [최신순] ↓↑ (최신/오래된순)  
// ├─ [가격순] ↓↑ (낮음/높음)  
// └─ [평점순] ↓↑ (높음/낮음)

// 리뷰 목록  
// ├─ 페이지네이션 (10개씩)  
// ├─ 각 항목: 식당명, 평점, 메뉴, 가격, [수정][삭제]  
// └─ 이전/다음 버튼

  

### 정렬 로직

---

// 같은 버튼 재클릭 시 오름차순/내림차순 토글  
// 다른 버튼 클릭 시 새 정렬 + 내림차순으로 리셋  
// 정렬 변경 시 1페이지로 리셋

  

## UI 컴포넌트 분석

---

### Frontend: StarRating.jsx

---

// 1-5점 선택  
// 클릭 시 즉시 반영  
// 읽기 전용/편집 모드 지원

### Frontend: WriteReviewModal.jsx

---

// 입력 필드  
// ├─ 방문 날짜 (date input)  
// ├─ 사진 첨부 (drag-drop, click)  
// ├─ 별점 선택 (StarRating)  
// ├─ 메뉴/가격 (text input)  
// └─ 리뷰 내용 (textarea)

// 유효성 검사  
// ├─ 프론트: 메뉴/가격/내용 필수 체크 (String 변환)  
// └─ 백엔드: 유효성 재검증

// 로딩 상태  
// ├─ isLoading 플래그  
// ├─ 제출 중 버튼 disabled  
// └─ 스피너 표시

  

## 데이터 흐름 분석

---

### 리뷰 작성 흐름

---

WriteReviewModal  
├─ 사용자 입력  
└─ 유효성 검사 ✓  
↓  
이미지 업로드 (있으면)  
↓  
POST /reviews with imageUrl  
↓  
백엔드 검증  
↓  
Restaurant upsert  
↓  
Review 저장  
↓  
fetchMyReviews() 호출 (자동 새로고침)  
↓  
Sidebar 업데이트  
MapContainer 마커 업데이트

### 리뷰 필터링 흐름

---

날짜 선택 (startDate/endDate)  
↓  
useReviews hook  
↓  
fetchMyReviews(username, startDate, endDate)  
↓  
백엔드 쿼리 필터링  
↓  
정렬 (sortConfig 적용)  
↓  
페이지네이션 (10개씩)  
↓  
UI 렌더링

# **MyFoodMap 서비스 흐름**

---

## **1️⃣ 시작 - 회원가입/로그인**

```Plain
사용자 방문
    ↓
로그인 페이지
    ↓
① 로그인: 기존 사용자 → 아이디/비밀번호 입력 → JWT 토큰 발급
② 회원가입: 신규 사용자 → 아이디 중복 확인 → 닉네임/비밀번호 등록
    ↓
홈 페이지 (지도 진입)
```

---

## **2️⃣ 메인 - 식당 검색 & 선택**

```Plain
지도 페이지 (기본: 강남역)
    ↓
[검색 방식 선택]
    ├─ SearchBar에서 키워드 검색 (예: "강남 카페")
    │   ↓
    │   백엔드 → Kakao Places API
    │   ↓
    │   검색 결과 마커 표시 (🔴 빨간색)
    └─ 
```

---

## **3️⃣ 식당 선택 - 상세정보 확인**

```Plain
마커 클릭 (🔴 검색 결과 식당)
    ↓
상세정보 모달 팝업
├─ 식당명
├─ 카테고리 (예: 음식점, 카페)
├─ 주소
├─ 전화번호
├─ [카카오맵] 버튼 → 카카오맵 상세페이지로 이동
└─ [리뷰 남기기] 버튼 → 리뷰 작성 시작
```

---

## **4️⃣ 리뷰 작성**

```Plain
[리뷰 남기기] 클릭
    ↓
WriteReviewModal 열림
    ↓
사용자 입력 정보:
├─ 📅 방문 날짜
├─ 📸 사진 첨부 (선택)
├─ ⭐ 별점 (1-5점)
├─ 🍽️ 메뉴명 (필수)
├─ 💰 가격 (필수)
└─ 📝 리뷰 내용 (필수)
    ↓
[저장하기] 클릭
    ↓
① 사진이 있으면 → /upload API로 업로드
② 리뷰 데이터 → POST /reviews로 저장
    ↓
✅ 리뷰 저장 완료
    ↓
마커 변경: 🔴 → ⭐ (내 리뷰 마커로)
Sidebar 리뷰 목록 업데이트
```

---

## **5️⃣ 리뷰 관리 - Sidebar**

```Plain
[≡ 메뉴] 클릭 → Sidebar 열림
    ↓
[📅 방문 날짜로 검색]
├─ 시작 날짜 ~종료 날짜 입력
└─ 필터 초기화 버튼
    ↓
[기간 내 요약]
├─ 남긴 리뷰: N개
├─ 방문 식당: N곳
├─ 총 지출: N원
└─ 평균 평점: N.N
    ↓
[정렬 버튼]
├─ [최신순] ↓↑
├─ [가격순] ↓↑
└─ [평점순] ↓↑
    ↓
리뷰 목록 (페이지네이션: 10개씩)
    ├─ 리뷰 항목 클릭 → 지도에서 식당 위치 표시
    ├─ [수정] 버튼 → 리뷰 수정 모달
    └─ [삭제] 버튼 → 리뷰 삭제 (확인 후)
    ↓
[이전] [1/5] [다음] (페이지 이동)
```

---

## **6️⃣ 지도 상호작용**

```Plain
내 리뷰 마커 (⭐) 클릭
    ↓
리뷰 오버레이 표시
├─ 식당명
├─ 사진
├─ 별점
├─ 메뉴 & 가격
├─ 리뷰 내용
├─ [수정] [이전/다음] (같은 위치의 다른 리뷰)
└─ [+ 리뷰 남기기] (같은 식당에 추가 리뷰)
```

---

## **7️⃣ 세션 관리**

```Plain
로그인 상태 유지
    ↓
Token 저장: sessionStorage
├─ token (JWT)
└─ user (사용자 정보)
    ↓
API 요청 시
├─ Authorization 헤더에 token 포함
└─ 서버에서 JWT 검증
    ↓
토큰 만료 (1시간)
    ↓
API 응답 403 에러
    ↓
자동으로 sessionStorage 초기화
    ↓
로그인 페이지로 자동 이동
```

---

## **8️⃣ 데이터 흐름 다이어그램**

```Plain
┌─────────────────────────────────────────────────────┐
│              Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  SearchBar   │  │  MapContainer│  │  Sidebar   │ │
│  └──────┬───────┘  └──────┬───────┘  └────┬───────┘ │
│         │                 │               │          │
└─────────┼─────────────────┼───────────────┼──────────┘
          │                 │               │
    [검색어 입력]      [마커 클릭]    [리뷰 목록]
          │                 │               │
          └─────────────────┼───────────────┘
                            │
        ┌───────────────────▼──────────────────┐
        │   API Client (axios)                 │
        │  ├─ 토큰 자동 주입                   │
        │  └─ 403 에러 처리                    │
        └───────────────────┬──────────────────┘
                            │
        ┌───────────────────▼──────────────────────┐
        │     Backend (Express.js)                 │
        │  ┌─────────┐ ┌───────┐ ┌────────────┐   │
        │  │  /auth  │ │/reviews│ │  /upload   │   │
        │  └────┬────┘ └───┬────┘ └─────┬──────┘   │
        └───────┼──────────┼────────────┼──────────┘
                │          │            │
        ┌───────▼──────────▼────────────▼────────┐
        │     Database (MySQL + Prisma)          │
        │  ┌────────┐ ┌───────┐ ┌──────────────┐ │
        │  │  User  │ │Review │ │ Restaurant   │ │
        │  └────────┘ └───────┘ └──────────────┘ │
        └────────────────────────────────────────┘
                            │
        ┌───────────────────▼──────────────────┐
        │  External APIs                        │
        │  ├─ Kakao Maps API (검색, 좌표)      │
        │  └─ File Storage (/uploads)           │
        └────────────────────────────────────────┘
```

  

## **✨ 핵심 기능 요약**

---

|기능|설명|상태|
|---|---|---|
|🔐 인증|회원가입/로그인/토큰 관리|✅ 완성|
|🗺️ 검색|키워드 검색 + 지도 클릭 검색|✅ 완성|
|📝 리뷰 작성|사진/별점/내용 등 입력|✅ 완성|
|📸 이미지 업로드|리뷰에 사진 첨부|✅ 완성|
|📊 정렬 & 필터링|날짜/가격/평점순 + 페이지네이션|✅ 완성|
|✏️ 리뷰 수정/삭제|기존 리뷰 관리|✅ 완성|
|📍 지도 상호작용|마커 클릭 & 오버레이|✅ 완성|

## **🛠️ 기술 스택 (Technology Stack)**

---

Frontend

- Language: Javascript, HTML5, CSS3

- Library & Framework: React, Vite

- Styling**:** Tailwind CSS

- CI/CD: Github Action, S3 + Cloudfront

Backend

- Language: Javascript

- Library & Framework: Node.js, Express.js

- Database: MySQL, Prisma(ORM)

- CI/CD: Github Action, S3 + CodeDeploy

# Figma Link

[https://www.figma.com/team_invite/redeem/PWeTgJhLNanC08alBjdADB?t=OrTqOwSoHMeqLiqo-22](https://www.figma.com/team_invite/redeem/PWeTgJhLNanC08alBjdADB?t=OrTqOwSoHMeqLiqo-22)