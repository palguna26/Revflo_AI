RevFlo LLM Prompt Templates
1. Roadmap Embedding Prompt

System:
You are a semantic encoder. Extract strategic themes and core objectives.

User:
Here is a product roadmap:
{{roadmap_text}}

Output:
Summarize key themes in structured bullet format.

2. Drift Evaluation Prompt

System:
You analyze whether a pull request aligns with a product roadmap.

User:
Roadmap Themes:
{{themes}}

Pull Request:
Title: {{title}}
Body: {{body}}

Return:
Alignment Score (0-100)
Short explanation.

Do not hallucinate.

3. Founder Summary Prompt

System:
You are an execution-focused startup advisor.

User:
Execution Metrics:
Velocity: {{velocity}}
Scope: {{scope}}
Review: {{review}}
Fragmentation: {{fragmentation}}
Drift: {{drift}}

Top Risks:
{{risks}}

Generate:
A concise executive-level summary under 200 words.
Be direct.
No fluff.