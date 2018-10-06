// things that pertain to drawing all the non-canvas UI
// e.g. titles for the waiting screen, text entry, countdown, etc.

// I don't even know why I'm trying to encapsulate this in a class, it's a pretty futile gesture at this point

  
function createDOMElement(s) {
  let el = document.createElement('div');
  el.innerHTML = s;
  return el.firstChild;
}

function destroyElement(elem) {
   elem.parentNode.removeChild(elem);  
}

class UI {

  constructor () {
    this.state = "initial";
    this.formData = {
      "name": null,
      "note": null,
    }
  }
  
  handleEnter(e) {
    if (this.state === "initial") {
      this.state = "textEntry";
      this.destroyInitial();
      this.drawTextEntry();
      document.querySelector("#name-input").focus()
    } else if (this.state === "textEntry") {
      if (document.querySelector("#note-input") == document.activeElement) {
        this.formData["name"] = document.querySelector("#name-input").value;
        this.formData["note"] = document.querySelector("#note-input").value;
        this.state = "countdown"
        this.destroyTextEntry();
        this.drawCountdown();
        this.runCountdown();        
      } else if (document.querySelector("#name-input") == document.activeElement) {
        document.querySelector("#note-input").focus();
      } else {
        document.querySelector("#name-input").focus();        
      }
    } else if (this.state === "countdown") {
      // do nothing, just wait for countdown to finish
    } else if (this.state === "recording") {
      // TODO
    }
  }

  drawInitial() {
    let title = createDOMElement(
      `<div class="initial bigtext shadow">
         Leave a video message for John and Emily!<br/>(use the lightbulbs to draw in the air)
      </div>`
    );
    let start = createDOMElement(
      `<div class="initial bigtext shadow" style="margin-top: 750px">
        Press ENTER to start
      </div>`
    );
    document.body.appendChild(title);
    document.body.appendChild(start);
    this.startClearCycle();
  }
  
  destroyInitial() {
    document.querySelectorAll(".initial").forEach(destroyElement);
  }
  
  async startClearCycle() {
    // this is just so things don't turn into a mess while
    // we're waiting for someone to start
    while (true) {
      await sleep(30000);
      if (this.state === "initial") {
        clearVisuals();
      }
    }
  }
  
  drawTextEntry() {
    let form = createDOMElement(
      `<form class="text-entry" autocomplete="off">
        <label class="text-entry shadow bigtext" id="name-label">
          Name(s):<br/>
           <input class="text-entry" type="text" id="name-input" name="name"/>
        </label>
        <br/>
        <label class="text-entry shadow bigtext" id="note-label">
          Note to John and Emily:<br/>
          <input class="text-entry" type="text" id="note-input" name="note"/>
        </label>
        <div class="bigtext shadow text-entry" style="margin-top: 200px"">Press ENTER to continue</div>
      </form>`
    );
    document.body.appendChild(form);
  }
  
  destroyTextEntry() {
    document.querySelectorAll(".text-entry").forEach(destroyElement);
  }
  
  destroyCountdown() {
    document.querySelectorAll(".countdown").forEach(destroyElement);
  }
  
  destroyTimer() {
    document.querySelectorAll("#timer").forEach(destroyElement);
  }  
  
  drawFinal() {
    let finalText = createDOMElement(`<div class="bigtext shadow final">Thank you!<br/>Your video will be sent to John and Emily</div>`);
    document.body.appendChild(finalText);
  }
  
  startRecording() {
    this.state = "recording";
    this.destroyCountdown();
    this.drawRecording();
    this.recorder = new Recorder(document.querySelector(".p5Canvas"), this.onFinishRecording.bind(this));
    this.recorder.startRecording();
    this.runTimer();  // this is the thing that stops the recording
  }
  
  renderedFormData() {
    return `name: ${this.formData["name"]}
note: ${this.formData["note"]}`;
  }
  
  onFinishRecording() {
    let videoId = uuid();
    download(this.recorder.blob(), `${videoId}.webm`);
    download(new Blob([this.renderedFormData()]), `${videoId}.txt`);
    this.recorder.clearRecording();
  }
  
  async goToFinal() {
    this.destroyTimer();
    clearVisuals();
    this.state = "final";
    this.drawFinal();
    await sleep(5000);
    window.location.reload();
  }
  
  async runTimer() {
    for (let i=29; i > 0; i--) {
      await sleep(1000);
      document.querySelector("#timer").innerHTML = String(i);
    }
    await sleep(1000);  // wait the last second    
    this.recorder.finishRecording();
    this.goToFinal();
  }
  
  async runCountdown() {
    clearVisuals();
    await sleep(200);
    document.querySelector("#cd-3").classList.add("active");
    await sleep(800);
    document.querySelector("#cd-3").classList.remove("active");
    document.querySelector("#cd-2").classList.add("active");
    await sleep(800);
    document.querySelector("#cd-2").classList.remove("active");
    document.querySelector("#cd-1").classList.add("active");
    await sleep(800);
    document.querySelector("#cd-1").classList.remove("active");    
    document.querySelector("#cd-go").classList.add("active");
    await sleep(500);
    this.startRecording();
  }  
  
  drawCountdown() {
    let countdown = createDOMElement(
      `<div class="countdown">
         <span class="shadow" id="cd-3">3</span>
         <span class="shadow" id="cd-2">2</span>
         <span class="shadow" id="cd-1">1</span>
         <span class="shadow" id="cd-go">GO!</span>
      </div>`      
    );
    document.body.appendChild(countdown);
  }
  
  drawRecording() {
    let timer = createDOMElement(`<div class="shadow" id="timer">30</div>`);
    document.body.appendChild(timer);
  }
}