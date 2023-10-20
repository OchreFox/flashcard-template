import { Skeleton } from "@/components/ui/skeleton";

import React from "react";

const GridSkeleton = () => {
  const totalCards = 48;
  return (
    <>
      {Array.from(Array(totalCards).keys()).map((i) => {
        return (
          <Skeleton
            key={i}
            className="inline-flex items-center justify-center relative z-0 "
          />
        );
      })}
    </>
  );
};

export default GridSkeleton;
