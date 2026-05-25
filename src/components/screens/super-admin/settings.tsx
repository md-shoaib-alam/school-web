"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useReducer } from "react";
import { Globe, Settings, Save, Loader2, ShieldAlert } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type State = {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  loading: boolean;
  savingAll: boolean;
  savingMaintenance: boolean;
  defaultLanguage: string;
  defaultCurrency: string;
};

type Action =
  | { type: 'SET_DATA'; payload: Partial<State> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING_ALL'; payload: boolean }
  | { type: 'SET_SAVING_MAINTENANCE'; payload: boolean }
  | { type: 'SET_PLATFORM_NAME'; payload: string }
  | { type: 'SET_SUPPORT_EMAIL'; payload: string }
  | { type: 'SET_MAINTENANCE_MODE'; payload: boolean }
  | { type: 'SET_MAINTENANCE_MESSAGE'; payload: string }
  | { type: 'SET_DEFAULT_LANGUAGE'; payload: string }
  | { type: 'SET_DEFAULT_CURRENCY'; payload: string };

const initialState: State = {
  platformName: "SchoolSaaS",
  supportEmail: "support@schoolsaas.com",
  maintenanceMode: false,
  maintenanceMessage: "Our platform is currently undergoing scheduled maintenance. We will be back shortly. Thank you for your patience!",
  loading: true,
  savingAll: false,
  savingMaintenance: false,
  defaultLanguage: "en",
  defaultCurrency: "usd",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVING_ALL':
      return { ...state, savingAll: action.payload };
    case 'SET_SAVING_MAINTENANCE':
      return { ...state, savingMaintenance: action.payload };
    case 'SET_PLATFORM_NAME':
      return { ...state, platformName: action.payload };
    case 'SET_SUPPORT_EMAIL':
      return { ...state, supportEmail: action.payload };
    case 'SET_MAINTENANCE_MODE':
      return { ...state, maintenanceMode: action.payload };
    case 'SET_MAINTENANCE_MESSAGE':
      return { ...state, maintenanceMessage: action.payload };
    case 'SET_DEFAULT_LANGUAGE':
      return { ...state, defaultLanguage: action.payload };
    case 'SET_DEFAULT_CURRENCY':
      return { ...state, defaultCurrency: action.payload };
    default:
      return state;
  }
}

export function SuperAdminSettings() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    platformName,
    supportEmail,
    maintenanceMode,
    maintenanceMessage,
    loading,
    savingAll,
    savingMaintenance,
    defaultLanguage,
    defaultCurrency,
  } = state;

  // Fetch platform settings from DB on mount
  useEffect(() => {
    const fetchSettings = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const res = await apiFetch("/api/platform-settings");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const updates: Partial<State> = {};
            data.forEach((setting: { key: string; value: string }) => {
              switch (setting.key) {
                case "platform_name":
                  if (setting.value) updates.platformName = setting.value;
                  break;
                case "support_email":
                  if (setting.value) updates.supportEmail = setting.value;
                  break;
                case "default_language":
                  if (setting.value) updates.defaultLanguage = setting.value;
                  break;
                case "default_currency":
                  if (setting.value) updates.defaultCurrency = setting.value;
                  break;
                case "maintenance_mode":
                  updates.maintenanceMode = setting.value === "true";
                  break;
                case "maintenance_message":
                  if (setting.value) updates.maintenanceMessage = setting.value;
                  break;
              }
            });
            dispatch({ type: 'SET_DATA', payload: updates });
          }
        }
      } catch {
        toast.error("Failed to load platform settings from database");
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    fetchSettings();
  }, []);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    dispatch({ type: 'SET_SAVING_MAINTENANCE', payload: true });
    try {
      const res = await apiFetch("/api/platform-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "maintenance_mode", value: String(enabled) }),
      });
      if (res.ok) {
        dispatch({ type: 'SET_MAINTENANCE_MODE', payload: enabled });
        toast.success(enabled ? "Maintenance mode activated" : "Maintenance mode deactivated");
      } else {
        toast.error("Failed to update maintenance status");
      }
    } catch {
      toast.error("Failed to connect to platform API");
    } finally {
      dispatch({ type: 'SET_SAVING_MAINTENANCE', payload: false });
    }
  };

  const handleSaveAll = async () => {
    dispatch({ type: 'SET_SAVING_ALL', payload: true });
    try {
      const settingsToSave = [
        { key: "platform_name", value: platformName },
        { key: "support_email", value: supportEmail },
        { key: "default_language", value: defaultLanguage },
        { key: "default_currency", value: defaultCurrency },
        { key: "maintenance_message", value: maintenanceMessage }
      ];

      await Promise.all(
        settingsToSave.map((s) =>
          apiFetch("/api/platform-settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(s),
          })
        )
      );

      toast.success("Settings saved successfully!", {
        description: "All configuration values have been written to the database.",
      });
    } catch {
      toast.error("Error saving platform configurations");
    } finally {
      dispatch({ type: 'SET_SAVING_ALL', payload: false });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="size-8 animate-spin text-teal-600" />
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading platform configurations...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-pink-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
            <Settings className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1>
            <p className="text-teal-50 text-sm opacity-90">
              Configure global platform branding, regional standards, and maintenance states
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* General Configuration Card */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="size-5 text-teal-500" />
              General Preferences
            </CardTitle>
            <CardDescription>
              Core platform configuration that affects branding and display across all school tenants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Name */}
              <div className="space-y-2">
                <Label htmlFor="platform-name" className="text-sm font-semibold">
                  Platform Name
                </Label>
                <Input
                  id="platform-name"
                  value={platformName}
                  onChange={(e) => dispatch({ type: 'SET_PLATFORM_NAME', payload: e.target.value })}
                  placeholder="e.g. SchoolSaaS"
                  className="rounded-xl focus-visible:ring-teal-500"
                />
                <p className="text-xs text-muted-foreground">
                  Displayed on the sidebar, header, and browser document title
                </p>
              </div>

              {/* Support Email */}
              <div className="space-y-2">
                <Label htmlFor="support-email" className="text-sm font-semibold">
                  Support Contact Email
                </Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => dispatch({ type: 'SET_SUPPORT_EMAIL', payload: e.target.value })}
                  placeholder="e.g. support@platform.com"
                  className="rounded-xl focus-visible:ring-teal-500"
                />
                <p className="text-xs text-muted-foreground">
                  Primary support reference address visible to tenant administrators
                </p>
              </div>

              {/* Default Language */}
              <div className="space-y-2">
                <Label htmlFor="default-language" className="text-sm font-semibold">
                  Default System Language
                </Label>
                <Select
                  value={defaultLanguage}
                  onValueChange={(v) => dispatch({ type: 'SET_DEFAULT_LANGUAGE', payload: v })}
                >
                  <SelectTrigger className="w-full rounded-xl focus:ring-teal-500" id="default-language">
                    <SelectValue placeholder="Select platform default language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Spanish (Español)</SelectItem>
                    <SelectItem value="fr">French (Français)</SelectItem>
                    <SelectItem value="de">German (Deutsch)</SelectItem>
                    <SelectItem value="ar">Arabic (العربية)</SelectItem>
                    <SelectItem value="zh">Chinese (Simplified)</SelectItem>
                    <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The initial localization schema fallback loaded for new tenants
                </p>
              </div>

              {/* Default Currency */}
              <div className="space-y-2">
                <Label htmlFor="default-currency" className="text-sm font-semibold">
                  Default Platform Currency
                </Label>
                <Select
                  value={defaultCurrency}
                  onValueChange={(v) => dispatch({ type: 'SET_DEFAULT_CURRENCY', payload: v })}
                >
                  <SelectTrigger className="w-full rounded-xl focus:ring-teal-500" id="default-currency">
                    <SelectValue placeholder="Select platform currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($) - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR (€) - Euro</SelectItem>
                    <SelectItem value="gbp">GBP (£) - British Pound</SelectItem>
                    <SelectItem value="inr">INR (₹) - Indian Rupee</SelectItem>
                    <SelectItem value="aud">AUD (A$) - Australian Dollar</SelectItem>
                    <SelectItem value="cad">CAD (C$) - Canadian Dollar</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Global currency fallback used for subscription plan checkout billing
                </p>
              </div>
            </div>

            <Separator />

            {/* Maintenance Mode Sub-card */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    System Maintenance Mode
                  </Label>
                  <p className="text-xs text-muted-foreground pr-4">
                    When enabled, all non-super-admin portals will display a standard maintenance message.
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={handleMaintenanceToggle}
                  disabled={savingMaintenance}
                  className="data-[state=checked]:bg-teal-500"
                />
              </div>

              {maintenanceMode && (
                <div className="mt-4 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Maintenance Mode is currently active
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5">
                        School administrators, teachers, parents, and students are temporarily blocked from their dashboards.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="maintenance-message" className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                      Maintenance Notice Text
                    </Label>
                    <Textarea
                      id="maintenance-message"
                      value={maintenanceMessage}
                      onChange={(e) => dispatch({ type: 'SET_MAINTENANCE_MESSAGE', payload: e.target.value })}
                      placeholder="e.g. System upgrade in progress. Back online in 20 minutes."
                      className="min-h-[90px] rounded-xl border-amber-200 dark:border-amber-900 focus-visible:ring-amber-500 dark:bg-zinc-900 bg-white"
                    />
                    <p className="text-xs text-amber-600/90 dark:text-amber-400">
                      This message will render directly on the block screen for all public portals.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-4 z-10 mt-8">
        <Card className="shadow-xl border border-teal-100 dark:border-teal-900 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2">
              <div className="size-2 rounded-full bg-teal-500 animate-ping" />
              <span>Changes will be instantly synced to the database.</span>
            </div>
            <Button
              onClick={handleSaveAll}
              disabled={savingAll}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl px-5 py-2.5 shadow-md shadow-teal-600/10 hover:shadow-teal-600/20 transition-all font-semibold"
            >
              {savingAll ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
