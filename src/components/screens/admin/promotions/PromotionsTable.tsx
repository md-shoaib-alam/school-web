"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { PromotionRecord } from "./types";
import { statusConfig } from "./utils";

interface PromotionsTableProps {
  promotions: PromotionRecord[];
  loading: boolean;
  approvingId: string | null;
  handleApprove: (promotion: PromotionRecord) => void;
  openRejectDialog: (promotion: PromotionRecord) => void;
}

export function PromotionsTable({
  promotions,
  loading,
  approvingId,
  handleApprove,
  openRejectDialog,
}: PromotionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Promotion Records</CardTitle>
        <CardDescription>
          {promotions.length} record{promotions.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-full bg-muted animate-pulse rounded"
              />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ArrowRight className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">No promotion records found</p>
            <p className="text-xs mt-1">
              Click &quot;New Promotion&quot; to create one
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Roll No.
                  </TableHead>
                  <TableHead>Class Transfer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Academic Year
                  </TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-36 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                  const config =
                    statusConfig[promo.status] || statusConfig.pending;
                  return (
                    <TableRow
                      key={promo.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold shrink-0">
                            {promo.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">
                            {promo.studentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        #{promo.rollNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Badge
                            variant="outline"
                            className="font-normal whitespace-nowrap"
                          >
                            {promo.fromClassName}
                          </Badge>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Badge
                            variant="outline"
                            className="font-normal whitespace-nowrap"
                          >
                            {promo.toClassName}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {promo.academicYear}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`${config.bg} font-medium`}
                        >
                          {config.icon}
                          <span className="ml-1">{config.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(promo.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {promo.status === "pending" ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleApprove(promo)}
                              disabled={approvingId === promo.id}
                            >
                              {approvingId === promo.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 dark:text-red-400"
                              onClick={() => openRejectDialog(promo)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
