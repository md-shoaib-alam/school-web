"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, UserPlus } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

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

  const [parents, setParents] = useState<ParentInfo[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`parents_cache_${currentTenantId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [classes, setClasses] = useState<
    { id: string; name: string; section: string }[]
  >([]);

  const [loading, setLoading] = useState(parents.length === 0);
  const [search, setSearch] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    password: "", // Added consistency
  });
  const [creating, setCreating] = useState(false);

  // Link child dialog
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentInfo | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [linking, setLinking] = useState(false);

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

  const fetchData = useCallback(
    async (showSkeleton = false) => {
      try {
        if (showSkeleton) setLoading(true);
        const [resParents, resStudents, resClasses] = await Promise.all([
          apiFetch("/api/parents"),
          apiFetch("/api/students"),
          apiFetch("/api/classes"),
        ]);

        if (!resParents.ok || !resStudents.ok || !resClasses.ok)
          throw new Error("Failed to load some data");

        const [parentsData, studentsData, classesData] = await Promise.all([
          resParents.json(),
          resStudents.json(),
          resClasses.json(),
        ]);

        setParents(parentsData);
        setStudents(studentsData);
        setClasses(classesData);

        if (typeof window !== "undefined" && currentTenantId) {
          localStorage.setItem(
            `parents_cache_${currentTenantId}`,
            JSON.stringify(parentsData),
          );
        }
      } catch (err) {
        console.error("Error fetching parent data:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentTenantId],
  );

  useEffect(() => {
    if (currentTenantId) {
      fetchData(parents.length === 0);
    }
  }, [currentTenantId, fetchData]);

  const filtered = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.children.some((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const filteredStudents =
    selectedClass && selectedClass !== "all"
      ? students.filter(
          (s) =>
            s.classId === selectedClass &&
            !selectedParent?.children.some((c) => c.id === s.id),
        )
      : students.filter(
          (s) => !selectedParent?.children.some((c) => c.id === s.id),
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
          const res = await apiFetch("/api/parents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create", ...createForm }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to create parent");
          }
          setCreateOpen(false);
          setCreateForm({
            name: "",
            email: "",
            phone: "",
            occupation: "",
            password: "",
          });
          fetchData();
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
          const res = await apiFetch("/api/parents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "link",
              parentId: selectedParent.id,
              studentId,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Linking failed");
          }
          // Refresh everything to keep in sync
          const freshParentsRes = await apiFetch("/api/parents");
          const freshParents = await freshParentsRes.json();
          setParents(freshParents);
          setSelectedParent(
            freshParents.find((p: ParentInfo) => p.id === selectedParent.id) ||
              null,
          );
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
        const res = await apiFetch("/api/parents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "unlink",
            parentId,
            studentId,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Unlinking failed");
        }
        const freshParentsRes = await apiFetch("/api/parents");
        const freshParents = await freshParentsRes.json();
        setParents(freshParents);
        if (selectedParent && selectedParent.id === parentId) {
          setSelectedParent(
            freshParents.find((p: ParentInfo) => p.id === parentId) || null,
          );
        }

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
          const res = await apiFetch("/api/parents", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingParent.id, ...editForm }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Update failed");
          }
          setEditOpen(false);
          fetchData();
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
        const res = await apiFetch(`/api/parents?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Deletion failed");
        }
        setParents(parents.filter((p) => p.id !== id));

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
