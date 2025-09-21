"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, AlertCircle, CheckCircle, Clock, Plus } from "lucide-react"
import type { Friend, Expense } from "@/app/page"

interface BillProcessingProps {
  friends: Friend[]
  creditCards: any[]
  expenses: Expense[]
  setExpenses: (expenses: Expense[]) => void
  setFriends: (friends: Friend[]) => void
  setCreditCards: (cards: any[]) => void
}

interface BillTransaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  status: "unassigned" | "assigned" | "ignored"
  assignedFriendId?: string
}

interface ProcessedBill {
  id: string
  cardId: string
  billDate: string
  dueDate: string
  totalAmount: number
  transactions: BillTransaction[]
  status: "pending" | "processed" | "partially_processed"
}

export function BillProcessing({
  friends,
  creditCards,
  expenses,
  setExpenses,
  setFriends,
  setCreditCards,
}: BillProcessingProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
  const [processedBills, setProcessedBills] = useState<ProcessedBill[]>([])
  const [selectedBill, setSelectedBill] = useState<ProcessedBill | null>(null)
  const [billText, setBillText] = useState("")
  const [selectedCardId, setSelectedCardId] = useState("")

  // Manual bill entry state
  const [manualBill, setManualBill] = useState({
    cardId: "",
    billDate: "",
    dueDate: "",
    totalAmount: 0,
    transactions: [] as BillTransaction[],
  })

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    category: "General",
    date: "",
  })

  // Simulate bill parsing (in real app, this would use OCR/AI)
  const parseBillText = (text: string, cardId: string) => {
    const lines = text.split("\n").filter((line) => line.trim())
    const transactions: BillTransaction[] = []

    // Simple parsing logic - in real app, use proper bill parsing
    lines.forEach((line, index) => {
      const amountMatch = line.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g)
      if (amountMatch && line.length > 10) {
        const amount = Number.parseFloat(amountMatch[0].replace(/[₹,]/g, ""))
        if (amount > 0 && amount < 100000) {
          // Reasonable transaction amount
          transactions.push({
            id: `${Date.now()}-${index}`,
            date: new Date().toISOString().split("T")[0],
            description: line.replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{2})?/g, "").trim() || `Transaction ${index + 1}`,
            amount,
            category: "General",
            status: "unassigned",
          })
        }
      }
    })

    const bill: ProcessedBill = {
      id: Date.now().toString(),
      cardId,
      billDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions,
      status: "pending",
    }

    return bill
  }

  const handleBillUpload = () => {
    if (!billText.trim() || !selectedCardId) return

    const parsedBill = parseBillText(billText, selectedCardId)
    setProcessedBills([...processedBills, parsedBill])
    setBillText("")
    setSelectedCardId("")
    setIsUploadOpen(false)
  }

  const handleAssignTransaction = (billId: string, transactionId: string, friendId: string) => {
    setProcessedBills(
      processedBills.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              transactions: bill.transactions.map((t) =>
                t.id === transactionId ? { ...t, status: "assigned", assignedFriendId: friendId } : t,
              ),
            }
          : bill,
      ),
    )
  }

  const handleIgnoreTransaction = (billId: string, transactionId: string) => {
    setProcessedBills(
      processedBills.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              transactions: bill.transactions.map((t) => (t.id === transactionId ? { ...t, status: "ignored" } : t)),
            }
          : bill,
      ),
    )
  }

  const handleProcessBill = (billId: string) => {
    const bill = processedBills.find((b) => b.id === billId)
    if (!bill) return

    const assignedTransactions = bill.transactions.filter((t) => t.status === "assigned")

    // Create expenses for assigned transactions
    const newExpenses: Expense[] = assignedTransactions.map((transaction) => ({
      id: `${Date.now()}-${transaction.id}`,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      friendId: transaction.assignedFriendId!,
      creditCardId: bill.cardId,
      category: transaction.category,
      isEMI: false,
      status: "pending",
    }))

    setExpenses([...expenses, ...newExpenses])

    // Update friends' total owed
    const updatedFriends = friends.map((friend) => {
      const friendTransactions = assignedTransactions.filter((t) => t.assignedFriendId === friend.id)
      const additionalOwed = friendTransactions.reduce((sum, t) => sum + t.amount, 0)
      return additionalOwed > 0 ? { ...friend, totalOwed: friend.totalOwed + additionalOwed } : friend
    })
    setFriends(updatedFriends)

    // Update bill status
    setProcessedBills(
      processedBills.map((b) =>
        b.id === billId
          ? {
              ...b,
              status:
                assignedTransactions.length === b.transactions.filter((t) => t.status !== "ignored").length
                  ? "processed"
                  : "partially_processed",
            }
          : b,
      ),
    )

    // Update credit card balance
    const card = creditCards.find((c) => c.id === bill.cardId)
    if (card) {
      const updatedCards = creditCards.map((c) =>
        c.id === bill.cardId ? { ...c, currentBalance: c.currentBalance + bill.totalAmount } : c,
      )
      setCreditCards(updatedCards)
    }
  }

  const addManualTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return

    const transaction: BillTransaction = {
      id: Date.now().toString(),
      date: newTransaction.date || new Date().toISOString().split("T")[0],
      description: newTransaction.description,
      amount: newTransaction.amount,
      category: newTransaction.category,
      status: "unassigned",
    }

    setManualBill({
      ...manualBill,
      transactions: [...manualBill.transactions, transaction],
    })

    setNewTransaction({
      description: "",
      amount: 0,
      category: "General",
      date: "",
    })
  }

  const handleCreateManualBill = () => {
    if (!manualBill.cardId || manualBill.transactions.length === 0) return

    const bill: ProcessedBill = {
      id: Date.now().toString(),
      cardId: manualBill.cardId,
      billDate: manualBill.billDate || new Date().toISOString().split("T")[0],
      dueDate: manualBill.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: manualBill.totalAmount || manualBill.transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions: manualBill.transactions,
      status: "pending",
    }

    setProcessedBills([...processedBills, bill])
    setManualBill({
      cardId: "",
      billDate: "",
      dueDate: "",
      totalAmount: 0,
      transactions: [],
    })
    setIsManualEntryOpen(false)
  }

  const categories = ["General", "Food", "Shopping", "Entertainment", "Travel", "Bills", "Medical", "Other"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Bill Processing</h2>
        <div className="flex space-x-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Credit Card Bill</DialogTitle>
                <DialogDescription>
                  Paste your credit card bill text or statement details to automatically process transactions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cardSelect">Credit Card</Label>
                  <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select credit card" />
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
                <div className="grid gap-2">
                  <Label htmlFor="billText">Bill Text</Label>
                  <Textarea
                    id="billText"
                    value={billText}
                    onChange={(e) => setBillText(e.target.value)}
                    placeholder="Paste your credit card statement text here..."
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBillUpload}>Process Bill</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Manual Bill</DialogTitle>
                <DialogDescription>Manually create a bill with individual transactions.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="manualCardSelect">Credit Card</Label>
                    <Select
                      value={manualBill.cardId}
                      onValueChange={(value) => setManualBill({ ...manualBill, cardId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit card" />
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
                  <div className="grid gap-2">
                    <Label htmlFor="billDate">Bill Date</Label>
                    <Input
                      id="billDate"
                      type="date"
                      value={manualBill.billDate}
                      onChange={(e) => setManualBill({ ...manualBill, billDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={manualBill.dueDate}
                      onChange={(e) => setManualBill({ ...manualBill, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4">Add Transactions</h4>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="grid gap-2">
                      <Label htmlFor="transactionDesc">Description</Label>
                      <Input
                        id="transactionDesc"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        placeholder="Transaction description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transactionAmount">Amount (₹)</Label>
                      <Input
                        id="transactionAmount"
                        type="number"
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction({ ...newTransaction, amount: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transactionCategory">Category</Label>
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="transactionDate">Date</Label>
                      <Input
                        id="transactionDate"
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addManualTransaction} className="mb-4">
                    Add Transaction
                  </Button>

                  {manualBill.transactions.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Transactions ({manualBill.transactions.length})</h5>
                      {manualBill.transactions.map((transaction, index) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setManualBill({
                                  ...manualBill,
                                  transactions: manualBill.transactions.filter((t) => t.id !== transaction.id),
                                })
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateManualBill}>Create Bill</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Processed Bills */}
      <div className="space-y-4">
        {processedBills.length > 0 ? (
          processedBills.map((bill) => {
            const card = creditCards.find((c) => c.id === bill.cardId)
            const unassignedCount = bill.transactions.filter((t) => t.status === "unassigned").length
            const assignedCount = bill.transactions.filter((t) => t.status === "assigned").length

            return (
              <Card key={bill.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {card?.name} Bill - {new Date(bill.billDate).toLocaleDateString()}
                      </CardTitle>
                      <CardDescription>
                        Due: {new Date(bill.dueDate).toLocaleDateString()} • Total: ₹{bill.totalAmount.toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          bill.status === "processed"
                            ? "default"
                            : bill.status === "partially_processed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {bill.status === "processed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {bill.status === "partially_processed" && <Clock className="h-3 w-3 mr-1" />}
                        {bill.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                        {bill.status.replace("_", " ")}
                      </Badge>
                      {unassignedCount > 0 && (
                        <Button onClick={() => handleProcessBill(bill.id)} disabled={assignedCount === 0}>
                          Process Bill
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bill.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                          {transaction.status === "unassigned" && (
                            <div className="flex space-x-2">
                              <Select
                                onValueChange={(friendId) => handleAssignTransaction(bill.id, transaction.id, friendId)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {friends.map((friend) => (
                                    <SelectItem key={friend.id} value={friend.id}>
                                      {friend.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleIgnoreTransaction(bill.id, transaction.id)}
                              >
                                Ignore
                              </Button>
                            </div>
                          )}
                          {transaction.status === "assigned" && (
                            <Badge variant="default">
                              {friends.find((f) => f.id === transaction.assignedFriendId)?.name}
                            </Badge>
                          )}
                          {transaction.status === "ignored" && <Badge variant="secondary">Ignored</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No bills processed yet. Upload a credit card statement or create a manual bill to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
