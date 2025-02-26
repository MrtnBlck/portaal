import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";

interface MenuWrapperProps {
  children: React.ReactNode;
  deleteItem?: () => void;
  isDisabled?: boolean;
}

export function MenuWrapper({ children, deleteItem }: MenuWrapperProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={true}>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={deleteItem}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
