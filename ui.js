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
    }
  }

  drawInitial() {
    let title = createDOMElement(
      `<div class="initial title glow">
         Leave a video message for John and Emily!<br/>(use the lightbulbs to draw in the air)
      </div>`
    );
    let start = createDOMElement(
      `<div class="initial start glow">
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
        <label for="name">Name:</label>
        <input type="text" id="form-name" name="name"/>
        <br/>
        <label for="message">Note to John and Emily:</label>
        <input type="text" id="form-message" name="messageff"/>
      </form>`
    );
    document.body.appendChild(form);
  }
  
  destroyTextEntry() {
    // TODO
  }
}