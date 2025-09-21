"use client"

import { Expense } from "@/app/page"
import { CreditCard } from "@/types/card"
import { Friend } from "@/types/friend"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"


interface ExpenseContextType {
  // State
  friends: Friend[]
  creditCards: CreditCard[]
  expenses: Expense[]

  // Actions
  addFriend: (friend: Omit<Friend, "id" | "totalOwed">) => void
  updateFriend: (id: string, updates: Partial<Friend>) => void
  deleteFriend: (id: string) => void

  addCreditCard: (card: Omit<CreditCard, "id">) => void
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void
  deleteCreditCard: (id: string) => void

  addExpense: (expense: Omit<Expense, "id" | "date" | "status">) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  markExpenseAsPaid: (id: string) => void

  // Computed values
  totalOwed: number
  totalExpenses: number
  pendingPayments: number
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFriends = localStorage.getItem("expense-tracker-friends")
    const savedCards = localStorage.getItem("expense-tracker-cards")
    const savedExpenses = localStorage.getItem("expense-tracker-expenses")

    if (savedFriends) setFriends(JSON.parse(savedFriends))
    if (savedCards) setCreditCards(JSON.parse(savedCards))
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("expense-tracker-friends", JSON.stringify(friends))
  }, [friends])

  useEffect(() => {
    localStorage.setItem("expense-tracker-cards", JSON.stringify(creditCards))
  }, [creditCards])

  useEffect(() => {
    localStorage.setItem("expense-tracker-expenses", JSON.stringify(expenses))
  }, [expenses])

  // Helper function to recalculate friend totals
  const recalculateFriendTotals = (updatedExpenses: Expense[]) => {
    setFriends((currentFriends) =>
      currentFriends.map((friend) => ({
        ...friend,
        totalOwed: updatedExpenses
          .filter((e) => e.friendId === friend.id && e.status !== "paid")
          .reduce((sum, e) => sum + e.amount + (e.tax || 0) + (e.interest || 0), 0),
      })),
    )
  }

  // Friend actions
  const addFriend = (friendData: Omit<Friend, "id" | "totalOwed">) => {
    const newFriend: Friend = {
      id: Date.now().toString(),
      totalOwed: 0,
      ...friendData,
    }
    setFriends((prev) => [...prev, newFriend])
  }

  const updateFriend = (id: string, updates: Partial<Friend>) => {
    setFriends((prev) => prev.map((friend) => (friend.id === id ? { ...friend, ...updates } : friend)))
  }

  const deleteFriend = (id: string) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== id))
    // Also remove expenses for this friend
    setExpenses((prev) => prev.filter((expense) => expense.friendId !== id))
  }

  // Credit Card actions
  const addCreditCard = (cardData: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      id: Date.now().toString(),
      ...cardData,
    }
    setCreditCards((prev) => [...prev, newCard])
  }

  const updateCreditCard = (id: string, updates: Partial<CreditCard>) => {
    setCreditCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...updates } : card)))
  }

  const deleteCreditCard = (id: string) => {
    setCreditCards((prev) => prev.filter((card) => card.id !== id))
    // Also remove expenses for this card
    setExpenses((prev) => prev.filter((expense) => expense.creditCardId !== id))
  }

  // Expense actions
  const addExpense = (expenseData: Omit<Expense, "id" | "date" | "status">) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      ...expenseData,
    }

    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    recalculateFriendTotals(updatedExpenses)
  }

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updatedExpenses = expenses.map((expense) => (expense.id === id ? { ...expense, ...updates } : expense))
    setExpenses(updatedExpenses)
    recalculateFriendTotals(updatedExpenses)
  }

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id)
    setExpenses(updatedExpenses)
    recalculateFriendTotals(updatedExpenses)
  }

  const markExpenseAsPaid = (id: string) => {
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, status: "paid" as const } : expense,
    )
    setExpenses(updatedExpenses)
    recalculateFriendTotals(updatedExpenses)
  }

  // Computed values
  const totalOwed = friends.reduce((sum, friend) => sum + friend.totalOwed, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingPayments = expenses.filter((e) => e.status === "pending").length

  const value: ExpenseContextType = {
    // State
    friends,
    creditCards,
    expenses,

    // Actions
    addFriend,
    updateFriend,
    deleteFriend,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addExpense,
    updateExpense,
    deleteExpense,
    markExpenseAsPaid,

    // Computed values
    totalOwed,
    totalExpenses,
    pendingPayments,
  }

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}

export function useExpense() {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider")
  }
  return context
}
