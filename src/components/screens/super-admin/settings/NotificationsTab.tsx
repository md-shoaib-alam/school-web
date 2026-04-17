import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface NotificationsTabProps {
  emailNotifications: boolean;
  setEmailNotifications: (v: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (v: boolean) => void;
  lowStorageAlert: boolean;
  setLowStorageAlert: (v: boolean) => void;
  newTenantRegistration: boolean;
  setNewTenantRegistration: (v: boolean) => void;
}

export function NotificationsTab({
  emailNotifications,
  setEmailNotifications,
  smsNotifications,
  setSmsNotifications,
  lowStorageAlert,
  setLowStorageAlert,
  newTenantRegistration,
  setNewTenantRegistration,
}: NotificationsTabProps) {
  return (
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
            <Label className="text-sm font-medium">Email Notifications</Label>
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
            <Label className="text-sm font-medium">SMS Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Send SMS alerts for critical events (e.g., downtime, security breaches)
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
            <Label className="text-sm font-medium">Low Storage Alert</Label>
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
            <Label className="text-sm font-medium">New Tenant Registration</Label>
            <p className="text-xs text-muted-foreground">
              Notify admins when a new school or tenant registers on the platform
            </p>
          </div>
          <Switch
            checked={newTenantRegistration}
            onCheckedChange={setNewTenantRegistration}
          />
        </div>
      </CardContent>
    </Card>
  );
}
