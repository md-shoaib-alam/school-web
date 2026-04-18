"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, UserPlus } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import api from "@/lib/axios";
import { useAppStore } from "@/store/use-app-store";
import {
  useParents,
  useStudents,
  useClassesMin,
} from "@/lib/graphql/hooks/academic.hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";

import { ParentCard } from "./parents/ParentCard";
import {
  CreateParentDialog,
  EditParentDialog,
  LinkChildDialog,
} from "./parents/ParentDialog";
import { ParentSkeleton } from "./parents/ParentSkeleton";
import { ParentInfo, StudentInfo } from "./parents/types";

export function AdminParents() {
  const { currentTenantId } = useAppStore();
  const queryClient = useQueryClient();

  // Filter & Search states
  const [search, setSearch] = useState("");

  // Queries
  const { 
    data: parentsData, 
    isLoading: loadingParents 
  } = useParents(currentTenantId || undefined, search || undefined);

  const { data: classesData } = useClassesMin(currentTenantId || undefined);

  // Link child dialog states
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentInfo | null>(null);
  const [selectedClass, setSelectedClass] = useState("all");
  const [linking, setLinking] = useState(false);

  // Students for linking (filtered by class if selected) - Using optimized min-data REST API
  const { data: studentData, isLoading: loadingStudents } = useQuery<{ items: StudentInfo[] }>({
    queryKey: ['students-min', selectedClass],
    queryFn: () => {
      const params: any = { mode: 'min', limit: '1000' };
      if (selectedClass && selectedClass !== 'all') params.classId = selectedClass;
      return api.get('/students', { params }) as any;
    }
  });


  const parents = parentsData?.parents || [];
  const students = studentData?.items || [];
  const classes = classesData?.classes || [];
  const loading = loadingParents;

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    password: "", 
  });
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentInfo | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
  });
  const [editing, setEditing] = useState(false);


  const filtered = parents; // GraphQL handle search now? Wait, no, let's keep frontend search for now if needed, or use useParents search
  // Actually, I'll use the search prop in useParents above.

  const filteredStudents = students.filter(
    (s) => !selectedParent?.children.some((c) => c.id === s.id)
  );

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email) {
      toast.error("Name and email are required");
      return;
    }
    toast.promise(
      (async () => {
        setCreating(true);
        try {
          await api.post("/parents", { action: "create", ...createForm });
          setCreateOpen(false);
          setCreateForm({
            name: "", email: "", phone: "", occupation: "", password: "",
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent account created";
        } finally {
          setCreating(false);
        }
      })(),
      {
        loading: "Creating parent account...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleLinkChild = async (studentId: string) => {
    if (!selectedParent) return;
    toast.promise(
      (async () => {
        setLinking(true);
        try {
          await api.post("/parents", {
            action: "link",
            parentId: selectedParent.id,
            studentId,
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Student linked successfully";
        } finally {
          setLinking(false);
        }
      })(),
      {
        loading: "Linking child to parent...",
        success: (msg: any) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleUnlinkChild = async (parentId: string, studentId: string) => {
    toast.promise(
      (async () => {
        await api.post("/parents", {
          action: "unlink",
          parentId,
          studentId,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });

        // Force red pill morph
        throw new Error("Child record unlinked");
      })(),
      {
        loading: "Unlinking child...",
        success: () => "",
        error: (err: any) => err.message,
      },
    );
  };

  const handleEdit = (parent: ParentInfo) => {
    setEditingParent(parent);
    setEditForm({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      occupation: parent.occupation || "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingParent || !editForm.name || !editForm.email) {
      toast.error("Name and email are required");
      return;
    }
    toast.promise(
      (async () => {
        setEditing(true);
        try {
          await api.put("/parents", { id: editingParent.id, ...editForm });
          setEditOpen(false);
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent details updated";
        } finally {
          setEditing(false);
        }
      })(),
      {
        loading: "Saving changes...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        await api.delete(`/parents?id=${id}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });

        // Force red pill morph
        throw new Error("Parent record removed");
      })(),
      {
        loading: "Removing parent record...",
        success: () => "",
        error: (err: any) => err.message,
      },
    );
  };

  return loading && parents.length === 0 ? (
    <ParentSkeleton />
  ) : (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Parents
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {parents.length} parents registered •{" "}
            {parents.reduce((s, p) => s + p.children.length, 0)} children linked
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> Add Parent
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Search parents or children..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Parent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((parent) => (
          <ParentCard
            key={parent.id}
            parent={parent}
            linking={linking}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLinkOpen={(p) => {
              setSelectedParent(p);
              setLinkOpen(true);
              setSelectedClass("");
            }}
            onUnlinkChild={handleUnlinkChild}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No parents found</p>
          <p className="text-sm mt-1">Add a parent or adjust your search</p>
        </div>
      )}

      {/* Dialogs */}
      <CreateParentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreate={handleCreate}
        creating={creating}
      />

      <EditParentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
        editing={editing}
      />

      <LinkChildDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        selectedParent={selectedParent}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        classes={classes}
        filteredStudents={filteredStudents}
        linking={linking}
        onLinkChild={handleLinkChild}
        onUnlinkChild={handleUnlinkChild}
      />
    </div>
  );
}
