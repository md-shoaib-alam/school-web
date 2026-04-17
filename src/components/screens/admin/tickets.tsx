"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { TicketStats } from "./tickets/TicketStats";
import { TicketFilters } from "./tickets/TicketFilters";
import { TicketTable } from "./tickets/TicketTable";
import { CreateTicketDialog } from "./tickets/CreateTicketDialog";
import { TicketDetailSheet } from "./tickets/TicketDetailSheet";

// Types & Helpers
import type { 
  TicketItem, 
  TicketDetail, 
  StaffMember, 
  CreateFormData 
} from "./tickets/types";

const emptyCreateForm: CreateFormData = {
  title: "",
  description: "",
  priority: "medium",
  category: "general",
};

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
  const [createForm, setCreateForm] = useState<CreateFormData>({ ...emptyCreateForm });
  const [creating, setCreating] = useState(false);

  // Detail sheet
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reply
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Admin edit
  const [editStatus, setEditStatus] = useState<string>("");
  const [editPriority, setEditPriority] = useState<string>("");
  const [editAssignee, setEditAssignee] = useState<string>("unassigned");
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // ── Fetching ──

  const fetchTickets = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      const params = new URLSearchParams({ tenantId: currentTenantId });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const res = await apiFetch(`/api/tickets?${params.toString()}`);
      if (res.ok) setTickets(await res.json());
    } catch {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId, statusFilter, priorityFilter, categoryFilter]);

  const fetchStaff = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      const res = await apiFetch(`/api/staff?tenantId=${currentTenantId}`);
      if (res.ok) setStaffList(await res.json());
    } catch {}
  }, [currentTenantId]);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
    fetchStaff();
  }, [fetchTickets, fetchStaff]);

  // ── Handlers ──

  const handleCreate = async () => {
    if (!currentUser) return;
    setCreating(true);
    try {
      const res = await apiFetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: currentTenantId,
          ...createForm,
          createdBy: currentUser.id,
        }),
      });
      if (res.ok) {
        toast.success("Ticket created");
        setCreateOpen(false);
        setCreateForm({ ...emptyCreateForm });
        fetchTickets();
      } else {
        toast.error("Failed to create ticket");
      }
    } catch {
      toast.error("Error creating ticket");
    } finally {
      setCreating(false);
    }
  };

  const openTicketDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setReplyMessage("");
    try {
      const res = await apiFetch(`/api/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data);
        setEditStatus(data.status);
        setEditPriority(data.priority);
        setEditAssignee(data.assignedTo || "unassigned");
      }
    } catch {
      toast.error("Error loading ticket");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket || !currentUser) return;
    setSendingReply(true);
    try {
      const res = await apiFetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, message: replyMessage.trim() }),
      });
      if (res.ok) {
        setReplyMessage("");
        const detailRes = await apiFetch(`/api/tickets/${selectedTicket.id}`);
        if (detailRes.ok) setSelectedTicket(await detailRes.json());
        fetchTickets();
        toast.success("Reply sent");
      }
    } catch {
      toast.error("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setUpdatingTicket(true);
    try {
      const res = await apiFetch(`/api/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          assignedTo: editAssignee === "unassigned" ? null : editAssignee,
        }),
      });
      if (res.ok) {
        toast.success("Ticket updated");
        openTicketDetail(selectedTicket.id);
        fetchTickets();
      }
    } catch {
      toast.error("Error updating ticket");
    } finally {
      setUpdatingTicket(false);
    }
  };

  // ── Derived ──

  const filteredTickets = tickets.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    open: tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    closed: tickets.filter(t => t.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">{tickets.length} total tickets</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New Ticket
        </Button>
      </div>

      <TicketStats stats={stats} />

      <TicketFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <Card>
        <CardContent className="p-0">
          <TicketTable
            tickets={filteredTickets}
            loading={loading}
            onOpenDetail={openTicketDetail}
          />
        </CardContent>
      </Card>

      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={createForm}
        setForm={setCreateForm}
        loading={creating}
        onSubmit={handleCreate}
      />

      <TicketDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        ticket={selectedTicket}
        loading={detailLoading}
        staffList={staffList}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editPriority={editPriority}
        setEditPriority={setEditPriority}
        editAssignee={editAssignee}
        setEditAssignee={setEditAssignee}
        updatingTicket={updatingTicket}
        onUpdateTicket={handleUpdateTicket}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        sendingReply={sendingReply}
        onReply={handleReply}
      />
    </div>
  );
}
