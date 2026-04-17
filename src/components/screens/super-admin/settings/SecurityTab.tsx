import { Shield, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SecurityTabProps {
  passwordPolicy: string;
  setPasswordPolicy: (v: string) => void;
  twoFactorAuth: boolean;
  setTwoFactorAuth: (v: boolean) => void;
  sessionTimeout: string;
  setSessionTimeout: (v: string) => void;
  ipWhitelist: string;
  setIpWhitelist: (v: string) => void;
}

export function SecurityTab({
  passwordPolicy,
  setPasswordPolicy,
  twoFactorAuth,
  setTwoFactorAuth,
  sessionTimeout,
  setSessionTimeout,
  ipWhitelist,
  setIpWhitelist,
}: SecurityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-500" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Configure platform-wide security policies and authentication requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="password-policy" className="text-sm font-medium flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Password Policy
            </Label>
            <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
              <SelectTrigger className="w-full" id="password-policy">
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic — 6+ characters</SelectItem>
                <SelectItem value="strong">Strong — 8+ chars, mixed case, number</SelectItem>
                <SelectItem value="very-strong">Very Strong — 10+ chars, special chars</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Applied to all new user registrations across tenants
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-timeout" className="text-sm font-medium">
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
              Users will be automatically logged out after this period
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
              Force all users to enable two-factor authentication
            </p>
          </div>
          <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="ip-whitelist" className="text-sm font-medium">
            IP Whitelist
          </Label>
          <Textarea
            id="ip-whitelist"
            placeholder={"192.168.1.0/24\n10.0.0.1"}
            value={ipWhitelist}
            onChange={(e) => setIpWhitelist(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            One IP address or CIDR range per line. Leave empty to allow all IPs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
