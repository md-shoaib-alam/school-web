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
import { StudentStatutoryCard } from "./StudentStatutoryCard";
import { StudentParentContactCard } from "./StudentParentContactCard";
import { StudentSiblingsCard } from "./StudentSiblingsCard";
import { StudentTransportCard } from "./StudentTransportCard";

export function StudentOverviewTab({
  currentStudent,
  studentDetails,
  transportRoute,
  canEdit,
  onSelectStudent,
  editingSection = null,
  setEditingSection = () => {},
  formatDate,
  calculateAge,
}: StudentOverviewTabProps) {
  const queryClient = useQueryClient();

  // Track collapsed state for sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    personal: false,
    academic: false,
    statutory: false,
    parent: false,
    transport: false,
  });

  const toggleCollapse = (sec: string) => {
    setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  /** A section shows its form when it is the active one, or when every section is open. */
  const isSectionEditing = (sec: string) => editingSection === sec || editingSection === "all";

  /** Another section holds the form: this one sits behind it, dimmed. */
  const dimmed = (sec: string) =>
    editingSection !== null && editingSection !== "all" && editingSection !== sec;

  const sourceStudent = studentDetails || currentStudent;

  // Editable Form State initialized directly from source
  const [formData, setFormData] = useState(() => ({
    name: sourceStudent?.name || "",
    gender: sourceStudent?.gender || "male",
    dateOfBirth: sourceStudent?.dateOfBirth ? sourceStudent.dateOfBirth.split("T")[0] : "",
    bloodGroup: sourceStudent?.bloodGroup || "Not Added",
    nationality: sourceStudent?.nationality || "",
    religion: sourceStudent?.religion || "",
    maritalStatus: sourceStudent?.maritalStatus || "",
    category: sourceStudent?.category || "",
    alternatePhone: sourceStudent?.alternatePhone || "",
    aadhaarNumber: sourceStudent?.aadhaarNumber || "",
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

  const buildForm = (s: any) => ({
    name: s?.name || "",
    gender: s?.gender || "male",
    dateOfBirth: s?.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
    bloodGroup: s?.bloodGroup || "Not Added",
    nationality: s?.nationality || "",
    religion: s?.religion || "",
    maritalStatus: s?.maritalStatus || "",
    category: s?.category || "",
    alternatePhone: s?.alternatePhone || "",
    aadhaarNumber: s?.aadhaarNumber || "",
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

  const startEditSection = (section: string) => {
    setFormData(buildForm(studentDetails || currentStudent));
    setEditingSection(section);
  };

  // The header "Edit Profile" button flips every section open at once; re-sync the
  // form from saved data so the bulk edit starts from truth, not a stale draft.
  useEffect(() => {
    if (editingSection === "all") setFormData(buildForm(studentDetails || currentStudent));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSection]);

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
        bloodGroup: formData.bloodGroup === "Not Added" ? "" : formData.bloodGroup,
        nationality: formData.nationality,
        religion: formData.religion,
        maritalStatus: formData.maritalStatus,
        category: formData.category,
        alternatePhone: formData.alternatePhone,
        aadhaarNumber: formData.aadhaarNumber,
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
      nationality: s?.nationality || "",
      religion: s?.religion || "",
      maritalStatus: s?.maritalStatus || "",
      category: s?.category || "",
      alternatePhone: s?.alternatePhone || "",
      aadhaarNumber: s?.aadhaarNumber || "",
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
        editing={isSectionEditing("personal")}
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
        editing={isSectionEditing("academic")}
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

      {/* CARD 2b: Background & Statutory Details */}
      <StudentStatutoryCard
        editing={isSectionEditing("statutory")}
        collapsed={collapsed.statutory}
        saving={saving}
        canEdit={canEdit}
        dimmed={dimmed("statutory")}
        currentStudent={currentStudent}
        nationality={formData.nationality}
        religion={formData.religion}
        maritalStatus={formData.maritalStatus}
        category={formData.category}
        alternatePhone={formData.alternatePhone}
        aadhaarNumber={formData.aadhaarNumber}
        onNationalityChange={(value) => setFormData({ ...formData, nationality: value })}
        onReligionChange={(value) => setFormData({ ...formData, religion: value })}
        onMaritalStatusChange={(value) => setFormData({ ...formData, maritalStatus: value })}
        onCategoryChange={(value) => setFormData({ ...formData, category: value })}
        onAlternatePhoneChange={(value) => setFormData({ ...formData, alternatePhone: value })}
        onAadhaarChange={(value) => setFormData({ ...formData, aadhaarNumber: value })}
        onEditSection={startEditSection}
        onToggleCollapse={toggleCollapse}
        onCancel={cancelSection}
        onSave={handleSave}
      />

      {/* CARD 3: Parent & Contact Details */}
      <StudentParentContactCard
        editing={isSectionEditing("parent")}
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
        editing={isSectionEditing("transport")}
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
