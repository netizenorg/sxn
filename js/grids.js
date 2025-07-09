window.grids = {
  default: [
    { x: 0, y: 0, w: 1, h: 2 },
    { x: 1, y: 0, w: 2, h: 2 },

    { x: 3, y: 0, w: 3, h: 1 },
    { x: 3, y: 1, w: 3, h: 2 },

    { x: 0, y: 2, w: 2, h: 1 },
    { x: 2, y: 2, w: 1, h: 1 },

    { x: 0, y: 3, w: 4, h: 1 },
    { x: 4, y: 3, w: 2, h: 1 }
  ],
  bendPanel: [
    { x: 0, y: 0, w: 1, h: 1 },
    { x: 1, y: 0, w: 2, h: 1 },

    { x: 3, y: 0, w: 3, h: 2 },
    { x: 3, y: 2, w: 3, h: 1 },

    { x: 0, y: 1, w: 2, h: 2 },
    { x: 2, y: 1, w: 1, h: 2 },

    { x: 0, y: 3, w: 2, h: 1 },
    { x: 2, y: 3, w: 4, h: 1 }
  ],
  initiatives: [
    { x: 0, y: 0, w: 1, h: 2 },
    { x: 1, y: 0, w: 2, h: 2 },

    { x: 3, y: 0, w: 1, h: 3 },
    { x: 4, y: 0, w: 2, h: 3 },

    { x: 0, y: 2, w: 2, h: 1 },
    { x: 2, y: 2, w: 1, h: 1 },

    { x: 0, y: 3, w: 2, h: 1 },
    { x: 2, y: 3, w: 4, h: 1 }
  ],
  extra: [
    { x: 0, y: 0, w: 3, h: 2 },
    { x: 0, y: 2, w: 3, h: 1 },

    { x: 3, y: 0, w: 2, h: 1 },
    { x: 5, y: 0, w: 1, h: 1 },

    { x: 3, y: 1, w: 1, h: 2 },
    { x: 4, y: 1, w: 2, h: 2 },

    { x: 0, y: 3, w: 4, h: 1 },
    { x: 4, y: 3, w: 2, h: 1 }
  ]
}

// index values of larger cells (which can contain content) starting from 1
window.openCells = {
  default: [2, 4],
  bendPanel: [3, 5],
  initiatives: [2, 4],
  extra: [1, 6]
}
