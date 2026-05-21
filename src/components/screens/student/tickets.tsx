"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Ticket,
  Plus,
  Eye,
  Send,
  MessageSquare,
  Loader2,
  Tag,
  Clock,
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
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
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
export function StudentTickets() {
  const { currentUser, currentTenantId } = useAppStore();
  const currentUserId = currentUser?.id;

  // Data states
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ── Fetch my tickets ──
  const fetchTickets = useCallback(async () => {
    if (!currentTenantId || !currentUserId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tenantId: currentTenantId,
        createdBy: currentUserId,
      });
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
  }, [currentTenantId, currentUserId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ── Quick stats ──
  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress",
  ).length;

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
        toast.success("Ticket submitted successfully");
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
        setSelectedTicket(await res.json());
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              My Tickets
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
              {openCount > 0 ? ` - ${openCount} active` : ""}
            </p>
          </div>
          {openCount > 0 && (
            <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800 gap-1">
              <Clock className="size-3" />
              {openCount} Active
            </Badge>
          )}
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
          onClick={() => {
            setCreateForm({ ...emptyCreateForm });
            setCreateOpen(true);
          }}
        >
          <Plus className="size-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <Ticket className="size-12 mx-auto text-zinc-200 mb-3" />
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No tickets yet
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Submit a ticket if you need help from the school
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-zinc-100 dark:border-zinc-800"
              onClick={() => openTicketDetail(ticket.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                        {ticket.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${STATUS_COLORS[ticket.status] || ""}`}
                      >
                        {STATUS_LABELS[ticket.status]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}
                      >
                        {PRIORITY_LABELS[ticket.priority]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      >
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-3" />
                          {ticket._count.messages} message
                          {ticket._count.messages !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="size-3" />
                          {getCategoryLabel(ticket.category)}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-violet-500 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTicketDetail(ticket.id);
                    }}
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit New Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and our team will assist you
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
                placeholder="Brief summary of your issue"
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
                placeholder="Please describe your issue or question in detail..."
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
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleCreate}
              disabled={
                creating ||
                !createForm.title.trim() ||
                !createForm.description.trim()
              }
            >
              {creating ? "Submitting..." : "Submit Ticket"}
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
              <Loader2 className="size-8 animate-spin text-violet-500" />
            </div>
          ) : selectedTicket ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Ticket Info (read-only for students) */}
              <div className="p-4 space-y-3 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedTicket.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
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
                    className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {getCategoryLabel(selectedTicket.category)}
                  </Badge>
                </div>

                {selectedTicket.assignee && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Assigned to:
                    </span>
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[9px] bg-violet-100 text-violet-700">
                        {getInitials(selectedTicket.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {selectedTicket.assignee.name}
                    </span>
                  </div>
                )}

                <Separator />
              </div>

              {/* Conversation Thread */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <div className="px-4 py-2 border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Conversation ({selectedTicket.messages?.length || 0}{" "}
                    messages)
                  </span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {(!selectedTicket.messages ||
                      selectedTicket.messages.length === 0) && (
                      <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                        <MessageSquare className="size-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">
                          Our team will review your ticket soon
                        </p>
                      </div>
                    )}
                    {selectedTicket.messages?.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="size-8 shrink-0 mt-0.5">
                          <AvatarFallback
                            className={`text-[10px] ${
                              ROLE_COLORS[msg.author?.role || "student"] ||
                              "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {msg.author ? getInitials(msg.author.name) : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
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
                            {msg.author?.id === currentUser?.id && (
                              <span className="text-[9px] text-violet-500 font-medium">
                                (You)
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              {formatDateTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply Input */}
                {selectedTicket.status !== "closed" && (
                  <div className="p-4 border-t bg-white dark:bg-zinc-900">
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
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        Press Ctrl+Enter to send
                      </span>
                      <Button
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={handleReply}
                        disabled={sendingReply || !replyMessage.trim()}
                      >
                        {sendingReply ? (
                          <Loader2 className="size-3.5 mr-1 animate-spin" />
                        ) : (
                          <Send className="size-3.5 mr-1" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === "closed" && (
                  <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
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
