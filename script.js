var capture;
var tracker;

const historySize = 500;

// mapping from arbitrary object ids to history CBuffers
trackerHistory = {}
currHistoryId = 0

// we need to keep track of the last time we saw each color
// so we know when to start a new Gesture
lastTimeSeen = [-Infinity, -Infinity, -Infinity] // this is R, G, B

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
  
    var tracker = new tracking.ColorTracker("white");

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
  
  var newRect = {
    x: smoothedPos.x,
    y: smoothedPos.y,
    height: curr.height,
    width: curr.width,
    color: curr.color,
    time: curr.time
  };
  
  return newRect;
}

function analyze(pixels, rect) {
  // sum up to the r, g, b value so we can average them later
  
  const WHITE_THRESH = 250
  const HIGH_THRESH = 200;
  const LOW_THRESH = 50;
  
  let totals = [0,0,0];
  let pixelCount = 0;
  let overrepresentations = [0,0,0];
  let veryColoredPixels = [0,0,0];
  let whiteCount = 0;
  for (let y=rect.y; y <= rect.y+rect.height; y++) {
    for (let x=rect.x; x<= rect.x+rect.width; x++) {      
      let r = pixels[index2Dto1D(x, y)+RED];
      let g = pixels[index2Dto1D(x, y)+GREEN];
      let b = pixels[index2Dto1D(x, y)+BLUE];
      // skip white pixels
      if (r > WHITE_THRESH && g > WHITE_THRESH && b > 230) { whiteCount++ };
      if (r > HIGH_THRESH && g < LOW_THRESH && b < LOW_THRESH) {
        veryColoredPixels[RED] += 1
      };
      if (g > HIGH_THRESH && r < LOW_THRESH && b < LOW_THRESH) {
        veryColoredPixels[GREEN] += 1
      };
      if (b > HIGH_THRESH && r < LOW_THRESH && g < LOW_THRESH) {
        veryColoredPixels[BLUE] += 1
      };      

      totals[RED] += r;
      totals[GREEN] += g;
      totals[BLUE] += b;
      overrepresentations[RED] += (r - g) + (r - b);
      overrepresentations[GREEN] += (g - r) + (g - b);
      overrepresentations[BLUE] += (b - r) + (b - g);

      pixelCount += 1;
    }
  }
  
  let bottom = Math.min(...overrepresentations);
  let nonNegOverreps = overrepresentations.map((i) => i + Math.abs(bottom));
  let scores = [ 
    nonNegOverreps[RED] / ((nonNegOverreps[BLUE] + nonNegOverreps[GREEN])/2),
    nonNegOverreps[GREEN] / ((nonNegOverreps[RED] + nonNegOverreps[BLUE])/2),
    nonNegOverreps[BLUE] / ((nonNegOverreps[RED] + nonNegOverreps[GREEN])/2),
  ];

  let data = {
    "average_nonwhite_rgb": [totals[RED]/pixelCount, totals[GREEN]/pixelCount, totals[BLUE]/pixelCount],
    "overreps": overrepresentations,
    "very_colored": veryColoredPixels,
    "prop_white": whiteCount / pixelCount,
    "scores": scores,
    "green_to_blue_score_ratio": scores[GREEN] / scores[BLUE],
    "skew": Math.abs(rect.width-rect.height),
  };
  return data;
}

function maxOverrep(color, history) {
  let max = -Infinity;
  for (let i = 0; i < history.length; i++) {
    let rect = history.get(i);
    if (rect.analysisData["overreps"][color] > max) {
      max = rect.analysisData["overreps"][color];
    }
  }
  return max;
}


function findRedLightbulb(histories) {
  let best = null;
  let lowestAvgSkew = Infinity;
  for (let history of Object.values(histories)) {
    totalRedScore = 0;
    totalPropWhite = 0;
    totalSkew = 0;
    for(let i = 0; i < history.length; i++) {
      totalRedScore += history.get(i).analysisData["scores"][RED];
      totalPropWhite += history.get(i).analysisData["prop_white"];
      totalSkew += history.get(i).analysisData["skew"];
    }
    avgRedScore = totalRedScore / history.length;
    avgPropWhite = totalPropWhite / history.length;
    avgSkew = totalSkew / history.length;
    if (avgRedScore > 4 && avgPropWhite > 0.6) {
      if (avgSkew < lowestAvgSkew) {
        lowestAvgSkew = avgSkew;
        best = history;
      }
    }
  }
  if (best !== null) {
    console.log(best.id);
  }
  return best;
}

function mapRectsToHistory(now, histories, trackingRects) {
  if (trackingRects.length >= Object.keys(histories).length) {
    // there's either a rect for each history, or some extra rects
    // there's definitely a rect for each history, so loop 
    // over the histories and find them
    let matched = [];
    for (let history of Object.values(histories)) {
      let closest = Infinity;
      let match = null;
      for (let rect of trackingRects) {
        if (matched.indexOf(rect) > -1) { continue };
        let dist = distance(rect, history.last());
        if (dist < closest) {
          closest = dist;
          match = rect;
        }
      }
      
      if (match !== null) {
        // match could be null if we ran out of rects to match to
        history.push(match);
        match.historyId = history.id;
        matched.push(match);
      }
    }
    // now if any rects are left, they're new. we create a history for each 
    // and push the rect onto it
    for (let rect of trackingRects) {
      if (matched.indexOf(rect) > -1) { continue };
      histories[currHistoryId] = CBuffer(50);
      histories[currHistoryId].push(rect);
      histories[currHistoryId].id = currHistoryId;
      rect.historyId = currHistoryId
      currHistoryId++;
    }
  } else if (Object.keys(histories).length > trackingRects.length) {
    // in this case, a rect has disappeared. we need to loop over all
    // the rects, match each up with a history, and then remove any leftover
    // histories who's last appearance was more than some time T ago (this effectively
    // gives rects a grace period to disappear and then reappear for a while)
    let matched = [];
    for (let rect of trackingRects) {
      let closest = Infinity;
      let match = null;
      for (let history of Object.values(histories)) {
         if (matched.indexOf(history) > -1) { continue };
         let dist = distance(rect, history.last());
         if (dist < closest) {
          closest = dist;
          match = history;
        }
      }
      
      if (match !== null) {
        // match could be null if we've matched all the rects
        // and have moved on to histories whose rects are gone
        match.push(rect);
        rect.historyId = match.id;
        matched.push(match);
      }
    }
    
    // now, take any unmatched histories and delete them
    // if they're too old
    
    for (let history of Object.values(histories)) {
      if (matched.indexOf(history) > -1) { continue };
      let timeGap = now - history.last().time;
      if (timeGap > 100) {
        delete histories[history.id];
      }
    }
  }
}

function onTrack(event) {
  // necessary to use capture.pixels later.
  capture.loadPixels()

  let now = Date.now()
  event.data.forEach((tr) => { tr.time = now });   
    
  // map rects to history needs to happen before the stuffOnScreen check
  // since it triggers the removal of stale histories
  mapRectsToHistory(now, trackerHistory, event.data);
  
  event.data.forEach((tr) => tr.analysisData = analyze(capture.pixels, tr));
  
  if (event.data.length > 0) {
    stuffOnScreen = true;
  } else {
    stuffOnScreen = false; 
    return;
  }
  
  event.data.forEach((tr) => toDraw.push(diagnosticRect(tr)));   
    
  findRedLightbulb(trackerHistory);
  
  let coloredRects = [];
    
  for (let trackingRect of coloredRects) {    

    var c = center(trackingRect);
    var rect = {
      x: canvasWidth - c.x,
      y: c.y,
      width: trackingRect.width,
      height: trackingRect.height,
      color: trackingRect.color,
      time: trackingRect.time,
    };
    /*
    if (rect.time - lastTimeSeen[rect.color] > 500) {
      newAppearance(rect);
    } else {
      continueGesture(rect);
    }*/
    lastTimeSeen[rect.color] = now;
  }    
  capture.updatePixels();
}


function newAppearance(rect) {
  newGesture(rect.color, rect); 
}

function drawVideoOnCanvas(capture) {
  // code adapted from https://forum.processing.org/two/discussion/9309/how-to-flip-image
  push();
  translate(canvasWidth, 0);
  scale(-1,1);
  image(capture, 0, 0, canvasWidth, canvasHeight);
  pop();
}

// note that this works with a trackingRect, not a centered rect
function diagnosticRect(trackingRect) {
  return {
    draw: (now) => {
      var { x, y, width, height } = trackingRect; 
      push()
      
      // I'll admit I'm not sure why this has to be mirrored
      translate(canvasWidth, 0)
      scale(-1,1);
      
      fill(255,204,0);
      textSize(32);
      text(String(trackingRect.historyId), x, y);
      
      fill(0,0,0,0);
      stroke(255, 204, 0);
      strokeWeight(2);
      rect(x,y, width, height);
      pop()
    },
    keep: (now) => false,
  }
};

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