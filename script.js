var capture;
var tracker;

const historySize = 50;

trackerHistory = {
  "white": new CBuffer(historySize),
}

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
  
    var tracker = new tracking.ColorTracker(Object.keys(trackerHistory));

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
  const HIGH_THRESH = 220;
  const LOW_THRESH = 20;
  
  let totals = [0,0,0];
  let pixelCount = 0;
  let overrepresentations = [0,0,0];
  let veryColoredPixels = [0,0,0];
  for (let y=rect.y; y <= rect.y+rect.height; y++) {
    for (let x=rect.x; x<= rect.x+rect.width; x++) {      
      let r = pixels[index2Dto1D(x, y)];
      let g = pixels[index2Dto1D(x, y)+1];
      let b = pixels[index2Dto1D(x, y)+2];
      // skip white pixels
      if (r > WHITE_THRESH && g > WHITE_THRESH && b > 230) { continue };
      if (r > HIGH_THRESH && g < LOW_THRESH && b < LOW_THRESH) {
        veryColoredPixels[0] += 1
      };
      if (b > HIGH_THRESH && r < LOW_THRESH && g < LOW_THRESH) {
        veryColoredPixels[1] += 1
      };
      if (b > HIGH_THRESH && r < LOW_THRESH && g < LOW_THRESH) {
        veryColoredPixels[2] += 1
      };      

      totals[0] += r;
      totals[1] += g;
      totals[2] += b;
      overrepresentations[0] += (r - g) + (r - b);
      overrepresentations[1] += (g - r) + (g - b);
      overrepresentations[2] += (b - r) + (b - g);

      pixelCount += 1;
    }
  }

  let data = {
    "average_nonwhite_rgb": [totals[0]/pixelCount, totals[1]/pixelCount, totals[2]/pixelCount],
    "overreps": overrepresentations[0],
    "very_colored": veryColoredPixels,
  };
  console.log(data["overreps"]);
  return data;
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
  
  let reddestTrackingRect = event.data.reduce(function(reddestSoFar, trackingRect) {
    let currData = analyzeColor(capture.pixels, trackingRect);
    // TODO cache this on the trackingRect after computing it if necessary
    let bestData = analyzeColor(capture.pixels, reddestSoFar);
    if (currData["overreps"][0] > bestData["overreps"][0]) {
      return trackingRect;
    } else {
      return reddestSoFar;
    }
  });
  
  let trackingRect = reddestTrackingRect;
  
  toDraw.push(diagnosticRect(trackingRect));      
    
    
  var c = center(trackingRect);
  var rect = {
    x: canvasWidth - c.x,
    y: c.y,
    width: trackingRect.width,
    height: trackingRect.height,
    color: trackingRect.color,
    time: Date.now(),
  };
  
  // filter out a bunch of things that probably aren't a lightbulb
  //if (rect.width * rect.height < 800) { return };
  //if (rect.width * rect.height > 10000) { return };
  //if (rect.width > rect.height*2) { return };
  //if (rect.height > rect.width*2) { return };
  
  
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
  
  continueGesture(smoothed);
   
    //toDraw.push(new Flower(smoothed));
  
  capture.updatePixels();
};


function newAppearance(rect) {
  newGesture(rect); 
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