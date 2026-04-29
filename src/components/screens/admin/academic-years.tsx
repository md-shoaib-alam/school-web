"use client";

import { useState } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  CalendarDays,
  ShieldCheck,
  AlertCircle
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAcademicYears } from "@/hooks/use-academic-years";
import { DatePicker } from "@/components/ui/date-picker";
import { goeyToast as toast } from "goey-toast";
import { format } from "date-fns";

export function AcademicYearsScreen() {
  const { 
    academicYears, 
    isLoading, 
    createAcademicYear, 
    updateAcademicYear, 
    deleteAcademicYear, 
    setCurrentAcademicYear,
    isCreating,
    isUpdating,
    isDeleting
  } = useAcademicYears();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "active",
    isCurrent: false
  });

  const handleOpenDialog = (year: any = null) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        name: year.name,
        startDate: year.startDate,
        endDate: year.endDate,
        status: year.status,
        isCurrent: year.isCurrent
      });
    } else {
      setEditingYear(null);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        status: "active",
        isCurrent: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingYear) {
        await updateAcademicYear({ id: editingYear.id, input: formData });
        toast.success("Academic year updated successfully");
      } else {
        await createAcademicYear(formData);
        toast.success("Academic year created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save academic year");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this academic year?")) {
      try {
        await deleteAcademicYear(id);
        toast.success("Academic year deleted");
      } catch (error) {
        toast.error("Failed to delete academic year");
      }
    }
  };

  const handleSetCurrent = async (id: string) => {
    try {
      await setCurrentAcademicYear(id);
      toast.success("Current academic year updated");
    } catch (error) {
      toast.error("Failed to set current academic year");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Academic Years
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage your school's academic sessions and current year settings.
              </p>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-indigo-100 dark:border-indigo-900/50">
            <DialogHeader>
              <DialogTitle>{editingYear ? "Edit Academic Year" : "New Academic Year"}</DialogTitle>
              <DialogDescription>
                Set the name and dates for the academic session.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Session Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. 2024-2025" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <DatePicker 
                    date={formData.startDate ? new Date(formData.startDate) : undefined}
                    onChange={(d) => setFormData({ ...formData, startDate: d ? d.toISOString().split('T')[0] : "" })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker 
                    date={formData.endDate ? new Date(formData.endDate) : undefined}
                    onChange={(d) => setFormData({ ...formData, endDate: d ? d.toISOString().split('T')[0] : "" })}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isCreating || isUpdating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isCreating || isUpdating ? "Saving..." : (editingYear ? "Update Year" : "Create Year")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats / Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Current Session</p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {academicYears.find((y: any) => y.isCurrent)?.name || "Not Set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Active Sessions</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {academicYears.filter((y: any) => y.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {academicYears.filter((y: any) => new Date(y.startDate) > new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/30 shadow-md">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
            <TableRow>
              <TableHead className="font-semibold">Session Name</TableHead>
              <TableHead className="font-semibold">Start Date</TableHead>
              <TableHead className="font-semibold">End Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Current</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Loading sessions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : academicYears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
                    <span className="text-lg font-medium text-muted-foreground">No academic years found</span>
                    <Button variant="outline" onClick={() => handleOpenDialog()} className="mt-2">
                      Create your first session
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              academicYears.map((year: any) => (
                <TableRow key={year.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-colors">
                  <TableCell className="font-medium">{year.name}</TableCell>
                  <TableCell>{format(new Date(year.startDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{format(new Date(year.endDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={year.status === "active" ? "default" : "secondary"} className={year.status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {year.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {year.isCurrent ? (
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Current</span>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSetCurrent(year.id)}
                        className="text-xs text-muted-foreground hover:text-indigo-600"
                      >
                        Set as Current
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenDialog(year)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetCurrent(year.id)} disabled={year.isCurrent}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Make Current
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(year.id)} className="text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
    </div>
  );
}
