function center(r) {
  return {
    x: r.x + r.width/2,
    y: r.y + r.height/2,
  }
}

module.exports = [center];