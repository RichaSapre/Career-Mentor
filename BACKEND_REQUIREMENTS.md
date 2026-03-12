# Missing Backend Requirements

Only endpoints **not yet implemented** or **not working** with the frontend are listed here.

---

## GET /recommendations — Missing (404)

**Purpose:** Personalized role recommendations for the logged-in user. Shown on the Market Analyzer "Personalized Trajectory" section and Dashboard "AI Trajectory Consensus".

**Request:**
```
GET /alpha/api/v1/recommendations
Authorization: Bearer <accessToken>
```

**Expected Response:**
```json
[
  {
    "roleId": "role-1",
    "roleTitle": "Data Analyst",
    "fitScore": 85,
    "missingSkills": ["Tableau"],
    "explanation": "Strong match based on your Python + SQL + analysis skills"
  },
  {
    "roleId": "role-2",
    "roleTitle": "Software Engineer",
    "fitScore": 74,
    "missingSkills": ["DSA practice"],
    "explanation": "Good fit, but strengthen DSA to improve competitiveness"
  }
]
```

**Alternative response format (also supported):**
```json
{
  "data": [
    { "role_id": "role-1", "role_title": "Data Analyst", "fit_score": 85, "missing_skills": ["Tableau"], "explanation": "..." }
  ]
}
```

**Note:** If this endpoint is not implemented, the frontend falls back to demo data. The app works, but recommendations are static instead of personalized.
