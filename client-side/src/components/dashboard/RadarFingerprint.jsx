import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { radarData, radarDataPrevious } from '../../data/mockData';

// Merge current and previous data
const mergedData = radarData.map((d, i) => ({
  ...d,
  previous: radarDataPrevious[i].value,
  current: d.value,
}));

export default function RadarFingerprint() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Reasoning Fingerprint</h3>
          <p className="text-xs text-text-dim mt-1">5-axis cognitive profile · Live view</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet" />
            Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan opacity-50" />
            Previous
          </span>
        </div>
      </div>

      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={mergedData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="rgba(124, 58, 237, 0.12)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Inter' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Previous"
              dataKey="previous"
              stroke="#06B6D4"
              fill="#06B6D4"
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
