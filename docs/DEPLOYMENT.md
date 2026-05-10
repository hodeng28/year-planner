# 매매일지 배포 가이드

## 현재 상태

- ✅ 코드 완료 및 GitHub 푸시 완료
- ✅ 로컬 개발환경 정상 작동
- ⏳ 배포 대기

## 기술 스택

- **Frontend**: Next.js 16 + shadcn/ui + Tailwind
- **Backend**: NestJS + Prisma
- **Database**: PostgreSQL

## 배포 계획 (무료)

| 서비스 | 플랫폼 | 비용 |
|--------|--------|------|
| Frontend | Vercel | 무료 |
| Backend | Render | 무료 |
| Database | Render PostgreSQL | 무료 |

---

## 배포 순서

### 1. Render - PostgreSQL 생성

1. https://render.com 가입/로그인
2. Dashboard → **New +** → **PostgreSQL**
3. 설정:
   - Name: `trading-journal-db`
   - Region: Singapore (가까운 곳)
   - Plan: **Free**
4. **Create Database** 클릭
5. 생성 완료 후 **External Database URL** 복사 (나중에 사용)

### 2. Render - API 배포

1. Dashboard → **New +** → **Web Service**
2. **Connect a repository** → GitHub 연결 → `year-planner` 선택
3. 설정:
   - Name: `trading-journal-api`
   - Region: Singapore
   - Branch: `main`
   - **Root Directory**: `apps/api`
   - Runtime: **Node**
   - Build Command:
     ```
     cd ../.. && pnpm install && pnpm --filter api build && pnpm --filter api prisma:migrate
     ```
   - Start Command:
     ```
     node dist/main.js
     ```
   - Plan: **Free**
4. **Environment Variables** 추가:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (1단계에서 복사한 External Database URL) |
   | `DIRECT_URL` | (같은 URL) |
   | `PORT` | `10000` |
   | `NODE_ENV` | `production` |
5. **Create Web Service** 클릭
6. 배포 완료 후 URL 복사 (예: `https://trading-journal-api.onrender.com`)

### 3. Vercel - Frontend 배포

1. https://vercel.com 가입/로그인
2. **Add New Project** → GitHub에서 `year-planner` import
3. 설정:
   - **Root Directory**: `apps/web` (Change 클릭해서 변경)
   - Framework Preset: **Next.js** (자동 감지됨)
4. **Environment Variables** 추가:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://trading-journal-api.onrender.com/api` |
5. **Deploy** 클릭

---

## 배포 후 확인사항

1. Vercel URL 접속하여 대시보드 확인
2. 매매 기록 등록 테스트
3. 설정 페이지에서 수수료 설정 확인

## 주의사항

- Render 무료 플랜은 15분 비활성 시 슬립 → 첫 요청 시 30초 정도 대기
- PostgreSQL 무료는 90일 후 만료 (갱신 필요)

---

## 로컬 개발 실행

```bash
# PostgreSQL 시작 (Mac)
brew services start postgresql@15

# 개발 서버 실행
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api

## 환경변수 파일

- `apps/api/.env` - 백엔드 환경변수 (Git 제외됨)
- `apps/web/.env.local` - 프론트엔드 환경변수 (Git 제외됨)
