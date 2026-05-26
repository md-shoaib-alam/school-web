"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { TicketHeader } from "./tickets/ticket-header";
import { TicketSkeleton } from "./tickets/ticket-skeleton";
import { TicketList } from "./tickets/ticket-list";
import { CreateTicketDialog } from "./tickets/create-ticket-dialog";
import { TicketDetailSheet } from "./tickets/ticket-detail-sheet";

// Types
import { TicketItem, TicketDetail, CreateFormData } from "./tickets/types";

export function StudentTickets() {
  const { currentUser, currentTenantId } = useAppStore();
  const currentUserId = currentUser?.id;

  // Data states
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog & Sheet States
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
  const handleCreateSubmit = async (form: CreateFormData) => {
    if (!currentUser) return;
    try {
      const res = await apiFetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: currentTenantId,
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
          category: form.category,
          createdBy: currentUser.id,
        }),
      });
      if (res.ok) {
        toast.success("Ticket submitted successfully");
        setCreateOpen(false);
        await fetchTickets();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create ticket");
      }
    } catch {
      toast.error("Error creating ticket");
    }
  };

  // ── Open ticket detail ──
  const openTicketDetail = async (ticketId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
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
  const handleSendReply = async (message: string) => {
    if (!selectedTicket || !currentUser) return;
    try {
      const res = await apiFetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          message: message,
        }),
      });
      if (res.ok) {
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <TicketHeader
        totalCount={tickets.length}
        openCount={openCount}
        onNewClick={() => setCreateOpen(true)}
      />

      {/* Ticket List / Loading */}
      {loading ? (
        <TicketSkeleton />
      ) : (
        <TicketList tickets={tickets} onOpenDetail={openTicketDetail} />
      )}

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
      />

      {/* Ticket Detail Sheet */}
      <TicketDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        ticket={selectedTicket}
        loading={detailLoading}
        currentUserId={currentUserId}
        onSendReply={handleSendReply}
      />
    </div>
  );
}
