// things that pertain to drawing all the non-canvas UI
// e.g. titles for the waiting screen, text entry, countdown, etc.

function drawInitialStateUI() {
  let title = document.createElement('div');
  let start = document.createElement('div');
  title.innerHTML = "Leave a video message for John and Emily<br/>(use the lightbulbs to draw in the air)";
  start.innerHTML = "Press ENTER to start";
  title.className ="initial title glow";
  start.className = "initial start glow"
  document.body.appendChild(title);
  document.body.appendChild(start);
}