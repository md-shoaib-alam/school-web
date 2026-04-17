import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, CalendarDays, IndianRupee } from "lucide-react";
import { Subscription, statusConfig, paymentMethodConfig, planBadgeConfig } from "./types";
import { format } from "date-fns";

interface TransactionTableProps {
  loading: boolean;
  transactions: Subscription[];
}

export function TransactionTable({ loading, transactions }: TransactionTableProps) {
  return (
    <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-600" /> Recent Transactions
        </CardTitle>
        <CardDescription>
          Latest 20 subscription payments across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableHead className="uppercase tracking-wider text-[10px] font-bold">School / Parent</TableHead>
                <TableHead className="uppercase tracking-wider text-[10px] font-bold text-center">Plan</TableHead>
                <TableHead className="uppercase tracking-wider text-[10px] font-bold text-right">Amount</TableHead>
                <TableHead className="uppercase tracking-wider text-[10px] font-bold text-center">Status</TableHead>
                <TableHead className="uppercase tracking-wider text-[10px] font-bold text-center">Method</TableHead>
                <TableHead className="uppercase tracking-wider text-[10px] font-bold text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : transactions.map((sub) => {
                    const st = statusConfig[sub.status] || statusConfig.active;
                    const meth = paymentMethodConfig[sub.paymentMethod] || paymentMethodConfig.card;
                    const planCfg = planBadgeConfig[sub.planName] || planBadgeConfig.Basic;

                    return (
                      <TableRow key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm">{sub.tenant?.name || "Unknown School"}</div>
                          <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            Paid by {sub.parent?.user?.name || "System"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${planCfg.bg} ${planCfg.text} ${planCfg.border} text-[10px] font-bold`}
                          >
                            {sub.planName}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-foreground">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                            {sub.amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border} text-[10px] font-bold`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${meth.color}`}>
                            {meth.icon}
                            {meth.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-bold text-foreground">
                              {format(new Date(sub.createdAt), "dd MMM yyyy")}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(new Date(sub.createdAt), "HH:mm")}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
