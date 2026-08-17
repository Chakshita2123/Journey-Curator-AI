"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { PredictResponse } from "@/types/api";

export interface JourneyData {
  tripCost: PredictResponse | null;
  selectedDestination: string;
  duration: number;
  origin: string;
  accommodation: string;
  transport: string;
  travelStyle: string;
  season: string;
  groupSize: number;
  budget: number | "";
}

interface UserJourneyContextType {
  journey: JourneyData;
  setTripCost: (res: PredictResponse, inputs: Partial<JourneyData>) => void;
  setTripInputs: (inputs: Partial<JourneyData>) => void;
  resetJourney: () => void;
}

const DEFAULT_JOURNEY: JourneyData = {
  tripCost: null,
  selectedDestination: "",
  duration: 7,
  origin: "Delhi",
  accommodation: "",
  transport: "",
  travelStyle: "",
  season: "",
  groupSize: 2,
  budget: "",
};

const UserJourneyContext = createContext<UserJourneyContextType | undefined>(undefined);

const STORAGE_KEY = "journey_curator_session_data_v2";

export function UserJourneyProvider({ children }: { children: React.ReactNode }) {
  const [journey, setJourney] = useState<JourneyData>(DEFAULT_JOURNEY);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setJourney(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load journey session storage", e);
    }
  }, []);

  const saveState = (newData: JourneyData) => {
    setJourney(newData);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      } catch (e) {
        console.warn("Failed to save journey session storage", e);
      }
    }
  };

  const setTripCost = (tripCost: PredictResponse, inputs: Partial<JourneyData>) => {
    saveState({
      ...journey,
      ...inputs,
      tripCost,
    });
  };

  const setTripInputs = (inputs: Partial<JourneyData>) => {
    saveState({
      ...journey,
      ...inputs,
    });
  };

  const resetJourney = () => {
    saveState(DEFAULT_JOURNEY);
  };

  return (
    <UserJourneyContext.Provider value={{ journey, setTripCost, setTripInputs, resetJourney }}>
      {children}
    </UserJourneyContext.Provider>
  );
}

export function useUserJourney() {
  const context = useContext(UserJourneyContext);
  if (!context) {
    // Return graceful default if called outside provider
    return {
      journey: DEFAULT_JOURNEY,
      setTripCost: () => {},
      setTripInputs: () => {},
      resetJourney: () => {},
    };
  }
  return context;
}
