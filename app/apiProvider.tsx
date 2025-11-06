import { createContext, useContext } from "react";
import { ServerApi } from "./api/serverApi";

const ApiContext = createContext<ServerApi>(null as any);

export const ApiProvider = ApiContext.Provider;
export const useApi = () => {
  return useContext(ApiContext);
};
