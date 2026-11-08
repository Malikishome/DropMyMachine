export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'traffic', label: 'Most traffic' },
];

const TRAFFIC_RANK = { high: 3, medium: 2, low: 1 };

const createdTime = (listing) => {
  const time = new Date(listing.created_at).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const byNewest = (a, b) => createdTime(b) - createdTime(a);

const byTraffic = (a, b) =>
  (TRAFFIC_RANK[b.foot_traffic] ?? 0) - (TRAFFIC_RANK[a.foot_traffic] ?? 0) || byNewest(a, b);

export function sortListings(listings, sortKey) {
  const compare = sortKey === 'traffic' ? byTraffic : byNewest;
  return [...listings].sort(compare);
}
