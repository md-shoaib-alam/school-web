"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Plus,
  Search,
  Eye,
  Send,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CircleDot,
  UserCircle,
  Tag,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";

// ── Constants ──
const TICKET_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical" },
  { value: "academics", label: "Academics" },
  { value: "feature_request", label: "Feature Request" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

const TICKET_STATUSES = [
  "open",
  "in_progress",
  "on_hold",
  "resolved",
  "closed",
] as const;
const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  on_hold: "On Hold",
  resolved: "Resolved",
  closed: "Closed",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  in_progress:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  on_hold:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  resolved:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  closed:
    "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  medium:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  high: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  urgent:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
};

const ROLE_COLORS: Record<string, string> = {
  admin:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  teacher: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  student:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  parent:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  staff: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  super_admin: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

// ── Types ──
interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
  } | null;
}

interface TicketItem {
  id: string;
  tenantId: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
  } | null;
  assignee: {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
  } | null;
  _count: {
    messages: number;
  };
}

interface TicketDetail extends Omit<TicketItem, "_count"> {
  messages: TicketMessage[];
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CreateFormData {
  title: string;
  description: string;
  priority: string;
  category: string;
}

const emptyCreateForm: CreateFormData = {
  title: "",
  description: "",
  priority: "medium",
  category: "general",
};

// ── Helpers ──
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getCategoryLabel(value: string): string {
  return TICKET_CATEGORIES.find((c) => c.value === value)?.label || value;
}

// ── Component ──
export function AdminTickets() {
  const { currentUser, currentTenantId } = useAppStore();

  // Data states
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>({
    ...emptyCreateForm,
  });
  const [creating, setCreating] = useState(false);

  // Detail sheet
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // Reply
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Admin edit (in detail sheet)
  const [editStatus, setEditStatus] = useState<string>("");
  const [editPriority, setEditPriority] = useState<string>("");
  const [editAssignee, setEditAssignee] = useState<string>("unassigned");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // ── Fetch tickets ──
  const fetchTickets = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      const params = new URLSearchParams({ tenantId: currentTenantId });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const res = await apiFetch(`/api/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId, statusFilter, priorityFilter, categoryFilter]);

  // ── Fetch staff ──
  const fetchStaff = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      const res = await apiFetch(`/api/staff?tenantId=${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(Array.isArray(data) ? data : []);
      }
    } catch {
      // Staff fetch is non-critical
    }
  }, [currentTenantId]);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
    fetchStaff();
  }, [fetchTickets, fetchStaff]);

  // ── Search filter (client-side) ──
  const filteredTickets = tickets.filter((t) => {
    if (searchQuery) {
      return t.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // ── Stats ──
  const stats = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  // ── Create ticket ──
  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (!currentUser) return;
    setCreating(true);
    try {
      const res = await apiFetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: currentTenantId,
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          priority: createForm.priority,
          category: createForm.category,
          createdBy: currentUser.id,
        }),
      });
      if (res.ok) {
        toast.success("Ticket created successfully");
        setCreateOpen(false);
        setCreateForm({ ...emptyCreateForm });
        await fetchTickets();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create ticket");
      }
    } catch {
      toast.error("Error creating ticket");
    } finally {
      setCreating(false);
    }
  };

  // ── Open ticket detail ──
  const openTicketDetail = async (ticketId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setReplyMessage("");
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
        setEditStatus(data.status);
        setEditPriority(data.priority);
        setEditAssignee(data.assignedTo || "unassigned");
      } else {
        toast.error("Failed to load ticket details");
        setDetailOpen(false);
      }
    } catch {
      toast.error("Error loading ticket");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Send reply ──
  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket || !currentUser) return;
    setSendingReply(true);
    try {
      const res = await apiFetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          message: replyMessage.trim(),
        }),
      });
      if (res.ok) {
        setReplyMessage("");
        // Refresh detail
        const detailRes = await apiFetch(`/api/tickets/${selectedTicket.id}`);
        if (detailRes.ok) {
          setSelectedTicket(await detailRes.json());
        }
        fetchTickets();
        toast.success("Reply sent");
      } else {
        toast.error("Failed to send reply");
      }
    } catch {
      toast.error("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  // ── Update ticket (admin) ──
  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (editStatus !== selectedTicket.status) updateData.status = editStatus;
      if (editPriority !== selectedTicket.priority)
        updateData.priority = editPriority;
      const assigneeVal = editAssignee === "unassigned" ? null : editAssignee;
      if (assigneeVal !== selectedTicket.assignedTo)
        updateData.assignedTo = assigneeVal;

      if (Object.keys(updateData).length === 0) {
        setUpdatingTicket(false);
        return;
      }

      const res = await apiFetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        toast.success("Ticket updated");
        // Refresh detail
        const detailRes = await apiFetch(`/api/tickets/${selectedTicket.id}`);
        if (detailRes.ok) {
          const data = await detailRes.json();
          setSelectedTicket(data);
          setEditStatus(data.status);
          setEditPriority(data.priority);
          setEditAssignee(data.assignedTo || "unassigned");
        }
        fetchTickets();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update ticket");
      }
    } catch {
      toast.error("Error updating ticket");
    } finally {
      setUpdatingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Support Tickets
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
              {tickets.length} total tickets
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
          >
            {tickets.length}
          </Badge>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          onClick={() => {
            setCreateForm({ ...emptyCreateForm });
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Open
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.open}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.in_progress}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.resolved}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Closed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stats.closed}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TICKET_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ticket Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tickets found</p>
              <p className="text-sm mt-1">Create a new ticket to get started</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-28">Priority</TableHead>
                      <TableHead className="w-32">Category</TableHead>
                      <TableHead className="w-44">Created By</TableHead>
                      <TableHead className="w-36">Assignee</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead className="w-24 text-center">
                        Messages
                      </TableHead>
                      <TableHead className="w-28">Created</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono"
                          >
                            {ticket.id.slice(-6).toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate block max-w-[200px]">
                            {ticket.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium}`}
                          >
                            {PRIORITY_LABELS[ticket.priority] ||
                              ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getCategoryLabel(ticket.category)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                {ticket.creator
                                  ? getInitials(ticket.creator.name)
                                  : "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {ticket.creator?.name || "Unknown"}
                              </p>
                              {ticket.creator?.role && (
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1.5 py-0 ${ROLE_COLORS[ticket.creator.role] || ""}`}
                                >
                                  {ticket.creator.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                  {getInitials(ticket.assignee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {ticket.assignee.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${STATUS_COLORS[ticket.status] || ""}`}
                          >
                            {STATUS_LABELS[ticket.status] || ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {ticket._count.messages}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            onClick={() => openTicketDetail(ticket.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 space-y-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
                    onClick={() => openTicketDetail(ticket.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {ticket.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}
                          >
                            {PRIORITY_LABELS[ticket.priority]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${STATUS_COLORS[ticket.status] || ""}`}
                          >
                            {STATUS_LABELS[ticket.status]}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <UserCircle className="h-3 w-3" />
                          {ticket.creator?.name || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {getCategoryLabel(ticket.category)}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {ticket._count.messages}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Count */}
              <div className="p-3 border-t text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Submit a new support ticket for the school management team
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
                placeholder="Brief summary of the issue"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={createForm.priority}
                  onValueChange={(v) =>
                    setCreateForm({ ...createForm, priority: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={createForm.category}
                  onValueChange={(v) =>
                    setCreateForm({ ...createForm, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCreate}
              disabled={
                creating ||
                !createForm.title.trim() ||
                !createForm.description.trim()
              }
            >
              {creating ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle>Ticket Details</SheetTitle>
            <SheetDescription>
              {selectedTicket
                ? `#${selectedTicket.id.slice(-6).toUpperCase()} - ${formatDate(selectedTicket.createdAt)}`
                : ""}
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : selectedTicket ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Ticket Info */}
              <div className="p-4 space-y-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedTicket.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${STATUS_COLORS[selectedTicket.status] || ""}`}
                  >
                    {STATUS_LABELS[selectedTicket.status]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${PRIORITY_COLORS[selectedTicket.priority] || ""}`}
                  >
                    {PRIORITY_LABELS[selectedTicket.priority]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500"
                  >
                    {getCategoryLabel(selectedTicket.category)}
                  </Badge>
                </div>

                {/* Admin Edit Controls */}
                <Separator />
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Admin Controls
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TICKET_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Priority</Label>
                      <Select
                        value={editPriority}
                        onValueChange={setEditPriority}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Assignee</Label>
                      <Select
                        value={editAssignee}
                        onValueChange={setEditAssignee}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {staffList.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleUpdateTicket}
                    disabled={updatingTicket}
                  >
                    {updatingTicket ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="px-4 py-2 border-b bg-gray-50/50 dark:bg-gray-900/50">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    Conversation ({selectedTicket.messages?.length || 0}{" "}
                    messages)
                  </span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {(!selectedTicket.messages ||
                      selectedTicket.messages.length === 0) && (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">
                          Start the conversation with a reply
                        </p>
                      </div>
                    )}
                    {selectedTicket.messages?.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                          <AvatarFallback
                            className={`text-[10px] ${
                              ROLE_COLORS[msg.author?.role || "student"] ||
                              "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {msg.author ? getInitials(msg.author.name) : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {msg.author?.name || "Unknown"}
                            </span>
                            {msg.author?.role && (
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 ${
                                  ROLE_COLORS[msg.author.role] || ""
                                }`}
                              >
                                {msg.author.role}
                              </Badge>
                            )}
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                              {formatDateTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply Input */}
                {selectedTicket.status !== "closed" && (
                  <div className="p-4 border-t bg-white dark:bg-gray-900">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="min-h-[60px] max-h-[120px] resize-none text-sm"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            handleReply();
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        Press Ctrl+Enter to send
                      </span>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleReply}
                        disabled={sendingReply || !replyMessage.trim()}
                      >
                        {sendingReply ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5 mr-1" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === "closed" && (
                  <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">
                      This ticket is closed. No further replies can be sent.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
