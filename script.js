var capture;
var tracker;

const historySize = 50;

trackerHistory = {
  //"red": new CBuffer(historySize),
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
    tracking.ColorTracker.registerColor('red', function(r, g, b) {
       return colorDistance({r: r, g: g, b: b}, {r: 240, g: 185, b: 200}) < 50;
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
  
  var iterations = 10;
  
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

function decideColor(pixels, rect) {
  for (var i=rect.y; i <= rect.y+rect.height; i++) {
    for (var j=rect.x; j<= rect.x+rect.width; j++) {
      pixels[index2Dto1D(j,i)] = 0;
    }
  }
}

function onTrack(event) {
  
  // necessary to use capture.pixels later.
  capture.loadPixels()
  
  if (event.data.length > 0) {
    stuffOnScreen = true;
  } else {
    stuffOnScreen = false; 
  }
  
  event.data.forEach(function (trackingRect) {
    toDraw.push(diagnosticRect(trackingRect));
        
    //decideColor(capture.pixels, trackingRect);
    
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
    if (rect.width * rect.height < 800) { return };
    if (rect.width * rect.height > 10000) { return };
    if (rect.width > rect.height*2) { return };
    if (rect.height > rect.width*2) { return };
    
    
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
  });
  capture.updatePixels();
}

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