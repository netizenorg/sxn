/* global nn, NetizenGrid, loadData */
/*
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
..............................................................................
    Hi jon! any variables or simple javascript functions can go below this
    comment (any complex fucntions or classes should go in their own files)
..............................................................................
*.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
*/

let grid // i put this variable here so it can be accessed in any function u make (not just main)

//
// -----------------------------------------------------------------------------
//                                                            THE MAIN FUCNCTION
// this runs as soon as the page loads
async function main () {
  if (!nn.isMobile()) window.location = 'index.html'
  /*
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  ..............................................................................
      Hi jon! any JS u need to run on page load should go BELOW this comment!
  ..............................................................................
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  */

  // This part loads all our data from the data folder
  // && structures it all in a userful way into "window.data" (see docs)
  window.data = await loadData()

  // little mobile hack...
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // here's a grid! (see docs to learn more)
  grid = new NetizenGrid({
    selector: '#example-grid'
  })

  /*
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  ..............................................................................
      Hi jon! any JS u need to run on page load should go ABOVE this comment!
  ..............................................................................
  *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O *.O
  */

  // little hack if u want to add a little wait time to the loader
  // await nn.sleep(1000) // load buffer (change as needed)

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
