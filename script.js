var capture;
var tracker;

const historySize = 50;

// the slots are R, G, B
trackerHistory = [
  new CBuffer(historySize),
  new CBuffer(historySize),
  new CBuffer(historySize),
]

function setup() {
    capture = createCapture({
        audio: false,
        video: {
            width: canvasWidth,
            height: canvasHeight
        }
    }, function() {
        console.log('capture ready.')
    });
    capture.elt.setAttribute('playsinline', '');
    capture.size(canvasWidth, canvasHeight);
    cnv = createCanvas(canvasWidth, canvasHeight);
  
    tracking.ColorTracker.registerColor('white', function(r, g, b) {
     return r >= 250 && g >= 250 && b >= 250;
    });
  
    var tracker = new tracking.ColorTracker("white");

    capture.elt.id = 'p5video';
    tracking.track('#p5video', tracker, {
        camera: true
    });
  
    tracker.on('track', onTrack);
  
    yellowtailSetup();
}

toDraw = [];


function getLatestSmoothed(history, curr) {
  
  var iterations = 2;
  
  if (history.length < iterations) {
    return curr;
  }
  
  var avg = new Point(0, 0);
  
  for(var i = 0; i < iterations; ++i) 
  {
      var rect = history.get(history.length-1-i);
      avg = avg.add(new Point(rect.x,rect.y)); 
  }
   
  avg = avg.multiply(1.0 / iterations);
  
  var smoothedPos = avg.interpolate(new Point(curr.x, curr.y), .5);
  
  var newRect = {
    x: smoothedPos.x,
    y: smoothedPos.y,
    height: curr.height,
    width: curr.width,
    color: curr.color,
    time: curr.time
  };
  
  return newRect;
}

function analyzeColor(pixels, rect) {
  // sum up to the r, g, b value so we can average them later
  
  const WHITE_THRESH = 250
  const HIGH_THRESH = 200;
  const LOW_THRESH = 50;
  
  let totals = [0,0,0];
  let pixelCount = 0;
  let overrepresentations = [0,0,0];
  let veryColoredPixels = [0,0,0];
  let whitePixels = 0
  for (let y=rect.y; y <= rect.y+rect.height; y++) {
    for (let x=rect.x; x<= rect.x+rect.width; x++) {      
      let r = pixels[index2Dto1D(x, y)+RED];
      let g = pixels[index2Dto1D(x, y)+GREEN];
      let b = pixels[index2Dto1D(x, y)+BLUE];
      
      if (r > WHITE_THRESH && g > WHITE_THRESH && b > 230) { whitePixels++ };
      if (r > HIGH_THRESH && g < LOW_THRESH && b < LOW_THRESH) {
        veryColoredPixels[RED] += 1
      };
      if (g > HIGH_THRESH && r < LOW_THRESH && b < LOW_THRESH) {
        veryColoredPixels[GREEN] += 1
      };
      if (b > HIGH_THRESH && r < LOW_THRESH && g < LOW_THRESH) {
        veryColoredPixels[BLUE] += 1
      };      

      totals[RED] += r;
      totals[GREEN] += g;
      totals[BLUE] += b;
      totalBrightness = totals[RED] + totals[GREEN] + totals[BLUE];
      overrepresentations[RED] += ((r - g) + (r - b)) / totalBrightness;
      overrepresentations[GREEN] += ((g - r) + (g - b)) / totalBrightness;
      overrepresentations[BLUE] += ((b - r) + (b - g)) / totalBrightness;

      pixelCount += 1;
    }
  }

  let data = {
    "average_nonwhite_rgb": [totals[RED]/pixelCount, totals[GREEN]/pixelCount, totals[BLUE]/pixelCount],
    "overreps": overrepresentations,
    "very_colored": veryColoredPixels,
    "prop_white_pixels": whitePixels/totalPixels,
  };
  console.log(rect.x, data["overreps"][GREEN] - data["overreps"][BLUE], data["white_pixels"]);
  return data;
}

function chooseRectForColor(pixels, rects, color) {
  return rects.reduce(function(bestSoFar, trackingRect) {
    let currData = analyzeColor(pixels, trackingRect);
    // TODO cache this on the trackingRect after computing it if necessary
   let bestData = analyzeColor(pixels, bestSoFar);
    if (currData["overreps"][color] > bestData["overreps"][color]) {
      return trackingRect;
    } else {
      return bestSoFar;
    }
  });
}

function chooseBestRects(pixels, rects) {
  let ret = [undefined, undefined, undefined];
  for (let rect of rects) {
    rect.analysisData = analyzeColor(pixels, rect); 
  }
  for(let rect of rects) {
    let bestColor = undefined;
    let bestScore = -Infinity;
    for (let color of [RED, GREEN, BLUE]) {
      if (rect.analysisData["overreps"][color] > bestScore) {
        bestScore = rect.analysisData["overreps"][color];
        bestColor = color;
      }
    }
    ret[bestColor] = rect;
  }
  return ret;
}

function onTrack(event) {
  
  // necessary to use capture.pixels later.
  capture.loadPixels()
  
  if (event.data.length > 0) {
    stuffOnScreen = true;
  } else {
    stuffOnScreen = false; 
    return;
  }
  
  event.data.forEach((tr) => toDraw.push(diagnosticRect(tr)));   
  
  let bestRects = chooseBestRects(capture.pixels, event.data);
  
  for (let color of [RED, GREEN, BLUE]) {
    if (bestRects[color] !== undefined) {
      bestRects[color].color = color;
    }
  }
  
  for (let trackingRect of bestRects) {    
    if (trackingRect === undefined) { continue };

    var c = center(trackingRect);
    var rect = {
      x: canvasWidth - c.x,
      y: c.y,
      width: trackingRect.width,
      height: trackingRect.height,
      color: trackingRect.color,
      time: Date.now(),
    };
      
    var timeGap;
    var length = trackerHistory[rect.color].length;
    if (length === 0) {
      timeGap = Infinity;
    } else {
      timeGap = rect.time - trackerHistory[rect.color].last().time;
    }
    
    if (timeGap > 500) {
      trackerHistory[rect.color].empty();
      newAppearance(rect);
    }
   
    var smoothed = getLatestSmoothed(trackerHistory[rect.color], rect);    
    trackerHistory[rect.color].push(smoothed);
  
    continueGesture(rect.color, smoothed);
  }    

  capture.updatePixels();
}


function newAppearance(rect) {
  newGesture(rect.color, rect); 
}

function drawVideoOnCanvas(capture) {
  // code adapted from https://forum.processing.org/two/discussion/9309/how-to-flip-image
  push();
  translate(canvasWidth, 0);
  scale(-1,1);
  image(capture, 0, 0, canvasWidth, canvasHeight);
  pop();
}

// note that this works with a trackingRect, not a centered rect
function diagnosticRect(trackingRect) {
  return {
    draw: (now) => {
      var { x, y, width, height } = trackingRect; 
      push()
      // I'll admit I'm now sure why this has to be mirrored
      translate(canvasWidth, 0)
      scale(-1,1);
      fill(0,0,0,0);
      stroke(255, 204, 0);
      strokeWeight(2);
      rect(x,y, width, height);
      pop()
    },
    keep: (now) => false,
  }
};

function draw() {
  var now = Date.now()
  clear();
  drawVideoOnCanvas(capture);
  yellowtailDraw();
  nextToDraw = [];
  toDraw.forEach((thing) => {
    thing.draw(now)
    if(thing.keep(now)) {
      nextToDraw.push(thing);
    }
  });
  toDraw = nextToDraw;
}