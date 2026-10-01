import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdvisor } from '../context/AdvisorContext';
import { api } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

export default function AdvisorDrawer() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, closeAdvisor, toggleAdvisor, queuedPrompt, consumeQueuedPrompt } = useAdvisor();

  const [useReactMode, setUseReactMode] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! 👋 I'm **FinGuide**, your personal financial advisor.\n\nI can analyze your spending, calculate realistic savings targets, and propose smart budgets and financial goals with your approval.\n\nAsk me anything or say *"Help me plan my budget"*!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openThoughts, setOpenThoughts] = useState({});
  const [actionStatuses, setActionStatuses] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Handle queued prompt from "Plan with Advisor" button
  useEffect(() => {
    if (isOpen && queuedPrompt) {
      const promptText = consumeQueuedPrompt();
      if (promptText) {
        handleSendPrompt(promptText);
      }
    }
  }, [isOpen, queuedPrompt, consumeQueuedPrompt]);

  const toggleThought = (idx) => {
    setOpenThoughts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleApproveAction = async (msgIndex, hitlAction) => {
    try {
      setActionStatuses(prev => ({ ...prev, [msgIndex]: 'loading' }));
      const res = await api.approveHitlAction(hitlAction.tool, hitlAction.data);
      setActionStatuses(prev => ({ ...prev, [msgIndex]: 'approved' }));
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ **Action Approved & Applied:** ${res.message || 'Updated successfully!'}`,
        },
      ]);
    } catch (err) {
      alert(`Failed to apply action: ${err.message}`);
      setActionStatuses(prev => ({ ...prev, [msgIndex]: 'error' }));
    }
  };

  const handleRejectAction = (msgIndex) => {
    setActionStatuses(prev => ({ ...prev, [msgIndex]: 'rejected' }));
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `❌ **Action Declined:** The proposed change was discarded without making any modifications.`,
      },
    ]);
  };

  const handleSendPrompt = async (promptText) => {
    const text = promptText.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      let responseData;
      if (useReactMode) {
        responseData = await api.reactChat(text, history);
      } else {
        responseData = await api.chat(text, history);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: responseData.raw_text || responseData.reply || responseData.response || 'No response generated.',
          thoughtSteps: responseData.thought_steps || [],
          hitlAction: responseData.hitl_action || null,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message}. Please check that the backend is running.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendPrompt(input);
  };

  // Hide FAB and drawer if user is on the dedicated full-page /advisor (unless explicitly opened)
  const isDedicatedPage = location.pathname === '/advisor';
  if (isDedicatedPage && !isOpen) {
    return null;
  }

  return (
    <>
      {/* ── Floating Action Button (FAB) Widget at Bottom-Right ── */}
      {!isDedicatedPage && (
        <button
          type="button"
          className="advisor-fab"
          onClick={toggleAdvisor}
          title="Ask FinGuide — Your AI Financial Companion"
          aria-label="Ask FinGuide"
        >
          <div className="advisor-fab-icon">
            <Sparkles size={18} />
          </div>
          <span className="advisor-fab-text">Ask Advisor</span>
          <span className="advisor-fab-pulse" />
        </button>
      )}

      {/* ── Slide-Over Backdrop Overlay ── */}
      {isOpen && (
        <div
          className="advisor-drawer-backdrop"
          onClick={closeAdvisor}
          aria-hidden="true"
        />
      )}

      {/* ── Persistent Slide-Over Drawer ── */}
      <aside
        className={`advisor-drawer ${isOpen ? 'open' : ''}`}
        aria-label="FinGuide Financial Advisor"
      >
        {/* Drawer Header */}
        <div className="advisor-drawer-header">
          <div className="advisor-drawer-title">
            <div className="advisor-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Ask FinGuide</h3>
              <p>Companion Financial Advisor</p>
            </div>
          </div>

          <div className="advisor-drawer-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                closeAdvisor();
                navigate('/advisor');
              }}
              title="Expand to Full Page View"
            >
              <Maximize2 size={16} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={closeAdvisor}
              title="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Toggle Switch */}
        <div className="advisor-drawer-toolbar">
          <label className="advisor-toggle-label" title="Enable smart budget and goal actions">
            <input
              type="checkbox"
              checked={useReactMode}
              onChange={(e) => setUseReactMode(e.target.checked)}
            />
            <span className="advisor-toggle-slider" />
            <span className="advisor-toggle-text">
              <Sparkles size={12} style={{ color: useReactMode ? '#a5b4fc' : '#94a3b8' }} />
              Smart Planning Actions {useReactMode ? 'Active' : 'Off'}
            </span>
          </label>
        </div>

        {/* Drawer Messages List */}
        <div className="advisor-drawer-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : (user?.name?.[0] || 'U')}
              </div>
              <div className="chat-content">
                {/* ReAct Thought Steps */}
                {msg.thoughtSteps?.length > 0 && (
                  <div className="thought-container">
                    <button
                      type="button"
                      className="thought-toggle"
                      onClick={() => toggleThought(i)}
                    >
                      <Sparkles size={13} style={{ color: '#818cf8' }} />
                      <span>Calculation & Analysis Steps ({msg.thoughtSteps.length})</span>
                      {openThoughts[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {openThoughts[i] && (
                      <div className="thought-steps-list">
                        {msg.thoughtSteps.map((step, sIdx) => (
                          <div key={sIdx} className="thought-step-item">
                            <span className="thought-step-num">Step {sIdx + 1}</span>
                            <div className="thought-step-text">{step}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Markdown content */}
                <div className="markdown-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* HITL Action Proposal Card */}
                {msg.hitlAction && (
                  <div className="hitl-card">
                    <div className="hitl-header">
                      <ShieldAlert size={16} className="hitl-icon" />
                      <span className="hitl-title">Action Approval Required</span>
                    </div>
                    <p className="hitl-desc">{msg.hitlAction.description}</p>
                    {msg.hitlAction.data && (
                      <pre className="hitl-data-preview">
                        {JSON.stringify(msg.hitlAction.data, null, 2)}
                      </pre>
                    )}
                    <div className="hitl-buttons">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={actionStatuses[i] === 'loading' || actionStatuses[i] === 'approved'}
                        onClick={() => handleApproveAction(i, msg.hitlAction)}
                      >
                        <CheckCircle2 size={14} />
                        {actionStatuses[i] === 'loading' ? 'Applying...' : actionStatuses[i] === 'approved' ? 'Approved' : 'Approve & Apply'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={actionStatuses[i] === 'loading' || actionStatuses[i] === 'approved'}
                        onClick={() => handleRejectAction(i)}
                      >
                        <XCircle size={14} />
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="chat-avatar"><Bot size={16} /></div>
              <div className="chat-content">
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="advisor-drawer-chips">
          <button
            type="button"
            className="advisor-chip"
            onClick={() => handleSendPrompt("Analyze my top spending categories and suggest where I can cut back")}
            disabled={loading}
          >
            Where can I cut back?
          </button>
          <button
            type="button"
            className="advisor-chip"
            onClick={() => handleSendPrompt("Can I afford to save ₹10,000 extra this month?")}
            disabled={loading}
          >
            Can I save ₹10k extra?
          </button>
          <button
            type="button"
            className="advisor-chip"
            onClick={() => handleSendPrompt("Propose a monthly budget cap based on my statement history")}
            disabled={loading}
          >
            Propose monthly budget cap
          </button>
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmit} className="advisor-drawer-footer">
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            placeholder="Ask FinGuide anything about your finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !input.trim()}
          >
            <Send size={15} />
          </button>
        </form>
      </aside>
    </>
  );
}
