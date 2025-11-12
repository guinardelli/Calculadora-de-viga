
import React from 'react';

interface BeamVisualizerProps {
  bw: number;
  h: number;
  d: number;
  cover: number;
  as: number;
}

export const BeamVisualizer: React.FC<BeamVisualizerProps> = ({ bw, h, d, cover, as }) => {
  if (!bw || !h || !d || !as) return null;

  const BAR_DIAMETER_MM = 16;
  const BAR_AREA_CM2 = Math.PI * Math.pow(BAR_DIAMETER_MM / 10 / 2, 2);
  const numBars = Math.max(2, Math.round(as / BAR_AREA_CM2));

  const SVG_WIDTH = 300;
  const scale = SVG_WIDTH / (bw * 1.5);
  const svg_h = h * scale;
  const svg_bw = bw * scale;
  const svg_d = d * scale;
  const svg_cover = cover * scale;
  const bar_radius = (BAR_DIAMETER_MM / 10 * scale) / 2;

  const PADDING = 20;

  const barSpacing = (svg_bw - 2 * svg_cover - 2 * (1 * scale)) / Math.max(1, numBars -1);
  const barPositions = Array.from({ length: numBars }, (_, i) => 
    svg_cover + (1 * scale) + (numBars > 1 ? i * barSpacing : (svg_bw - 2*svg_cover - 2*(1*scale))/2)
  );

  return (
    <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Seção Transversal da Viga</h3>
      <svg
        viewBox={`-${PADDING} -${PADDING} ${svg_bw + 2 * PADDING} ${svg_h + 2 * PADDING}`}
        className="w-full h-auto"
      >
        {/* Concrete Section */}
        <rect x="0" y="0" width={svg_bw} height={svg_h} fill="#D1D5DB" stroke="#6B7280" strokeWidth="2" />

        {/* Stirrup */}
        <rect x={svg_cover} y={svg_cover} width={svg_bw - 2*svg_cover} height={svg_h - 2*svg_cover}
              fill="none" stroke="#9CA3AF" strokeWidth="1.5" rx="2"/>

        {/* Rebars */}
        {barPositions.map((posX, index) => (
          <circle key={index} cx={posX} cy={svg_h - svg_cover - (1 * scale)} r={bar_radius} fill="#4B5563" />
        ))}

        {/* Dimensions */}
        {/* Height (h) */}
        <path d={`M ${svg_bw + 5},0 L ${svg_bw + 10},0 L ${svg_bw + 10},${svg_h} L ${svg_bw + 5},${svg_h}`}
              stroke="#1F2937" strokeWidth="1" fill="none" />
        <text x={svg_bw + 15} y={svg_h / 2} alignmentBaseline="middle" textAnchor="start" fontSize="10" fill="#1F2937">
          h = {h.toFixed(1)} cm
        </text>

        {/* Width (bw) */}
        <path d={`M 0,${svg_h + 5} L 0,${svg_h + 10} L ${svg_bw},${svg_h + 10} L ${svg_bw},${svg_h + 5}`}
              stroke="#1F2937" strokeWidth="1" fill="none" />
        <text x={svg_bw / 2} y={svg_h + 20} textAnchor="middle" fontSize="10" fill="#1F2937">
          bw = {bw.toFixed(1)} cm
        </text>

        {/* Effective Depth (d) */}
        <path d={`M -5,0 L -10,0 L -10,${svg_h - svg_cover - (1*scale)} L -5,${svg_h - svg_cover - (1*scale)}`}
              stroke="red" strokeWidth="1" fill="none" />
        <line x1="-10" y1={svg_h - svg_cover - (1*scale)} x2="0" y2={svg_h - svg_cover - (1*scale)} stroke="red" strokeDasharray="2,2" strokeWidth="1" />
        <text x="-15" y={(svg_h - svg_cover - (1*scale))/2} alignmentBaseline="middle" textAnchor="end" fontSize="10" fill="red">
          d = {d.toFixed(1)} cm
        </text>

      </svg>
    </div>
  );
};
