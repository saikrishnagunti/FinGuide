import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldAlert, Trash2 } from 'lucide-react';
import { useAdvisor } from '../context/AdvisorContext';

export default function Advisor() {
  const { user } = useAuth();
  const [useReactMode, setUseReactMode] = useState(true);
  const { messages, setMessages, openThoughts, setOpenThoughts, actionStatuses, setActionStatuses, chatSummary, setChatSummary, clearConversation } = useAdvisor();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
          content: `✅ **Action Approved & Applied:** ${res.message || 'Updated successfully! You can see this on your Dashboard.'}`,
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      let responseData;
      if (useReactMode) {
        responseData = await api.reactChat(text, history, chatSummary);
      } else {
        responseData = await api.chat(text, history, chatSummary);
      }

      if (responseData.new_summary) {
        setChatSummary(responseData.new_summary);
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
          content: `⚠️ ${err.message}. Please check that the Node.js API and Python agent are running.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Can I afford a ₹50,000 laptop?',
    'Propose an Emergency Fund goal of ₹60,000',
    'Set a budget cap on Dining out',
    'Where is my money going?',
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h2>AI Financial Advisor</h2>
          <p>Personalized financial insights, smart budget planning, and interactive goal forecasts</p>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          background: 'var(--surface-hover)', padding: '6px 14px', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)'
        }}>
          <Sparkles size={14} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>Interactive Planning:</span>
          <button
            type="button"
            className={`btn btn-sm ${useReactMode ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '2px 10px', height: '26px', fontSize: '11px' }}
            onClick={() => setUseReactMode(!useReactMode)}
          >
            {useReactMode ? 'Actions & Approvals' : 'Advice Only'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={clearConversation}
            title="Clear Conversation"
            style={{ padding: '2px 8px', height: '26px' }}
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : (user?.name?.[0] || 'U')}
              </div>
              <div className="chat-content">
                {msg.role === 'assistant' ? (
                  <div>
                    {/* ReAct Thought Chain Collapsible */}
                    {msg.thoughtSteps && msg.thoughtSteps.length > 0 && (
                      <div className="thought-container">
                        <button
                          type="button"
                          className="thought-toggle"
                          onClick={() => toggleThought(i)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Bot size={13} /> Calculation & Analysis Steps ({msg.thoughtSteps.length})
                          </span>
                          {openThoughts[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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

                    {/* Main Response Markdown */}
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Human-in-the-Loop (HITL) Interactive Action Card */}
                    {msg.hitlAction && (
                      <div className="hitl-card">
                        <div className="hitl-header">
                          <ShieldAlert size={16} className="hitl-icon" />
                          <span className="hitl-title">Proposed Action — Review & Confirm</span>
                        </div>

                        <p className="hitl-desc">{msg.hitlAction.summary || msg.hitlAction.description}</p>

                        {/* Approval buttons */}
                        {!actionStatuses[i] && (
                          <div className="hitl-buttons">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApproveAction(i, msg.hitlAction)}
                            >
                              <CheckCircle2 size={14} /> Approve & Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleRejectAction(i)}
                            >
                              <XCircle size={14} /> Decline
                            </button>
                          </div>
                        )}

                        {actionStatuses[i] === 'loading' && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary)', marginTop: '8px' }}>
                            Applying action to your account...
                          </div>
                        )}

                        {actionStatuses[i] === 'approved' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: 'var(--font-size-xs)', fontWeight: 600, marginTop: '8px' }}>
                            <CheckCircle2 size={14} /> Approved & Added to Your Financial Records
                          </div>
                        )}

                        {actionStatuses[i] === 'rejected' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '8px' }}>
                            <XCircle size={14} /> Declined by user
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
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

        {/* Quick suggestions when no user messages yet */}
        {messages.length <= 1 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)',
            padding: '0 var(--space-md) var(--space-sm)',
          }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="btn btn-ghost btn-sm"
                onClick={() => { setInput(s); }}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-area">
          <textarea
            className="form-input"
            placeholder={useReactMode ? "Ask FinGuide about budgets, savings, or spending..." : "Ask about your finances..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <div style={{
        textAlign: 'center', fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)', marginTop: 'var(--space-md)',
      }}>
        💡 FinGuide provides educational budgeting insights and requires human approval before modifying user goals or budgets.
      </div>
    </div>
  );
}
