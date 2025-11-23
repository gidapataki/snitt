/*
 * $Id: shirt.js $
 *
 * Copyright (c) 2012-2013 Pataki Gida
 *
 */



function shirt() {
    var draft={}

    draft.sizing={
        "tm|Magasság|Főméretek": 173,
        "mb|Mellbőség": 94,
        "db|Derékbőség": 72,
        "csb|Csípőbőség": 90,
        "egh|Egészhossz": 70,
        "uh|Ujjahossz" : 59,
        "csub|Csuklóbőség": 20,
        "margin|Varrásszélesség" : 1,
        
        "olt_hm|Hónaljmélység|Öltöztetés": 0.5,
        "olt_hsz|Hátszélesség": 0.5,
        "olt_hosz|Hónaljszélesség": 1,
        "olt_msz|Mellszélesség": 1,
        "olt_db|Derékbőség": 2,
        "olt_csb|Csípőbőség": 1.5,
        
    }


    draft.compose = function(size, msg) {
        
        // BODY ////////////////////////////////////////////////////////////////
        
        var hm=Math.round(size.mb/10+105+size.olt_hm);
        var dh=Math.round(size.tm/4-10);
        var csm=hm+dh;
        var hsz=Math.round(size.mb/8+55+size.olt_hsz);
        var hosz=Math.round(size.mb/8-15+size.olt_hosz);
        var hoszE=Math.round(hosz/3);
        var hoszH=hosz-hoszE;
        var msz=Math.round(size.mb/4-40+size.olt_msz)
        var mt=Math.round(size.mb/10+5)
        var nysz=Math.round(size.mb/20+20)
        var ehx = function(mb) {
            var bt=Math.round((mb-100*10)/10)
            if      (mb<=80*10)  { return 35; }
            else if (mb<=90*10)  { return 40; }
            else if (mb<=100*10) { return 45; }
            else if (mb<=110*10) { return 45+bt; }
            else if (mb<=120*10) { return 50+bt; }
            else if (mb<=130*10) { return 55+bt; }
            else                 { return 60+bt; }
        }
        var eh2=dh+ehx(size.mb)
        var mm2=Math.round(size.mb/4+30)
        
        var hx=15;
        var nyx=20;
        var vlx=15;
        var vdx=10;
        var hix=13;
        var kx=60;
        var hea=10;
        
        // points 
    
        var p0=null
        var p1=new Coord(0, 0);
        var p2=p1.dx(-hm);
        var p3=p1.dx(-dh);
        var p4=p1.dx(-csm);
        var p5=p1.dx(-size.egh);
        var bcrop=(csm>=size.egh);
        var p6=p3.dy(hx);
        var p7=p4.dy(hx);
        var p8=p5.dy(hx);
        var p9=p2.dy(Math.round(hx*hm/dh));
        var p10=p9.dy(hsz);
        var p11=p10.dy(hoszH);
        var p11a=p11.dy(kx);
        var p12=p11a.dy(hoszE);
        var p13=p12.dy(msz);
        var p14=p13.dy(-mt);
        var p15=p1.dy(nysz-5);
        var p16=p15.dx(nyx);
        var p17=p1.ay(p10);
        var p18=p17.dx(-vlx);
        var p19=p18.dv(p16.to(p18).normalized(vdx));
        var p20=p10.mid(p18, 0.25);
        var p21=p20.dy(hix);
        var p22=p12.ax(p20);
        var p23=p12.ax(p18).dx(-20);
        var p24=p3.ay(p14);
        var p25=p24.dx(eh2);
        var p26=p25.dx(-mm2);
        var p27=p12.intersectCC(p12.to(p23).norm(), p23, Math.round(size.mb/20)).right;
        var p28=p26.intersectCC(mm2, p27, p16.to(p19).norm()-10).left;
        var p29=p25.ay(p13)
        var p30=p29.dy(-(nysz-5))
        var p31=p29.dx(-(nysz+10))
        var p32=p28.dv(p28.to(p27).normalized(p25.to(p30).norm()));
        var p33=p26.dx(p26.to(p32).norm());
        var p34=p3.ay(p12);
        var p35=p34.dy(Math.round(size.db/4-10))
        var p36=p35.dy(-Math.round(kx+size.db/2+size.olt_db))
        var p37=p3.ay(p13);
        var p38=p4.ay(p12);
        var p39=p38.dy(p34.to(p35).norm()+20);
        var p40=p39.dy(-(kx+size.csb/2+size.olt_csb));
        var p41=p4.ay(p13);
        var p42=p4.ay(p24);
        
        
        // extra points
        var dszk=p35.to(p37).norm()/2;
        var hk=p39.to(p41).norm()/2;
        var hszk0=p6.to(p36).norm()/2;
        var hszk=hszk0/2;                   // ratio (revise)
        var oszk=hszk0-hszk;
        var cstb=(p7.y-p40.y)/2;
        var slh=slimmer(hszk*2);
        
        var p43=p24.dy(dszk);
        var p44=p24.dy(-dszk);
        var p45=p42.dy(hk);
        var p46=p42.dy(-hk);
        var p47=p5.ay(p45);
        var p48=p5.ay(p46);
        var p49=p5.ay(p13);
        var p50=p29.dv(p29.to(p12).normalized(nysz+5))
        var p51=p11a;
        var p52=p3.ay(p11a).dx(10).dy(oszk);
        var p53=p52.ay(p11).dy(-oszk);
        var p54=p4.ay(p11a).dy(-cstb);
        var p55=p4.ay(p11).dy(cstb);
        var p56=p5.ay(p54);
        var p57=p5.ay(p55);
        var p58=p10.mid(p18,0.5).ay(p19);
        var p59=p58.ay(p1);
        var p60=p59.dy(nysz+50);
        var p61=p58.dx(-5)
        var p62=p58.dx(5);
        var p63=p60.ax(p16);
        var p64a=p6.ay(p60);
        var p64=p64a.dy(-hszk);
        var p65=p64a.dy(hszk);
        var p66=p64a.dx(slh);
        var p67=p64a.dx(-slh);

        var p11c=p21.ax(p11).dy(6);
        var p21c=p20.ay(p58).mid(p58, 0.5);
        var p16c=p1.mid(p15,0.6);
        var p22a=p22.dx(-5);
        var p22c=p22.ax(p11a).dy(-3);
        var p6c=p6.dy((p53.y-p6.y)/2)

        var p27c=p23.mid(p22,0.6);
        var p31c=p31.ay(p30).dy(7);
        var p55c=p55.dx(hm*0.5);
        var p54c=p55c.ay(p54);
        
        var pk27=p27.mid(p22,0.5).dv(p27.to(p22).normalized(10).rnormal());
        var pk55=p55.mid(p53,0.5).dv(p55.to(p53).normalized(7).lnormal());

        // front-align back
        var d30=parallelDx(p33.to(p30),-hea);
        var p30h=p30.dx(d30);
        var p33h=p33.dx(d30);
        
        var d32=parallelDx(p27.to(p32),-hea);
        var u32=lambda(p32.to(p26),p32.to(p27).dx(d32),p27.to(p32));
        var p32h=p27.mid(p32, u32).dx(d32);
        var u27=lambda(p27.to(pk27), new Coord(d32, 0), p27.to(p32));
        var p27h=p27.mid(p32, u27).dx(d32);

        var d19=parallelDx(p16.to(p19),hea);
        var u16=lambda(p16.to(p19), new Coord(-d19, 0), p16.to(p16c));
        var p19h=p19.dx(d19);
        var p16h=p16.mid(p16c, u16);
        var p63b=p60.intersectLL(p63,p16h,p19h);
        
        // ip
        var euip0=p12.dx(hosz/4);
        var euic=new Curve(p22a,p22c,p11a);
        var euit=euic.intersectL(euip0, euip0.dy(1));
        var euip=(euit.length>0 ? euic.tmid(euit[0]) : euip0);
        var euid=(euit.length>0 ? euic.tangent(euit[0]) : new Coord(-1,0));

        var mhip=new Mark(p21, p21.to(p21c));
        var mhkd=new Mark(p6, polar(1,180));
        var mhszd=new Mark(p53, polar(1,0));
        var mekm=new Mark(p26, polar(1,180));
        var meszm=new Mark(p26, polar(1,0));
        var meui=new Mark(euip, euid);
        var meszd=new Mark(p52, polar(1,180));
        
        var p14b=p12.intersectLL(p14,p26,p32);
        var p26a=p26.dy(4);
        var p26b=p26.dy(-4);
        
        var p53b=p53.dy(-7);
        var p52b=p52.dy(7);
        var cr1=(bcrop ? [p43.intersectLL(p45,p47,p49)] : [p45,p47]);
        var cr3=(bcrop ? [p46.intersectLL(p44,p56,p48)] : [p48,p46]);
        var cr2c=new Curve(p52,p54c,p54);
        var cr4c=new Curve(p55,p55c,p53);
        if (bcrop) { 
            var tx=cr2c.intersectL(p56,p48); 
            if (tx.length>0) { cr2c=cr2c.tsplit(tx[0])[0]; }
            tx=cr4c.intersectL(p8,p57);
            if (tx.length>0) { cr4c=cr4c.tsplit(tx[0])[1]; }
        }
        var cr2=[CURVE,cr2c.p1,cr2c.p2,(bcrop?[]:[p56])];
        var cr4=[(bcrop?cr4c.p0:[p57,p55]),CURVE,cr4c.p1,cr4c.p2];
        

        //
        
        var patEK=new Pattern();
        var patES=new Pattern();
        var patH=new Pattern();
        
        patH.setBase([MOVE,p19h,p16h,CURVE,p16c,p1,p6,p8,cr4,p11,CURVE,p11c,p21,CURVE,p21c,p58,p19h]);
        patH.slimmers=[MOVE,p64,p66,p65,p67,p64, MOVE,p61,p60,p62];
        patH.marks=[mhip,mhkd,mhszd];
        patH.midlines=[MOVE,p6,p53.ax(p6), MOVE,p9,p11, MOVE,p63b,p63.ax(p5), MOVE,p16h,p16h.ax(p1),p1];
        patH.guides=[MOVE,p1,p5,p8, MOVE,p4,p55, MOVE,p16,p15,p17,p10];
        patH.setMargin(size.margin);

        patEK.setBase([MOVE,p33h,p26,p43,cr1,p49,p31,CURVE,p31c,p30h,p33h]);
        patEK.midlines=[MOVE,p13,p14, MOVE,p45,p41, MOVE,p43,p37];
        patEK.guides=[MOVE,p30h,p30,p33,p33h, MOVE,p31,p29,p30, MOVE,p29,p50];
        patEK.marks=[mekm];
        patEK.setMargin(size.margin);

        patES.setBase([MOVE,p32h,p27h,CURVE,p27c,p22,p22a,CURVE,p22c,p11a,p52,cr2,cr3,p44,p26,p32h]);
        patES.marks=[meui,meszd,meszm];
        patES.midlines=[MOVE,p44,p52.ax(p44), MOVE,p51,p14b, MOVE,p54,p46, MOVE,p38,p12];
        patES.guides=[MOVE,p12,p23,p27,p22, MOVE,p32h,p32,p27,p27h];
        patES.setMargin(size.margin);
        
        
        // ARM /////////////////////////////////////////////////////////////////

        var kc1=new Curve(p27h,p27c,p22);
        var kc2=new Line(p22, p22a);
        var kc3=new Curve(p22a,p22c,p11a);
        var kc4=new Curve(p11,p11c,p21);
        var kc5=new Curve(p21,p21c,p58);
        var kc6=p58.to(p19h);
        var kcs=[kc1,kc2,kc3,kc4,kc5,kc6];
        var vvx=p60.to(p19h).rotated(rotateVec(p60.to(p62), p60.to(p61))).dv(p60);
        
        var km=p27h.to(p12).norm()+(vvx.x-p2.x);
        var kb=pathLen(kcs)-10;

        var kcc=null;
        var kc3t=kc3.intersectL(euip, euip.dy(1));
        if (kc3t.length>0) { kcc=kc3.tsplit(kc3t[0])[1]; } 
        else { kcc=new Curve(uipm,p22c,p11a); }
        
        var hoszx=5;    // 5-10
        var uhx=20;     // 20-30
        var kkx=10;     // 10-15
        var uhipx=5;    // 5-10
        
        //
        
        var up2=p29.dx(50);
        var up1=up2.dy(Math.round(2*hosz/10+hoszx));
        var up3=up1.dy(-Math.round(km/2));
        var up4=up2.dy(-size.uh);
        var up5=up4.dy(uhx);
        var up6=up3.mid(up5, 0.5).dy(10);
        var upui=up3.dy(hosz/4);
        var up7=upui.intersectCL(kb/2-5, up2, up2.dx(1)).right;
        var up8=up3.ax(up7);
        var up9=up6.ax(up7);
        var up10=up2.mid(up7, 0.5).dx(10);
        var up11=up2.mid(up10, 0.5);
        var up12=up3.mid(up8, 0.5).dx(-10);
        var up13=upui.mid(up11, 0.5);
        var up14=up7.dy(-(hosz/4+5));
        var up14b=up14.dx(-5);
        var up12b=up12.dy(5);
        var up3b=up3.dy(5);
        var up15=up6.dx(kkx);
        var up16=up5.dx(kkx);
        var up17=up9.dx(-kkx);
        var up18=up16.intersectCL(size.csub/2, up4, up4.dx(1)).left;
   
        var upm1=up13.offMid(up10, 0.5, 12);
        var upm2=up10.offMid(up14, 0.5, 10);

        var upkc=upui.intersectCL(kcc.p0.to(kcc.p2).norm(), up3b, up12b).left;
        var kcu=kcc.rotated(rotateVec(kcc.p0.to(kcc.p2), upui.to(upkc))).dv(kcc.p0.to(upui));
        var kcum=kcu.mirrored(upui.to(up15));

        var av1dp=upkc.projected(upui,up15).to(upkc).norm();
        var av1dx=parallelDx(upui.to(up15), av1dp);
        var upkk=up15.dx(av1dx);
        var upka=upkk.intersectLL(upkk.dy(1), up16, up18);
        
        var upkkm=up15.dx(-av1dx);
        var upkam=upka.dx(-av1dx*2);
        
        var hcl=new Curve(upkc, up14b.extend(up12, -9), up12.mid(up14b, 0.5));
        var hch=new Curve(hcl.p2, up12.extend(up14b, -20), up14);
        
        var hchm=hch.reversed().mirrored(up14.to(up17));
        var hclm=hcl.reversed().mirrored(up14.to(up17)).dv(hch.p0.to(hchm.p2));
        
        var up10d=up10.dxy(100,14);
        var up10dm=up10.to(up10d).neg().dv(up10);
        var up13c=up10.intersectLL(up10d,up13,up11);
        var up10c=up10.intersectLL(up10d,up14,hchm.p1);

        var cc13=offCurve(up11, up13, up10, up10d, 0.5, 12);
        var cc10=offCurve(up10d, up10, up14, hchm.p1, 0.5, 10);

        var av2dx=up17.x-up15.x-av1dx;
        var uphk=upkk.mirrored(up14,up17);
        var up18m=up18.mirrored(up14,up17);
        var upha=upka.mirrored(up14,up17);
        
        var up18c=up4.intersectLL(up18, up14, up17);
        
        var ueip=kcum.tangent(0).lnormal().normalized(7).dv(kcum.p0);
        var uvip=up10.dy(-7);
        var uhipd=kc4.len()+uhipx;
        var hipc=hcl;
        if (hipc.len()<uhipd) { 
            uhipd-=hipc.len();
            hipc=hch;
        }

        var uhipt=hipc.t(uhipd);
        var uhip0=hipc.tmid(uhipt);
        var uhip1=hipc.tangent(uhipt).rnormal().normalized(7).dv(uhip0);
        var uhip0m=uhip0.mirrored(up14, up17);
        var uhip1m=uhip1.mirrored(up14, up17);
        
        var poly2=[];
        var mpoly2=[];
        
        (new Plotter(new PolylineContext(poly2))).plot([
            MOVE, upui, up13, CURVE, up13c, up10, CURVE, up10c, up14,
            hchm, hclm, uphk, upha, up18m, up17, up18, up16, upkam, upkkm, kcum.p2, CURVE, kcum.p1, kcum.p0,
            ]);
            
        mpoly2.push(MOVE); mpoly2.push(poly2[0]);
        mpoly2.push(MOVE); mpoly2.push(poly2[0].leftOffset(size.margin));
            
        

        var arm = [
            TOOL, "guide",
            MOVE, up2, up4,
            MOVE, up2, up7, up9, upkkm,
            MOVE, up3, up8,
            MOVE, up13, up10, up14, MOVE, up14b, up12, MOVE, up12b, up3b,
            MOVE, up11, upui, up7,
            MOVE, up4, up18c, up14, MOVE, up18c, up18m,
            MOVE, upui, up15, up16,
            MOVE, kcu.p0, CURVE, kcu.p1, kcu.p2, CURVE, hcl.p1, hcl.p2, CURVE, hch.p1, hch.p2, 
            MOVE, upkc, upkk, upka,
            MOVE, uphk, up17,
            MOVE, uhip0, uhip1,
            MOVE, up10dm, up10d,
            
            
            TOOL, "outline",
            mpoly2,
                        
            MOVE, kcum.p0, ueip,
            MOVE, up10, uvip,
            MOVE, uhip0m, uhip1m,
        ];


        var off=new Coord(0, -size.margin*2-10);
        patES.setPos(off);
        patH.setPos(off);

        return [
            arm,
            patEK,
            patES,
            patH,
        ];
    }

    return draft;
}    


