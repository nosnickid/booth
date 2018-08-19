var capture;
var tracker;


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

    tracking.ColorTracker.registerColor('custom', function(r, g, b) {
     return r >= 230 && g >= 230 && b >= 230;
    });
    //tracking.Image.blur(pixels, width, height, 30);
  
    var tracker = new tracking.ColorTracker(["cyan", "magenta", "custom"]);

    capture.elt.id = 'p5video';
    tracking.track('#p5video', tracker, {
        camera: true
    });
  
    tracker.on('track', onTrack);
}

starter = {x: 100, y: 100};
buff = [10];


counter = 0;
trail_length = 10;
for (i=0; i < trail_length; i++) {
  buff.push(starter);
}
console.log(buff);

toDraw = [];

function onTrack(event) {
  event.data.forEach(function (r) {
    toDraw.push(new Flower(r));
  })
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