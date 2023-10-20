"use client";
import GridSkeleton from "@/components/GridSkeleton";
import { useCardStore } from "@/lib/store";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Kbd } from "flowbite-react";
import { Info } from "lucide-react";

const Print = () => {
  const { cards, rows, cols, totalCards } = useCardStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      useCardStore.persist.rehydrate();
      setHasHydrated(true);
    }
  }, [hasHydrated]);

  return (
    <div className="flex flex-col">
      <Card className="self-center mt-4 print:hidden">
        <CardHeader>
          <CardTitle>Imprime esta página,</CardTitle>
          <CardDescription>O guárdala como PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Pro Tip</AlertTitle>
            <AlertDescription>
              <p>
                Presiona <Kbd>Ctrl</Kbd>+<Kbd>P</Kbd>, y elige &quot;Guardar
                como PDF&quot;.
              </p>
              <br />
              <p>
                <strong>Nota:</strong> Establece los márgenes a 0, y elige la
                escala al 100%.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      <ul
        className="main-view bg-white grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {hasHydrated ? (
          Array.from({ length: totalCards }).map((_, i) => {
            return (
              <li
                key={i}
                className="inline-flex items-center justify-center relative z-0 flip-card text-black border border-black bg-white"
              >
                <div className="w-full h-full flex items-center justify-center text-center">
                  {cards[i].front}
                </div>
              </li>
            );
          })
        ) : (
          <GridSkeleton />
        )}
      </ul>
      <div className="pagebreak" />
      <ul
        className="main-view bg-white grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {hasHydrated ? (
          Array.from({ length: totalCards }).map((_, i) => {
            return (
              <li
                key={i}
                className="inline-flex items-center justify-center relative z-0 flip-card text-black border border-black bg-white"
              >
                <div className="w-full h-full flex items-center justify-center text-center">
                  {cards[i].back}
                </div>
              </li>
            );
          })
        ) : (
          <GridSkeleton />
        )}
      </ul>
    </div>
  );
};

export default Print;
