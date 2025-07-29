/* global nn */

window.colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]

async function loadASCIIArt (o) {
  const asciiBlockCSS = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  try {
    const res = await window.fetch(o.path)
    if (!res.ok) throw new Error(`Failed to fetch ${o.path}: ${res.status} ${res.statusText}`)
    const ascii = await res.text()
    const asciiFrame = nn.create('div').css(asciiBlockCSS).addTo(o.parent)
    const color = nn.isLight(o.parent.style.backgroundColor) ? '#000' : '#fff'
    const styles = o.css || {}
    styles.color = color
    const ele = nn.create('pre')
      .content(ascii)
      .addTo(asciiFrame)
      .css(styles)
    if (o.link) ele.on('click', () => window.open(o.link, '_blank'))
    return ele
  } catch (err) {
    console.error('loadTextFile error:', err)
    throw err
  }
}

async function loadData () {
  const res = await window.fetch('data/main.json')
  if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)
  window.data = await res.json()
  window.data._initiativesOrder = [...window.data.initiatives]
  window.data.initiatives = {}
  window.data._initiativesOrder.forEach(async file => {
    const res = await window.fetch(`data/initiatives/${file}`)
    const json = await res.json()
    const name = file.split('.')[0]
    window.data.initiatives[name] = json
    window.data.initiatives[name].name = name
  })
  return window.data
}

window.loadASCIIArt = loadASCIIArt
window.loadData = loadData
