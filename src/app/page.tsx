"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, stagger, animate } from "framer-motion";
import MemoCard from "@/components/Card/MemoCard";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Bomb, Download, Printer, Undo2, Upload } from "lucide-react";
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
import TinyCard from "@/components/Card/TinyCard";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

  const handleImport = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result;
          if (typeof data === "string") {
            importData(data);
          }
        };
        reader.readAsText(file);
      }
    });
    fileInput.click();
  };

  const importData = (data: string) => {
    const parsedData = JSON.parse(data);
    setRows(parsedData.rows);
    setCols(parsedData.cols);
    if (Array.isArray(parsedData.cards)) {
      setCards(parsedData.cards);
    }
    toast({
      title: "Tarjetas Importadas",
      description: "Se importaron los datos correctamente",
    });
  };

  const exportData = () => {
    // Create a data object with the rows and cols and the cards
    const dataObject = {
      rows,
      cols,
      cards,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dataObject));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tarjetitas.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    toast({
      title: "Tarjetas Exportadas",
      description: "Se exportaron los datos correctamente",
    });
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
            <Button className="mt-8" variant="secondary" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Importar Datos
            </Button>
            <Button className="mt-8" variant="secondary" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Datos
            </Button>
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
                  open={!!selectedCard}
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
                  <TinyCard
                    index={i}
                    key={i}
                    cards={cards}
                    setSelectedCard={setSelectedCard}
                  />
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
