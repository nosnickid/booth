// var system;

// function setup() {
//   createCanvas(720, 400);
//   system = new ParticleSystem(createVector(width/2, 50));
// }

// function draw() {
//   background(51);
//   system.addParticle();
//   system.run();
// }

const SUSTAIN = 1000;

class Particle

  constructor(rect) {
    this.rect = rect;
    this.created = Date.now();
    this.acceleration = createVector(0, 0.05);
    this.velocity = createVector(random(-1, 1), random(-1, 0));
    this.position = position.copy();
    this.lifespan = 255;
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

// A simple Particle class
var Particle = function(position) {
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function() {
  stroke(200, this.lifespan);
  strokeWeight(0);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function(){
  return this.lifespan < 0;
};

var ParticleSystem = function(position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
  this.particles.push(new Particle(this.origin));
};

ParticleSystem.prototype.run = function() {
  for (var i = this.particles.length-1; i >= 0; i--) {
    var p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};