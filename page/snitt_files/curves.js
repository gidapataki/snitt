/*
 * $Id: curves.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


// Curve 

var Curve=function(p0, p1, p2) {
    // X(t) = A + B*t + C*t^2
    var A=p0;
    var B=p0.to(p1).mul(2);
    var C=p1.to(p0).dv(p1.to(p2));
    var a=B.dot(B);
    var b=4*B.dot(C);
    var c=4*C.dot(C);

    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.a = a;
    this.b = b;
    this.c = c;
    
    this._len=this.section(0, 1);
}


Curve.prototype.integral=function(t) {
    var a=this.a, b=this.b, c=this.c;
    return (2*c*t+b)*Math.sqrt(a+b*t+c*t*t)/(4*c) + Math.log(2*Math.sqrt(c)*Math.sqrt(a+b*t+c*t*t) + 2*c*t + b) * (4*a*c-b*b)/(8*c*Math.sqrt(c));
}


Curve.prototype.tangent=function(t) {
    var B=this.p0.to(this.p1).mul(2);
    var C=this.p1.to(this.p0).dv(this.p1.to(this.p2));
    return B.dv(C.mul(2*t));
}


Curve.prototype.deriv=function(t) {
    return Math.sqrt(this.a+this.b*t+this.c*t*t);
}


Curve.prototype.bounds=function() {
    var box=new Bounds();
    box.extend(this.p0);
    box.extend(this.p1);
    box.extend(this.p2);
    
    return box;
}


Curve.prototype.section=function(t0, t1) {
    return this.integral(t1)-this.integral(t0);
}


Curve.prototype.mid=function(lambda) {
    return this.tmid(this.t(lambda*this.len()));
}


Curve.prototype.tmid=function(t) {
    var pt0=this.p0.mid(this.p1, t);
    var pt1=this.p1.mid(this.p2, t);
    var pt=pt0.mid(pt1, t);
    return pt;
}


Curve.prototype.t=function(x) {
    var eps=0.01;
    var i0=this.integral(0);
    var ii = this.integral;
    var f=function(tn) {
        return ii(tn)-i0-x;    
    }

    var ti = 0.5;
    var fti = 1;
    while (Math.abs(fti)>eps) {
        fti=(this.integral(ti)-i0-x);
        ti=ti-fti/this.deriv(ti);
    }
    return ti;    
}


Curve.prototype.len=function() {
    return this._len;
}


Curve.prototype.split=function(lambda) {
    return this.tsplit(this.t(lambda*this.len()));
}


Curve.prototype.tsplit=function(t) {
    var pt0=this.p0.mid(this.p1, t);
    var pt1=this.p1.mid(this.p2, t);
    var pt=pt0.mid(pt1, t);
    return [new Curve(this.p0, pt0, pt), new Curve(pt, pt1, this.p2)];
}


Curve.prototype.dv=function(v) {
    return new Curve(this.p0.dv(v), this.p1.dv(v), this.p2.dv(v));
}


Curve.prototype.rotated=function(v) {
    var p01=this.p0.to(this.p1).rotated(v);
    var p02=this.p0.to(this.p2).rotated(v);
    return new Curve(this.p0, this.p0.dv(p01), this.p0.dv(p02));
}


Curve.prototype.mirrored=function(v) {
    var vn=v.normalized();
    var vnc=vn.conjugated();
    var p01=this.p0.to(this.p1).rotated(vnc).conjugated().rotated(vn);
    var p02=this.p0.to(this.p2).rotated(vnc).conjugated().rotated(vn);
    return new Curve(this.p0, this.p0.dv(p01), this.p0.dv(p02));    
}


Curve.prototype.reversed=function() {
    return new Curve(this.p2, this.p1, this.p0);
}


Curve.prototype.closest=function(p, dsnap) {
    var p0=this.p0, p1=this.p1, p2=this.p2;
    var t=null;
    var q=null;
    var d=null;
    
    if (dsnap!=null) {
        var dp0=p.to(p0).norm();
        var dp2=p.to(p2).norm();
        if (dp0<dsnap)      { t=0; d=0; q=p0.clone(); }
        else if (dp2<dsnap) { t=1; d=0; q=p2.clone(); }
    }
    
    if (t==null) {
        var A=p.to(p0);
        var B=p0.to(p1).mul(2);
        var C=p1.to(p0).dv(p1.to(p2));

        function Y(t)   { return A.dv(B.mul(t)).dv(C.mul(t*t)); }
        function Yd(t)  { return B.dv(C.mul(2*t)); }
        function Ydd(t) { return C.mul(2); }

        function next(t) {
            var Yt=Y(t);
            var Ydt=Yd(t);
            var Yddt=Ydd(t);
            var d1=2*Yt.dot(Ydt);
            var d2=2*(Ydt.dot(Ydt)+Yt.dot(Yddt));
            return (d2!=0 ? t-d1/d2 : t);
        }

        var conv=true;
        var t0=0.5;
        var eps=1/(1<<20);

        while (conv) {
            var t1=next(t0);
            conv=Math.abs(t0-t1)>eps;
            t0=t1;
        }
        
        t=(t0<0 ? 0 : (t0>1 ? 1 : t0));
        q=this.tmid(t);
        d=p.to(q).norm();
    }
    
    var tlen=this.section(0,t);
    var lamb=tlen/this.len();
    
    return { "l": lamb, "x": tlen, "q": q, "d": d };
}



Curve.prototype.intersectL=function(p, q) {
    var u=p;
    var v=p.to(q).normalized();
    var a=this.p1.to(this.p0).dv(this.p1.to(this.p2));
    var b=this.p0.to(this.p1).mul(2);
    var c=this.p0;
    var r1=1;
    var r2=1;

    if (v.x!=0) { r1=-v.y/v.x; }
    else { r2=-v.x/v.y; }

    var t=solve(a.x*r1+a.y*r2, b.x*r1+b.y*r2, (c.x-u.x)*r1+(c.y-u.y)*r2);
    var tx=[];
    
    if (t) {
        if (t[0]>=0 && t[0]<=1) { tx.push(t[0]); }
        if (t[1]>=0 && t[1]<=1 && t[1]!=t[0]) { tx.push(t[1]); }
    }   

    return tx;
}


Curve.prototype.scanline=function(y) {
    var ts=this.intersectL(new Coord(0,y), new Coord(1,y));
    var xs=[];
    for (var i=0; i<ts.length; ++i) { xs.push(this.tmid(ts[i]).x); }

    return xs;
}


Curve.prototype.plot=function(first) {
    if (first)  { return [ this.p0, CURVE, this.p1, this.p2 ]; }
    else        { return [ CURVE, this.p1, this.p2 ]; }
}


function offCurve(p,p0,p1,q,m,d) {
    // p->p0 és p1->q a kezdő és vége iránya
    // m (0..1) -nél van a két ív találkozása
    // d - ennyivel állunk el a közepénél

    var v=p0.to(p1).lnormal(d);
    var p0v=p0.dv(v);
    var p1v=p1.dv(v);
    var pm=p0.mid(p1, m);
    var pd=pm.dv(v);
    var p0c=p.intersectLL(p0,p0v,pd);
    var p1c=pd.intersectLL(p1v,p1,q);
    
    return { "first": new Curve(p0,p0c,pd), "second": new Curve(pd,p1c,p1), "off": pd, "mid": pm };

}


function inflexion(p,p0,p1,q,m,d) {
    // p->p0 és p1->q a kezdő és vége iránya
    // m (0..1) -nél van az inflexiós pont
    // d - ennyivel állunk el a közepénél

    var c0=cross(p.to(p0),p0.to(p1)).sgn();
    var c1=cross(p0.to(p1),p1.to(q)).sgn();
    
    if (c0*c1>=0) { d=0; }
    else { d=Math.abs(d)*c1; }
    
    var ph=p0.mid(p1, 0.5);
    var pm=p0.mid(p1, m);
    var pd=p1.to(p0.to(p1).lnormal(d).dv(ph)).dv(pm);
    var p0c=p.intersectLL(p0,pd,pm);
    var p1c=q.intersectLL(p1,pd,pm);

    return { "first": new Curve(p0,p0c,pm), "second": new Curve(pm,p1c,p1), "mid": pm, "off": pd };
}


function bending(p,p0,p1,r) {
    // p->p0 a kezdő irány
    // r - ennyivel állunk el p0-nál
    
    var c0=cross(p.to(p0),p0.to(p1)).sgn();
    
    var p0i=p0.intersectCC(r, p1, p0.to(p1).norm());
    var pr=(c0<0 ? p0i.left : p0i.right);
    var p0c=p.intersectLL(p0,pr,p1);
    
    return { "curve": new Curve(p0,p0c,p1), "off": pr };
}


function smoothing(p,p0,p1,m,r) {
    // p->p0, p0->p1 a kezdő és vége iránya
    // m (0..1) - 
    // r - ennyivel állunk el a p0-nál

    var lx=p0.to(p1).norm()*(1-m)/2;
    var c0=cross(p.to(p0),p0.to(p1)).sgn();
    var p0i=p0.intersectCC(r, p1, p0.to(p1).norm());
    var pr=(c0<0 ? p0i.left : p0i.right);
    var p1c=p1.dir(p0, lx);
    var pd=p1.to(pr).dv(p1c);
    
    var p0c=p.intersectLL(p0, p1c, pd);
    var pm=p1c.dir(p0c, lx);
    
    return { "first": new Curve(p0,p0c,pm), "second": new Curve(pm,p1c,p1), "mid": pm, "off": pd };
}


function tulip(p0,p1,m,d) {
    var ph=p0.mid(p1, 0.5);
    var pd0=p0.to(p1).lnormal(d).dv(ph);
    var pd1=p0.to(p1).rnormal(d).dv(ph);
    var pm=p0.mid(p1,m);
    var p0c=p0.mid(pd0,m);
    var p1c=p1.mid(pd1,1-m);
    return { "first": new Curve(p0,p0c,pm), "second": new Curve(pm,p1c,p1), "mid": pm, "off": pd0 };
}



// Draft

function curves() {
    var draft={}

    draft.sizing={
        "t": 0.5,
        "x": 10,
        "alpha": 45,
    }


    draft.compose=function(size, msg) {
        var p0=new Coord(200,0);
        var p1=new Coord(0,10);
        var p2=new Coord(50,180);
        var pc=new Coord(10,210);

        var t=size.t/10;
        var x=size.x/10;
        var alpha=size.alpha/10;
        
        var q0=p1;
        var q1=q0.dv(polar(200, alpha));
        
        var cc=new Curve(p0,p1,p2);
        var dc=cc.tsplit(t)[0];
        var pt=cc.tmid(t);
        var L=cc.section(0,t);
        var tx=cc.t(x);
        var px=cc.tmid(tx);

        var m1=pt.dxy(-50, 50);
        var m0=pt.dxy(50, -50);
        
        var ctp=cc.closest(pc).q;
        
                
        var s0=new Coord(0, -10);
        var s1=s0.dx(L);
        var x0=new Coord(0, -20);
        var x1=x0.dx(x);

        var dp0=dc.p0.dxy(-10,10);
        var dp1=dc.p1.dxy(-10,10);
        var dp2=dc.p2.dxy(-10,10);
        var tg=cc.tangent(t).normalized(10).lnormal().dv(pt);

        var ts=cc.intersectL(q0, q1);
        var ps=[];
        for (var i=0; i<ts.length; ++i) { ps.push(cc.tmid(ts[i])); }
        
        var P=new Pattern();
        P.setBase([MOVE, p0, CURVE, p1, p2, p0]);
        P.setMargin(10);
        
        P.midlines=[
            MARK, pc, 5,
            MARK, ps, 5,
            MOVE, pc,ctp,
            MOVE, s0, s1,
            MOVE, x0, x1,
            MOVE, pt, tg,
        ];
        P.guides=[
            MOVE, p0, p1, p2,
            MOVE, q0, q1,
        ];

       
        return [ P ];
    }
 
    return draft;
}    


