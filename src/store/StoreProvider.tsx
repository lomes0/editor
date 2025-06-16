"use client";
import { Provider } from "react-redux";
import { store } from ".";
import { FC, PropsWithChildren, useRef } from "react";

const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  // Using useRef to ensure the store instance remains the same across re-renders
  // This helps prevent hydration mismatches that can occur with Redux
  const storeRef = useRef(store);

  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default StoreProvider;
