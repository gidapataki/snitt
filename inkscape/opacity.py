#!/usr/bin/env python 
#
# $Id: opacity.py $
#
# Copyright (c) 2012-2013 Pataki Gida
#
#

import inkex
import simplestyle
from lxml import etree

    
class Opacity(inkex.Effect):
    """Opacity toggle"""

    def __init__(self):
        inkex.Effect.__init__(self)


    def setOpacity(self, v0, v1):
        path=inkex.addNS("path","svg")
        root=self.document.getroot()
        findterm=".//%s[@snitt]"%path
        ls=root.findall(findterm)
        v=None
        for item in ls:
            style=simplestyle.parseStyle(item.get("style"))
            if style!=None:
                if v==None:
                    v=float(style["fill-opacity"])
                    v=str(v1 if abs(v-v0)<abs(v-v1) else v0)
                style["fill-opacity"]=v
                item.set("style",simplestyle.formatStyle(style))


    def effect(self):
        self.setOpacity(0, 0.5)


if __name__ == "__main__":
    e = Opacity()
    e.affect()

