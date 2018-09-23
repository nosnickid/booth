function add(p1, p2) {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  }
}

function scale(p1, s) {
  return {
    x: p1.x * s,
    y: p1.y * s,
  }
}

function average(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

function average(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

function delta(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  }
}

// calculates the center, assuming that the x and y positions are the corner
function center(r) {
  return {
    x: r.x + r.width/2,
    y: r.y + r.height/2,
  }
}
	
function colorDistance(target, actual) {
  return Math.sqrt(
    (target.r - actual.r) * (target.r - actual.r) +
    (target.g - actual.g) * (target.g - actual.g) +
    (target.b - actual.b) * (target.b - actual.b)
  );
}