function recenter(rect, c) {
  var d = delta(rect(center), c);
  var clone = Object.assign({}, obj);
}

function average(p1, p2) {
  return {
    x: p1.x + p2.x / 2,
    y: p1.y + p2.y / 2,
  }
}

function delta(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  }
}

function center(r) {
  return {
    x: r.x + r.width/2,
    y: r.y + r.height/2,
  }
}