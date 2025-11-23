/*
 * $Id: beanbag.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */




//f(x)=((x+42)/84)**2*50+40
//g(t)=f(r*cos(t/r))
//h(z)=g(r*asin(z/r))
//l(z)=g(r*(pi-asin(z/r)))

//plot 0,f(x),h(x),l(x)



function beanbag() {

    var draft={}

    draft.sizing={ 
        "r|Sugár" : 42,
        "front|Eleje magasság": 40,
        "back|Háta magasság": 90,
        "level|Belső elválasztó": 30,
        "margin|Varrásszélesség": 1,
    }


    draft.compose = function(size, msg) {    
        function f(x) { 
            var a=0.5*(x/size.r+1);
            return a*a*(size.back-size.front)+size.front;
        }
        
        
        function g(t) {
            return f(size.r*Math.cos(t/size.r));
        }
        
        
        function h(z) {
            return g(size.r*Math.asin(z/size.r));
        }
        
        
        function l(z) {
            return g(size.r*(Math.PI-Math.asin(z/size.r)));
        }

        
        // cylinder
        var w=Math.PI*size.r;
        var p0=new Coord();
        var p1=p0.dy(size.front);
        var p2=p0.dxy(w,size.back);
        var p3=p0.dx(w);
        var pts=[];
        var pts2=[];
        var m=30;
        var bx=size.margin*5;
        var pl=p0.dy(size.level);
        
        for (var i=0; i<=m; ++i) {
            var x1=w*i/(2*m);
            var x2=w*(i+m)/(2*m);
            pts.push(new Coord(x1, g(x1-w)));
            pts2.push(new Coord(bx+x2, g(x2-w)));
        }
        
        var poly1a=new Polyline([pts,p0.ax(pts.last()),p0,p1]);
        var poly1b=new Polyline([pts2,p3.dx(bx),p0.ax(pts2[0]),pts2[0]]);

        var pat1a=[MOVE, poly1a.leftOffset(size.margin)];
        var pat1ai=[MOVE, poly1a];
        
        var pat1b=[MOVE, poly1b.leftOffset(size.margin)];
        var pat1bi=[MOVE, poly1b];

        var pat1lev=[MOVE,pl,pl.dx(w/2), MOVE,pl.dx(w/2+bx),pl.dx(w+bx)];
        
        
        // bottom
        var p5=p0.dxy(-size.r-5*size.margin, size.r+5*size.margin);
        pts=[];
        m=80;
        for (i=0; i<=m; ++i) {
            var ang=i/m*180;
            var pp=p5.dv(polar(size.r, ang));
            pts.push(pp);
        }
        pts.push(pts[0]);
        var poly2=new Polyline(pts);
        var poly2m=poly2.rightOffset(size.margin);
        var pat2i=[MOVE, poly2];
        var pat2=[MOVE, poly2m];
        
        
        // top
        var p6=p0.dx(-size.margin*5);
        var s1=[];
        var x0=-size.r;
        var y0=f(x0);
        var ds=0;
        m=60;
        
        for (i=1; i<=m; ++i) {
            var ang=Math.PI*i/m;
            var xn=-Math.cos(ang);
            var x=xn*size.r;
            var y=f(x);
            var d=(new Coord(x0-x, y0-y)).norm();
            ds-=d;
            x0=x; y0=y;
            s1.push(p6.dxy(ds, Math.sin(Math.acos(xn))*size.r));
        }
        var poly3=new Polyline([p6,s1,p6]);
        var poly3m=poly3.rightOffset(size.margin);
        var pat3=[MOVE, poly3m];
        var pat3i=[MOVE, poly3];

        // marks
        
        var marks=[];
        function addMark(mk) {
            marks.push(MOVE);
            marks.extend(mk);
        }
        
        //msg("A "+poly1a.len(-4));
        //msg("B "+poly1b.len(-4));
        //msg("A+B "+(poly1a.len(-4)+poly1b.len(-4)));
        //msg("T "+poly3.len(-2));
        
        [0, poly1a.len(13), poly1a.len(22), poly1a.len(-4)].forEach(function(v) { 
            addMark(poly1a.mark(v)); 
            addMark(poly3.mark(v)); 
            //msg("B "+v);
        });
            
        [0, poly1b.len(10), poly1a.len(25), poly1b.len(-4)].forEach(function(v,i) { 
            addMark(poly1b.mark(v)); 
            //if (i>0) { 
                var h=(poly1b.len(-4)-v);
                //msg("H " +h);
                addMark(poly3.mark(poly3.len(-2)-h)); 
            //} 
        });
        
        [0, poly2.len(20), poly2.len(40), poly2.len(60), poly2.len(-2)].forEach(
            function(v,i) { 
                addMark(poly2.mark(v));
                var m=[];
                if (i<3) { addMark(poly1a.mark(v+poly1a.len(-3))); }
                if (i>1) { addMark(poly1b.mark(poly1b.len(-2)-(poly2.len(-2)-v))); }
                //m.forEach(function(p) { marks.push(p); marks.push(p.dy(size.level)); });
            });

        return [ 
            TOOL, "guide",
            pat1ai, pat1bi, pat2i, pat3i, pat1lev,
            marks,
            
            TOOL, "outline", 
            pat1a, pat1b, pat2, pat3, 
        ];
    }
    
    
    return draft;
}
