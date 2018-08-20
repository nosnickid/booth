var capture;
var tracker;

const historySize = 50;

trackerHistory = {
  "cyan": new CBuffer(historySize),
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
     return r >= 230 && g >= 230 && b >= 230;
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


function getLatestSmoothed(history) {
  if (history.length < 3) {
    return history.first() 
  }

  
  var curr = history.get(history.length-1); // new point
  var prev1 = history.get(history.length-2);
  var prev2 = history.get(history.length-3); 
  var predictedPos = add(prev1, delta(prev1, prev2)); // where rect would be based on prev motion
  
  var smoothedPos = average(curr, predictedPos);
  
  var newRect = {x: smoothedPos.x, y: smoothedPos.y,
                 height: curr.height, width: curr.width, color: curr.color};
  
  return newRect;
}

function onTrack(event) {
  event.data.forEach(function (trackingRect) {
    var c = center(trackingRect);
    var rect = {
      x: c.x,
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
    
    if (timeGap > 2000) {
      newAppearance(rect);
    }
    
    trackerHistory[rect.color].push(rect);
    var smoothed = getLatestSmoothed(trackerHistory[rect.color]);
    
    continueGesture(smoothed);
    toDraw.push(new Flower(smoothed));
  });
}

function newAppearance(rect) {
  newGesture(rect); 
}

function draw() {
  var now = Date.now()
  clear();
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