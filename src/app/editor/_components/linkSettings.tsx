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
import { useEditorStore, useFrameStore } from "../store";
import type { Link, LinkData } from "../page";

export function LinkSettings() {
  const [open, setOpen] = useState(false);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const getLinkParents = useFrameStore((state) => state.getLinkParents);
  const getLinkChildren = useFrameStore((state) => state.getLinkChildren);
  const addLink = useFrameStore((state) => state.addLink);
  const updateElement = useFrameStore((state) => state.updateElement);
  const linkRoles = ["none", "parent", "child"];
  let elements;
  let addNewLink: (link: Link) => void;
  if (!selectedObject) return;
  const sOLink = {
    parentID: selectedObject.parentID,
    elementID: selectedObject.id,
  } as Link;
  if (selectedObject?.links?.linkRole === "parent") {
    // Parent element, show only children which are not linked to this element
    elements = getLinkChildren().filter(
      (element) => element.links?.linkedTo?.elementID !== selectedObject.id,
    );
    addNewLink = (cLink: Link) => addLink(cLink, sOLink);
  } else if (selectedObject.links?.linkRole === "child") {
    // Child element, Show only other parent elements
    elements = getLinkParents().filter(
      (element) => element.id !== selectedObject.links?.linkedTo?.elementID,
    );
    addNewLink = (pLink: Link) => addLink(sOLink, pLink);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger className="customButton group flex h-7 w-28 items-center justify-between gap-1.5 rounded-md pl-2.5 pr-1.5 text-xs focus:ring-0">
            {selectedObject.links ? selectedObject.links?.linkRole : "none"}
            <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-20 rounded-lg border border-neutral-800 bg-[#1F1F1FEB]/90 shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] backdrop-blur-lg">
            {linkRoles.map((lRole) => (
              <DropdownMenuItem
                key={lRole}
                className="justify-center text-xs hover:bg-white/5"
                onClick={() => {
                  const links = lRole === "none"
                  ? undefined
                  : ({ linkRole: lRole, linkedElements: null, linkedTo: null } as LinkData);
                  console.log(links, "popover inline");
                  updateElement(selectedObject.parentID!, {
                    ...selectedObject,
                    links: links,
                  });
                }}
                
              >
                {lRole}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <PopoverTrigger asChild>
          <Button
            className="customButton h-7 w-full gap-0.5"
            variant="property"
            role="combobox"
            {...(selectedObject.links ? {} : { disabled: true })}
          >
            <Plus />
            <span className="text-xs">Add new</span>
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-44 rounded-none border-none bg-transparent p-0">
        <Command className="min-h-28 rounded-lg border border-neutral-800 bg-[#1F1F1FEB]/90 shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] backdrop-blur-lg">
          <CommandInput
            placeholder="Search element..."
            className="h-9 text-xs placeholder:text-neutral-400"
          />
          <CommandList className="overflow overflow-hidden">
            <CommandEmpty>No elements found</CommandEmpty>
            <CommandGroup className="px-1.5 pb-2">
              {elements &&
                elements.map((element) => (
                  <CommandItem
                    key={element.id}
                    value={element.id}
                    onSelect={() => {
                      addNewLink({
                        elementID: element.id,
                        parentID: element.parentID!,
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
  );
}

export function LinkList() {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  if (!selectedObject || !selectedObject.links) return;
  if (selectedObject.links.linkRole === "child" && selectedObject.links.linkedTo) {
    // Child element
    const pLink = selectedObject.links.linkedTo;
    const cLink = {
      parentID: selectedObject.parentID,
      elementID: selectedObject.id,
    } as Link;
    return <LinkListItem link={cLink} vLink={pLink} />;
  } else if ((selectedObject.links.linkRole = "parent")) {
    // Parent element
    return selectedObject.links.linkedElements?.map((link) => {
      const pLink = {
        parentID: selectedObject.parentID,
        elementID: selectedObject.id,
      } as Link;
      return <LinkListItem link={pLink} vLink={link} key={link.elementID} />;
    });
  }
}

function LinkListItem({ link, vLink }: { link: Link; vLink: Link }) {
  const getElement = useFrameStore((state) => state.getElement);
  const element = getElement(vLink.parentID, vLink.elementID);
  const removeLink = useFrameStore((state) => state.removeLink);
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
          element.links?.linkRole === "child"
            ? removeLink(vLink, link)
            : removeLink(link, vLink)
        }
      >
        <X />
      </Button>
    </div>
  );
}
