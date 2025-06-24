/* global nn, NetizenGrid, NetizenASCIISplash, NetizenSyrupImage, NetizenBentText */

window.colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]

let splash, grid, bent, syrup, clean
const images = ['becca', 'brannon', 'harlo', 'ingrid', 'janice', 'margaret', 'melody', 'tara']

function randomize () {


  syrup.update()
}

function updateSyrup () {
  // pick new image
  const image = `../images/dream/${nn.random(images)}.jpg`

  // randomize settings
  let order = [2, 3, 4]
  order = nn.shuffle(order)
  // while most values glitch on Firefox/Mac
  // only these values seem to work on Chrome/Mac
  // (have not tested on other platforms yet)
  const gvals = [7, 19, 35, 45, 46, 79, 86, 87, 90, 96]

  syrup.pixelate.process = true
  syrup.pixelate.opacity = nn.random(0.5, 1)
  syrup.pixelate.zIndex = 1
  syrup.pixelate.size = nn.random(6, 28)
  syrup.pixelate.threshold = nn.random(16, 128)

  syrup.huffhack.process = nn.random() > 0.5
  syrup.huffhack.opacity = nn.random(0, 0.5)
  syrup.huffhack.zIndex = order[0]
  syrup.huffhack.seed = nn.random(gvals)

  syrup.dither.process = nn.random() > 0.5
  syrup.dither.opacity = nn.random()
  syrup.dither.zIndex = order[1]
  syrup.dither.algorithm = 'bayer'
  syrup.dither.dotSize = nn.random([1, 3, 5])
  syrup.dither.threshold = 174 // doesn't matter for bayer (only other algos)

  syrup.ascii.process = nn.random() > 0.5
  syrup.ascii.opacity = nn.random()
  syrup.ascii.zIndex = order[2]
  syrup.ascii.chars = nn.random(['O*.   ', 'O*.  ', 'O*. ', 'O*. '])
  syrup.ascii.fontSize = nn.random(4, 12)
  syrup.ascii.fgColor = nn.random(['black', 'white'])

  // update image + container
  const rmv = (e) => { e.style.opacity = 0; setTimeout(() => e.remove(), 600) }
  let parent, second
  const oldParent = syrup.parent
  if (oldParent === '.grid div:nth-child(4)') {
    nn.getAll('.grid div:nth-child(4) img').forEach(rmv)
    parent = '.grid div:nth-child(5)'
    second = '.grid div:nth-child(6)'
  } else {
    nn.getAll('.grid div:nth-child(5) img').forEach(rmv)
    parent = '.grid div:nth-child(4)'
    second = '.grid div:nth-child(3)'
  }
  syrup.updateInit({ image, parent, second })

  // update clean image
  clean.style.opacity = 0
  setTimeout(() => {
    clean.remove()
    clean = nn.create('img').set('src', image).set('name', 'clean').addTo(parent)
  }, 600)

  // update event listeners
  const hide = (e) => { if (e.name !== 'clean') e.style.opacity = 0 }
  const show = (e) => { if (e.name !== 'clean') { e.style.opacity = syrup[e.name].opacity } }
  nn.get(oldParent).onmouseover = null
  nn.get(oldParent).onmouseout = null
  nn.get(parent).onmouseover = () => nn.getAll(`${parent} img`).forEach(hide)
  nn.get(parent).onmouseout = () => nn.getAll(`${parent} img`).forEach(show)
}

function main () {
  // setup splash page slide show
  splash = new NetizenASCIISplash({
    ele: '#splash-canvas',
    images: [
      '../images/walking-tour/netwalkingtour4.jpg',
      '../images/walking-tour/netwalkingtour3.jpg',
      '../images/walking-tour/netwalkingtour2.jpg',
      '../images/walking-tour/netwalkingtour1.jpg'
    ],
    holdTime: 6000,
    fadeTime: 1000,
    scrambleTime: 10,
    asciiHoldTime: 3000,
    aspectWidth: 16,
    aspectHeight: 9
  })

  // setup initial grid layout
  grid = new NetizenGrid({
    ele: '.grid div',
    grids: [
      [
        { x: 0, y: 0, w: 1, h: 2 },
        { x: 1, y: 0, w: 2, h: 2 },

        { x: 3, y: 0, w: 3, h: 1 },
        { x: 3, y: 1, w: 3, h: 2 },

        { x: 0, y: 2, w: 2, h: 1 },
        { x: 2, y: 2, w: 1, h: 1 },

        { x: 0, y: 3, w: 4, h: 1 },
        { x: 4, y: 3, w: 2, h: 1 }
      ],
      [
        { x: 0, y: 0, w: 1, h: 1 },
        { x: 1, y: 0, w: 2, h: 1 },

        { x: 3, y: 0, w: 3, h: 2 },
        { x: 3, y: 2, w: 3, h: 1 },

        { x: 0, y: 1, w: 2, h: 2 },
        { x: 2, y: 1, w: 1, h: 2 },

        { x: 0, y: 3, w: 2, h: 1 },
        { x: 2, y: 3, w: 4, h: 1 }
      ]
    ]
  })

  bent = new NetizenBentText({
    parent: '.grid div:nth-child(1)',
    text: ['BEND', 'THIS', 'SITE'],
    color: nn.get('.grid div:nth-child(2)').style.backgroundColor,
    padding: 10,
    xOverlap: 30,
    yOverlap: 80
  })

  const randomImage = `../images/dream/${nn.random(images)}.jpg`
  syrup = new NetizenSyrupImage({
    image: randomImage,
    parent: '.grid div:nth-child(4)',
    second: '.grid div:nth-child(3)'
  })

  clean = nn.create('img')
    .set('src', randomImage)
    .set('name', 'clean')
    .addTo('.grid div:nth-child(4)')

  nn.get('.grid div:nth-child(4)').onmouseover = () => {
    nn.getAll('.grid div:nth-child(4) img').forEach(img => {
      if (img.name !== 'clean') img.style.opacity = 0
    })
  }
  nn.get('.grid div:nth-child(4)').onmouseout = () => {
    nn.getAll('.grid div:nth-child(4) img').forEach(img => {
      if (img.name !== 'clean') {
        img.style.opacity = syrup[img.name].opacity
      }
    })
  }

  nn.get('.grid').on('click', () => {
    grid.animateToGrid()
    updateSyrup()
  })
}

nn.on('load', main)
