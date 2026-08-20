"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  initialDonors,
  initialFunds,
  initialGrants,
  initialOpportunities,
} from "./mock-data";
import type {
  CSRGrant,
  CurrentUser,
  Donor,
  EndowmentFund,
  PipelineOpportunity,
} from "./types";

interface StoreState {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  funds: EndowmentFund[];
  setFunds: React.Dispatch<React.SetStateAction<EndowmentFund[]>>;
  grants: CSRGrant[];
  setGrants: React.Dispatch<React.SetStateAction<CSRGrant[]>>;
  donors: Donor[];
  setDonors: React.Dispatch<React.SetStateAction<Donor[]>>;
  opportunities: PipelineOpportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<PipelineOpportunity[]>>;
}

const StoreContext = createContext<StoreState | null>(null);

const DEFAULT_USER: CurrentUser = { name: "Anita Rao", role: "ENDOWMENT_OFFICER" };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(DEFAULT_USER);
  const [funds, setFunds] = useState<EndowmentFund[]>(initialFunds);
  const [grants, setGrants] = useState<CSRGrant[]>(initialGrants);
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [opportunities, setOpportunities] = useState<PipelineOpportunity[]>(
    initialOpportunities,
  );

  const value = useMemo<StoreState>(
    () => ({
      currentUser,
      setCurrentUser,
      funds,
      setFunds,
      grants,
      setGrants,
      donors,
      setDonors,
      opportunities,
      setOpportunities,
    }),
    [currentUser, funds, grants, donors, opportunities],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
