"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/convex/_generated/api";
import { SendHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useMutationState } from "~/app/_hooks/useMutationState";
import { Button } from "~/components/ui/button";
import { FormField, Form, FormItem, FormControl } from "~/components/ui/form";
import type { Id } from "~/convex/_generated/dataModel";

const chatMessageSchema = z.object({
  content: z.string().min(1, {
    message: "This field cannot be empty",
  }),
});

export default function Input(props: { channelId: string }) {
  const { channelId } = props;
  const { mutate: createMessage, pending } = useMutationState(
    api.message.create,
  );
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
    },
    mode: "onChange",
    shouldUnregister: true,
  });
  const handleSubmit = async (values: z.infer<typeof chatMessageSchema>) => {
    createMessage({
      channelId: channelId as Id<"channels">,
      text: values.content,
    })
      .then(() => {
        form.reset();
      })
      .catch((error) => {
        console.error("Error creating message:", error);
      });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = event.target;

    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };

  const handleInputClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;
    const { value, selectionStart } = target;

    if (selectionStart !== null) {
      form.setValue("content", value);
    }
  };

  return (
    <div className="absolute bottom-0 w-full bg-gradient-to-b from-neutral-900/0 to-neutral-900/50 p-2 pb-3">
      <Form {...form}>
        <form
          className="flex size-full flex-row items-end gap-2 px-1"
          onSubmit={form.handleSubmit(handleSubmit)}
          autoComplete="off"
          noValidate
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => {
              return (
                <FormItem className="flex min-h-[34px] flex-1 flex-col items-center justify-center rounded-3xl border border-neutral-700/50 bg-white/5 px-4 backdrop-blur-xl">
                  <FormControl>
                    <TextareaAutosize
                      rows={1}
                      maxRows={4}
                      {...field}
                      onChange={handleInputChange}
                      onClick={handleInputClick}
                      placeholder="Type a message..."
                      className="textarea-scrollbar my-1.5 w-full resize-none items-center bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-400"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      aria-autocomplete="none"
                      spellCheck={false}
                      data-gramm="false"
                      data-gramm_editor="false"
                      data-enable-grammarly="false"
                      data-ms-editor="false"
                      data-lpignore="true"
                      data-form-type="other"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          await form.handleSubmit(handleSubmit)();
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <Button
            size="none"
            variant="none"
            className="size-[34px] rounded-full bg-white/90 p-2 backdrop-blur-xl"
            disabled={pending}
            type="submit"
          >
            <SendHorizontal className="size-5 text-black" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
