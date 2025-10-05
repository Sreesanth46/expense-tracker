'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface TabViewProps {
  activeTab?: string;
  tabs: { value: string; label: string; component: React.ReactNode }[];
  tabKey?: string;
}

export default function TabView({
  activeTab: _activeTab,
  tabs,
  tabKey = 'tab'
}: TabViewProps) {
  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(
    query?.get(tabKey) ?? tabs[0].value
  );

  useEffect(() => {
    const tab = query?.get(tabKey);
    if (!tab) {
      onValueChange(tabs[0].value);
    }
  }, []);

  function onValueChange(value: string) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set(tabKey, value);
    router.push(`${pathname}?${searchParams.toString()}`, { scroll: false });
    setActiveTab(previous => (value !== previous ? value : previous));
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
