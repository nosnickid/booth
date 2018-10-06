class Gesture {

    constructor(mw, mh) {
        this.color = RED;
        this.damp = 5.0;
      	this.dampInv = 1.0 / this.damp;
     	  this.damp1 = this.damp - 1;

      	this.w = mw;
        this.h = mh;
        this.capacity = 600;

        this.path = new Array(this.capacity); // Vec3f
        this.polygons = new Array(this.capacity); // Polygon
        this.crosses = new Array(this.capacity); // int
        
        for (let i = 0; i < this.capacity; i++) {
            this.polygons[i] = new Polygon(4);
            this.path[i] = new Vec3f(0,0,0);
            this.crosses[i] = 0;
        }
        
        this.nPoints = 0;
        this.nPolys = 0;

        this.exists = false;
        this.jumpDx = 0;
        this.jumpDy = 0;

        this.INIT_TH = 18;
      	this.thickness = this.INIT_TH;
    }

    clear() {
        this.nPoints = 0;
        this.exists = false;
        this.thickness = this.INIT_TH;
    }

    clearPolys() {
        this.nPolys = 0;
    }

    addPoint(x, y) { // float
        if (this.nPoints >= this.capacity) {
            // there are all sorts of possible solutions here,
            // but for abject simplicity, I don't do anything.
        } else {
            var v = this.distToLast(x, y);
            var p = this.getPressureFromVelocity(v);

            // ~ ~ ~ ~ ~ ~ ~ ~
            this.path[this.nPoints++].set(x,y,p);
            // ~ ~ ~ ~ ~ ~ ~ ~

            if (this.nPoints > 1) {
                this.exists = true;
                this.jumpDx = this.path[this.nPoints-1].x - this.path[0].x;
                this.jumpDy = this.path[this.nPoints-1].y - this.path[0].y;
            }
        }
    }

    getPressureFromVelocity(v) { // float
        var scale = 18;
        var minP = 0.02;
        var oldP = (this.nPoints > 0) ? this.path[this.nPoints-1].p : 0;
        return ((minP + max(0, 1.0 - v/scale)) + (this.damp1 * oldP)) * this.dampInv;
	}

    setPressures() {
        // pressures vary from 0...1
        var pressure; //float
        var tmp; // vec3f
        var t = 0; // float
        var u = 1.0 / (this.nPoints - 1) * TWO_PI;
        
        for (let i = 0; i < this.nPoints; i++) {
            pressure = sqrt((1.0 - cos(t)) * 0.5);
            this.path[i].p = pressure;
            this.path[i].time = 0;
            t += u;
        }
    }

    distToLast(ix, iy) {
        if (this.nPoints > 0) {
            var v = this.path[this.nPoints-1];
            var dx = v.x - ix;
            var dy = v.y - iy;
            return mag(dx, dy);
        } else {
            return 30;
        }
    }

    compile() {
        // compute the polygons from the path of Vec3f's
        if (this.exists) {
          var mode = vizModeCurrent;
          switch (mode) {
            case 0:
              this.compileYellowtail();
            default:
              break;
          }
        }
    }
      
    compileYellowtail() {
      this.clearPolys();

      var p0, p1, p2;
      var radius0, radius1;
      var ax, bx, cx, dx;
      var ay, by, cy, dy;
      var axi, bxi, cxi, dxi, axip, axid;
      var ayi, byi, cyi, dyi, ayip, ayid;
      var p1x, p1y;
      var dx01, dy01, hp01, si01, co01;
      var dx02, dy02, hp02, si02, co02;
      var dx13, dy13, hp13, si13, co13;
      var taper = 1.0;

      var nPathPoints = this.nPoints - 1;
      var lastPolyIndex = nPathPoints - 1;
      var npm1finv = 1.0 / max(1, nPathPoints - 1);

      // handle the first point
      p0 = this.path[0];
      p1 = this.path[1];
      radius0 = p0.p * this.thickness;
      dx01 = p1.x - p0.x;
      dy01 = p1.y - p0.y;
      hp01 = sqrt(dx01*dx01 + dy01*dy01);

      if (hp01 == 0) {
          hp02 = 0.0001;
      }

      co01 = radius0 * dx01 / hp01;
      si01 = radius0 * dy01 / hp01;
      ax = p0.x - si01; 
      ay = p0.y + co01;
      bx = p0.x + si01; 
      by = p0.y - co01;

      var xpts = [];
      var ypts = [];

      var LC = 20;
      var RC = this.w-LC;
      var TC = 20;
      var BC = this.h-TC;
      var mint = 0.618;
      var tapow = 0.4;

      // handle the middle points
      var i = 1;
      var apoly; // Polygon

      for (let i = 1; i < nPathPoints; i++) {
          taper = pow((lastPolyIndex - i) * npm1finv, tapow);

          p0 = this.path[i-1];
          p1 = this.path[i];
          p2 = this.path[i+1];
          p1x = p1.x;
          p1y = p1.y;
          radius1 = Math.max(mint, taper * p1.p * this.thickness);

          // assumes all segments are roughly the same length...
          dx02 = p2.x - p0.x;
          dy02 = p2.y - p0.y;
          hp02 = Math.sqrt(dx02 * dx02 + dy02 * dy02);

          if (hp02 != 0) {
              hp02 = radius1/hp02;
          }

          co02 = dx02 * hp02;
          si02 = dy02 * hp02;

          // translate the integer coordinates to the viewing rectangle
          axi = axip = floor(ax);
          ayi = ayip = floor(ay);
          axi=(axi < 0) ? (this.w - (( -axi) % this.w)) : axi % this.w;
          axid = axi-axip;
          ayi=(ayi < 0) ? (this.h - (( -ayi) % this.h)) : ayi % this.h;
          ayid = ayi-ayip;

          // set the vertices of the polygon

          // ~ ~ ~ ~ ~ ~ ~ ~
          apoly = this.polygons[this.nPolys++];
          // ~ ~ ~ ~ ~ ~ ~ ~

          xpts = apoly.xpoints;
          ypts = apoly.ypoints;
          xpts[0] = axi = axid + axip;
          xpts[1] = bxi = axid + floor(bx);
          xpts[2] = cxi = axid + floor((cx = p1x + si02));
          xpts[3] = dxi = axid + floor((dx = p1x - si02));
          ypts[0] = ayi = ayid + ayip;
          ypts[1] = byi = ayid + floor(by);
          ypts[2] = cyi = ayid + floor(cy = p1y - co02);
          ypts[3] = dyi = ayid + floor(dy = p1y + co02);

          // keep a record of where we cross the edge of the screen
          this.crosses[i] = 0;
          if ((axi<=LC)||(bxi<=LC)||(cxi<=LC)||(dxi<=LC)) { 
              this.crosses[i]|=1; 
          }
          if ((axi>=RC)||(bxi>=RC)||(cxi>=RC)||(dxi>=RC)) { 
              this.crosses[i]|=2; 
          }
          if ((ayi<=TC)||(byi<=TC)||(cyi<=TC)||(dyi<=TC)) { 
              this.crosses[i]|=4; 
          }
          if ((ayi>=BC)||(byi>=BC)||(cyi>=BC)||(dyi>=BC)) { 
              this.crosses[i]|=8; 
          }

          //swap data for next time
          ax = dx; 
          ay = dy;
          bx = cx; 
          by = cy;
      }

      // handle the last point
      p2 = this.path[nPathPoints];

      // ~ ~ ~ ~ ~ ~ ~ ~
      apoly = this.polygons[this.nPolys++];
      // ~ ~ ~ ~ ~ ~ ~ ~

      xpts = apoly.xpoints;
      ypts = apoly.ypoints;

      xpts[0] = floor(ax);
      xpts[1] = floor(bx);
      xpts[2] = floor((p2.x));
      xpts[3] = floor((p2.x));

      ypts[0] = floor(ay);
      ypts[1] = floor(by);
      ypts[2] = floor((p2.y));
      ypts[3] = floor((p2.y));
  }

	smooth() {
        // average neighboring points
        var weight = 28;
        var scale = 1.0 / (weight + 2);
        var nPointsMinusTwo = this.nPoints - 2;
        var lower, upper, center;

        for (let i = 1; i < nPointsMinusTwo; i++) {
            lower = this.path[i-1];
            center = this.path[i];
            upper = this.path[i+1];

           // center.x = (lower.x + weight * center.x + upper.x) * scale;
            //center.y = (lower.y + weight * center.y + upper.y) * scale;
        }
    }

}

class Polygon {

	constructor(n) {
        this.npoints = n;
        this.xpoints = new Array(n);
        this.ypoints = new Array(n); 		
	}

}

class Vec3f {

    constructor(ix, iy, ip) {
    		this.x = 0;
        	this.y = 0;
        	this.p = 0; // Pressure

        	this.set(ix, iy, ip);
    }

    set(ix, iy, ip) {
        this.x = ix;
        this.y = iy;
        this.p = ip;
    }

}