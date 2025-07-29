/* global nn, NetizenGrid */
window.colors = [
  ['#ff9999', '#ff99cc', '#ff99ff', '#cc99ff', '#9999ff', '#99ccff', '#99ffff', '#99ffcc', '#99ff99', '#ccff99', '#ffff99', '#ffcc99'],
  ['#993333', '#993366', '#993399', '#663399', '#333399', '#336699', '#339999', '#339966', '#339933', '#669933', '#999933', '#996633']
]

window.data = null // this will contain all our content data (once loaded)
let grid

/*
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
..............................................................................
    Hi jon! any simple javascript functions can go BELOW this comment
    (any complex fucntions or classes should go in their own files)
..............................................................................
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
*/

// this helper function is for loading our data form the data folder
async function loadData () {
  const res = await window.fetch('data/main.json')
  if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)
  return await res.json()
}

/*
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
..............................................................................
    Hi jon! any simple javascript functions can go ABOVE this comment
    (any complex fucntions or classes should go in their own files)
..............................................................................
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
*/

//
// -----------------------------------------------------------------------------
//                                                            THE MAIN FUCNCTION
// this runs as soon as the page loads
async function main () {
  if (!nn.isMobile()) window.location = 'index.html'

  // This part loads all our data from the data folder
  // && structures it all in a userful way into "window.data"
  window.data = await loadData()
  window.data._initiativesOrder = [...window.data.initiatives]
  window.data.initiatives = {}
  window.data._initiativesOrder.forEach(async file => {
    const res = await window.fetch(`data/initiatives/${file}`)
    const json = await res.json()
    const name = file.split('.')[0]
    window.data.initiatives[name] = json
    window.data.initiatives[name].name = name
  })

  window.scrollTo({ top: 0, behavior: 'smooth' })
  // await nn.sleep(1000) // load buffer (change as needed)

  /*
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  ..............................................................................
      Hi jon! any JS u need to run on page load should go BELOW this comment!
  ..............................................................................
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  */

  grid = new NetizenGrid({
    selector: '.grid'
  })

  /*
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  ..............................................................................
      Hi jon! any JS u need to run on page load should go ABOVE this comment!
  ..............................................................................
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  */

  // this part waits for all the data to be fully loaded
  // && once it is it removes the loader
  const total = window.data._initiativesOrder.length
  const waitingForDataToLoad = setInterval(async () => {
    const loaded = Object.keys(window.data.initiatives).length
    if (loaded === total) { // if data is all loaded...
      clearInterval(waitingForDataToLoad)
      nn.get('#loader').css('opacity', 0)
      setTimeout(() => nn.get('#loader').css('display', 'none'), 800)
    }
    // ... otherwise, keep looping
  }, 200)
}

nn.on('load', main)
