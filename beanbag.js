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
        
        
        function g(t) { return f(size.r*Math.cos(t/size.r)); }
        function h(z) { return g(size.r*Math.asin(z/size.r)); }
        function l(z) { return g(size.r*(Math.PI-Math.asin(z/size.r))); }

        
        // P1 - cylinder
        var w=Math.PI*size.r;
        var p0=new Coord();
        var p1=p0.dy(size.front);
        var p2=p0.dxy(w,size.back);
        var p3=p0.dx(w);
        var pts=[];
        var pts2=[];
        var m=30;
        var mx2=m*2;
        var bx=size.margin*5;
        var pl=p0.dy(size.level);
        
        for (var i=0; i<=m; ++i) {
            var x1=w*i/mx2;
            var x2=w*(i+m)/mx2;
            pts.push(new Coord(x1, g(x1-w)));
            pts2.push(new Coord(bx+x2, g(x2-w)));
        }

        var P1a=new Pattern();
        var P1b=new Pattern();

        P1a.setBase([MOVE, 
            TAG,"top", new Polyline(pts), 
            TAG,"mid", p0.ax(pts.last()), 
            TAG,"bottom", p0, 
            TAG,"front", p1]);
        P1a.setMargin(size.margin);
        P1a.midlines=[MOVE,pl,pl.dx(w/2)];

        P1b.setBase([MOVE, 
            TAG,"top", new Polyline(pts2), 
            TAG,"back",p3.dx(bx),
            TAG,"bottom",p0.ax(pts2[0]),
            TAG,"mid",pts2[0]]);
        P1b.setMargin(size.margin);
        P1b.midlines=[MOVE,pl.dx(w/2+bx),pl.dx(w+bx)];
        
        
        
        // P2 - bottom
        var p5=p0.dxy(-size.r-5*size.margin, size.r+5*size.margin);
        pts=[];
        m=80;
        for (i=0; i<=m; ++i) {
            var ang=i/m*180;
            var pp=p5.dv(polar(size.r, ang));
            pts.push(pp);
        }
        pts.push(pts[0]);
        pts.reverse();
        
        var poly2=new Polyline(pts);
        var P2=new Pattern();
        
        P2.setBase([MOVE,poly2]);
        P2.setMargin(size.margin);
        
        
        // P3 - top
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
        s1.reverse();
        
        var poly3=new Polyline([p6,s1,p6]);
        var P3=new Pattern();
        
        P3.setBase([MOVE, poly3]);
        P3.setMargin(size.margin);
       
        
        // marks
        //var marks=[];
        //function addMark(mk) {
            //marks.push(MOVE);
            //marks.extend(mk);
        //}
        
        //[0, poly1a.len(13), poly1a.len(22), poly1a.len(-4)].forEach(function(v) { 
            //addMark(poly1a.mark(v)); 
            //addMark(poly3.mark(v)); 
        //});
            
        //[0, poly1b.len(10), poly1a.len(25), poly1b.len(-4)].forEach(function(v,i) { 
            //addMark(poly1b.mark(v)); 
            //var h=(poly1b.len(-4)-v);
            //addMark(poly3.mark(poly3.len(-2)-h)); 
        //});
        
        //[0, poly2.len(20), poly2.len(40), poly2.len(60), poly2.len(-2)].forEach(
            //function(v,i) { 
                //addMark(poly2.mark(v));
                //var m=[];
                //if (i<3) { addMark(poly1a.mark(v+poly1a.len(-3))); }
                //if (i>1) { addMark(poly1b.mark(poly1b.len(-2)-(poly2.len(-2)-v))); }
            //});


        return [ P1a, P1b, P2, P3 ];
    }
    
    
    return draft;
}
