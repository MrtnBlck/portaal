import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

const formatTime = (timestamp: number) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const isToday = now.toDateString() === messageDate.toDateString();
  const isThisWeek =
    now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000 &&
    now.getDay() >= messageDate.getDay();

  if (isToday) {
    return format(messageDate, "HH:mm");
  } else if (isThisWeek) {
    return format(messageDate, "EEE HH:mm");
  } else {
    return format(messageDate, "MMMM d. HH:mm");
  }
};

export default function Message(props: {
  fromCurrentUser: boolean;
  position: "top" | "bottom" | "middle" | "single";
  createdAt: number;
  text: string;
}) {
  const { fromCurrentUser, position, createdAt, text } = props;
  const isMultiLine = text.includes("\n") || text.length > 50;

  return (
    <TooltipProvider>
      <div className={cn("flex items-end", fromCurrentUser && "justify-end")}>
        <div
          className={cn(
            "mx-3 flex w-full flex-col",
            fromCurrentUser ? "order-1 items-end" : "order-2 items-start",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "max-w-[45%] rounded-[18px] px-3 py-[5px] text-neutral-100",
                  isMultiLine && "py-[7px]",
                  fromCurrentUser
                    ? "bg-neutral-700/80"
                    : "border border-neutral-700",
                  position === "top" &&
                    (fromCurrentUser ? "rounded-br-md" : "rounded-bl-md"),
                  position === "bottom" &&
                    (fromCurrentUser ? "rounded-tr-md" : "rounded-tl-md"),
                  position === "middle" &&
                    (fromCurrentUser ? "rounded-r-md" : "rounded-l-md"),
                )}
              >
                <p className="whitespace-pre-wrap text-wrap break-words text-sm">
                  {text}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side={fromCurrentUser ? "left" : "right"}
              className="rounded-2xl"
            >
              <p className="text-xs text-neutral-100">
                {formatTime(createdAt)}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
