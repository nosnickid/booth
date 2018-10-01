
var gestures;
var maxGesturesPerColor;  // Number of gestures
var minMove;     // Minimum travel for a new point

var tempP; // Polygon
var tmpXp;
var tmpYp;

var colors = [RED, GREEN, BLUE];

function yellowtailSetup() {

	maxGesturesPerColor = 10;  // Number of gestures
	minMove = 3;     // Minimum travel for a new point

	tempP; // Polygon
	tmpXp = [];
	tmpYp = [];

  gestures = {}
  for (let color of colors) {
    gestures[color] = [];
  }
	
	clearGestures();
}

function clearGestures() {
  for (let color of colors) {
    gestures[color] = [];
  }
}


function yellowtailDraw() {

  updateGeometry();
    
    for (let color of colors) {
      for (let gesture of gestures[color]) {
        var mode = vizModeCurrent;
        switch (mode) {
          case 0:
            yellowtailModeColor(color);
            break;
          default:
            splineModeColor(color);
            break;
        }
        renderGesture(gesture, canvasWidth, canvasHeight);
      }
    }
  }

function yellowtailModeColor(color) {
  if (color === RED) {
    fill(255,0,0);
    stroke(255,0,0);
  } else if (color === GREEN) {
    fill(0,255,0);
    stroke(0,255,0);
  } else if (color === BLUE) {
    fill(0,0,255);
    stroke(0,0,255);
  }
}

function splineModeColor(color) {
  noFill();
  if (color === RED) {
    stroke(255,0,0,200);
  } else if (color === GREEN) {
    stroke(0,255,0,200);
  } else if (color === BLUE) {
    stroke(0,0,255,200);
  }
}


function newGesture(color, point) {
    if (gestures[color].length >= maxGesturesPerColor) {
      gestures[color].shift(); 
    }
    var G = new Gesture(canvasWidth, canvasHeight);
    G.clear();
    G.clearPolys();
    G.addPoint(point.x, point.y);
    gestures[color].push(G);
}

function continueGesture(rect) {
  if (gestures[rect.color].length == 0) {
    console.warn("attempt to continue nonexistent gesture with rect", rect);
  } else {
      var G = gestures[rect.color][gestures[rect.color].length-1]
      if (G.distToLast(rect.x, rect.y) > minMove) {
          G.addPoint(rect.x, rect.y);
          G.smooth();
          G.compile();
      }
  }
}

function renderGesture(gesture, w, h) {  
  if (gesture.exists) { 
    var mode = vizModeCurrent;
    switch (mode) {
      case 0:
        renderGestureYellowtail(gesture, w, h);
        break;
      default:
        renderGestureSpline(gesture, w, h);
        break;
    }
  }
}

// TODO handle the end of the stroke (which might be too short for step size)
// TODO slow down the animation

function renderGestureSpline(gesture, w, h) {
    var points = gesture.path;
    
  // vizParams
    var stepSize = 4;
    var splineNum = 5;
    var splineSpace = 20;
    var splineInitialBend = 2;
    
    var parityCounter = 0;
    var i = 0;
    while (i < gesture.nPoints - (3 * stepSize)) {
      var p0 = points[i];
      var p1 = points[i + 1 * stepSize];
      var p2 = points[i + 2 * stepSize];
      var p3 = points[i + 3 * stepSize];
      
      var vector = subtract(p3, p0);
      var crossSectionVector = perpendicular(vector);
      
      
      // Draw the multiple offset splines for the current segment
      for (let j = 0; j < splineNum; ++j) {
        
        var offsetStart = j + splineInitialBend;
        if (parityCounter % 2 == 0) {
          offsetStart *= -1;
        }
        
        var offset1 = normalize(crossSectionVector, p1.p * offsetStart * splineSpace);
        var offset2 = normalize(crossSectionVector, p2.p * offsetStart * splineSpace);
        
        bezier(p0.x, p0.y, 
               p1.x + offset1.x, p1.y + offset1.y, 
               p2.x + offset2.x, p2.y + offset2.y, 
               p3.x, p3.y);
      }
      
      i += 3 * stepSize;
      parityCounter++;
    }
  
    // Do the extra bit (points < one full segment length
    i -= 3 * stepSize;
    var remainderLength = gesture.nPoints - i;
    var lastSegmentStepSize = 1;
    //while (remainderLength) {
    //}
}

function renderGestureYellowtail(gesture, w, h) {
          if (gesture.nPolys > 0) {
            var polygons = gesture.polygons;
            var crosses = gesture.crosses;

            var xpts = [];
            var ypts = [];
            var p;
            var cr;

            beginShape(QUADS);
            var gnp = gesture.nPolys;
            for (let i = 0; i < gnp; i++) {

                p = polygons[i];
                xpts = p.xpoints;
                ypts = p.ypoints;

                vertex(xpts[0], ypts[0]);
                vertex(xpts[1], ypts[1]);
                vertex(xpts[2], ypts[2]);
                vertex(xpts[3], ypts[3]);

                if ((cr = crosses[i]) > 0) {
                    if ((cr & 3)>0) {
                        vertex(xpts[0]+w, ypts[0]);
                        vertex(xpts[1]+w, ypts[1]);
                        vertex(xpts[2]+w, ypts[2]);
                        vertex(xpts[3]+w, ypts[3]);

                        vertex(xpts[0]-w, ypts[0]);
                        vertex(xpts[1]-w, ypts[1]);
                        vertex(xpts[2]-w, ypts[2]);
                        vertex(xpts[3]-w, ypts[3]);
                    }
                    if ((cr & 12)>0) {
                        vertex(xpts[0], ypts[0]+h);
                        vertex(xpts[1], ypts[1]+h);
                        vertex(xpts[2], ypts[2]+h);
                        vertex(xpts[3], ypts[3]+h);

                        vertex(xpts[0], ypts[0]-h);
                        vertex(xpts[1], ypts[1]-h);
                        vertex(xpts[2], ypts[2]-h);
                        vertex(xpts[3], ypts[3]-h);
                    }

                    // I have knowingly retained the small flaw of not
                    // completely dealing with the corner conditions
                    // (the case in which both of the above are true).
                }
            }
            endShape();
        }
}

function updateGeometry() {
  var J;
  for (let color of colors) {
    for (let i =0; i < gestures[color].length; i++) {
      if ((J = gestures[color][i]).exists) {
        if (i != gestures[color].length-1) {
          advanceGesture(J);
        // TODO we should keep track of stuffOnScreen in a more granular way
        // (i.e. on a per-color basis) and only stop animating the gestures for
        // which colors are on screen. in fact we could do one better and only 
        // animate the currently-being-draw gesture (so the last one) of the colors
        // for which there are blobs on screen.
        } else if (!stuffOnScreen) {
          advanceGesture(J);
        }
      }
    }
  }
}

function advanceGesture(gesture) {
    // Move a Gesture one step
    if (gesture.exists) { // check
        var nPts = gesture.nPoints;
        var path = [];
        var jx = gesture.jumpDx;
        var jy = gesture.jumpDy;

        if (nPts > 0) {
            path = gesture.path;
          /*
            for (let i = nPts-1; i > 0; i--) {
                path[i].x = path[i - 1].x;
                path[i].y = path[i - 1].y;
            }
            
            path[0].x = path[nPts - 1].x + jx;
            path[0].y = path[nPts - 1].y + jy;
          */
          
            for (let i = nPts-1; i > 0; i--) {
                path[i].p = path[i - 1].p;
            }
            
            path[0].p = path[nPts - 1].p
            
            gesture.compile();
        }
    }
}

function clearGestures() {
  for (let color of colors) {
    gestures[color] = [];
  }
}