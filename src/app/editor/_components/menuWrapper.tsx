import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useEditorStore } from "../store";

interface MenuWrapperProps {
  children: React.ReactNode;
  deleteObject: () => void;
}

export function MenuWrapper({
  children,
  deleteObject,
}: MenuWrapperProps) {
  const selectedObject = useEditorStore((state) => state.selectedObject);

  return (
    <ContextMenu modal={false}>
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
