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
    this.box=new Bounds();
    if (c) {
        this.push(c);
    }
}


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
        this.box.extend(p);
    }
    else if (p instanceof Array) {
        for (var i=0; i<p.length; ++i) { this.push(p[i]); }
    }
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


Polyline.prototype.bounds=function() {
    return this.box;
}


Polyline.prototype.closest=function(p, dsnap) {
    var ps=this.points;
    var ls=this.lens;
    var plen=ps.length;
    
    if (plen>1) {
        var d=null, q=null, lx=0;
        
        if (dsnap!=null) {
            var p0=ps[0], p1=ps.last();
            var dp0=p.to(p0).norm();
            var dp1=p.to(p1).norm();
            if      (dp0<dsnap) { lx=0; d=dp0; q=p0.clone(); }
            else if (dp1<dsnap) { lx=ls.last(); d=dp1; q=p1.clone(); }
        }
        
        if (d==null) {
            for (var i=0; i<plen-1; ++i) {
                var p0=ps[i], p1=ps[i+1];
                var u=p0.to(p1);
                var v=u.lnormal();
                var pp0=p.to(p0);
                var li=lambda(v, pp0, u);
                if (li<0) { li=0; } 
                else if (li>1) { li=1; }
                
                var q0=p0.dv(u.mul(li));
                var d0=p.to(q0).norm();
                if (d==null || d0<d) {
                    q=q0; d=d0;
                    lx=ls[i]+li*u.norm();
                }
            }
        }
        
        var ll=lx/ls.last();
        return { "q": q, "x": lx, "l": ll, "d": d };
    }
}


Polyline.prototype.split=function(lambda) {
    var ps=this.points;
    var ls=this.lens;
    var plen=ps.length;

    if (plen>1) {
        var lx=lambda*ls.last();
        var i=0;
        var poly0=new Polyline(), poly1=new Polyline();
        
        poly0.push(ps[0]);
        for (i=1; i<plen-1 && ls[i]<lx; ++i) { poly0.push(ps[i]); }
        var li=(lx-ls[i-1])/(ls[i]-ls[i-1]);
        var pm=ps[i-1].mid(ps[i], li);
        poly0.push(pm);
        poly1.push(pm);
        if (ls[i]==lx) { ++i; }
        for (; i<plen; ++i) { poly1.push(ps[i]); }
        return [poly0, poly1];
    }
}


Polyline.prototype.plot=function(first) {
    return this.points;
}



Polyline.prototype.separate=function(p, v, L, R) {
    var ps=this.points;
    var pL=[], pR=[];
    var last=0;
    
    for (var i=0; i<ps.length; ++i) {
        var p0=ps[i];
        var q=p.to(p0);
        var side=cross(v,q).sgn();      // -1,0,1
        if (side==0) { side=1; }        // side=-1,1
        if (last==0) { last=side; }     // last=-1,1
        if (side!=last) {
            var p1=ps[i-1];
            var u=p0.to(p1);
            var l=lambda(v,q,u);
            var m=p0.mid(p1,l);
            pL.push(m);
            pR.push(m);
        }
        
        if (side==1) { pL.push(p0); }
        else { pR.push(p0); }
        last=side;
    }
        
    if (pL.length>0) { L.push(pR.length>0 ? new Polyline(pL) : this); }
    if (pR.length>0) { R.push(pL.length>0 ? new Polyline(pR) : this); }
}
