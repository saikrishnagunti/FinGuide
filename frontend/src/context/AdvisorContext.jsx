import { createContext, useContext, useState, useCallback } from 'react';

const AdvisorContext = createContext(null);

export function AdvisorProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedPrompt, setQueuedPrompt] = useState(null);

  const openAdvisor = useCallback((initialPrompt = null) => {
    if (initialPrompt) {
      setQueuedPrompt(initialPrompt);
    }
    setIsOpen(true);
  }, []);

  const closeAdvisor = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAdvisor = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const consumeQueuedPrompt = useCallback(() => {
    const p = queuedPrompt;
    setQueuedPrompt(null);
    return p;
  }, [queuedPrompt]);

  return (
    <AdvisorContext.Provider
      value={{
        isOpen,
        openAdvisor,
        closeAdvisor,
        toggleAdvisor,
        queuedPrompt,
        consumeQueuedPrompt,
      }}
    >
      {children}
    </AdvisorContext.Provider>
  );
}

export function useAdvisor() {
  const context = useContext(AdvisorContext);
  if (!context) {
    throw new Error('useAdvisor must be used within an AdvisorProvider');
  }
  return context;
}
