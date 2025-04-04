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
import { useEditorStore, useFrameStore, useLinkStore } from "../store";
import type { Link } from "../page";

export function LinkSettings() {
  const [open, setOpen] = useState(false);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const getRoleLinks = useFrameStore((state) => state.getRoleLinks);
  const addLink = useLinkStore((state) => state.addLink);
  const setLinkRole = useFrameStore((state) => state.setLinkRole);
  const removeRelatedLinks = useLinkStore((state) => state.removeRelatedLinks);
  const linkRoles = ["none", "parent", "child"];
  let elements;
  let addNewLink: (link: Link) => void;
  if (!selectedObject) return;
  const sOLink = {
    frameID: selectedObject.frameID,
    elementID: selectedObject.id,
  } as Link;
  if (selectedObject.linkRole === "parent") {
    // Parent element, show only children which are not linked to this element
    elements = getRoleLinks("child", selectedObject.id);
    addNewLink = (cLink: Link) =>
      addLink({
        parentLink: sOLink,
        childLink: cLink,
      });
  } else if (selectedObject.linkRole === "child") {
    // Child element, Show only other parent elements
    elements = getRoleLinks("parent", selectedObject.id);
    addNewLink = (pLink: Link) =>
      addLink({
        parentLink: pLink,
        childLink: sOLink,
      });
  }

  return (
    <div className="flex gap-1.5">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="customButton group flex h-7 w-28 items-center justify-between gap-1.5 rounded-md pl-2.5 pr-1.5 text-xs focus:ring-0">
          {selectedObject.linkRole ?? "none"}
          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-20 rounded-lg border border-neutral-800 bg-[#1F1F1FEB]/90 shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] backdrop-blur-lg">
          {linkRoles.map((lRole) => (
            <DropdownMenuItem
              key={lRole}
              className="justify-center text-xs hover:bg-white/5"
              onClick={() => {
                setLinkRole(
                  selectedObject.frameID!,
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
          <Command className="max-h-36 min-h-28 rounded-lg border border-neutral-800 bg-[#1F1F1FEB]/90 shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] backdrop-blur-lg">
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
                        elementID: element.id,
                        frameID: element.frameID!,
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
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const getRelatedLinks = useLinkStore((state) => state.getRelatedLinks);
  const links = useLinkStore((state) => state.links);
  if (!links) return null;

  if (!selectedObject?.linkRole) return;
  if (selectedObject.linkRole === "child") {
    // Child element
    const pLink = getRelatedLinks(selectedObject.id, "child") as Link | null;
    if (!pLink) return;
    const cLink = {
      frameID: selectedObject.frameID,
      elementID: selectedObject.id,
    } as Link;
    return <LinkListItem link={cLink} vLink={pLink} />;
  } else if (selectedObject.linkRole === "parent") {
    // Parent element
    const cLinks = getRelatedLinks(selectedObject.id, "parent") as
      | Link[]
      | null;
    if (!cLinks) return;
    return cLinks.map((link) => {
      const pLink = {
        frameID: selectedObject.frameID,
        elementID: selectedObject.id,
      } as Link;
      return <LinkListItem link={pLink} vLink={link} key={link.elementID} />;
    });
  }
}

function LinkListItem({ link, vLink }: { link: Link; vLink: Link }) {
  const getElement = useFrameStore((state) => state.getElement);
  const element = getElement(vLink.frameID, vLink.elementID);
  const removeLink = useLinkStore((state) => state.removeLink);
  if (!element) return;
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
                parentLink: link,
                childLink: vLink,
              })
            : removeLink({
                parentLink: vLink,
                childLink: link,
              })
        }
      >
        <X />
      </Button>
    </div>
  );
}
