var capture;
var tracker;

const historySize = 5000;

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
  
  var newRect = {x: smoothedPos.x, y: smoothedPos.y,
                 height: 100, width: 100, color: curr.color};
  
  return newRect;
}

function onTrack(event) {
  if (event.data.length > 0) {
    stuffOnScreen = true;
  } else {
    stuffOnScreen = false; 
  }
  
  event.data.forEach(function (trackingRect) {
    drawDiagnosticRect(trackingRect);
    var c = center(trackingRect);
    var rect = {
      x: canvasWidth - c.x,
      y: c.y,
      width: trackingRect.width,
      height: trackingRect.height,
      color: trackingRect.color,
      time: Date.now(),
    };
  
    if (rect.width * rect.height < 1000) { return };
    if (rect.width > rect.height*2) { return };
    if (rect.height > rect.width*2) { return };

    
    
    var timeGap;
    var length = trackerHistory[rect.color].length;
    if (length === 0) {
      timeGap = Infinity;
    } else {
      timeGap = rect.time - trackerHistory[rect.color].last().time;
    }
    
    if (timeGap > 3000) {
      newAppearance(rect);
    }
    
    var smoothed = getLatestSmoothed(trackerHistory[rect.color], rect);    
    trackerHistory[rect.color].push(smoothed);
    
    continueGesture(smoothed);
    
    //toDraw.push(new Flower(smoothed));
  });
}

function newAppearance(rect) {
  newGesture(rect); 
}

function drawVideoOnCanvas(capture) {
  // code adapted from https://forum.processing.org/two/discussion/9309/how-to-flip-image
  push();
  translate(capture.width,0);
  scale(-1,1);
  image(capture, 0, 0, canvasWidth, canvasHeight);
  pop();
}

// note that this works with a trackingRect, not a centered rect
function drawDiagnosticRect(trackingRect) {
  var { x, y, width, height } = trackingRect; 
  push()
  fill(0,0,0,255);
  stroke(255, 204, 0);
  strokeWeight(2);
  rect(x.y, width, height);
  pop()
}

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