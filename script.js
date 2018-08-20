var capture;
var tracker;

const historySize = 50;

trackerHistory = {
  "cyan": new CBuffer(historySize),
  "white": new CBuffer(historySize),
}

function setup() {
    var w = 640,
        h = 480;
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
        }
    }, function() {
        console.log('capture ready.')
    });
    capture.elt.setAttribute('playsinline', '');
    capture.size(w, h);
    cnv = createCanvas(w, h);

    tracking.ColorTracker.registerColor('white', function(r, g, b) {
     return r >= 230 && g >= 230 && b >= 230;
    });
  
    var tracker = new tracking.ColorTracker(Object.keys(trackerHistory));

    capture.elt.id = 'p5video';
    tracking.track('#p5video', tracker, {
        camera: true
    });
  
    tracker.on('track', onTrack);
}

toDraw = [];


function getLatestSmoothed(history) {
  var curr = center(history.get(history.length-1)); // new point
  var prev1 = center(history.get(history.length-2));
  var prev2 = center(history.get(history.length-3)); 
  var predictedPos = prev1 + delta(prev1, prev2); // where rect would be based on prev motion
  
  var smoothedPos = average(curr, predictedPos);
  var newRect = {x: smoothedPos.x, y: smoothedPos.y, height: curr.height, width: curr.width};
  
  return newRect;
}

function onTrack(event) {
  event.data.forEach(function (r) {
    trackerHistory[r.color].push(r);
    toDraw.push(new Flower(r));
  });
}

function draw() {
  var now = Date.now()
  clear();
  nextToDraw = [];
  toDraw.forEach((thing) => {
    thing.draw(now)
    if(thing.keep(now)) {
      nextToDraw.push(thing);
    }
  });
  toDraw = nextToDraw;
}