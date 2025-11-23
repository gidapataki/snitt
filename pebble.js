/*
 * $Id: pebble.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */



var Ellipsoid=Class({
    init: function(a,b,c) {
        this.a=a;
        this.b=b;
        this.c=c;
    },

    point: function(alfa,beta) { // (A,B) -> V
        var ca=Math.cos(alfa);
        var cb=Math.cos(beta);
        var sa=Math.sin(alfa);
        var sb=Math.sin(beta);
        return { x: this.a*ca*cb, y: this.b*sa*cb, z: this.c*sb };
    },

    basePoint: function(alfa,beta,v) { // (A,B,V) -> C
        var q=this.point(alfa,beta);
        var k=-q.z/v.z;
        return new Coord(q.x+k*v.x, q.y+k*v.y);
    },

    shellPoint: function(p,v) { // (C,V) -> V
        function sqr(x) { return x*x; }
        
        var a2=sqr(this.a), b2=sqr(this.b), c2=sqr(this.c);
        var A=sqr(v.x)/a2+sqr(v.y)/b2+sqr(v.z)/c2;
        var B=2*(v.x*p.x/a2+v.y*p.y/b2);
        var C=sqr(p.x)/a2+sqr(p.y)/b2-1;
        
        var k=(-B+Math.sqrt(B*B-4*A*C))/(2*A);
        return { x: p.x+v.x*k, y: p.y+v.y*k, z: v.z*k };
    },

    normal: function(alfa,beta) { // (A,B) -> Vn
        var p=this.point(alfa,beta);
        var a=this.a, b=this.b, c=this.c;
        var v={ x: p.x/(a*a), y: p.y/(b*b), z: p.z/(c*c) };
        var n=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
        return { x: v.x/n, y: v.y/n, z: v.z/n };
    },

    distance: function(a0,b0,a1,b1) { // (A,B,A2,B2) -> float
        function dP(p,q) {
            var dx=p.x-q.x, dy=p.y-q.y, dz=p.z-q.z;
            return Math.sqrt(dx*dx+dy*dy+dz*dz);
        }
        function mid(p,q,r) { return p*(1-r)+q*r; }

        var res=60;
        var dst=0;
        var p0=this.point(a0,b0);
        
        for (var i=1; i<=res; ++i) {
            var rr=i/res;
            var p1=this.point(mid(a0,a1,rr), mid(b0,b1,rr));
            dst+=dP(p0,p1);
            p0=p1;
        }
        
        return dst;
    },

    distance2: function(a0,b0,a1,b1,v) { // (A,B,A2,B2,V) -> float
        function dP(p,q) {
            var dx=p.x-q.x, dy=p.y-q.y, dz=p.z-q.z;
            return Math.sqrt(dx*dx+dy*dy+dz*dz);
        }
        
        var res=120;
        var dst=0;
        var p0=this.basePoint(a0,b0,v);
        var p1=this.basePoint(a1,b1,v);
        var sp=this.shellPoint(p0,v);
        for (var i=1; i<=res; ++i) {
            var sq=this.shellPoint(p0.mid(p1,i/res),v);
            dst+=dP(sp,sq);
            sp=sq;
        }    
        
        return dst;
    },

    projection: function(alfa,beta,rv) { // (A,B,R) -> C
        var p=Ellipsoid.rotate3d(this.point(alfa,beta), rv);
        return new Coord(p.x, p.y);
    },

    dstProjection: function(a0,b0,a1,b1,v) { // (A,B,A2,B2,V) -> C
        var rv=Ellipsoid.rotationMatrix(v);
        var c=this.projection(a0,b0,rv);
        var p=this.projection(a1,b1,rv);
        var dst=this.distance(a0,b0,a1,b1);
        return c.dir(p, dst);
    },

    dstProjection2: function(a0,b0,a1,b1,v) { // (A,B,A2,B2,V) -> C
        var rv=Ellipsoid.rotationMatrix(v);
        var c=this.projection(a0,b0,rv);
        var p=this.projection(a1,b1,rv);
        var dst=this.distance2(a0,b0,a1,b1,v);
        return c.dir(p, dst);
    },

    static: {
        rotationMatrix: function(v) { // (Vn) -> R
            var vz0=new Coord(v.x, -v.y);
            var vy=(new Coord(v.z, -vz0.norm())).normalized();
            var vz=(vz0.norm()>0 ? vz0.normalized() : new Coord(1,0));
            return { 
                x: { x: vz.x*vy.x, y: -vz.y*vy.x, z: vy.y },
                y: { x: vz.y, y: vz.x, z: 0 },
                z: { x: -vz.x*vy.y, y: vz.y*vy.y, z: vy.x },
            };
        },
        
        rotate3d: function(u, rv) {
            return {
                x: u.x*rv.x.x+u.y*rv.x.y+u.z*rv.x.z,
                y: u.x*rv.y.x+u.y*rv.y.y+u.z*rv.y.z,
                z: u.x*rv.z.x+u.y*rv.z.y+u.z*rv.z.z,
            };
        }
    },
});


function quadrant(ra,rb,rc,quad,dst) {
    var e=new Ellipsoid(ra,rb,rc);
    
    var res=60;
    var A0=0, A1=Math.PI/4, A2=Math.PI/2;
    var EA=Math.PI/4;
    var EB=Math.asin(1/Math.sqrt(3));
    var en=e.normal(EA, EB);
    
    var B=[],R=[],L=[];
    
    var quadAlign=(quad==1 || quad==3 
        ? function(p) { return p.conjugated(); }
        : function(p) { return p; }
    );
    
    for (var i=0; i<=res; ++i) {
        var u=i/res;
        var ang=A2*u;
        L.push(quadAlign(e.dstProjection2(EA,EB,0,A2-ang,en)));
        B.push(quadAlign(e.dstProjection2(EA,EB,ang,0,en)));
        R.push(quadAlign(e.dstProjection2(EA,EB,A2,ang,en)));
    }


    var v0=L[0].to(L[1]);
    var d=L[0].neg();
    var dd=polar(dst,45+quad*90);
    var v=v0.normalized().conjugated();
    var S=[L,B,R];
    var poly=[new Polyline(), new Polyline(), new Polyline()];
    
    if (quad==1 || quad==2) { v=v.neg(); }
    var rev=(quad==0 || quad==2);
    
    for (var j=0; j<S.length; ++j) {
        var sjlen=S[j].length;
        for (var i=0; i<sjlen; ++i) {
            poly[j].push(S[j][(rev?sjlen-1-i:i)].dv(d).rotated(v).dv(dd));
        }
    }
    if (rev) { poly.reverse(); }
    return { "poly": poly };
}


function octant(ra,rb,rc,eb) {
    var e=new Ellipsoid(ra,rb,rc);
    
    var res=60;
    var A0=0, A45=Math.PI/4, A90=Math.PI/2;
    var EA=0;
    var EB=eb; //Math.asin(1/Math.sqrt(3));
    var en=e.normal(EA, EB);
    var d1=e.distance(A45,A90,A45,A0);
    var d2=e.distance(A0,A0,A45,A0);
    
    var P=[];
    var F=[
        function(u) { return {a: A45, b: A90*(1-u)}; },
        function(u) { return {a: A45*(1-u), b: 0}; },
        function(u) { return {a: 0, b: A90*u}; },
    ];
    
    for (var i=0; i<F.length; ++i) {
        var poly=new Polyline();
        var func=F[i];
        for (var j=0; j<=res; ++j) {
            var loc=func(j/res);
            poly.push(e.dstProjection2(EA,EB,loc.a,loc.b,en));
        }
        P.push(poly);
    }
    return { poly: P, diag: d1, circ: d2 };
}



function arclen(ra, rb) {
    var res=60;
    var p=new Coord(ra,0);
    var s=0;
    
    for (var i=1; i<=res; ++i) {
        var ang=Math.PI/2*i/res;
        var q=new Coord(Math.cos(ang)*ra, Math.sin(ang)*rb);
        s+=p.to(q).norm();
        p=q;
    }
    
    return s;
}



// Cornercut ///////////////////////////////////////////////////////////////////

function cornercut() {
    var draft={};
    
    draft.sizing={
        "ra|Radius A & B|Méretek": 10,
        "rc|Radius C": 10,
        "eb:angle|Beta (deg)": 35.26,
        "margin:mm|Varrásszélesség (mm)": 0,
    };
    
    
    draft.compose=function(size, msg) {
        var cut=octant(size.ra, size.ra, size.rc, size.eb);
        var P=new Pattern();
        
        P.setBase([MOVE,cut.poly]);
        P.setMargin(size.margin);
        var v=[cut.poly[0].len(),cut.poly[1].len(), cut.diag, cut.circ];
        for (var i=0; i<4; ++i) { v[i]=v[i].toFixed(2); }
        
        console.log("top: "+v[0]+" ("+v[2]+")  left: "+v[1]+" ("+v[3]+")");
        return [P];
    }
    
    return draft;
}



// Pebble //////////////////////////////////////////////////////////////////////

function pebble() {
    var draft={};


    draft.sizing={
        "a|Főátló|Méretek": 50,
        "b|Mellékátló": 40,
        "h|Vastagság": 20,
        "margin|Varrásszélesség": 1,
        "tag:string|Név": "peb#1",
        "au:ratio|Felső osztás (%)|Arányok": 57,
        "al:ratio|Alsó osztás (%)": 51,
        "bu:ratio|Függőleges osztás (%)": 58,
        "hu:ratio|Vastagság osztás (%)": 56,
        "cs:bool|Keresztmetszet|Nézet": false,
    };


    draft.compose=function(size, msg) {

        if (size.cs) {
            // CROSS-SECTION
            function crossSection(p, a, b, au, al, bu) {
                var res=60;
                var Q=Math.PI/2;
                var c=[p.dx((au-0.5)*a),  p.dx((al-0.5)*a)];
                var r=[[a*(1-au), b*bu], [a*au, b*bu], [a*al, b*(1-bu)], [a*(1-al), b*(1-bu)]];
                var poly=[[],[],[],[]];
                
                for (var i=0; i<=res; ++i) {
                    var ang=(i/res)*Q;
                    for (var j=0; j<4; ++j) {
                        var angj=ang+j*Q;
                        poly[j].push(c[j.div(2)].dxy(Math.cos(angj)*r[j][0], Math.sin(angj)*r[j][1]));
                    }
                }
                
                var axes=[MOVE, p.dx(-a/2), p.dx(a/2), MOVE, c[0], c[0].dy(b*bu), MOVE, c[1], c[1].dy(-b*(1-bu))];
                return { "poly": new Polyline(poly), "axes": axes};
            }
        
            var p0=new Coord(0,0);
            var d=50;
            var cs1=crossSection(p0, size.a, size.b, size.au, size.al, size.bu);
            var cs2=crossSection(p0.dx((size.a+size.h)/2+d), size.h, size.b, 1-size.hu, 1-size.hu, size.bu);
            var cs3=crossSection(p0.dy(-size.b*(1-size.bu)-size.h*size.hu-d), size.a, size.h, size.al, size.al, size.hu);
            var cs4=crossSection(p0.dy(-size.b*(1-size.bu)-size.h*size.hu-d), size.a, size.h, size.au, size.au, size.hu);

            return [
                TOOL,"guide",
                cs1.axes,
                cs2.axes,
                cs3.axes,
                cs4.axes,
                MOVE,cs3.poly,
                
                TOOL,"outline",
                MOVE,cs1.poly, BREAK,
                MOVE,cs2.poly, BREAK,
                MOVE,cs4.poly, BREAK,
            ];
        }
        else {
            // PATTERN 
            var hu=size.h*size.hu, hl=size.h*(1-size.hu);
            var a0=size.a*(1-size.au), a1=size.a*size.au, a2=size.a*size.al, a3=size.a*(1-size.al);
            var bu=size.b*size.bu, bl=size.b*(1-size.bu);
            var dst=2*size.margin;
            var U="U", L="L";
            var quadrant2=function(a,b,c,t,q) { var E=quadrant(a,b,c,q,dst); E.quad=q; E.tag=t; return E; }
            var e0=quadrant2(a1,bu,hu,U,0);
            var e1=quadrant2(a0,bu,hu,U,1);
            var e2=quadrant2(a3,bl,hu,U,2);
            var e3=quadrant2(a2,bl,hu,U,3);

            var e0l=quadrant2(a0,bu,hl,L,0);
            var e1l=quadrant2(a1,bu,hl,L,1);
            var e2l=quadrant2(a2,bl,hl,L,2);
            var e3l=quadrant2(a3,bl,hl,L,3);

            function leaf(E) {
                var q=E.quad;
                var p0=polar(dst, 45+q*90);
                var p1=p0.dv(polar(Math.sqrt(2)*10,45+q*90));
                var p2=p1.dx((p1.x-p0.x)*1.5);
                var fs=10;
                var v=new Coord(fs, 0);
                var str=size.tag+"-"+E.tag+q;
                var tp=p1.dy((p1.y-p0.y).sgn()*5);
                var label=makeText(tp, v, str, (q==1||q==2?Align.RIGHT:Align.LEFT) | (q>1?Align.TOP:Align.BOTTOM));
                
                var leafP=new Pattern();
                
                leafP.setBase([MOVE, E.poly]);
                leafP.setMargin(size.margin);
                leafP.midlines=[MOVE,p0,p1,p2,label,];
                
                return leafP;
            }


            var upper=[ leaf(e0), leaf(e1), leaf(e2), leaf(e3), ];
            var lower=[ leaf(e0l), leaf(e1l), leaf(e2l), leaf(e3l) ];
            var ubox=getBounds(upper);
            var lbox=getBounds(lower);
            var off=new Coord(20+ubox.hi.x-lbox.lo.x, 0);
            for (var i=0; i<lower.length; ++i) { lower[i].setPos(off); }

            return upper.concat(lower);
        }
    }


    return draft;
}



