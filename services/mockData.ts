import { ValueStreamData, TowerData, TrendPoint, SubMetric, LifecyclePhase } from '../types';

const towerDefinitions = [
  { id: 'sd', name: 'Service Desk', category: 'Support', desc: 'Unified user interaction and support.', streams: ['Experience-to-Engage', 'Onboard-to-Support', 'Request-to-Fulfill'] },
  { id: 'fts', name: 'Field Tech Support', category: 'Support', desc: 'Global physical technical response.', streams: ['Experience-to-Engage'] },
  { id: 'am', name: 'Asset Management', category: 'Operations', desc: 'Lifecycle asset tracking and governance.', streams: ['Onboard-to-Support', 'Regulate-to-Assure', 'Request-to-Fulfill'] },
  { id: 'app', name: 'Applications', category: 'Delivery', desc: 'Enterprise application health and logic.', streams: ['Design-to-Operate', 'Migrate-to-Modernize', 'Change-to-Release'] },
  { id: 'cloud', name: 'Cloud Services', category: 'Infrastructure', desc: 'Hybrid and multi-cloud platforms.', streams: ['Provision-to-Operate', 'Migrate-to-Modernize', 'Detect-to-Correct', 'Request-to-Fulfill'] },
  { id: 'net', name: 'Network', category: 'Infrastructure', desc: 'Core connectivity and SDN.', streams: ['Provision-to-Operate', 'Detect-to-Correct', 'Protect-to-Defend'] },
  { id: 'inf', name: 'Infrastructure', category: 'Infrastructure', desc: 'Server, storage, and datacenter operations.', streams: ['Design-to-Operate', 'Provision-to-Operate', 'Detect-to-Correct', 'Protect-to-Defend'] },
  { id: 'sec', name: 'Security', category: 'Governance', desc: 'Identity, threat detection, and compliance.', streams: ['Design-to-Operate', 'Regulate-to-Assure', 'Change-to-Release', 'Protect-to-Defend'] }
];

const valueStreamDefinitions: { id: string, name: string, phase: LifecyclePhase, outcome: string, desc: string, towers: string[] }[] = [
  { id: 'd2o', name: 'Design-to-Operate', phase: 'PLAN_BUILD', outcome: 'Faster time-to-market', desc: 'Design with lower risk and operational readiness.', towers: ['Applications', 'Security', 'Infrastructure'] },
  { id: 'p2o', name: 'Provision-to-Operate', phase: 'PLAN_BUILD', outcome: 'Faster env readiness', desc: 'Automated infrastructure provisioning.', towers: ['Cloud Services', 'Network', 'Infrastructure'] },
  { id: 'm2m', name: 'Migrate-to-Modernize', phase: 'PLAN_BUILD', outcome: 'Reduced migration risk', desc: 'Legacy to cloud modernization paths.', towers: ['Cloud Services', 'Applications'] },
  { id: 'e2e', name: 'Experience-to-Engage', phase: 'GOVERNANCE', outcome: 'Enhanced productivity', desc: 'CSAT and user self-service friction reduction.', towers: ['Service Desk', 'Field Tech Support'] },
  { id: 'o2s', name: 'Onboard-to-Support', phase: 'GOVERNANCE', outcome: 'Predictable takeover', desc: 'Service transition and CMDB reconciliation.', towers: ['Service Desk', 'Asset Management'] },
  { id: 'r2a', name: 'Regulate-to-Assure', phase: 'GOVERNANCE', outcome: 'Audit readiness', desc: 'Compliance dashboards and risk reduction.', towers: ['Security', 'Asset Management'] },
  { id: 'd2c', name: 'Detect-to-Correct', phase: 'RUN_OPTIMIZE', outcome: 'Faster recovery', desc: 'AIOps driven incident correlation and resolution.', towers: ['Network', 'Cloud Services', 'Infrastructure'] },
  { id: 'r2f', name: 'Request-to-Fulfill', phase: 'RUN_OPTIMIZE', outcome: 'Faster fulfillment', desc: 'End-to-end automated request workflows.', towers: ['Service Desk', 'Asset Management', 'Cloud Services'] },
  { id: 'c2r', name: 'Change-to-Release', phase: 'RUN_OPTIMIZE', outcome: 'Better change delivery', desc: 'Risk-assessed automated deployment pipelines.', towers: ['Applications', 'Security'] },
  { id: 'p2d', name: 'Protect-to-Defend', phase: 'RUN_OPTIMIZE', outcome: 'Reduced cyber exposure', desc: 'Vulnerability patching and governance.', towers: ['Security', 'Infrastructure', 'Network'] }
];

const anomalyReasons = [
  'Process bottleneck detected',
  'Inter-tower dependency failure',
  'Throughput degradation',
  'High incident volume spike',
  'Governance threshold violation'
];

const generateTrend = (baseHealth: number): TrendPoint[] => {
  const points: TrendPoint[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    let score = baseHealth + (Math.random() - 0.5) * 8;
    score = Math.max(0, Math.min(100, score));
    const isAnomaly = Math.random() > 0.96;
    let description = undefined;
    if (isAnomaly) {
      score = score - 25;
      description = anomalyReasons[Math.floor(Math.random() * anomalyReasons.length)];
    }
    points.push({
      timestamp: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      healthScore: Math.round(score),
      anomaly: isAnomaly,
      anomalyDescription: description,
      impactSeverity: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM'
    });
  }
  return points;
};

const generateSubMetrics = (base: number) => [
  { label: 'Operational Health', value: Math.round(base + 2) },
  { label: 'Strategic Alignment', value: Math.round(base - 4) },
  { label: 'Resource Efficiency', value: Math.round(base + 3) }
];

export const fetchValueStreamData = (): ValueStreamData[] => {
  return valueStreamDefinitions.map(vs => {
    const base = 82 + (Math.random() * 12);
    return {
      id: vs.id,
      name: vs.name,
      phase: vs.phase,
      outcome: vs.outcome,
      description: vs.desc,
      automationLevel: Math.round(65 + (Math.random() * 30)),
      healthScore: Math.round(base),
      trend: generateTrend(base),
      contributingTowers: vs.towers,
      subMetrics: generateSubMetrics(base)
    };
  });
};

export const fetchTowerData = (): TowerData[] => {
  return towerDefinitions.map(t => {
    const base = 78 + (Math.random() * 18);
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.desc,
      healthScore: Math.round(base),
      trend: generateTrend(base),
      subMetrics: generateSubMetrics(base),
      supportedStreams: t.streams
    };
  });
};