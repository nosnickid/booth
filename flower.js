const SUSTAIN = 100;

class Flower {

  constructor(x, y, size) {
    this.x = x;
    this.y = y
    this.size = size;
    this.created = Date.now()
  }
  
  ellapsed(now) {
    return now - this.created;
  }
  
  draw(now) {
    strokeWeight(4);
    var fade = (SUSTAIN - this.ellapsed(now)) / SUSTAIN
    stroke(255*fade, 255*fade, 0);
    noFill()    
    var rect = {x: this.x, y: this.y, height: this.height, width: this.width};
    var c = center(rect);
    translate(c.x, c.y);
    for (var i = 0; i < 10; i ++) {
      ellipse(0, 30, rect.height/3, rect.height)
      rotate(PI/5);
    }
    translate(-c.x, -c.y); 
  }
  
  keep(now) {
    return this.ellapsed(now) < SUSTAIN;
  }
}