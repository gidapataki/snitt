/*
 * $Id: class.js $
 *
 * Copyright (c) 2013 Pataki Gida
 *
 */


function Class(def) {
    var cc=def.init;
    var keywords=/^(init|static|prototype)$/;
    for (i in def) {
        if (!keywords.test(i)) { cc.prototype[i]=def[i]; }
    }
    if ('static' in def) {
        for (i in def.static) { cc[i]=def.static[i]; }    
    }
    return cc;
}
