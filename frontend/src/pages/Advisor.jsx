import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export default function Advisor() {
  const { user } = useAuth();
  const [useReactMode, setUseReactMode] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! 👋 I'm your FinGuide AI financial advisor.\n\nI can analyze your spending patterns, forecast savings, and help you plan budgets and financial goals. Whenever I suggest creating a budget or goal, you'll be able to review and approve it before anything changes.\n\nTry asking:\n- "Can I afford to buy a ₹45,000 laptop in 4 months?"\n- "Propose a savings goal for an Emergency Fund of ₹50,000"\n- "Analyze my top spending categories and set a budget cap"\n- "Where is most of my money going?"`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openThoughts, setOpenThoughts] = useState({});
  const [actionStatuses, setActionStatuses] = useState({}); // { [msgIndex]: 'approved' | 'rejected' }
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
        </div>
      </div>

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <div>
                  {/* ReAct Thought Chain Collapsible */}
                  {msg.thoughtSteps && msg.thoughtSteps.length > 0 && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      marginBottom: 'var(--space-sm)',
                      fontSize: 'var(--font-size-xs)',
                    }}>
                      <div
                        onClick={() => toggleThought(i)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer', color: 'var(--primary-light)', fontWeight: 600
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Bot size={13} /> Calculation & Analysis Steps ({msg.thoughtSteps.length})
                        </span>
                        {openThoughts[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>

                      {openThoughts[i] && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                          {msg.thoughtSteps.map((step, sIdx) => (
                            <div key={sIdx} style={{ marginBottom: '4px', fontFamily: 'monospace' }}>
                              • {step}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Response Markdown */}
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Human-in-the-Loop (HITL) Interactive Action Card */}
                  {msg.hitlAction && (
                    <div style={{
                      marginTop: 'var(--space-md)',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
                      border: '1px solid var(--primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-md)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <ShieldAlert size={18} color="var(--primary)" />
                        <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                          Proposed Action — Review & Confirm
                        </strong>
                      </div>

                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {msg.hitlAction.summary}
                      </p>

                      {/* Approval buttons */}
                      {!actionStatuses[i] && (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => handleApproveAction(i, msg.hitlAction)}
                          >
                            <CheckCircle2 size={14} /> Approve & Save
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
                            onClick={() => handleRejectAction(i)}
                          >
                            <XCircle size={14} /> Decline
                          </button>
                        </div>
                      )}

                      {actionStatuses[i] === 'loading' && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)' }}>
                          Applying action to your account...
                        </div>
                      )}

                      {actionStatuses[i] === 'approved' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Approved & Added to Your Financial Records
                        </div>
                      )}

                      {actionStatuses[i] === 'rejected' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          <XCircle size={14} /> Declined by user
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                <Bot size={16} className="spin" />
                <span>FinGuide AI is analyzing your financial records...</span>
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
          <input
            type="text"
            className="form-input"
            placeholder={useReactMode ? "Ask FinGuide about budgets, savings, or spending..." : "Ask about your finances..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
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
