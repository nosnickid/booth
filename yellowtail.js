
var gestures;
var nGestures;  // Number of gestures
var minMove;     // Minimum travel for a new point

var tempP; // Polygon
var tmpXp;
var tmpYp;

function yellowtailSetup(colors) {
  stroke(255,0,0);
	gestureArray = [];
	nGestures = 5;  // Number of gestures
	minMove = 3;     // Minimum travel for a new point

	tempP; // Polygon
	tmpXp = [];
	tmpYp = [];

  gestures = {}
  for (let color of colors) {
    
  }
	
	for (let i = 0; i < nGestures; i++) {
	  gestureArray[i] = new Gesture(canvasWidth, canvasHeight);
	}
	
	clearGestures();
}

function clearGestures() {
    for (let i = 0; i < nGestures; i++) {
        gestureArray[i].clear();
    }
}


function yellowtailDraw() {

    updateGeometry();

    fill(255,0,0);
    for (let i = 0; i < nGestures; i++) {
        renderGesture(gestureArray[i], canvasWidth, canvasHeight);
    }
}

function newGesture(point) {
    console.log("new gesture", point)
    currentGestureID = (currentGestureID + 1) % nGestures;
    var G = gestureArray[currentGestureID];
    G.clear();
    G.clearPolys();
    G.addPoint(point.x, point.y);
}

function continueGesture(point) {
    if (currentGestureID >= 0) {
        var G = gestureArray[currentGestureID];
        if (G.distToLast(point.x, point.y) > minMove) {
            G.addPoint(point.x, point.y);
            G.smooth();
            G.compile();
        }
    }
}


function renderGesture(gesture, w, h) {
    
    if (gesture.exists) {
      
      // debug shit
    //console.log(gesture);
      //
      
      
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
}

function updateGeometry() {
    var J;
    for (let g = 0; g < nGestures; g++) {
        if ((J = gestureArray[g]).exists) {
            if (g != currentGestureID) {
                advanceGesture(J);
            } else if (!stuffOnScreen) {
                advanceGesture(J);
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
    for (let i = 0; i < nGestures; i++) {
        gestureArray[i].clear();
    }
}