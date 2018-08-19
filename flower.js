class Flower {
  constructor(x, y, size) {
    this.x = x;
    this.y = y
    this.size = size;
    this.created = Date.now()
  }
  
  draw() {
    strokeWeight(4);
    stroke(255, 255, 0);
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
    return now + 100 < this.created;
  }
}