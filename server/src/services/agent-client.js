import { readFileSync } from 'fs';
import axios from 'axios';
import config from '../config.js';

/**
 * Client for communicating with the Python agent service.
 * All AI/analysis logic lives in the Python service; Node.js proxies requests.
 */
class AgentClient {
  constructor() {
    this.baseUrl = config.agentServiceUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // 60s timeout for AI responses
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Send user financial data to the agent for analysis.
   * @param {object} data - { user_context, income_data, expense_data, transactions, goals, history, query }
   * @returns {object} - AI-generated analysis
   */
  async analyze(data) {
    try {
      const response = await this.client.post('/analyze', data);
      return response.data;
    } catch (err) {
      console.error('Agent analyze error:', err.message);
      throw new Error(err.response?.data?.detail || 'Agent service unavailable');
    }
  }

  /**
   * Send a chat message to the AI advisor.
   * @param {object} data - { user_context, message, conversation_history, financial_data }
   * @returns {object} - AI response
   */
  async chat(data) {
    try {
      const response = await this.client.post('/chat', data);
      return response.data;
    } catch (err) {
      console.error('Agent chat error:', err.message);
      throw new Error(err.response?.data?.detail || 'Agent service unavailable');
    }
  }

  /**
   * Run ReAct loop with tool reasoning and HITL proposals.
   * @param {object} data - { user_context, message, conversation_history, financial_data }
   * @returns {object} - { thought_steps, raw_text, hitl_action, status }
   */
  async reactChat(data) {
    try {
      const response = await this.client.post('/react', data);
      return response.data;
    } catch (err) {
      console.error('Agent react error:', err.message);
      throw new Error(err.response?.data?.detail || 'Agent service unavailable');
    }
  }

  /**
   * Request a budget proposal from the agent.
   * @param {object} data - { income_data, expense_data, transactions, goals, history }
   * @returns {object} - Budget proposal
   */
  async proposeBudget(data) {
    try {
      const response = await this.client.post('/budget', data);
      return response.data;
    } catch (err) {
      console.error('Agent budget error:', err.message);
      throw new Error(err.response?.data?.detail || 'Agent service unavailable');
    }
  }

  /**
   * Request a forecast from the agent.
   * @param {object} data - { transactions, snapshots, months_ahead }
   * @returns {object} - Forecast data
   */
  async forecast(data) {
    try {
      const response = await this.client.post('/forecast', data);
      return response.data;
    } catch (err) {
      console.error('Agent forecast error:', err.message);
      throw new Error(err.response?.data?.detail || 'Agent service unavailable');
    }
  }

  /**
   * Request pure statistical time series forecast (ARIMA/SARIMA/ETS) - NO Gemini dependency.
   * @param {object} data - { history: Array, months_ahead: number, model_type: string }
   * @returns {object} - { eligible, historical_count, forecast, model_used, disclaimer, message }
   */
  async getTimeSeriesForecast(data) {
    try {
      const response = await this.client.post('/time-series-forecast', data);
      return response.data;
    } catch (err) {
      console.error('Agent getTimeSeriesForecast error:', err.message);
      throw new Error(err.response?.data?.detail || 'Statistical time series engine unavailable');
    }
  }

  /**
   * Send PDF statement to Python agent for direct multimodal extraction without RAG.
   * @param {string} filePath - Path to uploaded PDF
   * @param {string} originalName - Name of the file
   * @returns {object} - { count, transactions }
   */
  async parsePdfStatement(filePath, originalName = 'statement.pdf') {
    try {
      const fileBuffer = readFileSync(filePath);
      const file_base64 = fileBuffer.toString('base64');
      console.log(`[AgentClient] Sending ${fileBuffer.length} bytes of ${originalName} to agent`);

      const response = await this.client.post('/parse-pdf', {
        file_base64,
        filename: originalName || 'statement.pdf',
      }, {
        timeout: 90000,
      });

      console.log(`[AgentClient] Agent returned ${response.data?.count} transactions`);
      return response.data;
    } catch (err) {
      console.error('Agent parsePdfStatement error:', err.message);
      throw new Error(err.response?.data?.detail || err.message || 'Failed to extract transactions from PDF statement');
    }
  }

  /**
   * Health check for the agent service.
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch {
      return { status: 'unavailable' };
    }
  }
}

export const agentClient = new AgentClient();
