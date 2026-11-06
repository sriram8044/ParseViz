import axios from 'axios';
import type {
  HealthStatus,
  GrammarResponse,
  ExampleGrammar,
  TransformResponse,
  FirstFollowResponse,
  ParsingTableResponse,
  ParseResultResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiService = {
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },

  async parseGrammar(grammar: string, startSymbol?: string): Promise<GrammarResponse> {
    const response = await apiClient.post<GrammarResponse>('/grammar/parse', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  async validateGrammar(grammar: string, startSymbol?: string): Promise<GrammarResponse> {
    const response = await apiClient.post<GrammarResponse>('/grammar/validate', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  async analyzeGrammar(grammar: string, startSymbol?: string): Promise<GrammarResponse> {
    const response = await apiClient.post<GrammarResponse>('/grammar/analyze', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  async getExamples(): Promise<ExampleGrammar[]> {
    const response = await apiClient.get<ExampleGrammar[]>('/grammar/examples');
    return response.data;
  },

  // Compiler Transformations
  async eliminateLeftRecursion(grammar: string, startSymbol?: string): Promise<TransformResponse> {
    const response = await apiClient.post<TransformResponse>('/grammar/transform/left-recursion', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  async leftFactor(grammar: string, startSymbol?: string): Promise<TransformResponse> {
    const response = await apiClient.post<TransformResponse>('/grammar/transform/left-factoring', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  // FIRST & FOLLOW Sets
  async getFirstFollow(grammar: string, startSymbol?: string): Promise<FirstFollowResponse> {
    const response = await apiClient.post<FirstFollowResponse>('/grammar/first-follow', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  // LL(1) Parsing Table
  async getParsingTable(grammar: string, startSymbol?: string): Promise<ParsingTableResponse> {
    const response = await apiClient.post<ParsingTableResponse>('/grammar/parsing-table', {
      grammar,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  // Parsing Simulator & Tree
  async simulateParse(grammar: string, inputString: string, startSymbol?: string): Promise<ParseResultResponse> {
    const response = await apiClient.post<ParseResultResponse>('/parser/parse', {
      grammar,
      input_string: inputString,
      start_symbol: startSymbol || null,
    });
    return response.data;
  },

  // Demonstration Mode
  async getDemonstrationWorkflow(): Promise<import('../types').DemoWorkflowData> {
    const response = await apiClient.get<import('../types').DemoWorkflowData>('/demo/workflow');
    return response.data;
  },
};

export default apiService;
