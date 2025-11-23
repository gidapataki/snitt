/*
 * $Id: skirt.js $
 *
 * Copyright (c) 2013 Pataki Gida
 *
 */


// margin -> seam allowance

function skirt() {
    var draft={}

    draft.sizing={
        "db|Derékbőség|Főméretek": 68,
        "csb|Csípőbőség": 90,
        "csm|Csípőmélység": 20,
        "szh|Szoknyahossz": 60,
        "margin|Varrásszélesség" : 1,

        "olt_db|Derékbőség|Öltöztetés": 1,
        "olt_csb|Csípőbőség": 2,
    }


    draft.compose = function(size, msg) {
        
        var db=size.db/2+size.olt_db;
        var csb=size.csb/2+size.olt_csb;
        
        var em=10;
        var emcs=30;
        var ss=5;
        var eh=10;
        var kk=(csb-db);
        var kse=kk/4+ss;
        var ksh=kk/4-ss;
        var ke=Math.max(kk/4-eh,0);
        var kh=kk/4+eh;
        
        var p1=new Coord(0,0);
        var p2=p1.dy(-size.csm);
        var p3=p1.dy(-size.szh);
        var p4=p2.dx(-csb/2);
        var p5=p3.ax(p4);
        var p6=p2.dx(-csb);
        var p7=p3.ax(p6);
        var p8=p1.ax(p4);
        var p9=p1.ax(p6);
        var p10=p8.dy(em);
        var p11=p10.dx(ksh);
        var p12=p10.dx(-kse);
        var p13=p1.dx(-csb/6);
        var p14=p9.dx(csb/6);
        var p15=p13.ay(p3);
        var p16=p14.ay(p3);

        var p13b=p13.dx(-csb/6);
        var p14b=p14.dx(csb/6);
        var p15b=p15.dx(-csb/6);
        var p16b=p16.dx(csb/6);
        var p11e=p1.dx(-csb/5);
        var p11c=p11.mid(p11e,.5).ay(p1);
        var p12s=p9.dx(csb/5);
        var p12c=p12.mid(p12s,.5).ay(p1);
        var p4c=p8.mid(p4,.5);
        
        
        var p13s=p13.dx(-kh/2);
        var p13e=p13.dx(kh/2);
        var p13m=p13.ay(p2).dy(emcs);

        var p14s=p14.dx(-ke/2);
        var p14e=p14.dx(ke/2);
        var p14m=p14.ay(p2).dy(emcs);
        
        var hP=new Pattern();
        var eP=new Pattern();
        
        hP.setBase([MOVE,p1,p3,p5,p4,CURVE,p4c,p11,CURVE,p11c,p11e,p1]);
        hP.midlines=[MOVE,p13,p15,MOVE,p13b,p15b,MOVE,p2,p4];
        hP.slimmers=[MOVE,p13s,p13m,p13e];
        hP.guides=[MOVE,p11,p4];
        hP.setMargin(size.margin);
        
        eP.setBase([MOVE,p12,CURVE,p4c,p4,p5,p7,p9,p12s,CURVE,p12c,p12]);
        eP.midlines=[MOVE,p14,p16,MOVE,p14b,p16b,MOVE,p4,p6];
        eP.slimmers=[MOVE,p14s,p14m,p14e];
        eP.guides=[MOVE,p12,p4];
        eP.setMargin(size.margin);
        
        eP.setPos(new Coord(-size.margin*3, 0));
        
        
        return [hP, eP];
    }

    return draft;
}    



