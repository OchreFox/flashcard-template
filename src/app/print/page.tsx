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
import clsx from "clsx";
import styles from "../page.module.scss";

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
            <Info className="w-4 h-4" />
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
        className="grid gap-2 bg-white main-view"
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
                className="relative z-0 inline-flex items-center justify-center text-black bg-white border border-black flip-card"
              >
                <div
                  className={clsx(
                    "flex items-center justify-center w-full h-full text-left",
                    styles["fluid-card"]
                  )}
                >
                  <p
                    className={clsx(
                      cards[i].front.length > 50 ? "text-xs" : "text-sm"
                    )}
                  >
                    {cards[i].front}
                  </p>
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
        className="grid gap-2 bg-white main-view"
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
                className="relative z-0 inline-flex items-center justify-center text-black bg-white border border-black flip-card"
              >
                <div
                  className={clsx(
                    "flex items-center justify-center w-full h-full text-left",
                    styles["fluid-card"]
                  )}
                >
                  <p
                    className={clsx(
                      cards[i].back.length > 50 ? "text-xs" : "text-sm"
                    )}
                  >
                    {cards[i].back}
                  </p>
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
