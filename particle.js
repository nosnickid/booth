class Particle {

  constructor(rect) {
    this.rect = rect;
    this.created = Date.now();
    this.acceleration = createVector(0, 0.05);
    this.velocity = createVector(random(-1, 1), random(-1, 0));
    this.position = createVector(rect.x, rect.y);
    this.lifespan = 100000000;
  }
  
  ellapsed(now) {
    return now - this.created;
  }
  
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
  };
  
  drawCircleShape() {
    stroke(200, this.lifespan);
    strokeWeight(0);
    fill(127, this.lifespan);
    ellipse(this.position.x, this.position.y, 12, 12);
  }
          
  draw(now) {
    var fade = (this.lifetime - this.ellapsed(now)) / this.lifetime;
    this.update();
    fill(255, 0, 255, 255 * fade);   
    this.drawCircleShape();
  }
  
  keep(now) {
    return this.ellapsed(now) < this.lifetime;
  }
}