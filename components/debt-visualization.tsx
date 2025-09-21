"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import type { Friend, Expense } from "@/app/page"

interface DebtVisualizationProps {
  friends: Friend[]
  expenses: Expense[]
}

export function DebtVisualization({ friends, expenses }: DebtVisualizationProps) {
  const getFriendDebts = () => {
    return friends
      .map((friend) => {
        const friendExpenses = expenses.filter((e) => e.friendId === friend.id)
        const totalOwed = friendExpenses
          .filter((e) => e.status !== "paid")
          .reduce((sum, e) => sum + e.amount + (e.tax || 0) + (e.interest || 0), 0)
        const totalPaid = friendExpenses
          .filter((e) => e.status === "paid")
          .reduce((sum, e) => sum + e.amount + (e.tax || 0) + (e.interest || 0), 0)
        const totalExpenses = friendExpenses.length
        const pendingExpenses = friendExpenses.filter((e) => e.status === "pending").length
        const emiExpenses = friendExpenses.filter((e) => e.isEMI && e.status !== "paid")

        return {
          ...friend,
          totalOwed,
          totalPaid,
          totalExpenses,
          pendingExpenses,
          emiExpenses,
          lastExpenseDate:
            friendExpenses.length > 0 ? Math.max(...friendExpenses.map((e) => new Date(e.date).getTime())) : null,
        }
      })
      .sort((a, b) => b.totalOwed - a.totalOwed)
  }

  const getOverallStats = () => {
    const totalOwed = expenses
      .filter((e) => e.status !== "paid")
      .reduce((sum, e) => sum + e.amount + (e.tax || 0) + (e.interest || 0), 0)
    const totalPaid = expenses
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + e.amount + (e.tax || 0) + (e.interest || 0), 0)
    const totalEMI = expenses
      .filter((e) => e.isEMI && e.status !== "paid")
      .reduce((sum, e) => sum + (e.emiDetails?.totalAmount || e.amount), 0)
    const overdueExpenses = expenses.filter((e) => {
      if (e.status !== "pending") return false
      const expenseDate = new Date(e.date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return expenseDate < thirtyDaysAgo
    }).length

    return { totalOwed, totalPaid, totalEMI, overdueExpenses }
  }

  const friendDebts = getFriendDebts()
  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Debt Visualization</h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Total Owed</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">₹{stats.totalOwed.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Paid</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ₹{stats.totalPaid.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">EMI Outstanding</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ₹{stats.totalEMI.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.overdueExpenses}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Friend Debt Details */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Friend-wise Debt Breakdown</h3>
        {friendDebts.length > 0 ? (
          friendDebts.map((friend) => {
            const paymentRate =
              friend.totalPaid + friend.totalOwed > 0
                ? (friend.totalPaid / (friend.totalPaid + friend.totalOwed)) * 100
                : 0

            return (
              <Card key={friend.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {friend.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-lg font-semibold">{friend.name}</h4>
                        <p className="text-sm text-muted-foreground">{friend.totalExpenses} total expenses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-destructive">₹{friend.totalOwed.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">outstanding</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>{paymentRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={paymentRate} className="h-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="font-semibold text-green-600">₹{friend.totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Pending Payments</p>
                      <p className="font-semibold">{friend.pendingExpenses}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {friend.totalOwed > 0 && (
                      <Badge variant="destructive">₹{friend.totalOwed.toLocaleString()} owed</Badge>
                    )}
                    {friend.emiExpenses.length > 0 && (
                      <Badge variant="secondary">{friend.emiExpenses.length} EMI active</Badge>
                    )}
                    {friend.lastExpenseDate && (
                      <Badge variant="outline">
                        Last expense: {new Date(friend.lastExpenseDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No debt data available. Add some expenses to see debt visualization.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
