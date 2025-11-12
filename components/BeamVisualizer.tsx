import React from 'react';

interface BeamVisualizerProps {
  bw: number;
  h: number;
  d: number;
  cover: number;
  as: number;
  x: number;
  fck: number;
}

const COLORS = {
  slate: {
    100: '#F1F5F9',
    200: '#E2E8F0',
    400: '#94A3B8',
    500: '#64748B',
    800: '#1E293B',
  },
  red: {
    100: '#FEE2E2',
    500: '#EF4444',
    700: '#B91C1C',
  },
  blue: {
    500: '#3B82F6',
    600: '#2563EB',
    800: '#1E40AF',
  }
};

export const BeamVisualizer: React.FC<BeamVisualizerProps> = ({ bw, h, d, cover, as, x, fck }) => {
  if (!bw || !h || !d || !as || !x || !fck || bw <= 0 || h <= 0 || x <= 0) return null;

  // --- Constants for SVG drawing ---
  const VIEWBOX_W = 700;
  const VIEWBOX_H = 400;
  const PADDING_V = 50;
  const DRAW_AREA_H = VIEWBOX_H - 2 * PADDING_V;

  // --- Shared Vertical Scaling & Positioning ---
  const scale = DRAW_AREA_H / h;
  const offsetY = PADDING_V;
  const svg_h = h * scale;
  const svg_d = d * scale;
  const svg_x = x * scale;
  const svg_cover = cover * scale;

  // --- Part 1: Cross-Section ---
  const SECTION_AREA_W = 380;
  const svg_bw = bw * scale;
  const offsetX = (SECTION_AREA_W - svg_bw) / 2;
  const barCenterY = offsetY + svg_d;

  // Rebar calculation
  const BAR_DIAMETER_MM = 16;
  const BAR_AREA_CM2 = Math.PI * Math.pow(BAR_DIAMETER_MM / 20, 2);
  const numBars = Math.max(2, Math.round(as / BAR_AREA_CM2));
  const bar_radius = (BAR_DIAMETER_MM / 10 * scale) / 2;
  const stirrup_thickness_cm = 1.0;
  const svg_stirrup_thickness = stirrup_thickness_cm * scale;
  const barAreaWidth = svg_bw - 2 * svg_cover - 2 * svg_stirrup_thickness;
  const barSpacing = barAreaWidth / Math.max(1, numBars - 1);
  const barPositions = Array.from({ length: numBars }, (_, i) => 
    offsetX + svg_cover + svg_stirrup_thickness + (numBars > 1 ? i * barSpacing : barAreaWidth / 2)
  );

  // --- Part 2: Stress Diagram ---
  const DIAGRAM_START_X = 420;
  const DIAGRAM_BEAM_LINE_X = DIAGRAM_START_X + 50;
  const DIAGRAM_DRAW_AREA_W = 200;

  // Stress calculations based on NBR 6118
  const GAMMA_C = 1.4;
  const fcd = (fck / GAMMA_C) / 10; // kN/cm²
  const LAMBDA = fck <= 50 ? 0.8 : 0.8 - (fck - 50) / 400;
  const ALPHA_C = fck <= 50 ? 0.85 : 0.85 * (1 - (fck - 50) / 200);
  const sigma_cd = ALPHA_C * fcd; // kN/cm²
  const y_lambda_x = LAMBDA * x;

  const stress_scale = DIAGRAM_DRAW_AREA_W / (sigma_cd * 1.2);
  const comp_stress_width = sigma_cd * stress_scale;
  const y_cc = offsetY + (LAMBDA * svg_x) / 2;


  return (
    <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-white">
      <div className="grid grid-cols-2 gap-4 mb-2">
        <h3 className="text-lg font-semibold text-slate-800 text-center">Seção Transversal</h3>
        <h3 className="text-lg font-semibold text-slate-800 text-center">Diagrama de Tensões e Forças</h3>
      </div>
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full h-auto"
        aria-label={`Visualização da seção transversal e diagrama de tensões da viga.`}
      >
        <defs>
            <marker id="arrow-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.slate[800]} />
            </marker>
            <marker id="arrow-force" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.blue[600]} />
            </marker>
             <marker id="arrow-force-comp" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 10 0 L 0 5 L 10 10 z" fill={COLORS.red[500]} />
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
            fill="none" stroke={COLORS.slate[400]} strokeWidth="1.5" rx={svg_stirrup_thickness}
          />
          {/* Rebars */}
          {barPositions.map((posX, index) => (
            <circle key={index} cx={posX} cy={barCenterY} r={bar_radius} fill={COLORS.slate[800]} />
          ))}

          {/* Dimension: h */}
          <line x1={offsetX + svg_bw + 15} y1={offsetY} x2={offsetX + svg_bw + 15} y2={offsetY + svg_h} stroke={COLORS.slate[800]} strokeWidth="1" markerStart="url(#arrow-dim)" markerEnd="url(#arrow-dim)" />
          <line x1={offsetX + svg_bw} y1={offsetY} x2={offsetX + svg_bw + 15} y2={offsetY} stroke={COLORS.slate[400]} strokeWidth="1" />
          <line x1={offsetX + svg_bw} y1={offsetY + svg_h} x2={offsetX + svg_bw + 15} y2={offsetY + svg_h} stroke={COLORS.slate[400]} strokeWidth="1" />
          <text x={offsetX + svg_bw + 22} y={offsetY + svg_h / 2} alignmentBaseline="middle" textAnchor="start" fontSize="12" fill={COLORS.slate[800]} className="font-sans font-semibold">
            h={h.toFixed(1)}
          </text>

          {/* Dimension: bw */}
          <line x1={offsetX} y1={offsetY + svg_h + 15} x2={offsetX + svg_bw} y2={offsetY + svg_h + 15} stroke={COLORS.slate[800]} strokeWidth="1" />
          <line x1={offsetX} y1={offsetY + svg_h} x2={offsetX} y2={offsetY + svg_h + 15} stroke={COLORS.slate[400]} strokeWidth="1" />
          <line x1={offsetX + svg_bw} y1={offsetY + svg_h} x2={offsetX + svg_bw} y2={offsetY + svg_h + 15} stroke={COLORS.slate[400]} strokeWidth="1" />
          <text x={offsetX + svg_bw / 2} y={offsetY + svg_h + 28} textAnchor="middle" fontSize="12" fill={COLORS.slate[800]} className="font-sans font-semibold">
            b_w={bw.toFixed(1)}
          </text>
          
          {/* Dimension: d */}
          <line x1={offsetX - 15} y1={offsetY} x2={offsetX - 15} y2={barCenterY} stroke={COLORS.red[700]} strokeWidth="1.5" />
          <line x1={offsetX - 15} y1={offsetY} x2={offsetX} y2={offsetY} stroke={COLORS.slate[400]} strokeDasharray="2,2" strokeWidth="1" />
          <line x1={offsetX - 15} y1={barCenterY} x2={offsetX} y2={barCenterY} stroke={COLORS.slate[400]} strokeDasharray="2,2" strokeWidth="1" />
          <text x={offsetX - 22} y={offsetY + svg_d / 2} alignmentBaseline="middle" textAnchor="end" fontSize="12" fill={COLORS.red[700]} className="font-sans font-semibold">
            d={d.toFixed(1)}
          </text>
        </g>
        
        {/* --- Stress Diagram Drawing --- */}
        <g id="stress-diagram">
          {/* Beam outline */}
          <line x1={DIAGRAM_BEAM_LINE_X} y1={offsetY} x2={DIAGRAM_BEAM_LINE_X} y2={offsetY+svg_h} stroke={COLORS.slate[400]} strokeWidth="2" />
          
          {/* Concrete Compression Stress Block */}
          <rect x={DIAGRAM_BEAM_LINE_X} y={offsetY} width={comp_stress_width} height={LAMBDA * svg_x} fill={COLORS.red[100]} stroke={COLORS.red[500]} strokeWidth="1.5" />
          
          {/* Label for stress */}
          <line x1={DIAGRAM_BEAM_LINE_X} y1={offsetY - 10} x2={DIAGRAM_BEAM_LINE_X + comp_stress_width} y2={offsetY - 10} stroke={COLORS.slate[800]} strokeWidth="1" markerStart="url(#arrow-dim)" markerEnd="url(#arrow-dim)" />
          <text x={DIAGRAM_BEAM_LINE_X + comp_stress_width / 2} y={offsetY - 18} textAnchor="middle" fontSize="12" fill={COLORS.slate[800]} className="font-sans">
            σ_cd = {sigma_cd.toFixed(2)} kN/cm²
          </text>

          {/* Resultant Compression Force */}
          <path d={`M ${DIAGRAM_BEAM_LINE_X + comp_stress_width + 10},${y_cc} L ${DIAGRAM_BEAM_LINE_X + 5},${y_cc}`} stroke={COLORS.red[500]} strokeWidth="1.5" markerEnd="url(#arrow-force-comp)" />
          <text x={DIAGRAM_BEAM_LINE_X + comp_stress_width + 15} y={y_cc} alignmentBaseline="middle" textAnchor="start" fontSize="12" fill={COLORS.red[700]} className="font-sans">R_cc</text>

          {/* Resultant Tension Force Arrow */}
          <path d={`M ${DIAGRAM_BEAM_LINE_X - 5},${barCenterY} L ${DIAGRAM_BEAM_LINE_X + comp_stress_width + 10},${barCenterY}`} stroke={COLORS.blue[600]} strokeWidth="1.5" markerEnd="url(#arrow-force)" />
          <text x={DIAGRAM_BEAM_LINE_X + comp_stress_width + 15} y={barCenterY} textAnchor="start" alignmentBaseline="middle" fontSize="12" fill={COLORS.blue[800]} className="font-sans">R_st</text>

           {/* Dimension for x */}
          <line x1={DIAGRAM_START_X} y1={offsetY} x2={DIAGRAM_START_X} y2={offsetY + svg_x} stroke={COLORS.slate[800]} strokeWidth="1" />
          <line x1={DIAGRAM_START_X} y1={offsetY} x2={DIAGRAM_BEAM_LINE_X} y2={offsetY} stroke={COLORS.slate[400]} strokeDasharray="2,2" strokeWidth="1" />
          <line x1={DIAGRAM_START_X} y1={offsetY + svg_x} x2={DIAGRAM_BEAM_LINE_X} y2={offsetY + svg_x} stroke={COLORS.slate[400]} strokeDasharray="2,2" strokeWidth="1" />
          <text x={DIAGRAM_START_X - 8} y={offsetY + svg_x / 2} alignmentBaseline="middle" textAnchor="end" fontSize="12" fill={COLORS.slate[800]} className="font-sans font-semibold">x={x.toFixed(1)}</text>
        
          {/* Dimension for y = lambda*x */}
          <line x1={DIAGRAM_BEAM_LINE_X + comp_stress_width + 5} y1={offsetY} x2={DIAGRAM_BEAM_LINE_X + comp_stress_width + 5} y2={offsetY + LAMBDA * svg_x} stroke={COLORS.slate[500]} strokeWidth="1" />
          <text x={DIAGRAM_BEAM_LINE_X + comp_stress_width + 8} y={offsetY + LAMBDA*svg_x/2} alignmentBaseline="middle" textAnchor="start" fontSize="11" fill={COLORS.slate[800]} className="font-sans">
            y={y_lambda_x.toFixed(1)}
          </text>
        </g>

        {/* --- Shared Neutral Axis (LN) --- */}
        <line x1="0" y1={offsetY + svg_x} x2={VIEWBOX_W} y2={offsetY + svg_x} stroke={COLORS.blue[500]} strokeWidth="1.5" strokeDasharray="4,4" />
        <text x={15} y={offsetY + svg_x - 6} textAnchor="start" fontSize="12" fill={COLORS.blue[500]} className="font-sans font-semibold">LN</text>
        <text x={VIEWBOX_W - 15} y={offsetY + svg_x - 6} textAnchor="end" fontSize="12" fill={COLORS.blue[500]} className="font-sans font-semibold">LN</text>

      </svg>
    </div>
  );
};
