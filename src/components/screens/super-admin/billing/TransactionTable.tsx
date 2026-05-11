import { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Receipt, CalendarDays, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { statusConfig, paymentMethodConfig, planBadgeConfig } from "./types";
import { format, startOfToday, startOfYesterday, endOfYesterday, subDays, endOfToday } from "date-fns";
import { useSubscriptions } from "@/lib/graphql/hooks";

type DateRangeOption = 'today' | 'yesterday' | 'week' | 'all';

export function TransactionTable() {
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const limit = 10;

  const dateParams = useMemo(() => {
    const now = new Date();
    switch(dateRange) {
      case 'today':
        return { 
          startDate: startOfToday().toISOString(), 
          endDate: endOfToday().toISOString() 
        };
      case 'yesterday':
        return { 
          startDate: startOfYesterday().toISOString(), 
          endDate: endOfYesterday().toISOString() 
        };
      case 'week':
        return { 
          startDate: subDays(startOfToday(), 7).toISOString(), 
          endDate: endOfToday().toISOString() 
        };
      default:
        return {};
    }
  }, [dateRange]);

  const { data, isLoading: loading } = useSubscriptions({
    page,
    limit,
    ...dateParams
  });

  const handleRangeChange = (range: DateRangeOption) => {
    setDateRange(range);
    setPage(1);
  };

  const subscriptions = data?.subscriptions || [];
  const totalPages = data?.totalPages || 1;

  const totalCount = data?.total ?? 0;

  return (
    <Card className="shadow-sm border-none bg-white dark:bg-gray-800 animate-in fade-in duration-500">
      <CardHeader className="pb-2 space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" /> Transaction History
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 mt-0.5">
            Total {totalCount} {dateRange === 'all' ? 'total ' : ''}payments records
          </CardDescription>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg w-fit shrink-0">
          {(['all', 'today', 'yesterday', 'week'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${
                dateRange === range 
                  ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {range === 'week' ? '7 Days' : range}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableHead className="w-[30%] uppercase tracking-wider text-[10px] font-bold">School / Parent</TableHead>
                <TableHead className="w-[15%] uppercase tracking-wider text-[10px] font-bold text-center">Plan</TableHead>
                <TableHead className="w-[15%] uppercase tracking-wider text-[10px] font-bold text-right">Amount</TableHead>
                <TableHead className="w-[15%] uppercase tracking-wider text-[10px] font-bold text-center">Status</TableHead>
                <TableHead className="w-[10%] uppercase tracking-wider text-[10px] font-bold text-center">Method</TableHead>
                <TableHead className="w-[15%] uppercase tracking-wider text-[10px] font-bold text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Receipt className="h-8 w-8 mb-2 opacity-20" />
                      <span className="text-sm font-medium">No transactions found for this period</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => {
                  const st = statusConfig[sub.status] || statusConfig.active;
                  const meth = paymentMethodConfig[sub.paymentMethod] || paymentMethodConfig.card;
                  const planCfg = planBadgeConfig[sub.planName] || planBadgeConfig.Basic;

                  return (
                    <TableRow key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors h-14">
                      <TableCell>
                        <div className="font-bold text-sm truncate max-w-[180px]">{sub.tenant?.name || "Unknown School"}</div>
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
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border} text-[10px] font-bold mx-auto`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold ${meth.color}`}>
                          {meth.icon}
                          <span className="hidden md:inline">{meth.label}</span>
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
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2 py-4 border-t border-gray-100 dark:border-gray-700 mt-2">
          <p className="text-xs font-bold text-muted-foreground">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 border-gray-200 dark:border-gray-700 shadow-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold w-8 h-8 rounded-md border border-emerald-200 dark:border-emerald-800">
              {page}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 p-0 border-gray-200 dark:border-gray-700 shadow-none"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
