export const themeVariableDefs = [
  { key: 'canvas_fill', label: 'Canvas background', type: 'color' },

  { key: 'label_font_family', label: 'Label font family', type: 'text' },
  { key: 'label_font_style', label: 'Label font style', type: 'select', options: [ 'normal', 'italic', 'oblique' ] },
  { key: 'label_font_weight', label: 'Label font weight', type: 'select', options: [ 'normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900' ] },
  { key: 'label_font_size_px', label: 'Label font size', type: 'number' },
  { key: 'text_label_fill', label: 'Text label color', type: 'color' },
  { key: 'text_label_font_size_px', label: 'Text label font size', type: 'number' },

  { key: 'reaction_label_font_size_px', label: 'Reaction label font size', type: 'number' },
  { key: 'reaction_label_fill', label: 'Reaction label color', type: 'color' },

  { key: 'gene_label_font_size_px', label: 'Gene label font size', type: 'number' },
  { key: 'gene_label_fill', label: 'Gene label color', type: 'color' },

  { key: 'node_label_font_size_px', label: 'Metabolite label font size', type: 'number' },
  { key: 'node_label_fill', label: 'Metabolite label color', type: 'color' },

  { key: 'node_circle_stroke_width_px', label: 'Node stroke width', type: 'number' },
  { key: 'metabolite_circle_fill', label: 'Metabolite fill', type: 'color' },
  { key: 'metabolite_circle_stroke', label: 'Metabolite stroke', type: 'color' },

  { key: 'segment_stroke', label: 'Reaction stroke', type: 'color' },
  { key: 'segment_stroke_width_px', label: 'Reaction stroke width', type: 'number' },
  { key: 'arrowhead_fill', label: 'Arrowhead fill', type: 'color' },

  { key: 'stoich_label_fill', label: 'Stoichiometry label color', type: 'color' },
  { key: 'stoich_label_font_size_px', label: 'Stoichiometry label font size', type: 'number' }
]

export const defaultThemeVars = {
  canvas_fill: '#ffffff',

  label_font_family: 'sans-serif',
  label_font_style: 'italic',
  label_font_weight: 'bold',
  label_font_size_px: 8,
  text_label_fill: '#000000',
  text_label_font_size_px: 50,

  reaction_label_font_size_px: 30,
  reaction_label_fill: '#202078',

  gene_label_font_size_px: 18,
  gene_label_fill: '#202078',

  node_label_font_size_px: 20,
  node_label_fill: '#000000',

  node_circle_stroke_width_px: 2,
  metabolite_circle_fill: '#E0865B',
  metabolite_circle_stroke: '#A24510',

  segment_stroke: '#334E75',
  segment_stroke_width_px: 10,
  arrowhead_fill: '#334E75',

  stoich_label_fill: '#334E75',
  stoich_label_font_size_px: 17
}

export const themePresets = {
  Default: { ...defaultThemeVars },
  Dark: {
    ...defaultThemeVars,
    canvas_fill: '#0f1115',
    text_label_fill: '#e7e7e7',
    reaction_label_fill: '#9aa7ff',
    gene_label_fill: '#9aa7ff',
    node_label_fill: '#e7e7e7',
    metabolite_circle_fill: '#2b6cb0',
    metabolite_circle_stroke: '#90cdf4',
    segment_stroke: '#9aa7ff',
    arrowhead_fill: '#9aa7ff',
    stoich_label_fill: '#e7e7e7'
  },
  Print: {
    ...defaultThemeVars,
    label_font_style: 'normal',
    label_font_weight: 'normal',
    reaction_label_fill: '#000000',
    gene_label_fill: '#000000',
    metabolite_circle_fill: '#ffffff',
    metabolite_circle_stroke: '#000000',
    segment_stroke: '#000000',
    arrowhead_fill: '#000000',
    stoich_label_fill: '#000000'
  }
}

export function buildThemeOverrideCss (vars) {
  const v = { ...defaultThemeVars, ...vars }
  const num = (x) => (x === null || x === undefined || x === '') ? '' : String(x)
  const fontFamily = (name) => {
    const s = String(name || '').trim()
    if (!s) return 'sans-serif'
    if (s.includes(',') || s.includes('"') || s.includes("'")) return s
    if (/\s/.test(s)) return `"${s}"`
    return s
  }
  const family = fontFamily(v.label_font_family)

  return [
    `svg.escher-svg #canvas{fill:${v.canvas_fill};}`,
    `svg.escher-svg .label{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};font-size:${num(v.label_font_size_px)}px;}`,
    `svg.escher-svg .reaction-label{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};font-size:${num(v.reaction_label_font_size_px)}px;fill:${v.reaction_label_fill};}`,
    `svg.escher-svg .gene-label{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};font-size:${num(v.gene_label_font_size_px)}px;fill:${v.gene_label_fill};}`,
    `svg.escher-svg .node-label{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};font-size:${num(v.node_label_font_size_px)}px;fill:${v.node_label_fill};}`,
    `svg.escher-svg .node-circle{stroke-width:${num(v.node_circle_stroke_width_px)}px;}`,
    `svg.escher-svg .metabolite-circle{fill:${v.metabolite_circle_fill};stroke:${v.metabolite_circle_stroke};}`,
    `svg.escher-svg .segment{stroke:${v.segment_stroke};stroke-width:${num(v.segment_stroke_width_px)}px;}`,
    `svg.escher-svg .arrowhead{fill:${v.arrowhead_fill};stroke:${v.arrowhead_fill};}`,
    `svg.escher-svg .stoichiometry-label{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};fill:${v.stoich_label_fill};font-size:${num(v.stoich_label_font_size_px)}px;paint-order:stroke;stroke:${v.canvas_fill};stroke-width:4px;}`,
    `svg.escher-svg .text-label .label{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};fill:${v.text_label_fill};font-size:${num(v.text_label_font_size_px)}px;}`,
    `svg.escher-svg .text-label-input{font-family:${family};font-style:${v.label_font_style};font-weight:${v.label_font_weight};font-size:${num(v.text_label_font_size_px)}px;}`
  ].join('\n')
}
