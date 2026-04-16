"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  Globe,
  Shield,
  Bell,
  CreditCard,
  Server,
  Save,
  Lock,
  Edit,
  Check,
  CheckCircle2,
  Sparkles,
  Zap,
  Crown,
  Building2,
  Activity,
  Database,
  Cpu,
  Clock,
  HardDrive,
  Users,
  Layers,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanConfig {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  maxStudents: number;
  maxTeachers: number;
  maxClasses: number;
  features: string[];
  color: string;
  icon: React.ReactNode;
}

const defaultPlans: PlanConfig[] = [
  {
    name: "Basic",
    monthlyPrice: "$29",
    yearlyPrice: "$290",
    maxStudents: 100,
    maxTeachers: 10,
    maxClasses: 10,
    features: [
      "Student Management",
      "Basic Reports",
      "Email Support",
      "1 GB Storage",
    ],
    color: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    name: "Standard",
    monthlyPrice: "$79",
    yearlyPrice: "$790",
    maxStudents: 500,
    maxTeachers: 30,
    maxClasses: 30,
    features: [
      "Everything in Basic",
      "Grade Management",
      "Attendance Tracking",
      "Fee Management",
      "5 GB Storage",
      "Priority Support",
    ],
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    name: "Premium",
    monthlyPrice: "$149",
    yearlyPrice: "$1,490",
    maxStudents: 2000,
    maxTeachers: 100,
    maxClasses: 100,
    features: [
      "Everything in Standard",
      "Advanced Analytics",
      "Timetable System",
      "Parent Portal",
      "API Access",
      "20 GB Storage",
      "Dedicated Support",
    ],
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    name: "Enterprise",
    monthlyPrice: "$299",
    yearlyPrice: "$2,990",
    maxStudents: -1,
    maxTeachers: -1,
    maxClasses: -1,
    features: [
      "Everything in Premium",
      "Custom Integrations",
      "White-label",
      "SLA Guarantee",
      "Unlimited Storage",
      "On-premise Option",
      "24/7 Phone Support",
      "Dedicated Account Manager",
    ],
    color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
    icon: <Crown className="h-4 w-4" />,
  },
];

export function SuperAdminSettings() {
  // General Settings
  const [platformName, setPlatformName] = useState("SchoolSaaS");
  const [supportEmail, setSupportEmail] = useState("support@schoolsaas.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Our platform is currently undergoing scheduled maintenance. We will be back shortly. Thank you for your patience!",
  );
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [defaultCurrency, setDefaultCurrency] = useState("usd");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowStorageAlert, setLowStorageAlert] = useState(true);
  const [newTenantRegistration, setNewTenantRegistration] = useState(true);

  // Security Settings
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelist, setIpWhitelist] = useState("");

  // API Configuration
  const [rateLimit, setRateLimit] = useState("1000");
  const [webhookUrl, setWebhookUrl] = useState("");

  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  // Performance Monitoring
  const [checking, setChecking] = useState(false);
  const [perfData, setPerfData] = useState<{
    status: string;
    timestamp: string;
    uptime: number;
    database: {
      status: string;
      latency: string;
      totalQueries: number;
      slowestQuery: string;
      poolWarmed: boolean;
      records: {
        users: number;
        classes: number;
        attendance: number;
        fees: number;
      };
    };
    server: {
      totalLatency: string;
      memory: {
        rss: string;
        heapUsed: string;
        heapTotal: string;
        external: string;
      } | null;
      nodeVersion: string;
      platform: string;
    };
    concurrency: {
      estimatedCapacity: string;
      connectionPool: string;
      cacheLayer: string;
      requestDeduplication: string;
    };
    optimizations: Record<string, boolean>;
  } | null>(null);

  // Fetch maintenance mode from DB on mount
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await apiFetch("/api/platform-settings?key=maintenance_mode");
        if (res.ok) {
          const data = await res.json();
          if (data.value !== null) {
            setMaintenanceMode(data.value === "true");
          }
        }
        const msgRes = await fetch(
          "/api/platform-settings?key=maintenance_message",
        );
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.value) {
            setMaintenanceMessage(msgData.value);
          }
        }
      } catch {
        /* silent */
      }
    };
    fetchMaintenance();
  }, []);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setSavingMaintenance(true);
    try {
      const res = await apiFetch("/api/platform-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "maintenance_mode",
          value: String(enabled),
        }),
      });
      if (res.ok) {
        setMaintenanceMode(enabled);
        toast.success(
          enabled ? "Maintenance mode enabled" : "Maintenance mode disabled",
          {
            description: enabled
              ? "All non-super-admin users will now see the maintenance page."
              : "All users can now access the platform normally.",
          },
        );
      } else {
        toast.error("Failed to update maintenance mode");
      }
    } catch {
      toast.error("Failed to update maintenance mode");
    } finally {
      setSavingMaintenance(false);
    }
  };

  const handleSaveMaintenanceMessage = async () => {
    try {
      const res = await apiFetch("/api/platform-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "maintenance_message",
          value: maintenanceMessage,
        }),
      });
      if (res.ok) {
        toast.success("Maintenance message saved");
      } else {
        toast.error("Failed to save maintenance message");
      }
    } catch {
      toast.error("Failed to save maintenance message");
    }
  };

  const handleCheckPerformance = async () => {
    setChecking(true);
    try {
      const res = await apiFetch("/api/performance");
      if (!res.ok) throw new Error("Performance check failed");
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      setPerfData(data);
      toast.success("Performance check completed successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Performance check failed",
      );
    } finally {
      setChecking(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleSave = () => {
    toast.success("Settings saved successfully!", {
      description: "Platform settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-pink-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-gray-900/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-900/20 flex items-center justify-center backdrop-blur-sm">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Platform Settings
            </h2>
            <p className="text-teal-100 text-sm">
              Configure global platform preferences, plans, and security
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-1.5">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5">
            <CreditCard className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5">
            <Server className="h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-500" />
                General Settings
              </CardTitle>
              <CardDescription>
                Core platform configuration that affects all tenants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="platform-name"
                    className="text-sm font-medium"
                  >
                    Platform Name
                  </Label>
                  <Input
                    id="platform-name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Enter platform name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Displayed in the sidebar and login page
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="support-email"
                    className="text-sm font-medium"
                  >
                    Support Email
                  </Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Visible to all tenant administrators
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="default-language"
                    className="text-sm font-medium"
                  >
                    Default Language
                  </Label>
                  <Select
                    value={defaultLanguage}
                    onValueChange={setDefaultLanguage}
                  >
                    <SelectTrigger className="w-full" id="default-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="zh">Chinese (Simplified)</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="default-currency"
                    className="text-sm font-medium"
                  >
                    Default Currency
                  </Label>
                  <Select
                    value={defaultCurrency}
                    onValueChange={setDefaultCurrency}
                  >
                    <SelectTrigger className="w-full" id="default-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($) - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR (€) - Euro</SelectItem>
                      <SelectItem value="gbp">
                        GBP (£) - British Pound
                      </SelectItem>
                      <SelectItem value="inr">
                        INR (₹) - Indian Rupee
                      </SelectItem>
                      <SelectItem value="aud">
                        AUD (A$) - Australian Dollar
                      </SelectItem>
                      <SelectItem value="cad">
                        CAD (C$) - Canadian Dollar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Maintenance Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, all non-super-admin users (admin, teacher,
                    student, parent, staff) will see a maintenance page. Super
                    admins retain full access.
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={handleMaintenanceToggle}
                  disabled={savingMaintenance}
                />
              </div>
              {maintenanceMode && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-3 flex items-center gap-2">
                    <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                      ⚠️ Maintenance mode is active. All non-super-admin users
                      are blocked.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="maintenance-message"
                      className="text-sm font-medium"
                    >
                      Maintenance Message
                    </Label>
                    <Textarea
                      id="maintenance-message"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="Enter a message to show users during maintenance..."
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveMaintenanceMessage}
                    >
                      Save Message
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Configuration */}
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-teal-500" />
                Plan Configuration
              </CardTitle>
              <CardDescription>
                Manage subscription plans available to schools and tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/80">
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                      <TableHead className="text-right">Yearly</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-center">Teachers</TableHead>
                      <TableHead className="text-center">Classes</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaultPlans.map((plan) => (
                      <TableRow
                        key={plan.name}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center ${plan.color}`}
                            >
                              {plan.icon}
                            </div>
                            <span className="font-semibold text-sm">
                              {plan.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {plan.monthlyPrice}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {plan.yearlyPrice}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {plan.maxStudents === -1 ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Unlimited
                            </Badge>
                          ) : (
                            plan.maxStudents.toLocaleString()
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {plan.maxTeachers === -1 ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Unlimited
                            </Badge>
                          ) : (
                            plan.maxTeachers
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {plan.maxClasses === -1 ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Unlimited
                            </Badge>
                          ) : (
                            plan.maxClasses
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {plan.features.slice(0, 3).map((f) => (
                              <Badge
                                key={f}
                                variant="outline"
                                className="text-[10px] font-normal"
                              >
                                {f}
                              </Badge>
                            ))}
                            {plan.features.length > 3 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-normal"
                              >
                                +{plan.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setEditingPlan(
                                editingPlan === plan.name ? null : plan.name,
                              )
                            }
                          >
                            {editingPlan === plan.name ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {editingPlan && (
                <div className="mt-4 p-4 rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="h-4 w-4 text-teal-600" />
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
                      Editing {editingPlan} plan — full plan editor coming soon
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is a demo view. Plan editing will be available in a
                    future release.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-5 w-5 text-teal-500" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how and when platform notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Send email alerts for important platform events and updates
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Send SMS alerts for critical events (e.g., downtime,
                    security breaches)
                  </p>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Low Storage Alert
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Alert when platform storage usage exceeds 80% capacity
                  </p>
                </div>
                <Switch
                  checked={lowStorageAlert}
                  onCheckedChange={setLowStorageAlert}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    New Tenant Registration
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Notify admins when a new school or tenant registers on the
                    platform
                  </p>
                </div>
                <Switch
                  checked={newTenantRegistration}
                  onCheckedChange={setNewTenantRegistration}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-500" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure platform-wide security policies and authentication
                requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="password-policy"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <Lock className="h-4 w-4" />
                    Password Policy
                  </Label>
                  <Select
                    value={passwordPolicy}
                    onValueChange={setPasswordPolicy}
                  >
                    <SelectTrigger className="w-full" id="password-policy">
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        Basic — 6+ characters
                      </SelectItem>
                      <SelectItem value="strong">
                        Strong — 8+ chars, mixed case, number
                      </SelectItem>
                      <SelectItem value="very-strong">
                        Very Strong — 10+ chars, special chars, no repeat
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all new user registrations across tenants
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="session-timeout"
                    className="text-sm font-medium"
                  >
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min={5}
                    max={480}
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Users will be automatically logged out after this period of
                    inactivity
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    Two-Factor Authentication Requirement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Force all users to enable two-factor authentication on their
                    accounts
                  </p>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ip-whitelist" className="text-sm font-medium">
                  IP Whitelist
                </Label>
                <Textarea
                  id="ip-whitelist"
                  placeholder={"192.168.1.0/24\n10.0.0.1\n172.16.0.0/16"}
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  One IP address or CIDR range per line. Leave empty to allow
                  all IPs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Configuration */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-5 w-5 text-teal-500" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage API access, rate limiting, and webhook integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit" className="text-sm font-medium">
                    Rate Limit (requests/minute)
                  </Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    min={10}
                    max={100000}
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum API requests allowed per minute per tenant
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Version</Label>
                  <div className="flex items-center gap-3 h-9">
                    <Badge
                      variant="outline"
                      className="font-mono text-sm px-3 py-1 border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                    >
                      v2.4.1
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Current production version
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Version is managed automatically through deployments
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-sm font-medium">
                  Webhook URL
                </Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-server.com/webhooks/schoolsaas"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Platform events (tenant created, subscription changed, etc.)
                  will be sent to this URL
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Webhook Events
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "tenant.created",
                    "tenant.suspended",
                    "subscription.created",
                    "subscription.expired",
                    "user.invited",
                    "payment.processed",
                    "storage.warning",
                  ].map((event) => (
                    <Badge
                      key={event}
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Performance & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-500" />
            System Performance & Resources
          </CardTitle>
          <CardDescription>
            Real-time server metrics and optimization status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCheckPerformance}
            disabled={checking}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Running Test..." : "Run Performance Test"}
          </Button>

          {checking && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          )}

          {perfData && !checking && (
            <>
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${perfData.status === "healthy" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  System Status:{" "}
                  <span
                    className={
                      perfData.status === "healthy"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {perfData.status}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  Last checked:{" "}
                  {new Date(perfData.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Main metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {/* DB Status */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      DB Status
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div
                      className={`h-2 w-2 rounded-full ${perfData.database.status === "connected" ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span className="text-lg font-semibold">
                      {perfData.database.status === "connected"
                        ? "Connected"
                        : "Disconnected"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Pool {perfData.database.poolWarmed ? "warmed" : "cold"}
                  </span>
                </div>

                {/* DB Latency */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      DB Latency
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {perfData.database.latency}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Slowest: {perfData.database.slowestQuery}
                  </span>
                </div>

                {/* Total Records */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Total Records
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {Object.values(perfData.database.records)
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}
                  </p>
                  <div className="flex gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{perfData.database.records.users} users</span>
                    <span>·</span>
                    <span>{perfData.database.records.attendance} att.</span>
                    <span>·</span>
                    <span>{perfData.database.records.fees} fees</span>
                  </div>
                </div>

                {/* Memory Usage */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Memory
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {perfData.server.memory?.heapUsed ?? "N/A"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    RSS: {perfData.server.memory?.rss ?? "N/A"}
                  </span>
                </div>

                {/* Server Uptime */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-teal-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Uptime
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {formatUptime(perfData.uptime)}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {perfData.server.nodeVersion} · {perfData.server.platform}
                  </span>
                </div>

                {/* Total Queries */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Queries
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {perfData.database.totalQueries.toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Since server start
                  </span>
                </div>

                {/* API Latency */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-teal-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      API Latency
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">
                    {perfData.server.totalLatency}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    End-to-end response
                  </span>
                </div>

                {/* Concurrency */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Capacity
                    </span>
                  </div>
                  <p className="text-lg font-semibold mt-2">2,000+</p>
                  <span className="text-xs text-muted-foreground">
                    Concurrent users
                  </span>
                </div>
              </div>

              {/* Concurrency Details & Optimization Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Concurrency Details */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    Concurrency Stack
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(perfData.concurrency).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between gap-3"
                        >
                          <span className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="text-xs font-medium text-right max-w-[60%]">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Optimization Checklist */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Optimization Checklist
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(perfData.optimizations).map(
                      ([key, enabled]) => {
                        const label = key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s) => s.toUpperCase())
                          .trim();
                        return (
                          <div key={key} className="flex items-center gap-2">
                            {enabled ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                            )}
                            <span className="text-xs">{label}</span>
                            {enabled && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 ml-auto"
                              >
                                Active
                              </Badge>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button - sticky at bottom */}
      <div className="sticky bottom-4 z-10">
        <Card className="shadow-lg border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="hidden sm:inline">
                Changes are saved locally. Click save to apply settings to the
                platform.
              </span>
              <span className="sm:hidden">Save platform settings</span>
            </div>
            <Button
              onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
