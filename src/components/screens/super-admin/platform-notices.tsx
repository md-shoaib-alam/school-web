"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Bell, 
  Users, 
  Building2, 
  History,
  CheckCircle2,
  Info,
  Send,
  Trash2,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { goeyToast as toast } from "goey-toast";
import { 
  useTenants, 
  useGraphQLMutation, 
  useGraphQLQuery,
  SEND_GLOBAL_NOTICE,
  PLATFORM_NOTICES,
  DELETE_PLATFORM_NOTICE 
} from "@/lib/graphql/hooks";
import { formatDistanceToNow } from "date-fns";

export function SuperAdminPlatformNotices() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState("all_schools");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [sending, setSending] = useState(false);

  const { data: tenantsData } = useTenants({ limit: 100 });
  const tenants = tenantsData?.tenants || [];

  // Fetch Real History
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useGraphQLQuery<{
    platformNotices: Array<{
      id: string;
      title: string;
      content: string;
      target: string;
      isActive: boolean;
      createdAt: string;
    }>
  }>(
    ["platform-notices-history"],
    PLATFORM_NOTICES,
    { limit: 20 }
  );

  const { mutateAsync: sendNotice } = useGraphQLMutation<{ 
    sendGlobalNotice: { success: boolean; message: string } 
  }, any>(SEND_GLOBAL_NOTICE);

  const { mutateAsync: deleteNotice } = useGraphQLMutation<{
    deletePlatformNotice: { success: boolean; message: string }
  }, { id: string }>(DELETE_PLATFORM_NOTICE);

  const handleSend = async () => {
    if (!title || !body) {
      toast.error("Please fill in both title and body");
      return;
    }

    setSending(true);
    try {
      const result = await sendNotice({
        title,
        body,
        target: targetType,
        schoolId: (targetType === 'specific_school' || targetType === 'school_parents') ? selectedSchool : null
      });

      const response = result.sendGlobalNotice;

      if (response.success) {
        toast.success(response.message || "Notice sent successfully");
        setTitle("");
        setBody("");
        refetchHistory();
      } else {
        toast.error(response.message || "Failed to send notice");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while sending notice");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteNotice({ id });
      if (result.deletePlatformNotice.success) {
        toast.success("Notice deleted successfully");
        refetchHistory();
      } else {
        toast.error("Failed to delete notice");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while deleting notice");
    }
  };

  const getTargetLabel = (target: string) => {
    const labels: Record<string, string> = {
      all_schools: "School Admins",
      specific_school: "Specific School",
      all_parents: "All Parents",
      school_parents: "School Parents",
      all_super_admins: "Super Admins",
      everyone: "Everyone",
    };
    return labels[target] || target;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notices</h2>
          <p className="text-muted-foreground mt-1">Send global notices that appear in the platform bar for all users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Compose Notice</CardTitle>
            <CardDescription>Create a message that will be pinned to the top of the platform for targeted users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Type</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_schools">All School Admins</SelectItem>
                    <SelectItem value="specific_school">Specific School Admins</SelectItem>
                    <SelectItem value="all_parents">All Parents (Global)</SelectItem>
                    <SelectItem value="school_parents">Parents of Specific School</SelectItem>
                    <SelectItem value="all_super_admins">All Super Admins</SelectItem>
                    <SelectItem value="everyone">Everyone (Platform-wide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(targetType === 'specific_school' || targetType === 'school_parents') && (
                <div className="space-y-2">
                  <Label>Target School</Label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Notice Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Platform Update: New Grading System" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Notice Content</Label>
              <Textarea 
                id="body" 
                placeholder="Type the notice details here..." 
                className="min-h-[150px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setTitle(""); setBody(""); }}>
                Reset
              </Button>
              <Button 
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "Sending..." : "Publish Notice"}
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/10 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-600" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Platform notices are **global** and appear in a high-visibility bar at the top of the application for all targeted users.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                  <Bell className="h-3 w-3" />
                  Visibility
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Top Global Bar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Real-time Push
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-amber-600" />
                Notice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(historyData?.platformNotices || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No notice history found.</p>
                  ) : (
                    historyData?.platformNotices.map((notice) => (
                      <div key={notice.id} className="group relative flex flex-col gap-1 border-b pb-3 last:border-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium pr-8">{notice.title}</p>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button 
                                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                title="Delete Notice"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{notice.title}</strong>? This will remove it from all user dashboards instantly.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDelete(notice.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {getTargetLabel(notice.target)}
                          </span>
                          <span>
                            {(() => {
                              try {
                                const d = new Date(notice.createdAt);
                                return isNaN(d.getTime()) ? "recently" : formatDistanceToNow(d, { addSuffix: true });
                              } catch {
                                return "recently";
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
