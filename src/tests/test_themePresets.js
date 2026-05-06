import { describe, it } from 'mocha'
import { assert } from 'chai'

import { buildThemeOverrideCss } from '../themePresets'

describe('themePresets', () => {
  it('builds override css', () => {
    const css = buildThemeOverrideCss({
      text_label_fill: '#ff0000',
      segment_stroke_width_px: 12
    })
    assert.include(css, 'svg.escher-svg .text-label .label')
    assert.include(css, 'fill:#ff0000')
    assert.include(css, 'stroke-width:12px')
  })
})
