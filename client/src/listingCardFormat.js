export function formatRelativeDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
}

export function formatPostedDate(createdAt) {
  const relative = formatRelativeDate(createdAt);
  if (relative === null) return null;
  return relative === 'Today' ? 'Posted today' : `Posted ${relative}`;
}
