"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { projectsApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ProjectForm, ProjectFormValues } from "@/components/projects/project-form";
import { ProjectCard } from "@/components/projects/project-card";
import type { Project } from "@/types";

export default function DashboardPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(token ?? ""),
    enabled: Boolean(token),
  });

  const createMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => projectsApi.create(token ?? "", values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProjectFormValues }) => projectsApi.update(token ?? "", id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.remove(token ?? "", id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const enhancedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.map((project) => ({
      ...project,
      taskCount: undefined as number | undefined,
    }));
  }, [projects]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Hi {user?.name ?? user?.email}, let&apos;s get organized</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Create projects and manage their tasks across To Do, In Progress, and Done columns. Drag &amp; drop tasks to keep momentum.
          </p>
        </div>
        <Button
          className="w-full gap-2 md:w-auto"
          onClick={() => {
            const form = document.getElementById("create-project") as HTMLFormElement | null;
            form?.scrollIntoView({ behavior: "smooth", block: "start" });
            form?.querySelector<HTMLInputElement>("input[name='name']")?.focus();
          }}
        >
          <PlusCircle className="h-5 w-5" />
          New project
        </Button>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div id="create-project" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Create a project</h2>
          <p className="mt-1 text-sm text-slate-500">Group related tasks together in a shared Kanban board.</p>
          <div className="mt-4">
            <ProjectForm
              submitLabel={createMutation.isPending ? "Creating..." : "Create project"}
              onSubmit={async (values) => {
                await createMutation.mutateAsync(values);
              }}
            />
            {createMutation.isError && (
              <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create project."}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Projects overview</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your existing projects below.</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-blue-50 px-4 py-3">
              <dt className="text-blue-600">Projects</dt>
              <dd className="mt-1 text-2xl font-semibold text-blue-700">{projects?.length ?? 0}</dd>
            </div>
            <div className="rounded-lg bg-emerald-50 px-4 py-3">
              <dt className="text-emerald-600">Your role</dt>
              <dd className="mt-1 text-2xl font-semibold text-emerald-700">Owner</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">All projects</h2>
          {isLoading && <span className="text-sm text-slate-500">Loading projects...</span>}
          {error && (
            <span className="text-sm text-rose-600">
              {error instanceof Error ? error.message : "Failed to load projects."}
            </span>
          )}
        </div>

        {enhancedProjects.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
            <p className="text-lg font-medium">No projects yet</p>
            <p className="mt-2 text-sm">Create your first project to start organizing tasks.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {enhancedProjects.map((project: Project & { taskCount?: number }) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={async (id, values) => {
                  await updateMutation.mutateAsync({ id, values });
                }}
                onDelete={async (id) => {
                  await deleteMutation.mutateAsync(id);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

