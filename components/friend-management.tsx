'use client';

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Mail, Trash2, Edit } from 'lucide-react';
import { useExpense } from '@/contexts/expense-context';

export function FriendManagement() {
  const { friends, expenses, addFriend, updateFriend, deleteFriend } =
    useExpense();

  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<any>(null);
  const [newFriend, setNewFriend] = useState({
    name: '',
    email: ''
  });

  const handleAddFriend = () => {
    if (!newFriend.name) return;

    addFriend({
      name: newFriend.name,
      email: newFriend.email || undefined
    });

    setNewFriend({ name: '', email: '' });
    setIsAddFriendOpen(false);
  };

  const handleEditFriend = (friend: any) => {
    setEditingFriend(friend);
    setNewFriend({
      name: friend.name,
      email: friend.email || ''
    });
  };

  const handleUpdateFriend = () => {
    if (!editingFriend || !newFriend.name) return;

    updateFriend(editingFriend.id, {
      name: newFriend.name,
      email: newFriend.email || undefined
    });

    setEditingFriend(null);
    setNewFriend({ name: '', email: '' });
  };

  const handleDeleteFriend = (friendId: string) => {
    deleteFriend(friendId);
  };

  const calculateFriendOwed = (friendId: string) => {
    return expenses
      .filter(e => e.friendId === friendId && e.status !== 'paid')
      .reduce((sum, e) => sum + e.amount + (e.tax || 0) + (e.interest || 0), 0);
  };

  const getFriendExpenseCount = (friendId: string) => {
    return expenses.filter(e => e.friendId === friendId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Friends Management</h2>
        <Dialog
          open={isAddFriendOpen || !!editingFriend}
          onOpenChange={open => {
            if (!open) {
              setIsAddFriendOpen(false);
              setEditingFriend(null);
              setNewFriend({ name: '', email: '' });
            }
          }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddFriendOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFriend ? 'Edit Friend' : 'Add Friend'}
              </DialogTitle>
              <DialogDescription>
                {editingFriend
                  ? 'Update friend information.'
                  : 'Add a new friend to track expenses.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="friendName">Name</Label>
                <Input
                  id="friendName"
                  value={newFriend.name}
                  onChange={e =>
                    setNewFriend({ ...newFriend, name: e.target.value })
                  }
                  placeholder="Friend's name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="friendEmail">Email (Optional)</Label>
                <Input
                  id="friendEmail"
                  type="email"
                  value={newFriend.email}
                  onChange={e =>
                    setNewFriend({ ...newFriend, email: e.target.value })
                  }
                  placeholder="friend@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={editingFriend ? handleUpdateFriend : handleAddFriend}>
                {editingFriend ? 'Update Friend' : 'Add Friend'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.map(friend => {
          const owedAmount = calculateFriendOwed(friend.id);
          const expenseCount = getFriendExpenseCount(friend.id);

          return (
            <Card key={friend.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar || '/placeholder.svg'} />
                      <AvatarFallback>
                        {friend.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{friend.name}</CardTitle>
                      {friend.email && (
                        <CardDescription className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {friend.email}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFriend(friend)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFriend(friend.id)}
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Amount Owed:
                    </span>
                    <Badge
                      variant={owedAmount > 0 ? 'destructive' : 'default'}
                      className="font-medium">
                      ₹{owedAmount.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Expenses:
                    </span>
                    <span className="font-medium">{expenseCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {friends.length === 0 && (
          <Card className="border-dashed col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No friends added yet. Add your first friend to start tracking
                expenses.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
