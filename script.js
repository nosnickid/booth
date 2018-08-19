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

function drawFlower(r) {
  var c = center(r);
  translate(c.x, c.y);
  for (var i = 0; i < 10; i ++) {
    ellipse(0, 30, r.height/3, r.height)
    rotate(PI/5);
  }
  translate(-c.x, -c.y);
}

function onTrack(event) {
  clear();
  event.data.forEach(function (r) {
    //rect(r.x, r.y, r.width, r.height);
    
    drawFlower(r);
  })
}