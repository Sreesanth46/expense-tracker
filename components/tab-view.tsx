'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface TabViewProps {
  activeTab?: string;
  tabs: { value: string; label: string; component: React.ReactNode }[];
  tabKey?: string;
}

export default function TabView({
  activeTab,
  tabs,
  tabKey = 'tab'
}: TabViewProps) {
  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();

  function onValueChange(value: string) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set(tabKey, value);
    router.push(`${pathname}?${searchParams.toString()}`, { scroll: true });
  }

  return (
    <Tabs value={activeTab} onValueChange={onValueChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}
