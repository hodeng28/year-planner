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
