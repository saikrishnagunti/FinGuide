import { createContext, useContext, useState, useCallback } from 'react';

import { useAuth } from './AuthContext';

const AdvisorContext = createContext(null);

export function AdvisorProvider({ children }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [queuedPrompt, setQueuedPrompt] = useState(null);

  // Shared Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! 👋 I'm **FinGuide**, your personal financial advisor.\n\nI can analyze your spending, calculate realistic savings targets, and propose smart budgets and financial goals with your approval.\n\nAsk me anything or say *"Help me plan my budget"*!`,
    },
  ]);
  const [openThoughts, setOpenThoughts] = useState({});
  const [actionStatuses, setActionStatuses] = useState({});

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
        messages,
        setMessages,
        openThoughts,
        setOpenThoughts,
        actionStatuses,
        setActionStatuses,
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
