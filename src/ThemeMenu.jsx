/** @jsx h */
import { h, Component } from 'preact'
import './ThemeMenu.css'
import { themeVariableDefs, themePresets, defaultThemeVars, buildThemeOverrideCss } from './themePresets'

function ThemePreview ({ css }) {
  return (
    <svg className='escher-svg' width='520' height='420' viewBox='0 0 520 450'>
      <defs>
        <style type='text/css'>{css}</style>
      </defs>
      <rect id='canvas' x='5' y='5' width='510' height='450' />

      <g className='reaction' id='r1'>
        <g className='reaction-label-group' transform='translate(270,148)'>
          <text className='reaction-label label'>HEX1</text>
          <g className='all-genes-label-group'>
            <g className='gene-label-group' transform='translate(0, 28)'>
              <text className='gene-label'>geneA</text>
            </g>
          </g>
        </g>

        <g className='segment-group' id='s_trunk'>
          <path className='segment' d='M 270 60 L 270 262' />
          <g className='arrowheads'>
            <path className='arrowhead' d='M -12 0 L 0 16 L 12 0 Z' transform='translate(270,262)rotate(0)' />
          </g>
        </g>

        <g className='segment-group' id='s_atp'>
          <path className='segment' d='M 150 110 L 270 170' />
          <g className='arrowheads'>
            <path className='arrowhead' d='M -10 0 L 0 14 L 10 0 Z' transform='translate(150,110)rotate(-110)' />
          </g>
          <g className='stoichiometry-labels'>
            <text className='stoichiometry-label' text-anchor='middle' transform='translate(185,118)'>2</text>
          </g>
        </g>

        <g className='segment-group' id='s_adp'>
          <path className='segment' d='M 270 210 L 160 250' />
          <g className='arrowheads'>
            <path className='arrowhead' d='M -10 0 L 0 14 L 10 0 Z' transform='translate(160,250)rotate(-70)' />
          </g>
        </g>

        <g className='segment-group' id='s_h'>
          <path className='segment' d='M 270 210 L 380 250' />
          <g className='arrowheads'>
            <path className='arrowhead' d='M -10 0 L 0 14 L 10 0 Z' transform='translate(380,250)rotate(70)' />
          </g>
        </g>
      </g>

      <g className='node' id='n_glc'>
        <circle className='node-circle metabolite-circle' r='20' transform='translate(270,60)' />
        <text className='node-label label' transform='translate(245,95)'>glc__D_c</text>
      </g>

      <g className='node' id='n_atp'>
        <circle className='node-circle metabolite-circle' r='10' transform='translate(140,100)' />
        <text className='node-label label' transform='translate(120,145)'>atp_c</text>
      </g>

      <g className='node' id='n_adp'>
        <circle className='node-circle metabolite-circle' r='10' transform='translate(160,250)' />
        <text className='node-label label' transform='translate(128,286)'>adp_c</text>
      </g>

      <g className='node' id='n_h'>
        <circle className='node-circle metabolite-circle' r='10' transform='translate(380,250)' />
        <text className='node-label label' transform='translate(362,286)'>h_c</text>
      </g>

      <g className='node' id='n_g6p'>
        <circle className='node-circle metabolite-circle' r='20' transform='translate(270,262)' />
        <text className='node-label label' transform='translate(247,297)'>g6p_c</text>
      </g>

      <g className='node' id='m1'>
        <circle className='node-circle midmarker-circle' r='5' transform='translate(270,160)' />
      </g>

      <g className='node' id='m2'>
        <circle className='node-circle midmarker-circle' r='5' transform='translate(270,175)' />
      </g>

      <g className='node' id='m3'>
        <circle className='node-circle midmarker-circle' r='5' transform='translate(270,190)' />
      </g>

      <g className='text-label' id='l1'>
        <text className='label' transform='translate(150,305)'>Glycolysis</text>
      </g>
    </svg>
  )
}

class ThemeMenu extends Component {
  componentWillMount () {
    this.setState({
      preset: this.props.themePreset || 'Default',
      vars: { ...defaultThemeVars, ...(this.props.themeVars || {}) },
      clearEscape: this.props.map.key_manager.addEscapeListener(
        () => this.cancel(),
        true
      )
    }, () => {
      this.updateCss()
    })
  }

  componentWillUnmount () {
    if (this.state.clearEscape) this.state.clearEscape()
  }

  setPreset (preset) {
    const vars = themePresets[preset] ? { ...themePresets[preset] } : { ...defaultThemeVars }
    this.setState({ preset, vars }, () => this.updateCss())
  }

  setVar (key, value) {
    const def = themeVariableDefs.find(d => d.key === key)
    let v = value
    if (def && def.type === 'number') {
      const parsed = parseFloat(value)
      if (!isNaN(parsed)) v = parsed
    }
    this.setState({ vars: { ...this.state.vars, [key]: v } }, () => this.updateCss())
  }

  buildCss (vars) {
    const overrideCss = buildThemeOverrideCss(vars)
    return [ this.props.baseCss, overrideCss ].join('\n')
  }

  updateCss () {
    const css = this.buildCss(this.state.vars)
    this.setState({ css })
  }

  cancel () {
    this.props.setDisplay(false)
  }

  apply () {
    const css = this.state.css || this.buildCss(this.state.vars)
    this.props.applyTheme({
      css,
      preset: this.state.preset,
      vars: this.state.vars
    })
    this.props.setDisplay(false)
  }

  render () {
    const css = this.state.css || this.buildCss(this.state.vars)
    return (
      <div className='themeBackground'>
        <div className='themeBoxContainer'>
          <div className='themeBox'>
            <div className='themeTitle'>Map theme settings</div>
            <div className='themeBody'>
              <div className='themeLeft'>
                <div className='themeRow'>
                  <div className='themeRowLabel'>Theme</div>
                  <div className='themeRowControl'>
                    <select
                      value={this.state.preset}
                      onChange={(e) => this.setPreset(e.target.value)}
                    >
                      {Object.keys(themePresets).map(name => (
                        <option value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {themeVariableDefs.map(def => (
                  <div className='themeRow'>
                    <div className='themeRowLabel'>{def.label}</div>
                    <div className='themeRowControl'>
                      {def.type === 'select' &&
                        <select
                          value={this.state.vars[def.key]}
                          onChange={(e) => this.setVar(def.key, e.target.value)}
                        >
                          {def.options.map(o => <option value={o}>{o}</option>)}
                        </select>
                      }
                      {def.type === 'color' &&
                        <div className='themeRowControl'>
                          <input
                            type='text'
                            value={this.state.vars[def.key]}
                            onInput={(e) => this.setVar(def.key, e.target.value)}
                          />
                          <input
                            type='color'
                            value={this.state.vars[def.key]}
                            onInput={(e) => this.setVar(def.key, e.target.value)}
                          />
                        </div>
                      }
                      {def.type === 'number' &&
                        <input
                          type='number'
                          value={this.state.vars[def.key]}
                          onInput={(e) => this.setVar(def.key, e.target.value)}
                        />
                      }
                      {def.type === 'text' &&
                        <input
                          type='text'
                          value={this.state.vars[def.key]}
                          onInput={(e) => this.setVar(def.key, e.target.value)}
                        />
                      }
                    </div>
                  </div>
                ))}
              </div>
              <div className='themeRight'>
                <div style={{ marginBottom: '8px', fontWeight: 700, color: '#777777' }}>Preview</div>
                <div className='themePreviewBox'>
                  <ThemePreview css={css} />
                </div>
              </div>
            </div>
            <div className='themeFooter'>
              <button className='btn' onClick={() => this.cancel()}>Cancel</button>
              <button className='btn' onClick={() => this.apply()}>Apply</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ThemeMenu
