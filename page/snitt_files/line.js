/*
 * $Id: line.js $
 * 
 * Copyright (c) 2012-2013 Pataki Gida
 * 
 */


// Line

var Line = function(p0, p1) {
    this.p0=p0;
    this.p1=p1;
    this._len=p0.to(p1).norm();
}


Line.prototype.mid=function(lambda) {
    return this.p0.mid(this.p1, lambda);
}


Line.prototype.len=function() {
    return this._len;
}


Line.prototype.split=function(lambda) {
    var mx=this.mid(lambda);
    return [new Line(this.p0, mx), new Line(mx, this.p1)];
}


Line.prototype.scanline=function(y) {
    var p0=this.p0;
    var p1=this.p1;
    var y0=p0.y, y1=p1.y;
    var xs=[];
    
    if (y0==y) { xs.push(p0.x); }
    if (y1==y) { xs.push(p1.x); }
    if (y0!=y1 && (y0<y && y<y1 || y1<y && y<y0)) {
        var lambda=(y-y0)/(y1-y0); 
        xs.push(p0.x*(1-lambda)+p1.x*lambda); 
    }
    return xs;
}


Line.prototype.plot=function(first) {
    if (first)  { return [ this.p0, this.p1 ]; }
    else        { return [ this.p1 ]; }
}


Line.prototype.bounds=function() {
    var box=new Bounds();
    box.extend(this.p0);
    box.extend(this.p1);
    
    return box;
}


Line.prototype.reversed=function() {
    return new Line(this.p1, this.p0);
}


Line.prototype.closest=function(p, dsnap) {
    var p0=this.p0, p1=this.p1;
    var l=null;
    var q=null;
    var d=null;
    
    if (dsnap!=null) {
        var dp0=p.to(p0).norm();
        var dp1=p.to(p1).norm();
        if      (dp0<dsnap) { l=0; d=0; q=p0.clone(); }
        else if (dp1<dsnap) { l=1; d=0; q=p1.clone(); }
    }

    if (l==null) {
        var u=p0.to(p1);
        var v=u.lnormal();
        var pp0=p.to(p0);
        
        l=lambda(v, pp0, u);
        if (l<0) { l=0; }
        else if (l>1) { l=1; }
    
        q=p0.dv(u.mul(l));
        d=p.to(q).norm();
    }
    
    return { "q": q, "x": this._len*l, "l": l, "d": d };
}


