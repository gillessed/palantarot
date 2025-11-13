import { useCallback } from "react";
import { pTimeout } from "../../../server/utils";
import { useApi } from "../../context/ApiContext";
import { AuthRequest } from "./auth";
import { useAsync } from "../utils/useAsync";

const LoginPath = "/login";

export function useLogin(onComplete?: () => void) {
  const api = useApi();
  const loader = useCallback(
    async (request: AuthRequest) => {
      // Timeout for login time to feel natural
      await pTimeout(250);
      return api.wrapPost<void>(LoginPath, request);
    },
    [api]
  );

  return useAsync(loader, onComplete);
}
