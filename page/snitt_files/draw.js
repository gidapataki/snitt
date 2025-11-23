/*
 * $Id: draw.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


// Classes

var Plotter=null;
var CanvasTool=null;
var SVGTool=null;
var NullTool=null;

var PlotterContext=null;
var CanvasContext=null;
var SVGContext=null;
var BoundingBoxContext=null;
var PatternContext=null;
var PolylineContext=null;



// Plotter commads

var TOOL="tool";
var GROUP="group";
var BREAK="break";
var TEXT="text";
var MOVE="move";
var CURVE="curve";
var RECT="rect";
var OFFSET="offset";
var MARK="mark";


// Align 

var Align={
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
    
    BOTTOM: 0,
    MIDDLE: 4,
    TOP: 8,
};



function getHAlign(a) {
    if      (a&Align.RIGHT)    { return Align.RIGHT; }
    else if (a&Align.CENTER) { return Align.CENTER; }
    else                     { return Align.LEFT; }
}


function getVAlign(a) {
    if      (a&Align.TOP)    { return Align.TOP; }
    else if (a&Align.MIDDLE) { return Align.MIDDLE; }
    else                     { return Align.BOTTOM; }
}



// Helpers /////////////////////////////////////////////////////////////////////

function getBounds(ls) {
    var bounds=new Bounds();
    (new Plotter(new BoundingBoxContext(bounds))).plot(ls);
    return bounds;
}


function makeText(p, v, s, align) {
    var ls=[];
    var ss=s.split("\n");
    var base=1.2;
    var h=ss.length*base-base+1;
    var ha=getHAlign(align);
    var va=getVAlign(align);
    var y0=(va==Align.TOP ? -1 : (va==Align.MIDDLE ? h/2-1 : h-1));
    var X=v;
    var Y=v.lnormal();
    
    for (var row=0; row<ss.length; ++row) {
        var line=ss[row];
        var cols=line.length;
        var y=y0+row*base;
        var x=(ha==Align.LEFT ? 0 : (ha==Align.CENTER ? -cols/2 : -cols));
        var tp=p.dv(Y.mul(y)).dv(X.mul(x));
        ls.push(TEXT, tp, v, line);
    }
    
    return ls;
}






// Plotter /////////////////////////////////////////////////////////////////////

Plotter=function(dc) {
    this.dc=dc;
    this.offset=new Coord(0, 0);
    this.level=0;
    this.move=false;
    this.font=defaultFont;
}

Plotter.prototype.plot=function(ls) {
    var n=ls.length;
    var cmd=null;
    var fetch=0;
    var data=[];
    var dc=this.dc;
    var off=this.offset;
    
    ++this.level;
    for (var i=0; i<n; ++i) {
        if (fetch==0) {
            cmd=ls[i];
            data=[];
            if (typeof(cmd) == "string") {
                switch (cmd) {
                    case TOOL: fetch=1; break;
                    case MOVE: this.move=true; break;
                    case CURVE: fetch=2; break;
                    case OFFSET: fetch=1; break;
                    case RECT: fetch=2; break;
                    case BREAK: dc.reselectTool(); break;
                    case GROUP: fetch=1; break;
                    case TEXT: fetch=3; break;
                    case MARK: fetch=2; break;
                }
            }
            else if (cmd instanceof Array)      { this.plot(ls[i]); }
            else if (cmd instanceof Polyline)   { this.plot(cmd.points); }
            else if (cmd instanceof Mark)       { this.plot(cmd.plot()); }
            else if (cmd instanceof Pattern)    { this.plot(cmd.plot()); }
            else if (cmd instanceof Curve)      { this.plot([CURVE, cmd.p1, cmd.p2]); }
            else {
                if (this.move) { dc.moveTo(off.dv(ls[i])); this.move=false; }
                else { dc.lineTo(off.dv(ls[i])); }
            }
        }
        else {
            data.push(ls[i]);
            fetch--;
            if (fetch==0) {
                switch (cmd) {
                    case TOOL: dc.selectTool(data[0]); break;
                    case OFFSET: this.offset=off=off.dv(data[0]); break;
                    case CURVE: dc.curveTo(off.dv(data[0]), off.dv(data[1])); break;
                    case RECT: {
                        var r1=off.dv(data[0]), r2=off.dv(data[1]);
                        dc.moveTo(r1); dc.lineTo(r1.ax(r2)); dc.lineTo(r2); dc.lineTo(r2.ax(r1)); dc.lineTo(r1);
                    } break;
                    case GROUP: dc.beginGroup(); this.plot(data[0]); dc.endGroup(); break;
                    case TEXT: this.plot(this.font.plot(data[0], data[1], data[2])); break;
                    case MARK: {
                        var ps=(data[0] instanceof Array ? data[0] : [data[0]]);
                        var r=data[1]/2;
                        for (var pi=0; pi<ps.length; ++pi) {
                            var p0=off.dv(ps[pi]);
                            dc.moveTo(p0.dx(-r)); dc.lineTo(p0.dx(r)); dc.moveTo(p0.dy(-r)); dc.lineTo(p0.dy(r));
                        }
                    } break;
                }
            }
        }
    }
    --this.level;
    if (this.level==0) { dc.finish(); }
}



// PlotterContext

PlotterContext=function() {}
PlotterContext.prototype.beginGroup=function()      {}
PlotterContext.prototype.endGroup=function()        {}
PlotterContext.prototype.selectTool=function(s)     {}
PlotterContext.prototype.reselectTool=function()    {}
PlotterContext.prototype.moveTo=function(p)         {}
PlotterContext.prototype.lineTo=function(p)         {}
PlotterContext.prototype.curveTo=function(cp, p)    {}
PlotterContext.prototype.finish=function()          {}




// CanvasContext

CanvasContext=function(canvas, bg) {
    this.guides=true;
    this.canvas=canvas;
    this.ctx=canvas.getContext("2d");
    this.noTool=new NullTool();
    this.current=this.noTool;
    this.origin=new Coord();
    this.zoom=1.0;
    this.bg=bg;
    this.text="#eee";
    this.font="13px bitstream vera mono";
    this.tools={}
}


CanvasContext.prototype.clear=function() {
    var ctx=this.ctx;
    var canvas=this.canvas;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle=this.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



CanvasContext.prototype.drawGrid=function(unit) {
    var ctx=this.ctx;
    var canvas=this.canvas;
    var h=canvas.height;
    var w=canvas.width;
    var orig=this.origin;
    var zoom=this.zoom;
    var step=unit*zoom;
    var col=blend({r:0x22,g:0x1d,b:0x22},{r:0xff,g:0xff,b:0xff},0.05);

    ctx.lineWidth=1; 
    ctx.strokeStyle="rgb("+[col.r,col.g,col.b].join(",")+")";
    
    var x0=-orig.x;
    var y0=orig.y-h/zoom;
    var xx=w/zoom;
    var yy=h/zoom;
    var sx=-x0%unit;
    var sy=-y0%unit;
    
    if (sx<0) { sx+=unit; }
    if (sy<0) { sy+=unit; }
    
    var cx=0, cy=0;
    
    for (var x=sx*zoom; x<=w; x+=step) {
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,h);
        ctx.stroke();
    }
    
    for (var y=sy*zoom; y<=h; y+=step) {
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(w,y);
        ctx.stroke();
    }
}



CanvasContext.prototype.drawInfo=function(assist) {
    var ctx=this.ctx;
    var px=15;
    var py=this.canvas.height-5;
    var hr=assist.hitResult;
    var hr2=assist.hitResult2;
    
    var s="zoom: "+this.zoom.toFixed(2)+"x";
    
    if (hr!=null) { 
        var dx=hr2.len-hr.len;
        if (dx<0) { dx+=hr.pattern.len(); }
        s+="   dx: "+dx.toFixed(2); 
    }
    
    ctx.fillStyle=this.text;
    ctx.font=this.font;
    ctx.fillText(s, px, py);
}


CanvasContext.prototype.zoomToFit=function(bounds) {
    var m=20;
    var w=this.canvas.width-2*m, h=this.canvas.height-2*m;
    if (bounds.empty || bounds.width()*bounds.height()==0) { this.origin=new Coord(); this.zoom=1; }
    else {
        var z=Math.min(w/bounds.width(), h/bounds.height());
        var iz=1/z;

        this.zoom=z;
        this.origin=bounds.lo.mid(bounds.hi, 0.5).to(new Coord(m*iz+w*iz/2,m*iz+h*iz/2));
    }
}


CanvasContext.prototype.addTool=function(s, tool) { 
    this.tools[s]=tool; 
}


CanvasContext.prototype.reselectTool=function() {
    this.current.leaveCtx(this.ctx);
    this.current.enterCtx(this.ctx);
}


CanvasContext.prototype.selectTool=function(s) { 
    this.current.leaveCtx(this.ctx);
    if (s in this.tools && (this.guides || s!="guide")) { this.current=this.tools[s]; }
    else { this.current=this.noTool; }
    this.current.enterCtx(this.ctx);
}


CanvasContext.prototype.coord=function(p) {
    var zoom=this.zoom;
    var origin=this.origin;
    var h=this.canvas.height;
    return new Coord((origin.x+p.x)*zoom, h-(origin.y+p.y)*zoom);
}


CanvasContext.prototype.allowGuides=function(v) {
    this.guides=v;
}


CanvasContext.prototype.beginGroup=function()           {}
CanvasContext.prototype.endGroup=function()             {}
CanvasContext.prototype.moveTo=function(p)              { this.current.moveTo(this.ctx, this.coord(p)); }
CanvasContext.prototype.lineTo=function(p)              { this.current.lineTo(this.ctx, this.coord(p)); }
CanvasContext.prototype.curveTo=function(cp, p)         { this.current.curveTo(this.ctx, this.coord(cp), this.coord(p)); }
CanvasContext.prototype.finish=function()               { this.current.leaveCtx(this.ctx); this.current=this.noTool; }




// SVGContext

SVGContext=function(svg) {
    this.svg=svg;
    this.dom=[svg];
    this.path=null;
    this.noTool=new NullTool();
    this.tool=this.noTool;
    this.bounds=new Bounds();
    this.tools={};
}


SVGContext.prototype.clear=function() {
    var svg=this.svg;
    this.dom=[svg];
    this.path=null;
    while(svg.lastChild) { svg.removeChild(svg.lastChild); }
    this.bounds.clear();
}


SVGContext.prototype.addTool=function(s,tool) {
    this.tools[s]=tool;
}


SVGContext.prototype.reselectTool=function() {
    this.tool.leaveCtx(this);
    this.tool.enterCtx(this);
}


SVGContext.prototype.selectTool=function(s) { 
    this.tool.leaveCtx(this);
    if (s in this.tools) { this.tool=this.tools[s]; }
    else { this.tool=this.noTool; }
    this.tool.enterCtx(this);
}


SVGContext.prototype.moveTo=function(p)             { this.tool.moveTo(this, p); }
SVGContext.prototype.lineTo=function(p)             { this.tool.lineTo(this, p); }
SVGContext.prototype.curveTo=function(cp, p)        { this.tool.curveTo(this, cp, p); }
SVGContext.prototype.finish=function()              { this.tool.leaveCtx(this); this.tool=this.noTool; this.setViewBox(); }


SVGContext.prototype.beginPath=function() {
    this.path=[];
}


SVGContext.prototype.addCmd=function(s) {
    this.path.push(s);
}


SVGContext.prototype.beginGroup=function() {
    this.tool.leaveCtx(this);
    var g=document.createElementNS(xmlns, "g");
    this.dom.last().appendChild(g);
    this.dom.push(g);
    this.tool.enterCtx(this);
}


SVGContext.prototype.endGroup=function() {
    this.tool.leaveCtx(this);
    this.dom.pop();
    this.tool.enterCtx(this);
}


SVGContext.prototype.addCoord=function(p) {
    var s=p.x+","+(-p.y);
    this.path.push(s);
}  


SVGContext.prototype.addPath=function(attrs) {
    var p=document.createElementNS(xmlns, "path");
    p.setAttribute("d", this.path.join(" "));
    for (a in attrs) { p.setAttribute(a, attrs[a]); }
    this.dom.last().appendChild(p);
    this.path=null;
}


SVGContext.prototype.setViewBox=function() {
    var bounds=this.bounds;
    bounds.grow(20);
    var w=Math.round(bounds.width());
    var h=Math.round(bounds.height());
    this.svg.setAttribute("width", w+"mm");
    this.svg.setAttribute("height", h+"mm");
    var vb=[Math.round(bounds.lo.x), Math.round(-bounds.hi.y), w, h].join(" ");
    this.svg.setAttribute("viewBox", vb);
}




// BoundingBoxContext

BoundingBoxContext=function(bounds) { this.bounds=bounds; }
   
BoundingBoxContext.prototype.extend=function(p)             { this.bounds.extend(p); }
BoundingBoxContext.prototype.reset=function()               { this.bounds.clear(); this.offset=new Coord(0,0); }
BoundingBoxContext.prototype.isEmpty=function()             { return this.bounds.empty; }

BoundingBoxContext.prototype.beginGroup=function()          {}
BoundingBoxContext.prototype.endGroup=function()            {}
BoundingBoxContext.prototype.selectTool=function(s)         {}
BoundingBoxContext.prototype.reselectTool=function()        {}
BoundingBoxContext.prototype.moveTo=function(p)             { this.extend(p); }
BoundingBoxContext.prototype.lineTo=function(p)             { this.extend(p); }
BoundingBoxContext.prototype.curveTo=function(cp, p)        { this.extend(p); this.extend(p); }
BoundingBoxContext.prototype.finish=function()              {}



// PatternContext

PatternContext=function(pattern) {
    this.pattern=pattern;
    this.current=new Coord(0,0);
}


PatternContext.prototype.beginGroup=function()              {}
PatternContext.prototype.endGroup=function()                {}
PatternContext.prototype.reselectTool = function()          {}
PatternContext.prototype.selectTool = function(s)           {}
PatternContext.prototype.moveTo = function(p)               { this.current=p; }
PatternContext.prototype.lineTo = function(p)               { var ep=p; this.pattern.addLine(this.current, ep); this.current=ep; }
PatternContext.prototype.curveTo = function(cp, p)          { var p1=cp, p2=p; this.pattern.addCurve(this.current, p1, p2); this.current=p2; }
PatternContext.prototype.finish = function()                {}



// PolylineContext

PolylineContext=function(ls, res) {
    this.res=res||30;       // curve resolution
    this.ls=ls;             // polylines list
    this.p=new Coord(0,0);
    this.poly=null;
}


PolylineContext.prototype.beginGroup=function()             {}
PolylineContext.prototype.endGroup=function()               {}
PolylineContext.prototype.selectTool=function(s)            {}
PolylineContext.prototype.reselectTool=function()           {}
PolylineContext.prototype.moveTo=function(p)                { this.p=p; this.poly=new Polyline(p); this.ls.push(this.poly); }
PolylineContext.prototype.lineTo=function(p)                { this.p=p; if (this.poly) { this.poly.push(p); } }
PolylineContext.prototype.finish=function()                 {}

PolylineContext.prototype.curveTo=function(cp, p) {
    var cc=new Curve(this.p, cp, p); 
    var res=this.res;
    var poly=this.poly; 
    for (var i=1; i<=res; ++i) { 
        poly.push(cc.tmid(i/res));
    }
    this.p=p;
}



// CanvasTool

CanvasTool=function(style) { this.style=style; }

CanvasTool.prototype.applyStyle = function(ctx)       { ctx.lineWidth=this.style.lineWidth; ctx.strokeStyle=this.style.strokeStyle; if (this.style.fillStyle) { ctx.fillStyle=this.style.fillStyle; } }
CanvasTool.prototype.enterCtx =   function(ctx)       { ctx.beginPath(); }
CanvasTool.prototype.leaveCtx =   function(ctx)       { this.applyStyle(ctx); if(this.style.fillStyle) { ctx.fill(); } ctx.stroke(); }
CanvasTool.prototype.moveTo =     function(ctx,p)     { ctx.moveTo(p.x, p.y); }
CanvasTool.prototype.lineTo =     function(ctx,p)     { ctx.lineTo(p.x, p.y); }
CanvasTool.prototype.curveTo =    function(ctx,cp,p)  { ctx.quadraticCurveTo(cp.x, cp.y, p.x, p.y); }



// SVGTool

SVGTool=function(attrs) { this.attrs=attrs; }

SVGTool.prototype.enterCtx =   function(ctx)        { ctx.beginPath(); }
SVGTool.prototype.leaveCtx =   function(ctx)        { ctx.addPath(this.attrs); }
SVGTool.prototype.moveTo =     function(ctx,p)      { ctx.addCmd("M"); ctx.addCoord(p); ctx.bounds.extend(p); }
SVGTool.prototype.lineTo =     function(ctx,p)      { ctx.addCmd("L"); ctx.addCoord(p); ctx.bounds.extend(p); }
SVGTool.prototype.curveTo =    function(ctx,cp,p)   { ctx.addCmd("Q"); ctx.addCoord(cp); ctx.addCoord(p); ctx.bounds.extend(p); ctx.bounds.extend(cp); }


// NullTool 

NullTool=function() {}

NullTool.prototype.enterCtx =   function(ctx)       {}
NullTool.prototype.leaveCtx =   function(ctx)       {}
NullTool.prototype.moveTo =     function(ctx,p)     {}
NullTool.prototype.lineTo =     function(ctx,p)     {}
NullTool.prototype.curveTo =    function(ctx,cp,p)  {}

