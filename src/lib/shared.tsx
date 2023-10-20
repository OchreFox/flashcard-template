import { Orientation } from "./types";

export const getOppositeOrientation = (orientation: Orientation) => {
  return orientation === Orientation.Front
    ? Orientation.Back
    : Orientation.Front;
};
export const getTranslatedOrientation = (orientation: Orientation) => {
  return orientation === Orientation.Front ? "Frente" : "Reverso";
};
