import React, { SetStateAction } from "react";
import { IMemoCard, Orientation } from "@/lib/types";
import clsx from "clsx";
import { motion } from "framer-motion";
import TinyCardContent from "./CardContent";

const TinyCard = ({
  index,
  cards,
  setSelectedCard,
}: {
  index: number;
  cards: IMemoCard[];
  setSelectedCard: (value: SetStateAction<IMemoCard | null>) => void;
}) => {
  return (
    <motion.li
      layoutId={`card-${index}`}
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
            "card-front absolute top-0 left-0 w-full h-full p-1 z-[-1] border border-black bg-gray-100 dark:bg-gray-600 backface-hidden"
          )}
          onClick={() => {
            setSelectedCard(cards[index]);
          }}
        >
          <TinyCardContent
            cards={cards}
            index={index}
            orientation={Orientation.Front}
          />
        </motion.button>
        <motion.button
          className={clsx(
            "card-back absolute top-0 left-0 w-full h-full p-1 z-[-1] border border-black bg-gray-300 dark:bg-gray-800 backface-hidden"
          )}
          onClick={() => {
            setSelectedCard(cards[index]);
          }}
          style={{ rotateY: 180 }}
        >
          <TinyCardContent
            cards={cards}
            index={index}
            orientation={Orientation.Back}
          />
        </motion.button>
      </div>
    </motion.li>
  );
};

export default TinyCard;
