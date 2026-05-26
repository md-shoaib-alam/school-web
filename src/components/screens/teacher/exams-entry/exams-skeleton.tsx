import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

export function ExamsSkeleton() {
  return (
    <div className="space-y-4">
      <BoneyardSkeleton
        name="boneyard-card"
        loading={true}
        color="rgba(0,0,0,0.06)"
        darkColor="rgba(255,255,255,0.05)"
        animate="pulse"
      >
        <div className="h-[96px]" />
      </BoneyardSkeleton>
      <BoneyardSkeleton
        name="boneyard-card"
        loading={true}
        color="rgba(0,0,0,0.06)"
        darkColor="rgba(255,255,255,0.05)"
        animate="pulse"
      >
        <div className="h-[48px]" />
      </BoneyardSkeleton>
      <BoneyardSkeleton
        name="boneyard-card"
        loading={true}
        color="rgba(0,0,0,0.06)"
        darkColor="rgba(255,255,255,0.05)"
        animate="pulse"
      >
        <div className="h-[384px]" />
      </BoneyardSkeleton>
    </div>
  );
}
