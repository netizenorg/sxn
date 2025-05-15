/* global nn, generateGrid */
window.colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#ff0000', '#ff0099', '#ff00ff', '#6600ff', '#0000ff', '#0099ff', '#00ffff', '#00ff66', '#00ff00', '#99ff00', '#ffff00', '#ff6600'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]

// -------------------------

function countGridCells () {
  let count = 0
  nn.getAll('#the-grid > div')
    .forEach(div => { count += div.querySelectorAll('div').length })
  return count
}

function greyOutCells () {
  const lights = ['#e6e7e9', '#e1e2e4', '#d5d6d8', '#c7c8ca', '#b8b9bc', '#a8a9ad']
  // const darks = ['#939598', '#808285', '#717275', '#616164', '#4e4f50', '#2b292a']
  nn.getAll('#the-grid > div > div')
    .forEach(div => { div.style.background = nn.random(lights) })
}

function selectRandomEmptyCell () {
  const allCells = nn.getAll('#the-grid > div > div')
  const emptyCells = allCells.filter(cell => cell.getAttribute('data-taken') !== 'true')
  if (!emptyCells.length) return null
  const idx = Math.floor(Math.random() * emptyCells.length)
  return emptyCells[idx]
}

async function makePixelatedDuotoneDataUrl (imgSrc, pixelSize = 8) {
  // 1) load image
  const img = await new Promise((resolve, reject) => {
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = err => reject(err)
    image.src = imgSrc
  })

  const w = img.width
  const h = img.height

  // 2) draw small version
  const smallW = Math.ceil(w / pixelSize)
  const smallH = Math.ceil(h / pixelSize)
  const smallCanvas = document.createElement('canvas')
  smallCanvas.width = smallW
  smallCanvas.height = smallH
  const sctx = smallCanvas.getContext('2d')
  sctx.drawImage(img, 0, 0, smallW, smallH)

  // 3) threshold to black / grey
  const imgData = sctx.getImageData(0, 0, smallW, smallH)
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]
    if (lum < 128) {
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 0
    } else {
      data[i] = 204; data[i + 1] = 204; data[i + 2] = 204
    }
  }
  sctx.putImageData(imgData, 0, 0)

  // 4) upscale without smoothing
  const outCanvas = document.createElement('canvas')
  outCanvas.width = w
  outCanvas.height = h
  const octx = outCanvas.getContext('2d')
  octx.imageSmoothingEnabled = false
  octx.drawImage(smallCanvas, 0, 0, w, h)

  return outCanvas.toDataURL()
}

async function loadCaseStudy (data) {
  // highlight selected nav element
  nn.getAll('.splash-intro > nav > span').forEach(span => {
    if (span.textContent.trim() === data.title.trim()) {
      span.classList.add('selected')
    } else span.classList.remove('selected')
  })

  // apply case study content
  const html = data.content.join('\n')
  nn.get('.case-study').content(html)

  // create Grid
  const gridWidth = 6
  const min = data.grid.length * 2
  let gridHeight = 1
  let cells = 0
  do {
    generateGrid({ gridWidth, gridHeight })
    cells = countGridCells()
    gridHeight++
  } while (cells < min)
  // greyOutCells()

  // populate grid
  const root = window.location.toString()
  nn.shuffle(data.grid).forEach(async obj => {
    const cell = selectRandomEmptyCell()
    if (obj.image) {
      // cell.style.backgroundSize = 'cover'
      // cell.style.backgroundPosition = 'center'
      // cell.style.backgroundRepeat = 'no-repeat'
      cell.style.imageRendering = nn.browserInfo().name === 'Firefox' ? 'pixelated' : 'crisp-edges'
      // const dataURL = await makePixelatedDuotoneDataUrl(obj.image, 16)
      cell.style.background = [`url(${root + obj.image}) center/cover no-repeat`, '#00f'].join(', ')
      // cell.style.backgroundImage = `url(${dataURL})`
    }
    if (obj.title) {
      cell.classList.add('cs-cell-lnk')
      nn.create('span').content(obj.title).addTo(cell)
    }
    cell.dataset.taken = true
  })

  // display case study
  nn.get('.case-study').css({ display: 'block' })
  await nn.sleep(100)
  nn.get('.case-study').css({ left: '25vw' })
}

async function generateCaseStudies (name) {
  const root = window.location.toString()
  const nav = nn.get('.splash-intro > nav')
  const res = await window.fetch(`${root}/data/initiatives/${name}.json`)
  const json = await res.json()
  nn.create('span').content(json.title).addTo(nav)
    .on('click', () => loadCaseStudy(json))
}

function setup () {
  generateGrid()

  // TODO: update this later....
  nn.get('#about-link').on('click', () => {
    nn.get('.splash-intro').css({ left: '100vw' })
    nn.get('.case-study').css({ left: '100vw' })
  })

  nn.get('#init-link').on('click', () => {
    nn.get('.splash-intro').css({ left: '0vw' })
    nn.get('.case-study').css({ left: '100vw' })
  })

  // TODO: to be replaced with API endpoint
  const caseStudies = ['bias-out-of-the-box', 'dream', 'internet-walking-tour']
  caseStudies.forEach(cs => generateCaseStudies(cs))
}

nn.on('load', setup)
