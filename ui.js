// things that pertain to drawing all the non-canvas UI
// e.g. titles for the waiting screen, text entry, countdown, etc.

function drawInitialStateUI() {
  let title = document.createElement('p');
  let start = document.createElement('p');
  title.innerHTML = "Leave a magical message for John and Emily!";
  start.innerHTML = "Press SPACE to start";
  title.className ="initial title";
  start.className = "initial start"
  document.body.appendChild(title);
  document.body.appendChild(start);
}