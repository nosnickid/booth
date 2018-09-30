// things that pertain to drawing all the non-canvas UI
// e.g. titles for the waiting screen, text entry, countdown, etc.

// I don't even know why I'm trying to encapsulate this in a class, it's a pretty futile gesture at this point

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
    let title = document.createElement('div');
    let start = document.createElement('div');
    title.innerHTML = "Leave a video message for John and Emily!<br/>(use the lightbulbs to draw in the air)";
    start.innerHTML = "Press ENTER to start";
    title.className ="initial title glow";
    start.className = "initial start glow"
    document.body.appendChild(title);
    document.body.appendChild(start);
  }
  
  destroyInitial() {
    for (let elem of document.querySelectorAll(".initial")) {
      elem.parentNode.removeChild(elem);
    }
  }
  
  drawTextEntry() {
    // TODO
  }
  
  destroyTextEntry() {
    // TODO
  }
}