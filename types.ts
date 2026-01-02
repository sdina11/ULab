export type LifecyclePhase = 'PLAN_BUILD' | 'GOVERNANCE' | 'RUN_OPTIMIZE';
export type ViewMode = 'VALUE_STREAMS' | 'TOWERS';

export interface TrendPoint {
  timestamp: string;
  healthScore: number;
  anomaly?: boolean;
  anomalyDescription?: string;
  impactSeverity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SubMetric {
  label: string;
  value: number;
}

export interface OrchestrationEvent {
  id: string;
  timestamp: string;
  stream: string;
  action: string;
  status: 'EXECUTING' | 'COMPLETED' | 'FAILED';
}

export interface ValueStreamData {
  id: string;
  name: string;
  phase: LifecyclePhase;
  outcome: string;
  description: string;
  automationLevel: number;
  healthScore: number;
  trend: TrendPoint[];
  subMetrics: SubMetric[];
  contributingTowers: string[];
}

export interface TowerData {
  id: string;
  name: string;
  category: string;
  description: string;
  healthScore: number;
  trend: TrendPoint[];
  subMetrics: SubMetric[];
  supportedStreams: string[];
}

export const HealthStatusLevels = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  RISK: 'RISK'
};
