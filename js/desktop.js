/* global nn, NetizenNav, NetizenGrid, NetizenASCIISplash, NetizenContentBlock, NetizenBendPanel, NetizenSyrupImage, loadASCIIArt, loadData */

window.data = null // contains all the content data
let nav, splash, content, grid, bendPanel, subNav

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

// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
// *.O                             util functions                          *.O
// *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O

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
  // reset initiatives
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

  const fadeIn = e => { e.style.opacity = 1 }
  const fadeOut = e => { e.style.opacity = 0 }

  opts.ele1.onmouseover = () => {
    opts.ele1.querySelectorAll('.syrup-pre').forEach(fadeOut)
    opts.ele1.querySelectorAll('.syrup-post').forEach(fadeIn)
    opts.ele1.querySelectorAll('img').forEach(img => {
      if (img.name !== 'clean') img.style.opacity = 0
    })
  }
  opts.ele1.onmouseout = () => {
    opts.ele1.querySelectorAll('.syrup-pre').forEach(fadeIn)
    opts.ele1.querySelectorAll('.syrup-post').forEach(fadeOut)
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

  subNav.classList.add('sub-nav')
  window.data._initiativesOrder.forEach(proj => {
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

  grid.transitionTo(window.grids.default2)

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

async function URLHandling () {
  let hash = window.location.hash
  if (hash.includes('#about')) {
    nav.updatePage('about')
    return 'ready'
  } else if (hash.includes('#initiatives')) {
    nav.updatePage('initiatives')
    hash = hash.split('/')
    if (hash.length > 1) {
      await nn.sleep(1200)
      nn.get(`.sub-nav-item[name="${hash[1]}"]`).click()
      return 'ready'
    }
  } else if (hash.includes('#support')) {
    nav.updatePage('about')
    return 'ready'
  }
}

function resize () {
  if (window.blockerTimer) {
    clearTimeout(window.blockerTimer)
    clearTimeout(window.killLoader)
  }

  if (nn.width < 900) bendPanel.disable()
  else bendPanel.enable()

  nn.get('#loader').css('display', 'flex')
  nn.get('#loader').css('opacity', 1)

  content.adjustHeight()

  window.blockerTimer = setTimeout(() => {
    nn.get('#loader').css('opacity', 0)
    window.killLoader = setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
  }, 250)
}

async function main () {
  if (nn.isMobile()) window.location = 'mobile.html'

  // load initial data
  window.data = await loadData()

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
  subNav = content.ele.children[0]
  subNav.classList.add('sub-nav')

  // setup main grid section
  grid = new NetizenGrid({
    selector: '#main-grid',
    grid: window.grids.default
  })

  // setup bend panel
  await document.fonts.load('200px Fira Mono')
  bendPanel = new NetizenBendPanel({
    textEle: grid.getBlock(1),
    panelEle: '.grid div:nth-child(3)', // 'main',
    onShow: () => {
      const t = nn.get('.grid').top + window.pageYOffset - nn.get('header').height
      window.scrollTo({ top: t, behavior: 'smooth' })
      grid.transitionTo(window.grids.default2)
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

  if (nn.width < 900) bendPanel.disable()

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
  await nn.sleep(2000)

  // check for window location logic
  const total = window.data._initiativesOrder.length
  const waitingForDataToLoad = setInterval(async () => {
    const loaded = Object.keys(window.data.initiatives).length
    if (loaded === total) { // if data is all loaded
      clearInterval(waitingForDataToLoad)

      await URLHandling()

      nn.get('#loader').css('opacity', 0)
      setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
    }
    // ... otherwise, keep looping
  }, 200)
}

nn.on('load', main)
nn.on('resize', resize)
