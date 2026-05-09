# Trading Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 국내 주식/ETF 매매를 기록하고 수익률/패턴/심리 분석하는 매매일지 구축

**Architecture:** Next.js 프론트엔드 + NestJS 백엔드 + PostgreSQL. 매매 건별 기록 후 FIFO 방식으로 손익 계산. shadcn/ui로 모던한 반응형 UI 구현.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, recharts, NestJS, Prisma, PostgreSQL

**Spec:** `docs/superpowers/specs/2026-05-09-trading-journal-design.md`

---

## File Structure

### Backend (apps/api)
```
apps/api/src/
├── app.module.ts              # 루트 모듈 (수정)
├── main.ts                    # 엔트리포인트
├── prisma/
│   └── prisma.service.ts      # Prisma 서비스
├── trades/
│   ├── trades.module.ts
│   ├── trades.controller.ts
│   ├── trades.service.ts
│   └── dto/
│       ├── create-trade.dto.ts
│       └── update-trade.dto.ts
├── stats/
│   ├── stats.module.ts
│   ├── stats.controller.ts
│   └── stats.service.ts
├── options/
│   ├── options.module.ts
│   ├── options.controller.ts
│   └── options.service.ts
└── common/
    └── interceptors/
        └── response.interceptor.ts
```

### Frontend (apps/web)
```
apps/web/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               # 대시보드
│   ├── trades/page.tsx
│   ├── analysis/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── ui/                    # shadcn 컴포넌트
│   ├── layout/
│   │   ├── header.tsx
│   │   └── nav.tsx
│   ├── dashboard/
│   │   ├── kpi-cards.tsx
│   │   ├── profit-chart.tsx
│   │   └── emotion-chart.tsx
│   └── trades/
│       ├── trade-form.tsx
│       ├── trade-list.tsx
│       └── trade-item.tsx
├── hooks/
│   ├── use-trades.ts
│   ├── use-stats.ts
│   └── use-options.ts
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── constants.ts
└── providers/
    └── query-provider.tsx
```

### Shared Types (packages/types)
```
packages/types/src/
├── index.ts
└── trade.ts
```

---

## Phase 1: Project Setup

### Task 1: Clean API and Setup Prisma Schema

**Files:**
- Delete: `apps/api/src/goals/`, `apps/api/src/income/`, `apps/api/src/tasks/`
- Modify: `apps/api/prisma/schema.prisma`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Delete old modules**

```bash
rm -rf apps/api/src/goals apps/api/src/income apps/api/src/tasks
```

- [ ] **Step 2: Write new Prisma schema**

Replace `apps/api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum TradeType {
  BUY
  SELL
}

model Trade {
  id            String          @id @default(uuid())
  stockCode     String
  stockName     String
  type          TradeType
  price         Int
  quantity      Int
  tradedAt      DateTime
  targetPrice   Int?
  stopLossPrice Int?
  emotionId     String?
  emotion       EmotionOption?  @relation(fields: [emotionId], references: [id])
  patternId     String?
  pattern       PatternOption?  @relation(fields: [patternId], references: [id])
  strategyId    String?
  strategy      StrategyOption? @relation(fields: [strategyId], references: [id])
  memo          String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([stockCode])
  @@index([tradedAt])
  @@index([type])
}

model EmotionOption {
  id        String   @id @default(uuid())
  name      String   @unique
  isDefault Boolean  @default(false)
  trades    Trade[]
  createdAt DateTime @default(now())
}

model PatternOption {
  id        String   @id @default(uuid())
  name      String   @unique
  isDefault Boolean  @default(false)
  trades    Trade[]
  createdAt DateTime @default(now())
}

model StrategyOption {
  id        String   @id @default(uuid())
  name      String   @unique
  isDefault Boolean  @default(false)
  trades    Trade[]
  createdAt DateTime @default(now())
}
```

- [ ] **Step 3: Update app.module.ts**

Replace `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 4: Create PrismaModule**

Create `apps/api/src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 5: Run migration**

```bash
cd apps/api && pnpm prisma migrate dev --name trading_journal_init
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(api): setup trading journal prisma schema"
```

---

### Task 2: Create Next.js Frontend

**Files:**
- Create: `apps/web/` (entire directory)

- [ ] **Step 1: Create Next.js app**

```bash
cd apps && pnpm create next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

- [ ] **Step 2: Update package.json name**

Edit `apps/web/package.json`, set `"name": "web"`.

- [ ] **Step 3: Install dependencies**

```bash
cd apps/web && pnpm add @tanstack/react-query date-fns recharts && pnpm add -D @types/node
```

- [ ] **Step 4: Create query provider**

Create `apps/web/src/providers/query-provider.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 5: Update layout**

Replace `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '매매일지',
  description: '주식 매매 기록 및 분석',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create placeholder page**

Replace `apps/web/src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">매매일지</h1>
      <p className="text-gray-500 mt-2">대시보드 준비 중...</p>
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(web): initialize next.js frontend"
```

---

### Task 3: Setup shadcn/ui

**Files:**
- Create: `apps/web/components.json`
- Modify: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/components/ui/` (multiple files)

- [ ] **Step 1: Initialize shadcn**

```bash
cd apps/web && pnpm dlx shadcn@latest init -d
```

Select: New York style, Zinc color, CSS variables enabled.

- [ ] **Step 2: Add essential components**

```bash
cd apps/web && pnpm dlx shadcn@latest add button card input label select dialog table tabs badge collapsible
```

- [ ] **Step 3: Add dark mode support**

Create `apps/web/src/components/theme-provider.tsx`:

```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 4: Install next-themes**

```bash
cd apps/web && pnpm add next-themes
```

- [ ] **Step 5: Update layout with theme provider**

Edit `apps/web/src/app/layout.tsx`, wrap children with ThemeProvider.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(web): setup shadcn/ui with dark mode"
```

---

## Phase 2: Backend CRUD

### Task 4: Options Module

**Files:**
- Create: `apps/api/src/options/options.module.ts`
- Create: `apps/api/src/options/options.controller.ts`
- Create: `apps/api/src/options/options.service.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create options service**

Create `apps/api/src/options/options.service.ts`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OptionsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    const emotions = ['침착', '불안', '탐욕', '공포', 'FOMO'];
    const patterns = ['돌파', '눌림목', '쌍바닥', '역헤드앤숄더', '박스권', '추세선이탈'];
    const strategies = ['스윙', '단타', '추세추종', '역추세', '이벤트'];

    for (const name of emotions) {
      await this.prisma.emotionOption.upsert({
        where: { name },
        update: {},
        create: { name, isDefault: true },
      });
    }
    for (const name of patterns) {
      await this.prisma.patternOption.upsert({
        where: { name },
        update: {},
        create: { name, isDefault: true },
      });
    }
    for (const name of strategies) {
      await this.prisma.strategyOption.upsert({
        where: { name },
        update: {},
        create: { name, isDefault: true },
      });
    }
  }

  findAllEmotions() {
    return this.prisma.emotionOption.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createEmotion(name: string) {
    return this.prisma.emotionOption.create({ data: { name } });
  }

  deleteEmotion(id: string) {
    return this.prisma.emotionOption.delete({ where: { id } });
  }

  findAllPatterns() {
    return this.prisma.patternOption.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createPattern(name: string) {
    return this.prisma.patternOption.create({ data: { name } });
  }

  deletePattern(id: string) {
    return this.prisma.patternOption.delete({ where: { id } });
  }

  findAllStrategies() {
    return this.prisma.strategyOption.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createStrategy(name: string) {
    return this.prisma.strategyOption.create({ data: { name } });
  }

  deleteStrategy(id: string) {
    return this.prisma.strategyOption.delete({ where: { id } });
  }
}
```

- [ ] **Step 2: Create options controller**

Create `apps/api/src/options/options.controller.ts`:

```typescript
import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { OptionsService } from './options.service';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get('emotions')
  findAllEmotions() {
    return this.optionsService.findAllEmotions();
  }

  @Post('emotions')
  createEmotion(@Body('name') name: string) {
    return this.optionsService.createEmotion(name);
  }

  @Delete('emotions/:id')
  deleteEmotion(@Param('id') id: string) {
    return this.optionsService.deleteEmotion(id);
  }

  @Get('patterns')
  findAllPatterns() {
    return this.optionsService.findAllPatterns();
  }

  @Post('patterns')
  createPattern(@Body('name') name: string) {
    return this.optionsService.createPattern(name);
  }

  @Delete('patterns/:id')
  deletePattern(@Param('id') id: string) {
    return this.optionsService.deletePattern(id);
  }

  @Get('strategies')
  findAllStrategies() {
    return this.optionsService.findAllStrategies();
  }

  @Post('strategies')
  createStrategy(@Body('name') name: string) {
    return this.optionsService.createStrategy(name);
  }

  @Delete('strategies/:id')
  deleteStrategy(@Param('id') id: string) {
    return this.optionsService.deleteStrategy(id);
  }
}
```

- [ ] **Step 3: Create options module**

Create `apps/api/src/options/options.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { OptionsController } from './options.controller';
import { OptionsService } from './options.service';

@Module({
  controllers: [OptionsController],
  providers: [OptionsService],
})
export class OptionsModule {}
```

- [ ] **Step 4: Register in app.module**

Update `apps/api/src/app.module.ts` imports to include `OptionsModule`.

- [ ] **Step 5: Test API**

```bash
cd apps/api && pnpm start:dev
# GET http://localhost:4000/api/options/emotions
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(api): add options module for emotions/patterns/strategies"
```

---

### Task 5: Trades Module

**Files:**
- Create: `apps/api/src/trades/trades.module.ts`
- Create: `apps/api/src/trades/trades.controller.ts`
- Create: `apps/api/src/trades/trades.service.ts`
- Create: `apps/api/src/trades/dto/create-trade.dto.ts`
- Create: `apps/api/src/trades/dto/update-trade.dto.ts`

- [ ] **Step 1: Create DTOs**

Create `apps/api/src/trades/dto/create-trade.dto.ts`:

```typescript
import { TradeType } from '@prisma/client';

export class CreateTradeDto {
  stockCode: string;
  stockName: string;
  type: TradeType;
  price: number;
  quantity: number;
  tradedAt: Date;
  targetPrice?: number;
  stopLossPrice?: number;
  emotionId?: string;
  patternId?: string;
  strategyId?: string;
  memo?: string;
}
```

Create `apps/api/src/trades/dto/update-trade.dto.ts`:

```typescript
import { CreateTradeDto } from './create-trade.dto';

export class UpdateTradeDto extends CreateTradeDto {}
```

- [ ] **Step 2: Create trades service**

Create `apps/api/src/trades/trades.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

@Injectable()
export class TradesService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: { startDate?: string; endDate?: string; stockCode?: string; type?: string }) {
    const where: any = {};
    if (params?.startDate && params?.endDate) {
      where.tradedAt = {
        gte: new Date(params.startDate),
        lte: new Date(params.endDate),
      };
    }
    if (params?.stockCode) {
      where.stockCode = params.stockCode;
    }
    if (params?.type) {
      where.type = params.type;
    }
    return this.prisma.trade.findMany({
      where,
      include: { emotion: true, pattern: true, strategy: true },
      orderBy: { tradedAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.trade.findUnique({
      where: { id },
      include: { emotion: true, pattern: true, strategy: true },
    });
  }

  create(dto: CreateTradeDto) {
    return this.prisma.trade.create({
      data: {
        ...dto,
        tradedAt: new Date(dto.tradedAt),
      },
      include: { emotion: true, pattern: true, strategy: true },
    });
  }

  update(id: string, dto: UpdateTradeDto) {
    return this.prisma.trade.update({
      where: { id },
      data: {
        ...dto,
        tradedAt: new Date(dto.tradedAt),
      },
      include: { emotion: true, pattern: true, strategy: true },
    });
  }

  delete(id: string) {
    return this.prisma.trade.delete({ where: { id } });
  }
}
```

- [ ] **Step 3: Create trades controller**

Create `apps/api/src/trades/trades.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stockCode') stockCode?: string,
    @Query('type') type?: string,
  ) {
    return this.tradesService.findAll({ startDate, endDate, stockCode, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTradeDto) {
    return this.tradesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTradeDto) {
    return this.tradesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tradesService.delete(id);
  }
}
```

- [ ] **Step 4: Create trades module**

Create `apps/api/src/trades/trades.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

@Module({
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TradesService],
})
export class TradesModule {}
```

- [ ] **Step 5: Register in app.module**

Update `apps/api/src/app.module.ts` to import `TradesModule`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(api): add trades CRUD module"
```

---

## Phase 3: Frontend Trades

### Task 6: Layout and Navigation

**Files:**
- Create: `apps/web/src/components/layout/header.tsx`
- Create: `apps/web/src/components/layout/nav.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Create navigation component**

Create `apps/web/src/components/layout/nav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/trades', label: '매매기록' },
  { href: '/analysis', label: '분석' },
  { href: '/settings', label: '설정' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:static md:border-t-0 md:border-r md:w-48 md:min-h-screen">
      <div className="flex md:flex-col">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 p-4 text-center text-sm md:text-left',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create header component**

Create `apps/web/src/components/layout/header.tsx`:

```tsx
export function Header() {
  return (
    <header className="border-b p-4">
      <h1 className="text-xl font-bold">매매일지</h1>
    </header>
  );
}
```

- [ ] **Step 3: Update layout**

Update `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/layout/nav';
import { Header } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '매매일지',
  description: '주식 매매 기록 및 분석',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <div className="flex flex-col md:flex-row min-h-screen">
              <Nav />
              <main className="flex-1 pb-16 md:pb-0">
                <Header />
                <div className="p-4">{children}</div>
              </main>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(web): add layout with responsive navigation"
```

---

### Task 7: API Client and Hooks

**Files:**
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/hooks/use-trades.ts`
- Create: `apps/web/src/hooks/use-options.ts`

- [ ] **Step 1: Create API client**

Create `apps/web/src/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  trades: {
    list: () => fetchApi<any[]>('/trades'),
    get: (id: string) => fetchApi<any>(`/trades/${id}`),
    create: (data: any) => fetchApi<any>('/trades', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchApi<any>(`/trades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi<void>(`/trades/${id}`, { method: 'DELETE' }),
  },
  options: {
    emotions: () => fetchApi<any[]>('/options/emotions'),
    patterns: () => fetchApi<any[]>('/options/patterns'),
    strategies: () => fetchApi<any[]>('/options/strategies'),
  },
};
```

- [ ] **Step 2: Create trades hook**

Create `apps/web/src/hooks/use-trades.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTrades() {
  return useQuery({ queryKey: ['trades'], queryFn: api.trades.list });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.trades.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.trades.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.trades.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  });
}
```

- [ ] **Step 3: Create options hook**

Create `apps/web/src/hooks/use-options.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useEmotions() {
  return useQuery({ queryKey: ['emotions'], queryFn: api.options.emotions });
}

export function usePatterns() {
  return useQuery({ queryKey: ['patterns'], queryFn: api.options.patterns });
}

export function useStrategies() {
  return useQuery({ queryKey: ['strategies'], queryFn: api.options.strategies });
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(web): add API client and React Query hooks"
```

---

### Task 8: Trade Form and List

**Files:**
- Create: `apps/web/src/components/trades/trade-form.tsx`
- Create: `apps/web/src/components/trades/trade-list.tsx`
- Create: `apps/web/src/app/trades/page.tsx`

- [ ] **Step 1: Create trade form**

Create `apps/web/src/components/trades/trade-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTrade } from '@/hooks/use-trades';
import { useEmotions, usePatterns, useStrategies } from '@/hooks/use-options';

interface TradeFormProps {
  onSuccess?: () => void;
}

export function TradeForm({ onSuccess }: TradeFormProps) {
  const [form, setForm] = useState({
    stockCode: '',
    stockName: '',
    type: 'BUY',
    price: '',
    quantity: '',
    tradedAt: new Date().toISOString().split('T')[0],
    emotionId: '',
    patternId: '',
    strategyId: '',
    memo: '',
  });

  const createTrade = useCreateTrade();
  const { data: emotions } = useEmotions();
  const { data: patterns } = usePatterns();
  const { data: strategies } = useStrategies();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTrade.mutate(
      {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        emotionId: form.emotionId || undefined,
        patternId: form.patternId || undefined,
        strategyId: form.strategyId || undefined,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>종목코드</Label>
          <Input value={form.stockCode} onChange={(e) => setForm({ ...form, stockCode: e.target.value })} required />
        </div>
        <div>
          <Label>종목명</Label>
          <Input value={form.stockName} onChange={(e) => setForm({ ...form, stockName: e.target.value })} required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>매매구분</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BUY">매수</SelectItem>
              <SelectItem value="SELL">매도</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>가격</Label>
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </div>
        <div>
          <Label>수량</Label>
          <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        </div>
      </div>
      <div>
        <Label>매매일</Label>
        <Input type="date" value={form.tradedAt} onChange={(e) => setForm({ ...form, tradedAt: e.target.value })} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>감정</Label>
          <Select value={form.emotionId} onValueChange={(v) => setForm({ ...form, emotionId: v })}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {emotions?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>패턴</Label>
          <Select value={form.patternId} onValueChange={(v) => setForm({ ...form, patternId: v })}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {patterns?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>전략</Label>
          <Select value={form.strategyId} onValueChange={(v) => setForm({ ...form, strategyId: v })}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {strategies?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>메모</Label>
        <Input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
      </div>
      <Button type="submit" className="w-full" disabled={createTrade.isPending}>
        {createTrade.isPending ? '저장 중...' : '매매 등록'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create trade list**

Create `apps/web/src/components/trades/trade-list.tsx`:

```tsx
'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrades, useDeleteTrade } from '@/hooks/use-trades';

export function TradeList() {
  const { data: trades, isLoading } = useTrades();
  const deleteTrade = useDeleteTrade();

  if (isLoading) return <div>로딩 중...</div>;
  if (!trades?.length) return <div className="text-muted-foreground">매매 기록이 없습니다.</div>;

  return (
    <div className="space-y-2">
      {trades.map((trade: any) => (
        <div key={trade.id} className="border rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{trade.stockName}</span>
              <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                {trade.type === 'BUY' ? '매수' : '매도'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(trade.tradedAt), 'yyyy-MM-dd')} · {trade.price.toLocaleString()}원 × {trade.quantity}주
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => deleteTrade.mutate(trade.id)}>
            삭제
          </Button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create trades page**

Create `apps/web/src/app/trades/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TradeForm } from '@/components/trades/trade-form';
import { TradeList } from '@/components/trades/trade-list';

export default function TradesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">매매 기록</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ 매매 등록</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>새 매매 등록</DialogTitle>
            </DialogHeader>
            <TradeForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <TradeList />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(web): add trades page with form and list"
```

---

## Phase 4: Dashboard

### Task 9: Stats API

**Files:**
- Create: `apps/api/src/stats/stats.module.ts`
- Create: `apps/api/src/stats/stats.controller.ts`
- Create: `apps/api/src/stats/stats.service.ts`

- [ ] **Step 1: Create stats service**

Create `apps/api/src/stats/stats.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const trades = await this.prisma.trade.findMany({
      orderBy: [{ stockCode: 'asc' }, { tradedAt: 'asc' }],
    });

    const pairings = this.calculatePairings(trades);
    const wins = pairings.filter((p) => p.profit > 0).length;
    const losses = pairings.filter((p) => p.profit < 0).length;
    const totalProfit = pairings.reduce((sum, p) => sum + p.profit, 0);

    return {
      totalTrades: trades.length,
      totalProfit,
      winRate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0,
      wins,
      losses,
    };
  }

  async getMonthly() {
    const trades = await this.prisma.trade.findMany({
      orderBy: [{ stockCode: 'asc' }, { tradedAt: 'asc' }],
    });
    const pairings = this.calculatePairings(trades);

    const monthly: Record<string, number> = {};
    pairings.forEach((p) => {
      const month = p.sellDate.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + p.profit;
    });

    return Object.entries(monthly)
      .map(([month, profit]) => ({ month, profit }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculatePairings(trades: any[]) {
    const buyQueue: Record<string, any[]> = {};
    const pairings: any[] = [];

    trades.forEach((trade) => {
      if (trade.type === 'BUY') {
        if (!buyQueue[trade.stockCode]) buyQueue[trade.stockCode] = [];
        buyQueue[trade.stockCode].push({ ...trade, remainingQty: trade.quantity });
      } else if (trade.type === 'SELL') {
        let sellQty = trade.quantity;
        const queue = buyQueue[trade.stockCode] || [];

        while (sellQty > 0 && queue.length > 0) {
          const buy = queue[0];
          const matchQty = Math.min(sellQty, buy.remainingQty);
          const profit = (trade.price - buy.price) * matchQty;

          pairings.push({
            stockCode: trade.stockCode,
            buyPrice: buy.price,
            sellPrice: trade.price,
            quantity: matchQty,
            profit,
            sellDate: trade.tradedAt.toISOString(),
            emotionId: trade.emotionId,
            patternId: trade.patternId,
            strategyId: trade.strategyId,
          });

          buy.remainingQty -= matchQty;
          sellQty -= matchQty;
          if (buy.remainingQty === 0) queue.shift();
        }
      }
    });

    return pairings;
  }
}
```

- [ ] **Step 2: Create stats controller**

Create `apps/api/src/stats/stats.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  getSummary() {
    return this.statsService.getSummary();
  }

  @Get('monthly')
  getMonthly() {
    return this.statsService.getMonthly();
  }
}
```

- [ ] **Step 3: Create stats module and register**

Create `apps/api/src/stats/stats.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
```

Update `apps/api/src/app.module.ts` to import `StatsModule`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(api): add stats module with summary and monthly endpoints"
```

---

### Task 10: Dashboard Page

**Files:**
- Create: `apps/web/src/hooks/use-stats.ts`
- Create: `apps/web/src/components/dashboard/kpi-cards.tsx`
- Create: `apps/web/src/components/dashboard/profit-chart.tsx`
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Create stats hook**

Create `apps/web/src/hooks/use-stats.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function useSummary() {
  return useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: () => fetch(`${API_BASE}/stats/summary`).then((r) => r.json()),
  });
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ['stats', 'monthly'],
    queryFn: () => fetch(`${API_BASE}/stats/monthly`).then((r) => r.json()),
  });
}
```

- [ ] **Step 2: Create KPI cards**

Create `apps/web/src/components/dashboard/kpi-cards.tsx`:

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSummary } from '@/hooks/use-stats';

export function KpiCards() {
  const { data, isLoading } = useSummary();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">총 수익</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${data?.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data?.totalProfit?.toLocaleString()}원
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">승률</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.winRate?.toFixed(1)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">승</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-500">{data?.wins}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">패</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{data?.losses}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create profit chart**

Create `apps/web/src/components/dashboard/profit-chart.tsx`:

```tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMonthlyStats } from '@/hooks/use-stats';

export function ProfitChart() {
  const { data, isLoading } = useMonthlyStats();

  if (isLoading) return <div>로딩 중...</div>;
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 수익</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
              <Bar dataKey="profit">
                {data.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Update dashboard page**

Replace `apps/web/src/app/page.tsx`:

```tsx
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { ProfitChart } from '@/components/dashboard/profit-chart';

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">대시보드</h2>
      <KpiCards />
      <ProfitChart />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(web): add dashboard with KPI cards and profit chart"
```

---

## Phase 5: Analysis & Settings

### Task 11: Analysis Page

**Files:**
- Create: `apps/web/src/app/analysis/page.tsx`

- [ ] **Step 1: Create analysis page (placeholder)**

Create `apps/web/src/app/analysis/page.tsx`:

```tsx
export default function AnalysisPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">분석</h2>
      <p className="text-muted-foreground">분석 기능은 추후 구현 예정입니다.</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(web): add analysis page placeholder"
```

---

### Task 12: Settings Page

**Files:**
- Create: `apps/web/src/app/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Create `apps/web/src/app/settings/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmotions, usePatterns, useStrategies } from '@/hooks/use-options';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function OptionSection({ title, queryKey, endpoint }: { title: string; queryKey: string; endpoint: string }) {
  const [newName, setNewName] = useState('');
  const queryClient = useQueryClient();
  const { data: options } = useEmotions();

  const addMutation = useMutation({
    mutationFn: (name: string) =>
      fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setNewName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 옵션 추가" />
          <Button onClick={() => addMutation.mutate(newName)} disabled={!newName}>
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {options?.map((opt: any) => (
            <Badge key={opt.id} variant="secondary" className="gap-1">
              {opt.name}
              {!opt.isDefault && (
                <button onClick={() => deleteMutation.mutate(opt.id)} className="ml-1 hover:text-red-500">
                  ×
                </button>
              )}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">설정</h2>
      <OptionSection title="감정 옵션" queryKey="emotions" endpoint="/options/emotions" />
      <OptionSection title="패턴 옵션" queryKey="patterns" endpoint="/options/patterns" />
      <OptionSection title="전략 옵션" queryKey="strategies" endpoint="/options/strategies" />
    </div>
  );
}
```

- [ ] **Step 2: Fix OptionSection to use correct hook**

The OptionSection needs to accept the actual data. Update to receive data as prop or create separate components per option type.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(web): add settings page for managing options"
```

---

### Task 13: Update Root Package.json

**Files:**
- Modify: `package.json`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update root package.json**

Update scripts in root `package.json`:

```json
{
  "name": "trading-journal",
  "scripts": {
    "dev": "pnpm --filter web dev & pnpm --filter api start:dev",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api start:dev",
    "build": "pnpm --recursive build"
  }
}
```

- [ ] **Step 2: Update CLAUDE.md for new project**

Update CLAUDE.md to reflect trading journal project instead of income dashboard.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: update project config for trading journal"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Project setup: Prisma schema, Next.js, shadcn/ui |
| 2 | 4-5 | Backend CRUD: Options, Trades modules |
| 3 | 6-8 | Frontend: Layout, API hooks, Trades page |
| 4 | 9-10 | Dashboard: Stats API, KPI cards, charts |
| 5 | 11-13 | Analysis, Settings, Project config |
