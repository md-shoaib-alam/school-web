"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  parseRouteStops,
  type StudentOverviewTabProps,
} from "./student-overview-model";
import { StudentPersonalInfoCard } from "./StudentPersonalInfoCard";
import { StudentAcademicInfoCard } from "./StudentAcademicInfoCard";
import { StudentParentContactCard } from "./StudentParentContactCard";
import { StudentSiblingsCard } from "./StudentSiblingsCard";
import { StudentTransportCard } from "./StudentTransportCard";

export function StudentOverviewTab({
  currentStudent,
  studentDetails,
  transportRoute,
  canEdit,
  onSelectStudent,
  formatDate,
  calculateAge,
}: StudentOverviewTabProps) {
  const queryClient = useQueryClient();

  // Track which section is in edit mode: null | 'personal' | 'academic' | 'parent' | 'transport'
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Track collapsed state for sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    personal: false,
    academic: false,
    parent: false,
    transport: false,
  });

  const toggleCollapse = (sec: string) => {
    setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  /** Another section holds the form: this one sits behind it, dimmed. */
  const dimmed = (sec: string) => editingSection !== null && editingSection !== sec;

  const sourceStudent = studentDetails || currentStudent;

  // Editable Form State initialized directly from source
  const [formData, setFormData] = useState(() => ({
    name: sourceStudent?.name || "",
    gender: sourceStudent?.gender || "male",
    dateOfBirth: sourceStudent?.dateOfBirth ? sourceStudent.dateOfBirth.split("T")[0] : "",
    bloodGroup: sourceStudent?.bloodGroup || "Not Added",
    phone: sourceStudent?.phone || "",
    email: sourceStudent?.email || "",
    classId: sourceStudent?.classId || "",
    className: sourceStudent?.className || "",
    rollNumber: sourceStudent?.rollNumber || "",
    username: sourceStudent?.username || "",
    admissionDate: sourceStudent?.admissionDate ? sourceStudent.admissionDate.split("T")[0] : (sourceStudent?.createdAt ? sourceStudent.createdAt.split("T")[0] : ""),
    academicStatus: sourceStudent?.status || "enrolled",
    house: sourceStudent?.house || "Not Assigned",
    parentName: sourceStudent?.parentName || "",
    parentRelationship: "Parent",
    parentEmail: sourceStudent?.parentEmail || "",
    parentPhone: sourceStudent?.parentPhone || "",
    address: sourceStudent?.address || "",
    transportEnabled: !!sourceStudent?.transport,
    routeId: sourceStudent?.transport?.routeId || "",
    pickupPoint: sourceStudent?.transport?.pickupPoint || "",
    newPickupPointFee: 0,
  }));

  // Fetch transport routes for transport section
  const { data: routesData } = useQuery({
    queryKey: ["transport-routes-min"],
    queryFn: async () => {
      try {
        const res = await apiFetch("/api/transport-routes?mode=min");
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
      } catch {
        return [];
      }
    },
  });
  const routes = Array.isArray(routesData) ? routesData : [];

  const startEditSection = (section: string) => {
    const s = studentDetails || currentStudent;
    setFormData({
      name: s?.name || "",
      gender: s?.gender || "male",
      dateOfBirth: s?.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
      bloodGroup: s?.bloodGroup || "Not Added",
      phone: s?.phone || "",
      email: s?.email || "",
      classId: s?.classId || "",
      className: s?.className || "",
      rollNumber: s?.rollNumber || "",
      username: s?.username || "",
      admissionDate: s?.admissionDate ? s.admissionDate.split("T")[0] : (s?.createdAt ? s.createdAt.split("T")[0] : ""),
      academicStatus: s?.status || "enrolled",
      house: s?.house || "Not Assigned",
      parentName: s?.parentName || "",
      parentRelationship: "Parent",
      parentEmail: s?.parentEmail || "",
      parentPhone: s?.parentPhone || "",
      address: s?.address || "",
      transportEnabled: !!s?.transport,
      routeId: s?.transport?.routeId || "",
      pickupPoint: s?.transport?.pickupPoint || "",
      newPickupPointFee: 0,
    });
    setEditingSection(section);
  };

  const [saving, setSaving] = useState(false);

  // Save changes for a section or whole student
  const handleSave = async (sectionName?: string) => {
    setSaving(true);
    try {
      const s = studentDetails || currentStudent;
      const payload: any = {
        id: s.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        rollNumber: formData.rollNumber,
        classId: formData.classId,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        status: formData.academicStatus,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        address: formData.address,
        transportEnabled: formData.transportEnabled,
        routeId: formData.routeId,
        pickupPoint: formData.pickupPoint,
      };

      const res = await apiFetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update student details");
      }

      toast.success(sectionName ? `${sectionName} updated successfully` : "Student details updated successfully");
      
      // Invalidate queries to refresh view data
      queryClient.invalidateQueries({ queryKey: ["student-detail", s.id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      
      setEditingSection(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  const cancelSection = () => {
    // Reset to current values
    const s = studentDetails || currentStudent;
    setFormData((prev) => ({
      ...prev,
      name: s?.name || "",
      gender: s?.gender || "male",
      dateOfBirth: s?.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
      phone: s?.phone || "",
      email: s?.email || "",
      classId: s?.classId || "",
      rollNumber: s?.rollNumber || "",
      username: s?.username || "",
      academicStatus: s?.status || "enrolled",
      parentName: s?.parentName || "",
      parentRelationship: "Parent",
      parentEmail: s?.parentEmail || "",
      parentPhone: s?.parentPhone || "",
      address: s?.address || "",
      transportEnabled: !!s?.transport,
      routeId: s?.transport?.routeId || "",
      pickupPoint: s?.transport?.pickupPoint || "",
    }));
    setEditingSection(null);
  };

  const selectedRoute = routes.find((r: any) => r?.id === formData.routeId);
  const routeStops = parseRouteStops(selectedRoute);

  return (
    <div className="space-y-4">
      {/* CARD 1: Personal Information */}
      <StudentPersonalInfoCard
        editing={editingSection === "personal"}
        collapsed={collapsed.personal}
        saving={saving}
        canEdit={canEdit}
        dimmed={dimmed("personal")}
        currentStudent={currentStudent}
        name={formData.name}
        gender={formData.gender}
        dateOfBirth={formData.dateOfBirth}
        bloodGroup={formData.bloodGroup}
        phone={formData.phone}
        email={formData.email}
        onNameChange={(value) => setFormData({ ...formData, name: value })}
        onGenderChange={(value) => setFormData({ ...formData, gender: value })}
        onDateOfBirthChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
        onBloodGroupChange={(value) => setFormData({ ...formData, bloodGroup: value })}
        onPhoneChange={(value) => setFormData({ ...formData, phone: value })}
        onEmailChange={(value) => setFormData({ ...formData, email: value })}
        onEditSection={startEditSection}
        onToggleCollapse={toggleCollapse}
        onCancel={cancelSection}
        onSave={handleSave}
        onUploadPhotoClick={() => toast.info("Photo upload will be saved with profile")}
        formatDate={formatDate}
        calculateAge={calculateAge}
      />

      {/* CARD 2: Academic Information */}
      <StudentAcademicInfoCard
        editing={editingSection === "academic"}
        collapsed={collapsed.academic}
        saving={saving}
        canEdit={canEdit}
        dimmed={dimmed("academic")}
        currentStudent={currentStudent}
        classId={formData.classId}
        rollNumber={formData.rollNumber}
        username={formData.username}
        admissionDate={formData.admissionDate}
        academicStatus={formData.academicStatus}
        house={formData.house}
        onClassIdChange={(value) => setFormData({ ...formData, classId: value })}
        onRollNumberChange={(value) => setFormData({ ...formData, rollNumber: value })}
        onAdmissionDateChange={(value) => setFormData({ ...formData, admissionDate: value })}
        onAcademicStatusChange={(value) => setFormData({ ...formData, academicStatus: value })}
        onEditSection={startEditSection}
        onToggleCollapse={toggleCollapse}
        onCancel={cancelSection}
        onSave={handleSave}
        formatDate={formatDate}
      />

      {/* CARD 3: Parent & Contact Details */}
      <StudentParentContactCard
        editing={editingSection === "parent"}
        collapsed={collapsed.parent}
        saving={saving}
        canEdit={canEdit}
        dimmed={dimmed("parent")}
        currentStudent={currentStudent}
        parentName={formData.parentName}
        parentRelationship={formData.parentRelationship}
        parentPhone={formData.parentPhone}
        parentEmail={formData.parentEmail}
        email={formData.email}
        address={formData.address}
        onParentNameChange={(value) => setFormData({ ...formData, parentName: value })}
        onParentPhoneChange={(value) => setFormData({ ...formData, parentPhone: value })}
        onParentEmailChange={(value) => setFormData({ ...formData, parentEmail: value })}
        onEmailChange={(value) => setFormData({ ...formData, email: value })}
        onAddressChange={(value) => setFormData({ ...formData, address: value })}
        onEditSection={startEditSection}
        onToggleCollapse={toggleCollapse}
        onCancel={cancelSection}
        onSave={handleSave}
      />

      {/* CARD 4: Siblings (View Only - No Edit Button) */}
      {studentDetails?.siblings && studentDetails.siblings.length > 0 && (
        <StudentSiblingsCard
          siblings={studentDetails.siblings}
          onSelectStudent={onSelectStudent}
          dimmed={editingSection !== null}
        />
      )}

      {/* CARD 5: Transport Details */}
      <StudentTransportCard
        editing={editingSection === "transport"}
        collapsed={collapsed.transport}
        saving={saving}
        canEdit={canEdit}
        dimmed={dimmed("transport")}
        transport={studentDetails?.transport}
        transportRoute={transportRoute}
        routes={routes}
        routeStops={routeStops}
        transportEnabled={formData.transportEnabled}
        routeId={formData.routeId}
        pickupPoint={formData.pickupPoint}
        onTransportEnabledChange={(value) => setFormData({ ...formData, transportEnabled: value })}
        onRouteChange={(routeId) => setFormData({ ...formData, routeId, pickupPoint: "" })}
        onPickupPointChange={(value) => setFormData({ ...formData, pickupPoint: value })}
        onEditSection={startEditSection}
        onToggleCollapse={toggleCollapse}
        onCancel={cancelSection}
        onSave={handleSave}
        onAddTransport={() => {
          setEditingSection("transport");
          setFormData((prev) => ({ ...prev, transportEnabled: true }));
        }}
      />

    </div>
  );
}
