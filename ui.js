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
  }
  
  destroyInitial() {
    document.querySelectorAll(".initial").forEach(destroyElement);
  }
  
  drawTextEntry() {
    let form = createDOMElement(
      `<form class="text-entry" autocomplete="off">
        <label class="text-entry shadow bigtext" id="name-label">
          Name:<br/>
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
  
  async animateCountdown() {
    
    await sleep(2000);
    console.log('Two seconds later');
  }  
  
  drawCountdown() {
    let countdown = createDOMElement(
      `<div class="countdown">
         <span class="shadow">3</span>
         <span class="shadow">2</span>
         <span class="shadow">1</span>
         <span class="shadow">GO!</span>
      </div>`      
    );
    document.body.appendChild(countdown);
  }
}