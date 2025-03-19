const colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#ff0000', '#ff0099', '#ff00ff', '#6600ff', '#0000ff', '#0099ff', '#00ffff', '#00ff66', '#00ff00', '#99ff00', '#ffff00', '#ff6600'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]


nn.get('#about-link').on('click', () => {
  nn.get('.splash-intro').css({ left: '100vw' })
  nn.get('.case-study').css({ left: '100vw' })
})

nn.get('#init-link').on('click', () => {
  nn.get('.splash-intro').css({ left: '0vw' })
  nn.get('.case-study').css({ left: '100vw' })
})

nn.get('#dream-link').on('click', () => {
  nn.get('.case-study').css({ left: '25vw' })
})
