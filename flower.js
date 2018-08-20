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
    translate(rect.x, rect.y);
    for (var i = 0; i < 10; i ++) {
      ellipse(0, 30, rect.height/3, rect.height)
      rotate(PI/5);
    }
    translate(-rect.x, -rect.y);
  }
  
  drawCircleShape(rect) {
    ellipse(rect.x, rect.y, rect.height, rect.height);
  }
          
  draw(now) {
    var fade = (SUSTAIN - this.ellapsed(now)) / SUSTAIN
    fill(255, 0, 255, 255 * fade);   
    this.drawFlowerShape(this.rect);
  }
  
  keep(now) {
    return false // this.ellapsed(now) < SUSTAIN;
  }
}