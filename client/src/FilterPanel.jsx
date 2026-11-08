import { useEffect, useState } from 'react';
import { FOOT_TRAFFIC_OPTIONS, MACHINE_TYPES } from './listingOptions.js';

const pillClass = (selected) =>
  `text-xs font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
    selected
      ? 'bg-accent border-accent text-accent-ink font-semibold'
      : 'bg-input-bg border-border text-muted hover:border-accent'
  }`;

function FilterPanel({ onChange, counts = {}, showRadius = true }) {
  const [machineTypes, setMachineTypes] = useState([]);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [footTraffic, setFootTraffic] = useState(null);

  useEffect(() => {
    onChange?.({ machineTypes, radiusMiles, footTraffic });
  }, [machineTypes, radiusMiles, footTraffic, onChange]);

  const toggleMachineType = (value) => {
    setMachineTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleFootTraffic = (value) => {
    setFootTraffic((prev) => (prev === value ? null : value));
  };

  return (
    <aside className="bg-surface border border-border rounded-card shadow-card p-5 w-full">
      <h2 className="text-sm font-bold text-text mb-4">Filters</h2>

      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2.5">
          Machine type
        </label>
        {MACHINE_TYPES.map((mt) => (
          <label
            key={mt.value}
            className="flex items-center gap-2 py-1 text-sm text-text cursor-pointer"
          >
            <input
              type="checkbox"
              checked={machineTypes.includes(mt.value)}
              onChange={() => toggleMachineType(mt.value)}
              className="w-4 h-4 accent-accent"
            />
            {mt.label}
            {counts[mt.value] != null && (
              <span className="ml-auto text-faint text-xs">{counts[mt.value]}</span>
            )}
          </label>
        ))}
      </div>

      {showRadius && (
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2.5">
            Radius - {radiusMiles} mi (free cap)
          </label>
          <input
            type="range"
            min={5}
            max={25}
            step={5}
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      )}

      <div className="mb-6 last:mb-0">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2.5">
          Foot traffic
        </label>
        <div className="flex flex-wrap gap-2">
          {FOOT_TRAFFIC_OPTIONS.map((ft) => (
            <button
              key={ft.value}
              type="button"
              onClick={() => toggleFootTraffic(ft.value)}
              className={pillClass(footTraffic === ft.value)}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 p-3 rounded-control bg-pending-surface border border-pending/25 text-xs text-muted leading-relaxed">
        <b className="text-pending">Pro</b> unlocks nationwide radius,
        the foot-traffic filter shown above, and priority
        placement in results.
      </div>
    </aside>
  );
}

export default FilterPanel;
