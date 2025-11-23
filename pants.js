/*
 * $Id: pants.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */


    
function pants() {

    var draft={}

    draft.sizing={
        "db|Derékbőség|Főméretek": 72,
        "csb|Csípőbőség": 94,
        "oh|Oldalhossza": 108,
        "uh|Üléshossza": 27,
        "tb|Térdbőség": 38,
        "ab|Aljabőség": 38,
        "margin|Varrásszélesség": 1,
       
        "ah|Rövidülés|Igazítások": 3,
        "ensz|Eleje derékformázó": 0,
        "hnsz|Háta derékformázó": 2,
        "fd|Fenékdomborulat": 4,
        "olt_hsz|Háta öltöztetés": 0.5,
        
        "hkd|Hátaközepe ívelés|Közepe ívek": 2,
        "ekd|Elejeközepe ívelés": 2,

        "hszd|Hátaszéle ívelés|Széle ívek": 2,
        "eszd|Elejeszéle ívelés": 2,
        "hsza|Hátaszéle ív aránya": 0.7,
        "esza|Elejeszéle ív aránya": 0.7,
        "hcsi|Háta csípőívelés": 4,
    }


    draft.compose = function(size, msg) {
        var bh=size.oh-size.uh;
        var tem=0.6*bh;
        var hsz=size.csb/4+10+size.olt_hsz;
        var hx=20;
        var esza=size.esza/10;
        var hsza=size.hsza/10;
        var hst=size.hnsz/4;
        

        var Y=new Coord(0,1);
        
        
        var p1=new Coord(0, 0);
        var p2=p1.dx(-size.uh);
        var p3=p1.dx(-size.oh);
        var p4=p3.dx(tem);
        var p5=p3.dx(size.ah);
        var p6=p2.dx(size.csb/20+30);
        var p7=p1.dx(-10);
        var p8=p6.dy(size.csb/4-10);
        var p8a=p8.ax(p2);
        var p9=p8.dy(size.csb/20+10);       // + 10-20
        var p10=p6.mid(p9, 0.5);
        var p11=p10.ax(p5);
        var p11a=p10.ax(p4);
        var p12=p10.ax(p7);
        var p13=p7.ay(p8);
        var p14=p11a.dy(-(size.tb/4-10));
        var p15=p11a.dy(p11a.y-p14.y);
        var p16=p11.dy(-(size.ab/4-10));
        var p17=p11.dy(p11.y-p16.y);
        var p2b=p2.intersectLL(p2.dy(1),p14,p6);
        
        var p18=p9.intersectLL(p15, p8a, p2);
        var p18b=p18.dy(5);
        var p8b=p8a.dx((p18.y-p8a.y)/2);
        var p8d=p8.dy(5);
        var p13a=p13.dy(-10);
        var p13b=p13.mid(p12, 0.5);
        var p13c=p13b.intersectVL(p13a.to(p8d).lnormal(), p8d, p13a);
        var p19a=p13c.intersectCL(size.db/4+size.ensz, p13, p7).left;
        var p19=p6.extend(p19a,10);
        var p12c=p12.mid(p19a,0.75);
        var edc=new Curve(p12,p12c,p19);
        var p19c=p19.intersectVL(p12c.to(p19).lnormal(), p6, p7);
        var ekc=inflexion(p16,p14,p6,p1,esza,size.eszd);
        var ekcu=new Curve(p19,p19c,p6);
        var p6cc=ekc.second.reversed().plot();
        var p14cc=ekc.first.reversed().plot();
        var ebc=bending(p17,p15,p18b,size.ekd);
        var p15cc=ebc.curve.plot();
        var p19cc=ekcu.plot();
        
        var p8m=p18.intersectLL(p8b,p13a,p8d);
        var p18c=p8d.extend(p8m,-1);

        var eszL=ekc.first.len()+ekc.second.len()+ekcu.len();
        var ekL=ebc.curve.len();
        
        var esm=edc.mid(0.5);
        var es0=esm.dir(p12,size.ensz/2);
        var es1=esm.dir(p19,size.ensz/2);
        var esx=esm.dx(-(slimmer(size.ensz)-10));
        var patE=new Pattern();
       
        patE.setBase([MOVE,p13c,CURVE,p13b,p12,CURVE,p12c,p19,p19cc,p6cc,p14cc,p16,p17,p15,p15cc,CURVE,p18c,p8d,p13c]);
        patE.setMargin(size.margin);

        patE.slimmers=(size.ensz>0 ? [MOVE,es0,esx,es1] : []);
        patE.midlines=[MOVE,esm,esx, MOVE,p11,p12, MOVE,p8d,p6, MOVE,p15,p14, MOVE,p18b,p2b,];
        patE.guides=[MOVE,p15,ebc.curve.p1,p18b, MOVE,p14,MOVE,p14,ekc.first.p1,ekc.mid, MOVE,p19,p6,p14,MOVE,p13a,p8m,MOVE,p8,p18,
            MOVE,p8a,p13,p7,MOVE,p18,p8b,MOVE,p1,p5,p11,MOVE,p15,p9,p8d, ];


        // háta
        var p20=p2.dx(size.fd);
        var p21=p10.dy(10);
        var p22=p21.dy(hsz/4);
        
        var d2022=p20.to(p22).norm();
        var d620=p20.to(p6).norm();
        var d622=p6.to(p22).norm();
        var r24=hsz/d622;
        var p23=p22.dv(p20.to(p22).rnormal(r24*d620));
        var p24=p6.dy(-(r24*d2022-d622));
        var p25=p21.dy(p21.y-p24.y);
        var p2u=p2.ay(p25);
        var p26=p14.dy(-hx);
        var p27=p15.dy(hx);
        var p28=p16.dy(-hx);
        var p29=p17.dy(hx);
        var p30=p27.to(p25).normalized(p15.to(p18b).norm()).dv(p27);
        var p31=p26.intersectLL(p24,p13,p7);
        var p32=p11a;
        var p33=p32.intersectCL(p32.to(p31).norm()-10, p22, p23).right;
        var p34=p33.dir(p31, 10);
        var hmc=tulip(p22,p34, 0.5, 5);
        var p23cc=hmc.first.plot();
        var p34cc=hmc.second.plot();
        var p35=p34.dir(p31,size.db/4 + size.hnsz); 
        var hkc=smoothing(p28,p26,p24,hsza,size.hszd);
        var p26cc=hkc.first.reversed().plot();
        var p24cc=hkc.second.reversed().plot();
        var hkcu=bending(p26,p24,p35,size.hcsi);
        var p35cc=hkcu.curve.reversed().plot();
        
        var hszL=hkc.first.len()+hkc.second.len()+hkcu.curve.len();
        var p35b=(eszL>hszL) ? hkcu.curve.p1.extend(p35,eszL-hszL) : p35;
        
        var p36=p35.mid(p34,0.5);
        var p36c=p36.mid(p35,0.7);
        var p30c=p30.intersectVL(Y.dx(0.1),p22,p23);
        var hbc=bending(p29,p27,p30,size.hkd);
        var p27cc=hbc.curve.plot();
        var hkL=hbc.curve.len();
        
        var p36x=p36.intersectVL(p23.to(p24).lnormal(),p23,p24);
        var p36e=p36.dir(p36x, slimmer(size.hnsz)-10);
        var p36s0=p36.dir(p34, size.hnsz/2);
        var p36s1=p36.dir(p35, size.hnsz/2);
        var hsc0=tulip(p36s0,p36e,0.5,-hst);
        var hsc1=tulip(p36s1,p36e,0.5, hst);
        var p36cc0=[hsc0.first.plot(), hsc0.second.plot()];
        var p36cc1=[hsc1.second.reversed().plot(), hsc1.first.reversed().plot()];
        var patH=new Pattern();
        
        patH.setBase([MOVE,p26,p28,p29,p27,p27cc,CURVE,p30c,p22,p23cc,p34cc,p36,CURVE,p36c,p35b,p35,p35cc,p24,p24cc,p26cc]);
        patH.setMargin(size.margin);

        patH.slimmers=(size.hnsz>0 ? [MOVE,p36s0,p36cc0,p36cc1] : []);
        patH.midlines=[MOVE,p36,p36e, MOVE,p11,p12,MOVE,p26,p27, MOVE,p20,p22,p24,p23,];
        patH.guides=[MOVE,p36s0,p36e,p36s1,MOVE,p24,p35,MOVE,p30,p30c,p22, MOVE,p6,p14,p16,p17,p15,p9,MOVE,p26,p31,MOVE,p2,p2u,MOVE,p1,p5,p11,
            MOVE,p33,p31,p13,p8,MOVE,p22,p25,p27,];
        
        
        var boxE=getBounds([patE]);
        var boxH=getBounds([patH]);
        var off=new Coord(0,boxE.hi.y-boxH.lo.y);
        patH.setPos(off);
       
        return [
            patE,
            patH,
        ];
    }

    return draft;
}
