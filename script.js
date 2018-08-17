/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hiiii');

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