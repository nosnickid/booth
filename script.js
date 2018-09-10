var capture;
var tracker;

const historySize = 5000;

trackerHistory = {
  // "red": new CBuffer(historySize),
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
    // tracking.ColorTracker.registerColor('red', function(r, g, b) {
    //  return r >= 240 && g <= 240 && b <= 230;
    // });
  
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
  if (history.length < 11) {
    return curr;
  }
  
  var avg = ;
  for(var i = 0; i < 10; ++i)
      avg = avg.add(history.get(history.length-i));
  
  
  var smoothedPos = average(curr, avg);
  
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
    var c = center(trackingRect);
    var rect = {
      x: canvasWidth - c.x,
      y: c.y,
      width: trackingRect.width,
      height: trackingRect.height,
      color: trackingRect.color,
      time: Date.now(),
    };
    
//     var timeGap;
//     var length = trackerHistory[rect.color].length;
//     if (length === 0) {
//       timeGap = Infinity;
//     } else {
//       timeGap = rect.time - trackerHistory[rect.color].last().time;
//     }
    
//     if (timeGap > 3000) {
//       newAppearance(rect);
//     }
    
    var smoothed = getLatestSmoothed(trackerHistory[rect.color], rect);    
    trackerHistory[rect.color].push(smoothed);
    
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
  //scale(-1.0,1.0);    // flip x-axis backwards
  //yellowtailDraw();
  nextToDraw = [];
  toDraw.forEach((thing) => {
    thing.draw(now)
    if(thing.keep(now)) {
      nextToDraw.push(thing);
    }
  });
  toDraw = nextToDraw;
}