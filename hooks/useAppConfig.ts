

import { useState, useCallback } from 'react';
import { DEFAULT_APP_CONFIG, AppConfig } from '../config/defaults';

export type { AppConfig };

const CONFIG_STORAGE_KEY = 'mdAppConfig';

export const useAppConfig = () => {
  const [currentConfig, setCurrentConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      return saved ? { ...DEFAULT_APP_CONFIG, ...JSON.parse(saved) } : DEFAULT_APP_CONFIG;
    } catch {
      return DEFAULT_APP_CONFIG;
    }
  });

  const updateConfig = useCallback((newConfig: AppConfig) => {
    setCurrentConfig(newConfig);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
  }, []);

  return { currentConfig, updateConfig };
};
