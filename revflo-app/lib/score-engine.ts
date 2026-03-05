export interface ExecutionMetrics {
    velocityStability: number; // 0-100
    scopeControl: number; // 0-100
    reviewEfficiency: number; // 0-100
    fragmentationRisk: number; // 0-100
    driftRisk: number; // 0-100
}

export function calculateExecutionScore(metrics: ExecutionMetrics): number {
    /*
    Formula from docs:
    Score = 
        0.30 * Velocity Stability
      + 0.25 * Scope Control
      + 0.20 * Review Efficiency
      + 0.15 * Fragmentation Risk
      + 0.10 * Drift Risk
    */

    const weightedScore =
        0.30 * metrics.velocityStability
        + 0.25 * metrics.scopeControl
        + 0.20 * metrics.reviewEfficiency
        + 0.15 * metrics.fragmentationRisk
        + 0.10 * metrics.driftRisk;

    return Math.round(weightedScore);
}

// Dummy calculator for when we don't have enough data
export function generateBaselineMetrics(): ExecutionMetrics {
    return {
        velocityStability: 85,
        scopeControl: 70,
        reviewEfficiency: 92,
        fragmentationRisk: 88,
        driftRisk: 65,
    };
}
