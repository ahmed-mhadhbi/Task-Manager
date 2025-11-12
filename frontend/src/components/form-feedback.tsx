"use client";

interface FormFeedbackProps {
  message?: string;
  variant?: "error" | "success";
}

export function FormFeedback({ message, variant = "error" }: FormFeedbackProps) {
  if (!message) return null;

  const styles =
    variant === "error"
      ? "rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700"
      : "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700";

  return <p className={styles}>{message}</p>;
}

