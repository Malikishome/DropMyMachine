export function formatPostedDate(createdAt) {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const diffDays = Math.floor((Date.now() - created.getTime()) / 86400000);
  if (diffDays <= 0) return 'Posted today';
  if (diffDays === 1) return 'Posted 1d ago';
  if (diffDays < 7) return `Posted ${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? 'Posted 1 week ago' : `Posted ${diffWeeks} weeks ago`;
}
