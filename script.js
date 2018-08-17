/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hiiii');
/*
    window.onload = function() {
      var video = document.getElementById('video');
      canvas = document.getElementById('canvas');
      context = canvas.getContext('2d');
      
      tracking.ColorTracker.registerColor('custom', function(r, g, b) {
        return r >= 240 && g >= 240 && b >= 240;
      });
      
      var tracker = new tracking.ColorTracker(["cyan", "magenta", "custom"]);
      tracking.track('#video', tracker, { camera: true });
      testing = false;
      tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        event.data.forEach(function(rect) {
          context.strokeStyle = "#00ff00";
          context.strokeRect(rect.x, rect.y, rect.width, rect.height);
          context.font = '11px Helvetica';
          context.fillStyle = "#00ff00";
          context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
          context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
        });
      });
    };
*/

var capture;
var tracker;

var rhi, ghi, bhi;
var rlo, glo, blo;

function setTarget(r, g, b, range) {
    range = range || 32;
    rhi = r + range, rlo = r - range;
    ghi = g + range, glo = g - range;
    bhi = b + range, blo = b - range;
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
    capture.parent('container');
    cnv = createCanvas(w, h);
    //cnv.parent('container');
    // capture.hide(); // tracking.js can't track the video when it's hidden

    setTarget(255, 255, 255); // by default track white
    tracking.ColorTracker.registerColor('match', function (r, g, b) {
        if (r <= rhi && r >= rlo &&
            g <= ghi && g >= glo &&
            b <= bhi && b >= blo) {
            return true;
        }
        return false;
    });
    tracker = new tracking.ColorTracker(['match']);
    tracker.minDimension = 20; // make this smaller to track smaller objects
    capture.elt.id = 'p5video';
    tracking.track('#p5video', tracker, {
        camera: true
    });
    tracker.on('track', function (event) {
        clear();
        strokeWeight(4);
        stroke(255, 0, 0);
        noFill();
        event.data.forEach(function (r) {
            rect(r.x, r.y, r.width, r.height);
        })
    });
}

function draw() {
    if (mouseIsPressed &&
        mouseX > 0 && mouseX < width &&
        mouseY > 0 && mouseY < height) {
        capture.loadPixels();
        target = capture.get(mouseX, mouseY);
        setTarget(target[0], target[1], target[2]);
    }
}