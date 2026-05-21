"use client";

import { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/use-expenses";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";
import { formatLocalDate } from "@/lib/utils";

import { CategoryDialog } from "./expenses/CategoryDialog";
import { ExpenseDialog } from "./expenses/ExpenseDialog";
import { StatsCards } from "./expenses/StatsCards";
import { ExpensesTable } from "./expenses/ExpensesTable";

interface FilterState {
  page: number;
  limit: number;
  categoryId: string | null;
  status: string | null;
}

export function ExpensesScreen() {
  const [filters, setFilters] = useState<FilterState>({ page: 1, limit: 10, categoryId: null, status: null });
  const { 
    expenses, 
    categories, 
    stats, 
    isLoading, 
    createCategory, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    isCreatingExpense,
    isCreatingCategory
  } = useExpenses(filters);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const handleOpenExpense = (expense: any = null) => {
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  const handleExpenseSubmit = async (form: any) => {
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount)
      };
      if (editingExpense) {
        await updateExpense({ id: editingExpense.id, input: payload });
        toast.success("Expense updated successfully");
      } else {
        await createExpense(payload);
        toast.success("Expense added successfully");
      }
      setIsExpenseDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save expense");
    }
  };

  const handleCategorySubmit = async (form: { name: string; description: string }) => {
    try {
      await createCategory(form);
      toast.success("Category added successfully");
      setIsCategoryDialogOpen(false);
    } catch (err) {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Delete this expense?")) {
      try {
        await deleteExpense(id);
        toast.success("Expense deleted");
      } catch (err) {
        toast.error("Failed to delete expense");
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiFetch("/api/exports?type=expenses", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expenses_${formatLocalDate(new Date())}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Expenses exported to Excel successfully");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Wallet className="size-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Expenses</h2>
            <p className="text-muted-foreground mt-1">Manage school expenditures and categories.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CategoryDialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
            onSubmit={handleCategorySubmit}
            isCreating={isCreatingCategory}
          />

          <Button 
            onClick={() => handleOpenExpense()} 
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
          >
            <Plus className="size-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters & Table */}
      <ExpensesTable
        expenses={expenses}
        categories={categories}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={setFilters}
        onEdit={handleOpenExpense}
        onDelete={handleDeleteExpense}
        onExport={handleExport}
      />

      {/* Expense Modal */}
      <ExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        editingExpense={editingExpense}
        categories={categories}
        onSubmit={handleExpenseSubmit}
        isSaving={isCreatingExpense}
      />
    </div>
  );
}
