import { useMutation } from "convex/react";
import { useState } from "react";
import type { FunctionReference } from "convex/server";

export const useMutationState = <T extends FunctionReference<"mutation">>(
  mutationToRun: T,
) => {
  const [pending, setPending] = useState(false);
  const mutationFn = useMutation(mutationToRun);

  const mutate = (payload: T["_args"]) => {
    setPending(true);

    return mutationFn(payload)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => setPending(false));
  };

  return {
    mutate,
    pending,
  };
};
