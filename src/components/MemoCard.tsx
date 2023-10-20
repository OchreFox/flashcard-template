import React, { useCallback, useEffect, useRef, useState } from "react";
import { Variants, motion } from "framer-motion";
import { getOppositeOrientation, getTranslatedOrientation } from "@/app/page";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import StyledButton from "./Button/Button";
import { Textarea } from "./ui/textarea";
import { Trash, Undo2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { IMemoCard, Orientation } from "@/lib/types";
import clsx from "clsx";
import { useCardStore } from "@/lib/store";

const cardVariants: Variants = {
  flip: {
    rotateY: 180,
  },
  unflip: {
    rotateY: 0,
  },
  initial: {
    rotateY: 0,
  },
};

const textAreaVariants: Variants = {
  flip: {
    rotateY: [0, 90, 0],
    transition: {
      duration: 0.2,
    },
  },
  unflip: {
    rotateY: [0, -90, 0],
    transition: {
      duration: 0.2,
    },
  },
  initial: {
    rotateY: 0,
  },
};

const MemoCard = ({
  cardId,
  initialOrientation,
  onClose,
  onSave,
}: {
  cardId: number;
  initialOrientation: Orientation;
  onClose: () => void;
  onSave: (card: IMemoCard) => void;
}) => {
  const { cards } = useCardStore();
  const initialTextRef = useRef<string>("");
  const hasPendingChanges = useRef<boolean>(false);
  const pendingFunction = useRef<() => void>(() => {});
  const [card, setCard] = useState<IMemoCard | null>(null);
  const [text, setText] = useState<string>(initialTextRef.current);
  const [showAlert, setShowAlert] = useState(false);
  const [currentOrientation, setCardOrientation] =
    useState<Orientation>(initialOrientation);
  const { toast } = useToast();

  const updateText = (newText: string) => {
    setText(newText);
    hasPendingChanges.current = true;
  };

  const checkForPendingChanges = (func: () => void = () => {}) => {
    if (hasPendingChanges.current) {
      setShowAlert(true);
      pendingFunction.current = func;
    } else {
      func();
    }
  };

  const onFlip = () => {
    const newOrientation = getOppositeOrientation(currentOrientation);
    setCardOrientation(newOrientation);
    setText(
      newOrientation === Orientation.Front
        ? card?.front ?? ""
        : card?.back ?? ""
    );
    hasPendingChanges.current = false;
  };

  const handleFlip = () => {
    checkForPendingChanges(onFlip);
  };

  const onClear = () => {
    const newCard = {
      id: cardId,
      front: "",
      back: "",
    };
    setCard(newCard);
    setText("");
    onSave(newCard);
    hasPendingChanges.current = false;
    pendingFunction.current = () => {};
  };

  const handleClear = () => {
    checkForPendingChanges(onClear);
  };

  const handleClose = useCallback(() => {
    checkForPendingChanges(onClose);
  }, [onClose]);

  const saveCard = () => {
    if (card) {
      const newCard = {
        ...card,
        [currentOrientation === Orientation.Front ? "front" : "back"]: text,
      };
      setCard(newCard);
      onSave(newCard);
      hasPendingChanges.current = false;
      pendingFunction.current = () => {};
      toast({
        description: "Card Saved",
      });
    }
  };

  // Initialize card
  useEffect(() => {
    const card = cards.find((c) => c.id === cardId);
    // Check if card has changed
    if (card) {
      setCard(card);
      setText(
        currentOrientation === Orientation.Front ? card.front : card.back
      );
      if (initialOrientation === Orientation.Front) {
        initialTextRef.current = card.front;
      } else {
        initialTextRef.current = card.back ?? "";
      }
    }
  }, [cardId, cards, currentOrientation, initialOrientation]);

  // Listen for ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [handleClose]);

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderán los cambios no guardados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                pendingFunction.current = () => {};
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingFunction.current();
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Card with layout animation to transition to the card in the grid on reveal */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
        style={{ zIndex: 20 }}
      >
        <motion.div
          layoutId={`card-${cardId}`}
          layout
          className="w-96 h-96 shadow-xl rounded-lg flex flex-col items-center justify-between p-4 relative z-0"
        >
          {/* Card Background */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate={
              currentOrientation === Orientation.Back ? "flip" : "unflip"
            }
            className={clsx(
              "absolute top-0 left-0 w-full h-full rounded-lg z-[-1]",
              currentOrientation === Orientation.Front
                ? "bg-gradient-to-br from-blue-400 to-purple-500"
                : "bg-gradient-to-br from-pink-400 to-red-500"
            )}
          />
          <div className="flex items-center justify-between w-full">
            {/* Flip Button */}
            <Button variant="secondary" size="icon" onClick={handleFlip}>
              <motion.span
                className="inline-block transform origin-center"
                animate={
                  currentOrientation === Orientation.Front
                    ? { rotateY: 0 }
                    : { rotateY: 180 }
                }
              >
                <Undo2 className="h-4 w-4" />
              </motion.span>
            </Button>
            {/* Clear card Button */}
            <Button variant="destructive" onClick={handleClear}>
              <Trash className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
            {/* Close Button */}
            <Button variant="outline" size="icon" onClick={handleClose}>
              <IconX />
            </Button>
          </div>
          <motion.div
            className="w-full h-40 mt-4"
            variants={textAreaVariants}
            initial="initial"
            animate={
              currentOrientation === Orientation.Back ? "flip" : "unflip"
            }
          >
            <Textarea
              className="w-full h-full"
              placeholder="Escibe aquí..."
              value={text}
              onChange={(e) => updateText(e.target.value)}
            />
          </motion.div>
          <p className="mt-2 font-bold text-sm text-gray-100">
            {getTranslatedOrientation(currentOrientation)}
          </p>
          <StyledButton onClick={saveCard}>Guardar</StyledButton>
        </motion.div>
      </motion.div>
    </>
  );
};

export default MemoCard;
