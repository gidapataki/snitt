#!/usr/bin/env python 
#
# $Id: tiling.py $
#
# Copyright (c) 2012-2013 Pataki Gida
#
#

import os
import sys
import inkex
import math
import tempfile
import time
from lxml import etree
from subprocess import Popen, PIPE

    
class struct:
    def __init__(self, entries): 
        self.__dict__.update(entries)


class Tiling(inkex.Effect):
    """Tiles the drawing"""

    def __init__(self):
        inkex.Effect.__init__(self)
        self.area=[0,0,0,0]
        self.margin="10mm"



    def exportPages2(self):
        root=self.document.getroot()
        viewbox=root.get("viewBox")
        um=1.0
        if viewbox!=None:
            w=inkex.unittouu(root.get("width"))
            vs=map(float,viewbox.split(" "))
            um=vs[2]/w
        
        g=inkex.etree.Element(inkex.addNS("g", "svg"))
        for node in root:
            g.append(node)
        root.append(g)

        [x0,y0,x1,y1]=self.area
        page=struct((k, inkex.unittouu(v)) for (k,v) in {"w": "210mm", "h": "297mm", "margin": self.margin}.iteritems())
        m=page.margin
        vw=page.w-2*m
        vh=page.h-2*m
        
        dirname="~"
        dirname=os.path.expanduser(dirname)
        dirname=os.path.expandvars(dirname)
        outpdf=dirname+os.path.sep+time.strftime("tiles_%Y%m%d_%H%M%S.pdf")
        temps=[]
        
        for py in range(y0,y1):
            for px in range(x0,x1):
                (x,y)=(px*vw,py*vh)
                (tx,ty)=(-x*um,-y*um)
                g.set("transform", "translate(%.6f, %.6f)" % (tx,ty))
                tmpsvg=tempfile.NamedTemporaryFile()
                tmppdf=tempfile.NamedTemporaryFile()
                temps.append(tmppdf)
                self.document.write(tmpsvg.name)
                cmd=["inkscape", "-A", tmppdf.name, tmpsvg.name]
                p=Popen(cmd, stdout=PIPE, stderr=PIPE)
                rc=p.wait()
                err=p.stderr.read()
        p=Popen(["gs", "-dBATCH", "-dNOPAUSE", "-q", "-sDEVICE=pdfwrite", "-sOutputFile=%s" % outpdf]+[i.name for i in temps])
        p.wait()
        for node in g:
            root.append(node)
        root.remove(g)


    def exportPages(self, g, f, lx, ly):
        dirname="~"
        dirname=os.path.expanduser(dirname)
        dirname=os.path.expandvars(dirname)
        outpdf=dirname+os.path.sep+"output.pdf" #tiling
        temps=[]
        for x in range(lx):
            for y in range(ly):
                g.set("transform", "translate(%s, %s)" % tuple(map(str,f(x,y))))
                tmpsvg=tempfile.NamedTemporaryFile()
                tmppdf=tempfile.NamedTemporaryFile()
                temps.append(tmppdf)
                self.document.write(tmpsvg.name)
                cmd=["inkscape", "-A", tmppdf.name, tmpsvg.name]
                p=Popen(cmd, stdout=PIPE, stderr=PIPE)
                rc=p.wait()
                err=p.stderr.read()
        inkex.errormsg(outpdf)
        p=Popen(["gs", "-dBATCH", "-dNOPAUSE", "-q", "-sDEVICE=pdfwrite", "-sOutputFile=%s" % outpdf]+[i.name for i in temps])
        p.wait()
        
        
    def getPages(self):
        group=inkex.addNS("g","svg")
        root=self.document.getroot()
        findterm=".//%s[@id='pagegrid']"%group
        ls=root.findall(findterm)
        if len(ls)>0:
            area=ls[0].get("area")
            margin=ls[0].get("margin")
            if margin!=None: self.margin=margin
            if area!=None: self.area=map(int, area.split(" "))
            return True
        else:
            return False
            

    def effect(self):
        if self.getPages():
            self.exportPages2()
        


if __name__ == "__main__":
    e = Tiling()
    e.affect()


