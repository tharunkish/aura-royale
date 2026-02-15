import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const randomRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Simple confetti wrapper if needed in utils, but component usage is fine
export const triggerWin = (amount) => {
   // Placeholder for global win effect
};
