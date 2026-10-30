import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Scenario } from '../types';
import { api } from '../api/client';

export interface ScenarioContextType {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  selectedScenarioId: string | null;
  setSelectedScenarioId: (id: string) => void;
  refreshScenarios: () => Promise<void>;
  isLoading: boolean;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshScenarios = useCallback(async () => {
    try {
      const data = await api.getScenarios();
      setScenarios(data);
      if (data.length > 0 && !selectedScenarioId) {
        const active = data.find((s) => s.is_active) || data[0];
        setSelectedScenarioId(active.scenario_id);
      }
    } catch (e) {
      console.error('Ошибка загрузки сценариев:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedScenarioId]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await api.getScenarios();
        if (!isMounted) return;
        setScenarios(data);
        if (data.length > 0) {
          const active = data.find((s) => s.is_active) || data[0];
          setSelectedScenarioId(active.scenario_id);
        }
      } catch (e) {
        console.error('Ошибка загрузки сценариев:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeScenario = scenarios.find((s) => s.scenario_id === selectedScenarioId) || scenarios[0] || null;

  return (
    <ScenarioContext.Provider
      value={{
        scenarios,
        activeScenario,
        selectedScenarioId,
        setSelectedScenarioId,
        refreshScenarios,
        isLoading,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
