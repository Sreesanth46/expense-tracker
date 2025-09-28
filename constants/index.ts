export const transactionCategory = {
  Housing: 'Housing',
  Utilities: 'Utilities',
  Groceries: 'Groceries',
  Food: 'Food',
  Transportation: 'Transportation',
  Healthcare: 'Healthcare',
  Entertainment: 'Entertainment',
  Shopping: 'Shopping',
  Education: 'Education',
  Travel: 'Travel',
  Subscriptions: 'Subscriptions',
  DebtPayments: 'Debt Payments',
  Taxes: 'Taxes',
  Gifts: 'Gifts',
  Miscellaneous: 'Miscellaneous',
  PersonalCare: 'Personal Care',
  Insurance: 'Insurance',
  Savings: 'Savings',
  Others: 'Others'
};

export const transactionCategoryValues = Object.values(transactionCategory) as [
  string,
  ...string[]
];
