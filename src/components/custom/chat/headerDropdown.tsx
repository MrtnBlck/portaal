import { ChevronsUpDown, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function HeaderDropdown(props: {
  channels: { channelId: string; name: string; project: boolean }[];
  currentChannel: { id: string; name: string };
}) {
  const { channels, currentChannel } = props;

  return (
    <TooltipProvider>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="group flex flex-row items-center gap-1.5 text-sm text-neutral-400 hover:text-white focus:ring-0">
          {currentChannel.name}
          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-36 rounded-lg border border-neutral-700/50 !bg-[#1F1F1FEB]/90 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0_0.05)] backdrop-blur-lg"
        >
          {channels.map((channel) => {
            const isDisabled = channel.channelId === currentChannel.id;

            return (
              <Link
                href={`/chat/${channel.channelId}`}
                key={channel.channelId.toString()}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                  }
                }}
              >
                <DropdownMenuItem className="justify-between font-extralight">
                  {channel.name}
                  {channel.project && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <LayoutDashboard className="text-neutral-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This channel belongs to a project</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </DropdownMenuItem>
              </Link>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
