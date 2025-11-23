/*
 * $Id: pebble.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */



var Ellipsoid=function(a,b,c) {
    this.a=a;
    this.b=b;
    this.c=c;
    this.rv=this.rotationMatrix({x:0,y:0,z:1});
}


Ellipsoid.prototype.point=function(alfa,beta) {
    var ca=Math.cos(alfa);
    var cb=Math.cos(beta);
    var sa=Math.sin(alfa);
    var sb=Math.sin(beta);
    return { x: this.a*ca*cb, y: this.b*sa*cb, z: this.c*sb };
}


Ellipsoid.prototype.basePoint=function(alfa,beta,v) {
    var q=this.point(alfa,beta);
    var k=-q.z/v.z;
    return new Coord(q.x+k*v.x, q.y+k*v.y);
}


Ellipsoid.prototype.shellPoint=function(p,v) {
    function sqr(x) { return x*x; }
    
    var a2=sqr(this.a), b2=sqr(this.b), c2=sqr(this.c);
    var A=sqr(v.x)/a2+sqr(v.y)/b2+sqr(v.z)/c2;
    var B=2*(v.x*p.x/a2+v.y*p.y/b2);
    var C=sqr(p.x)/a2+sqr(p.y)/b2-1;
    
    var k=(-B+Math.sqrt(B*B-4*A*C))/(2*A);
    return { x: p.x+v.x*k, y: p.y+v.y*k, z: v.z*k };
}


Ellipsoid.prototype.normal=function(alfa,beta) {
    var p=this.point(alfa,beta);
    var a=this.a, b=this.b, c=this.c;
    var v={ x: p.x/(a*a), y: p.y/(b*b), z: p.z/(c*c) };
    var n=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
    return { x: v.x/n, y: v.y/n, z: v.z/n };
}


Ellipsoid.prototype.normal2=function(a0,a1) {
    function d3(p,q) {
        return { x:q.x-p.x, y:q.y-p.y, z:q.z-p.z };
    }

    var b0=0, b1=Math.PI/2;
    var p0=this.point(a0,b0);
    var p1=this.point(a1,b0);
    var p2=this.point(a0,b1);
    var u=d3(p0,p1);
    var v=d3(p0,p2);
    var w={ x:u.y*v.z-u.z*v.y, y: u.z*v.x-u.x*v.z, z:u.x*v.y-u.y*v.x };
    var n=Math.sqrt(w.x*w.x+w.y*w.y+w.z*w.z);

    return { x: w.x/n, y: w.y/n, z: w.z/n };
}



Ellipsoid.prototype.topmost=function(A0,A1) {
    var B0=0, B1=Math.PI/2;
    var a=(A0+A1)/2;
    var b=(B0+B1)/2;
    var p=this.elevation(a,b);
    var d=Math.PI/360;
    var top=false;

    while (!top) {
        var a0=a, b0=b;
        var pal=this.elevation(a0-d,b0);
        var pah=this.elevation(a0+d,b0);
        var pbl=this.elevation(a0,b0-d);
        var pbh=this.elevation(a0,b0+d);
        
        top=true;
        
        if (pal>p) { top=false; p=pal; a=a0-d; b=b0; }
        if (pah>p) { top=false; p=pah; a=a0+d; b=b0; }
        if (pbl>p) { top=false; p=pbl; a=a0; b=b0-d; }
        if (pbh>p) { top=false; p=pbh; a=a0; b=b0+d; }
    }
    return { alfa: a, beta: b };
}



Ellipsoid.prototype.distance=function(a0,b0,a1,b1) {
    function dP(p,q) {
        var dx=p.x-q.x, dy=p.y-q.y, dz=p.z-q.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
    }
    
    function mid(p,q,r) {
        return p*(1-r)+q*r;
    }

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
}



Ellipsoid.prototype.distance2=function(a0,b0,a1,b1,v) {
    function dP(p,q) {
        var dx=p.x-q.x, dy=p.y-q.y, dz=p.z-q.z;
        return Math.sqrt(dx*dx+dy*dy+dz*dz);
    }

    var res=60;
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
}



Ellipsoid.prototype.setRotation=function(v) {
    this.rv=this.rotationMatrix(v);
}


Ellipsoid.prototype.projection=function(alfa, beta) {
    var p=this.rotate3d(this.point(alfa,beta), this.rv);
    return new Coord(p.x, p.y);
}


Ellipsoid.prototype.elevation=function(alfa, beta) {
    var p=this.rotate3d(this.point(alfa,beta), this.rv);
    return p.z;
}


Ellipsoid.prototype.dstProjection=function(a0,b0,a1,b1) {
    var c=this.projection(a0,b0);
    var p=this.projection(a1,b1);
    var dst=this.distance(a0,b0,a1,b1);
    return c.dir(p, dst);
}


Ellipsoid.prototype.dstProjection2=function(a0,b0,a1,b1,v) {
    var c=this.projection(a0,b0);
    var p=this.projection(a1,b1);
    var dst=this.distance2(a0,b0,a1,b1,v);
    return c.dir(p, dst);
}


Ellipsoid.prototype.test=function() {
    var a90=Math.PI/2;
    var a45=a90/2;
    var p0=this.rotate3d(this.point(0,0), this.rv);
    var p1=this.rotate3d(this.point(a90,0), this.rv);
    var p2=this.rotate3d(this.point(a90,a90), this.rv);
    var p3=this.rotate3d(this.point(0,a90), this.rv);
    var p4=this.rotate3d(this.point(a45,0), this.rv);
    console.log(p0);
    console.log(p1);
    console.log(p2);
    console.log(p3);
    console.log(p4);
}


Ellipsoid.prototype.rotationMatrix=function(v) {
    var vz0=new Coord(v.x, -v.y);
    var vy=(new Coord(v.z, -vz0.norm())).normalized();
    var vz=(vz0.norm()>0 ? vz0.normalized() : new Coord(1,0));
    return { 
        x: { x: vz.x*vy.x, y: -vz.y*vy.x, z: vy.y },
        y: { x: vz.y, y: vz.x, z: 0 },
        z: { x: -vz.x*vy.y, y: vz.y*vy.y, z: vy.x },
    };
}


Ellipsoid.prototype.rotate3d=function(u, rv) {
    return {
        x: u.x*rv.x.x+u.y*rv.x.y+u.z*rv.x.z,
        y: u.x*rv.y.x+u.y*rv.y.y+u.z*rv.y.z,
        z: u.x*rv.z.x+u.y*rv.z.y+u.z*rv.z.z,
    };
}


function quadrant(ra,rb,rc,quad,dst) {
    var e=new Ellipsoid(ra,rb,rc);
    
    var res=60;
    var A0=0, A1=Math.PI/4, A2=Math.PI/2;
    var EA=Math.PI/4;
    var EB=Math.asin(1/Math.sqrt(3));
    var en=e.normal(EA, EB);
    
    e.setRotation(en);
    var ep=e.projection(EA, EB);
    var B=[],R=[],L=[];
    
    var quadAlign=(quad==1 || quad==3 
        ? function(p) { return p.conjugated(); }
        : function(p) { return p; }
    );
    
    for (var i=0; i<=res; ++i) {
        var u=i/res;
        var ang=A2*u;
        B.push(quadAlign(e.dstProjection2(EA,EB,ang,0,en)));
        R.push(quadAlign(e.dstProjection2(EA,EB,A2,ang,en)));
        L.push(quadAlign(e.dstProjection2(EA,EB,0,A2-ang,en)));
    }

    R.pop();
    var v0=L[0].to(L[1]);
    var d=L[0].neg();
    var dd=polar(dst,45+quad*90);
    var v=v0.normalized().conjugated();
    var poly0=B.concat(R,L);
    var poly1=[];

    if (quad==1 || quad==2) { v=v.neg(); }
    if (quad==1 || quad==3) { poly0.reverse(); }

    for (var i=0; i<poly0.length; ++i) {
        poly1.push(poly0[i].dv(d).rotated(v).dv(dd));
    }

    return { "poly": new Polyline(poly1) };
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
            
            function major(E) { var v=(E.quad==1 || E.quad==3 ? 120 : 0); return E.poly.len(v,v+60); }
            function minor(E) { return E.poly.len(60,120); }
            function circum(E) { var v=(E.quad==1 || E.quad==3 ? 0 : 120); return E.poly.len(v,v+60); }



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

                var corn=[E.poly.points[0], E.poly.points[60], E.poly.points[120]];
                var lx=[major(E), minor(E), circum(E)];
                var cp=corn[0].dv(corn[1]).dv(corn[2]).mul(1/3);
                var metrics=makeText(cp, v, lx.map(Math.round).join("\n"), Align.MIDDLE|Align.CENTER);
                
                return [ GROUP, [ 
                    TOOL,"outline",MOVE,E.poly.rightOffset(size.margin),
                    TOOL,"sewline",MOVE,E.poly,
                    TOOL,"midline",MOVE,p0,p1,p2, label,
                ]];
            }


            var upper=[ leaf(e0), leaf(e1), leaf(e2), leaf(e3), ];
            var lower=[ leaf(e0l), leaf(e1l), leaf(e2l), leaf(e3l) ];
            var ubox=getBounds(upper);
            var lbox=getBounds(lower);
            var dx=20+ubox.hi.x-lbox.lo.x;
            

            return [
                upper, OFFSET, new Coord(dx,0), lower,
            ];
        }
    }


    return draft;

}



