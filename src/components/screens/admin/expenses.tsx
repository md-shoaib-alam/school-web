"use client";

import { useState } from "react";
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit2, 
  IndianRupee, 
  TrendingDown, 
  Filter,
  Download,
  PlusCircle,
  Tag,
  Calendar,
  CreditCard,
  Search,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useExpenses } from "@/hooks/use-expenses";
import { DatePicker } from "@/components/ui/date-picker";
import { goeyToast as toast } from "goey-toast";
import { format } from "date-fns";

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
  
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    paymentMethod: "cash",
    referenceNo: "",
    status: "paid"
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: ""
  });

  const handleOpenExpense = (expense: any = null) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        categoryId: expense.categoryId,
        amount: expense.amount.toString(),
        date: expense.date,
        description: expense.description || "",
        paymentMethod: expense.paymentMethod,
        referenceNo: expense.referenceNo || "",
        status: expense.status
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        categoryId: categories[0]?.id || "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        paymentMethod: "cash",
        referenceNo: "",
        status: "paid"
      });
    }
    setIsExpenseDialogOpen(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
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

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(categoryForm);
      toast.success("Category added successfully");
      setCategoryForm({ name: "", description: "" });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Expenses</h2>
            <p className="text-muted-foreground mt-1">Manage school expenditures and categories.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-rose-200 hover:bg-rose-50 dark:border-rose-800">
                <Tag className="h-4 w-4 mr-2" />
                Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense Category</DialogTitle>
                <DialogDescription>Create a new category to group your expenses.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input 
                    value={categoryForm.name} 
                    onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="e.g. Utilities, Stationery" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={categoryForm.description} 
                    onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                    placeholder="Optional description" 
                  />
                </div>
                <Button type="submit" className="w-full bg-rose-600" disabled={isCreatingCategory}>
                  {isCreatingCategory ? "Adding..." : "Add Category"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button onClick={() => handleOpenExpense()} className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-800 dark:text-rose-300">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">₹{(stats?.totalExpenses || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">This Month</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">₹{(stats?.thisMonthExpenses || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="py-3 px-6 border-b">
              <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="py-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
              {stats?.categoryWiseExpenses?.map((c: any) => (
                <div key={c.categoryId} className="flex flex-col items-center min-w-[100px] p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border">
                  <span className="text-xs text-muted-foreground truncate w-full text-center">{c.categoryName}</span>
                  <span className="text-sm font-bold">₹{c.amount.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters & Table */}
      <Card className="overflow-hidden border-rose-100 dark:border-rose-900/30 shadow-md">
        <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select 
              value={filters.categoryId || "all"} 
              onValueChange={v => setFilters({...filters, categoryId: v === 'all' ? null : v})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.status || "all"} 
              onValueChange={v => setFilters({...filters, status: v === 'all' ? null : v})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">Loading expenses...</TableCell></TableRow>
            ) : expenses.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-20 text-muted-foreground">No expenses recorded yet.</TableCell></TableRow>
            ) : (
              expenses.map((e: any) => (
                <TableRow key={e.id} className="hover:bg-rose-50/50 dark:hover:bg-rose-950/10">
                  <TableCell className="font-medium">{format(new Date(e.date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-rose-200 text-rose-700 bg-rose-50/50">
                      {e.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{e.description}</TableCell>
                  <TableCell className="capitalize text-xs text-muted-foreground">{e.paymentMethod}</TableCell>
                  <TableCell className="font-bold">₹{e.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={e.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}>
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenExpense(e)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteExpense(e.id)} className="text-rose-600 focus:text-rose-600">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Expense Modal */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={expenseForm.categoryId} onValueChange={v => setExpenseForm({...expenseForm, categoryId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker 
                  date={expenseForm.date ? new Date(expenseForm.date) : undefined}
                  onChange={(d) => setExpenseForm({...expenseForm, date: d ? d.toISOString().split('T')[0] : "" })}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={expenseForm.paymentMethod} onValueChange={v => setExpenseForm({...expenseForm, paymentMethod: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="e.g. Paid electricity bill for March" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reference No.</Label>
                <Input value={expenseForm.referenceNo} onChange={e => setExpenseForm({...expenseForm, referenceNo: e.target.value})} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={expenseForm.status} onValueChange={v => setExpenseForm({...expenseForm, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-rose-600" disabled={isCreatingExpense}>
                {isCreatingExpense ? "Saving..." : (editingExpense ? "Update Expense" : "Add Expense")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
