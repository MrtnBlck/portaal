"use client";

import type { MutationFunction } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface GridItemProps {
  id: number;
  title: string;
  children?: React.ReactNode;
  deleteMutationFn: MutationFunction<unknown, string>;
  renameMutationFn: MutationFunction<unknown, { id: string; name: string }>;
  queryKey: string;
  routerPath: string;
}

export function GridItem(props: GridItemProps) {
  const queryClient = useQueryClient();
  const { mutate: deleteItem } = useMutation({
    mutationFn: props.deleteMutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [props.queryKey],
      });
    },
  });
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-neutral-400/5 bg-neutral-600/10 px-3 py-2.5 text-sm font-medium text-neutral-200 hover:multi-[text-white;bg-neutral-600/15;border-neutral-600/15]"
      onClick={() => window.open(props.routerPath, "_blank")}
    >
      {isRenaming ? (
        <RenameInput
          title={props.title}
          ref={inputRef}
          setIsRenaming={setIsRenaming}
          id={props.id}
          queryKey={props.queryKey}
          renameMutationFn={props.renameMutationFn}
        />
      ) : (
        <span className="line-clamp-1 select-none">{props.title}</span>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size="none"
            variant="none"
            className="h-4 w-6"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="customPopup">
          <DropdownMenuItem
            className="text-xs hover:!bg-white/5"
            onClick={(e) => {
              e.stopPropagation();
              deleteItem(String(props.id));
            }}
          >
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs hover:!bg-white/5"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
              setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
              }, 1);
            }}
          >
            Rename
          </DropdownMenuItem>
          {props.children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface RenameInputProps {
  title: string;
  id: number;
  setIsRenaming: (isRenaming: boolean) => void;
  renameMutationFn: MutationFunction<unknown, { id: string; name: string }>;
  queryKey: string;
}

const RenameInput = forwardRef<HTMLInputElement, RenameInputProps>(
  (props, ref) => {
    const [titleInput, setTitleInput] = useState(props.title);
    const queryClient = useQueryClient();
    const { mutate: renameItem } = useMutation({
      mutationFn: props.renameMutationFn,
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [props.queryKey],
        });
        setTimeout(() => {
          props.setIsRenaming(false);
        }, 300);
      },
    });

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length <= 40) {
        setTitleInput(value);
      }
    };

    const handleOnBlur = () => {
      if (titleInput === "") {
        setTitleInput("Untitled");
        renameItem({
          id: String(props.id),
          name: "Untitled",
        });
      } else {
        setTitleInput(titleInput.trim());
        renameItem({
          id: String(props.id),
          name: titleInput.trim(),
        });
      }
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleOnBlur();
        e.currentTarget.blur();
      }
    };

    return (
      <Input
        className="rounded-none border-0 p-0 focus-visible:ring-0"
        value={titleInput}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      />
    );
  },
);
RenameInput.displayName = "RenameInput";
