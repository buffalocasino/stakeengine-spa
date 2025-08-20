export interface GameConfig {
  game_id: string;
  provider_name: string;
  game_name: string;
  rtp: number;
  house_edge: number;
  max_bet: number;
  paylines?: Record<string, number[]>;
  symbols?: Record<string, any>;
}

export interface SpinRequest {
  bet_amount: number;
  game_config: GameConfig;
  board?: string[][];
}

export interface SpinResult {
  board: string[][];
  total_win: number;
  wins: Array<{
    symbol: string;
    kind: number;
    win: number;
    positions: number[][];
    meta: Record<string, any>;
  }>;
  rtp: number;
  house_edge: number;
}

export interface SimulationRequest {
  game_config: GameConfig;
  num_spins?: number;
  bet_amount?: number;
}

export interface SimulationResult {
  total_spins: number;
  total_bet: number;
  total_win: number;
  actual_rtp: number;
  hit_frequency: number;
  max_win: number;
  min_win: number;
}

class MathApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/health');
  }

  async getDefaultConfig(): Promise<GameConfig> {
    return this.request('/api/config/default');
  }

  async uploadConfig(config: GameConfig): Promise<{ status: string; message: string; config: GameConfig }> {
    return this.request('/api/config/upload', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async spin(request: SpinRequest): Promise<SpinResult> {
    return this.request('/api/game/spin', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async simulate(request: SimulationRequest): Promise<SimulationResult> {
    return this.request('/api/game/simulate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const mathApi = new MathApiClient();
