/* global nn */
function generateGrid (config = {}) {
  let {
    gridWidth = 6,
    gridHeight = 6,
    maxModuleHeight = 3,
    parentSel = '#the-grid',
    cellSize = 100,
    debug = false
  } = config

  cellSize = cellSize + 'px'

  const gridEle = nn.get(parentSel).content('')
  gridEle.style.setProperty('--grid-cols', gridWidth)
  gridEle.style.setProperty('--cell-size', cellSize)
  gridEle.css({
    display: 'grid',
    gridTemplateColumns: 'repeat(var(--grid-cols), 1fr)',
    gridAutoRows: 'var(--cell-size)',
    gap: debug ? '4px' : '0',
    width: '100%'
  })

  // multi-dimensional grid Array (to track filled cells)
  const occupied = []
  for (let i = 0; i < gridHeight; i++) {
    occupied[i] = []
    for (let j = 0; j < gridWidth; j++) {
      occupied[i][j] = false
    }
  }

  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      if (occupied[row][col]) continue

      const availableColumns = gridWidth - col
      const availableRows = gridHeight - row
      // Maximum multiplier such that total module width (3 * multiplier) fits.
      const maxMultiplier = Math.floor(availableColumns / 3)
      if (maxMultiplier < 1) continue

      // Create and shuffle possible multipliers (from 1 to maxMultiplier).
      const multipliers = nn.shuffle(Array.from({ length: maxMultiplier }, (_, i) => i + 1))
      let placed = false
      for (const multiplier of multipliers) {
        const moduleWidth = multiplier * 3
        // Limit the module height to the available rows.
        const possibleMaxHeight = Math.min(maxModuleHeight, availableRows)
        // Create and shuffle candidate heights (from 1 to possibleMaxHeight).
        const heights = nn.shuffle(Array.from({ length: possibleMaxHeight }, (_, i) => i + 1))
        for (const moduleHeight of heights) {
          // Check if the rectangle for the module is free.
          let canPlace = true
          for (let r = row; r < row + moduleHeight; r++) {
            for (let c = col; c < col + moduleWidth; c++) {
              if (occupied[r][c]) {
                canPlace = false
                break
              }
            }
            if (!canPlace) break
          }
          if (!canPlace) continue

          // Mark cells as occupied.
          for (let r = row; r < row + moduleHeight; r++) {
            for (let c = col; c < col + moduleWidth; c++) {
              occupied[r][c] = true
            }
          }

          // Create the module element and set its grid placement.
          const moduleEl = nn.create('div')
            .css({
              display: 'flex',
              overflow: 'hidden',
              background: '#f0f0f0',
              border: debug ? '1px solid #ccc' : 'none',
              gridColumn: (col + 1) + ' / span ' + moduleWidth,
              gridRow: (row + 1) + ' / span ' + moduleHeight
            })

          const cellCSS = {
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'center',
            borderRight: debug ? '1px solid #ccc' : 'none',
            padding: '10px'
          }

          const cell1 = nn.create('div').css(cellCSS)
          const cell2 = nn.create('div').css(cellCSS)

          if (!debug) {
            cell1.style.background = nn.random(window.colors[0])
            cell2.style.background = nn.random(window.colors[2])
          } else {
            cell1.style.background = '#939598'
            cell2.style.background = '#c7c8ca'
          }

          // Randomly determine which cell is double-width.
          // The smaller part should be 'multiplier' and the larger '2 * multiplier'
          if (Math.random() < 0.5) {
            cell1.style.flex = multiplier + ''
            cell2.style.flex = (2 * multiplier) + ''
          } else {
            cell1.style.flex = (2 * multiplier) + ''
            cell2.style.flex = multiplier + ''
          }
          moduleEl.appendChild(cell1)
          moduleEl.appendChild(cell2)
          gridEle.appendChild(moduleEl)
          placed = true
          break
        }
        if (placed) break
      }
    }
  }
}

window.generateGrid = generateGrid
