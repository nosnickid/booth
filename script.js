var displayCapture;
var trackingCapture;
var tracker;

// mapping from arbitrary object ids to history CBuffers
trackerHistory = {}
currHistoryId = 0

// we need to keep track of the last time we saw each color
// so we know when to start a new Gesture
lastTimeSeen = [-Infinity, -Infinity, -Infinity] // this is R, G, B

calibrating = {
  "color": null,
  "rectNumber": null
};

// R, G, B
if (localStorage.calibrationData === undefined) {
  calibrationData = [[], [], []]
} else {
  calibrationData = JSON.parse(localStorage.calibrationData);
}

ui = new UI()

function clearVisuals() {
  yellowtailSetup(); 
}

document.onkeydown = processKeyInput;

function processKeyInput(e) {
  let canvas = document.querySelector(".p5Canvas");
  switch (e.keyCode) {
    case 37: // left
      vizModeCurrent = (vizModeCurrent - 1) % vizModes.length;
      clearVisuals();
      break;
    case 40: // down
      vizModeCurrent = (vizModeCurrent - 1) % vizModes.length;
      clearVisuals();
      break;      
    case 39: // Right
      vizModeCurrent = (vizModeCurrent + 1) % vizModes.length;
      clearVisuals();
      break;
    case 38: // Up
      vizModeCurrent = (vizModeCurrent + 1) % vizModes.length;
      clearVisuals();
      break;      
    case 32: // Space
      clearVisuals();
      break;
    case 13: // Enter
      ui.handleEnter(e);
      break;
    }
}


function setup() {
    // TODO, the way this works now, there's
    // now guarentee they pick up the same
    // webcam. this is solvable by just
    // closing the lid of the laptop if you have an
    // external webcam, but it would be good to figure
    // out a more robust solution.
    displayCapture = createCapture({
        audio: false,
        video: {
            width: canvasWidth,
            height: canvasHeight
        }
    });
    displayCapture.elt.setAttribute('playsinline', '');
    displayCapture.size(canvasWidth, canvasHeight);
    displayCapture.elt.id = 'displayVideo';  

    trackingCapture = createCapture({
      audio: false,
      video: {
          width: canvasWidth/downsampleFactor,
          height: canvasHeight/downsampleFactor,
      }
    });
    trackingCapture.elt.setAttribute('playsinline', '');
    trackingCapture.size(canvasWidth/downsampleFactor, canvasHeight/downsampleFactor);
    trackingCapture.elt.id = 'trackingVideo';
  
    cnv = createCanvas(canvasWidth, canvasHeight);
  
    cnv.elt.style.width = String(monitorWidth)+"px";
    cnv.elt.style.height = String(monitorHeight)+"px";

    tracking.ColorTracker.registerColor('white', function(r, g, b) {
     return r >= 250 && g >= 250 && b >= 250;
    });
  
    var tracker = new tracking.ColorTracker("white");
    tracker.setMinDimension(20/downsampleFactor);
  
    tracking.track('#trackingVideo', tracker, {
        camera: true
    });
  
    tracker.on('track', onTrack);
  
    yellowtailSetup();
      
    ui.drawInitial();
}

toDraw = [];


function smoothRect(history, curr) {
  
  var iterations = 3;
  
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

  curr.x = smoothedPos.x;
  curr.y = smoothedPos.y;
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
    "skew": Math.max(rect.width,rect.height)/Math.min(rect.width,rect.height),
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


function findBlueLightbulb(histories) {
  let best = null;
  let lowestAvgSkew = Infinity;
  for (let history of Object.values(histories)) {
    if (history.length < 5) { continue };
    let totalBlueScore = 0;
    let totalGreenScore = 0
    let totalPropWhite = 0;
    let totalSkew = 0;
    let totalBGRatio = 0;
    let nBulbsInHistory = 0;
    for(let i = 0; i < history.length; i++) {
      let rect = history.get(i);
      totalBlueScore += rect.analysisData["scores"][BLUE];
      totalGreenScore += rect.analysisData["scores"][GREEN];
      totalPropWhite += rect.analysisData["prop_white"];
      totalBGRatio += rect.analysisData["green_to_blue_score_ratio"];
      totalSkew += rect.analysisData["skew"];
      if (rect.color === BLUE) {
        nBulbsInHistory++; 
      }
    }
    let avgBlueScore = totalBlueScore / history.length;
    let avgGreenScore = totalGreenScore / history.length;
    let avgPropWhite = totalPropWhite / history.length;
    let avgSkew = totalSkew / history.length;
    let avgBGRatio = totalBGRatio / history.length;
    let pastProportion = nBulbsInHistory / history.length;

    if (pastProportion > 0.9) {
      // if it's been the blue bulb 90% of the time recently,
      // this history autowins, hence the break
      best = history;
      break;
    }
    
    if (avgBlueScore > 2.8 && avgGreenScore < 1.4 && avgBGRatio < 0.5 && avgPropWhite > 0.6) {
      if (avgSkew < lowestAvgSkew) {
        lowestAvgSkew = avgSkew;
        best = history;
      }
    }
  }
  if (best !== null) {
    bulb = best.last();
    bulb.color = BLUE;
    return bulb;
  } else {
    return null;
  }
}

function findGreenLightbulb(histories) {
  let best = null;
  let lowestAvgSkew = Infinity;
  for (let history of Object.values(histories)) {
    if (history.length < 5) { continue };
    let totalBlueScore = 0;
    let totalGreenScore = 0
    let totalPropWhite = 0;
    let totalSkew = 0;
    let totalBGRatio = 0;
    let nBulbsInHistory = 0;
    for(let i = 0; i < history.length; i++) {
      let rect = history.get(i);
      totalBlueScore += rect.analysisData["scores"][BLUE];
      totalGreenScore += rect.analysisData["scores"][GREEN];
      totalPropWhite += rect.analysisData["prop_white"];
      totalBGRatio += rect.analysisData["green_to_blue_score_ratio"];
      totalSkew += rect.analysisData["skew"];
      if (rect.color === GREEN) {
        nBulbsInHistory++; 
      }
    }
    let avgBlueScore = totalBlueScore / history.length;
    let avgGreenScore = totalGreenScore / history.length;
    let avgPropWhite = totalPropWhite / history.length;
    let avgSkew = totalSkew / history.length;
    let avgBGRatio = totalBGRatio / history.length;
    let pastProportion = nBulbsInHistory / history.length;

    if (pastProportion > 0.9) {
      // if it's been the green bulb 90% of the time recently,
      // this history autowins, hence the break
      best = history;
      break;
    }
    
    //console.log(history.id, avgBlueScore, avgGreenScore, avgBGRatio, avgPropWhite);
    if (avgBlueScore < 2.8 && avgGreenScore > 1.4 && avgBGRatio > 0.5 && avgPropWhite > 0.5) {
      if (avgSkew < lowestAvgSkew) {
        lowestAvgSkew = avgSkew;
        best = history;
      }
    }
  }
  if (best !== null) {
    bulb = best.last();
    bulb.color = GREEN;
    return bulb;
  } else {
    return null;
  }
}

function findRedLightbulb(histories) {
  let best = null;
  let lowestAvgSkew = Infinity;
  for (let history of Object.values(histories)) {
    if (history.length < 5) { continue };    
    let totalRedScore = 0;
    let totalPropWhite = 0;
    let totalSkew = 0;
    let nBulbsInHistory = 0;
    for(let i = 0; i < history.length; i++) {
      let rect = history.get(i);
      totalRedScore += rect.analysisData["scores"][RED];
      totalPropWhite += rect.analysisData["prop_white"];
      totalSkew += rect.analysisData["skew"];
      if (rect.color === RED) {
        nBulbsInHistory++; 
      }
    }
    let avgRedScore = totalRedScore / history.length;
    let avgPropWhite = totalPropWhite / history.length;
    let avgSkew = totalSkew / history.length;
    let pastProportion = nBulbsInHistory / history.length;

    if (pastProportion > 0.9) {
      // if it's been the red bulb 90% of the time recently,
      // this history autowins, hence the break
      best = history;
      break;
    }
    
    if (avgRedScore > 4 && avgPropWhite > 0.6) {
      if (avgSkew < lowestAvgSkew) {
        lowestAvgSkew = avgSkew;
        best = history;
      }
    }
  }
  if (best !== null) {
    bulb = best.last();
    bulb.color = RED;
    return bulb;
  } else {
    return null;
  }
}

// This is intended to be called from the console, passing the relevant info
async function calibrate(color, rectNumber) {
  calibrating["color"] = color;
  calibrating["rectNumber"] = rectNumber;
  calibrationData[color] = [];
  await sleep(5000);
  console.log("done calibrating");
  localStorage.calibrationData = JSON.stringify(calibrationData);
  calibrating["color"] = null;
  calibrating["rectNumber"] = null;
  
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
        smoothRect(history, match);
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
        smoothRect(match, rect);
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

function findBulbsFromCalibrationData(histories) {
  let ret = [null, null, null];
  const COLOR_D_THRESH = 0.7;
  const SKEW_D_THRESH = 0.9;
  const PROP_WHITE_D_THRESH = 0.9;
  for (let history of Object.values(histories)) {
    allCalib = calibrationData[RED].concat(calibrationData[BLUE]).concat(calibrationData[GREEN]);
    calibSkew = allCalib.map((r) => r.analysisData["skew"]);
    calibPropWhite = allCalib.map((r) => r.analysisData["skew"]);    
    let histScores = [[],[],[]]
    let histSkew = [];
    let histPropWhite = [];
    let nInHistory = [0,0,0];
    for (let i=0; i<history.length; i++) {
      let rect = history.get(i);
      histScores[RED].push(rect.analysisData["scores"][RED]);
      histScores[GREEN].push(rect.analysisData["scores"][GREEN]);
      histScores[BLUE].push(rect.analysisData["scores"][BLUE]);
      histSkew.push(rect.analysisData["skew"]);
      histPropWhite.push(rect.analysisData["prop_white"]);
      if (rect.color === String(RED)) {
        nInHistory[RED]++; 
      } else if (rect.color === String(GREEN)) {
        nInHistory[GREEN]++;         
      } else if (rect.color === String(BLUE)) {
        nInHistory[BLUE]++;
      }
    }

    for (let color of [RED, GREEN, BLUE]) {
      // short circuit using >90% autowin rule
      if (nInHistory[color] / history.length > 0.9) {
        let rect = history.last()
        rect["color"] = color;
        ret[color] = rect;
        break;
      }
    }
    
    let skewResults = kolmogorovSmirnov(histSkew, calibSkew);
    let propWhiteResults = kolmogorovSmirnov(histPropWhite, calibPropWhite);
    
    let avgDs = [null, null, null];
    for (let calibColor of [RED, GREEN, BLUE]) {
      let calibHistory = calibrationData[calibColor];
      if (calibHistory.length === 0) { continue };
      let stats = [RED, GREEN, BLUE].map((scoreColor) => kolmogorovSmirnov(
        histScores[scoreColor],
        calibHistory.map((r) => r.analysisData.scores[scoreColor])
      ));
      
      avgDs[calibColor] = 0;
      for (let result of stats) {
        avgDs[calibColor] += result["d"];
      }
      avgDs[calibColor] /= stats.length;
          
    }

    history.last().avgColorDs = avgDs;
    history.last().skewD = skewResults["d"];
    history.last().propWhiteD = skewResults["d"];
  }
  
  for (let color in [RED, GREEN, BLUE]) {
    let best = null;
    for (let history of Object.values(histories)) {
      let rect = history.last();
      if (rect.avgColorDs[color] < COLOR_D_THRESH && rect.skewD < SKEW_D_THRESH && rect.propWhiteD < PROP_WHITE_D_THRESH) {
        if (best === null) {
          best = rect;
        } else if (rect.avgColorDs[color] < best.avgColorDs[color]) {
          best = rect;
        }
      }
    }
    if (best !== null) {
      best["color"] = color;
      ret[color] = best;   
    }
  }
  return ret;
}

function onTrack(event) {
  if (ui.state === "countdown") {
    // we don't want to be drawing while the countdown is going
    return
  }
  
  
  // necessary to use capture.pixels later.
  trackingCapture.loadPixels();

  let now = Date.now()
  event.data.forEach((tr) => { tr.time = now });
  
  event.data.forEach((tr) => tr.analysisData = analyze(trackingCapture.pixels, tr));

  event.data.forEach((tr) => {
    tr.x *= downsampleFactor;
    tr.y *= downsampleFactor;
    tr.width *= downsampleFactor;
    tr.height *= downsampleFactor; 
  });
  
  // map rects to history needs to happen before the stuffOnScreen check
  // since it triggers the removal of stale histories
  mapRectsToHistory(now, trackerHistory, event.data);
  
  if (event.data.length > 0) {
    stuffOnScreen = true;
  } else {
    stuffOnScreen = false; 
    return;
  }
  
  if (calibrating["color"] !== null) {
    let trackingRect = event.data.find((tr) => tr.historyId === calibrating["rectNumber"]);
    if (trackingRect !== undefined) {
      calibrationData[calibrating["color"]].push(trackingRect);
    } else {
      console.warn("trying to calibrate but can't find rect with correct historyId", calibrating);
    }
  }
  
  let coloredRects
  if (localStorage.dontCalibrate === undefined) {
    coloredRects = findBulbsFromCalibrationData(trackerHistory);
  } else {
    coloredRects = [findRedLightbulb(trackerHistory), findGreenLightbulb(trackerHistory), findBlueLightbulb(trackerHistory)];    
  }
  
  event.data.forEach((tr) => toDraw.push(diagnosticRect(tr)));  

  //event.data.forEach((tr) => toDraw.push(new Particle(tr)));
  
  for (let trackingRect of coloredRects) {    
    if (trackingRect === null) { continue };
    var c = center(trackingRect);
    var rect = {
      x: canvasWidth - c.x,
      y: c.y,
      width: trackingRect.width,
      height: trackingRect.height,
      color: trackingRect.color,
      time: trackingRect.time,
    };
    
    if (rect.time - lastTimeSeen[rect.color] > 500) {
      newAppearance(rect);
    } else {
      continueGesture(rect);
    }
    lastTimeSeen[rect.color] = now;
  }
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
            
      fill(0,0,0,0);
      stroke(255,204,0);
      
      strokeWeight(4);
      rect(x,y, width, height);
      pop()

      // draw text
      
      fill(255,204,0);
      stroke(255,204,0);

      let fontSize = 25
      textSize(fontSize);
      
      let boost = 5
      
      let toType;
      if (trackingRect.avgColorDs === undefined) {
        toType = [
          "R: " + trackingRect.analysisData["scores"][RED].toFixed(2),
          "G: " + trackingRect.analysisData["scores"][GREEN].toFixed(2),
          "B: " + trackingRect.analysisData["scores"][BLUE].toFixed(2),
          "G/B: " + (trackingRect.analysisData["scores"][GREEN]/trackingRect.analysisData["scores"][BLUE]).toFixed(2),
          "W: " + trackingRect.analysisData["prop_white"].toFixed(2),
          "S: " + trackingRect.analysisData["skew"].toFixed(2),
          "#: " + trackingRect.historyId,
        ];
      } else {
        toType = [
          "dR: " + (trackingRect.avgColorDs[RED] || NaN).toFixed(2),
          "dG: " + (trackingRect.avgColorDs[GREEN] || NaN).toFixed(2),
          "dB: " + (trackingRect.avgColorDs[BLUE] || NaN).toFixed(2),
          "dS: " + (trackingRect.skewD || NaN).toFixed(2),
          "dW: " + (trackingRect.propWhiteD || NaN).toFixed(2),                
          "#: " + trackingRect.historyId,
        ];
      }
      
      for (let i = 0; i < toType.length; i++) {
        text(toType[i], canvasWidth-x-width, y-(fontSize*(toType.length-i))-boost);
      }
      
    },
    keep: (now) => false,
  }
};

function draw() {
  var now = Date.now()
  clear();
  drawVideoOnCanvas(displayCapture);
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