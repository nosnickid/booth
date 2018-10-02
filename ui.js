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
  }
  
  handleEnter(e) {
    if (this.state === "initial") {
      this.state = "textEntry";
      this.destroyInitial();
      this.drawTextEntry();
      document.querySelector("#name-input").focus()
    } else if (this.state = "textEntry") {
      if (document.querySelector("#name-input") == document.activeElement) {
        document.querySelector("#message-input").focus();
      }
    }
    
  }

  drawInitial() {
    let title = createDOMElement(
      `<div class="initial title glow text-shadow">
         Leave a video message for John and Emily!<br/>(use the lightbulbs to draw in the air)
      </div>`
    );
    let start = createDOMElement(
      `<div class="initial start glow text-shadow">
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
      `<form autocomplete="off">
        <label class="text-entry">
          Name:
           <input class="text-entry" type="text" id="name-input" name="name"/>
        </label>
        <br/>
        <label class="text-entry">
          Note to John and Emily:
          <input class = "text-entry" type="text" id="message-input" name="message"/>
        </label>
      </form>`
    );
    document.body.appendChild(form);
  }
  
  destroyTextEntry() {
    // TODO
  }
}