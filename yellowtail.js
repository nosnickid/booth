
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
  
  // Update animation time variable
  if (timeElapsed >= 1.0) {
    timeElapsed = 0;
  }

  var now = Date.now() / 1000.0;
  deltaTime = now - lastTimeStamp;
  lastTimeStamp = now;
  timeElapsed += (deltaTime / ANIMATION_SPEED);
  
  if (timeElapsed > 1.0) {
    timeElapsed = 1.0;
  }
  
  updateGeometry();
    
    for (let color of colors) {
      for (let gesture of gestures[color]) {
        var mode = vizModeCurrent;
        switch (mode) {
          case 0:
            yellowtailModeColor(color);
            break;
          default:
            splineModeColor(color, 1);
            break;
        }
        renderGesture(gesture, canvasWidth, canvasHeight, color);
      }
    }
  }

const rcGreen = [61,192,108];
const rcBlue = [77,155,216];
const rcDarkPink = [189,81,121];
const rcLightPink = [251,112,167];
const rcLightBlue = [102,189,255];
const rcLightGreen = [105,220,146];

function yellowtailModeColor(color) {
  if (color === RED) {
    fill(...rcLightPink);
    stroke(...rcLightPink);
  } else if (color === GREEN) {
    fill(...rcLightGreen);
    stroke(...rcLightGreen);
  } else if (color === BLUE) {
    fill(...rcLightBlue);
    stroke(...rcLightBlue);
  }
}

function splineModeColor(color, alpha) {
  noFill();
    if (color === RED) {
    stroke(...rcLightPink, alpha * 255);
  } else if (color === GREEN) {
    stroke(...rcLightGreen, alpha * 255);
  } else if (color === BLUE) {
    stroke(...rcLightBlue, alpha * 255);
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
    // this situation occurs if we call clearVisuals while someone is drawing,
    // in which case we try to add points to a gesture that no longer exists
    // to fix this, we implicitly create a new gesture
    // 
    // i think this might be a bad idea? whatever yolo
    console.warn("attempt to continue nonexistent gesture with rect, implcitly creating new gesture.", rect);
    newGesture(rect.color, rect);
  } else {
      var G = gestures[rect.color][gestures[rect.color].length-1]
      if (G.distToLast(rect.x, rect.y) > minMove) {
          G.addPoint(rect.x, rect.y);
          G.smooth();
          G.compile();
      }
  }
}

function renderGesture(gesture, w, h, color) {
  if (gesture.exists) { 
    var mode = vizModeCurrent;
    switch (mode) {
      case 0:
        renderGestureYellowtail(gesture, w, h, color, false);
        break;
      case 1:
        renderGestureCurve(gesture, w, h, color, false);
        break;
      default:
        renderGestureCurve(gesture, w, h, color, true);
        break;
    }
  }
}

function GetBias(time,bias)
{
  return (time / ((((1.0/bias) - 2.0)*(1.0 - time))+1.0));
}

function renderGestureCurve(gesture, w, h, color, mirror) {
      ANIMATION_SPEED = 2500000000000.0;

  var points = gesture.path;
     
    var numCurves = 20.0;
    var organicConstant = 0;
    curveTightness(organicConstant);

  var drawCurve = function() {
    for (let n = 0; n < numCurves; ++n) {
      var scale = 1 - (n / numCurves);
      splineModeColor(color, GetBias(scale, 0.6));

      beginShape();

      for (let i = 0; i < gesture.nPoints; i += 4) {
        var p = points[i];

        var crossSectionVector = perpendicular(subtract(points[(i+1) % gesture.nPoints], p));
        var f = p.p * 10;
        var noiseTemp1 = noise((scale + p.x) * f, (p.y + scale) * f);
        var noiseTemp2 = noise((scale + p.x) * f, (n + p.y) * f);
        var noise1 = (2 * GetBias(noiseTemp1, 0.1) - 1) * scale * 20;
        var noise2 = (2 * GetBias(noiseTemp2, 0.1) - 1) * scale * 20;

        var offset = normalize(crossSectionVector, noise1 * 2);

        curveVertex(p.x + offset.x + noise2, p.y + offset.y + noise1);
      }
      endShape();
    }
  }
  
  drawCurve();

  if (mirror) {
    console.log("in mirrormode");
    translate(width, 0);
    scale(-1, 1);
    drawCurve();
    scale(1, 1);
    translate(-width, 0);
  }
}

function renderGestureSpline(gesture, w, h, color, mirror) {
    ANIMATION_SPEED = 50.0;
    var points = gesture.path;
    
  // vizParams
    var stepSize = 3;
    var splineNum = 10.0
    var splineSpace = 5;
    var splineInitialBend = 2;
  
    var drawSegment = function(v0, v1, v2, v3, parity) {
      var vector = subtract(v3, v0);
      var crossSectionVector = perpendicular(vector);
      
      // Draw the multiple offset splines for the current segment
      for (let j = 0; j < splineNum; ++j) {
        
        splineModeColor(color, j / splineNum);
        
        var offsetStart = j + splineInitialBend;
        if (parity % 2 == 0) {
          offsetStart *= -1;
        }
        
        var offset1 = normalize(crossSectionVector, v1.p * offsetStart * splineSpace);
        var offset2 = normalize(crossSectionVector, v2.p * offsetStart * splineSpace);
        
        bezier(v0.x, v0.y, 
               v1.x + offset1.x, v1.y + offset1.y, 
               v2.x + offset2.x, v2.y + offset2.y, 
               v3.x, v3.y);
      }
    };
    
    var i = 0;
    var parityCounter = 0;
    while (i < gesture.nPoints - (3 * stepSize)) {
      var p0 = points[i];
      var p1 = points[i + 1 * stepSize];
      var p2 = points[i + 2 * stepSize];
      var p3 = points[i + 3 * stepSize];
      
      drawSegment(p0, p1, p2, p3, parityCounter);
      
      i += 3 * stepSize;
      parityCounter++;
  }
  
  // Do the extra bit (points < one full segment length
  var remainderLength = gesture.nPoints - i;
  var lastSegmentStepSize = 1;
  if (remainderLength > 3) {
    while ((lastSegmentStepSize * 3) < remainderLength) {
      lastSegmentStepSize++;
    }
    lastSegmentStepSize--;

    var p0 = points[i];
    var p1 = points[i + 1 * lastSegmentStepSize];
    var p2 = points[i + 2 * lastSegmentStepSize];
    var p3 = points[i + 3 * lastSegmentStepSize];
    
    drawSegment(p0, p1, p2, p3, parityCounter);
  }
}

function renderGestureYellowtail(gesture, w, h, color) {
      ANIMATION_SPEED = 50.0;
      if (gesture.nPolys > 0) {
        var draw = function () {
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
            
        draw();
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
                path[i].p = lerp(path[i].p, path[i - 1].p, timeElapsed);
                
                if (timeElapsed > 0.999) {
                  path[i].p = path[i - 1].p;
                }
            }
            
            path[0].p = lerp(path[0].p, path[nPts - 1].p, timeElapsed);
                
            if (timeElapsed > 0.999) {
              path[0].p = path[nPts - 1].p
            }
          
            gesture.compile();
        }
    }
}

function clearGestures() {
  for (let color of colors) {
    gestures[color] = [];
  }
}