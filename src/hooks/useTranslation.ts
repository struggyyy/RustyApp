import { useCallback } from 'react';
import i18n from '../i18n/i18n';

export const useTranslation = () => {
  const t = useCallback((key: string, options?: any): string => {
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : String(result);
  }, []);

  return {
    t,
    i18n,
  };
};
