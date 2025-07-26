import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export default function NoConvDialog(props: {
  dialogOpen: boolean;
  handleDialogClose: () => void;
}) {
  const { dialogOpen, handleDialogClose } = props;
  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sidepanel select-nonce flex min-h-60 flex-col justify-between shadow-none">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-base">
            No conversations were found
          </DialogTitle>
          <DialogDescription className="text-neutral-300">
            You don&apos;t have any active conversations yet.
            <br />
            Use the forward option in the editor to start a new conversation.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleDialogClose}>Back to the Dashboard</Button>
      </DialogContent>
    </Dialog>
  );
}
