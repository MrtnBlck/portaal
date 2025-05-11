import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useEditorStore } from "../_utils/editorStore";
import { useStageUtils } from "../_utils/useStageUtils";

export function MenuWrapper({ children }: { children: React.ReactNode }) {
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const userMode = useEditorStore((state) => state.userMode);
  const { deleteSelectedObject, moveSelectedObject } = useStageUtils();

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger disabled={userMode === "normal"}>
        {children}
      </ContextMenuTrigger>
      {selectedObject && (
        <ContextMenuContent className="customPopup min-h-36">
          <>
            <MenuItem name="Delete" onSelect={deleteSelectedObject} />
            <MenuItem
              name="Move to Top"
              onSelect={() => moveSelectedObject("top")}
            />
            <MenuItem
              name="Move to Bottom"
              onSelect={() => moveSelectedObject("bottom")}
            />
          </>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

function MenuItem({ name, onSelect }: { name: string; onSelect: () => void }) {
  return (
    <ContextMenuItem onSelect={onSelect} className="text-xs hover:!bg-white/5">
      {name}
    </ContextMenuItem>
  );
}
