'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardOverview } from '@/components/dashboard-overview';
import { FriendManagement } from '@/components/friend-management';
import { ExpenseTracking } from '@/components/expense-tracking';
import { DebtVisualization } from '@/components/debt-visualization';
import { BillProcessing } from '@/components/bill-processing';
import { useExpense } from '@/contexts/expense-context';

export default function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { totalOwed, totalExpenses, pendingPayments, friends } = useExpense();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Credit Card Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Track expenses, manage lending, and monitor what your friends owe
            you
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Total Owed
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ₹{totalOwed.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                    Friends
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {friends.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {pendingPayments}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="debts">Debts</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="friends">
            <FriendManagement />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracking />
          </TabsContent>

          <TabsContent value="debts">
            <DebtVisualization />
          </TabsContent>

          <TabsContent value="bills">
            <BillProcessing />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
