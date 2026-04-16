import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlQuery, graphqlMutate } from "@/lib/graphql/core";
import { CalendarEvent } from "./types";
import { goeyToast as toast } from "goey-toast";

const GET_EVENTS = `#graphql
  query GetEvents($tenantId: String, $month: String) {
    calendarEvents(tenantId: $tenantId, month: $month) {
      id title description date endDate type targetRole color allDay
    }
  }
`;

const CREATE_EVENT = `#graphql
  mutation CreateEvent($data: EventInput!) {
    createEvent(data: $data) { id }
  }
`;

const UPDATE_EVENT = `#graphql
  mutation UpdateEvent($id: ID!, $data: EventInput!) {
    updateEvent(id: $id, data: $data) { id }
  }
`;

const DELETE_EVENT = `#graphql
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export function useCalendarEvents(tenantId: string | null, monthKey: string) {
  return useQuery({
    queryKey: ["calendar-events", tenantId, monthKey],
    queryFn: async () => {
      const res = await graphqlQuery<{ calendarEvents: CalendarEvent[] }>(GET_EVENTS, { tenantId, month: monthKey });
      return res.calendarEvents || [];
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, 
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => graphqlMutate(CREATE_EVENT, { data }),
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
    mutationFn: ({ id, ...data }: any) => graphqlMutate(UPDATE_EVENT, { id, data }),
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
    mutationFn: ({ id }: { id: string }) => graphqlMutate(DELETE_EVENT, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.error("Event Deleted");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete event"),
  });
}
