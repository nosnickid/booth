var capture;
var tracker;


trackerHistory = {
  "cyan": [],
  "white": [],
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
    //tracking.Image.blur(pixels, width, height, 30);
  
    var tracker = new tracking.ColorTracker(Object.keys(trackerHistory));

    capture.elt.id = 'p5video';
    tracking.track('#p5video', tracker, {
        camera: true
    });
  
    tracker.on('track', onTrack);
}

toDraw = [];


function onTrack(event) {
  event.data.forEach(function (r) {
    trackerHistory[r.color].push
    toDraw.push(new Flower(r));
  });
}

function draw() {
  now = Date.now()
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