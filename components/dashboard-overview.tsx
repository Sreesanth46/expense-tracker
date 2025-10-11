'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CreditCard, Calendar, Trash2 } from 'lucide-react';
import { useExpense } from '@/contexts/expense-context';
import { NewCreditCard as TNewCreditCard } from '@/lib/db/schema/card';

type NewCreditCard = Omit<TNewCreditCard, 'dueDate' | 'billingDate'> & {
  dueDate?: string;
  billingDate?: string;
};

export function DashboardOverview() {
  const {
    friends,
    creditCards,
    expenses,
    addCreditCard,
    deleteCreditCard,
    fetchCreditCards
  } = useExpense();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState<NewCreditCard>({
    name: '',
    lastFourDigits: '',
    bank: '',
    creditLimit: 0,
    dueDate: ''
  });

  const handleAddCard = () => {
    if (!newCard.name || !newCard.lastFourDigits || !newCard.bank) return;

    addCreditCard(newCard as TNewCreditCard);

    setNewCard({
      name: '',
      lastFourDigits: '',
      bank: '',
      creditLimit: 0,
      dueDate: ''
    });
    setIsAddCardOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCreditCard(cardId);
  };

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  useEffect(() => {
    fetchCreditCards();
  }, []);

  return (
    <div className="space-y-6">
      {/* Credit Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Credit Cards</h2>
          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credit Card</DialogTitle>
                <DialogDescription>
                  Add a new credit card to track expenses and bills.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cardName">Card Name</Label>
                  <Input
                    id="cardName"
                    value={newCard.name}
                    onChange={e =>
                      setNewCard({ ...newCard, name: e.target.value })
                    }
                    placeholder="e.g., HDFC Regalia"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Input
                    id="bank"
                    value={newCard.bank}
                    onChange={e =>
                      setNewCard({ ...newCard, bank: e.target.value })
                    }
                    placeholder="e.g., HDFC Bank"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastFour">Last 4 Digits</Label>
                  <Input
                    id="lastFour"
                    value={newCard.lastFourDigits}
                    onChange={e =>
                      setNewCard({ ...newCard, lastFourDigits: e.target.value })
                    }
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance">Credit Limit</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={newCard.creditLimit}
                    onChange={e =>
                      setNewCard({
                        ...newCard,
                        creditLimit: Number.parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newCard.dueDate}
                    onChange={e =>
                      setNewCard({ ...newCard, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCard}>Add Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditCards.map(card => (
            <Card key={card.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {card.bank} •••• {card.lastFourDigits}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Balance:
                    </span>
                    <span className="font-medium">
                      ₹{card.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  {card.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Due Date:
                      </span>
                      <span className="font-medium">
                        {new Date(card.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {creditCards.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No credit cards added yet. Add your first card to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Latest Expenses</CardTitle>
            <CardDescription>Your most recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map(expense => {
                  const friend = friends.find(f => f.id === expense.friendId);
                  const card = creditCards.find(
                    c => c.id === expense.creditCardId
                  );

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {friend?.name} • {card?.name} •{' '}
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{expense.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            expense.status === 'paid'
                              ? 'default'
                              : expense.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No expenses recorded yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
