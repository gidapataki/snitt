/*
 * $Id: bounds.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


// Bounds

function Bounds() {
    this.lo=new Coord();
    this.hi=new Coord();
    this.empty=true;
}


Bounds.prototype.lo=null;
Bounds.prototype.hi=null;
Bounds.prototype.empty=null;


Bounds.prototype.clear=function() {
    this.lo.x=this.lo.y=this.hi.x=this.hi.y=0;  //failsafe
    this.empty=true;
}


Bounds.prototype.width=function() {
    return (this.empty ? 0 : this.hi.x-this.lo.x);
}


Bounds.prototype.height=function() {
    return (this.empty ? 0 : this.hi.y-this.lo.y);
}


Bounds.prototype.contains=function(c) {
    if (c instanceof Coord) {
        return (this.empty 
            ? false
            : (this.lo.x<=c.x && c.x<=this.hi.x && this.lo.y<=c.y && c.y<=this.hi.y));
    }
    else if (c instanceof Bounds) {
        return (this.empty
            ? false
            : (c.empty ? false : this.contains(c.lo) && this.contains(c.hi)));
    }
}


Bounds.prototype.extend=function(c) {
    if (c instanceof Coord) {
        if (this.empty) { this.lo.copy(c); this.hi.copy(c); this.empty=false; }
        else {
            this.lo.x=Math.min(this.lo.x, c.x);
            this.lo.y=Math.min(this.lo.y, c.y);
            this.hi.x=Math.max(this.hi.x, c.x);
            this.hi.y=Math.max(this.hi.y, c.y);
        }
    }
    else if (c instanceof Bounds) {
        if (!c.empty) { this.extend(c.lo); this.extend(c.hi); }
    }
    return this;
}



Bounds.prototype.intersect=function(b) {
    if (this.empty || b.empty) { this.clear(); }
    else {
        this.lo.x=Math.max(this.lo.x, b.lo.x);
        this.lo.y=Math.max(this.lo.y, b.lo.y);
        this.hi.x=Math.min(this.hi.x, b.hi.x);
        this.hi.y=Math.min(this.hi.y, b.hi.y);
        if (this.lo.x>this.hi.x || this.lo.y>this.hi.y) { this.clear(); }
    }
}


Bounds.prototype.grow=function(s) {
    if (!this.empty) {
        this.lo.x-=s;
        this.lo.y-=s;
        this.hi.x+=s;
        this.hi.y+=s;
        if (this.lo.x>this.hi.x || this.lo.y>this.hi.y) { this.clear(); }       
    }
    return this;
}


Bounds.prototype.move=function(v) {
    this.lo.x+=v.x;
    this.hi.x+=v.x;
    this.lo.y+=v.y;
    this.hi.y+=v.y;
}

