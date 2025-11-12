"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFeedback } from "@/components/form-feedback";
import { TaskStatus } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters"),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"] as [TaskStatus, TaskStatus, TaskStatus]),
});

export type TaskFormValues = z.infer<typeof schema>;

interface TaskFormProps {
  defaultValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({ defaultValues, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = handleSubmit(async (values) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="space-y-4" onSubmit={submitHandler}>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="title">
          Title
        </label>
        <Input id="title" placeholder="Add task title" {...register("title")} />
        {errors.title?.message && <FormFeedback message={errors.title.message} />}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="description">
          Description
        </label>
        <Textarea id="description" rows={3} placeholder="Add details (optional)" {...register("description")} />
        {errors.description?.message && <FormFeedback message={errors.description.message} />}
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          {...register("status")}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>
      <FormFeedback message={error ?? undefined} />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

