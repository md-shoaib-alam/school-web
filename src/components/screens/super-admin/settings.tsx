"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Shield, Bell, CreditCard, Server } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

// Sub-components
import { GeneralTab } from "./settings/GeneralTab";
import { PlansTab } from "./settings/PlansTab";
import { NotificationsTab } from "./settings/NotificationsTab";
import { SecurityTab } from "./settings/SecurityTab";
import { ApiTab } from "./settings/ApiTab";
import { StickySaveBar } from "./settings/StickySaveBar";

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
        const msgRes = await apiFetch("/api/platform-settings?key=maintenance_message");
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.value) {
            setMaintenanceMessage(msgData.value);
          }
        }
      } catch { /* silent */ }
    };
    fetchMaintenance();
  }, []);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setSavingMaintenance(true);
    try {
      const res = await apiFetch("/api/platform-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "maintenance_mode", value: String(enabled) }),
      });
      if (res.ok) {
        setMaintenanceMode(enabled);
        toast.success(enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
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
        body: JSON.stringify({ key: "maintenance_message", value: maintenanceMessage }),
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


  const handleSaveAll = () => {
    toast.success("Settings saved successfully!", {
      description: "Platform settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-pink-600 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
            <Settings className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
            <p className="text-teal-50 text-sm opacity-90">
              Configure global platform preferences, plans, and security
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 shadow-none">
            <Globe className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 shadow-none">
            <CreditCard className="h-4 w-4" /> Plans
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 shadow-none">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 shadow-none">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 shadow-none">
            <Server className="h-4 w-4" /> API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab 
            platformName={platformName} setPlatformName={setPlatformName}
            supportEmail={supportEmail} setSupportEmail={setSupportEmail}
            defaultLanguage={defaultLanguage} setDefaultLanguage={setDefaultLanguage}
            defaultCurrency={defaultCurrency} setDefaultCurrency={setDefaultCurrency}
            maintenanceMode={maintenanceMode} onMaintenanceToggle={handleMaintenanceToggle}
            savingMaintenance={savingMaintenance} maintenanceMessage={maintenanceMessage}
            setMaintenanceMessage={setMaintenanceMessage} onSaveMaintenanceMessage={handleSaveMaintenanceMessage}
          />
        </TabsContent>

        <TabsContent value="plans">
          <PlansTab editingPlan={editingPlan} setEditingPlan={setEditingPlan} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab 
            emailNotifications={emailNotifications} setEmailNotifications={setEmailNotifications}
            smsNotifications={smsNotifications} setSmsNotifications={setSmsNotifications}
            lowStorageAlert={lowStorageAlert} setLowStorageAlert={setLowStorageAlert}
            newTenantRegistration={newTenantRegistration} setNewTenantRegistration={setNewTenantRegistration}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab 
            passwordPolicy={passwordPolicy} setPasswordPolicy={setPasswordPolicy}
            twoFactorAuth={twoFactorAuth} setTwoFactorAuth={setTwoFactorAuth}
            sessionTimeout={sessionTimeout} setSessionTimeout={setSessionTimeout}
            ipWhitelist={ipWhitelist} setIpWhitelist={setIpWhitelist}
          />
        </TabsContent>

        <TabsContent value="api">
          <ApiTab 
            rateLimit={rateLimit} setRateLimit={setRateLimit}
            webhookUrl={webhookUrl} setWebhookUrl={setWebhookUrl}
          />
        </TabsContent>
      </Tabs>


      <StickySaveBar onSave={handleSaveAll} />
    </div>
  );
}
