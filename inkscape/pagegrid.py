#!/usr/bin/env python 
#
# $Id: pagegrid.py $
#
# Copyright (c) 2012-2013 Pataki Gida
#
#

import os
import sys
import inkex
import math
import tempfile
from lxml import etree
from subprocess import Popen, PIPE


class struct:
    def __init__(self, entries): 
        self.__dict__.update(entries)

    
class Pagegrid(inkex.Effect):
    """Create a grid of pages"""

    def __init__(self):
        inkex.Effect.__init__(self)
        self.margin="10mm"

    
    def getBounds(self, obj, db):
        fields=["x","y","w","h"]
        bounds={}
        oid=obj.get("id")
        if oid in db:
            box=db[oid]
            for i in range(len(fields)):
                bounds[fields[i]]=box[i]
        else:
            for i in range(len(fields)):
                bounds[fields[i]]=0
        return struct(bounds)
    

    def queryAll(self, filename):
        cmd="inkscape --query-all \"%s\"" % (filename)
        p=Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE)
        rc=p.wait()
        err=p.stderr.read()
        db={}
        for line in p.stdout.readlines():
            obj=line.rstrip().split(",")
            db[obj[0]]=map(float,obj[1:])
        return db


    def removeGrid(self):
        group=inkex.addNS("g","svg")
        root=self.document.getroot()
        findterm=".//%s[@id='pagegrid']"%group
        ls=root.findall(findterm)
        for item in ls:
            parent=item.getparent()
            parent.remove(item)


    def setPageSize(self):
        root=self.document.getroot()
        view=root.get("viewBox")
        if view!=None:
            root.set("viewBox","0 0 210 297")   # A4
        root.set("width","210mm")
        root.set("height","297mm")


    def createGrid(self, bounds, page):
        root=self.document.getroot()
        (um,dx,dy)=(1,0,0)
        viewbox=root.get("viewBox")
        if viewbox!=None:
            w=inkex.unittouu(root.get("width"))
            vs=map(float,viewbox.split(" "))
            um=vs[2]/w
            dx=vs[0]/um
            dy=vs[1]/um
        m=page.margin
        vw=page.w-2*m
        vh=page.h-2*m
        g=inkex.etree.Element(inkex.addNS("g", "svg"))
        uu=lambda v: inkex.unittouu(v)*um
        s="stroke-linejoin: miter; stroke-opacity: 1.0; fill-opacity: 1.0; stroke: #000000; stroke-linecap: butt; fill: none;"
        sm=s+"stroke-width: %.6f;" % (uu("0.5mm"));
        sl=s+"stroke-width: %.6f; stroke-dasharray: %.6f,%.6f;" % (uu("0.2mm"), uu("2mm"), uu("4mm"))
        st="font-family: georgia; font-size: %.6f; fill: #000000; fill-opacity: 0.1; text-anchor:middle; text-align:center;" % (uu("40mm"))

        pos=lambda x,y: "%.6f,%.6f"%(x*um,y*um)
        tpos=lambda x: "%.6f"%(x*um)
        floor=math.floor
        ceil=math.ceil
        box=[dx+bounds.x,dy+bounds.y,dx+bounds.x+bounds.w,dy+bounds.y+bounds.h]
        for i in range(4): box[i]-=m
        (x0,y0,x1,y1)=(int([math.floor,math.ceil][i//2](box[i]/float([vw,vh][i%2]))) for i in range(4))
        
        for px in range(x0, x1+1):
            (x,ys,ye)=(m+px*vw,m+y0*vh,m+y1*vh)
            d=" ".join(["M",pos(x,ys),"L",pos(x,ye)])
            attrs={"style": sl, "d": d}
            inkex.etree.SubElement(g, inkex.addNS("path","svg"), attrs)

        for py in range(y0, y1+1):
            (y,xs,xe)=(m+py*vh,m+x0*vw,m+x1*vw)
            d=" ".join(["M",pos(xs,y),"L",pos(xe,y)])
            attrs={"style": sl, "d": d}
            inkex.etree.SubElement(g, inkex.addNS("path","svg"), attrs)

        for px in range(x0, x1+1):
            for py in range(y0, y1+1):
                (x,y)=(m+px*vw,m+py*vh)
                d=" ".join(["M",pos(x-m,y),"L",pos(x+m,y),"M",pos(x,y-m),"L",pos(x,y+m)])
                attrs={"style": sm, "d": d}
                inkex.etree.SubElement(g, inkex.addNS("path","svg"), attrs)
                if px<x1 and py<y1:
                    (tx,ty)=(x+vw/2, y+vh/2+inkex.unittouu("20mm"))
                    textattrs={"style": st, "x": tpos(tx), "y": tpos(ty)}
                    text=inkex.etree.SubElement(g, inkex.addNS("text","svg"), textattrs)
                    text.text=self.pageID(px-x0, py-y0)
               
        g.set("id", "pagegrid")
        g.set("area", " ".join(map(str,[x0,y0,x1,y1])))
        g.set("info", "um=%f" %(um))
        g.set("margin", self.margin)
        g.set(inkex.addNS("insensitive", "sodipodi"), "true")
        root.append(g)


    def writeTemp(self):
        tmpsvg=tempfile.NamedTemporaryFile()
        self.document.write(tmpsvg.name)
        return tmpsvg


    def pageID(self, r, c):
        s=chr(65+r%26)+str(c+1)
        p=r//26
        if p>0:
            s=str(p+1)+s
        return s


    def effect(self):
        self.removeGrid()
        self.setPageSize()
        svgfile=self.writeTemp()
        db=self.queryAll(svgfile.name)
        root=self.document.getroot()
        bounds=self.getBounds(root, db)
        page=struct((k, inkex.unittouu(v)) for (k,v) in {"w": "210mm", "h": "297mm", "margin": self.margin}.iteritems())
        self.createGrid(bounds, page)
        
        

if __name__ == "__main__":
    e = Pagegrid()
    e.affect()

