"use client";

import { ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useState } from "react";
import { useEditorStore } from "../_utils/editorStore";
import type { FrameElement, TextData } from "../_utils/editorTypes";
import { useFrameStore } from "../_utils/frameStore";
import { useLinkStore } from "../_utils/linkStore";

export function LinkSettings() {
  const [open, setOpen] = useState(false);
  const selectedObject = useEditorStore(
    (state) => state.selectedObject,
  ) as TextData | null;
  const getRoleElements = useFrameStore((state) => state.getRoleElements);
  const addLink = useLinkStore((state) => state.addLink);
  const setLinkRole = useFrameStore((state) => state.setLinkRole);
  const removeRelatedLinks = useLinkStore((state) => state.removeRelatedLinks);
  const linkRoles = ["none", "parent", "child"];
  let elements;
  let addNewLink: (link: FrameElement) => void;
  if (!selectedObject) return null;
  const sElement = selectedObject as FrameElement;
  if (selectedObject.linkRole === "parent") {
    // Parent element, show only children which are not linked to this element
    elements = getRoleElements("child", selectedObject.id);
    addNewLink = (cElement: FrameElement) =>
      addLink({
        parentElement: sElement,
        childElement: cElement,
      });
  } else if (selectedObject.linkRole === "child") {
    // Child element, Show only other parent elements
    elements = getRoleElements("parent", selectedObject.id);
    addNewLink = (pElement: FrameElement) =>
      addLink({
        parentElement: pElement,
        childElement: sElement,
      });
  }

  return (
    <div className="flex gap-1.5">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="customButton group flex h-7 w-28 items-center justify-between gap-1.5 rounded-md pl-2.5 pr-1.5 text-xs focus:ring-0">
          {selectedObject.linkRole ?? "none"}
          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="customPopup min-w-20">
          {linkRoles.map((lRole) => (
            <DropdownMenuItem
              key={lRole}
              className="justify-center text-xs hover:!bg-white/5"
              onClick={() => {
                setLinkRole(
                  selectedObject.frameId,
                  selectedObject.id,
                  lRole as "none" | "parent" | "child",
                );
                removeRelatedLinks(selectedObject.id);
              }}
              {...(selectedObject.linkRole !== lRole ? {} : { disabled: true })}
            >
              {lRole}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className="customButton h-7 w-full gap-0.5"
            variant="property"
            role="combobox"
            {...(selectedObject.linkRole ? {} : { disabled: true })}
          >
            <Plus />
            <span className="text-xs">Add new</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 rounded-none border-none bg-transparent p-0">
          <Command className="customPopup max-h-36 min-h-28">
            <CommandInput
              placeholder="Search element..."
              className="h-9 text-xs placeholder:text-neutral-400"
            />
            <CommandList className="overflow scrollbar-hide overflow-y-auto">
              <CommandEmpty>No elements found</CommandEmpty>
              <CommandGroup className="px-1.5 pb-2">
                {elements?.map((element) => (
                  <CommandItem
                    key={element.id}
                    value={element.name}
                    onSelect={() => {
                      addNewLink({
                        frameId: element.frameId,
                        id: element.id,
                      });
                      setOpen(false);
                    }}
                    className="rounded-md px-2.5 text-xs text-neutral-400 data-[selected=true]:bg-white/5"
                  >
                    <span className="font-bold">{element.type[0]}</span>
                    {element.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function LinkList() {
  const selectedObject = useEditorStore(
    (state) => state.selectedObject,
  ) as TextData | null;
  const getRelatedElements = useLinkStore((state) => state.getRelatedElements);
  const links = useLinkStore((state) => state.links);
  if (!links || !selectedObject?.linkRole) return null;
  if (selectedObject.linkRole === "child") {
    // Child element
    const pElement = getRelatedElements(
      selectedObject.id,
      "child",
    ) as FrameElement | null;
    if (!pElement) return null;
    const sElement = selectedObject as FrameElement;
    return <LinkListItem otherElement={sElement} displayedElement={pElement} />;
  } else if (selectedObject.linkRole === "parent") {
    // Parent element
    const cElements = getRelatedElements(selectedObject.id, "parent") as
      | FrameElement[]
      | null;
    if (!cElements) return null;
    return cElements.map((element) => {
      const sElement = selectedObject as FrameElement;
      return (
        <LinkListItem
          otherElement={sElement}
          displayedElement={element}
          key={element.id}
        />
      );
    });
  }
}

function LinkListItem({
  otherElement,
  displayedElement,
}: {
  otherElement: FrameElement;
  displayedElement: FrameElement;
}) {
  const getElement = useFrameStore((state) => state.getElement);
  const element = getElement(
    displayedElement.frameId,
    displayedElement.id,
  ) as TextData | null;
  const removeLink = useLinkStore((state) => state.removeLink);
  if (!element) return null;
  return (
    <div className="flex gap-1.5">
      <div className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-neutral-400">
        <span className="pr-2 font-bold">{element.type[0]}</span>
        {element.name}
      </div>
      <Button
        size="icon"
        className="h-7 w-7"
        variant="property"
        onClick={() =>
          element.linkRole === "child"
            ? removeLink({
                parentElement: otherElement,
                childElement: displayedElement,
              })
            : removeLink({
                parentElement: displayedElement,
                childElement: otherElement,
              })
        }
      >
        <X />
      </Button>
    </div>
  );
}
