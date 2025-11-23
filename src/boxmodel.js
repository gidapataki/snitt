/*
 * $Id: boxmodel.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


var Orient={ HORZ: 0, VERT: 1 };



// Box

var Box=function(size, div) {
    this.size=(size!=null ? size : -1);
    this.div=div||document.createElement("div");
    this.orient=null;
    this.layout=null;
    this.onSetSize=null;
}


Box.prototype.size=null;
Box.prototype.layout=null;
Box.prototype.orient=null;
Box.prototype.onSetSize=null;


Box.prototype.attach=function(e) {
    if (!this.layout) { this.div.appendChild(e); }
}


Box.prototype.setLayout=function(orient, ls) {
    if (!this.layout) {
        var layout=[];
        for (var i=0; i<ls.length; ++i) {
            var box=new Box(ls[i]);
            var last=(i==ls.length-1);
            layout.push(box);
            this.div.appendChild(box.div);
            box.div.setAttribute("class", (orient==Orient.HORZ ? "h" : "v")+"panel"+(last ? "1" : "0"));    // fixme
        }
        this.layout=layout;
        this.orient=orient;
    }
}


Box.prototype.setSize=function(w, h) {
    setSize(this.div, w, h);
    if (this.onSetSize) { this.onSetSize(this, w, h); }

    if (this.layout) {
        var b=this.layout;
        var ps=[];

        for (var i=0; i<b.length; ++i) { ps.push(b[i].size); }
        
        var sizes=repart((this.orient==Orient.HORZ ? w : h)-b.length+1, ps);
        if  (this.orient==Orient.HORZ)  { for (var i=0; i<b.length; ++i) { b[i].setSize(sizes[i], h); } }
        else                            { for (var i=0; i<b.length; ++i) { b[i].setSize(w, sizes[i]); } }
    }
}



// Helpers

function repart(s, ps) {
    var sum=0;
    var flow=0;
    var sizes=[];
    sizes.length=ps.length;
    for (var i=0; i<ps.length; ++i) {
        if (ps[i]>=0) {
            sum+=ps[i];
            sizes[i]=ps[i];
        }
        else { 
            flow+=-ps[i]; 
            sizes[i]=0;
        }
    }
    if (sum<s && flow>0) {
        var r0=s-sum;
        var u=0;
        var up=0;
        for (var i=0; i<ps.length; ++i) {
            if (ps[i]<0) {
                up+=-ps[i];
                var c=Math.floor(up*r0/flow-u);
                u+=c;
                sizes[i]=c;
            }
        }
    }

    return sizes;
}


function getOffset(el) {
    var x=0;
    var y=0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x+=el.offsetLeft-el.scrollLeft;
        y+=el.offsetTop-el.scrollTop;
        el=el.offsetParent;
    }
    return new Coord(x, y);
}


function setSize(e, w, h) {
    if (e.tagName=="CANVAS") { e.width=w; e.height=h; }
    else if (e.tagName=="svg") { e.setAttribute("width", w+"mm"); e.setAttribute("height", h+"mm"); }
    else { e.style.width=w+"px"; e.style.height=h+"px"; }
}

