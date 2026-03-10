// ─── Risk Scoring Service ─────────────────────────────────
// Simplified keyword-based + report-count scoring.
// Architecture designed for future AI integration.

// ─── Toxicity Keywords ─────────────────────────────────────

const TOXICITY_KEYWORDS = [
    "kill", "die", "hate", "stupid", "idiot", "moron",
    "racist", "sexist", "nazi", "terrorist", "bomb",
    "threat", "attack", "violence", "abuse", "harass",
    "slur", "bigot", "extremist", "radical",
];

// ─── Score Thresholds ──────────────────────────────────────

const REPORT_COUNT_ESCALATION_THRESHOLD = 5;
const AUTO_FLAG_SCORE_THRESHOLD = 50;

// ─── Calculate Risk Score ──────────────────────────────────
// Returns a numeric score between 0–100.
// Factors: keyword matches (0–60) + report count (0–40)

export const calculateRiskScore = (
    content: string,
    reportCount: number
): number => {
    const keywordScore = calculateKeywordScore(content);
    const reportScore = calculateReportScore(reportCount);

    return Math.min(100, keywordScore + reportScore);
};

// ─── Keyword-Based Score (0–60) ────────────────────────────

const calculateKeywordScore = (content: string): number => {
    if (!content) return 0;

    const lowerContent = content.toLowerCase();
    let matchCount = 0;

    for (const keyword of TOXICITY_KEYWORDS) {
        if (lowerContent.includes(keyword)) {
            matchCount++;
        }
    }

    // Each keyword match adds 15 points, capped at 60
    return Math.min(60, matchCount * 15);
};

// ─── Report Count Score (0–40) ─────────────────────────────

const calculateReportScore = (reportCount: number): number => {
    if (reportCount === 0) return 0;
    if (reportCount >= REPORT_COUNT_ESCALATION_THRESHOLD) return 40;

    // Linear scale: each report adds 8 points
    return Math.min(40, reportCount * 8);
};

// ─── Should Auto-Flag ──────────────────────────────────────

export const shouldAutoFlag = (riskScore: number): boolean => {
    return riskScore >= AUTO_FLAG_SCORE_THRESHOLD;
};

// ─── Should Escalate ───────────────────────────────────────

export const shouldEscalate = (reportCount: number): boolean => {
    return reportCount > REPORT_COUNT_ESCALATION_THRESHOLD;
};
