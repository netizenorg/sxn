/* global nn */
window.mod = {
  panel: null,
  columns: false,
  css: {
    '--hs': 7.5,
    '--fs-heading': 2,
    '--lh-heading': 1.875,
    '--fs-subtitle': 1.5,
    '--lh-subtitle': 1.625,
    '--fs-body-web': 1.3125,
    '--lh-body-web': 1.575,
    '--ws-body-web': 0.25,
    '--fs-tertiary': { min: 0.75, max: 1.0625 },
    '--lh-tertiary': { min: 0.75, max: 1.0625 }
  },
  translate: {
    '--hs': 'Header Height',
    '--fs-heading': 'Heading Font-Size',
    '--lh-heading': 'Heading Line-Height',
    '--fs-subtitle': 'Sub-Title Font-Size',
    '--lh-subtitle': 'Sub-Title Line-Height',
    '--fs-body-web': 'Body Font-Size',
    '--lh-body-web': 'Body Line-Height',
    '--ws-body-web': 'Body Word-Spacing',
    '--fs-tertiary': 'Tertiary Font-Size',
    '--lh-tertiary': 'Tertiary Line-Height'
  }
}

// function getCSSVariable (name, element = document.documentElement) {
//   const variable = name.startsWith('--') ? name : `--${name}`
//   const styles = window.getComputedStyle(element)
//   return styles.getPropertyValue(variable).trim()
// }

function setCSSVariable (name, value, element = document.documentElement) {
  const variable = name.startsWith('--') ? name : `--${name}`
  element.style.setProperty(variable, value)
}

function remToPx (rem, element = document.documentElement) {
  const remValue = typeof rem === 'string'
    ? parseFloat(rem)
    : rem
  const baseFontSize = parseFloat(
    window.getComputedStyle(element).fontSize
  )
  return remValue * baseFontSize
}

function toggleColumns () {
  window.mod.columns = !window.mod.columns
  updateCaseStudy()
}

function genVal (key) {
  const min = window.mod.css[key].min
  const max = window.mod.css[key].max
  if (key === '--fs-tertiary') {
    return `clamp(${min}rem, 1vw, ${max}rem)`
  } else if (key === '--lh-tertiary') {
    return `calc(clamp(${min}rem, 1vw, ${max}rem) * 1.2)`
  }
}

// function setCSSTo (type) {
//   const css = window.mod[type]
//   Object.entries(css).forEach(([key, value]) => {
//     window.mod.css[key] = value
//     if (typeof value === 'number') {
//       setCSSVariable(key, `${value}rem`)
//     } else {
//       setCSSVariable(key, genVal(key))
//     }
//   })
//
//   window.mod.panel.querySelectorAll('.mod-row').forEach(e => e.remove())
//
//   // Object.entries(window.mod.css).forEach(([key, value]) => {
//   //   if (typeof value === 'object') createUIForMinMaxValue(key, value, modPanel)
//   //   else createUIForSingleValue(key, value, modPanel)
//   // })
// }

function updateCaseStudy () {
  if (!document.querySelector('.case-study')) return
  if (window.mod.columns) {
    nn.get('.case-study').css({
      display: 'flex',
      alignItems: 'self-start'
    })
    nn.get('.case-study > div:nth-child(2)').css({
      flexDirection: 'column',
      marginTop: 0,
      marginLeft: 60
    })

    nn.getAll('.case-study > div:nth-child(2) > small').forEach(s => {
      s.css('margin-bottom', '20px')
    })
  } else {
    nn.get('.case-study').css({ display: 'block' })

    nn.get('.case-study > div:nth-child(2)').css({
      flexDirection: 'row',
      marginTop: 100,
      marginLeft: 0
    })

    nn.getAll('.case-study > div:nth-child(2) > small').forEach(s => {
      s.css('margin-bottom', 0)
    })
  }
}

function createUIForSingleValue (key, value) {
  const parent = window.mod.panel
  const name = window.mod.translate[key]
  const max = value > 4 ? 20 : 4
  const div = nn.create('div')
    .set('class', 'mod-row')
    .css({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' })
    .addTo(parent)
  div.innerHTML = `
    <span>${name}</span>
    <input name="${key}" type="range" min="0" max="${max}" step="0.01" value="${value}">
    <span name="${key}" style="padding-left: 20px">${value} rem | ${remToPx(value)} px</span>
  `
  div.querySelectorAll('*').forEach(e => {
    e.style.fontSize = '16px'
    e.style.lineHeight = '16px'
    e.style.wordSpacing = '0px'
  })
  div.querySelector('input').addEventListener('input', (e) => {
    const n = e.target.getAttribute('name')
    const v = e.target.value
    div.querySelector(`span[name=${n}]`).innerHTML = `${v} rem | ${remToPx(v)} px`
    setCSSVariable(n, `${v}rem`)
    window.mod.css[key] = v
  })
}

function createUIForMinMaxValue (key, value) {
  const parent = window.mod.panel
  const css = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }
  const name = window.mod.translate[key]
  const max = value.max > 4 ? 20 : 4
  const divMin = nn.create('div').css(css).set('class', 'mod-row').addTo(parent)
  divMin.innerHTML = `
    <span>${name} (min)</span>
    <input name="${key}" type="range" min="0" max="${max}" step="0.01" value="${value.min}">
    <span name="${key}" style="padding-left: 20px">${value.min} rem | ${remToPx(value.min)} px</span>
  `
  const divMax = nn.create('div').css(css).set('class', 'mod-row').addTo(parent)
  divMax.innerHTML = `
    <span>${name} (max)</span>
    <input name="${key}" type="range" min="0" max="${max}" step="0.01" value="${value.max}">
    <span name="${key}" style="padding-left: 20px">${value.max} rem | ${remToPx(value.max)} px</span>
  `
  const fixSizing = (e) => {
    e.style.fontSize = '16px'; e.style.lineHeight = '16px'; e.style.wordSpacing = '0px'
  }
  divMin.querySelectorAll('*').forEach(fixSizing)
  divMax.querySelectorAll('*').forEach(fixSizing)

  divMin.querySelector('input').addEventListener('input', (e) => {
    const n = e.target.getAttribute('name')
    const v = e.target.value
    divMin.querySelector(`span[name=${n}]`).innerHTML = `${v} rem | ${remToPx(v)} px`
    window.mod.css[key].min = v
    setCSSVariable(n, genVal(key))
  })

  divMax.querySelector('input').addEventListener('input', (e) => {
    const n = e.target.getAttribute('name')
    const v = e.target.value
    divMax.querySelector(`span[name=${n}]`).innerHTML = `${v} rem | ${remToPx(v)} px`
    window.mod.css[key].max = v
    setCSSVariable(n, genVal(key))
  })
}

// --------------------------------------------------------------------------------

nn.on('load', () => {
  const ctrl = nn.create('div')
    .css({
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 9999999999999,
      padding: 10,
      background: 'black',
      color: 'white'
    })
    .addTo('body')

  nn.create('button')
    .content('hide edits')
    .set('data-visible', 'true')
    .addTo(ctrl)
    .on('click', (e) => {
      const v = e.target.dataset.visible
      e.target.dataset.visible = v === 'true' ? 'false' : 'true'
      if (e.target.dataset.visible === 'true') {
        nn.get('#mod-panel').css({ display: 'block' })
        ctrl.style.opacity = 1
        e.target.innerHTML = 'hide edits'
      } else {
        nn.get('#mod-panel').css({ display: 'none' })
        ctrl.style.opacity = 0.5
        e.target.innerHTML = 'show edits'
      }
    })

  window.mod.panel = nn.create('div')
    .set('id', 'mod-panel')
    .css({
      position: 'fixed',
      top: 45,
      right: 0,
      zIndex: 9999999999999,
      padding: 20,
      background: 'black',
      color: 'white',
      width: 620
    })
    .addTo('body')

  nn.create('button')
    .content('toggle case-study columns (1 vs 2)')
    .css({ display: 'inline-block', marginBottom: 20 })
    .on('click', toggleColumns)
    .addTo(window.mod.panel)

  nn.create('br').addTo(window.mod.panel)

  Object.entries(window.mod.css).forEach(([key, value]) => {
    if (typeof value === 'object') createUIForMinMaxValue(key, value)
    else createUIForSingleValue(key, value)
  })
})
