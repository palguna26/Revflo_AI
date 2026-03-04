RevFlo Scoring Specification
Velocity Stability

Measure:

PR frequency per week

Std deviation
Normalize:
velocity_score = 100 - normalized_std_dev

Scope Control

Measure:

% of PRs aligned with roadmap
scope_score = 100 - (misaligned_ratio * 100)

Review Efficiency

Measure:

Avg review time
review_score = 100 - normalized_review_time

Fragmentation Risk

Measure:

Burst of small PRs (<50 LOC)
fragmentation_score = 100 - burst_ratio

Drift Risk

Measure:

% new semantic clusters
drift_score = 100 - drift_ratio