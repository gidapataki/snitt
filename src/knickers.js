/*
 * $Id: knickers.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


  
function knickers() {

    var draft={}

    draft.sizing={
        "db|Derékbőség|Főméretek": 70,
        "csb|Csípőbőség": 90,
        "um|Ülésmélység": 27,
        "margin:mm|Varrásszélesség (mm)": 7,
       
        "lk|Lábköz hossz|Igazítások": 3,
        "ai|Alja ívelés": 2,
        "akb|Aljaközepe bevétel": 1,
        "elkb|Eleje lábköz bőség": 2,
    }



    draft.compose=function(size, msg) {
        
        var d1=size.csb/20+30;
        var d2=10;
        
        var p1=new Coord();
        var p2=p1.dy(d1);
        var p3=p1.dy(-size.lk);
        var p4=p1.dy(size.um);
        var p5=p2.dx(-size.csb/4);
        var p6=p2.dx(size.csb/4);
        var p7=p1.ax(p5);
        var p8=p7.dx(-size.csb/10);
        var p9=p3.ax(p8);
        var p10=p1.ax(p6);
        var p11=p10.dx(size.csb/20+size.elkb);
        var p12=p3.ax(p11);
        var p13=p4.ax(p5);
        var p14=p4.ax(p6);
        
        var p4u=p4.dy(10);
        var p4v=p4u.dx(10);
        var p15=p13.dxy(30,40);
        var p16=p15.intersectCL(size.db/4, p4u, p4v).left;
        var p17=p14.dx(-10);
        var p18=p17.intersectCL(size.db/4, p4u, p4v).left;
        var p19=p3.dy(size.ai);

        var p5c=p15.intersectLL(p5,p7,p8);
        
        var p6c0=p10.dy((p11.x-p10.x)/2);
        var p6c=p17.intersectLL(p6,p6c0,p11);
        var p9b=p9.dx(size.akb);
        var p12b=p12.dx(-size.akb);
        
        var hac=bending(p19.dx(10),p19,p9b,10).curve;
        var eac=bending(p19.dx(-10),p19,p12b,10).curve;
        var p2c=p2.mid(p4,.6);
        var ekc=new Curve(p2,p2c.dx(5),p18);
        var p16b=p2.dir(p16,ekc.len());
        var hkc=new Curve(p2,p2c.dx(-2),p16b);

        var phm1=p5.mid(p1,.5);
        var phm2=phm1.dy(100);
        var pem1=p6.mid(p1,.5);
        var pem2=pem1.dy(100);

        var Pe=new Pattern();
        var Ph=new Pattern();
        Ph.setBase([MOVE,p8,CURVE,p5c,p5,p15,p16b,CURVE,hkc.p1,p2,p19,CURVE,hac.p1,p9b,p8])
        Ph.setMargin(size.margin);
        Ph.midlines=[MOVE,phm1,phm2];

        Pe.setBase([MOVE,p2,CURVE,ekc.p1,p18,p17,p6,CURVE,p6c,p11,p12b,CURVE,eac.p1,p19,p2])
        Pe.setMargin(size.margin);
        Pe.midlines=[MOVE,pem1,pem2];



        //P.guides=[
            //MOVE,p8,p11,p12,p9,p8,
            //MOVE,p7,p13,p14,p10,
            //MOVE,p5,p6,MOVE,p4,p3,
            //MOVE,p6c0,p11,
        //];
        

        var off=new Coord(size.margin*2+20, 0);
        Pe.setPos(off);
        
        return [ Pe, Ph ];
    }


    return draft;
}
