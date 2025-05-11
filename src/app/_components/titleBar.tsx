"use client";

import { Button } from "~/components/ui/button";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { client } from "~/server";
import { useRouter, usePathname } from "next/navigation";
import { useNewPageStore } from "../projects/new/newPageStore";
import { getTemplateDataById } from "../projects/get-client";

export function TitleBar(props: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const isNewPage = pathname === "/projects/new";
  const isTemplatesPage = pathname === "/templates";
  const isProjectsPage = pathname === "/projects";

  return (
    <div className="flex w-full items-center justify-between py-2">
      <span className="text-lg font-medium">{props.title}</span>
      <div className="flex gap-2">
        {isNewPage && <NewProjectPageButtons />}
        {isProjectsPage && (
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => {
              router.push("/projects/new");
            }}
          >
            Create New
          </Button>
        )}
        {isTemplatesPage && <TemplatesPageButton />}
      </div>
    </div>
  );
}

function TemplatesPageButton() {
  const setTitleInput = useNewPageStore((state) => state.setTitleInput);
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () =>
      client.api.templates.$post({ json: {} }).then((res) => {
        if (!res.ok) throw new Error("Failed to create template");
        return res.json();
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      setTitleInput("Untitled");
      const id = (response as { id: number }).id;
      window.open(`/editor/template/${id}`, "_blank");
    },
  });
  return (
    <Button size="sm" className="rounded-full" onClick={() => void mutate()}>
      Create Blank
    </Button>
  );
}

function NewProjectPageButtons() {
  const router = useRouter();
  const selectedTemplate = useNewPageStore((state) => state.selectedTemplate);
  const projectTitle = useNewPageStore((state) => state.titleInput);
  const { data: qData } = useQuery(getTemplateDataById(selectedTemplate));
  const template = qData?.template;

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: () => {
      if (!selectedTemplate || !template) {
        throw new Error("Template ID is required");
      }

      return client.api.projects
        .$post({
          json: {
            name: projectTitle,
            templateId: selectedTemplate,
            data: template.data,
            templateOwnerId: template.ownerId,
            isTemplateEditable: template.isEditable,
          },
        })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to create project");
          return res.json();
        });
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      const id = (response as { id: number }).id;
      window.open(`/editor/project/${id}`, "_blank");
      router.push("/projects");
    },
  });

  const handleOnClick = () => {
    void mutate();
  };
  return (
    <>
      <Button
        size="sm"
        className="rounded-full border-2 bg-transparent text-white hover:bg-transparent"
        onClick={() => {
          router.push("/projects");
        }}
      >
        Discard
      </Button>
      <Button
        size="sm"
        className="rounded-full"
        disabled={selectedTemplate === null}
        onClick={() => handleOnClick()}
      >
        Next
      </Button>
    </>
  );
}
