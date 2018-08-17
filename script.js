/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hiiii');

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
    // capture.hide(); // tracking.js can't track the video when it's hidden

    tracking.ColorTracker.registerColor('custom', function(r, g, b) {
     return r >= 240 && g >= 240 && b >= 240;
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
history = [];


counter = 0;
trail_length = 10;
for (i=0; i < trail_length; i++) {
  history[i] = starter;
}

function center(r) {
  return {
    x: r.x + r.width/2,
    y: r.y + r.height/2,
  }
}

function drawFlower(r) {
  r = center(r);
    translate(r.x, r.y);
    for (var i = 0; i < 10; i ++) {
      ellipse(0, 30, 20, 80);
      rotate(PI/5);
    }
    translate(-r.x, -r.y);
}

function onTrack(event) {
  clear();
  strokeWeight(4);
  stroke(255, 0, 0);
  noFill();
  event.data.forEach(function (r) {
    //rect(r.x, r.y, r.width, r.height);
    
    // A design for a simple flower

    //var c = center(r);
    drawFlower(r);
    
    history[counter] = r;
    counter = counter+1 % 5;
  })
}