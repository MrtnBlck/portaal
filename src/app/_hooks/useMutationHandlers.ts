import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EditorData } from "../editor/_utils/editorTypes";
import { client } from "~/server";
import { useRouter } from "next/navigation";

export const useMutationHandlers = (redirectWindow?: "current" | "new") => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: updateProject } = useMutation({
    mutationFn: (props: { projectId: string; data: EditorData }) =>
      client.api.projects[":id"].$patch({
        param: { id: props.projectId },
        json: { data: props.data },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const { mutate: updateTemplate } = useMutation({
    mutationFn: (props: { templateId: string; data: EditorData }) =>
      client.api.templates[":id"].$patch({
        param: { id: props.templateId },
        json: { data: props.data },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const { mutate: createTemplate } = useMutation({
    mutationFn: (props: {
      data: EditorData;
      name: string;
      isPublic?: boolean;
      isEditable?: boolean;
      filterIds?: number[];
    }) =>
      client.api.templates
        .$post({
          json: {
            name: props.name,
            data: props.data,
            isEditable: props.isEditable ?? false,
            isPublic: props.isPublic ?? false,
            filterIds: { filterIds: props.filterIds ?? [] },
          },
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error while creating template");
          }
          return res.json();
        }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (!redirectWindow) return;
      const id = (res as { id: number }).id;
      if (redirectWindow === "new") {
        window.open(`/editor/template/${id}`, "_blank");
      } else if (redirectWindow === "current") {
        router.push(`/editor/template/${id}`);
      }
    },
  });

  const { mutate: createProject } = useMutation({
    mutationFn: (props: {
      name: string;
      templateId: number;
      data: EditorData;
      templateOwnerId: string;
      isTemplateEditable: boolean;
    }) =>
      client.api.projects
        .$post({
          json: props,
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Error while creating project");
          }
          return res.json();
        }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (!redirectWindow) return;
      const id = (res as { id: number }).id;
      if (redirectWindow === "new") {
        window.open(`/editor/project/${id}`, "_blank");
      } else if (redirectWindow === "current") {
        router.push(`/editor/project/${id}`);
      }
    },
  });

  const { mutate: shareProject } = useMutation({
    mutationFn: (props: { projectId: number; userId: string }) =>
      client.api.sharedProjects.$post({ json: props }).then((res) => {
        if (!res.ok) {
          throw new Error("Error while sharing project");
        }
        return res.json();
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sharedProjects"] });
    },
  });

  return {
    updateProject,
    updateTemplate,
    createProject,
    createTemplate,
    shareProject,
  };
};
