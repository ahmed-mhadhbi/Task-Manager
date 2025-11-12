"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ArrowLeft, Plus } from "lucide-react";
import { projectsApi, tasksApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { TaskStatus, type BoardColumns } from "@/types";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm, TaskFormValues } from "@/components/tasks/task-form";

const STATUS_META: Record<
  TaskStatus,
  {
    title: string;
    description: string;
    accent: string;
  }
> = {
  TODO: {
    title: "To Do",
    description: "Ideas and tasks waiting to be started",
    accent: "border-blue-200 bg-blue-50/50",
  },
  IN_PROGRESS: {
    title: "In Progress",
    description: "Work happening right now",
    accent: "border-amber-200 bg-amber-50/60",
  },
  DONE: {
    title: "Done",
    description: "Celebrate the wins",
    accent: "border-emerald-200 bg-emerald-50/60",
  },
};

const COLUMN_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export default function ProjectBoardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params?.id;
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState<BoardColumns | null>(null);
  const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getWithTasks(token ?? "", projectId),
    enabled: Boolean(token && projectId),
  });

  const boardQuery = useQuery({
    queryKey: ["project", projectId, "board"],
    queryFn: () => tasksApi.board(token ?? "", projectId),
    enabled: Boolean(token && projectId),
  });

  useEffect(() => {
    if (boardQuery.data) {
      startTransition(() => setColumns(boardQuery.data));
    }
  }, [boardQuery.data]);

  const createTaskMutation = useMutation({
    mutationFn: (values: TaskFormValues) => tasksApi.create(token ?? "", projectId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId, "board"] });
      setActiveColumn(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) => tasksApi.update(token ?? "", id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId, "board"] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.remove(token ?? "", id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId, "board"] }),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
      tasksApi.move(token ?? "", id, { status, position }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId, "board"] });
    },
  });

  const taskStats = useMemo(() => {
    if (!columns) return { total: 0 };
    return {
      total: Object.values(columns).flat().length,
    };
  }, [columns]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !columns) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    if (
      sourceStatus === destinationStatus &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceTasks = Array.from(columns[sourceStatus] ?? []);
    const destinationTasks =
      sourceStatus === destinationStatus
        ? sourceTasks
        : Array.from(columns[destinationStatus] ?? []);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    if (!movedTask) return;

    const updatedTask = { ...movedTask, status: destinationStatus };
    destinationTasks.splice(destination.index, 0, updatedTask);

    const nextColumns: BoardColumns = {
      ...columns,
      [sourceStatus]: sourceStatus === destinationStatus ? destinationTasks : sourceTasks,
      [destinationStatus]: destinationTasks,
    };

    setColumns(nextColumns);
    moveTaskMutation.mutate({
      id: draggableId,
      status: destinationStatus,
      position: destination.index,
    });
  };

  if (!projectId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="gap-2" onClick={() => router.push("/")}>
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Button>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Project</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {isProjectLoading ? "Loading..." : project?.name}
        </h1>
        {project?.description && <p className="mt-3 max-w-2xl text-sm text-slate-600">{project.description}</p>}
        <div className="mt-6 flex gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Tasks</p>
            <p className="text-2xl font-semibold text-slate-900">{taskStats.total}</p>
          </div>
        </div>
      </section>

      <DragDropContext onDragEnd={handleDragEnd}>
        <section className="grid gap-6 md:grid-cols-3">
          {COLUMN_ORDER.map((status) => {
            const info = STATUS_META[status];
            const tasks = columns?.[status] ?? [];

            return (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[420px] flex-col rounded-2xl border-2 p-5 shadow-sm ${info.accent}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">{info.title}</h2>
                        <p className="text-xs text-slate-500">{info.description}</p>
                      </div>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-slate-600 shadow">
                        {tasks.length}
                      </span>
                    </div>

                    <div className="mt-4 flex-1 space-y-4">
                      {tasks.map((task, index) => (
                        <Draggable draggableId={task.id} index={index} key={task.id}>
                          {(dragProvided) => (
                            <TaskCard
                              task={task}
                              provided={dragProvided}
                              onUpdate={async (id, values) => {
                                await updateTaskMutation.mutateAsync({ id, values });
                              }}
                              onDelete={async (id) => {
                                await deleteTaskMutation.mutateAsync(id);
                              }}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    {activeColumn === status ? (
                      <div className="mt-4 rounded-xl border border-slate-300 bg-white p-4">
                        <TaskForm
                          defaultValues={{ title: "", description: "", status }}
                          submitLabel={createTaskMutation.isPending ? "Adding..." : "Add task"}
                          onCancel={() => setActiveColumn(null)}
                          onSubmit={async (values) => {
                            await createTaskMutation.mutateAsync(values);
                          }}
                        />
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="mt-4 w-full gap-2 bg-white/60"
                        onClick={() => setActiveColumn(status)}
                      >
                        <Plus className="h-4 w-4" />
                        Add task
                      </Button>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
        </section>
      </DragDropContext>
    </div>
  );
}

