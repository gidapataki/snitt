/*
 * $Id: framework.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


var xmlns="http://www.w3.org/2000/svg";
var layout={};
var view={};
var model={};
var defaultFont=null;

model.drafts=[];
model.drawings=[];
view.input={};
view.assist={};
view.settings={
    "keepzoom:bool|Zoom megtartása": true,
    "guides:bool|Segédvonalak": false,
};



// Type transformations ////////////////////////////////////////////////////////

var typeMod={
    "cm": 10,
    "ratio": 0.01,
    "angle": Math.PI/180,
}


function fromInput(t, v) {
    if (t in typeMod) {
        var m=typeMod[t];
        return m*v;
    }
    else { return v; }
}


function toInput(t,v) {
    if (t in typeMod) {
        var m=typeMod[t];
        return parseFloat((v/m).toFixed(6));
    }
    else { return v; }
}



// Helpers /////////////////////////////////////////////////////////////////////

if (!Array.prototype.last) {
    Array.prototype.last=function() {
        return this[this.length-1];
    }
}


if (!Array.prototype.at) {
    Array.prototype.at=function(n) {
        return this[n>=0 ? n : this.length+n];
    }
}


if (!Array.prototype.forEach) {
    Array.prototype.forEach=function(f) {
        for (var i=0; i<this.length; ++i) {
            f(this[i],i,this);
        }
    }
}


if (!Array.prototype.extend) {
    Array.prototype.extend=function(ls) {
        for (var i=0; i<ls.length; ++i) {
            this.push(ls[i]);
        }
    }
}


if (!Number.prototype.div) {
    Number.prototype.div=function(d) {
        return Math.floor(this/d);
    }
}

if (!Number.prototype.sgn) {
    Number.prototype.sgn=function() {
        return (this>0 ? 1 :(this<0 ? -1 : 0));
    }
}


if (!Number.prototype.eq) {
    Number.prototype.eq=function(n) {
        return (Math.abs(this-n)<.00000095367431640625); // 2^-20
    }
}


function elementById(id) {
    return document.getElementById(id);
}


function elementsByNames(ls) {
    var els=[];
    for (var i=0; i<ls.length; ++i) {
        var es=document.getElementsByName(ls[i]);
        for (var i=0; i<es.length; ++i) { var e=es[i]; els.push(e); }
    }
    return els;
}


function inherit(baseClass, subClass) {
    function inheritance() {}
    inheritance.prototype=baseClass.prototype;
    subClass.prototype=new inheritance();
    subClass.prototype.constructor=subClass;
    subClass.base=baseClass;
    return subClass;
}


function getCookies() {
    var ls=document.cookie.split(";");
    var map={};

    for (var i=0; i<ls.length; ++i) {
        var c=ls[i];
        var si=c.indexOf("=");
        var k=c.substr(0,si).replace(/^\s+|\s+$/g,"");
        var v=c.substr(si+1);
        map[unescape(k)]=unescape(v);
    }

    return map;
}


function setCookies(map) {
    var ls=[];

    for (var k in map) {
        var c=escape(k)+"="+escape(map[k]);
        ls.push(c);
    }
    document.cookie=ls.join(";");
}


function addWheelListener(element, func) {
    function listener(e) {
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        func(e, delta);
        return false;
    }

    if (element.addEventListener) {
        element.addEventListener("mousewheel", listener, false);           // IE9, Chrome, Safari, Opera
        element.addEventListener("DOMMouseScroll", listener, false);       // FFX
    }
    else { element.attachEvent("onmousewheel", listener); }                // IE 6/7/8
}


function blend(dst,src,a) {
    var out={};
    for (k in src) {
        out[k]=Math.round(src[k]*a+dst[k]*(1-a));
    }
    return out;
}



function slimmer(n) {
    return Math.round((n-10)*7/2+80);
}


function solve(a, b, c) {
    var d=b*b-4*a*c;
    if (d>=0) {
        var x0=-b/(2*a);
        var ds=Math.sqrt(d)/(2*a);
        return [x0+ds, x0-ds];
    }
    else { return null; }
}



// Layout //////////////////////////////////////////////////////////////////////

function createLayout() {
    var body=elementById("body");
    var menu=elementById("menu");
    var rmenu=elementById("rmenu");
    var box=new Box(0, body);

    var scrollDiv=document.createElement("div");
    var sizingTable=document.createElement("table");
    var auxTable=document.createElement("table");
    var canvas=document.createElement("canvas");
    var svg=document.createElementNS(xmlns, "svg");
    var img=document.createElement("img");
    var messages=document.createElement("pre");

    var cmode=document.createElement("a");
    var smode=document.createElement("a");
    var text=document.createElement("text");

    box.setLayout(Orient.HORZ, [270, -1]);
    var leftBox=box.layout[0];
    var rightBox=box.layout[1];

    leftBox.setLayout(Orient.VERT, [-1, 60]);
    rightBox.setLayout(Orient.VERT, [-1, 0]);

    scrollDiv.setAttribute("id", "scrollDiv");
    scrollDiv.appendChild(sizingTable);

    leftBox.layout[0].attach(scrollDiv);
    leftBox.layout[1].attach(auxTable);
    rightBox.layout[0].attach(canvas);
    rightBox.layout[0].attach(svg);
    rightBox.layout[0].attach(img);
    rightBox.layout[1].attach(messages);

    rmenu.appendChild(cmode);
    rmenu.appendChild(smode);

    leftBox.layout[0].div.setAttribute("id", "sizing");
    leftBox.layout[1].div.setAttribute("id", "settings");

    leftBox.layout[0].onSetSize=function(b, w, h) {
        setSize(layout.scrollDiv, w, h);
    }

    rightBox.layout[0].onSetSize=function(b, w, h) {
        setSize(layout.canvas, w, h);
        setSize(layout.svgimg, w, h);
    }

    rightBox.layout[1].onSetSize=function(b, w, h) {
        setSize(layout.messages, w, h);
    }

    leftBox.div.setAttribute("id", "leftbox");

    cmode.href="#canvas";
    smode.href="#svg";
    cmode.innerHTML="Canvas";
    smode.innerHTML="SVG";
    cmode.setAttribute("class", "active");
    smode.setAttribute("class", "inactive");
    cmode.setAttribute("onclick", "setMode(0); blur();");
    smode.setAttribute("onclick", "setMode(1); blur();");
    svg.setAttribute("version", "1.1");

    canvas.style.display="none";
    img.style.display="block";

    layout.modes=[cmode, smode];
    layout.targets=[canvas, img];
    layout.menu=menu;
    layout.rmenu=rmenu;
    layout.box=box;
    layout.body=body;
    layout.sizingTable=sizingTable;
    layout.scrollDiv=scrollDiv;
    layout.auxTable=auxTable;
    layout.svg=svg;
    layout.svgimg=img;
    layout.canvas=canvas;
    layout.messages=messages;
    window.onresize=refreshLayout;

    refreshLayout();
}


function draftId(id) {
    return "draft"+id;
}


function createDraftTab(id, name) {
    var anchor=document.createElement("a");
    var sep=document.createTextNode(" · ")

    anchor.setAttribute("class", "inactive");
    anchor.setAttribute("id", draftId(id));
    anchor.innerHTML=name;
    anchor.href="#"+name;
    anchor.setAttribute("onclick", "selectDraft("+id+"); blur();");

    layout.menu.appendChild(sep);
    layout.menu.appendChild(anchor);
}


function selectDraft(id) {
    for (var i=0; i<model.drafts.length; ++i) {
        var anchor=document.getElementById(draftId(i));
        anchor.setAttribute("class", i==id ? "active" : "inactive");
    }
    selectDrawing(model.drawings[id]); // fixme
    invalidate();
}


function refreshLayout() {
    var W=window.innerWidth;
    var H=window.innerHeight;
    var top=getOffset(layout.body).y;
    layout.box.setSize(W, H-top);
    invalidate();
}



// View ////////////////////////////////////////////////////////////////////////

function createView() {
    var canvas=layout.canvas;
    var dc=new CanvasContext(canvas, "#221D22");
    var sc=new SVGContext(layout.svg);

    dc.addTool("guide", new CanvasTool({ lineWidth: 0.4, strokeStyle: "rgba(255,255,255,0.7)" }));
    dc.addTool("midline", new CanvasTool({ lineWidth: 0.4, strokeStyle: "rgba(255,255,255,0.7)" }));
    dc.addTool("sewline", new CanvasTool({ lineWidth: 0.6, strokeStyle: "rgba(255,255,255,0.7)" }));
    dc.addTool("outline", new CanvasTool({ lineWidth: 1, strokeStyle: "rgba(255,255,255,0.7)", fillStyle: "rgba(255,255,255,0.2)" }));

    dc.addTool("assist_node", new CanvasTool({ lineWidth: 1, strokeStyle: "#000", fillStyle: "#f05" }));
    dc.addTool("assist_arc", new CanvasTool({ lineWidth: 2, strokeStyle: "rgba(120,0,40,1)" }));


    sc.addTool("guide", new SVGTool({ style: "fill:none;stroke:#000000;stroke-opacity:1;stroke-width:.2" }));
    sc.addTool("midline", new SVGTool({ style: "fill:none;stroke:#000000;stroke-opacity:1;stroke-width:.2" }));
    sc.addTool("sewline", new SVGTool({ style: "fill:none;stroke:#000000;stroke-opacity:1;stroke-width:.3" }));
    sc.addTool("outline", new SVGTool({ style: "fill:#000000;fill-opacity:0.5;stroke:#000000;stroke-width:.4", snitt: 1 }));

    view.canvasDC=dc;
    view.svgDC=sc;
    view.drawing=null;
    view.drag=false;
    view.locate=false;
    view.dragPos=null;
    view.invalid=false;
    setMode(0);
    setInterval(draw, 20);

    canvas.onmousedown=onpress;
    canvas.onmousemove=ondrag;
    canvas.onmouseup=onrelease;
    canvas.onmouseover=onenter;
    canvas.onmouseout=onleave;
    document.onkeyup=function(ev) { if (ev.keyCode==32) { zoomToFit(); } }
    addWheelListener(canvas, onscroll);
}


function setMode(n) {
    for (var i=0; i<layout.modes.length; ++i) {
        layout.modes[i].setAttribute("class", (i==n ? "active" : "inactive"));
        layout.targets[i].style.display=(i==n ? "block" : "none");
    }
    view.mode=n;
    invalidate();
}



function draw() {
    if (view.invalid) {
        view.invalid=false;
        if (view.mode==0) {  // canvas
            var dc=view.canvasDC;
            dc.clear();
            dc.drawGrid(100);
            dc.allowGuides(view.drawing.settings.guides);
            if (view.drawing) {
                (new Plotter(dc)).plot(view.drawing.pattern);
                if (view.assist.arc) {
                    var arc=view.assist.arc;
                    (new Plotter(dc)).plot(arc.pattern.offsetPlot([TOOL,"assist_arc",arc.plot]));
                }

                if (view.assist.hitResult) {
                    var hr=view.assist.hitResult, hr2=view.assist.hitResult2;
                    var p=hr.q, q=hr2.q;
                    var r=2/dc.zoom;
                    var p0=p.dxy(r,r), p1=p.dxy(-r,-r);
                    var q0=q.dxy(r,r), q1=q.dxy(-r,-r);

                    (new Plotter(dc)).plot([TOOL,"assist_node",RECT,p0,p1,RECT,q0,q1]);
                }

                dc.drawInfo(view.assist);
            }
        }
        else {  // svg
            var dc=view.svgDC;
            dc.clear();
            if (view.drawing) {
                (new Plotter(dc)).plot(view.drawing.pattern);
            }

            var svg=layout.svg;
            var svg_xml=(new XMLSerializer()).serializeToString(svg)
            var svg_dataurl="data:image/svg+xml;base64," + window.btoa(svg_xml);
            layout.svgimg.src=svg_dataurl;
        }
    }
}


function invalidate() {
    view.invalid=true;
}


function pageToCanvas(pos0) {
    var pos=pos0.conjugated().dy(layout.canvas.height);
    var dc=view.canvasDC;
    return pos.mul(1/dc.zoom).dv(dc.origin.neg());
}


function mousePos(e) {
    return getOffset(e.target).neg().dxy(e.clientX, e.clientY);
}


function onscroll(e, delta) {
    var z=1.15;
    var lb=0.9, hb=1.1;
    if (delta<0) { z=1/z; }
    var dc=view.canvasDC;
    var nz=dc.zoom*z;
    if (nz>lb && nz<hb) { nz=1; }

    if (nz>0.1 && nz<1000) {
        var mp=pageToCanvas(mousePos(e));
        dc.origin=mp.to(dc.origin.dv(mp).mul(dc.zoom/nz));
        dc.zoom=nz;
        invalidate();
    }
}


function hitPoint(p, px) {
    var pat=view.drawing.pattern;
    var d=px/view.canvasDC.zoom;
    var hr=null;

    for (var i=0; i<pat.length; ++i) {
        if (pat[i] instanceof Pattern) {
            var hr0=pat[i].hitTest(p, d, d);
            if (hr0 && (hr==null || hr.d>hr0.d)) { hr=hr0; }
        }
    }
    return hr;
}



function onpress(e) {
    if (e.button==0) {
        var p=pageToCanvas(mousePos(e));
        var hr=hitPoint(p, 10);
        view.assist.hitResult=hr;
        view.assist.hitResult2=hr;
        view.assist.arc=null;
        if (hr!=null) { view.locate=true; }
        invalidate();
    }
    else if (e.button==1) {
        view.drag=true;
        view.dragPos=pageToCanvas(mousePos(e));
    }
}


function ondrag(e) {
    if (view.locate) {
        var p=pageToCanvas(mousePos(e));
        var hr=hitPoint(p, 10);
        var ahr=view.assist.hitResult;
        if (hr!=null && ahr.pattern==hr.pattern) {
            view.assist.hitResult2=hr;
            view.assist.arc={ "pattern": hr.pattern, "plot": hr.pattern.subPlot(ahr, hr) };
        }
        else { view.assist.hitResult2=ahr; view.assist.arc=null; }
        invalidate();
    }
    if (view.drag) {
        var m=mousePos(e);
        var dc=view.canvasDC;
        dc.origin=m.conjugated().dy(layout.canvas.height).mul(1/dc.zoom).dv(view.dragPos.neg());
        invalidate();
    }
}


function onrelease(e) {
    if (e.button==0) { view.locate=false; }
    if (e.button==1) {
        view.drag=false;
        view.dragPos=null;
    }
}


function onleave(e) {
    view.locate=false;
    view.drag=false;
    view.dragPos=null;
}


function onenter(e) {}



function resetTable(table, sizing, values, onChange) {
    var lastRow=0;
    var inputs={};

    for (var i=table.rows.length; i-- >0; ) { table.deleteRow(i); }

    for (sd in sizing) {
        var sa=sd.split("|");
        var na=sa[0].split(":");
        var id=sa[0];
        var name=na[0];
        var t=(na.length>1 ? na[1] : "cm");
        var desc=sa[1];
        var cat=sa[2];
        if (!desc) { desc=id; }

        if (cat) {
            var row=table.insertRow(lastRow++);
            var cell=row.insertCell(0);
            cell.innerHTML=cat;
            cell.setAttribute("colspan", 2);
            cell.setAttribute("class", "category");
        }

        var row=table.insertRow(lastRow++);
        var cell0=row.insertCell(0);
        var cell=row.insertCell(1);
        var node=document.createElement("input")
        var value=toInput(t, values[name]);

        if (t=="bool") {
            node.setAttribute("type", "checkbox");
            node.checked=value;
            node.onchange=onChange;
        }
        else {
            node.setAttribute("type", "text");
            node.setAttribute("value", value);
        }

        cell0.innerHTML=desc;
        cell0.setAttribute("class", "descCell");
        node.setAttribute("class", "sizeInput");
        cell.setAttribute("class", "inputCell");
        cell.appendChild(node);

        inputs[id]=node;
        node.onkeyup=function(ev) { if (ev.keyCode == 13) { onChange(); } }
    }
    return inputs;
}


function selectDrawing(drawing) {
    view.drawing=drawing;
    view.input.sizes=resetTable(layout.sizingTable, drawing.draft.sizing, drawing.sizes, redraft);
    view.input.settings=resetTable(layout.auxTable, view.settings, drawing.settings, refresh);
    view.assist={};
    zoomToFit();
}


function zoomToFit() {
    var bounds=new Bounds();
    (new Plotter(new BoundingBoxContext(bounds))).plot(view.drawing.pattern);
    view.canvasDC.zoomToFit(bounds);
    invalidate();
}


function addMessage(s) {
    var m=layout.messages;
    m.firstChild.nodeValue += "\n" + s.toString();
}


function getValues(inputs) {
    var values={};

    for (i in inputs) {
        var ia=i.split(":");
        var name=ia[0];
        var t=(ia.length>1 ? ia[1] : "cm");
        var v=(t=="bool" ? inputs[i].checked : inputs[i].value);
        values[name]=fromInput(t, v);
    }

    return values;
}


function refresh() {
    var settings=getValues(view.input.settings);
    var drawing=view.drawing;

    drawing.settings=settings;
    invalidate();
}


function redraft() {
    var sizes=getValues(view.input.sizes);
    var drawing=view.drawing;

    drawing.pattern=drawing.draft.compose(sizes, console.debug);
    drawing.sizes=sizes;
    invalidate();
    if (!drawing.settings.keepzoom) { zoomToFit(); }
}




// Model ///////////////////////////////////////////////////////////////////////

function getDefaults(ss) {
    var defs={};
    for (sd in ss) {
        var sa=sd.split("|");
        var na=sa[0].split(":");
        var n=na[0];
        var t=(na.length>1 ? na[1] : "cm");
        var v=ss[sd];
        defs[n]=fromInput(t, v);
    }
    return defs;
}


function addDraft(name, ctor) {
    var draft=ctor();
    var drawing={};
    var id=model.drawings.length;

    draft.name=name;
    drawing.draft=draft;
    drawing.sizes=getDefaults(draft.sizing);
    drawing.settings=getDefaults(view.settings);

    drawing.pattern=draft.compose(drawing.sizes, console.debug);
    model.drafts.push(draft);
    model.drawings.push(drawing);
    createDraftTab(id, name);
}

