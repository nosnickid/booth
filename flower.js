import center from 'utils';

class Flower {
  
  SUSTAIN = 100;

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
    fade = (SUSTAIN - ellapsed(now)) / SUSTAIN
    stroke(255*fade, 255*fade, 0);
    noFill()    
    var c = center(r);
    translate(c.x, c.y);
    for (var i = 0; i < 10; i ++) {
      ellipse(0, 30, r.height/3, r.height)
      rotate(PI/5);
    }
    translate(-c.x, -c.y); 
  }
  
  keep(now) {
    return ellapsed(now) < SUSTAIN;
  }
}

module.exports = [Flower];