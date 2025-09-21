export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  friendId: string;
  creditCardId: string;
  category: string;
  isEMI: boolean;
  emiDetails?: {
    totalAmount: number;
    monthlyAmount: number;
    remainingMonths: number;
    interestRate: number;
  };
  tax?: number;
  interest?: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially paid';
}