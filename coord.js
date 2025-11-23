/*
 * $Id: coord.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


// Coord

var Coord = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Coord.prototype.x = null;
Coord.prototype.y = null;

Coord.prototype.str =   function()      { return "("+this.x+", "+this.y+")";  }
Coord.prototype.dx =    function(x)     { return new Coord(this.x+x, this.y); }
Coord.prototype.dy =    function(y)     { return new Coord(this.x, this.y+y); }
Coord.prototype.dxy =   function(x, y)  { return new Coord(this.x+x, this.y+y); }
Coord.prototype.neg =   function()      { return new Coord(-this.x, -this.y); }
Coord.prototype.ay =    function(p)     { return new Coord(this.x, p.y); }
Coord.prototype.ax =    function(p)     { return new Coord(p.x, this.y); }
Coord.prototype.dv =    function(p)     { return new Coord(this.x+p.x, this.y+p.y); }
Coord.prototype.to =    function(p)     { return new Coord(p.x-this.x, p.y-this.y); }
Coord.prototype.mul =   function(n)     { return new Coord(this.x*n, this.y*n); }
Coord.prototype.dot =   function(p)     { return this.x*p.x+this.y*p.y; }
Coord.prototype.len =   function()      { return Math.sqrt(this.x*this.x+this.y*this.y); }
Coord.prototype.eq =    function(p)     { return (this.x.eq(p.x) && this.y.eq(p.y)); }

Coord.prototype.clone=function() { // revise
    return new Coord(this.x, this.y);
}


Coord.prototype.copy=function(c) {
    this.x=c.x;
    this.y=c.y;
}


Coord.prototype.normalized = function(d) {
    var n=this.norm();
    var m=(d==undefined ? 1 : d);
    if (n>0) { m=m/n; }
    return new Coord(this.x*m, this.y*m);
}


Coord.prototype.norm = function() {
    var x=this.x, y=this.y;
    return Math.sqrt(x*x+y*y);
}


Coord.prototype.norm2=function() {
    var x=this.x, y=this.y;
    return x*x+y*y;
}


Coord.prototype.mid = function(p, lambda) {
    return new Coord(this.x*(1-lambda)+p.x*lambda, this.y*(1-lambda)+p.y*lambda);
}


Coord.prototype.offMid = function(p, lambda, left) {
    var m=this.mid(p, lambda);
    var ln=this.to(p).lnormal();
    return m.dv(ln.normalized(left));
}


Coord.prototype.extend = function(p, delta) {
    var d=this.to(p).normalized(delta);
    return p.dv(d);
}


Coord.prototype.dir = function(p, delta) {
    var d=this.to(p).normalized(delta);
    return this.dv(d);
}


Coord.prototype.rnormal = function(n) {
    var v=(n==undefined ? this : this.normalized(n));
    return new Coord(v.y, -v.x);
}


Coord.prototype.lnormal = function(n) {
    var v=(n==undefined ? this : this.normalized(n));
    return new Coord(-v.y, v.x);
}


Coord.prototype.intersectCC = function(r1, p2, r2) {
    var d=this.to(p2).norm();
    if (d>0) {
        var d1=(r1*r1+d*d-r2*r2)/(2*d);
        var h=Math.sqrt(r1*r1-d1*d1);
        var nh=this.to(p2).normalized(h).lnormal();
        var ip=this.mid(p2, d1/d);
        return { left: ip.dv(nh), right: ip.dv(nh.neg()), mid: ip };
    }
    else {
        return { left: this, right: this, mid: this };
    }
}        


Coord.prototype.intersectCL = function(r, p0, p1) {
    var u=p0.to(p1);
    var v=u.lnormal();
    var q=this.to(p0);
    var m=p0.mid(p1, lambda(v, q, u));
    var lpm=this.to(m).norm();
    if (lpm<=r) {
        var d=Math.sqrt(r*r-lpm*lpm);
        var vl=this.to(m).lnormal().normalized(d);
        return { left: m.dv(vl), right: m.dv(vl.neg()), mid: m };
    }
    else {
        return { left: this, right: this, mid: this };
    }
}


Coord.prototype.intersectLL = function(p, p0, p1) {
    return this.intersectVL(this.to(p), p0, p1);
}


Coord.prototype.intersectVL = function(v, p0, p1) {
    var q=this.to(p0);
    var u=p0.to(p1);
    var l=lambda(v,q,u);
    
    return p0.mid(p1, l);
}


Coord.prototype.projected = function(p0, p1) {
    var u=p0.to(p1);
    var q=this.to(p0);
    var l=lambda(u.lnormal(), q, u);
    return p0.mid(p1, l);
}


Coord.prototype.rotated = function(v) {
    var x=this.x, y=this.y;
    return new Coord(x*v.x-y*v.y, x*v.y+y*v.x);
}


Coord.prototype.conjugated = function() {
    return new Coord(this.x, -this.y);
}


Coord.prototype.mirrored = function(p0, p1) {
    var pr=this.projected(p0, p1);
    return pr.dv(this.to(pr));
}


Coord.prototype.mirroredv=function(p0,p1) {
    return this.mirrored(new Coord(), p0.to(p1));
}

 
//  v,u		a ket szakaszvektor
//  q		az u szakasz kezdopontja v szakaszhoz kezdopontjahoz kepest
//  lambda	ha a ket szakasz altal meghatarozott egyenes metszi egymast, akkor a metszespont: u0+u*lamda
//			0 <= lambda <=  1 eseten az _egyenesek_ metszespontja az u szakaszra esik
//			ha a ket szakasz parhuzamos, akkor lambda == 0.
function lambda(v, q, u) {
    v=v.clone();
    q=q.clone();
    u=u.clone();
    if (v.x==0) {
        if (u.x!=0) { return -q.x/u.x; }
        else { return 0; }
    }
    else {
        q.x/=v.x, q.y-=q.x*v.y, q.y/=v.x;
        u.x/=v.x, u.y-=u.x*v.y, u.y/=v.x;
        if (u.y!=0) { return -q.y/u.y; }
        else { return 0; }
    }
}


function isParallel(p, q) {
    return Math.abs(cross(p, q))<0.0001;
}


function parallelDx(v, d) {
    var n=v.norm();
    if (Math.abs(v.y)>0) {
        return d*n/Math.abs(v.y);
    }
    else { return 0; }
}   


function cross(p, q) {
    return p.x*q.y-p.y*q.x;
}


function deg(a) { 
    return a*Math.PI/180; 
}


function polar(z, a) {
    var x=Math.cos(deg(a))*z;
    var y=Math.sin(deg(a))*z;
    return new Coord(x, y);
}


function rotateVec(p, q) {
    return q.normalized().rotated(p.normalized().conjugated());
}


function pathLen(path) {
    var sum=0;
    for (var i=0; i<path.length; ++i) {
        sum+=path[i].len();
    }
    return sum;
}

