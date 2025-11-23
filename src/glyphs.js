/*
 * $Id: glyphs.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */



// TextRenderer

var TextRenderer=function() {
    this.glyphs={};

}


TextRenderer.prototype.declare=function(ch, ls) {
    var g=new Glyph();
    this.glyphs[ch]=g;
    g.makeGlyph(ls);
}


TextRenderer.prototype.normalize=function() {
    var ascent=0, descent=0;
    
    for (c in this.glyphs) {
        var m=this.glyphs[c].metrics();
        ascent=Math.max(ascent,m.ascent);
        descent=Math.max(descent,m.descent);
    }
    
    if (ascent+descent>0) { 
        var scale=1/(ascent+descent);
        for (c in this.glyphs) {
            g=this.glyphs[c];
            g.normalize(scale);
        }
    }
}


TextRenderer.prototype.plot=function(p0, v, s) {
    var ls=[];
    var X=v;
    var Y=v.lnormal();
    
    for (var i=0; i<s.length; ++i) {
        var ch=s[i];
        if (ch in this.glyphs) {
            var strokes=this.glyphs[ch].strokes;
            var c0=p0.dv(X.mul(i));
            for (var j=0; j<strokes.length; ++j) {
                var p=strokes[j];
                if (p instanceof Coord) { ls.push(c0.dv(X.mul(p.x)).dv(Y.mul(p.y))); }
                else { ls.push(strokes[j]); }
            }            
        }
    }   
    return ls;
}



// Glyph

var Glyph=function() {
    this.strokes=[];
}


Glyph.prototype.makeGlyph=function(ls) {
    var c=0;
    var p=[0,0];
    var strokes=this.strokes;

    for (var i=0; i<ls.length; ++i) {
        var n=ls[i];
        if (typeof(n)=="number") {
            p[c++]=n;
            if (c==2) { strokes.push(new Coord(p[0],p[1])); c=0; }
        }
        else {
            c=0;
            strokes.push(MOVE);
        }
    }
}    

Glyph.prototype.metrics=function() {
    var ascent=0, descent=0;
    
    for (var i=0; i<this.strokes.length; ++i) {
        var p=this.strokes[i];
        if (p instanceof Coord) {
            ascent=Math.max(ascent, p.y);
            descent=Math.max(descent, -p.y);
        }
    }
    
    return { "ascent": ascent, "descent": descent };
}


Glyph.prototype.normalize=function(scale) {
    for (var i=0; i<this.strokes.length; ++i) {
        var p=this.strokes[i];
        if (p instanceof Coord) {
            p.x*=scale;
            p.y*=scale;
        }
    }
}



// Default font


function createDefaultFont() {

    var g=new TextRenderer();

    g.declare('a', [MOVE, 1, 0, 0, 1, 0, 3, 1, 4, 3, 4, 3, 1, 2, 0, 1, 0, MOVE, 3, 1, 4, 0]);
    g.declare('b', [MOVE, 0, 6, 0, 0, 3, 0, 4, 1, 4, 3, 3, 4, 0, 4]);
    g.declare('c', [MOVE, 4, 4, 1, 4, 0, 3, 0, 1, 1, 0, 4, 0]);
    g.declare('d', [MOVE, 4, 4, 1, 4, 0, 3, 0, 1, 1, 0, 4, 0, 4, 6]);
    g.declare('e', [MOVE, 0, 2, 4, 2, 4, 3, 3, 4, 1, 4, 0, 3, 0, 1, 1, 0, 3, 0]);
    g.declare('f', [MOVE, 0, 0, 0, 5, 1, 6, 3, 6, 4, 5, MOVE, 0, 3, 3, 3]);
    g.declare('g', [MOVE, 1, -1, 3, -1, 4, 0, 4, 4, 1, 4, 0, 3, 0, 2, 1, 1, 4, 1]);
    g.declare('h', [MOVE, 0, 0, 0, 6, MOVE, 0, 4, 3, 4, 4, 3, 4, 0]);
    g.declare('i', [MOVE, 1, 0, 3, 0, MOVE, 2, 0, 2, 4, 1, 4, MOVE, 1, 5, 2, 5, 2, 6, 1, 6, 1, 5]);
    g.declare('j', [MOVE, 2, 4, 3, 4, 3, 0, 2, -1, 1, -1, 0, 0, MOVE, 2, 5, 3, 5, 3, 6, 2, 6, 2, 5]);
    g.declare('k', [MOVE, 0, 0, 0, 6, MOVE, 0, 2, 2, 2, 4, 0, MOVE, 1, 2, 3, 4]);
    g.declare('l', [MOVE, 1, 6, 1, 1, 2, 0, 3, 0]);
    g.declare('m', [MOVE, 0, 0, 0, 4, MOVE, 0, 3, 1, 4, 2, 3, 2, 0, MOVE, 2, 3, 3, 4, 4, 3, 4, 0]);
    g.declare('n', [MOVE, 0, 0, 0, 4, MOVE, 0, 2, 2, 4, 3, 4, 4, 3, 4, 0]);
    g.declare('o', [MOVE, 4, 1, 3, 0, 1, 0, 0, 1, 0, 3, 1, 4, 3, 4, 4, 3, 4, 1]);
    g.declare('p', [MOVE, 0, 1, 3, 1, 4, 2, 4, 3, 3, 4, 0, 4, 0, -1]);
    g.declare('q', [MOVE, 4, -1, 4, 4, 1, 4, 0, 3, 0, 2, 1, 1, 4, 1]);
    g.declare('r', [MOVE, 0, 0, 0, 4, MOVE, 0, 2, 2, 4, 3, 4, 4, 3]);
    g.declare('s', [MOVE, 0, 0, 3, 0, 4, 1, 3, 2, 1, 2, 0, 3, 1, 4, 4, 4]);
    g.declare('t', [MOVE, 0, 4, 2, 4, MOVE, 1, 6, 1, 1, 2, 0, 3, 0, 4, 1]);
    g.declare('u', [MOVE, 0, 4, 0, 1, 1, 0, 2, 0, 4, 2, MOVE, 4, 4, 4, 0]);
    g.declare('v', [MOVE, 0, 4, 2, 0, 4, 4]);
    g.declare('w', [MOVE, 0, 4, 1, 0, 2, 3, 3, 0, 4, 4]);
    g.declare('x', [MOVE, 0, 0, 4, 4, MOVE, 0, 4, 4, 0]);
    g.declare('y', [MOVE, 1, -1, 3, -1, 4, 0, 4, 4, MOVE, 0, 4, 0, 2, 1, 1, 4, 1]);
    g.declare('z', [MOVE, 0, 4, 4, 4, 0, 0, 4, 0]);
    g.declare('A', [MOVE, 0, 0, 0, 5, 1, 6, 3, 6, 4, 5, 4, 0, MOVE, 0, 3, 4, 3]);
    g.declare('B', [MOVE, 0, 0, 0, 6, 3, 6, 4, 5, 4, 4, 3, 3, 0, 3, MOVE, 3, 3, 4, 2, 4, 1, 3, 0, 0, 0]);
    g.declare('C', [MOVE, 4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5]);
    g.declare('D', [MOVE, 0, 0, 0, 6, 3, 6, 4, 5, 4, 1, 3, 0, 0, 0]);
    g.declare('E', [MOVE, 4, 0, 0, 0, 0, 6, 4, 6, MOVE, 4, 3, 0, 3]);
    g.declare('F', [MOVE, 0, 0, 0, 6, 4, 6, MOVE, 4, 3, 0, 3]);
    g.declare('G', [MOVE, 2, 3, 4, 3, 4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5]);
    g.declare('H', [MOVE, 0, 0, 0, 6, MOVE, 4, 6, 4, 0, MOVE, 4, 3, 0, 3]);
    g.declare('I', [MOVE, 2, 0, 2, 6, MOVE, 1, 6, 3, 6, MOVE, 1, 0, 3, 0]);
    g.declare('J', [MOVE, 0, 1, 1, 0, 2, 0, 3, 1, 3, 6, MOVE, 2, 6, 4, 6]);
    g.declare('K', [MOVE, 0, 0, 0, 6, MOVE, 4, 6, 0, 2, MOVE, 1, 3, 4, 0]);
    g.declare('L', [MOVE, 0, 6, 0, 0, 4, 0]);
    g.declare('M', [MOVE, 0, 0, 0, 6, 2, 4, 4, 6, 4, 0]);
    g.declare('N', [MOVE, 0, 0, 0, 6, 4, 0, 4, 6]);
    g.declare('O', [MOVE, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 4, 1, 3, 0, 1, 0, 0, 1]);
    g.declare('P', [MOVE, 0, 0, 0, 6, 3, 6, 4, 5, 4, 4, 3, 3, 0, 3]);
    g.declare('Q', [MOVE, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 4, 1, 3, 0, 1, 0, 0, 1, MOVE, 2, 2, 4, 0]);
    g.declare('R', [MOVE, 0, 0, 0, 6, 3, 6, 4, 5, 4, 4, 3, 3, 0, 3, MOVE, 1, 3, 4, 0]);
    g.declare('S', [MOVE, 0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 1, 3, 0, 4, 0, 5, 1, 6, 3, 6, 4, 5]);
    g.declare('T', [MOVE, 2, 0, 2, 6, MOVE, 0, 6, 4, 6]);
    g.declare('U', [MOVE, 0, 6, 0, 1, 1, 0, 3, 0, 4, 1, 4, 6]);
    g.declare('V', [MOVE, 0, 6, 2, 0, 4, 6]);
    g.declare('W', [MOVE, 0, 6, 1, 0, 2, 4, 3, 0, 4, 6]);
    g.declare('X', [MOVE, 0, 0, 4, 6, MOVE, 0, 6, 4, 0]);
    g.declare('Y', [MOVE, 0, 6, 2, 4, 2, 0, MOVE, 2, 4, 4, 6]);
    g.declare('Z', [MOVE, 4, 0, 0, 0, 4, 6, 0, 6]);
    g.declare('1', [MOVE, 1, 5, 2, 6, 2, 0]);
    g.declare('2', [MOVE, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 0, 0, 4, 0]);
    g.declare('3', [MOVE, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 3, 3, 2, 3, MOVE, 3, 3, 4, 2, 4, 1, 3, 0, 1, 0, 0, 1]);
    g.declare('4', [MOVE, 0, 6, 0, 3, 4, 3, MOVE, 3, 5, 3, 0]);
    g.declare('5', [MOVE, 0, 1, 1, 0, 3, 0, 4, 1, 4, 3, 3, 4, 0, 4, 0, 6, 4, 6]);
    g.declare('6', [MOVE, 0, 3, 3, 3, 4, 2, 4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5]);
    g.declare('7', [MOVE, 0, 5, 0, 6, 4, 6, 1, 0]);
    g.declare('8', [MOVE, 1, 3, 0, 2, 0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 1, 3, 0, 4, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 3, 3]);
    g.declare('9', [MOVE, 0, 1, 1, 0, 3, 0, 4, 1, 4, 3, 1, 3, 0, 4, 0, 5, 1, 6, 3, 6, 4, 5, 4, 3]);
    g.declare('0', [MOVE, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 0, 1, 1, 0, 3, 0, 4, 1, 4, 5]);
    g.declare('!', [MOVE, 2, 0, 3, 0, 3, 1, 2, 1, 2, 0, MOVE, 2, 3, 2, 6, 3, 6, 3, 3, 2, 3]);
    g.declare('@', [MOVE, 4, 0, 1, 0, 0, 1, 0, 4, 1, 5, 4, 5, 4, 1, MOVE, 4, 3, 3, 4, 2, 4, 1, 3, 1, 2, 2, 1, 3, 1, 4, 2]);
    g.declare('#', [MOVE, 1, 0, 1, 6, MOVE, 3, 0, 3, 6, MOVE, 4, 2, 0, 2, MOVE, 0, 4, 4, 4]);
    g.declare('$', [MOVE, 0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 1, 3, 0, 4, 0, 5, 1, 6, 3, 6, 4, 5, MOVE, 1, 0, 1, 6, MOVE, 3, 6, 3, 0]);
    g.declare('%', [MOVE, 0, 1, 4, 5, MOVE, 0, 6, 0, 5, 1, 5, 1, 6, 0, 6, MOVE, 3, 1, 4, 1, 4, 0, 3, 0, 3, 1]);
    g.declare('^', [MOVE, 0, 4, 2, 6, 4, 4, MOVE, 2, 6, 2, 0]);
    g.declare('&', [MOVE, 4, 0, 0, 4, 0, 5, 1, 6, 2, 5, 2, 4, 0, 2, 0, 1, 1, 0, 2, 0, 4, 2]);
    g.declare('*', [MOVE, 2, 1, 2, 5, MOVE, 0, 2, 4, 4, MOVE, 4, 2, 0, 4]);
    g.declare('(', [MOVE, 2, 0, 0, 2, 0, 4, 2, 6]);
    g.declare(')', [MOVE, 2, 0, 4, 2, 4, 4, 2, 6]);
    g.declare('_', [MOVE, 0, 0, 4, 0]);
    g.declare('+', [MOVE, 2, 1, 2, 5, MOVE, 0, 3, 4, 3]);
    g.declare('-', [MOVE, 0, 3, 4, 3]);
    g.declare('=', [MOVE, 0, 2, 4, 2, MOVE, 4, 4, 0, 4]);
    g.declare('[', [MOVE, 4, 6, 2, 6, 2, 0, 4, 0]);
    g.declare(']', [MOVE, 0, 6, 2, 6, 2, 0, 0, 0]);
    g.declare('{', [MOVE, 2, 0, 1, 1, 1, 2, 2, 3, 1, 4, 1, 5, 2, 6, MOVE, 2, 3, 1, 3]);
    g.declare('}', [MOVE, 2, 0, 3, 1, 3, 2, 2, 3, 3, 4, 3, 5, 2, 6, MOVE, 2, 3, 3, 3]);
    g.declare('\\',[MOVE, 0, 5, 4, 1]);
    g.declare('|', [MOVE, 2, 0, 2, 6]);
    g.declare(';', [MOVE, 1, 0, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, MOVE, 1, 4, 2, 4, 2, 5, 1, 5, 1, 4]);
    g.declare(':', [MOVE, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, MOVE, 1, 4, 2, 4, 2, 5, 1, 5, 1, 4]);
    g.declare('\'',[MOVE, 4, 6, 2, 4]);
    g.declare('"', [MOVE, 0, 4, 2, 6, MOVE, 4, 6, 2, 4]);
    g.declare(',', [MOVE, 1, 0, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1]);
    g.declare('.', [MOVE, 1, 0, 1, 1, 2, 1, 2, 0, 1, 0]);
    g.declare('/', [MOVE, 0, 1, 4, 5]);
    g.declare('<', [MOVE, 4, 0, 1, 3, 4, 6]);
    g.declare('>', [MOVE, 0, 0, 3, 3, 0, 6]);
    g.declare('?', [MOVE, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 3, 3, 1, 3, 1, 2, MOVE, 1, 1, 2, 1, 2, 0, 1, 0, 1, 1]);
    g.declare('Ä', [MOVE, 0, 0, 0, 4, 1, 5, 3, 5, 4, 4, 4, 0, MOVE, 0, 3, 4, 3, MOVE, 0, 5, 0, 6, 1, 6, 1, 5, 0, 5, MOVE, 3, 5, 3, 6, 4, 6, 4, 5, 3, 5]);
    g.declare('Ö', [MOVE, 0, 1, 0, 4, 1, 5, 3, 5, 4, 4, 4, 1, 3, 0, 1, 0, 0, 1, MOVE, 0, 5, 0, 6, 1, 6, 1, 5, 0, 5, MOVE, 3, 5, 3, 6, 4, 6, 4, 5, 3, 5]);
    g.declare('Ü', [MOVE, 0, 4, 0, 1, 1, 0, 3, 0, 4, 1, 4, 4, MOVE, 0, 5, 0, 6, 1, 6, 1, 5, 0, 5, MOVE, 3, 5, 3, 6, 4, 6, 4, 5, 3, 5]);
    g.declare('ä', [MOVE, 1, 0, 0, 1, 0, 3, 1, 4, 3, 4, 3, 1, 2, 0, 1, 0, MOVE, 3, 1, 4, 0, MOVE, 0, 5, 0, 6, 1, 6, 1, 5, 0, 5, MOVE, 2, 5, 2, 6, 3, 6, 3, 5, 2, 5]);
    g.declare('ö', [MOVE, 4, 1, 3, 0, 1, 0, 0, 1, 0, 3, 1, 4, 3, 4, 4, 3, 4, 1, MOVE, 0, 5, 0, 6, 1, 6, 1, 5, 0, 5, MOVE, 2, 5, 2, 6, 3, 6, 3, 5, 2, 5]);
    g.declare('ü', [MOVE, 0, 4, 0, 1, 1, 0, 2, 0, 4, 2, MOVE, 4, 4, 4, 0, MOVE, 0, 5, 0, 6, 1, 6, 1, 5, 0, 5, MOVE, 2, 5, 2, 6, 3, 6, 3, 5, 2, 5]);
    g.declare('ß', [MOVE, 0, 0, 0, 5, 1, 6, 2, 6, 3, 5, 2, 4, 3, 3, 3, 2, 2, 1, 1, 1]);
    g.declare('°', [MOVE, 1, 5, 2, 6, 3, 5, 3, 4, 2, 3, 1, 4, 1, 5]);

    //
    g.normalize();
    defaultFont=g;
}
