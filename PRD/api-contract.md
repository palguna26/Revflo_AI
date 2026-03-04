RevFlo API Contract
POST /api/run-analysis

Request:
{
organization_id: string
}

Response:
{
report_id: string
}

GET /api/report/:id

Response:
{
score: number,
breakdown: { velocity, scope, review, fragmentation, drift },
summary: string,
risks: []
}

POST /api/webhook/github

GitHub event payload

Response:
200 OK