"use client";

import { Users } from "lucide-react";

export function ParentsEmptyState() {
  return (
    <div className="text-center py-20 bg-muted rounded-2xl border-dashed border-2">
      <Users className="size-12 mx-auto mb-4 opacity-20" />
      <p className="text-lg font-medium">No parents found</p>
      <p className="text-sm text-muted-foreground">Add a parent or adjust your search</p>
    </div>
  );
}
