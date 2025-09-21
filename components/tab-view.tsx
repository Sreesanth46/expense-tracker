'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/router';

export interface TabViewProps {
  activeTab: string;
  tabs: { value: string; label: string; component: React.ReactNode }[];
  tabKey?: string;
}

export default function TabView({
  activeTab,
  tabs,
  tabKey = 'tab'
}: TabViewProps) {
  const router = useRouter();
  const { query } = router;

  function onValueChange(value: string) {
    router.push(
      {
        pathname: router.pathname,
        query: { ...query, [tabKey]: value }
      },
      undefined,
      { shallow: true } // avoids full reload
    );
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
