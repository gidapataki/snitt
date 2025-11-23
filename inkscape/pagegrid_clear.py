#!/usr/bin/env python 
#
# $Id: pagegrid_clear.py $
#
# Copyright (c) 2012-2013 Pataki Gida
#
#

import inkex
from lxml import etree

    
class Pagegrid(inkex.Effect):
    """Clear pagegrid"""

    def __init__(self):
        inkex.Effect.__init__(self)

    def removeGrid(self):
        group=inkex.addNS("g","svg")
        root=self.document.getroot()
        findterm=".//%s[@id='pagegrid']"%group
        ls=root.findall(findterm)
        for item in ls:
            parent=item.getparent()
            parent.remove(item)

    def effect(self):
        self.removeGrid()
        

if __name__ == "__main__":
    e = Pagegrid()
    e.affect()

