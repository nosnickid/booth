const SUSTAIN = 1000;

class Flower {

  constructor(rect) {
    this.rect = rect;
    this.created = Date.now()
  }
  
  ellapsed(now) {
    return now - this.created;
  }
  
  drawFlowerShape(rect) {
    var c = center(rect);    
    translate(c.x, c.y);
    for (var i = 0; i < 10; i ++) {
      ellipse(0, 30, rect.height/3, rect.height)
      rotate(PI/5);
    }
    translate(-c.x, -c.y);
  }
  
  drawCircleShape(rect) {
    ellipse(rect.x, rect.y, rect.height, rect.height);
  }
          
  draw(now) {
    strokeWeight(4);
    var fade = (SUSTAIN - this.ellapsed(now)) / SUSTAIN
    stroke(255, 255, 0, 255 * fade);
    noFill();   
    this.drawFlowerShape(this.rect);
  }
  
  keep(now) {
    return this.ellapsed(now) < SUSTAIN;
  }
}