// these are the sizes that James' laptop chooses when optimized for the 
// Dell monitor we'll be using.
monitorWidth = 1920;
monitorHeight = 1200;

canvasWidth = monitorWidth/2;
canvasHeight = monitorHeight/2;

// we use a video feed this many times smaller than the one we display to
// do the blob detection, and then scale the blobs up, for performance reasons.
// the tracking.js color detection algorithm is the most computationally expensive part of
// this whole program. 
downsampleFactor = 2;

RED = 0;
GREEN = 1;
BLUE = 2

vizModes = ['yellowtail', 'curve', 'curve_mirror'];
vizModeCurrent = 0;

lastTimeStamp = 0;
deltaTime = 0;
timeElapsed = 0;

ANIMATION_SPEED = 25000.0; 

// Object storing various misc visual parameters
vizParams = {mode : vizModes[vizModeCurrent]};