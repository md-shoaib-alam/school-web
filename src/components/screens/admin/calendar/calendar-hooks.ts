import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CalendarEvent } from "./types";
import { goeyToast as toast } from "goey-toast";

export function useCalendarEvents(tenantId: string | null, monthKey: string) {
  return useQuery({
    queryKey: ["calendar-events", tenantId, monthKey],
    queryFn: async () => {
      const res = await api.get<{ data: CalendarEvent[] }>(`/events?tenantId=${encodeURIComponent(tenantId!)}&month=${monthKey}`);
      return res.data || [];
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.post("/events", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event Created");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create event"),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => api.put("/events", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.info("Event Updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update event"),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tenantId }: { id: string; tenantId: string }) => api.del(`/events?id=${id}&tenantId=${tenantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.error("Event Deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete event"),
  });
}
