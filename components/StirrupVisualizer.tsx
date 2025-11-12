
import React from 'react';

interface StirrupVisualizerProps {
  bw: number;
  h: number;
  cover: number;
  stirrupDiameter: number;
  s_adopted: number;
}

const COLORS = {
  slate: {
    200: '#E2E8F0',
    400: '#94A3B8',
    500: '#64748B',
    800: '#1E293B',
  },
  green: {
    600: '#059669',
    700: '#047857',
  }
};

export const StirrupVisualizer: React.FC<StirrupVisualizerProps> = ({ bw, h, cover, stirrupDiameter, s_adopted }) => {
  if (!bw || !h || !cover || !stirrupDiameter || !s_adopted || [bw, h, cover, s_adopted].some(v => v <= 0)) {
    return null;
  }

  // --- SVG Constants ---
  const VIEWBOX_W = 400;
  const VIEWBOX_H = 500;
  const PADDING_V = 60;
  const DRAW_AREA_H = VIEWBOX_H - 2 * PADDING_V;

  // --- Scaling & Positioning ---
  const scale = DRAW_AREA_H / h;
  const svg_h = h * scale;
  const svg_bw = bw * scale;
  const svg_cover = cover * scale;
  const svg_stirrup_d = (stirrupDiameter / 10) * scale;
  const offsetX = (VIEWBOX_W - svg_bw) / 2;
  const offsetY = PADDING_V;

  // --- Bar Details (for visual context) ---
  const mainBarDiameterCm = 1.25; // 12.5mm bar for context
  const mainBarRadius = (mainBarDiameterCm / 2) * scale;
  const stirrupRadius = svg_stirrup_d / 2;

  const barCenterX_left = offsetX + svg_cover + stirrupRadius;
  const barCenterX_right = offsetX + svg_bw - svg_cover - stirrupRadius;
  const barCenterY_top = offsetY + svg_cover + stirrupRadius;
  const barCenterY_bottom = offsetY + svg_h - svg_cover - stirrupRadius;


  return (
    <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">Detalhe da Armadura Transversal</h3>
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full h-auto max-w-sm mx-auto"
        aria-label="Visualização da seção transversal com estribos."
      >
        <defs>
          <marker id="arrow-dim-shear" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.slate[800]} />
          </marker>
        </defs>

        {/* --- Cross Section Drawing --- */}
        <g id="cross-section">
          {/* Concrete Section */}
          <rect x={offsetX} y={offsetY} width={svg_bw} height={svg_h} fill={COLORS.slate[200]} stroke={COLORS.slate[500]} strokeWidth="1.5" />
          
          {/* Stirrup */}
          <rect 
            x={offsetX + svg_cover} y={offsetY + svg_cover} 
            width={svg_bw - 2 * svg_cover} height={svg_h - 2 * svg_cover}
            fill="none" stroke={COLORS.green[600]} strokeWidth={svg_stirrup_d} rx={svg_stirrup_d}
          />
          
          {/* Main Bars (for context) */}
          <circle cx={barCenterX_left} cy={barCenterY_top} r={mainBarRadius} fill={COLORS.slate[800]} />
          <circle cx={barCenterX_right} cy={barCenterY_top} r={mainBarRadius} fill={COLORS.slate[800]} />
          <circle cx={barCenterX_left} cy={barCenterY_bottom} r={mainBarRadius} fill={COLORS.slate[800]} />
          <circle cx={barCenterX_right} cy={barCenterY_bottom} r={mainBarRadius} fill={COLORS.slate[800]} />

          {/* Dimension: h */}
          <line x1={offsetX + svg_bw + 15} y1={offsetY} x2={offsetX + svg_bw + 15} y2={offsetY + svg_h} stroke={COLORS.slate[800]} strokeWidth="1" markerStart="url(#arrow-dim-shear)" markerEnd="url(#arrow-dim-shear)" />
          <line x1={offsetX + svg_bw} y1={offsetY} x2={offsetX + svg_bw + 15} y2={offsetY} stroke={COLORS.slate[400]} strokeWidth="1" />
          <line x1={offsetX + svg_bw} y1={offsetY + svg_h} x2={offsetX + svg_bw + 15} y2={offsetY + svg_h} stroke={COLORS.slate[400]} strokeWidth="1" />
          <text x={offsetX + svg_bw + 22} y={offsetY + svg_h / 2} alignmentBaseline="middle" textAnchor="start" fontSize="14" fill={COLORS.slate[800]} className="font-sans font-semibold">
            h={h.toFixed(1)}
          </text>

          {/* Dimension: bw */}
          <line x1={offsetX} y1={offsetY + svg_h + 15} x2={offsetX + svg_bw} y2={offsetY + svg_h + 15} stroke={COLORS.slate[800]} strokeWidth="1" markerStart="url(#arrow-dim-shear)" markerEnd="url(#arrow-dim-shear)"/>
          <line x1={offsetX} y1={offsetY + svg_h} x2={offsetX} y2={offsetY + svg_h + 15} stroke={COLORS.slate[400]} strokeWidth="1" />
          <line x1={offsetX + svg_bw} y1={offsetY + svg_h} x2={offsetX + svg_bw} y2={offsetY + svg_h + 15} stroke={COLORS.slate[400]} strokeWidth="1" />
          <text x={offsetX + svg_bw / 2} y={offsetY + svg_h + 32} textAnchor="middle" fontSize="14" fill={COLORS.slate[800]} className="font-sans font-semibold">
            b_w={bw.toFixed(1)}
          </text>
        </g>
      </svg>
      <div className="text-center mt-4 bg-slate-50 p-3 rounded-lg">
        <p className="text-lg font-bold text-green-700">
          Estribo: Ø{stirrupDiameter.toFixed(1)} c/ {s_adopted.toFixed(1)} cm
        </p>
      </div>
    </div>
  );
};
