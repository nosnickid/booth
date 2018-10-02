function add(p1, p2) {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  }
}

function subtract(p1, p2) {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  }
}

function perpendicular(p) {
  return {
    x: -p.y,
    y: p.x,
  }
}

function length(p){
	return Math.sqrt(p.x * p.x + p.y * p.y);
};
  
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

// euclidean distance between two points
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2));
}

function normalize(p, scale) {
  var l = length(p);  
  return {
      x: (p.x / l) * scale,
      y: (p.y / l) * scale,
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

function index2Dto1D(x, y) {
 return ((y * canvasWidth/downsampleFactor) + x) * 4;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function download(data, filename) {
  let url = URL.createObjectURL(data);
  let a = document.createElement('a');
  a.style = 'display: none';
  document.body.appendChild(a);
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  a.parentNode.removeChild(a);
}