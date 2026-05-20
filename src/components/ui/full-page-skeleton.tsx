"use client";

import { Skeleton } from "boneyard-js/react";

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden flex">
      <Skeleton name="full-app-shell" loading={true} color="rgba(0,0,0,0.06)" darkColor="rgba(255,255,255,0.05)" animate="pulse">
        <div />
      </Skeleton>
    </div>
  );
}
