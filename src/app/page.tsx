"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, stagger, animate, m } from "framer-motion";
import MemoCard from "@/components/MemoCard";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Bomb, Printer, Undo2 } from "lucide-react";
import { IMemoCard, Orientation } from "@/lib/types";
import { initialArray, useCardStore } from "@/lib/store";
import GridSkeleton from "@/components/GridSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import clsx from "clsx";
import styles from "./page.module.scss";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import * as Portal from "@radix-ui/react-portal";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getOppositeOrientation, getTranslatedOrientation } from "@/lib/shared";

const staggerItems = stagger(0.01, { startDelay: 0.02 });

export default function Home() {
  const { cards, setCards, rows, cols, setRows, setCols, totalCards } =
    useCardStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [selectedCard, setSelectedCard] = useState<IMemoCard | null>(null);
  const [currentOrientation, setCurrentOrientation] = useState<Orientation>(
    Orientation.Front
  );
  const [showAlert, setShowAlert] = useState(false);
  const previousOrientation = useRef<Orientation>(currentOrientation);

  const previousTotalCards = useRef(totalCards);

  const onClose = () => {
    setSelectedCard(null);
  };

  const onFlip = () => {
    const newOrientation = getOppositeOrientation(currentOrientation);
    console.log("Flipperino to the: ", Orientation[newOrientation].toString());
    setCurrentOrientation(newOrientation);
  };

  const onSave = (card: IMemoCard) => {
    console.log("onSave", card);
    setCards(cards.map((c) => (c.id === card.id ? card : c)));
  };

  useEffect(() => {
    if (!hasHydrated) {
      useCardStore.persist.rehydrate();
      setHasHydrated(true);
    }
  }, [hasHydrated, setCards]);

  useEffect(() => {
    console.log("Orientation changed to: ", Orientation[currentOrientation]);
    if (
      previousOrientation.current !== currentOrientation ||
      previousTotalCards.current !== totalCards
    ) {
      previousOrientation.current = currentOrientation;
      previousTotalCards.current = totalCards;
      console.log("Flipping cards");
      animate(
        "div.card-inner",
        currentOrientation === Orientation.Front
          ? {
              rotateY: 0,
            }
          : {
              rotateY: 180,
            },
        {
          duration: 0.2,
          delay: staggerItems,
        }
      );
    }
  }, [currentOrientation, totalCards]);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen px-24 py-8 text-black bg-gray-200 dark:bg-slate-900 dark:text-white">
      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Se borrará todo ALV</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCards(initialArray);
              }}
            >
              Limpiar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="grid w-full grid-cols-3 gap-2 place-items-center">
        {/* Header */}
        <div
          className={clsx(
            "py-4 mx-12 my-4 bg-gradient-to-r from-emerald-500 to-blue-400 to-70% col-start-2 relative z-0",
            styles.header
          )}
        >
          <h1
            className={clsx(
              "text-5xl font-black text-white px-8",
              styles.comic
            )}
          >
            Las Tarjetitas
          </h1>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onFlip}>
            <motion.span
              className="inline-block mr-2 origin-center transform"
              animate={
                currentOrientation === Orientation.Front
                  ? { rotateY: 0 }
                  : { rotateY: 180 }
              }
            >
              <Undo2 className="w-4 h-4" />
            </motion.span>
            Girar al{" "}
            {getTranslatedOrientation(
              getOppositeOrientation(currentOrientation)
            )}
          </Button>
          <ModeToggle />
        </div>
      </div>
      {/* Main View */}
      <div className="flex w-full gap-4">
        {/* Toolbar */}
        {hasHydrated ? (
          <div className="flex flex-col gap-2 w-72">
            <h2 className="text-2xl font-bold">Opciones</h2>
            <Separator />
            <div className="flex justify-between">
              <h3 className="text-xl font-bold">Filas</h3>
              <span className="text-sm font-normal">{rows}</span>
            </div>
            <Slider
              defaultValue={[rows]}
              min={2}
              max={8}
              step={1}
              onValueChange={(value) => setRows(value[0])}
            />
            <div className="flex justify-between mt-4">
              <h3 className="text-xl font-bold">Columnas</h3>
              <span className="text-sm font-normal">{cols}</span>
            </div>
            <Slider
              defaultValue={[cols]}
              min={2}
              max={6}
              step={1}
              onValueChange={(value) => setCols(value[0])}
            />
            <Link className="w-full mt-8" href="/print">
              <Button className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir PDF
              </Button>
            </Link>
            <Button
              className="mt-8"
              variant="destructive"
              onClick={() => {
                setShowAlert(true);
              }}
            >
              <Bomb className="w-4 h-4 mr-2" />
              Limpiar todo
            </Button>
          </div>
        ) : (
          <div className="w-72">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-12 mt-4" />
            <Skeleton className="w-full h-12 mt-4" />
            <Skeleton className="w-full h-10 mt-8" />
            <Skeleton className="w-full h-10 mt-8" />
          </div>
        )}
        {/* Cards */}
        <div className="w-full grow">
          {/* Overlay with a flippable card that the user can click to edit the text on the card,
      And a button to flip the card over to see the back of the card. */}
          <AnimatePresence>
            {selectedCard && (
              <Portal.Root>
                <MemoCard
                  cardId={selectedCard.id}
                  initialOrientation={currentOrientation}
                  onClose={onClose}
                  onSave={onSave}
                />
              </Portal.Root>
            )}
          </AnimatePresence>

          {hasHydrated ? (
            <motion.ul
              className="grid gap-2 bg-white border border-gray-900 shadow-xl main-view dark:bg-gray-700"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: totalCards }).map((_, i) => {
                return (
                  <motion.li
                    key={i}
                    layoutId={`card-${i}`}
                    layout
                    className="relative z-0 inline-flex items-center justify-center flip-card hover:shadow-xl hover:ring-blue-500 hover:ring-2 hover:border-blue-800"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute w-full h-full card-inner">
                      {/* Card background */}
                      <motion.button
                        className={clsx(
                          "card-front absolute top-0 left-0 w-full h-full p-1 z-[-1] border border-black bg-gray-100 dark:bg-gray-600 backface-hidden text-left",
                          styles["fluid-card"]
                        )}
                        onClick={() => {
                          setSelectedCard(cards[i]);
                        }}
                      >
                        <p
                          className={clsx(
                            "w-full h-full",
                            cards[i].front.length > 50 ? "text-xs" : "text-sm"
                          )}
                        >
                          {cards[i].front}
                        </p>
                      </motion.button>
                      <motion.button
                        className={clsx(
                          "card-back absolute top-0 left-0 w-full h-full p-1 z-[-1] border border-black bg-gray-300 dark:bg-gray-800 backface-hidden text-left",
                          styles["fluid-card"]
                        )}
                        onClick={() => {
                          setSelectedCard(cards[i]);
                        }}
                        style={{ rotateY: 180 }}
                      >
                        <p
                          className={clsx(
                            "w-full h-full",
                            cards[i].back.length > 50 ? "text-xs" : "text-sm"
                          )}
                        >
                          {cards[i].back}
                        </p>
                      </motion.button>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : (
            <ul className="grid grid-cols-6 gap-2 bg-white border border-gray-900 shadow-xl main-view dark:bg-gray-700 grid-rows-8">
              <GridSkeleton />
            </ul>
          )}
        </div>
        <div className="w-72"></div>
      </div>
    </main>
  );
}
