import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { reports, matches, notifications } from '../../db/schema';
import { getReportById } from '../../repositories/reports';

// Configurable weights
const WEIGHTS = {
  KEYWORDS: 35,
  CATEGORY: 25,
  LOCATION: 20,
  DATE: 20,
};

const MATCH_THRESHOLD = 40; // Minimum score to consider a potential match

function calculateKeywordScore(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  let matchCount = 0;
  
  for (const w of words2) {
    if (set1.has(w)) matchCount++;
  }
  
  return Math.min(100, (matchCount / Math.min(set1.size, words2.length)) * 100);
}

function calculateDateScore(date1: string, date2: string): number {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  
  if (diffDays === 0) return 100;
  if (diffDays <= 3) return 80;
  if (diffDays <= 7) return 50;
  if (diffDays <= 14) return 20;
  return 0;
}

function calculateLocationScore(loc1: string, loc2: string): number {
  // Simplified matching for location
  const l1 = loc1.toLowerCase();
  const l2 = loc2.toLowerCase();
  if (l1 === l2) return 100;
  if (l1.includes(l2) || l2.includes(l1)) return 80;
  
  return calculateKeywordScore(l1, l2); // fallback to keyword similarity
}

export async function triggerMatching(reportId: string) {
  try {
    const report = await getReportById(reportId);
    if (!report || report.status !== 'ACTIVE') return;

    const targetType = report.reportType === 'LOST' ? 'FOUND' : 'LOST';

    // Find active opposite reports
    const candidates = await db
      .select()
      .from(reports)
      .where(and(eq(reports.reportType, targetType), eq(reports.status, 'ACTIVE')));

    for (const candidate of candidates) {
      let score = 0;

      // Category match
      if (report.category === candidate.category) {
        score += WEIGHTS.CATEGORY;
      }

      // Keyword match (Title + Description)
      const text1 = `${report.title} ${report.description}`;
      const text2 = `${candidate.title} ${candidate.description}`;
      const kwScore = calculateKeywordScore(text1, text2);
      score += (kwScore / 100) * WEIGHTS.KEYWORDS;

      // Location match
      const locScore = calculateLocationScore(report.location, candidate.location);
      score += (locScore / 100) * WEIGHTS.LOCATION;

      // Date match
      const dateScore = calculateDateScore(report.eventDate, candidate.eventDate);
      score += (dateScore / 100) * WEIGHTS.DATE;

      if (score >= MATCH_THRESHOLD) {
        // Create match record
        const lostReportId = report.reportType === 'LOST' ? report.id : candidate.id;
        const foundReportId = report.reportType === 'FOUND' ? report.id : candidate.id;

        // Check if match already exists to avoid duplicates
        const existing = await db
          .select()
          .from(matches)
          .where(and(eq(matches.lostReportId, lostReportId), eq(matches.foundReportId, foundReportId)))
          .limit(1);

        if (existing.length === 0) {
          const [newMatch] = await db.insert(matches).values({
            lostReportId,
            foundReportId,
            score: Math.round(score),
            status: 'PENDING'
          }).returning();

          // Notify both parties
          await db.insert(notifications).values([
            {
              userId: report.userId,
              type: 'POTENTIAL_MATCH',
              message: `A potential match was found for your ${report.reportType.toLowerCase()} item: ${report.title}`,
              relatedMatchId: newMatch.id,
              relatedReportId: report.id,
            },
            {
              userId: candidate.userId,
              type: 'POTENTIAL_MATCH',
              message: `A potential match was found for your ${candidate.reportType.toLowerCase()} item: ${candidate.title}`,
              relatedMatchId: newMatch.id,
              relatedReportId: candidate.id,
            }
          ]);
        }
      }
    }
  } catch (error) {
    console.error('Error in matching engine:', error);
  }
}
