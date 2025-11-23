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


TextRenderer.prototype.declare=function(ch) {
    var g=new Glyph();
    this.glyphs[ch]=g;
    return g;
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
    this.strokes=[MOVE];
}


Glyph.prototype.pushCoord=function(x, y) {
    this.strokes.push(new Coord(x,y));
    return this;
}


Glyph.prototype.pushBreak=function() {
    this.strokes.push(MOVE);
    return this;
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
    
    defaultFont=g;

    g.declare('a')
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 3)
        .pushCoord(1, 4)
        .pushCoord(3, 4)
        .pushCoord(3, 1)
        .pushCoord(2, 0)
        .pushCoord(1, 0)
        .pushBreak()
        .pushCoord(3, 1)
        .pushCoord(4, 0)
        ;

    g.declare('b')
        .pushCoord(0, 6)
        .pushCoord(0, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 3)
        .pushCoord(3, 4)
        .pushCoord(0, 4)
        ;

    g.declare('c')
        .pushCoord(4, 4)
        .pushCoord(1, 4)
        .pushCoord(0, 3)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(4, 0)
        ;

    g.declare('d')
        .pushCoord(4, 4)
        .pushCoord(1, 4)
        .pushCoord(0, 3)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(4, 0)
        .pushCoord(4, 6)
        ;

    g.declare('e')
        .pushCoord(0, 2)
        .pushCoord(4, 2)
        .pushCoord(4, 3)
        .pushCoord(3, 4)
        .pushCoord(1, 4)
        .pushCoord(0, 3)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        ;

    g.declare('f')
        .pushCoord(0, 0)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushBreak()
        .pushCoord(0, 3)
        .pushCoord(3, 3)
        ;

    g.declare('g')
        .pushCoord(1, -1)
        .pushCoord(3, -1)
        .pushCoord(4, 0)
        .pushCoord(4, 4)
        .pushCoord(1, 4)
        .pushCoord(0, 3)
        .pushCoord(0, 2)
        .pushCoord(1, 1)
        .pushCoord(4, 1)
        ;

    g.declare('h')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushBreak()
        .pushCoord(0, 4)
        .pushCoord(3, 4)
        .pushCoord(4, 3)
        .pushCoord(4, 0)
        ;

    g.declare('i')
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushBreak()
        .pushCoord(2, 0)
        .pushCoord(2, 4)
        .pushCoord(1, 4)
        .pushBreak()
        .pushCoord(1, 5)
        .pushCoord(2, 5)
        .pushCoord(2, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        ;

    g.declare('j')
        .pushCoord(2, 4)
        .pushCoord(3, 4)
        .pushCoord(3, 0)
        .pushCoord(2, -1)
        .pushCoord(1, -1)
        .pushCoord(0, 0)
        .pushBreak()
        .pushCoord(2, 5)
        .pushCoord(3, 5)
        .pushCoord(3, 6)
        .pushCoord(2, 6)
        .pushCoord(2, 5)
        ;

    g.declare('k')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushBreak()
        .pushCoord(0, 2)
        .pushCoord(2, 2)
        .pushCoord(4, 0)
        .pushBreak()
        .pushCoord(1, 2)
        .pushCoord(3, 4)
        ;

    g.declare('l')
        .pushCoord(1, 6)
        .pushCoord(1, 1)
        .pushCoord(2, 0)
        .pushCoord(3, 0)
        ;

    g.declare('m')
        .pushCoord(0, 0)
        .pushCoord(0, 4)
        .pushBreak()
        .pushCoord(0, 3)
        .pushCoord(1, 4)
        .pushCoord(2, 3)
        .pushCoord(2, 0)
        .pushBreak()
        .pushCoord(2, 3)
        .pushCoord(3, 4)
        .pushCoord(4, 3)
        .pushCoord(4, 0)
        ;

    g.declare('n')
        .pushCoord(0, 0)
        .pushCoord(0, 4)
        .pushBreak()
        .pushCoord(0, 2)
        .pushCoord(2, 4)
        .pushCoord(3, 4)
        .pushCoord(4, 3)
        .pushCoord(4, 0)
        ;

    g.declare('o')
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 3)
        .pushCoord(1, 4)
        .pushCoord(3, 4)
        .pushCoord(4, 3)
        .pushCoord(4, 1)
        ;

    g.declare('p')
        .pushCoord(0, 1)
        .pushCoord(3, 1)
        .pushCoord(4, 2)
        .pushCoord(4, 3)
        .pushCoord(3, 4)
        .pushCoord(0, 4)
        .pushCoord(0, -1)
        ;

    g.declare('q')
        .pushCoord(4, -1)
        .pushCoord(4, 4)
        .pushCoord(1, 4)
        .pushCoord(0, 3)
        .pushCoord(0, 2)
        .pushCoord(1, 1)
        .pushCoord(4, 1)
        ;

    g.declare('r')
        .pushCoord(0, 0)
        .pushCoord(0, 4)
        .pushBreak()
        .pushCoord(0, 2)
        .pushCoord(2, 4)
        .pushCoord(3, 4)
        .pushCoord(4, 3)
        ;

    g.declare('s')
        .pushCoord(0, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(3, 2)
        .pushCoord(1, 2)
        .pushCoord(0, 3)
        .pushCoord(1, 4)
        .pushCoord(4, 4)
        ;

    g.declare('t')
        .pushCoord(0, 4)
        .pushCoord(2, 4)
        .pushBreak()
        .pushCoord(1, 6)
        .pushCoord(1, 1)
        .pushCoord(2, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        ;

    g.declare('u')
        .pushCoord(0, 4)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(2, 0)
        .pushCoord(4, 2)
        .pushBreak()
        .pushCoord(4, 4)
        .pushCoord(4, 0)
        ;

    g.declare('v')
        .pushCoord(0, 4)
        .pushCoord(2, 0)
        .pushCoord(4, 4)
        ;

    g.declare('w')
        .pushCoord(0, 4)
        .pushCoord(1, 0)
        .pushCoord(2, 3)
        .pushCoord(3, 0)
        .pushCoord(4, 4)
        ;

    g.declare('x')
        .pushCoord(0, 0)
        .pushCoord(4, 4)
        .pushBreak()
        .pushCoord(0, 4)
        .pushCoord(4, 0)
        ;

    g.declare('y')
        .pushCoord(1, -1)
        .pushCoord(3, -1)
        .pushCoord(4, 0)
        .pushCoord(4, 4)
        .pushBreak()
        .pushCoord(0, 4)
        .pushCoord(0, 2)
        .pushCoord(1, 1)
        .pushCoord(4, 1)
        ;

    g.declare('z')
        .pushCoord(0, 4)
        .pushCoord(4, 4)
        .pushCoord(0, 0)
        .pushCoord(4, 0)
        ;

    g.declare('A')
        .pushCoord(0, 0)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 0)
        .pushBreak()
        .pushCoord(0, 3)
        .pushCoord(4, 3)
        ;

    g.declare('B')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(3, 3)
        .pushCoord(0, 3)
        .pushBreak()
        .pushCoord(3, 3)
        .pushCoord(4, 2)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(0, 0)
        ;

    g.declare('C')
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        ;

    g.declare('D')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(0, 0)
        ;

    g.declare('E')
        .pushCoord(4, 0)
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(4, 6)
        .pushBreak()
        .pushCoord(4, 3)
        .pushCoord(0, 3)
        ;

    g.declare('F')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(4, 6)
        .pushBreak()
        .pushCoord(4, 3)
        .pushCoord(0, 3)
        ;

    g.declare('G')
        .pushCoord(2, 3)
        .pushCoord(4, 3)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        ;

    g.declare('H')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushBreak()
        .pushCoord(4, 6)
        .pushCoord(4, 0)
        .pushBreak()
        .pushCoord(4, 3)
        .pushCoord(0, 3)
        ;

    g.declare('I')
        .pushCoord(2, 0)
        .pushCoord(2, 6)
        .pushBreak()
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushBreak()
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        ;

    g.declare('J')
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(2, 0)
        .pushCoord(3, 1)
        .pushCoord(3, 6)
        .pushBreak()
        .pushCoord(2, 6)
        .pushCoord(4, 6)
        ;

    g.declare('K')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushBreak()
        .pushCoord(4, 6)
        .pushCoord(0, 2)
        .pushBreak()
        .pushCoord(1, 3)
        .pushCoord(4, 0)
        ;

    g.declare('L')
        .pushCoord(0, 6)
        .pushCoord(0, 0)
        .pushCoord(4, 0)
        ;

    g.declare('M')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(2, 4)
        .pushCoord(4, 6)
        .pushCoord(4, 0)
        ;

    g.declare('N')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(4, 0)
        .pushCoord(4, 6)
        ;

    g.declare('O')
        .pushCoord(0, 1)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        ;

    g.declare('P')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(3, 3)
        .pushCoord(0, 3)
        ;

    g.declare('Q')
        .pushCoord(0, 1)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushBreak()
        .pushCoord(2, 2)
        .pushCoord(4, 0)
        ;

    g.declare('R')
        .pushCoord(0, 0)
        .pushCoord(0, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(3, 3)
        .pushCoord(0, 3)
        .pushBreak()
        .pushCoord(1, 3)
        .pushCoord(4, 0)
        ;

    g.declare('S')
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 2)
        .pushCoord(3, 3)
        .pushCoord(1, 3)
        .pushCoord(0, 4)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        ;

    g.declare('T')
        .pushCoord(2, 0)
        .pushCoord(2, 6)
        .pushBreak()
        .pushCoord(0, 6)
        .pushCoord(4, 6)
        ;

    g.declare('U')
        .pushCoord(0, 6)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 6)
        ;

    g.declare('V')
        .pushCoord(0, 6)
        .pushCoord(2, 0)
        .pushCoord(4, 6)
        ;

    g.declare('W')
        .pushCoord(0, 6)
        .pushCoord(1, 0)
        .pushCoord(2, 4)
        .pushCoord(3, 0)
        .pushCoord(4, 6)
        ;

    g.declare('X')
        .pushCoord(0, 0)
        .pushCoord(4, 6)
        .pushBreak()
        .pushCoord(0, 6)
        .pushCoord(4, 0)
        ;

    g.declare('Y')
        .pushCoord(0, 6)
        .pushCoord(2, 4)
        .pushCoord(2, 0)
        .pushBreak()
        .pushCoord(2, 4)
        .pushCoord(4, 6)
        ;

    g.declare('Z')
        .pushCoord(4, 0)
        .pushCoord(0, 0)
        .pushCoord(4, 6)
        .pushCoord(0, 6)
        ;

    g.declare('1')
        .pushCoord(1, 5)
        .pushCoord(2, 6)
        .pushCoord(2, 0)
        ;

    g.declare('2')
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(0, 0)
        .pushCoord(4, 0)
        ;

    g.declare('3')
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(3, 3)
        .pushCoord(2, 3)
        .pushBreak()
        .pushCoord(3, 3)
        .pushCoord(4, 2)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        ;

    g.declare('4')
        .pushCoord(0, 6)
        .pushCoord(0, 3)
        .pushCoord(4, 3)
        .pushBreak()
        .pushCoord(3, 5)
        .pushCoord(3, 0)
        ;

    g.declare('5')
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 3)
        .pushCoord(3, 4)
        .pushCoord(0, 4)
        .pushCoord(0, 6)
        .pushCoord(4, 6)
        ;

    g.declare('6')
        .pushCoord(0, 3)
        .pushCoord(3, 3)
        .pushCoord(4, 2)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        ;

    g.declare('7')
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(4, 6)
        .pushCoord(1, 0)
        ;

    g.declare('8')
        .pushCoord(1, 3)
        .pushCoord(0, 2)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 2)
        .pushCoord(3, 3)
        .pushCoord(1, 3)
        .pushCoord(0, 4)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(3, 3)
        ;

    g.declare('9')
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 3)
        .pushCoord(1, 3)
        .pushCoord(0, 4)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 3)
        ;

    g.declare('0')
        .pushCoord(0, 1)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 5)
        ;

    g.declare('!')
        .pushCoord(2, 0)
        .pushCoord(3, 0)
        .pushCoord(3, 1)
        .pushCoord(2, 1)
        .pushCoord(2, 0)
        .pushBreak()
        .pushCoord(2, 3)
        .pushCoord(2, 6)
        .pushCoord(3, 6)
        .pushCoord(3, 3)
        .pushCoord(2, 3)
        ;

    g.declare('@')
        .pushCoord(4, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 4)
        .pushCoord(1, 5)
        .pushCoord(4, 5)
        .pushCoord(4, 1)
        .pushBreak()
        .pushCoord(4, 3)
        .pushCoord(3, 4)
        .pushCoord(2, 4)
        .pushCoord(1, 3)
        .pushCoord(1, 2)
        .pushCoord(2, 1)
        .pushCoord(3, 1)
        .pushCoord(4, 2)
        ;

    g.declare('#')
        .pushCoord(1, 0)
        .pushCoord(1, 6)
        .pushBreak()
        .pushCoord(3, 0)
        .pushCoord(3, 6)
        .pushBreak()
        .pushCoord(4, 2)
        .pushCoord(0, 2)
        .pushBreak()
        .pushCoord(0, 4)
        .pushCoord(4, 4)
        ;

    g.declare('$')
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 2)
        .pushCoord(3, 3)
        .pushCoord(1, 3)
        .pushCoord(0, 4)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushBreak()
        .pushCoord(1, 0)
        .pushCoord(1, 6)
        .pushBreak()
        .pushCoord(3, 6)
        .pushCoord(3, 0)
        ;

    g.declare('%')
        .pushCoord(0, 1)
        .pushCoord(4, 5)
        .pushBreak()
        .pushCoord(0, 6)
        .pushCoord(0, 5)
        .pushCoord(1, 5)
        .pushCoord(1, 6)
        .pushCoord(0, 6)
        .pushBreak()
        .pushCoord(3, 1)
        .pushCoord(4, 1)
        .pushCoord(4, 0)
        .pushCoord(3, 0)
        .pushCoord(3, 1)
        ;

    g.declare('^')
        .pushCoord(0, 4)
        .pushCoord(2, 6)
        .pushCoord(4, 4)
        .pushBreak()
        .pushCoord(2, 6)
        .pushCoord(2, 0)
        ;

    g.declare('&')
        .pushCoord(4, 0)
        .pushCoord(0, 4)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(2, 5)
        .pushCoord(2, 4)
        .pushCoord(0, 2)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(2, 0)
        .pushCoord(4, 2)
        ;

    g.declare('*')
        .pushCoord(2, 1)
        .pushCoord(2, 5)
        .pushBreak()
        .pushCoord(0, 2)
        .pushCoord(4, 4)
        .pushBreak()
        .pushCoord(4, 2)
        .pushCoord(0, 4)
        ;

    g.declare('(')
        .pushCoord(2, 0)
        .pushCoord(0, 2)
        .pushCoord(0, 4)
        .pushCoord(2, 6)
        ;

    g.declare(')')
        .pushCoord(2, 0)
        .pushCoord(4, 2)
        .pushCoord(4, 4)
        .pushCoord(2, 6)
        ;

    g.declare('_')
        .pushCoord(0, 0)
        .pushCoord(4, 0)
        ;

    g.declare('+')
        .pushCoord(2, 1)
        .pushCoord(2, 5)
        .pushBreak()
        .pushCoord(0, 3)
        .pushCoord(4, 3)
        ;

    g.declare('-')
        .pushCoord(0, 3)
        .pushCoord(4, 3)
        ;

    g.declare('=')
        .pushCoord(0, 2)
        .pushCoord(4, 2)
        .pushBreak()
        .pushCoord(4, 4)
        .pushCoord(0, 4)
        ;

    g.declare('[')
        .pushCoord(4, 6)
        .pushCoord(2, 6)
        .pushCoord(2, 0)
        .pushCoord(4, 0)
        ;

    g.declare(']')
        .pushCoord(0, 6)
        .pushCoord(2, 6)
        .pushCoord(2, 0)
        .pushCoord(0, 0)
        ;

    g.declare('{')
        .pushCoord(2, 0)
        .pushCoord(1, 1)
        .pushCoord(1, 2)
        .pushCoord(2, 3)
        .pushCoord(1, 4)
        .pushCoord(1, 5)
        .pushCoord(2, 6)
        .pushBreak()
        .pushCoord(2, 3)
        .pushCoord(1, 3)
        ;

    g.declare('}')
        .pushCoord(2, 0)
        .pushCoord(3, 1)
        .pushCoord(3, 2)
        .pushCoord(2, 3)
        .pushCoord(3, 4)
        .pushCoord(3, 5)
        .pushCoord(2, 6)
        .pushBreak()
        .pushCoord(2, 3)
        .pushCoord(3, 3)
        ;

    g.declare('\\')
        .pushCoord(0, 5)
        .pushCoord(4, 1)
        ;

    g.declare('|')
        .pushCoord(2, 0)
        .pushCoord(2, 6)
        ;

    g.declare(';')
        .pushCoord(1, 0)
        .pushCoord(2, 1)
        .pushCoord(2, 2)
        .pushCoord(1, 2)
        .pushCoord(1, 1)
        .pushCoord(2, 1)
        .pushBreak()
        .pushCoord(1, 4)
        .pushCoord(2, 4)
        .pushCoord(2, 5)
        .pushCoord(1, 5)
        .pushCoord(1, 4)
        ;

    g.declare(':')
        .pushCoord(1, 1)
        .pushCoord(2, 1)
        .pushCoord(2, 2)
        .pushCoord(1, 2)
        .pushCoord(1, 1)
        .pushBreak()
        .pushCoord(1, 4)
        .pushCoord(2, 4)
        .pushCoord(2, 5)
        .pushCoord(1, 5)
        .pushCoord(1, 4)
        ;

    g.declare('\'')
        .pushCoord(4, 6)
        .pushCoord(2, 4)
        ;

    g.declare('"')
        .pushCoord(0, 4)
        .pushCoord(2, 6)
        .pushBreak()
        .pushCoord(4, 6)
        .pushCoord(2, 4)
        ;

    g.declare(',')
        .pushCoord(1, 0)
        .pushCoord(2, 1)
        .pushCoord(2, 2)
        .pushCoord(1, 2)
        .pushCoord(1, 1)
        .pushCoord(2, 1)
        ;

    g.declare('.')
        .pushCoord(1, 0)
        .pushCoord(1, 1)
        .pushCoord(2, 1)
        .pushCoord(2, 0)
        .pushCoord(1, 0)
        ;

    g.declare('/')
        .pushCoord(0, 1)
        .pushCoord(4, 5)
        ;

    g.declare('<')
        .pushCoord(4, 0)
        .pushCoord(1, 3)
        .pushCoord(4, 6)
        ;

    g.declare('>')
        .pushCoord(0, 0)
        .pushCoord(3, 3)
        .pushCoord(0, 6)
        ;

    g.declare('?')
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(3, 6)
        .pushCoord(4, 5)
        .pushCoord(4, 4)
        .pushCoord(3, 3)
        .pushCoord(1, 3)
        .pushCoord(1, 2)
        .pushBreak()
        .pushCoord(1, 1)
        .pushCoord(2, 1)
        .pushCoord(2, 0)
        .pushCoord(1, 0)
        .pushCoord(1, 1)
        ;

    g.declare('Ä')
        .pushCoord(0, 0)
        .pushCoord(0, 4)
        .pushCoord(1, 5)
        .pushCoord(3, 5)
        .pushCoord(4, 4)
        .pushCoord(4, 0)
        .pushBreak()
        .pushCoord(0, 3)
        .pushCoord(4, 3)
        .pushBreak()
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        .pushCoord(0, 5)
        .pushBreak()
        .pushCoord(3, 5)
        .pushCoord(3, 6)
        .pushCoord(4, 6)
        .pushCoord(4, 5)
        .pushCoord(3, 5)
        ;

    g.declare('Ö')
        .pushCoord(0, 1)
        .pushCoord(0, 4)
        .pushCoord(1, 5)
        .pushCoord(3, 5)
        .pushCoord(4, 4)
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushBreak()
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        .pushCoord(0, 5)
        .pushBreak()
        .pushCoord(3, 5)
        .pushCoord(3, 6)
        .pushCoord(4, 6)
        .pushCoord(4, 5)
        .pushCoord(3, 5)
        ;

    g.declare('Ü')
        .pushCoord(0, 4)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(3, 0)
        .pushCoord(4, 1)
        .pushCoord(4, 4)
        .pushBreak()
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        .pushCoord(0, 5)
        .pushBreak()
        .pushCoord(3, 5)
        .pushCoord(3, 6)
        .pushCoord(4, 6)
        .pushCoord(4, 5)
        .pushCoord(3, 5)
        ;

    g.declare('ä')
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 3)
        .pushCoord(1, 4)
        .pushCoord(3, 4)
        .pushCoord(3, 1)
        .pushCoord(2, 0)
        .pushCoord(1, 0)
        .pushBreak()
        .pushCoord(3, 1)
        .pushCoord(4, 0)
        .pushBreak()
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        .pushCoord(0, 5)
        .pushBreak()
        .pushCoord(2, 5)
        .pushCoord(2, 6)
        .pushCoord(3, 6)
        .pushCoord(3, 5)
        .pushCoord(2, 5)
        ;

    g.declare('ö')
        .pushCoord(4, 1)
        .pushCoord(3, 0)
        .pushCoord(1, 0)
        .pushCoord(0, 1)
        .pushCoord(0, 3)
        .pushCoord(1, 4)
        .pushCoord(3, 4)
        .pushCoord(4, 3)
        .pushCoord(4, 1)
        .pushBreak()
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        .pushCoord(0, 5)
        .pushBreak()
        .pushCoord(2, 5)
        .pushCoord(2, 6)
        .pushCoord(3, 6)
        .pushCoord(3, 5)
        .pushCoord(2, 5)
        ;

    g.declare('ü')
        .pushCoord(0, 4)
        .pushCoord(0, 1)
        .pushCoord(1, 0)
        .pushCoord(2, 0)
        .pushCoord(4, 2)
        .pushBreak()
        .pushCoord(4, 4)
        .pushCoord(4, 0)
        .pushBreak()
        .pushCoord(0, 5)
        .pushCoord(0, 6)
        .pushCoord(1, 6)
        .pushCoord(1, 5)
        .pushCoord(0, 5)
        .pushBreak()
        .pushCoord(2, 5)
        .pushCoord(2, 6)
        .pushCoord(3, 6)
        .pushCoord(3, 5)
        .pushCoord(2, 5)
        ;

    g.declare('ß')
        .pushCoord(0, 0)
        .pushCoord(0, 5)
        .pushCoord(1, 6)
        .pushCoord(2, 6)
        .pushCoord(3, 5)
        .pushCoord(2, 4)
        .pushCoord(3, 3)
        .pushCoord(3, 2)
        .pushCoord(2, 1)
        .pushCoord(1, 1)
        ;

    g.declare('°')
        .pushCoord(1, 5)
        .pushCoord(2, 6)
        .pushCoord(3, 5)
        .pushCoord(3, 4)
        .pushCoord(2, 3)
        .pushCoord(1, 4)
        .pushCoord(1, 5)
        ;
        
    
    // --    
    g.normalize();
}

