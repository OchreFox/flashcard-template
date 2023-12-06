"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Variants, motion } from "framer-motion";
import { getOppositeOrientation, getTranslatedOrientation } from "@/lib/shared";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Trash, Undo2, Save } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import StyledButton from "../Button/Button";
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
import { Dialog, DialogClose, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IMemoCard, Orientation } from "@/lib/types";
import clsx from "clsx";
import { useCardStore } from "@/lib/store";
import imageCompression from "browser-image-compression";

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

const alertMessages = {
  save: "Se perderán los cambios no guardados.",
  clear: "Se perderá el contenido del lado actual.",
  close: "Se perderán los cambios no guardados.",
};

const image_upload_handler = (blobInfo: any, progress: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const id = nanoid();
    console.log("id", id);

    // Read image blob
    const reader = new FileReader();
    reader.readAsDataURL(blobInfo.blob());

    // Compression options
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (!base64String) reject(new Error("Error while reading image blob"));
      console.log("Original image size:", base64String.length / 1024, "KB");
      // Compress image
      const file = await imageCompression.getFilefromDataUrl(base64String, id);
      const compressedFile = await imageCompression(file, options);
      const compressedBase64 = await imageCompression.getDataUrlFromFile(
        compressedFile
      );
      console.log(
        "Compressed image size:",
        compressedBase64.length / 1024,
        "KB"
      );
      if (compressedBase64) {
        resolve(compressedBase64);
      } else {
        reject(new Error("Error while compressing image"));
      }
    };
  });

const MemoCard = ({
  cardId,
  initialOrientation,
  open,
  onClose,
  onSave,
}: {
  cardId: number;
  initialOrientation: Orientation;
  open: boolean;
  onClose: () => void;
  onSave: (card: IMemoCard) => void;
}) => {
  const { cards } = useCardStore();
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  const initialTextRef = useRef<string>("");
  const hasPendingChanges = useRef<boolean>(false);
  const pendingFunction = useRef<() => void>(() => {});
  const [card, setCard] = useState<IMemoCard | null>(null);
  const [text, setText] = useState<string>(initialTextRef.current);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [currentOrientation, setCurrentOrientation] =
    useState<Orientation>(initialOrientation);
  const { toast } = useToast();

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
    setCurrentOrientation(newOrientation);
    setText(
      newOrientation === Orientation.Front
        ? card?.front ?? ""
        : card?.back ?? ""
    );
    hasPendingChanges.current = false;
  };

  const handleFlip = () => {
    setAlertMessage(alertMessages.save);
    checkForPendingChanges(onFlip);
  };

  const onClear = () => {
    const newCard = {
      id: cardId,
      front: currentOrientation === Orientation.Front ? "" : card?.front ?? "",
      back: currentOrientation === Orientation.Back ? "" : card?.back ?? "",
    };
    setCard(newCard);
    setText("");
    onSave(newCard);
    hasPendingChanges.current = false;
    pendingFunction.current = () => {};
    toast({
      variant: "destructive",
      description: "Lado limpiado",
    });
  };

  const handleClear = () => {
    hasPendingChanges.current = true;
    setAlertMessage(alertMessages.clear);
    checkForPendingChanges(onClear);
  };

  const handleClose = useCallback(() => {
    setAlertMessage(alertMessages.close);
    checkForPendingChanges(onClose);
  }, [onClose]);

  const saveCard = () => {
    if (card) {
      const newText = editorRef.current?.getContent() ?? "";
      setText(newText);
      const newCard = {
        ...card,
        [currentOrientation === Orientation.Front ? "front" : "back"]: newText,
      };
      setCard(newCard);
      onSave(newCard);
      hasPendingChanges.current = false;
      pendingFunction.current = () => {};
      toast({
        description: "Tarjeta guardada",
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
      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
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
      <Dialog open={open}>
        <DialogPortal>
          {/* Background Overlay */}
          <DialogPrimitive.Overlay asChild>
            <motion.div
              className="fixed w-full h-full bg-black bg-opacity-50 inset-0 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              style={{ zIndex: 10 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </DialogPrimitive.Overlay>
          {/* Card with layout animation to transition to the card in the grid on reveal */}
          <DialogPrimitive.Content className="fixed top-0 left-0 w-full h-full flex items-center justify-center p-20 z-[50]">
            <motion.div
              layoutId={`card-${cardId}`}
              layout
              className="w-full h-full shadow-xl rounded-lg flex flex-col items-center p-4 relative z-0"
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
                <Button
                  variant="secondary"
                  onClick={handleFlip}
                  className="items-center flex"
                >
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
                  <span className="ml-2">Girar</span>
                </Button>
                {/* Card Orientation */}
                <p className="mt-2 font-bold text-sm text-gray-100">
                  {getTranslatedOrientation(currentOrientation)}
                </p>
                {/* Close Button */}
                <DialogClose asChild>
                  <Button variant="outline" size="icon" onClick={handleClose}>
                    <IconX />
                  </Button>
                </DialogClose>
              </div>
              <motion.div
                className="w-full flex-1 mt-4"
                variants={textAreaVariants}
                initial="initial"
                animate={
                  currentOrientation === Orientation.Back ? "flip" : "unflip"
                }
              >
                {/* <Textarea
              className="w-full h-full"
              placeholder="Escibe aquí..."
              value={text}
              onChange={(e) => updateText(e.target.value)}
            /> */}
                <Editor
                  tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  initialValue={text}
                  onDirty={(e) => {
                    if (e.target.getContent() !== initialTextRef.current) {
                      hasPendingChanges.current = true;
                    } else {
                      hasPendingChanges.current = false;
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.getContent() !== initialTextRef.current) {
                      hasPendingChanges.current = true;
                    } else {
                      hasPendingChanges.current = false;
                    }
                  }}
                  init={{
                    height: 420,
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "autoresize",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "preview",
                      "help",
                      "wordcount",
                    ],
                    min_height: 200,
                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "image |" +
                      "removeformat | help",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    images_upload_handler: image_upload_handler,
                  }}
                />
              </motion.div>
              <div className="flex gap-4 mt-4">
                <button onClick={log}>Log editor content</button>
                <StyledButton variant="warning" onClick={handleClear}>
                  <Trash className="mr-2 h-5 w-5" />
                  Limpiar
                </StyledButton>
                <StyledButton onClick={saveCard}>
                  <Save className="mr-2 h-5 w-5" />
                  Guardar
                </StyledButton>
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default MemoCard;
