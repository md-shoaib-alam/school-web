"use client";

import { useReducer, useEffect, useMemo, useState } from "react";
import { useViewMode } from "@/hooks/use-view-mode";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAppStore } from "@/store/use-app-store";
import {
  useParents,
  useClassesMin,
} from "@/lib/graphql/hooks/academic.hooks";
import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Sub-components
import { ParentsHeader } from "./parents/ParentsHeader";
import { ParentsTableView } from "./parents/ParentsTableView";
import { ParentsGridView } from "./parents/ParentsGridView";
import { ParentsEmptyState } from "./parents/ParentsEmptyState";
import { EditParentDialog } from "./parents/ParentDialog";
import { CreateParentDialog } from "./parents/CreateParentDialog";
import { LinkChildDialog } from "./parents/LinkChildDialog";
import { ParentSkeleton } from "./parents/ParentSkeleton";
import { ParentDetailDialog } from "./parents/ParentDetailDialog";
import { ParentInfo, StudentInfo } from "./parents/types";

type State = {
  search: string;
  currentPage: number;
  itemsPerPage: number;
  linkOpen: boolean;
  selectedParent: ParentInfo | null;
  selectedClass: string;
  linking: boolean;
  createOpen: boolean;
  createForm: {
    name: string; email: string; phone: string; occupation: string; password: ""; username?: string;
  };
  creating: boolean;
  editOpen: boolean;
  editingParent: ParentInfo | null;
  editForm: {
    name: string; email: string; phone: string; occupation: string;
  };
  editing: boolean;
  detailOpen: boolean;
  selectedParentDetail: ParentInfo | null;
};

type Action =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_ITEMS_PER_PAGE'; payload: number }
  | { type: 'SET_LINK_OPEN'; payload: boolean }
  | { type: 'OPEN_LINK_DIALOG'; payload: ParentInfo }
  | { type: 'SET_SELECTED_CLASS'; payload: string }
  | { type: 'SET_LINKING'; payload: boolean }
  | { type: 'SET_CREATE_OPEN'; payload: boolean }
  | { type: 'SET_CREATE_FORM'; payload: Partial<State['createForm']> }
  | { type: 'RESET_CREATE_FORM' }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'OPEN_EDIT_DIALOG'; payload: ParentInfo }
  | { type: 'SET_EDIT_OPEN'; payload: boolean }
  | { type: 'SET_EDIT_FORM'; payload: Partial<State['editForm']> }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_DETAIL_OPEN'; payload: boolean }
  | { type: 'OPEN_DETAIL_DIALOG'; payload: ParentInfo };

const initialState: State = {
  search: "",
  currentPage: 1,
  itemsPerPage: 15,
  linkOpen: false,
  selectedParent: null,
  selectedClass: "all",
  linking: false,
  createOpen: false,
  createForm: {
    name: "", email: "", phone: "", occupation: "", password: "", username: "",
  },
  creating: false,
  editOpen: false,
  editingParent: null,
  editForm: {
    name: "", email: "", phone: "", occupation: "",
  },
  editing: false,
  detailOpen: false,
  selectedParentDetail: null,
};

const actionHandlers: {
  [K in Action['type']]: (state: State, payload: any) => State;
} = {
  SET_SEARCH: (state, payload) => ({ ...state, search: payload, currentPage: 1 }),
  SET_CURRENT_PAGE: (state, payload) => ({ ...state, currentPage: payload }),
  SET_ITEMS_PER_PAGE: (state, payload) => ({ ...state, itemsPerPage: payload, currentPage: 1 }),
  SET_LINK_OPEN: (state, payload) => ({ ...state, linkOpen: payload }),
  OPEN_LINK_DIALOG: (state, payload) => ({ ...state, selectedParent: payload, linkOpen: true, selectedClass: "all" }),
  SET_SELECTED_CLASS: (state, payload) => ({ ...state, selectedClass: payload }),
  SET_LINKING: (state, payload) => ({ ...state, linking: payload }),
  SET_CREATE_OPEN: (state, payload) => ({ ...state, createOpen: payload }),
  SET_CREATE_FORM: (state, payload) => ({ ...state, createForm: { ...state.createForm, ...payload } }),
  RESET_CREATE_FORM: (state) => ({ ...state, createForm: initialState.createForm, createOpen: false }),
  SET_CREATING: (state, payload) => ({ ...state, creating: payload }),
  OPEN_EDIT_DIALOG: (state, payload) => ({
    ...state,
    editingParent: payload,
    editForm: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
      occupation: payload.occupation || ""
    },
    editOpen: true
  }),
  SET_EDIT_OPEN: (state, payload) => ({ ...state, editOpen: payload }),
  SET_EDIT_FORM: (state, payload) => ({ ...state, editForm: { ...state.editForm, ...payload } }),
  SET_EDITING: (state, payload) => ({ ...state, editing: payload }),
  SET_DETAIL_OPEN: (state, payload) => ({ ...state, detailOpen: payload }),
  OPEN_DETAIL_DIALOG: (state, payload) => ({ ...state, selectedParentDetail: payload, detailOpen: true }),
};

function reducer(state: State, action: Action): State {
  const handler = actionHandlers[action.type];
  return handler ? handler(state, (action as any).payload) : state;
}

function validateEditForm(
  editingParent: ParentInfo | null,
  editForm: { name: string; email: string; phone: string; occupation: string }
): boolean {
  if (!editingParent) {
    return false;
  }
  if (!editForm.name) {
    toast.error("Name and phone number are required");
    return false;
  }
  if (!editForm.phone) {
    toast.error("Name and phone number are required");
    return false;
  }
  if (editForm.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
  }
  return true;
}

export function AdminParents() {
  const { currentTenantId } = useAppStore();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useViewMode("parents", "grid");

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    search, currentPage, itemsPerPage, linkOpen, selectedParent: stateSelectedParent, selectedClass,
    linking, createOpen, createForm, creating, editOpen,
    editingParent, editForm, editing, detailOpen, selectedParentDetail: stateSelectedParentDetail
  } = state;

  const debouncedSearch = useDebounce(search, 500);

  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  const [unlinkData, setUnlinkData] = useState<{ parentId: string; studentId: string } | null>(null);

  // Queries
  const { 
    data: parentsData, 
    isLoading: loadingParents 
  } = useParents(currentTenantId || undefined, debouncedSearch || undefined, currentPage, itemsPerPage);

  const { data: classesData } = useClassesMin(currentTenantId || undefined);

  // Students for linking (filtered by class if selected) - Using optimized min-data REST API
  const [studentSearch, setStudentSearch] = useState("");
  const debouncedStudentSearch = useDebounce(studentSearch, 500);
  const [unlinkedOnly, setUnlinkedOnly] = useState(true);

  const { 
    data: studentData, 
    isLoading: loadingStudents,
    isFetchingNextPage: fetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ['students-min-infinite', selectedClass, debouncedStudentSearch, unlinkedOnly],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const params: any = { mode: 'min', limit: 50, page: pageParam, unlinkedOnly: unlinkedOnly ? 'true' : 'false' };
        if (selectedClass && selectedClass !== 'all') params.classId = selectedClass;
        if (debouncedStudentSearch) params.search = debouncedStudentSearch;
        const res = await api.get('/students', { params });
        const data = res as any;
        return (data?.items ? data : { items: [], hasMore: false, page: 1 }) as { items: StudentInfo[]; hasMore: boolean; page: number };
      } catch (err) {
        console.error("Failed to fetch students for linking:", err);
        return { items: [], hasMore: false, page: 1 } as { items: StudentInfo[]; hasMore: boolean; page: number };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.hasMore) return undefined;
      const nextPage = lastPage.page ? lastPage.page + 1 : (allPages?.length ? allPages.length + 1 : 2);
      return isNaN(nextPage) ? undefined : nextPage;
    },
    enabled: linkOpen && !!currentTenantId,
    staleTime: 5000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });


  const { parents: rawParents = [], total: totalItems = 0, totalPages = 1 } = parentsData || {};

  const parents = useMemo(() => {
    return [...rawParents].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [rawParents]);

  // Derive selected parent dynamically from the latest parents list to keep modal synchronised reactively
  const selectedParent = useMemo(() => {
    if (!stateSelectedParent) return null;
    return parents.find((p) => p.id === stateSelectedParent.id) || stateSelectedParent;
  }, [parents, stateSelectedParent]);

  const selectedParentDetail = useMemo(() => {
    if (!stateSelectedParentDetail) return null;
    return parents.find((p) => p.id === stateSelectedParentDetail.id) || stateSelectedParentDetail;
  }, [parents, stateSelectedParentDetail]);

  const students = useMemo(() => {
    return studentData?.pages.flatMap((page) => page?.items || []) || [];
  }, [studentData]);
  const classes = classesData?.classes || [];

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) => !selectedParent?.children?.some((c) => c.id === s.id)
    );
  }, [students, selectedParent]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.phone) { toast.error("Name and phone number are required"); return; }
    if (createForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(createForm.email)) { toast.error("Please enter a valid email address"); return; }
    }
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_CREATING', payload: true });
        try {
          const res = await api.post("/parents", { action: "create", ...createForm });
          const resData = res.data || {};
          dispatch({ type: 'RESET_CREATE_FORM' });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          if (resData.username) {
            return `Parent account created! Parent ID: ${resData.username}`;
          }
          return "Parent account created";
        } finally { dispatch({ type: 'SET_CREATING', payload: false }); }
      })(),
      { loading: "Creating parent account...", success: (msg) => msg, error: (err: any) => err.message, },
    );
  };

  const handleLinkChild = async (studentId: string) => {
    if (!selectedParent) return;
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_LINKING', payload: true });
        try {
          await api.post("/parents", { action: "link", parentId: selectedParent.id, studentId, });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          queryClient.invalidateQueries({ queryKey: ['students-min-infinite'] });
          return "Student linked successfully";
        } finally { dispatch({ type: 'SET_LINKING', payload: false }); }
      })(),
      { loading: "Linking child to parent...", success: (msg: any) => msg, error: (err: any) => err.message, },
    );
  };

  const handleUnlinkChild = (parentId: string, studentId: string) => {
    setUnlinkData({ parentId, studentId });
    setUnlinkConfirmOpen(true);
  };

  const executeUnlinkChild = async () => {
    if (!unlinkData) return;
    const { parentId, studentId } = unlinkData;
    setUnlinkConfirmOpen(false);
    setUnlinkData(null);
    toast.promise(
      (async () => {
        await api.post("/parents", { action: "unlink", parentId, studentId, });
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });
        queryClient.invalidateQueries({ queryKey: ['students-min-infinite'] });
        return "Child record unlinked";
      })(),
      { loading: "Unlinking child...", success: (msg) => msg, error: (err: any) => err.message, },
    );
  };

  const handleEditSave = async () => {
    if (!validateEditForm(editingParent, editForm)) {
      return;
    }
    const parent = editingParent!;
    const updatedParent = { ...parent, ...editForm };
    queryClient.setQueriesData({ queryKey: queryKeys.parents }, (old: any) => {
      if (!old || !old.parents) return old;
      return { ...old, parents: old.parents.map((p: any) => p.id === parent.id ? updatedParent : p) };
    });
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_EDITING', payload: true });
        try {
          await api.put("/parents", { id: parent.id, ...editForm });
          dispatch({ type: 'SET_EDIT_OPEN', payload: false });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent details updated";
        } finally { dispatch({ type: 'SET_EDITING', payload: false }); }
      })(),
      { loading: "Saving changes...", success: (msg) => msg, error: (err: any) => err.message, },
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        await api.delete(`/parents?id=${id}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });
        return "Parent record removed";
      })(),
      { loading: "Removing parent record...", success: (msg) => msg, error: (err: any) => err.message, },
    );
  };
  
  // Show skeleton during initial load OR when fetching new page data
  if (loadingParents) return <ParentSkeleton />;

  return (
    <div className="space-y-6">
      <ParentsHeader 
        search={search}
        onSearchChange={(v) => dispatch({ type: 'SET_SEARCH', payload: v })}
        totalParents={parents.length}
        totalChildren={parents.reduce((s, p) => s + (p.children?.length || 0), 0)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddClick={() => dispatch({ type: 'SET_CREATE_OPEN', payload: true })}
      />

      {parents.length === 0 ? (
        <ParentsEmptyState />
      ) : viewMode === "table" ? (
        <ParentsTableView 
          parents={parents}
          onEdit={(p) => dispatch({ type: 'OPEN_EDIT_DIALOG', payload: p })}
          onDelete={handleDelete}
          onLinkOpen={(p) => dispatch({ type: 'OPEN_LINK_DIALOG', payload: p })}
          onView={(p) => dispatch({ type: 'OPEN_DETAIL_DIALOG', payload: p })}
        />
      ) : (
        <ParentsGridView 
          parents={parents}
          linking={linking}
          onEdit={(p) => dispatch({ type: 'OPEN_EDIT_DIALOG', payload: p })}
          onDelete={handleDelete}
          onLinkOpen={(p) => dispatch({ type: 'OPEN_LINK_DIALOG', payload: p })}
          onUnlinkChild={handleUnlinkChild}
          onView={(p) => dispatch({ type: 'OPEN_DETAIL_DIALOG', payload: p })}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={(v) => dispatch({ type: 'SET_CURRENT_PAGE', payload: v })}
        onLimitChange={(limit) => dispatch({ type: 'SET_ITEMS_PER_PAGE', payload: limit })}
      />

      <CreateParentDialog
        open={createOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_CREATE_OPEN', payload: v })}
        createForm={createForm}
        setCreateForm={(v) => dispatch({ type: 'SET_CREATE_FORM', payload: v })}
        onCreate={handleCreate}
        creating={creating}
      />

      <EditParentDialog
        open={editOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_EDIT_OPEN', payload: v })}
        editForm={editForm}
        setEditForm={(v) => dispatch({ type: 'SET_EDIT_FORM', payload: v })}
        onSave={handleEditSave}
        editing={editing}
      />

      <LinkChildDialog
        open={linkOpen}
        onOpenChange={(v) => {
          dispatch({ type: 'SET_LINK_OPEN', payload: v });
          if (!v) {
            setStudentSearch("");
            setUnlinkedOnly(true);
          }
        }}
        selectedParent={selectedParent}
        selectedClass={selectedClass}
        setSelectedClass={(v) => dispatch({ type: 'SET_SELECTED_CLASS', payload: v })}
        classes={classes}
        filteredStudents={filteredStudents}
        linking={linking}
        loading={loadingStudents}
        onLinkChild={handleLinkChild}
        onUnlinkChild={handleUnlinkChild}
        searchQuery={studentSearch}
        onSearchQueryChange={setStudentSearch}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={fetchingNextPage}
        unlinkedOnly={unlinkedOnly}
        onUnlinkedOnlyChange={setUnlinkedOnly}
      />

      <ParentDetailDialog
        open={detailOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_DETAIL_OPEN', payload: v })}
        parent={selectedParentDetail}
        onLinkClick={(p) => dispatch({ type: 'OPEN_LINK_DIALOG', payload: p })}
      />

      <AlertDialog open={unlinkConfirmOpen} onOpenChange={setUnlinkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this student from their parent?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setUnlinkConfirmOpen(false); setUnlinkData(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeUnlinkChild}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
