"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useAppStore, STORAGE_KEYS, type UserRole } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { goeyToast as toast } from "goey-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Building2,
  Clock,
  KeyRound,
  LogOut,
  Crown,
  Copy,
  Check,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  Smartphone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Phone,
  Share2,
  Palette,
} from "lucide-react";
import { useRouter } from "next/navigation";

const roleGradients: Record<UserRole, string> = {
  super_admin: "from-teal-600 via-teal-700 to-teal-800",
  admin: "from-emerald-600 via-emerald-700 to-emerald-800",
  teacher: "from-blue-600 via-blue-700 to-blue-800",
  student: "from-violet-600 via-violet-700 to-violet-800",
  parent: "from-amber-600 via-amber-700 to-amber-800",
  staff: "from-orange-600 via-orange-700 to-orange-800",
};

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

const roleColors: Record<UserRole, string> = {
  super_admin: "bg-teal-500 hover:bg-teal-600 text-white",
  admin: "bg-emerald-500 hover:bg-emerald-600 text-white",
  teacher: "bg-blue-500 hover:bg-blue-600 text-white",
  student: "bg-violet-500 hover:bg-violet-600 text-white",
  parent: "bg-amber-500 hover:bg-amber-600 text-white",
  staff: "bg-orange-500 hover:bg-orange-600 text-white",
};

const roleLabels: Record<UserRole, string> = {
  super_admin: "Platform Super Admin",
  admin: "School Administrator",
  teacher: "Faculty Educator",
  student: "Academic Student",
  parent: "Student Guardian",
  staff: "Operations Staff",
};

const roleQuotes: Record<UserRole, string> = {
  super_admin: "Commanding the platform and steering the digital infrastructure of our schools.",
  admin: "Empowering educators, managing resources, and shaping the future of education.",
  teacher: "Teaching is the greatest act of optimism. Inspiring minds, one class at a time.",
  student: "Knowledge is power. Success is the sum of small efforts, repeated day in and day out.",
  parent: "Supporting children's learning journey and fostering collaboration with the school.",
  staff: "Ensuring operations run smoothly to cultivate an environment of learning excellence.",
};



export function UserProfileScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { currentUser, currentTenantName, currentTenantSlug, logout } = useAppStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const handleCopySchoolUrl = () => {
    if (typeof window === "undefined" || !currentUser) return;
    const slug = currentTenantSlug || currentUser.tenantSlug || "";
    const url = `${window.location.origin}/${slug}`;
    
    navigator.clipboard.writeText(url);
    setCopiedField("SchoolUrl");
    toast.success("School portal URL copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getSchoolUrl = () => {
    if (typeof window === "undefined" || !currentUser) return "";
    const slug = currentTenantSlug || currentUser.tenantSlug || "";
    return `${window.location.origin}/${slug}`;
  };

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
    toast.success("Successfully logged out");
  };

  const handlePasswordChange = () => {
    window.dispatchEvent(new CustomEvent("open-change-password"));
  };

  const handleOpenEdit = () => {
    setEditName(currentUser?.name || "");
    setEditPhone(currentUser?.phone || "+91 98765 43210");
    setEditAddress(currentUser?.address || "7/A, Sector-4, HSR Layout, Bangalore, India");
    setEditAvatar(currentUser?.avatar || "");
    setIsEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Name cannot be empty!");
      return;
    }
    
    const updatedUser = {
      ...currentUser!,
      name: editName,
      phone: editPhone,
      address: editAddress,
      avatar: editAvatar,
    };
    
    // Save to store and local storage
    useAppStore.setState({ currentUser: updatedUser });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
    
    setIsEditOpen(false);
    toast.success("Profile updated successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file is too large! Please choose a file smaller than 2MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result as string);
      toast.success("Profile photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Stunning Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${roleGradients[currentUser.role]} p-6 md:p-8 text-white shadow-xl`}>
        {/* Decorative dynamic glows */}
        <div className="absolute -right-20 -top-20 size-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-black/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 z-10">
          {/* Avatar Ring with Hover Edit */}
          <div 
            onClick={handleOpenEdit}
            className="relative group cursor-pointer shrink-0"
            title="Click to edit profile"
          >
            <Avatar className="size-24 border-4 border-white/30 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-white/50">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover animate-in fade-in" />
              <AvatarFallback className="text-3xl font-extrabold bg-white text-zinc-800">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-4 border-transparent">
              <Camera className="size-5 text-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest mt-1">Change</span>
            </div>
            <span className="absolute bottom-1 right-1 flex size-4">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-4 bg-green-500 border-2 border-white"></span>
            </span>
          </div>

          {/* User Meta */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{currentUser.name}</h1>
                <p className="text-white/80 font-medium text-sm flex items-center justify-center md:justify-start gap-1.5 mt-1">
                  <Mail className="size-3.5" /> {currentUser.email}
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs px-3 py-1 font-bold">
                  {roleLabels[currentUser.role]}
                </Badge>
                {currentUser.customRole?.name && (
                  <Badge variant="secondary" className="bg-rose-500/80 hover:bg-rose-500 text-white border-0 text-xs px-3 py-1 font-bold">
                    Role: {currentUser.customRole.name}
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="bg-white/20 my-4" />

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-white/95">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-white/70" />
                <span className="font-semibold">
                  School: {currentUser.role === "super_admin" ? "SaaS Platform Management" : currentTenantName || currentUser.tenantName || "NutKhut School"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-white/70" />
                <span>Verified Account Logged In</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main content Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-100/80 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/30 backdrop-blur-md h-12 shadow-sm">
              <TabsTrigger 
                value="overview" 
                className="rounded-xl font-bold text-xs sm:text-sm gap-2 transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <User className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-xl font-bold text-xs sm:text-sm gap-2 transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Palette className="size-4" />
                Security & Themes
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="mt-4 focus-visible:outline-none">
              <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm rounded-2xl">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
                    <CardDescription>Personal verified identification records of your school account.</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                    {currentUser.role === "admin" && (
                      <Button
                        onClick={handleCopySchoolUrl}
                        className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white font-bold rounded-xl text-xs gap-1.5 h-9 w-full sm:w-auto justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-500/25 active:translate-y-0 active:scale-[0.98]"
                      >
                        <Share2 className="size-3.5" />
                        {copiedField === "SchoolUrl" ? "Copied URL!" : "Copy School Portal URL"}
                      </Button>
                    )}
                    <Button 
                      onClick={handleOpenEdit} 
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs gap-1.5 h-9 w-full sm:w-auto justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/25 active:translate-y-0 active:scale-[0.98]"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Grid fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Name */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-[#0c0c0e]/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1 relative group">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Full Name</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-6">{currentUser.name}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(currentUser.name, "Name")}
                        className="size-7 absolute right-2 top-1/2 -translate-y-1/2 text-emerald-800/80 hover:text-emerald-950 dark:text-emerald-400/80 dark:hover:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        {copiedField === "Name" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>

                    {/* Email */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-[#0c0c0e]/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1 relative group">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Email Address</p>
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-bold">Verified</Badge>
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-6">{currentUser.email}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(currentUser.email, "Email")}
                        className="size-7 absolute right-2 top-1/2 -translate-y-1/2 text-emerald-800/80 hover:text-emerald-950 dark:text-emerald-400/80 dark:hover:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        {copiedField === "Email" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>

                    {/* Role */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-[#0c0c0e]/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Primary Authority Role</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Shield className="size-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{currentUser.role.replace("_", " ")}</span>
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-[#0c0c0e]/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1 relative group">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Mobile Number</p>
                      <div className="flex items-center gap-1.5 mt-0.5 pr-6">
                        <Phone className="size-4 text-blue-500" />
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {currentUser.phone || "+91 98765 43210"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(currentUser.phone || "+91 98765 43210", "Mobile Number")}
                        className="size-7 absolute right-2 top-1/2 -translate-y-1/2 text-emerald-800/80 hover:text-emerald-950 dark:text-emerald-400/80 dark:hover:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Copy Mobile"
                      >
                        {copiedField === "Mobile Number" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>

                    {/* Residential Address */}
                    <div className="p-4 bg-zinc-50/50 dark:bg-[#0c0c0e]/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1 relative group md:col-span-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Residential Address</p>
                      <div className="flex items-start gap-1.5 mt-0.5 pr-6">
                        <MapPin className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-normal">
                          {currentUser.address || "7/A, Sector-4, HSR Layout, Bangalore, India"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(currentUser.address || "7/A, Sector-4, HSR Layout, Bangalore, India", "Address")}
                        className="size-7 absolute right-2 top-1/2 -translate-y-1/2 text-emerald-800/80 hover:text-emerald-950 dark:text-emerald-400/80 dark:hover:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Copy Address"
                      >
                        {copiedField === "Address" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>

                    {/* School context if not super admin */}
                    {currentUser.role !== "super_admin" && (
                      <>
                        {/* School Portal URL for Admin */}
                        {currentUser.role === "admin" && (
                          <div className="p-4 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 rounded-xl space-y-2 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative group">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <p className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400">Shareable School Portal URL</p>
                              <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 break-all">
                                {getSchoolUrl()}
                              </p>
                            </div>
                            <Button
                              onClick={handleCopySchoolUrl}
                              variant="outline"
                              className="h-8 border-violet-500/25 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-bold rounded-lg shrink-0 gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.97]"
                            >
                              {copiedField === "SchoolUrl" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                              Copy URL
                            </Button>
                          </div>
                        )}
                        {/* School Slug */}
                        <div className="p-4 bg-zinc-50/50 dark:bg-[#0c0c0e]/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl space-y-1 relative group">
                          <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">School URL Identifier</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all pr-10">{currentTenantSlug || currentUser.tenantSlug || "N/A"}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(currentTenantSlug || currentUser.tenantSlug || "", "School Identifier")}
                            className="size-10 sm:size-7 absolute right-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            {copiedField === "School Identifier" ? <Check className="size-4 sm:size-3.5 text-green-500" /> : <Copy className="size-4 sm:size-3.5" />}
                          </Button>
                        </div>

                      </>
                    )}
                  </div>

                  {/* Motivational Quote banner */}
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/20 dark:to-zinc-900 border border-violet-100 dark:border-violet-950/50 rounded-2xl flex items-start gap-3 mt-6">
                    <CheckCircle2 className="size-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-violet-950 dark:text-violet-200">Role Purpose & Duty</p>
                      <p className="text-xs text-violet-700 dark:text-violet-300/85 mt-1 leading-relaxed italic">
                        &ldquo;{roleQuotes[currentUser.role]}&rdquo;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* Tab 3: Security & Themes */}
            <TabsContent value="settings" className="mt-4 focus-visible:outline-none">
              <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Preferences & Security</CardTitle>
                  <CardDescription>Customize your workspace themes and lock down credentials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Switcher Widget */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold">Workspace Appearance Mode</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Select a premium color scheme tailored for maximum comfort.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="h-20 flex flex-col gap-2 rounded-xl justify-center items-center font-bold"
                      >
                        <Sun className="size-5 text-amber-500" />
                        <span className="text-xs">Light Theme</span>
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="h-20 flex flex-col gap-2 rounded-xl justify-center items-center font-bold"
                      >
                        <Moon className="size-5 text-blue-400" />
                        <span className="text-xs">Dark Theme</span>
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        onClick={() => setTheme("system")}
                        className="h-20 flex flex-col gap-2 rounded-xl justify-center items-center font-bold"
                      >
                        <Laptop className="size-5 text-zinc-500" />
                        <span className="text-xs">System Default</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Password reset & security credentials */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="size-4 text-orange-500" />
                        <h4 className="text-sm font-semibold">Account Access Code</h4>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Secure password used to authenticate your login sessions. Update regularly to prevent breach.
                      </p>
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-2"
                    >
                      <KeyRound className="size-4" /> Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right 1 Column: Quick Action Side Card */}
        <div className="space-y-6 lg:mt-[52px]">

          {/* Quick Actions Card */}
          <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {/* Premium subscription plan link if admin or parent */}
              {(currentUser.role === "admin" || currentUser.role === "parent") && (
                <Button
                  variant="outline"
                  onClick={() => router.push(currentUser.role === "admin" ? "school-subscription" : "subscription")}
                  className="w-full h-11 justify-start gap-3 rounded-xl border-amber-200/80 hover:bg-amber-500/5 hover:text-amber-600 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98]"
                >
                  <Crown className="size-4 text-amber-500" />
                  My Subscription
                </Button>
              )}

              {/* Change Password */}
              <Button
                variant="outline"
                onClick={handlePasswordChange}
                className="w-full h-11 justify-start gap-3 rounded-xl hover:bg-orange-500/5 hover:text-orange-600 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98]"
              >
                <KeyRound className="size-4 text-orange-500" />
                Change Password
              </Button>

              {/* Logout */}
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full h-11 justify-start gap-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 border-0 shadow-none font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-[0.98]"
              >
                <LogOut className="size-4" />
                Log Out Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. GORGEOUS PREMIUM EDIT PROFILE DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl bg-white dark:bg-[#09090b]">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-black tracking-tight">Edit Profile Details</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Modify your personal verified details. Changes reflect instantly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-5 mt-2">
            {/* Avatar Uploader Section */}
            <div className="flex flex-col items-center gap-3 p-4 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl">
              <Label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Profile Photo</Label>
              
              <div className="relative group">
                <Avatar className="size-20 border-2 border-emerald-500/20 shadow-lg">
                  <AvatarImage src={editAvatar} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Camera className="size-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preset illustrations */}
              <div className="space-y-1.5 w-full text-center">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">Or choose a premium profile preset</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {PRESET_AVATARS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(avatarUrl)}
                      className={`size-8 rounded-full overflow-hidden border-2 transition-all ${
                        editAvatar === avatarUrl 
                          ? "border-emerald-500 scale-110 shadow-md" 
                          : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img src={avatarUrl} alt="Preset Avatar" className="size-full object-cover animate-in fade-in" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-xl border-zinc-200/80 dark:border-zinc-800/80 h-10 font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Mobile Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rounded-xl border-zinc-200/80 dark:border-zinc-800/80 h-10 font-medium"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-address" className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Residential Address</Label>
                <Textarea
                  id="edit-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Enter residential address"
                  className="rounded-xl border-zinc-200/80 dark:border-zinc-800/80 min-h-[70px] resize-none font-medium text-xs leading-normal"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-0 pt-2 border-t border-zinc-100 dark:border-zinc-900">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
