import { CircleCheck, CircleFadingArrowUp, CircleX } from "lucide-react";
import { toast } from "sonner";

interface ToastProps {
  type: "start" | "error" | "success";
  title: string;
  description: string;
}

function ImageUploadToast(props: ToastProps) {
  const { type, title, description } = props;

  return (
    <div className="pointer-events-none flex w-72 items-center gap-2 rounded-full border border-neutral-800 !bg-[#1F1F1FEB] p-2.5 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.05)] !backdrop-blur-lg">
      <div className="px-0.5">
        {type === "start" && (
          <CircleFadingArrowUp
            className="size-9 text-neutral-100/90"
            strokeWidth={1.5}
          />
        )}
        {type === "error" && (
          <CircleX className="size-9 text-red-500/90" strokeWidth={1.5} />
        )}
        {type === "success" && (
          <CircleCheck className="size-9 text-green-500/90" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex max-w-full flex-col overflow-hidden">
        <div className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap pr-4 text-sm leading-tight text-neutral-100">
          {title}
        </div>
        <div className="text-xs leading-tight text-neutral-400">
          {description}
        </div>
      </div>
    </div>
  );
}

export function showImageUploadToast(props: ToastProps) {
  const { type, title, description } = props;

  return toast.custom(() => (
    <ImageUploadToast type={type} title={title} description={description} />
  ));
}
