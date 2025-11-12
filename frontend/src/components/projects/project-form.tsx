"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFeedback } from "@/components/form-feedback";

const schema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().max(500).optional(),
});

export type ProjectFormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  defaultValues?: ProjectFormValues;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function ProjectForm({ defaultValues, submitLabel, onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
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
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="space-y-4" onSubmit={submitHandler}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
          Name
        </label>
        <Input id="name" placeholder="Project name" {...register("name")} />
        {errors.name?.message && <FormFeedback message={errors.name.message} />}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
          Description
        </label>
        <Textarea id="description" rows={3} placeholder="Optional description" {...register("description")} />
        {errors.description?.message && <FormFeedback message={errors.description.message} />}
      </div>
      <FormFeedback message={error ?? undefined} />
      <div className="flex justify-end gap-3">
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

