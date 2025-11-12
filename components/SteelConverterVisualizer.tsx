import React from 'react';

interface SteelConverterVisualizerProps {
  mode: 'longitudinal' | 'stirrup';
  originalDiameter: number;
  originalSpacing: number;
  originalNumLegs?: number;
  equivalentDiameter: number;
  equivalentSpacing: number;
  equivalentNumLegs?: number;
}

const COLORS = {
  slate: {
    200: '#E2E8F0',
    400: '#94A3B8',
    500: '#64748B',
    800: '#1E293B',
  },
  indigo: {
    500: '#6366F1',
    700: '#4338CA',
  },
  teal: {
    500: '#14B8A6',
    700: '#0D9488',
  }
};

const LongitudinalVisualizer: React.FC<Omit<SteelConverterVisualizerProps, 'mode'>> = (props) => {
  const { originalDiameter, originalSpacing, equivalentDiameter, equivalentSpacing } = props;

  const VIEWBOX_W = 600;
  const VIEWBOX_H = 300;
  const SECTION_WIDTH_CM = 100; // 1 meter
  const SECTION_HEIGHT_CM = 20;
  const PADDING_H = 50;
  const DRAW_AREA_W = VIEWBOX_W - 2 * PADDING_H;
  
  const scale = DRAW_AREA_W / SECTION_WIDTH_CM;
  const svgSectionW = SECTION_WIDTH_CM * scale;
  const svgSectionH = SECTION_HEIGHT_CM * scale;
  
  const originalBars = Array.from({ length: Math.floor(SECTION_WIDTH_CM / originalSpacing) + 1 }, (_, i) => ({
      cx: PADDING_H + (i * originalSpacing * scale),
      r: (originalDiameter / 10 / 2) * scale,
  }));

  const equivalentBars = Array.from({ length: Math.floor(SECTION_WIDTH_CM / equivalentSpacing) + 1 }, (_, i) => ({
      cx: PADDING_H + (i * equivalentSpacing * scale),
      r: (equivalentDiameter / 10 / 2) * scale,
  }));
  
  return (
    <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="w-full h-auto">
        <defs>
            <marker id="arrow-dim-conv" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.slate[800]} />
            </marker>
        </defs>
        
        {/* Original */}
        <g id="original-longitudinal">
            <rect x={PADDING_H} y={50} width={svgSectionW} height={svgSectionH} fill={COLORS.slate[200]} stroke={COLORS.slate[400]} />
            {originalBars.map((bar, i) => (
                <circle key={`orig-${i}`} cx={bar.cx} cy={50 + svgSectionH/2} r={bar.r} fill={COLORS.indigo[700]} />
            ))}
            <text x={PADDING_H - 10} y={50 + svgSectionH/2} textAnchor="end" alignmentBaseline="middle" className="font-semibold text-sm fill-current text-indigo-700">Original</text>
            <text x={PADDING_H} y={35} className="font-medium text-xs fill-current text-slate-800">Ø{originalDiameter} c/{originalSpacing.toFixed(1)} cm</text>
        </g>
        
        {/* Equivalent */}
        <g id="equivalent-longitudinal" transform="translate(0, 150)">
            <rect x={PADDING_H} y={0} width={svgSectionW} height={svgSectionH} fill={COLORS.slate[200]} stroke={COLORS.slate[400]} />
            {equivalentBars.map((bar, i) => (
                <circle key={`equiv-${i}`} cx={bar.cx} cy={svgSectionH/2} r={bar.r} fill={COLORS.teal[700]} />
            ))}
            <text x={PADDING_H - 10} y={svgSectionH/2} textAnchor="end" alignmentBaseline="middle" className="font-semibold text-sm fill-current text-teal-700">Equivalente</text>
            <text x={PADDING_H} y={-15} className="font-medium text-xs fill-current text-slate-800">Ø{equivalentDiameter} c/{equivalentSpacing.toFixed(1)} cm</text>
        </g>
        
        {/* Dimension */}
        <line x1={PADDING_H} y1={250} x2={PADDING_H + svgSectionW} y2={250} stroke={COLORS.slate[800]} strokeWidth="1" markerStart="url(#arrow-dim-conv)" markerEnd="url(#arrow-dim-conv)" />
        <text x={VIEWBOX_W/2} y={265} textAnchor="middle" className="font-semibold text-sm fill-current text-slate-800">Seção de 1.0 metro</text>
    </svg>
  );
};


const StirrupVisualizer: React.FC<Omit<SteelConverterVisualizerProps, 'mode'>> = (props) => {
    const { originalDiameter, originalSpacing, originalNumLegs, equivalentDiameter, equivalentSpacing, equivalentNumLegs } = props;
    
    const VIEWBOX_W = 600;
    const VIEWBOX_H = 400;

    const renderSection = (
        id: string,
        title: string,
        diameter: number,
        spacing: number,
        numLegs: number = 2,
        color: string
    ) => {
        const BEAM_W = 20;
        const BEAM_H = 50;
        const COVER = 3;
        const MAIN_BAR_DIAMETER = 1.25;

        const scale = 5;
        const svgW = BEAM_W * scale;
        const svgH = BEAM_H * scale;
        const svgCover = COVER * scale;
        const svgStirrupD = (diameter / 10) * scale;
        const svgMainBarR = (MAIN_BAR_DIAMETER / 2) * scale;
        
        return (
            <g id={id}>
                <text x={svgW / 2} y={-20} textAnchor="middle" className="text-lg font-semibold fill-current text-slate-800">{title}</text>
                <rect x="0" y="0" width={svgW} height={svgH} fill={COLORS.slate[200]} stroke={COLORS.slate[500]} />
                <rect 
                    x={svgCover} y={svgCover}
                    width={svgW - 2 * svgCover} height={svgH - 2 * svgCover}
                    fill="none" stroke={color} strokeWidth={svgStirrupD} rx={svgStirrupD}
                />
                {/* Main bars */}
                <circle cx={svgCover + svgStirrupD} cy={svgCover + svgStirrupD} r={svgMainBarR} fill={COLORS.slate[800]} />
                <circle cx={svgW - svgCover - svgStirrupD} cy={svgCover + svgStirrupD} r={svgMainBarR} fill={COLORS.slate[800]} />
                <circle cx={svgCover + svgStirrupD} cy={svgH - svgCover - svgStirrupD} r={svgMainBarR} fill={COLORS.slate[800]} />
                <circle cx={svgW - svgCover - svgStirrupD} cy={svgH - svgCover - svgStirrupD} r={svgMainBarR} fill={COLORS.slate[800]} />
                
                <text x={svgW / 2} y={svgH + 30} textAnchor="middle" className="text-md font-semibold" style={{fill: color}}>
                    Estribo Ø{diameter.toFixed(1)} c/{spacing.toFixed(1)} ({numLegs} ramos)
                </text>
            </g>
        );
    }
    
    return (
         <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="w-full h-auto">
            <g transform="translate(50, 50)">
              {renderSection('original', 'Original', originalDiameter, originalSpacing, originalNumLegs, COLORS.indigo[500])}
            </g>
            <g transform="translate(350, 50)">
              {renderSection('equivalent', 'Equivalente', equivalentDiameter, equivalentSpacing, equivalentNumLegs, COLORS.teal[500])}
            </g>
        </svg>
    );
}

export const SteelConverterVisualizer: React.FC<SteelConverterVisualizerProps> = (props) => {
    const { mode, ...rest } = props;
    
    if (
        !rest.originalDiameter ||
        !rest.originalSpacing ||
        !rest.equivalentDiameter ||
        !rest.equivalentSpacing ||
        (mode === 'stirrup' && (!rest.originalNumLegs || !rest.equivalentNumLegs))
    ) {
        return null;
    }

    return (
        <div className="my-6 p-4 border border-slate-200 rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">
                Visualização da Equivalência
            </h3>
            {mode === 'longitudinal' ? <LongitudinalVisualizer {...rest} /> : <StirrupVisualizer {...rest} />}
        </div>
    );
};