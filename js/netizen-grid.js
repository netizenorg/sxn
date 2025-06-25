/* global nn */
// also global: window.colors

class NetizenGrid {
  constructor (opts = {}) {
    this.ele = opts.ele
    this.totalCols = opts.cols || 6
    this.totalRows = opts.rows || 4
    this.placed = []
    this.grids = opts.grids || []

    const grid = this.grids[0]
    this.currentGrid = grid

    for (let i = 0; i < grid.length; i += 2) {
      const cellA = grid[i]
      const cellB = grid[i + 1]

      const [i1, i2] = this.pickPairIndices(cellA, cellB, this.placed)
      const c1 = window.colors[0][i1]
      const c2 = window.colors[1][i2]

      // remember who we placed where
      this.placed.push({ cell: cellA, palette: 0, index: i1 })
      this.placed.push({ cell: cellB, palette: 1, index: i2 })

      this.createGridBlock(cellA, c1)
      this.createGridBlock(cellB, c2)
    }
  }

  isAdjacent (a, b) {
    const horiz = (a.x + a.w === b.x || b.x + b.w === a.x) &&
      (a.y < b.y + b.h && b.y < a.y + a.h)
    const vert = (a.y + a.h === b.y || b.y + b.h === a.y) &&
      (a.x < b.x + b.w && b.x < a.x + a.w)
    return horiz || vert
  }

  randomColorIndexes () {
    const max = window.colors[0].length
    const idxs = [...Array(max).keys()]
    nn.shuffle(idxs)
    return [idxs[0], idxs[1]]
  }

  pickPairIndices (cellA, cellB, placed) {
    const L = window.colors[0].length
    const all = [...Array(L).keys()]

    // gather forbidden indices from neighbours
    const forbid0 = placed
      .filter(p => p.palette === 0 && this.isAdjacent(p.cell, cellA))
      .map(p => p.index)
    const forbid1 = placed
      .filter(p => p.palette === 1 && this.isAdjacent(p.cell, cellB))
      .map(p => p.index)

    // allowed sets
    const allow0 = all.filter(i => !forbid0.includes(i))
    const allow1 = all.filter(i => !forbid1.includes(i))

    // build all (i,j) with i≠j
    const pairs = []
    allow0.forEach(i => {
      allow1.forEach(j => {
        if (i !== j) pairs.push([i, j])
      })
    })

    if (pairs.length > 0) {
      return pairs[Math.floor(Math.random() * pairs.length)]
    }
    // fallback to totally random distinct pair
    return this.randomColorIndexes()
  }

  createGridBlock (cell, color) {
    const leftPct = cell.x / this.totalCols * 100
    const topPct = cell.y / this.totalRows * 100
    const widthPct = cell.w / this.totalCols * 100
    const heightPct = cell.h / this.totalRows * 100

    nn.create('div')
      .css({
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        backgroundColor: color
      })
      .addTo('.grid')
  }

  animateToGrid () {
    const newGrid = this.currentGrid === this.grids[0]
      ? this.grids[1]
      : this.grids[0]

    const blocks = nn.getAll(this.ele)
    const start = window.performance.now()
    // capture each block’s initial %-values
    const initial = blocks.map(block => ({
      left: parseFloat(block.style.left),
      top: parseFloat(block.style.top),
      width: parseFloat(block.style.width),
      height: parseFloat(block.style.height)
    }))
    // compute target %-values
    const targets = newGrid.map(cell => ({
      left: cell.x / this.totalCols * 100,
      top: cell.y / this.totalRows * 100,
      width: cell.w / this.totalCols * 100,
      height: cell.h / this.totalRows * 100
    }))
    const duration = 800
    const easeFn = t => nn.ease('OutCubic', t)

    function update (now) {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      const eased = easeFn(t)

      blocks.forEach((block, i) => {
        const init = initial[i]
        const target = targets[i]
        // interpolate and apply
        block.css({
          left: `${nn.lerp(init.left, target.left, eased)}%`,
          top: `${nn.lerp(init.top, target.top, eased)}%`,
          width: `${nn.lerp(init.width, target.width, eased)}%`,
          height: `${nn.lerp(init.height, target.height, eased)}%`
        })
      })

      if (t < 1) window.requestAnimationFrame(update)
    }

    window.requestAnimationFrame(update)
    this.currentGrid = newGrid
  }

  updateColors () {
    this.placed = []
    const grid = this.currentGrid
    // grab each block div instead of the container
    const blocks = nn.getAll(`${this.ele} > div`)
    let idx = 0

    for (let i = 0; i < grid.length; i += 2) {
      const cellA = grid[i]
      const cellB = grid[i + 1]
      const [i1, i2] = this.pickPairIndices(cellA, cellB, this.placed)
      const c1 = window.colors[0][i1]
      const c2 = window.colors[1][i2]

      this.placed.push({ cell: cellA, palette: 0, index: i1 })
      this.placed.push({ cell: cellB, palette: 1, index: i2 })

      const blockA = blocks[idx]
      const blockB = blocks[idx + 1]
      blockA.css({ backgroundColor: c1 })
      blockB.css({ backgroundColor: c2 })

      idx += 2
    }
  }
}

window.NetizenGrid = NetizenGrid
