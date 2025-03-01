import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

import type { ObjectData } from "../page";

interface MenuWrapperProps {
  children: React.ReactNode;
  deleteObject: () => void;
  selectedObject: ObjectData | null;
}

export function MenuWrapper({
  children,
  deleteObject,
  selectedObject,
}: MenuWrapperProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={false}>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Context menu, content TBD</ContextMenuItem>
        {selectedObject && (
          <ContextMenuItem onSelect={deleteObject}>
            Delete: {selectedObject.name}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
