import { Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApiTabProps {
  rateLimit: string;
  setRateLimit: (v: string) => void;
  webhookUrl: string;
  setWebhookUrl: (v: string) => void;
}

export function ApiTab({
  rateLimit,
  setRateLimit,
  webhookUrl,
  setWebhookUrl,
}: ApiTabProps) {
  return (
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
            Platform events will be sent to this URL
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Webhook Events</p>
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
              <Badge key={event} variant="secondary" className="text-[10px] font-mono">
                {event}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
