import React, { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { PlatformUser, TenantInfo } from "./types";
import {
  UserDetailSheetProps,
  UserDetailTab,
  PendingSchoolChange,
  getRoleConfig,
  getRoleRelationsLabel,
  getUserInitials,
} from "./user-detail-sheet-model";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUpdateUser, useTenants } from "@/lib/graphql/hooks";
import { UserDetailSheetHeader } from "./UserDetailSheetHeader";
import { UserDetailSheetTabs } from "./UserDetailSheetTabs";
import { UserBasicInfoSection } from "./UserBasicInfoSection";
import { UserSchoolInfoSection } from "./UserSchoolInfoSection";
import { UserAccountStatusSection } from "./UserAccountStatusSection";
import { UserDetailSheetFooter } from "./UserDetailSheetFooter";
import { UserSchoolChangeConfirmDialog } from "./UserSchoolChangeConfirmDialog";
import { UserStatusConfirmDialog } from "./UserStatusConfirmDialog";

export function UserDetailSheet({
  open,
  onOpenChange,
  user,
  onToggleStatus,
  onUserUpdated,
  toggling,
  formatDateTime,
  tenants,
}: UserDetailSheetProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserDetailTab>("overview");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<PlatformUser | null>(user);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("admin");
  const [editTenantId, setEditTenantId] = useState<string>("none");

  // Quick school assignment popover state
  const [isSchoolPopoverOpen, setIsSchoolPopoverOpen] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [pendingSchoolChange, setPendingSchoolChange] = useState<PendingSchoolChange | null>(null);
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false);

  const updateUserMutation = useUpdateUser();
  const { data: tenantsData } = useTenants({ limit: 1000 });

  const allTenants: TenantInfo[] = useMemo(() => {
    if (tenantsData?.tenants && tenantsData.tenants.length > 0) {
      return tenantsData.tenants.map((t: any) => ({
        id: t.id,
        name: t.name,
        slug: t.slug || "",
        plan: t.plan,
        status: t.status,
      }));
    }
    return tenants || [];
  }, [tenantsData, tenants]);

  const filteredTenants = useMemo(() => {
    if (!schoolSearchQuery.trim()) return allTenants;
    const q = schoolSearchQuery.toLowerCase();
    return allTenants.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.slug && t.slug.toLowerCase().includes(q))
    );
  }, [allTenants, schoolSearchQuery]);

  useEffect(() => {
    if (user) {
      setCurrentUserData(user);
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setEditPhone(user.phone || "");
      setEditRole(user.role || "admin");
      setEditTenantId(user.tenant?.id || "none");
      setIsEditing(false);
      setIsSchoolPopoverOpen(false);
      setSchoolSearchQuery("");
    }
  }, [user]);

  if (!user || !currentUserData) return null;

  const roleConf = getRoleConfig(currentUserData.role);
  const initials = getUserInitials(currentUserData.name);

  const handleCopyEmail = () => {
    copyToClipboard(currentUserData.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!editEmail.trim()) {
      toast.error("Email Address is required");
      return;
    }

    try {
      const currentTenantId = currentUserData.tenant?.id || null;
      const res = await updateUserMutation.mutateAsync({
        id: currentUserData.id,
        data: {
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim() || undefined,
          role: editRole,
          tenantId: currentTenantId,
        },
      });

      const updatedUser: PlatformUser = {
        ...currentUserData,
        name: res?.name || editName.trim(),
        email: res?.email || editEmail.trim(),
        phone: res?.phone !== undefined ? res.phone : editPhone.trim(),
        role: res?.role || editRole,
        tenant: res?.tenant !== undefined 
          ? res.tenant 
          : (editTenantId === "none" ? null : allTenants.find((t) => t.id === editTenantId) || null),
      };

      setCurrentUserData(updatedUser);
      onUserUpdated?.(updatedUser);
      setIsEditing(false);
    } catch {
      // Handled in platform.hooks.ts onError
    }
  };

  const handleQuickSchoolChange = async (newTenantId: string | null) => {
    try {
      const res = await updateUserMutation.mutateAsync({
        id: currentUserData.id,
        data: {
          tenantId: newTenantId === "none" || !newTenantId ? null : newTenantId,
        },
      });

      const updatedUser: PlatformUser = {
        ...currentUserData,
        tenant: res?.tenant !== undefined 
          ? res.tenant 
          : (newTenantId === "none" || !newTenantId ? null : allTenants.find((t) => t.id === newTenantId) || null),
      };

      setCurrentUserData(updatedUser);
      onUserUpdated?.(updatedUser);
      setEditTenantId(updatedUser.tenant?.id || "none");
      setIsSchoolPopoverOpen(false);
      setPendingSchoolChange(null);
      
      if (!newTenantId || newTenantId === "none") {
        toast.success("User unassigned from school successfully");
      } else {
        const assignedSchool = allTenants.find((t) => t.id === newTenantId);
        toast.success(`User assigned to ${assignedSchool?.name || "school"} successfully`);
      }
    } catch {
      // Handled in platform.hooks.ts onError
    }
  };

  // Builds the confirmation payload (school-name label carries its own fallbacks)
  // and closes the picker; the mutation itself lives in handleQuickSchoolChange
  const requestSchoolChange = (newTenantId: string | null) => {
    const schoolName = newTenantId 
      ? allTenants.find((t) => t.id === newTenantId)?.name || "the selected school"
      : "Platform Level (No School)";
    setPendingSchoolChange({ tenantId: newTenantId, schoolName });
    setIsSchoolPopoverOpen(false);
  };

  // Seeds every edit field from the persisted user before entering edit mode
  const handleStartEdit = () => {
    setEditName(currentUserData.name || "");
    setEditEmail(currentUserData.email || "");
    setEditPhone(currentUserData.phone || "");
    setEditRole(currentUserData.role || "admin");
    setEditTenantId(currentUserData.tenant?.id || "none");
    setIsEditing(true);
  };

  // Same field reset as handleStartEdit, then leaves edit mode
  const handleCancelEdit = () => {
    setEditName(currentUserData.name || "");
    setEditEmail(currentUserData.email || "");
    setEditPhone(currentUserData.phone || "");
    setEditRole(currentUserData.role || "admin");
    setEditTenantId(currentUserData.tenant?.id || "none");
    setIsEditing(false);
  };

  // Closes the sheet before routing so the sheet never lingers over the school
  const handleViewSchool = () => {
    onOpenChange(false);
    router.push(`/${currentUserData.tenant?.slug || currentUserData.tenant?.id}`);
  };

  // Runs the parent-owned toggle first, then dismisses the confirmation dialog
  const handleConfirmToggleStatus = async () => {
    await onToggleStatus(currentUserData.id);
    setConfirmStatusDialogOpen(false);
  };

  const roleRelationsLabel = getRoleRelationsLabel(currentUserData.role);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        className="w-full sm:max-w-xl p-0 overflow-hidden bg-card border-l  shadow-2xl flex flex-col focus:outline-none h-full max-h-screen"
      >
        {/* Top Header Controls (Close & Options) */}
        <UserDetailSheetHeader
          initials={initials}
          name={currentUserData.name}
          isActive={currentUserData.isActive}
          roleConf={roleConf}
          onOpenChange={onOpenChange}
        />

        {/* Tab Navigation */}
        <UserDetailSheetTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          relationsLabel={roleRelationsLabel}
        />

        {/* Scrollable Content Body - with Lenis smooth scrolling */}
        <div 
          data-lenis-scroll-container
          className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-6 py-5 space-y-6 touch-pan-y"
        >
          {/* Section 1: Basic Information */}
          <UserBasicInfoSection
            name={currentUserData.name}
            email={currentUserData.email}
            phone={currentUserData.phone}
            roleConf={roleConf}
            isEditing={isEditing}
            editName={editName}
            setEditName={setEditName}
            editEmail={editEmail}
            setEditEmail={setEditEmail}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            editRole={editRole}
            setEditRole={setEditRole}
            isSaving={updateUserMutation.isPending}
            copiedEmail={copiedEmail}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onCopyEmail={handleCopyEmail}
          />

          {/* Section 2: School Information */}
          <UserSchoolInfoSection
            tenant={currentUserData.tenant}
            isSaving={updateUserMutation.isPending}
            isSchoolPopoverOpen={isSchoolPopoverOpen}
            setIsSchoolPopoverOpen={setIsSchoolPopoverOpen}
            schoolSearchQuery={schoolSearchQuery}
            setSchoolSearchQuery={setSchoolSearchQuery}
            filteredTenants={filteredTenants}
            onRequestSchoolChange={requestSchoolChange}
            onViewSchool={handleViewSchool}
          />

          {/* Section 3: Account Status */}
          <UserAccountStatusSection
            isActive={currentUserData.isActive}
            createdAt={currentUserData.createdAt}
            toggling={toggling}
            formatDateTime={formatDateTime}
            setConfirmStatusDialogOpen={setConfirmStatusDialogOpen}
          />
        </div>

        {/* Footer Actions */}
        <UserDetailSheetFooter
          isEditing={isEditing}
          isSaving={updateUserMutation.isPending}
          onOpenChange={onOpenChange}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      </SheetContent>

      {/* Confirmation Alert Dialog for School Change / Deassign */}
      <UserSchoolChangeConfirmDialog
        pendingSchoolChange={pendingSchoolChange}
        setPendingSchoolChange={setPendingSchoolChange}
        name={currentUserData.name}
        tenant={currentUserData.tenant}
        isSaving={updateUserMutation.isPending}
        onConfirmSchoolChange={handleQuickSchoolChange}
      />

      {/* Confirmation Alert Dialog for Account Deactivation / Activation */}
      <UserStatusConfirmDialog
        confirmStatusDialogOpen={confirmStatusDialogOpen}
        setConfirmStatusDialogOpen={setConfirmStatusDialogOpen}
        isActive={currentUserData.isActive}
        name={currentUserData.name}
        toggling={toggling}
        onConfirmToggle={handleConfirmToggleStatus}
      />
    </Sheet>
  );
}
