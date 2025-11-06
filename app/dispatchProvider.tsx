import { createContext, useContext } from "react";
import { Dispatchers } from "./services/dispatchers";

const DispatchContext = createContext<Dispatchers>(null as any);

export const DispatchProvider = DispatchContext.Provider;
export const useDispatchers = () => {
  return useContext(DispatchContext);
};
