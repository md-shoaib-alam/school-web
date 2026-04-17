import { Globe } from "lucide-react";
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

interface GeneralTabProps {
  platformName: string;
  setPlatformName: (v: string) => void;
  supportEmail: string;
  setSupportEmail: (v: string) => void;
  defaultLanguage: string;
  setDefaultLanguage: (v: string) => void;
  defaultCurrency: string;
  setDefaultCurrency: (v: string) => void;
  maintenanceMode: boolean;
  onMaintenanceToggle: (enabled: boolean) => void;
  savingMaintenance: boolean;
  maintenanceMessage: string;
  setMaintenanceMessage: (v: string) => void;
  onSaveMaintenanceMessage: () => void;
}

export function GeneralTab({
  platformName,
  setPlatformName,
  supportEmail,
  setSupportEmail,
  defaultLanguage,
  setDefaultLanguage,
  defaultCurrency,
  setDefaultCurrency,
  maintenanceMode,
  onMaintenanceToggle,
  savingMaintenance,
  maintenanceMessage,
  setMaintenanceMessage,
  onSaveMaintenanceMessage,
}: GeneralTabProps) {
  return (
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
            <Label htmlFor="platform-name" className="text-sm font-medium">
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
            <Label htmlFor="support-email" className="text-sm font-medium">
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
            <Label htmlFor="default-language" className="text-sm font-medium">
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
            <Label htmlFor="default-currency" className="text-sm font-medium">
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
                <SelectItem value="gbp">GBP (£) - British Pound</SelectItem>
                <SelectItem value="inr">INR (₹) - Indian Rupee</SelectItem>
                <SelectItem value="aud">AUD (A$) - Australian Dollar</SelectItem>
                <SelectItem value="cad">CAD (C$) - Canadian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Maintenance Mode</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, all non-super-admin users will see a maintenance page.
            </p>
          </div>
          <Switch
            checked={maintenanceMode}
            onCheckedChange={onMaintenanceToggle}
            disabled={savingMaintenance}
          />
        </div>

        {maintenanceMode && (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-3">
              <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                ⚠️ Maintenance mode is active. All non-super-admin users are blocked.
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenance-message" className="text-sm font-medium">
                Maintenance Message
              </Label>
              <Textarea
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Enter message for users..."
                className="min-h-[80px]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={onSaveMaintenanceMessage}
              >
                Save Message
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
