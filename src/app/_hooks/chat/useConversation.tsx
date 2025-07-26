import { useParams } from "next/navigation";
import { useMemo } from "react";

export const useConversation = () => {
  const params = useParams();
  const channelId = useMemo(() => {
    const param = params?.channelId;
    if (Array.isArray(param)) {
      return param[0] ?? "";
    }
    return param ?? "";
  }, [params?.channelId]);

  return {
    channelId,
  };
};
