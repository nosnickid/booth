/**
 * Yellowtail
 * by Golan Levin (www.flong.com). 
 * Translated to p5.js by Nick Fox-Gieg
 *
 * Click, drag, and release to create a kinetic gesture.
 * 
 * Yellowtail (1998-2000) is an interactive software system for the gestural 
 * creation and performance of real-time abstract animation. Yellowtail repeats 
 * a user's strokes end-over-end, enabling simultaneous specification of a 
 * line's shape and quality of movement. Each line repeats according to its 
 * own period, producing an ever-changing and responsive display of lively, 
 * worm-like textures.
 */

"use strict";

var gestureArray;
var nGestures;  // Number of gestures
var minMove;     // Minimum travel for a new point
var currentGestureID;

var tempP; // Polygon
var tmpXp;
var tmpYp;

function setup() {
	gestureArray = [];
	nGestures = 36;  // Number of gestures
	minMove = 3;     // Minimum travel for a new point
	currentGestureID;

	tempP; // Polygon
	tmpXp = [];
	tmpYp = [];

	createCanvas(800, 600);
	background(0, 0, 0);
	//noStroke();
    stroke(255);

	currentGestureID = -1;
	gestureArray = new Array(nGestures);
	
	for (let i = 0; i < nGestures; i++) {
	  gestureArray[i] = new Gesture(width, height);
	}
	
	clearGestures();
}


function draw() {
    background(0);

    updateGeometry();

    fill(255, 255, 245);
    for (let i = 0; i < nGestures; i++) {
        renderGesture(gestureArray[i], width, height);
    }
}

function mousePressed() {
    currentGestureID = (currentGestureID + 1) % nGestures;
    var G = gestureArray[currentGestureID];
    G.clear();
    G.clearPolys();
    G.addPoint(mouseX, mouseY);
}

function mouseDragged() {
    if (currentGestureID >= 0) {
        var G = gestureArray[currentGestureID];
        if (G.distToLast(mouseX, mouseY) > minMove) {
            G.addPoint(mouseX, mouseY);
            G.smooth();
            G.compile();
        }
    }
}

function keyPressed() {
    if (key == '+' || key == '=') {
        if (currentGestureID >= 0) {
            var th = gestureArray[currentGestureID].thickness; // float
            gestureArray[currentGestureID].thickness = min(96, th+1);
            gestureArray[currentGestureID].compile();
        }
    } else if (key == '-') {
        if (currentGestureID >= 0) {
            var th = gestureArray[currentGestureID].thickness; // float
            gestureArray[currentGestureID].thickness = max(2, th-1);
            gestureArray[currentGestureID].compile();
        }
    } else if (key == ' ') {
        clearGestures();
    }
}


function renderGesture(gesture, w, h) {
    if (gesture.exists) {
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
            } else if (!mouseIsPressed) {
                advanceGesture(J);
            }
        }
    }
}

function advanceGesture(gesture) {
    // Move a Gesture one step
    if (gesture.exists) { // check
        var nPts = gesture.nPoints;
        var nPts1 = nPts-1;
        var path = [];
        var jx = gesture.jumpDx;
        var jy = gesture.jumpDy;

        if (nPts > 0) {
            path = gesture.path;
            
            for (let i = nPts1; i > 0; i--) {
                path[i].x = path[i - 1].x;
                path[i].y = path[i - 1].y;
            }
            
            path[0].x = path[nPts1].x - jx;
            path[0].y = path[nPts1].y - jy;
            gesture.compile();
        }
    }
}

function clearGestures() {
    for (let i = 0; i < nGestures; i++) {
        gestureArray[i].clear();
    }
}
