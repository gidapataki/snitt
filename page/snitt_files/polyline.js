/*
 * $Id: polyline.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */



// Polyline

var Polyline = function(c) {
    this.points=[];
    this.lens=[];
    if (c) {
        this.push(c);
    }
}


Polyline.prototype.points=null;
Polyline.prototype.lens=null;


Polyline.prototype.size=function() {
    return this.points.length;
}


Polyline.prototype.len=function(n,m) {
    if (m==undefined) {
        if (n==undefined) {
            if (this.lens==0) { return 0; }
            else { return this.lens.last(); }
        }
        else {
            if (n>=0)   { return this.lens[Math.min(n, this.lens.length)]; }
            else        { return this.lens[Math.max(0, this.lens.length+n)]; }
        }
    }
    else {
        return this.len(m)-this.len(n);
    }
}



Polyline.prototype.push=function(p) {
    if (p instanceof Coord) {
        if (this.points.length>0) {
            var L=this.points.last().to(p).norm();
            if (L>0) { 
                this.points.push(p.clone());
                this.lens.push(L+this.lens.last());
            }
        }
        else {
            this.points.push(p.clone());
            this.lens.push(0);
        }
    }
    else if (p instanceof Array) {
        for (var i=0; i<p.length; ++i) { this.push(p[i]); }
    }
}


Polyline.prototype.clear=function() {
    this.points=[];
    this.lens=[];
}


Polyline.prototype.leftOffset=function(n) { 
    var ps=this.points;
    if (ps.length>1) {
        var poly=new Polyline();
        var p0=ps[0];
        var p1=ps[1];
        var v=p0.to(p1);
        var last=ps.length-1;
        var closed=false;
        var miter=Math.abs(n)*Math.sqrt(2)/2;
        
        p0=p0.dv(v.lnormal(n));
        if (ps[last].eq(ps[0])) { 
            closed=true; 
            var u=ps[last-1].to(ps[last]);
            var r=ps[last].dv(u.lnormal(n));
            var lamb=lambda(v,p0.to(r),u);
            var ulen=u.norm();
            var ipos=ulen*lamb;
            
            if (ipos>miter) { lamb=miter/ulen; }
            poly.push(r.dv(u.mul(lamb)));
            if (ipos>miter) { poly.push(p0.dv(v.normalized(-miter))); }
        }
        else { poly.push(p0); }
        
        for (var i=2; i<ps.length; ++i) {
            var p2=ps[i];
            var u=p1.to(p2);
            p1=p1.dv(u.lnormal(n));
            var lamb=lambda(v,p0.to(p1),u);
            var ulen=u.norm();
            var ipos=ulen*lamb;
            
            if (ipos<-miter) {
                poly.push(p0.dv(v).dv(v.normalized(miter)));
                lamb=-miter/ulen; 
            }
            poly.push(p1.dv(u.mul(lamb)));
            
            p0=p1;
            p1=p2;
            v=u;
            if (i==last) {
                if (closed) { poly.push(poly.points[0]); }
                else { poly.push(p1.dv(v.lnormal(n))); }
            }
        }
        return poly;
    }
    else { return null; }
}


Polyline.prototype.rightOffset=function(n) {
    return this.leftOffset(-n);
}


Polyline.prototype.section=function(x) {
    var ps=this.points;
    var ls=this.lens;
    
    if      (x<0)           { return -1; }          // out-of-bound!
    else if (x>ls.last())   { return ls.length; }   // .
    else {
        var lb=0;
        var hb=ls.length-1;
        while (lb+1<hb) {
            var pivot=Math.floor((lb+hb)/2);
            if (x<=ls[pivot]) { hb=pivot; }
            else { lb=pivot; }
        }
        return lb;
    }
}


Polyline.prototype.area=function() {
    var A=0;
    var ps=this.points;
    var n=ps.length-1;
    
    for (var i=0; i<n; ++i) {
        A+=ps[i].x*ps[i+1].y-ps[i+1].x*ps[i].y;
    }
    return A/2;
}


Polyline.prototype.pos=function(x) {
    var ps=this.points;
    var ls=this.lens;
    var ss=this.section(x);
    
    if      (ss==-1)        { return ps[0]; }
    else if (ss==ls.length) { return ps.past(); }
    else {
        return ps[ss].dir(ps[ss+1], x-ls[ss]);
    }
}


Polyline.prototype.mark=function(x,size0) {
    var ps=this.points;
    var ls=this.lens;
    var ss=this.section(x);
    var p=null;
    
    var size=size0||10;
    
    if (ss==-1 || ss==ls.length) {
        p=(ss==-1 ? ps[0] : ps.last());
        ss=(ss==-1 ? 0 : this.lens.length-2);
    }
    else {
        p=ps[ss].dir(ps[ss+1], x-ls[ss]);
    }
    
    var v=ps[ss].to(ps[ss+1]).normalized();
    return [p.dv(v.lnormal(size)), p.dv(v.rnormal(size))];
}

