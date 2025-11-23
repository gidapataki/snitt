/*
 * $Id: pattern.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


// Mark ////////////////////////////////////////////////////////////////////////

var Mark=function(p,t) {
    this.p=p.clone();
    this.t=t.clone();
}


Mark.prototype.p=null;
Mark.prototype.t=null;


Mark.prototype.plot=function() {
    var p=this.p;
    var d=this.t.lnormal(1);
    
    return [MOVE, this.p.dv(d.mul(1)), this.p.dv(d.mul(-7))];
}



// Path ////////////////////////////////////////////////////////////////////////

var Path=function() {
    this.elements=[];
}


Path.prototype.push=function(e) {
    this.elements.push(e);
}


Path.prototype.len=function(n,m) {
    var size=this.elements.length;
    var es=this.elements;
    var b=0, e=size;
    var l=0;

    if (m==undefined) { if (n!=undefined) { e=n; } }
    else { b=n, e=m; }
    
    while (b<0) { b+=size; }
    while (e<0) { e+=size; }
    if (e>size) { e=size; }
    
    for (var i=b; i<e; ++i) { l+=es[i].len(); }
    return l;
}



// TagPath /////////////////////////////////////////////////////////////////////

var TagPath=function(pattern, b, e) {
    this.pattern=pattern;
    this.path=pattern.basepath;
    this.begin=b;
    this.end=e;
}


TagPath.prototype.len=function() {
    return this.path.len(this.begin, this.end);
}


TagPath.prototype.addMarks=function(ls) {
    var b=this.begin, e=this.end;
    var es=this.path.elements;
    var len0=this.path.len(b);
}



// Pattern /////////////////////////////////////////////////////////////////////

var Pattern=function(pos) {
    this.pos=pos || new Coord(0, 0);
    this.tags={};
    this.basepath=new Path();
    this.base=[];
    
    this.margin=[];
    this.guides=[];
    this.slimmers=[];
    this.midlines=[];
    this.marks=[];
    this._len=0;
}


Pattern.prototype.setPos=function(pos) {
    this.pos=pos;
}


Pattern.prototype.len=function() {
    return this._len;
}


Pattern.prototype.setBase=function(base) {
    this.base=base;
    this.path=[];
    this._len=0;
    (new Plotter(new PatternContext(this))).plot(base);
}


Pattern.prototype.setMargin=function(d) {
    var ls=[];
    (new Plotter(new PolylineContext(ls))).plot(this.base);

    this.margin=[];
    for (var i=0; i<ls.length; ++i) { this.margin.push(MOVE); this.margin.push(ls[i].leftOffset(d)); }
}


Pattern.prototype.offsetPlot=function(plot) {
    return [ OFFSET, this.pos, plot, OFFSET, this.pos.neg() ];
}



Pattern.prototype.plot=function() {
    return [
        OFFSET, this.pos,
        GROUP, [
            TOOL,"guide", this.guides,
            TOOL,"midline", this.marks, this.midlines,
            TOOL,"sewline", this.base, this.slimmers,
            TOOL,"outline", this.margin,
            TOOL,"none", 
        ],
        OFFSET, this.pos.neg(),
    ];
}


Pattern.prototype.addPolyline=function(poly) {
    this.basepath.push(poly);
    this._len+=poly.len();
}


Pattern.prototype.addLine=function(p0, p1) {
    var line=new Line(p0, p1);
    this.basepath.push(line);
    this._len+=line.len();
}


Pattern.prototype.addCurve=function(p0, p1, p2) {
    var curve=new Curve(p0, p1, p2);
    this.basepath.push(curve);
    this._len+=curve.len();
}


Pattern.prototype.hitTest=function(p0, dmax, dsnap) {
    var p=this.pos.to(p0);
    var path=this.basepath.elements;
    var d=null;
    var r={};
    var xs=0;
    
    r.pattern=this;
    r.i=null;   // index
    r.d=null;   // distance
    r.q=null;   // closest point
    r.l=null;   // arclength
    r.x=null;   // arclength on item
    
    for (var i=0; i<path.length; xs+=path[i].len(), ++i) {
        if (dmax) {
            var box=path[i].bounds().grow(dmax);
            if (!box.contains(p)) { continue; }
        }
        var c=path[i].closest(p, dsnap);
        if (dmax && c.d>dmax) { continue; }
        if (d==null || c.d<d) { 
            d=c.d;
            r.i=i; r.d=d; r.q=this.pos.dv(c.q); r.l=c.l; r.x=c.x; r.len=xs+c.x;
        }
    }
    
    return (d==null ? null : r);
}


Pattern.prototype.subPlot=function(h0, h1) {    
    var path=this.basepath.elements;
    var plen=path.length;
    var ls=[];

    if (h0.i==h1.i) {
        var ii=h0.i;
        var l0=h0.l, l1=h1.l;
        if (!l0.eq(l1)) {
            if (l0<l1) {
                var l1x=(l1-l0)/(1-l0);
                var s0=path[ii].split(l0);
                var s1=s0[1].split(l1x);
                ls.push(s1[0]);
            }
            else {
                var l0x=(l0-l1)/(1-l1);
                var s0=path[ii].split(l1);
                var s1=s0[1].split(l0x);
                
                ls.push(s1[1]);
                for (var i=ii+1; i<plen; ++i) { ls.push(path[i]); }
                for (var i=0; i<ii; ++i) { ls.push(path[i]); }
                ls.push(s0[0]);
            }
        }
    }
    else {
        ls.push(path[h0.i].split(h0.l)[1]);
        if (h0.i<h1.i) {
            for (var i=h0.i+1; i<h1.i; ++i) { ls.push(path[i]); }
        }
        else {
            for (var i=h0.i+1; i<plen; ++i) { ls.push(path[i]); }
            for (var i=0; i<h1.i; ++i) { ls.push(path[i]); }
        }
        ls.push(path[h1.i].split(h1.l)[0]);
    }

    var lsp=[];
    if (ls.length>0) { 
        lsp.push(MOVE);
        for (var i=0; i<ls.length; ++i) {
            lsp.extend(ls[i].plot(i==0));
        }
    }
    
    return lsp;
}


Pattern.prototype.startTag=function(tag) {
    this.tags[tag]=[this.basepath.elements.length];
}


Pattern.prototype.endTag=function(tag) {
    this.tags[tag].push(this.basepath.elements.length);
}


Pattern.prototype.tagPath=function(tag) {
    var path=new Path();
    if (tag in this.tags) {
        var ta=this.tags[tag];
        var es=this.basepath.elements;
        for (var i=ta[0]; i<ta[1]; ++i) { path.push(es[i]); }
    }
    return path;
}




//Pattern0.prototype.cut=function(i0, m0, i1, m1) {
    //var path=this.path;
    //var len=path.length;
    
    //i0=i0%len; if (i0<0) { i0+=len; }
    //i1=i1%len; if (i1<0) { i1+=len; }
    
    
    //if (m0>=0 && m0<=1 && m1>=0 && m1<=1) {
        //if (i0>i1 || (i0==i1 && m0>m1)) { var x=i1; i1=i0; i0=x; x=m1; m1=m0; m0=x; }
        //var p0=path[i0].mid(m0);
        //var s0=path[i0].split(m0);
        //var p1=path[i1].mid(m1);
        //var s1=path[i1].split(m1);
        //var h0=[], h1=[];
        
        //if (i0==i1) {
            //var slen=s0[1].len();
            //var mlen=slen-s1[1].len();
            //m2=(slen>0 ? mlen/slen : 0);
            //p1=s0[1].mid(m2);
            //s1=s0[1].split(m2);
            //s0[1]=s1[0];
            //s1[0]=null;
        //}
        
        //var jl=new Line(p0,p1);
        
        //for (var i=0; i<i0; ++i) { h0.push(path[i]); }
        //h0.push(s0[0]); 

        //h0.push(jl);
        //h1.push(jl.reversed()); h1.push(s0[1]);
        //for (var i=i0+1; i<i1; ++i) { h1.push(path[i]); }
        //if (s1[0]) { h1.push(s1[0]); }
        
        //h0.push(s1[1]);
        //for (var i=i1+1; i<len; ++i) { h0.push(path[i]); }

        //var pat0=new Pattern(); //fixme
        //var pat1=new Pattern(); //.
        //pat0.path=h0;
        //pat1.path=h1;
        //return [pat0,pat1];
    //}
//}


//Pattern0.prototype.scanline=function(y) {
    //var xs=[];
    //var path=this.path;
    //var len=path.length;
    
    //for (var i=0; i<len; ++i) {
        //xs=xs.concat(path[i].scanline(y));
    //}

    //return xs;
//}


//Pattern0.prototype.scanlinep=function(y) {
    //var xs=this.scanline(y);
    //var ps=[];
    
    //for (var i=0; i<xs.length; ++i) {
        //ps.push(new Coord(xs[i], y));
    //}
    
    //return ps;
//}




