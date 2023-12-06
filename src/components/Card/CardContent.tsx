"use client";
import clsx from "clsx";
import React, { useMemo } from "react";
import styles from "../../app/page.module.scss";
import { IMemoCard, Orientation } from "@/lib/types";
import parse from "html-react-parser";

const TinyCardContent = ({
  cards,
  index,
  orientation,
}: {
  cards: IMemoCard[];
  index: number;
  orientation: Orientation;
}) => {
  const card = useMemo(() => {
    return orientation === Orientation.Front
      ? cards[index].front
      : cards[index].back;
  }, [cards, index, orientation]);

  return (
    <div
      className={clsx(
        styles["render-card"],
        card.length > 50 ? "text-xs leading-4" : "text-sm"
      )}
    >
      {parse(card)}
    </div>
  );
};

export default TinyCardContent;
