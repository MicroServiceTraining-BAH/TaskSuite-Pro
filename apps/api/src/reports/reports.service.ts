import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Profit & Loss Statement (Income Statement)
   * Shows revenue and expenses for a period
   */
  async getProfitAndLoss(companyId: string, startDate: Date, endDate: Date) {
    // Get all invoices (income)
    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate, lte: endDate },
        status: 'paid',
      },
      include: { lineItems: true },
    });

    // Calculate total revenue
    let totalRevenue = 0;
    invoices.forEach(invoice => {
      if (invoice.lineItems.length > 0) {
        const subtotal = invoice.lineItems.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          const tax = itemTotal * (item.taxRate || 0);
          return sum + itemTotal + tax;
        }, 0);
        totalRevenue += subtotal;
      } else {
        // Fallback to invoice amount if no line items
        totalRevenue += invoice.amount;
      }
    });

    // Get all expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
      include: { account: true },
    });

    // Group expenses by account
    const expensesByAccount: Record<string, { name: string; total: number }> = {};
    let totalExpenses = 0;

    expenses.forEach(expense => {
      const accountName = expense.account?.name || 'Uncategorized';
      if (!expensesByAccount[accountName]) {
        expensesByAccount[accountName] = { name: accountName, total: 0 };
      }
      expensesByAccount[accountName].total += expense.amount;
      totalExpenses += expense.amount;
    });

    const netIncome = totalRevenue - totalExpenses;

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      revenue: {
        total: totalRevenue,
        invoices: invoices.length,
      },
      expenses: {
        total: totalExpenses,
        byAccount: Object.values(expensesByAccount),
      },
      netIncome,
      netIncomePercent: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    };
  }

  /**
   * Cash Flow Statement
   * Shows money in and out
   */
  async getCashFlow(companyId: string, startDate: Date, endDate: Date) {
    // Cash in: Paid invoices
    const paidInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        paidAt: { gte: startDate, lte: endDate },
        status: 'paid',
      },
      include: { lineItems: true },
    });

    let cashIn = 0;
    paidInvoices.forEach(invoice => {
      if (invoice.lineItems.length > 0) {
        const subtotal = invoice.lineItems.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          const tax = itemTotal * (item.taxRate || 0);
          return sum + itemTotal + tax;
        }, 0);
        cashIn += subtotal;
      } else {
        cashIn += invoice.amount;
      }
    });

    // Cash out: Expenses and paid bills
    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const paidBills = await this.prisma.bill.findMany({
      where: {
        companyId,
        paidAt: { gte: startDate, lte: endDate },
        status: 'paid',
      },
    });

    const cashOutExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const cashOutBills = paidBills.reduce((sum, b) => sum + b.amount, 0);
    const cashOut = cashOutExpenses + cashOutBills;

    const netCashFlow = cashIn - cashOut;

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      cashIn: {
        total: cashIn,
        fromInvoices: cashIn,
        invoiceCount: paidInvoices.length,
      },
      cashOut: {
        total: cashOut,
        expenses: cashOutExpenses,
        bills: cashOutBills,
        expenseCount: expenses.length,
        billCount: paidBills.length,
      },
      netCashFlow,
    };
  }

  /**
   * Balance Sheet
   * Shows assets, liabilities, and equity
   */
  async getBalanceSheet(companyId: string, asOfDate: Date) {
    // Assets: Cash from invoices minus expenses and bills
    const allPaidInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        paidAt: { lte: asOfDate },
        status: 'paid',
      },
      include: { lineItems: true },
    });

    let totalAssets = 0;
    allPaidInvoices.forEach(invoice => {
      if (invoice.lineItems.length > 0) {
        const subtotal = invoice.lineItems.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice;
          const tax = itemTotal * (item.taxRate || 0);
          return sum + itemTotal + tax;
        }, 0);
        totalAssets += subtotal;
      } else {
        totalAssets += invoice.amount;
      }
    });

    const allExpenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        date: { lte: asOfDate },
      },
    });

    const allPaidBills = await this.prisma.bill.findMany({
      where: {
        companyId,
        paidAt: { lte: asOfDate },
        status: 'paid',
      },
    });

    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBills = allPaidBills.reduce((sum, b) => sum + b.amount, 0);

    // Liabilities: Unpaid bills
    const unpaidBills = await this.prisma.bill.findMany({
      where: {
        companyId,
        status: { in: ['unpaid', 'overdue'] },
        dueDate: { lte: asOfDate },
      },
    });

    const totalLiabilities = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

    // Equity: Assets - Liabilities
    const cash = totalAssets - totalExpenses - totalBills;
    const equity = cash - totalLiabilities;

    return {
      asOfDate,
      assets: {
        cash,
        total: cash,
      },
      liabilities: {
        unpaidBills: totalLiabilities,
        total: totalLiabilities,
      },
      equity,
      total: cash, // Assets = Liabilities + Equity
    };
  }

  /**
   * Get summary statistics
   */
  async getSummary(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [monthlyPnl, yearlyPnl, cashFlow, balanceSheet] = await Promise.all([
      this.getProfitAndLoss(companyId, startOfMonth, now),
      this.getProfitAndLoss(companyId, startOfYear, now),
      this.getCashFlow(companyId, startOfMonth, now),
      this.getBalanceSheet(companyId, now),
    ]);

    // Get unpaid invoices
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['pending', 'overdue'] },
      },
    });

    const unpaidInvoicesTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Get overdue bills
    const overdueBills = await this.prisma.bill.findMany({
      where: {
        companyId,
        status: 'overdue',
      },
    });

    const overdueBillsTotal = overdueBills.reduce((sum, b) => sum + b.amount, 0);

    return {
      monthly: {
        revenue: monthlyPnl.revenue.total,
        expenses: monthlyPnl.expenses.total,
        netIncome: monthlyPnl.netIncome,
      },
      yearly: {
        revenue: yearlyPnl.revenue.total,
        expenses: yearlyPnl.expenses.total,
        netIncome: yearlyPnl.netIncome,
      },
      cashFlow: {
        net: cashFlow.netCashFlow,
        in: cashFlow.cashIn.total,
        out: cashFlow.cashOut.total,
      },
      balanceSheet: {
        cash: balanceSheet.assets.cash,
        liabilities: balanceSheet.liabilities.total,
        equity: balanceSheet.equity,
      },
      outstanding: {
        unpaidInvoices: unpaidInvoicesTotal,
        overdueBills: overdueBillsTotal,
      },
    };
  }
}

