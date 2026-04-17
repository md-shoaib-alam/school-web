import { CreditCard, Edit, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { defaultPlans } from "./types";

interface PlansTabProps {
  editingPlan: string | null;
  setEditingPlan: (plan: string | null) => void;
}

export function PlansTab({ editingPlan, setEditingPlan }: PlansTabProps) {
  return (
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
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${plan.color}`}>
                        {plan.icon}
                      </div>
                      <span className="font-semibold text-sm">{plan.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{plan.monthlyPrice}</TableCell>
                  <TableCell className="text-right font-medium">{plan.yearlyPrice}</TableCell>
                  <TableCell className="text-center text-sm">
                    {plan.maxStudents === -1 ? (
                      <Badge variant="secondary" className="text-[10px]">Unlimited</Badge>
                    ) : (
                      plan.maxStudents.toLocaleString()
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {plan.maxTeachers === -1 ? (
                      <Badge variant="secondary" className="text-[10px]">Unlimited</Badge>
                    ) : (
                      plan.maxTeachers
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {plan.maxClasses === -1 ? (
                      <Badge variant="secondary" className="text-[10px]">Unlimited</Badge>
                    ) : (
                      plan.maxClasses
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {plan.features.slice(0, 3).map((f) => (
                        <Badge key={f} variant="outline" className="text-[10px] font-normal">
                          {f}
                        </Badge>
                      ))}
                      {plan.features.length > 3 && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
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
                      onClick={() => setEditingPlan(editingPlan === plan.name ? null : plan.name)}
                    >
                      {editingPlan === plan.name ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Edit className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {editingPlan && (
          <div className="mt-4 p-4 rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="h-4 w-4 text-teal-600" />
              <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
                Editing {editingPlan} plan — full plan editor coming soon
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a demo view. Plan editing will be available in a future release.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
