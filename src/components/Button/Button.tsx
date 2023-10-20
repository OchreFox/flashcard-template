"use client";
import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { Variants, motion } from "framer-motion";

import styles from "./button.module.scss";

// Button variants
export const ButtonVariants = {
  primary: "primary",
  secondary: "secondary",
  warning: "warning",
  action: "action",
};

const getButtonVariant = (variant: string) => {
  switch (variant) {
    case ButtonVariants.primary:
      return styles.primary;
    case ButtonVariants.secondary:
      return styles.secondary;
    case ButtonVariants.warning:
      return styles.warning;
    case ButtonVariants.action:
      return styles.action;
    default:
      return styles.primary;
  }
};

const buttonTransition = {
  type: "spring",
  stiffness: 800,
  damping: 25,
};

const buttonEase = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.2,
};

const bgButtonVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
    transition: buttonTransition,
  },
  hover: {
    x: "-0.25rem",
    y: "0.25rem",
    transition: buttonTransition,
  },
  pressed: {
    x: "-0.25rem",
    y: "0.25rem",
    transition: buttonTransition,
  },
  active: {
    x: "-0.5rem",
    y: "0.5rem",
    transition: buttonTransition,
  },
  error: {
    x: ["-0.15rem", "0.15rem", "-0.15rem", "0.15rem", "-0.15rem", "0rem"],
    y: ["0.15rem", "0rem", "-0.15rem", "0rem", "0.15rem", "0rem"],
    transition: buttonEase,
  },
};

const buttonVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
    transition: buttonTransition,
  },
  hover: {
    x: "0.15rem",
    y: "-0.15rem",
    transition: buttonTransition,
  },
  pressed: {
    x: "-0.15rem",
    y: "0.15rem",
    transition: buttonTransition,
  },
  active: {
    x: "0.25rem",
    y: "-0.25rem",
    transition: buttonTransition,
  },
  error: {
    x: ["-0.15rem", "0.15rem", "-0.15rem", "0.15rem", "-0.15rem", "0rem"],
    y: ["0.15rem", "0rem", "-0.15rem", "0rem", "0.15rem", "0rem"],
    transition: buttonEase,
  },
};

const Button = ({
  variant = ButtonVariants.primary,
  isActive = false,
  isDisabled = false,
  onClick,
  children,
  ...rest
}: {
  variant?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  [x: string]: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getAnimation = useCallback(() => {
    if (isPressed && isDisabled) {
      return "error";
    }
    if (isPressed && !isDisabled) {
      return "pressed";
    }
    if (isActive) {
      return "active";
    }
    if (isHovered && !isDisabled) {
      return "hover";
    }

    return "initial";
  }, [isActive, isDisabled, isHovered, isPressed]);

  return (
    <motion.button
      className="relative z-0"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={() => {
        if (!isDisabled && onClick) {
          onClick();
        }
      }}
      {...rest}
    >
      <motion.div
        className={styles.buttonBackground}
        variants={bgButtonVariants}
        initial="initial"
        animate={getAnimation()}
      />
      <motion.div
        className={clsx(
          "px-4 py-2 border-4 flex flex-row select-none",
          variant && getButtonVariant(variant),
          isActive && styles.active,
          styles.button,
          isDisabled && styles.disabled
        )}
        variants={buttonVariants}
        initial="initial"
        animate={getAnimation()}
      >
        {children}
      </motion.div>
    </motion.button>
  );
};

export default Button;
