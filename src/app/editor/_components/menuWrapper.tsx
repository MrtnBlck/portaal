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

export function MenuWrapper({ children, deleteObject }: MenuWrapperProps) {
  const selectedObject = useEditorStore((state) => state.selectedObject);

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger disabled={false}>{children}</ContextMenuTrigger>
      <ContextMenuContent className="customPopup min-h-36">
        <ContextMenuItem className="text-xs hover:!bg-white/5">
          Context menu, content TBD
        </ContextMenuItem>
        {selectedObject && (
          <ContextMenuItem
            onSelect={deleteObject}
            className="text-xs hover:!bg-white/5"
          >
            Delete: {selectedObject.name}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
