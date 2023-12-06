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
import { ArrowLeftCircle, Info, Printer } from "lucide-react";
import clsx from "clsx";
import styles from "../page.module.scss";
import { Orientation } from "@/lib/types";
import TinyCardContent from "@/components/Card/CardContent";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className={clsx("flex flex-col", styles.print)}>
      <div className="flex gap-4 items-center justify-center">
        <Card className=" my-4 print:hidden">
          <CardHeader>
            <CardTitle>Imprime esta página,</CardTitle>
            <CardDescription>Y guárdala como PDF</CardDescription>
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
        <div className="flex flex-col gap-4">
          <Button
            variant="default"
            className="self-center print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Link href="/" className="inline-flex items-center justify-center">
            <Button variant="secondary" className="print:hidden">
              <ArrowLeftCircle className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
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
                  <TinyCardContent
                    cards={cards}
                    index={i}
                    orientation={Orientation.Front}
                  />
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
                  <TinyCardContent
                    cards={cards}
                    index={i}
                    orientation={Orientation.Back}
                  />
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
