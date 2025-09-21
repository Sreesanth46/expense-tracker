"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Receipt, Trash2 } from "lucide-react"
import type { Friend, Expense } from "@/app/page"

interface ExpenseTrackingProps {
  friends: Friend[]
  creditCards: any[]
  expenses: Expense[]
  setExpenses: (expenses: Expense[]) => void
  setFriends: (friends: Friend[]) => void
}

export function ExpenseTracking({ friends, creditCards, expenses, setExpenses, setFriends }: ExpenseTrackingProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: 0,
    friendId: "",
    creditCardId: "",
    category: "",
    isEMI: false,
    tax: 0,
    interest: 0,
    emiDetails: {
      totalAmount: 0,
      monthlyAmount: 0,
      remainingMonths: 0,
      interestRate: 0,
    },
  })

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.friendId || !newExpense.creditCardId) return

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: newExpense.amount,
      date: new Date().toISOString().split("T")[0],
      friendId: newExpense.friendId,
      creditCardId: newExpense.creditCardId,
      category: newExpense.category || "General",
      isEMI: newExpense.isEMI,
      emiDetails: newExpense.isEMI ? newExpense.emiDetails : undefined,
      tax: newExpense.tax || 0,
      interest: newExpense.interest || 0,
      status: "pending",
    }

    setExpenses([...expenses, expense])

    // Update friend's total owed
    const updatedFriends = friends.map((friend) =>
      friend.id === newExpense.friendId
        ? {
            ...friend,
            totalOwed: friend.totalOwed + newExpense.amount + (newExpense.tax || 0) + (newExpense.interest || 0),
          }
        : friend,
    )
    setFriends(updatedFriends)

    // Reset form
    setNewExpense({
      description: "",
      amount: 0,
      friendId: "",
      creditCardId: "",
      category: "",
      isEMI: false,
      tax: 0,
      interest: 0,
      emiDetails: {
        totalAmount: 0,
        monthlyAmount: 0,
        remainingMonths: 0,
        interestRate: 0,
      },
    })
    setIsAddExpenseOpen(false)
  }

  const handleDeleteExpense = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId)
    if (!expense) return

    setExpenses(expenses.filter((e) => e.id !== expenseId))

    // Update friend's total owed
    const updatedFriends = friends.map((friend) =>
      friend.id === expense.friendId
        ? {
            ...friend,
            totalOwed: Math.max(0, friend.totalOwed - expense.amount - (expense.tax || 0) - (expense.interest || 0)),
          }
        : friend,
    )
    setFriends(updatedFriends)
  }

  const handleMarkAsPaid = (expenseId: string) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === expenseId ? { ...expense, status: "paid" as const } : expense,
    )
    setExpenses(updatedExpenses)

    // Update friend's total owed
    const expense = expenses.find((e) => e.id === expenseId)
    if (expense) {
      const updatedFriends = friends.map((friend) =>
        friend.id === expense.friendId
          ? {
              ...friend,
              totalOwed: Math.max(0, friend.totalOwed - expense.amount - (expense.tax || 0) - (expense.interest || 0)),
            }
          : friend,
      )
      setFriends(updatedFriends)
    }
  }

  const categories = ["General", "Food", "Shopping", "Entertainment", "Travel", "Bills", "Medical", "Other"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Expense Tracking</h2>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>Record a new expense and assign it to a friend.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="What was purchased?"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="friend">Friend</Label>
                  <Select
                    value={newExpense.friendId}
                    onValueChange={(value) => setNewExpense({ ...newExpense, friendId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select friend" />
                    </SelectTrigger>
                    <SelectContent>
                      {friends.map((friend) => (
                        <SelectItem key={friend.id} value={friend.id}>
                          {friend.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditCard">Credit Card</Label>
                  <Select
                    value={newExpense.creditCardId}
                    onValueChange={(value) => setNewExpense({ ...newExpense, creditCardId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select card" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} •••• {card.lastFourDigits}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tax">Tax (₹)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={newExpense.tax}
                    onChange={(e) => setNewExpense({ ...newExpense, tax: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interest">Interest (₹)</Label>
                  <Input
                    id="interest"
                    type="number"
                    value={newExpense.interest}
                    onChange={(e) => setNewExpense({ ...newExpense, interest: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEMI"
                  checked={newExpense.isEMI}
                  onCheckedChange={(checked) => setNewExpense({ ...newExpense, isEMI: !!checked })}
                />
                <Label htmlFor="isEMI">This is an EMI purchase</Label>
              </div>

              {newExpense.isEMI && (
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="grid gap-2">
                    <Label htmlFor="totalAmount">Total EMI Amount (₹)</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={newExpense.emiDetails.totalAmount}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          emiDetails: { ...newExpense.emiDetails, totalAmount: Number.parseFloat(e.target.value) || 0 },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monthlyAmount">Monthly EMI (₹)</Label>
                    <Input
                      id="monthlyAmount"
                      type="number"
                      value={newExpense.emiDetails.monthlyAmount}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          emiDetails: {
                            ...newExpense.emiDetails,
                            monthlyAmount: Number.parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="remainingMonths">Remaining Months</Label>
                    <Input
                      id="remainingMonths"
                      type="number"
                      value={newExpense.emiDetails.remainingMonths}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          emiDetails: {
                            ...newExpense.emiDetails,
                            remainingMonths: Number.parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={newExpense.emiDetails.interestRate}
                      onChange={(e) =>
                        setNewExpense({
                          ...newExpense,
                          emiDetails: {
                            ...newExpense.emiDetails,
                            interestRate: Number.parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAddExpense}>Add Expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {expenses.length > 0 ? (
          expenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => {
              const friend = friends.find((f) => f.id === expense.friendId)
              const card = creditCards.find((c) => c.id === expense.creditCardId)
              const totalAmount = expense.amount + (expense.tax || 0) + (expense.interest || 0)

              return (
                <Card key={expense.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{expense.description}</h3>
                          <Badge variant="outline">{expense.category}</Badge>
                          {expense.isEMI && <Badge variant="secondary">EMI</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Friend:</span> {friend?.name}
                          </div>
                          <div>
                            <span className="font-medium">Card:</span> {card?.name}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(expense.date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <Badge
                              variant={
                                expense.status === "paid"
                                  ? "default"
                                  : expense.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="ml-1"
                            >
                              {expense.status}
                            </Badge>
                          </div>
                        </div>
                        {expense.isEMI && expense.emiDetails && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">EMI Details:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                              <div>Monthly: ₹{expense.emiDetails.monthlyAmount.toLocaleString()}</div>
                              <div>Remaining: {expense.emiDetails.remainingMonths} months</div>
                              <div>Total: ₹{expense.emiDetails.totalAmount.toLocaleString()}</div>
                              <div>Rate: {expense.emiDetails.interestRate}%</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
                        {(expense.tax || expense.interest) && (
                          <p className="text-sm text-muted-foreground">
                            Base: ₹{expense.amount.toLocaleString()}
                            {expense.tax > 0 && ` + Tax: ₹${expense.tax}`}
                            {expense.interest > 0 && ` + Interest: ₹${expense.interest}`}
                          </p>
                        )}
                        <div className="flex space-x-2 mt-3">
                          {expense.status === "pending" && (
                            <Button size="sm" onClick={() => handleMarkAsPaid(expense.id)}>
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No expenses recorded yet. Add your first expense to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
