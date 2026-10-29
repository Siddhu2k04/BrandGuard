// A transparent local demo analyzer. Replace this with your AI/backend API for production results.
export function analyzeContent(item, guidelines) {
  const text = `${item.title || ''} ${item.description || ''} ${item.type === 'Text' ? item.text || '' : ''}`.toLowerCase();
  const issues = [];
  if (!text.trim()) issues.push({ issue: 'No readable text provided', severity: 'High', reference: 'Content Quality – Section 1.1', suggestion: 'Add a clear title and content description.' });
  if (/guaranteed|100% cure|risk-free|best in the world|#1 in the world/.test(text)) {
    issues.push({ issue: 'Potentially unverified claim', severity: 'High', reference: 'Compliance – Section 5.1', suggestion: 'Substantiate the claim or use more precise wording.' });
  }
  if (item.title && item.title.length > 80) issues.push({ issue: 'Title may be too long', severity: 'Low', reference: 'Messaging & Tone – Section 1.2', suggestion: 'Use a shorter, clearer title.' });
  if (item.description && item.description.length < 20) issues.push({ issue: 'Description needs more context', severity: 'Medium', reference: 'Content Quality – Section 1.3', suggestion: 'Add audience, purpose, and relevant context.' });
  if (!/[.!?]$/.test(item.description || '') && (item.description || '').length > 20) issues.push({ issue: 'Description punctuation', severity: 'Low', reference: 'Writing Style – Section 2.4', suggestion: 'Review the final sentence punctuation.' });
  if (!issues.length) issues.push({ issue: 'No obvious text-level issues detected', severity: 'Low', reference: 'Automated preliminary check', suggestion: 'Review the content manually against the full company guidelines.' });
  const high = issues.filter(x => x.severity === 'High').length;
  const medium = issues.filter(x => x.severity === 'Medium').length;
  const score = Math.max(45, Math.min(98, 96 - high * 18 - medium * 8 - issues.filter(x => x.severity === 'Low').length * 3));
  return {
    score,
    status: score >= 85 ? 'Good' : score >= 70 ? 'Needs review' : 'At risk',
    issues,
    guidelineTitle: guidelines?.title || 'Company Guidelines PDF',
    analyzedAt: new Date().toISOString(),
    disclaimer: 'Preliminary local text checks only. This is not AI-powered brand compliance analysis and does not inspect image pixels or the contents of linked webpages.'
  };
}
