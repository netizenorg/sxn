/* global nn */
const colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#ff0000', '#ff0099', '#ff00ff', '#6600ff', '#0000ff', '#0099ff', '#00ffff', '#00ff66', '#00ff00', '#99ff00', '#ffff00', '#ff6600'],
  ['#993333', '#993366', '#993366', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633'],
  ['#996666', '#996699', '#996699', '#666699', '#666699', '#666699', '#669999', '#669966', '#669966', '#669966', '#999966', '#996666']
]

function chooseColor (pair) {
  if (!pair) { // choose random color from column 1
    return nn.random(colors[0])
  } else { // find color pair from column 3 or 4
    const arr = [...colors[2], ...colors[3]]
    return nn.random(arr)
  }
}

function createGrid () {
  nn.get('.sxn-grid ul').innerHTML = ''
  const cells = 8
  for (let i = 0; i < cells; i++) {
    const css = { background: chooseColor(i % 2 === 0) }
    // if (i % 2 === 0) {
      if (nn.random() > 0.5) css['grid-column'] = 'span 2'
    // } else {
      if (nn.random() > 0.5) css['grid-row'] = 'span 2'
    // }
    nn.create('li')
      .content(`${i}`)
      .css(css)
      .addTo('.sxn-grid ul')
  }
}

function setupControls () {
  // update settings
  nn.get('#about-link').on('click', () => {
    nn.get('.settings').classList.toggle('settings-show')
  })
  nn.get('.settings h3').on('click', () => {
    nn.get('.settings').classList.toggle('settings-show')
  })
  // handle checkbox
  nn.get('#min-cell-range').on('change', () => {
    nn.get('#responsive-lock').checked = false
  })
  nn.get('#responsive-lock').checked = false
  nn.get('#responsive-lock').on('change', (e) => {
    if (e.target.checked) {
      const minCell = nn.get('#min-cell-range').value
      nn.get('#responsive-lock').dataset.val = `${minCell}px`
      const val = `${parseInt(minCell) / nn.width * 100}vw`
      document.documentElement.style.setProperty('--min-cell', val)
    } else {
      const val = nn.get('#responsive-lock').dataset.val
      document.documentElement.style.setProperty('--min-cell', val)
    }
  })
}

function main () {
  nn.bindCSS()
  createGrid()
  nn.get('#netizen-logo').on('click', createGrid)
  setupControls()
}

nn.on('load', main)
