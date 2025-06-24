/* global nn */
class SeededRandom {
  constructor (seed) {
    // store your seed (e.g. 100–200)
    this._seed = seed || 0
    // initialize the mulberry32 state function
    this._rand = this._mulberry32(this._seed)
  }

  // mulberry32 generator factory
  _mulberry32 (a) {
    return () => {
      a |= 0
      a = (a + 0x6D2B79F5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  // exactly the same API: random(), random(max), random(min, max)
  random (min, max) {
    const r = this._rand()
    if (min === undefined) {
      return r
    } else if (max === undefined) {
      max = min
      min = 0
    }
    return r * (max - min) + min
  }

  updateSeed (seed) {
    this._seed = seed
    this._rand = this._mulberry32(this._seed)
  }
}

class NetizenSyrupImage {
  constructor (opts = {}) {
    this.canvas = opts.canvas
    this.image = opts.image
    this.parent = opts.parent
    this.second = opts.second

    this.huffhack = opts.huffhack || { process: true, zIndex: 1, opacity: 0.5 }
    this.pixelate = opts.pixelate || { process: true, zIndex: 2, opacity: 0.5 }
    this.dither = opts.dither || { process: true, zIndex: 3, opacity: 0.5 }
    this.ascii = opts.ascii || { process: true, zIndex: 4, opacity: 0.5 }

    this.SR = new SeededRandom(this.huffhack.seed)

    this.loadAndResizeImage(this.image, nn.get(this.parent), (img) => {
      this._image = img
      this.update(img)
    })
  }

  loadAndResizeImage (url, container, callback) {
    const img = new window.Image()
    img.addEventListener('load', () => {
      const cw = container.clientWidth
      const ch = container.clientHeight
      const { naturalWidth: nw, naturalHeight: nh } = img
      // use the larger scale so no letterboxing (cover behavior)
      const scale = Math.max(cw / nw, ch / nh)
      img.width = nw * scale
      img.height = nh * scale
      callback(img)
    })
    img.addEventListener('error', err => {
      console.error('Failed to load image', err)
    })
    img.src = url
  }

  glitchIt (base64) {
    const jpg = 'data:image/jpeg;base64,'
    base64 = base64.substr(jpg.length)
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    // loop through JPEG Data to find huffman table marker
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i].toString(16) === 'ff' && bytes[i + 1].toString(16) === 'c4') {
        const idx = i + 24 // few bytes into the huffman codes
        const huf = (bytes[i + 21] === 0) ? 'DC' : 'AC'
        const len = (huf === 'DC') ? 16 : 255
        let ran = Math.floor(this.SR.random(0, len))
        if (ran === bytes[idx]) ran = Math.floor(this.SR.random(0, len))
        if (ran === bytes[idx]) ran = Math.floor(this.SR.random(0, len))
        bytes[idx] = ran
        break
      }
    }
    return bytes
  }

  Uint8ToString (u8a) {
    // via: https://stackoverflow.com/a/12713326/1104148
    const CHUNK_SZ = 0x8000
    const c = []
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)))
    }
    return c.join('')
  }

  huffHack (image) {
    const canvas = nn.create('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    const data = canvas.toDataURL('image/jpeg')
    if (this.huffhack.seed) this.SR.updateSeed(this.huffhack.seed)
    const bytes = this.glitchIt(data)
    const b64 = window.btoa(this.Uint8ToString(bytes))
    let url = `data:image/jpeg;base64,${b64}`
    const img = new window.Image()
    img.onload = () => {
      ctx.globalCompositeOperation = 'saturation'
      ctx.drawImage(img, 0, 0)
      ctx.globalCompositeOperation = 'lighten'
      ctx.drawImage(img, 0, 0)
      url = canvas.toDataURL('image/jpeg')

      const imgEle = (document.querySelector(`${this.parent} img[name="huffhack"]`))
        ? nn.get(`${this.parent} img[name="huffhack"]`) : nn.create('img')
      const css = {
        zIndex: this.huffhack.zIndex || 1,
        opacity: typeof this.huffhack.opacity === 'number' ? this.huffhack.opacity : 0.5,
        display: 'block'
      }
      imgEle
        .css(css)
        .set('src', url)
        .set('name', 'huffhack')
        .addTo(this.parent)
    }
    img.src = url
  }

  // in StandardJS style — no parseColor helper needed
  async makePixelatedDuotone (img, opts) {
    const {
      size = 8,
      threshold = 128
    } = opts
    const w = img.width
    const h = img.height

    // 1) pull your two tones via nn.colorMatch
    const parentEl = nn.get(this.parent)
    const lowMatch = nn.colorMatch(parentEl.style.backgroundColor)
    const lr = parseInt(lowMatch[2], 10)
    const lg = parseInt(lowMatch[3], 10)
    const lb = parseInt(lowMatch[4], 10)

    // assumes this.second is a DOM element with a background-color set
    const secEl = nn.get(this.second)
    const highMatch = nn.colorMatch(secEl.style.backgroundColor)
    const hr = parseInt(highMatch[2], 10)
    const hg = parseInt(highMatch[3], 10)
    const hb = parseInt(highMatch[4], 10)

    // 2) draw a small, pixelated version
    const smallW = Math.ceil(w / size)
    const smallH = Math.ceil(h / size)
    const smallCanvas = document.createElement('canvas')
    smallCanvas.width = smallW
    smallCanvas.height = smallH
    const sctx = smallCanvas.getContext('2d')
    sctx.drawImage(img, 0, 0, smallW, smallH)

    // 3) threshold → lowTone or highTone
    const imgData = sctx.getImageData(0, 0, smallW, smallH)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.3 * data[i] +
                  0.59 * data[i + 1] +
                  0.11 * data[i + 2]

      if (lum < threshold) {
        // shadows → parent background
        data[i] = lr
        data[i + 1] = lg
        data[i + 2] = lb
        data[i + 3] = 255
      } else {
        // highlights → this.second background
        data[i] = hr
        data[i + 1] = hg
        data[i + 2] = hb
        data[i + 3] = 255
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

    // 5) insert back into the DOM
    const imgEle = (document.querySelector(`${this.parent} img[name="pixelate"]`))
      ? nn.get(`${this.parent} img[name="pixelate"]`) : nn.create('img')
    const url = outCanvas.toDataURL()
    const css = {
      zIndex: this.pixelate.zIndex || 2,
      opacity: typeof this.pixelate.opacity === 'number' ? this.pixelate.opacity : 0.5,
      display: 'block'
    }
    imgEle
      .css(css)
      .set('src', url)
      .set('name', 'pixelate')
      .addTo(parentEl)
  }

  makeDitheredImage (img, opts = {}) {
    const {
      threshold = 128,
      algorithm = 'floydSteinberg',
      dotSize = 1
    } = opts

    const w = img.width
    const h = img.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)

    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const lum = new Float32Array(w * h)

    // build luminance buffer
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i4 = (y * w + x) * 4
        lum[y * w + x] = 0.3 * data[i4] +
                         0.59 * data[i4 + 1] +
                         0.11 * data[i4 + 2]
      }
    }

    // apply chosen algorithm (binary output in lum[])
    if (algorithm === 'atkinson') {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x
          const oldVal = lum[idx]
          const newVal = oldVal < threshold ? 0 : 255
          const err = oldVal - newVal
          lum[idx] = newVal
          if (x + 1 < w) lum[idx + 1] += err / 8
          if (x + 2 < w) lum[idx + 2] += err / 8
          if (y + 1 < h) {
            if (x > 0) lum[idx + w - 1] += err / 8
            lum[idx + w] += err / 8
            if (x + 1 < w) lum[idx + w + 1] += err / 8
          }
          if (y + 2 < h) lum[idx + 2 * w] += err / 8
        }
      }
    } else if (algorithm === 'bayer') {
      const bm = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ]
      const factor = 255 / 16
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x
          const th = (bm[y % 4][x % 4] + 0.5) * factor
          lum[idx] = lum[idx] < th ? 0 : 255
        }
      }
    } else {
      // default to Floyd–Steinberg
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x
          const oldVal = lum[idx]
          const newVal = oldVal < threshold ? 0 : 255
          const err = oldVal - newVal
          lum[idx] = newVal
          if (x + 1 < w) lum[idx + 1] += err * 7 / 16
          if (y + 1 < h) {
            if (x > 0) lum[idx + w - 1] += err * 3 / 16
            lum[idx + w] += err * 5 / 16
            if (x + 1 < w) lum[idx + w + 1] += err * 1 / 16
          }
        }
      }
    }

    // parse fg/bg from elements
    const fgCss = nn.get(this.parent).style.backgroundColor
    const bgCss = nn.get(this.second).style.backgroundColor
    const mkRGB = css => {
      const m = nn.colorMatch(css)
      return [parseInt(m[2], 10), parseInt(m[3], 10), parseInt(m[4], 10)]
    }
    const [fgR, fgG, fgB] = mkRGB(fgCss)
    const [bgR, bgG, bgB] = mkRGB(bgCss)

    if (dotSize > 1) {
      // halftone‐style dots
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = `rgb(${fgR},${fgG},${fgB})`
      for (let y = 0; y < h; y += dotSize) {
        for (let x = 0; x < w; x += dotSize) {
          const cx = x + dotSize * 0.5
          const cy = y + dotSize * 0.5
          const idx = Math.floor(cy) * w + Math.floor(cx)
          if (lum[idx] === 255) {
            ctx.beginPath()
            ctx.arc(cx, cy, dotSize * 0.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    } else {
      // pixel‐level two‐tone map
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x
          const i4 = idx * 4
          if (lum[idx] === 0) {
            data[i4] = bgR
            data[i4 + 1] = bgG
            data[i4 + 2] = bgB
          } else {
            data[i4] = fgR
            data[i4 + 1] = fgG
            data[i4 + 2] = fgB
          }
          data[i4 + 3] = 255
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    const url = canvas.toDataURL('image/png')
    const selector = `${this.parent} img[name="dither"]`
    const imgEle = document.querySelector(selector)
      ? nn.get(selector) : nn.create('img')
    const css = {
      zIndex: this.dither.zIndex || 3,
      opacity: typeof this.dither.opacity === 'number'
        ? this.dither.opacity : 0.5,
      display: 'block'
    }
    imgEle
      .css(css)
      .set('name', 'dither')
      .set('src', url)
      .addTo(this.parent)
  }

  makeAsciiImage (img, opts = {}) {
    // store for reuse in css
    this.ascii = opts

    const {
      chars = 'O*.  ',
      fontSize = 8,
      fgColor = '#fff'
    } = opts

    const w = img.width
    const h = img.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)

    // extract luminance buffer
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const lum = new Float32Array(w * h)
    for (let i = 0; i < lum.length; i++) {
      const j = i * 4
      lum[i] = 0.3 * data[j] +
               0.59 * data[j + 1] +
               0.11 * data[j + 2]
    }

    // draw ASCII blocks
    const cols = Math.ceil(w / fontSize)
    const rows = Math.ceil(h / fontSize)

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = fgColor
    ctx.font = `${fontSize}px Fira Mono`
    ctx.textBaseline = 'top'

    for (let yy = 0; yy < rows; yy++) {
      for (let xx = 0; xx < cols; xx++) {
        const px = Math.floor(Math.min(xx * fontSize, w - 1))
        const py = Math.floor(Math.min(yy * fontSize, h - 1))
        const v = lum[py * w + px]
        const idx = Math.floor((v / 255) * (chars.length - 1))
        const ch = chars[idx]
        ctx.fillText(ch, xx * fontSize, yy * fontSize)
      }
    }

    // export as image and append
    const url = canvas.toDataURL('image/png')
    const selector = `${this.parent} img[name="ascii"]`
    const imgEle = document.querySelector(selector)
      ? nn.get(selector)
      : nn.create('img')
    const css = {
      zIndex: this.ascii.zIndex || 4,
      opacity: typeof this.ascii.opacity === 'number'
        ? this.ascii.opacity
        : 0.5,
      display: 'block'
    }

    imgEle
      .css(css)
      .set('name', 'ascii')
      .set('src', url)
      .addTo(this.parent)
  }

  updateInit (opts) {
    this.parent = opts.parent
    this.second = opts.second
    this.updateImage(opts.image)
  }

  updateImage (image) {
    this.image = image // image path
    this.loadAndResizeImage(image, nn.get(this.parent), (img) => {
      this._image = img // image data
      this.update(img)
    })
  }

  update (image) {
    if (!image) image = this._image

    const pEle = document.querySelector(`${this.parent} img[name="pixelate"]`)
    if (this.pixelate.process) this.makePixelatedDuotone(image, this.pixelate)
    else if (pEle) pEle.css('display', 'none')

    const hEle = document.querySelector(`${this.parent} img[name="huffhack"]`)
    if (this.huffhack.process) this.huffHack(image)
    else if (hEle) hEle.css('display', 'none')

    const dEle = document.querySelector(`${this.parent} img[name="dither"]`)
    if (this.dither.process) this.makeDitheredImage(image, this.dither)
    else if (dEle) dEle.css('display', 'none')

    const aEle = document.querySelector(`${this.parent} img[name="ascii"]`)
    if (this.ascii.process) this.makeAsciiImage(image, this.ascii)
    else if (aEle) aEle.css('display', 'none')
  }
}

window.NetizenSyrupImage = NetizenSyrupImage
window.SeededRandom = SeededRandom
