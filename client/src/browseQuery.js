export function buildListingsQuery({ machineTypes = [], footTraffic = null, city = '' } = {}) {
  const params = new URLSearchParams();
  if (machineTypes.length > 0) params.set('machine_type', machineTypes.join(','));
  if (footTraffic) params.set('foot_traffic', footTraffic);
  const trimmedCity = city.trim();
  if (trimmedCity) params.set('city', trimmedCity);
  return params.toString();
}
