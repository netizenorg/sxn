/* global nn, NetizenNav, NetizenGrid, NetizenASCIISplash, NetizenContentBlock, NetizenBendPanel, NetizenSyrupImage */

window.colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]

window.data = null // contains all the content data
let nav, splash, content, grid, bendPanel

// default settings for processed images
// TODO: make customizable via bend panel
const syrupSettings = {
  huffhack: {
    process: false,
    opacity: 0.66,
    zIndex: 3,
    seed: 7
  },
  dither: {
    process: true,
    opacity: 0.67,
    zIndex: 2,
    algorithm: 'atkinson',
    dotSize: 1,
    threshold: 174
  },
  pixelate: {
    process: true,
    opacity: 1,
    zIndex: 1,
    size: 8,
    threshold: 128
  },
  ascii: {
    process: true,
    opacity: 0.5,
    zIndex: 4,
    chars: 'O*',
    fontSize: 8,
    fgColor: 'white'
  }
}

const asciiBlockCSS = {
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                             util functions                          *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

async function loadData () {
  const res = await window.fetch('data/main.json')
  if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)
  return await res.json()
}

async function loadASCIIArt (o) {
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

function resetGridAndContent (exceptInitatives) {
  grid.clearAllBlocks()
  // clear all syrup images
  nn.getAll('.syrup').forEach(ele => {
    ele.classList.remove('syrup')
    ele.querySelectorAll('img').forEach(img => img.remove())
    ele.onmouseover = null
    ele.onmouseout = null
    ele.onclick = null
  })
  // remove any extra grids
  nn.getAll('.grid').filter(d => d.id !== 'main-grid').forEach(d => d.remove())

  if (exceptInitatives) return
  // reset initatives
  const subNav = content.ele.children[0]
  subNav.classList.remove('sub-nav')
  subNav.querySelectorAll('*').forEach(e => e.remove())
  // revert center cell-content to original colors
  content.ele.children[1].style.background = 'var(--prim-b)'
  content.ele.children[1].style.color = 'var(--prim-a)'
}

function addSyrupImgToGrid (opts = {}) {
  opts.ele1.classList.add('syrup')

  const syrup = new NetizenSyrupImage({
    image: opts.path,
    ele: opts.ele1,
    colors: [opts.ele1.style.backgroundColor, opts.ele2.style.backgroundColor],
    huffhack: syrupSettings.huffhack,
    dither: syrupSettings.dither,
    pixelate: syrupSettings.pixelate,
    ascii: syrupSettings.ascii
  })

  nn.create('img')
    .set('src', opts.path)
    .set('name', 'clean')
    .addTo(opts.ele1)

  opts.ele1.onmouseover = () => {
    opts.ele1.querySelectorAll('img').forEach(img => {
      if (img.name !== 'clean') img.style.opacity = 0
    })
  }
  opts.ele1.onmouseout = () => {
    opts.ele1.querySelectorAll('img').forEach(img => {
      if (img.name !== 'clean') {
        img.style.opacity = syrup[img.name].opacity
      }
    })
  }

  if (opts.callback) opts.ele1.onclick = () => opts.callback()
}

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                  nav section change functions                       *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

function showHome () {
  if (nav.state === 0) return

  if (content.showing) {
    content.hide()
    splash.start()
  }

  resetGridAndContent()

  addSyrupImgToGrid({
    path: 'images/the-crew.jpg',
    ele1: grid.getBlock(4),
    ele2: grid.getBlock(3),
    callback: () => nav.updatePage('about')
  })

  loadASCIIArt({
    path: 'ascii-art/cows.txt',
    parent: grid.getBlock(7),
    link: 'http://www.textfiles.com/art/cow.txt'
  })

  grid.transitionTo(window.grids.default)

  if (bendPanel.showing) bendPanel.hidePanel()
  bendPanel.enable()
}

// --------------------------------------------------------------- ABOUT SECTION
function showAbout () {
  if (nav.state === 'about') return

  resetGridAndContent()

  content.show('about')

  splash.stop()

  grid.transitionTo(window.grids.default)

  loadASCIIArt({
    path: 'ascii-art/cows.txt',
    parent: grid.getBlock(7),
    link: 'http://www.textfiles.com/art/cow.txt'
  })

  nn.create('img')
    .set('src', 'images/the-crew.jpg')
    .css({ cursor: 'auto' })
    .addTo(grid.getBlock(4))
}

// --------------------------------------------------------- INITIATIVES SECTION
async function showInitiatives () {
  if (nav.state === 'initiatives') return
  content.show('initiatives')

  resetGridAndContent()

  const subNav = content.ele.children[0]
  subNav.className = 'sub-nav'
  window.data._initativesOrder.forEach(proj => {
    const key = proj.split('.')[0]
    const obj = window.data.initiatives[key]
    const item = nn.create('span')
      .content(obj.title)
      .set('class', 'sub-nav-item')
      .set('name', key)
      .addTo(subNav)
      .on('click', () => window.loadCaseStudy(obj))
    setTimeout(() => { item.style.opacity = 1 }, 900)
  })

  grid.transitionTo(window.grids.bendPanel)

  const dreamPics = [1, 2, 3, 7, 9, 12]
  const dreamObj = window.data.initiatives.dream
  addSyrupImgToGrid({
    path: `images/dream/dream${nn.random(dreamPics)}.jpg`,
    ele1: grid.getBlock(3),
    ele2: grid.getBlock(4),
    callback: () => window.loadCaseStudy(dreamObj)
  })

  const ascii = await loadASCIIArt({
    path: 'ascii-art/netnet.txt',
    parent: grid.getBlock(1),
    css: { fontSize: '2rem', cursor: 'pointer' }
  })
  const nnObj = window.data.initiatives.netnet
  ascii.onclick = () => window.loadCaseStudy(nnObj)
}

// ------------------------------------------------------------- SUPPORT SECTION
function showSupport () {
  if (nav.state === 'support') return
  resetGridAndContent()
  content.show('support')

  grid.transitionTo(window.grids.default)

  const asciiBlock = grid.grid === window.grids.default
    ? grid.getBlock(4) : grid.getBlock(5)
  loadASCIIArt({
    path: 'ascii-art/netizen-heart.txt',
    parent: asciiBlock,
    css: { letterSpacing: '0.75rem' }
  })
}

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                             main function                           *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

function resize () {
  if (window.blockerTimer) {
    clearTimeout(window.blockerTimer)
    clearTimeout(window.killLoader)
  }

  nn.get('#loader').css('display', 'flex')
  nn.get('#loader').css('opacity', 1)

  content.adjustHeight()

  window.blockerTimer = setTimeout(() => {
    nn.get('#loader').css('opacity', 0)
    window.killLoader = setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
  }, 250)
}

async function main () {
  // load initial data
  window.data = await loadData()
  window.data._initativesOrder = [...window.data.initiatives]
  window.data.initiatives = {}
  window.data._initativesOrder.forEach(async file => {
    const res = await window.fetch(`data/initiatives/${file}`)
    const json = await res.json()
    const name = file.split('.')[0]
    window.data.initiatives[name] = json
    window.data.initiatives[name].name = name
  })

  // setup the nav menu
  nav = new NetizenNav({
    parent: 'header',
    logo: '#netizen-logo',
    onSelection: (sec) => {
      switch (sec) {
        case 'logo': showHome(); break
        case 'about': showAbout(); break
        case 'initiatives': showInitiatives(); break
        case 'support': showSupport(); break
      }
    }
  })

  // setup splash page slide show
  splash = new NetizenASCIISplash({
    fontSize: 16,
    ele: nn.get('#splash-canvas'),
    radius: 200,
    duration: 1000,
    images: nn.shuffle(window.data.splashImages)
  })

  // setup content section (displays over the splash + above the grid)
  content = new NetizenContentBlock()

  // setup main grid section
  grid = new NetizenGrid({
    selector: '#main-grid',
    grid: window.grids.default
  })

  // setup bend panel
  await document.fonts.load('200px Fira Mono')
  bendPanel = new NetizenBendPanel({
    ele: grid.getBlock(1),
    onShow: () => {
      const t = nn.get('.grid').top + window.pageYOffset - nn.get('header').height
      window.scrollTo({ top: t, behavior: 'smooth' })
      grid.transitionTo(window.grids.bendPanel)
      // remove the crew fromt the grid
      nn.getAll('.syrup').forEach(ele => {
        ele.classList.remove('syrup')
        ele.querySelectorAll('img').forEach(img => img.remove())
        ele.onmouseover = null
        ele.onmouseout = null
        ele.onclick = null
      })
    },
    onHide: () => {
      grid.transitionTo(window.grids.default)
      // add crew back to grid
      addSyrupImgToGrid({
        path: 'images/the-crew.jpg',
        ele1: grid.getBlock(4),
        ele2: grid.getBlock(3),
        callback: () => nav.updatePage('about')
      })
    }
  })

  // popualte the inital grid
  loadASCIIArt({
    path: 'ascii-art/cows.txt',
    parent: grid.getBlock(7),
    link: 'http://www.textfiles.com/art/cow.txt'
  })

  addSyrupImgToGrid({
    path: 'images/the-crew.jpg',
    ele1: grid.getBlock(4),
    ele2: grid.getBlock(3),
    callback: () => nav.updatePage('about')
  })

  window.scrollTo({ top: 0, behavior: 'smooth' })
  await nn.sleep(300)
  nn.get('#loader').css('opacity', 0)
  setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
}

nn.on('load', main)
nn.on('resize', resize)
