import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

export function TicketSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <BoneyardSkeleton
          key={i}
          name="boneyard-card"
          loading={true}
          color="rgba(0,0,0,0.06)"
          darkColor="rgba(255,255,255,0.05)"
          animate="pulse"
        >
          <div className="h-[110px]" />
        </BoneyardSkeleton>
      ))}
    </div>
  );
}
