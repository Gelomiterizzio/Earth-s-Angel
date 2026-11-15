// AI-assisted: OpenAI Codex. Original pixel art drawn on Canvas; team review pending.
import { TILE_PX } from '../../map/art';
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';

const W = 320;
const H = 180;
const TAU = 2 * Math.PI;

const crewTrim = {
    commander: { trim: '#ffb75c', trimShadow: '#bd673e' },
    engineer: { trim: '#72e2db', trimShadow: '#338b93' },
    botanist: { trim: '#c1df80', trimShadow: '#688847' },
    medic: { trim: '#e8b0ff', trimShadow: '#a76eb4' },
    geologist: { trim: '#eeac91', trimShadow: '#9b5741' },
    radio: { trim: '#a8bcff', trimShadow: '#5b6eb1' },
};

export function createLunarSecretArt(
  art: HTMLCanvasElement,
  lettering: HTMLCanvasElement,
  role: SuitRole,
  translate: (key: string) => string,
  reduced: boolean,
  announce: (text: string) => void,
): (time: number) => void {
  art.width = W;
  art.height = H;
  const actor = (art.ownerDocument ?? document).createElement('canvas');
  actor.width = actor.height = TILE_PX;
  const artContext = art.getContext('2d', { alpha: false });
  const letterContext = lettering.getContext('2d');
  const actorContext = actor.getContext('2d');
  if (!artContext || !letterContext || !actorContext) return () => undefined;

  const g = artContext;
  const letters = letterContext;
  const ag = actorContext;
  g.imageSmoothingEnabled = false;
  ag.imageSmoothingEnabled = false;
  const copy = (key: string) => translate('ui.lunarSecret.' + key);
  let lastSpeech = '';

  const round = Math.round, floor = Math.floor;
  const bound = (v: number, a: number, b: number) => Math.max(a,Math.min(b,v));
  const unit = (v: number) => bound(v,0,1);
  const ease = (p: number) => p*p*(3-2*p);
  const prog = (time: number, a: number, b: number) => unit((time-a)/(b-a));
  const mix = (a: number, b: number, t: number) => a+(b-a)*t;
  const hash = (i: number) => { const v=Math.sin(i*78.233+5.1)*43758.5453; return v-floor(v); };
  function px(color: string, x: number, y: number, w = 1, h = 1) {
    if(w<=0||h<=0)return;
    if(g.fillStyle!==color)g.fillStyle = color;
    g.fillRect(round(x),round(y),round(w),round(h));
  }
  function poly(color: string, points: readonly number[]) {
    let a=H,b=-1;
    for(let i=1;i<points.length;i+=2){a=Math.min(a,points[i]);b=Math.max(b,points[i]);}
    const crossings: number[] = [];
    for(let y=Math.max(0,Math.ceil(a));y<=Math.min(H-1,floor(b));y++){
      crossings.length=0;
      const k=y+.5;
      for(let i=0,j=points.length-2;i<points.length;j=i,i+=2){
        const yi=points[i+1],yj=points[j+1];
        if((yi>k)!==(yj>k))crossings.push(points[i]+(k-yi)/(yj-yi)*(points[j]-points[i]));
      }
      crossings.sort((x,z)=>x-z);
      for(let i=0;i+1<crossings.length;i+=2){
        const x=Math.ceil(crossings[i]-.5),end=Math.ceil(crossings[i+1]-.5);
        if(end>x)px(color,x,y,end-x);
      }
    }
  }
  function stroke(color: string, x: number, y: number, ex: number, ey: number, w = 1){
    x=round(x); y=round(y); ex=round(ex); ey=round(ey);
    const dx=Math.abs(ex-x),dy=-Math.abs(ey-y),sx=x<ex?1:-1,sy=y<ey?1:-1;
    let e=dx+dy;
    for(;;){
      px(color,x,y,w,w);
      if(x===ex&&y===ey)break;
      const q=e*2;
      if(q>=dy){e+=dy;x+=sx;}
      if(q<=dx){e+=dx;y+=sy;}
    }
  }
  function ellipse(color: string, cx: number, cy: number, rx: number, ry: number){
    if(rx<=0||ry<=0)return;
    cx=round(cx);cy=round(cy);
    for(let dy=-floor(ry);dy<=floor(ry);dy++){
      const half=floor(rx*Math.sqrt(Math.max(0,1-(dy/ry)**2)));
      px(color,cx-half,cy+dy,2*half+1);
    }
  }

  function setLetterFont(size: number, weight = 700) {
    letters.font = weight + ' ' + size + 'px "Pixelify Sans", monospace';
  }
  function font(text: string, x: number, y: number, size: number, color: string, weight = 700, align: CanvasTextAlign = 'left') {
    setLetterFont(size, weight);
    letters.fillStyle = color;
    letters.globalAlpha = g.globalAlpha;
    letters.textAlign = align;
    letters.textBaseline = 'top';
    const scaleX = lettering.width / W;
    const scaleY = lettering.height / H;
    letters.fillText(text, round(x * scaleX) / scaleX, round(y * scaleY) / scaleY);
  }
  function fadeScene(color: string, opacity: number) {
    if (opacity <= 0) return;
    g.globalAlpha = opacity;
    px(color, 0, 0, W, H);
    g.globalAlpha = 1;

    letters.save();
    letters.globalCompositeOperation = 'source-atop';
    letters.globalAlpha = opacity;
    letters.fillStyle = color;
    letters.fillRect(0, 0, W, H);
    letters.restore();
  }
  function panel(x: number, y: number, w: number, h: number, line: string, fill: string, c = 3){
    poly(line,[x+c,y,x+w-c,y,x+w,y+c,x+w,y+h-c,x+w-c,y+h,x+c,y+h,x,y+h-c,x,y+c]);
    poly(fill,[x+c+1,y+1,x+w-c-1,y+1,x+w-1,y+c+1,x+w-1,y+h-c-1,x+w-c-1,y+h-1,x+c+1,y+h-1,x+1,y+h-c-1,x+1,y+c+1]);
  }
  function astronaut(role: SuitRole, x: number, y: number, s: number, face = 0, frame = -1, pose = 0){
    drawAstronaut(ag,{x:face,y:face===0&&pose===2?-1:face===0?1:0},frame,role);
    if(pose===1){
      const colors=crewTrim[role], o='#192034', mid='#91a2a8', hi='#f8e3c3';
      const arm = (left: boolean) =>{
        const cx=left?4:18, k=left?1:-1;
        ag.clearRect(cx,12,2,4);
        ag.fillStyle=o;ag.fillRect(cx+k,5,4,7);ag.fillRect(cx,10,4,4);
        ag.fillStyle=mid;ag.fillRect(cx+k+1,7,2,4);ag.fillRect(cx+1,10,2,2);
        ag.fillStyle=hi;ag.fillRect(cx+k+1,6,2,3);
        ag.fillStyle=colors.trim;ag.fillRect(cx+k+1,9,2,1);
      };
      arm(true);arm(false);
    }
    const width=24*s;
    g.drawImage(actor, round(x-width/2),round(y-22*s), width,width);
  }
  function star(color: string, x: number, y: number, r = 1) {
    px(color,x-r,y,r*2+1);px(color,x,y-r,1,r*2+1);
  }

  function earth(x: number, y: number, r: number) {
    ellipse('#1a2543',x+2,y+2,r+3,r+3);
    ellipse('#51799b',x,y,r+1,r+1);
    ellipse('#346286',x,y,r,r);
    ellipse('#4a83a0',x-2,y-2,r-2,r-2);
    const k=r/17;
    function land(col: string, p: readonly number[]){poly(col,p.map((v,i)=>(i%2?y:x)+round(v*k)));}
    land('#6fb89f',[-15,-5,-11,-10,-4,-11,1,-7,0,-4,-6,-3,-6,0,-12,1,-14,-1]);
    land('#66a994',[0,-1,5,-2,6,0,11,3,10,7,3,13,2,9,-1,6]);
    land('#83c6aa',[5,-13,11,-12,15,-8,15,-5,12,-6,9,-5,5,-8]);
    land('#8ecabb',[-14,3,-6,4,-2,6,-4,8,-12,6,-15,5]);
    land('#23405e',[-13,9,-6,13,3,14,11,9,17,4,13,12,7,16,-4,17,-11,14]);
    px('#b8dad6',x-9*k,y-11*k,4*k);
    px('#95cbd0',x-12*k,y-9*k,3*k);
  }

  function lunar(t: number) {
    const tones=['#0a1024','#10172d','#171d35','#1b203a','#252b44','#333349','#48364d','#594056'];
    for(let i=0;i<tones.length;i++)px(tones[i],0,i*12,W,i===tones.length-1?36:12);
    for(let i=0;i<112;i++){
      const x=hash(i+772)*W,y=hash(i+330)*85;
      const glint=(floor(t*3)+i)%31===0;
      if(i%27===0)star(glint?'#dedfd1':'#7c8da6',x,y,1);
      else px(glint?'#b3b9c2':i%7===0?'#8298af':'#465b7b',x,y);
    }
    earth(69,44,15);
    poly('#252a44',[0,95,18,89,31,91,51,81,67,84,84,100,109,97,130,87,148,96,169,94,195,97,224,89,252,93,269,80,291,76,311,87,320,88,320,180,0,180]);
    poly('#353952',[0,110,22,101,47,102,77,108,108,106,132,101,160,104,181,101,219,105,248,97,281,104,301,100,320,105,320,180,0,180]);
    poly('#424358',[0,127,43,118,75,122,105,116,144,120,175,115,208,120,236,114,274,118,298,113,320,118,320,180,0,180]);
    poly('#34384d',[0,143,38,132,61,139,91,134,133,141,158,131,198,136,238,132,277,126,320,134,320,180,0,180]);
    stroke('#56566a',16,151,55,141); stroke('#575b72',81,129,126,126);
    stroke('#56586e',118,158,177,144); stroke('#57576c',214,157,283,140);
    for(let i=0;i<185;i++){
      const x=floor(hash(i+64)*W),y=115+floor(hash(i+775)*65),z=1+floor(hash(i+17)*(y-100)/22);
      px(['#2b2d43','#69667a','#3e425b','#56596a'][i%4],x,y,z,1);
      if(i%8===0){px('#292839',x+1,y+1,z+2);px('#6f6f83',x+1,y-1,z);}
    }
    poly('#202237',[0,168,11,158,24,158,34,163,50,168,74,180,0,180]);
    poly('#222234',[266,180,281,166,299,165,306,159,320,157,320,180]);
    stroke('#54536a',9,161,24,158);stroke('#525269',290,167,306,165);
    if(!reduced)for(let i=0;i<19;i++)px('#7e8590',((hash(i+133)*390+t*(3+i%4))%390)-30,104+hash(i+274)*50,i%6===0?2:1);

    const p=ease(prog(t,.58,2.62));
    const x=mix(111,181,p);
    astronaut(role,x,139,2,1,t>.58&&t<2.62?floor((t-.58)*13)%8:-1);
    if(t>=2.85&&!reduced){
      const u=prog(t,2.85,3.7);
      for(let i=0;i<30;i++){
        const a=hash(i+82)*TAU,r=u*(14+hash(i+144)*39);
        px(i%4===0?'#dbfff6':'#66bbb8',218+Math.cos(a)*r,91+Math.sin(a)*r,1+i%2,1);
      }
    }
    panel(10,9,133,15,'#4a657f','#111b30');
    px('#76dfd8',15,15,3,3);
    font(copy('chapter'),22,12,9,'#acc0d5');
    if (t > 3.18) {
      const k = round(ease(prog(t, 3.18, 3.72)) * 94);
      px('#000', 0, 0, W, k);
      px('#000', 0, H - k, W, k);
      letters.clearRect(0, 0, W, k);
      letters.clearRect(0, H - k, W, k);
    }
  }

  function eyesOpen(t: number){
    let open=ease(prog(t,6.75,7.43));
    for(const b of [12.95,19.85,25.88])if(Math.abs(t-b)<.13)open*=.07+.93*unit(Math.abs(t-b)/.13);
    return open;
  }
  function eye(cx: number, cy: number, t: number, mirrored: boolean) {
    const openness=round(eyesOpen(t)*18)/18;
    if(openness<.04)return;
    const track=mirrored?-6:8;
    const look=t>14.1&&t<18.6 ? 2 : 0;
    const irisX=cx+track+look,irisY=cy+2;
    for(let x=-62;x<=62;x++){
      const p=x/62, width=1-Math.abs(p);
      const top=round(cy-(2+width**.76*18)*openness + (mirrored?1:-1)*round(p*3));
      const bot=round(cy+(2+width**.8*15)*openness);
      const dark=width<.1;
      px('#102822',cx+x,top-2,1,bot-top+4);
      px(dark?'#577057':x%6===0?'#8fab73':'#a7ba7b',cx+x,top,1,bot-top+1);
      if(bot-top<4)continue;
      px('#697f5d',cx+x,top,1,2);
      if(x%5===0)px('#9aab73',cx+x,top+2,1,2);
      px('#dbbf7e',cx+x,bot-3,1,3);
      if(x%3!==0)px('#f5db90',cx+x,bot-2,1,1);
      const ix=cx+x-irisX;
      if(Math.abs(ix)>22)continue;
      const r=floor(20*Math.sqrt(1-(ix/22)**2));
      const prism=['#75925b','#d9b978','#e9d18a','#a0ad61','#718b5d','#d99b63'][floor(hash(x+335+(mirrored ? 40 : 0))*6)];
      const up=Math.max(top,irisY-r),down=Math.min(bot,irisY+r);
      px('#587857',cx+x,up,1,down-up+1);
      if(down-up>2)px(prism,cx+x,up+1,1,down-up-1);
      if(Math.abs(ix)<14)px(ix%3===0?'#536940':'#637746',cx+x,Math.max(up+1,irisY-11),1,Math.min(down-1,irisY+11)-Math.max(up+1,irisY-11)+1);
      if(Math.abs(ix)<7){
        const h=round(23*(1-Math.abs(ix)/7)**.67);
        const y=Math.max(top,irisY-h);
        px('#071212',cx+x,y,1,Math.min(bot,irisY+h)-y+1);
      }
      if(bot>cy+12&&x%13===0)px('#a18759',cx+x,bot-4);
    }
    if(openness>.58){px('#fbefb1',irisX-11,cy-8,7,2);px('#ffffde',irisX-9,cy-9,5,1);px('#dddf9b',irisX+7,cy+7,2,2);}
    if(openness>.74){
      stroke('#19342c',cx-65,cy+2,cx-51,cy-13);
      stroke('#1d3d32',cx-49,cy-15,cx-27,cy-24);
      stroke('#1a382d',cx+29,cy-23,cx+50,cy-14);
      stroke('#1c352c',cx+54,cy-11,cx+63,cy-3);
    }
  }

  function voidScene(t: number){
    px('#000000',0,0,W,H);
    if(t<6.75) return;
    const a=ease(prog(t,6.75,7.45));
    const aY=153+(reduced?0:round(Math.sin(t*2))), heroX=76;
    if(a>0.06) {
      g.globalAlpha=a;
      ellipse('#040908',160,67,147,48);ellipse('#06110f',160,62,124,37);
      ellipse('#0b1916',160,60,92,24);
      for(let i=0;i<90;i++){
        const x=hash(i+716)*W,y=28+hash(i+144)*132;
        if(i%5===0|| (floor(t*.9)+i)%11===0)px(i%8===0?'#2a4737':'#172c26',x,y,i%11===0?2:1,1);
      }
      eye(81,55,t,false);eye(238,52,t,true);
      ellipse('#07100f',heroX,155,41,4);
      astronaut(role,heroX,aY,3,0,-1,2);
      g.globalAlpha=1;
      g.save();
      g.beginPath();g.rect(heroX-25,aY-63,52,64);g.clip();
      px('rgba(0,22,21,.31)',heroX-25,aY-63,52,64);g.restore();
      px('#98bc93',heroX-18,aY-48,3,3);px('#789d84',heroX+15,aY-48,3,3);
    }
  }

  function rewind(t: number){
    const p=prog(t,28,33.12);
    px('#080c1a',0,0,W,H);
    const palette=['#131d35','#22334d','#355565','#527d76','#6b9481','#8ac9a2','#b8f0bb','#f3db9b'];
    const n=reduced?7:12,motion=reduced?0:(p*3.7)%1;
    for(let i=0;i<n;i++){
      const d=(i+motion)/n,r=round(13+Math.pow(d,1.6)*206), h=round(r*.59), k=round(r*.3);
      const y=98;
      const points=[160-r,y-h+k,160-r+k,y-h,160+r-k,y-h,160+r,y-h+k,160+r,y+h-k,160+r-k,y+h,160-r+k,y+h,160-r,y+h-k];
      for(let j=0;j<16;j+=2){
        const c=palette[(i+(j%4===0?1:2))%palette.length];
        stroke(c,points[j],points[j+1],points[(j+2)%16],points[(j+3)%16]);
      }
    }
    for(let i=0;i<66;i++){
      const a=hash(i+90)*TAU,r=12+((hash(i+123)+(reduced?0:p*2.7))%1)*176;
      const dx=Math.cos(a),dy=Math.sin(a)*.62,len=3+sinS(p)*14+r*.06;
      stroke(i%5===0?'#eadca3':i%3?'#3a6266':'#7fb594',160+dx*r,98+dy*r,160+dx*(r+len),98+dy*(r+len));
    }
    astronaut(role,160,136,2,0,-1,2);
    panel(84,10,152,22,'#6e9787','#0d1926');
    font(copy('rewind'),160,15,11,'#daf1c7',700,'center');
    const wipe=ease(prog(t,32.58,33.12));
    fadeScene('#f9d9aa', wipe);
  }
  function sinS(p: number){return Math.sin(Math.PI*p);}
   
  function hangar(t: number) {
    // Broad, stepped bands leave the left half open for the characters and signs.
    px('#201d34', 0, 0, 320, 180);
    px('#302340', 0, 30, 320, 100);
    px('#422b47', 0, 49, 320, 80);
    px('#56344d', 0, 64, 320, 63);
    px('#6b3d51', 0, 76, 320, 51);
    px('#884b57', 0, 87, 320, 42);
    px('#a75c60', 0, 97, 320, 32);
    px('#c97966', 0, 106, 320, 26);
    px('#df956d', 0, 113, 320, 20);
    px('#eeb37e', 0, 120, 320, 12);

    poly('#65394f', [8,75, 39,73, 60,74, 67,77, 108,80, 62,81, 43,79, 8,79]);
    px('#704255', 31, 82, 64, 1);
    poly('#7d4757', [113,86, 133,81, 168,82, 183,85, 226,86, 217,89, 167,89, 143,87]);
    poly('#9a545c', [143,96, 172,90, 201,89, 208,91, 235,93, 232,95, 204,96, 191,95]);
    px('#ad625e', 83, 100, 56, 1);
    px('#b56b63', 99, 103, 52, 1);
    px('#b96a62', 158, 101, 34, 1);
    px('#c77765', 290, 99, 30, 2);

    // Hard-edged rings and one-pixel horizontal stripes soften the sunrise.
    ellipse('#c67461', 216, 110, 31, 17);
    ellipse('#da8e68', 216, 110, 25, 14);
    ellipse('#edaa74', 216, 110, 19, 12);
    ellipse('#ffd28c', 216, 109, 13, 11);
    px('#f7bd7b', 202, 110, 29, 1);
    px('#eea772', 201, 113, 30, 1);
    px('#f4bb7d', 190, 116, 38, 1);
    px('#f5be83', 183, 119, 67, 1);
    px('#dba077', 153, 114, 29, 1);
    px('#e9a477', 80, 118, 55, 1);

    // A staggered mountain line and the low guard rail sit behind the runway.
    poly('#633e51', [0,126, 15,124, 27,121, 38,123, 44,120, 59,119, 72,122, 87,121, 98,124, 110,122, 121,124, 135,121, 151,125, 169,123, 184,126, 201,124, 222,124, 232,120, 249,121, 263,117, 278,120, 291,119, 306,121, 319,116, 319,135, 0,135]);
    poly('#463449', [0,129, 28,126, 49,127, 71,126, 95,129, 119,126, 140,128, 164,127, 190,129, 211,128, 237,126, 265,129, 293,126, 319,128, 319,137, 0,137]);
    px('#352b40', 0, 131, 320, 12);
    px('#674554', 9, 131, 301, 1);
    px('#906069', 13, 133, 298, 1);
    for (let x = 16; x <= 302; x += 14) px('#6a4b5d', x, 132, 1, 5);

    // Wide slabs and angled joints converge on the lit end of the hangar.
    px('#2a273a', 0, 138, 320, 42);
    px('#302a3e', 0, 139, 320, 9);
    px('#272538', 0, 161, 320, 19);
    poly('#473247', [4,179, 181,138, 236,138, 307,179]);
    poly('#4f374a', [44,179, 192,138, 226,138, 264,179]);
    poly('#634151', [102,179, 199,138, 221,138, 243,179]);
    poly('#744b53', [152,179, 205,139, 216,139, 222,179]);
    for (const y of [141, 146, 152, 161, 173]) {
      px('#654454', 8, y, 305, 1);
      px('#3d3044', 8, y + 1, 305, 1);
    }
    for (const [bottom, top] of [[0,172], [37,181], [94,192], [173,204], [258,220], [318,236]]) {
      stroke('#79515d', bottom, 179, top, 138);
    }
    for (const x of [18, 51, 109, 158, 202, 310]) {
      px('#dd9c71', x, 140, 3, 1);
      px('#8c5a5b', x, 141, 3, 1);
    }

    // Near structure, launch gantry, and distant communications hardware.
    poly('#131826', [0,0, 319,0, 319,7, 30,7, 19,18, 9,18, 9,138, 0,138]);
    poly('#25263b', [0,4, 315,4, 315,8, 28,8, 18,20, 8,20, 8,136, 0,136]);
    stroke('#5b435d', 29, 7, 310, 7);
    stroke('#665065', 7, 20, 7, 134);
    stroke('#5b435d', 19, 17, 28, 8);
    px('#d08568', 5, 29, 3, 2);
    px('#d08568', 5, 65, 3, 2);
    px('#e2a475', 5, 121, 3, 2);
    px('#101727', 312, 0, 8, 141);
    px('#2e283d', 309, 6, 5, 134);
    px('#594054', 312, 11, 1, 111);
    px('#ad6d65', 310, 15, 2, 29);
    px('#e4a471', 310, 17, 1, 22);
    px('#787488', 300, 43, 1, 14);
    px('#51465e', 295, 50, 10, 1);
    px('#392c43', 292, 55, 3, 77);
    px('#49374a', 301, 52, 3, 81);
    px('#8b5661', 301, 57, 1, 69);
    for (const y of [59, 75, 91, 107, 123]) {
      px('#392c43', 290, y, 15, 2);
      px('#a16767', 296, y, 5, 1);
      if (y < 123) stroke('#665165', 293, y, 301, y + 15);
    }
    px('#e88a69', 300, 44, 1, 2);

    // The launch cradle and the rocket's shadow anchor the ship on the ground.
    ellipse('#211f32', 263, 151, 44, 7);
    poly('#3f3345', [233,135, 289,135, 304,147, 221,147]);
    poly('#241f33', [221,148, 304,148, 299,153, 225,153]);
    px('#75515b', 225, 147, 75, 2);
    for (let x = 229; x < 297; x += 6) stroke('#bf876b', x, 148, x + 3, 146);
    poly('#211f32', [251,127, 275,127, 279,139, 247,139]);
    poly('#514357', [254,127, 272,127, 275,136, 251,136]);
    px('#907078', 254, 134, 20, 2);

    // Twin swept fins behind the riveted capsule.
    poly('#241f37', [252,91, 239,104, 225,130, 222,143, 236,139, 252,128, 277,127, 289,139, 305,143, 300,130, 287,107, 274,90]);
    poly('#915364', [250,95, 238,108, 229,127, 225,139, 236,135, 252,124]);
    poly('#c57169', [250,99, 242,108, 234,123, 230,131, 237,127, 246,113]);
    poly('#673e58', [276,95, 287,108, 298,128, 302,139, 289,135, 276,124]);
    poly('#a65d64', [277,100, 285,111, 295,130, 290,126, 282,113]);
    stroke('#e0997d', 228, 134, 238, 116);
    stroke('#bc6e70', 289, 117, 297, 133);

    // Outline, stepped curved fuselage, and broad sunlight across the hull.
    poly('#252135', [262,20, 266,22, 272,28, 279,37, 283,47, 285,58, 285,123, 280,132, 244,132, 240,123, 240,58, 243,47, 247,37, 253,28, 260,22]);
    poly('#827387', [262,23, 267,25, 272,31, 277,39, 281,49, 283,58, 283,122, 279,130, 246,130, 242,122, 242,58, 245,48, 249,38, 255,29, 261,24]);
    poly('#d6b8a1', [263,25, 267,29, 272,40, 274,51, 275,68, 275,122, 273,128, 246,128, 244,121, 244,61, 247,48, 252,36, 258,28]);
    poly('#f2d3aa', [261,26, 257,36, 253,47, 252,62, 252,124, 246,124, 246,60, 249,47, 254,35]);
    poly('#ffe2b2', [258,31, 254,40, 250,53, 249,65, 249,100, 247,100, 247,63, 250,49, 254,37]);
    px('#b39b9c', 273, 64, 3, 57);
    px('#62586e', 282, 69, 1, 51);
    poly('#733c55', [247,42, 252,36, 275,36, 278,42, 280,49, 245,49]);
    poly('#b96062', [254,37, 269,37, 273,48, 246,48, 249,42]);
    px('#e6a17f', 248, 46, 20, 1);
    px('#4b344d', 243, 116, 40, 9);
    px('#a5525a', 245, 117, 29, 7);
    px('#bf6b65', 246, 118, 18, 1);
    px('#d9967c', 247, 120, 7, 1);
    px('#ad8b87', 248, 126, 25, 1);

    // Porthole, panel seams, fasteners, and the name in a five-pixel letterform.
    poly('#5f556d', [254,65, 257,61, 267,61, 271,65, 271,78, 267,83, 257,83, 254,78]);
    poly('#292940', [256,66, 259,63, 266,63, 269,66, 269,77, 266,81, 259,81, 256,78]);
    poly('#54465d', [257,72, 267,69, 268,70, 268,77, 265,80, 259,80, 257,77]);
    stroke('#df9e91', 258, 71, 263, 65);
    stroke('#a66f7c', 260, 76, 267, 68);
    px('#5a5067', 243, 57, 39, 1);
    px('#e8c9a9', 247, 58, 22, 1);
    px('#695c6e', 243, 108, 39, 1);
    px('#eac9a8', 246, 109, 23, 1);
    for (const x of [245, 251, 274, 280]) {
      px('#726478', x, 59, 1, 1);
      px('#726478', x, 110, 1, 1);
    }
    px('#807082', 245, 92, 35, 10);
    px('#efd4ab', 245, 92, 34, 8);
    const letters: Record<string, readonly string[]> = {
      E: ['111', '100', '110', '100', '111'],
      L: ['100', '100', '100', '100', '111'],
      A: ['010', '101', '111', '101', '101'],
      N: ['1001', '1101', '1011', '1001', '1001'],
      G: ['111', '100', '101', '101', '111']
    };
    let letterX = 247;
    for (const letter of 'EL ANGEL') {
      if (letter !== ' ') {
        letters[letter].forEach((row, y) => {
          [...row].forEach((bit, x) => {
            if (bit === '1') px('#362c40', letterX + x, 94 + y, 1, 1);
          });
        });
      }
      letterX += letter === 'N' ? 5 : 4;
    }

    px('#543e51', 262, 15, 2, 9);
    px('#de9b79', 262, 15, 1, 6);
    px('#e69876', 262, 13, 2, 2);
    poly('#382d44', [283,82, 294,79, 303,79, 303,85, 294,85, 283,89]);
    stroke('#966678', 283, 84, 294, 81);
    px('#835965', 294, 81, 7, 1);
    px(Math.floor(t * 2) % 2 === 0 ? '#f1ae77' : '#94606a', 299, 78, 2, 1);
    px('#f7c887', 230, 143, 3, 1);
    px('#f7c887', 294, 143, 3, 1);
  }
  // AI-assisted: Codex. Original pixel art for the hen and final cut.
  function hen(x: number, y: number, t: number, trim: string, scale = 1) {
    const s = Math.max(1, Math.round(scale));
    const bounce = !reduced && t >= 36 && t < 39.5 ? Math.max(0, Math.round(Math.sin((t - 36) * 8) * 4)) : 0;
    const blink = !reduced && t % 2.8 > 2.67;
    const originX = Math.round(x - 16 * s);
    const originY = Math.round(y - (27 + bounce) * s);
    const paint = (color: string, cx: number, cy: number, w = 1, h = 1) => px(color, originX + cx * s, originY + cy * s, w * s, h * s);
    const shape = (color: string, coords: readonly number[]) => poly(color, coords.map((value, index) => (index % 2 ? originY : originX) + value * s));
    const edge = "#251c2c";

    ellipse("#704052", Math.round(x + 1), Math.round(y + s), 14 * s, 2 * s);
    shape(edge, [5, 12, 9, 16, 15, 13, 17, 9, 17, 5, 19, 3, 20, 1, 22, 1, 23, 2, 25, 1, 27, 3, 27, 5, 29, 7, 29, 9, 32, 10, 32, 12, 29, 13, 28, 14, 26, 14, 26, 18, 23, 22, 20, 24, 16, 24, 15, 26, 19, 26, 19, 28, 12, 28, 12, 25, 9, 25, 8, 28, 3, 28, 3, 26, 6, 25, 6, 23, 3, 21, 1, 17, 1, 12]);
    shape("#f2995b", [8, 23, 10, 23, 9, 25, 8, 27, 4, 27, 6, 26, 7, 26]);
    shape("#ffbc67", [13, 23, 16, 23, 14, 26, 17, 27, 13, 27, 13, 25]);
    shape("#de7591", [19, 5, 21, 4, 21, 2, 22, 2, 23, 4, 25, 2, 26, 3, 26, 6]);
    paint("#fd9c9b", 21, 2);
    paint("#fd9c9b", 25, 3);
    shape("#d08379", [3, 14, 8, 18, 12, 17, 17, 15, 18, 11, 19, 7, 21, 5, 26, 5, 28, 7, 28, 11, 26, 14, 25, 18, 22, 22, 18, 23, 10, 23, 6, 22, 4, 19]);
    shape("#ffd8a4", [3, 14, 7, 16, 8, 18, 12, 17, 17, 14, 19, 10, 19, 7, 22, 5, 26, 6, 27, 8, 27, 12, 25, 14, 24, 18, 21, 21, 13, 22, 8, 21, 6, 19]);
    shape("#fff0cc", [6, 18, 10, 18, 13, 16, 17, 16, 19, 18, 17, 21, 11, 21, 8, 20]);
    shape("#fff5d7", [20, 8, 22, 6, 25, 6, 27, 8, 26, 10, 23, 11, 20, 10]);
    paint("#aa6765", 9, 19, 3);
    paint("#aa6765", 11, 20, 4);
    paint("#aa6765", 15, 19, 2);
    paint("#ed9c90", 24, 10, 2);
    shape("#f6a04d", [28, 9, 31, 10, 31, 11, 28, 12, 27, 11]);
    paint("#ffd377", 28, 10, 2);
    if (blink) paint(edge, 24, 8, 2);
    else {
      paint(edge, 24, 7, 2, 3);
      paint("#fff6db", 24, 7);
    }

    shape(edge, [17, 12, 20, 12, 25, 14, 27, 13, 27, 16, 24, 17, 19, 16, 17, 15]);
    shape(trim, [18, 13, 20, 13, 24, 14, 26, 14, 26, 15, 24, 16, 19, 15, 18, 14]);
    paint("#fff8e3", 22, 13, 1, 3);
    paint("#fff8e3", 21, 14, 3);
  }

  function supper(t: number, trim: string) {
    const edge = "#301c29";
    const turn = Math.max(0, Math.min(1, (t - 42) * 2.4));
    const light = "#ffedb0";

    px("#381e2e", 0, 0, W, H);
    poly("#a85a43", [0, 30, 320, 22, 320, 180, 0, 180]);
    poly("#75413c", [0, 30, 320, 22, 320, 34, 0, 49]);
    poly("#c07450", [0, 58, 320, 28, 320, 55, 0, 82]);
    poly("#ac6046", [0, 82, 320, 55, 320, 82, 0, 119]);
    poly("#955040", [0, 119, 320, 82, 320, 108, 0, 160]);
    poly("#7d3c35", [0, 160, 320, 108, 320, 141, 98, 180, 0, 180]);
    poly("#603135", [98, 180, 320, 141, 320, 180]);
    const grain = ["#9a4d3b", "#b86246", "#cc7a54", "#824337"];
    for (let i = 0; i < 100; i += 1) {
      const x = Math.floor(hash(i + 463) * 320);
      const y = 32 + Math.floor(hash(i + 609) * 148);
      const width = 4 + Math.floor(hash(i + 111) * 15);
      stroke(grain[i % grain.length], x, y, x + width, y - Math.floor(width / 7));
    }
    for (const [x, y, endY] of [[0, 58, 28], [0, 82, 55], [0, 119, 82], [0, 160, 108], [98, 180, 141]]) {
      stroke("#67373a", x, y, 320, endY);
    }

    poly("#522935", [34, 88, 53, 66, 239, 42, 270, 48, 289, 70, 289, 126, 252, 153, 77, 177, 43, 170, 23, 148]);
    poly(edge, [33, 80, 58, 62, 233, 41, 265, 43, 281, 58, 281, 113, 251, 138, 77, 164, 44, 162, 27, 144]);
    poly("#88454b", [32, 85, 57, 65, 232, 44, 265, 46, 278, 60, 275, 114, 248, 136, 76, 161, 46, 159, 30, 142]);
    poly("#e4a075", [34, 83, 57, 66, 233, 45, 264, 48, 274, 58, 270, 104, 246, 129, 76, 153, 48, 151, 34, 139]);
    poly("#5f3b4b", [41, 86, 59, 70, 235, 49, 260, 51, 269, 59, 266, 103, 244, 124, 77, 148, 51, 146, 40, 137]);
    stroke("#ffc18a", 57, 66, 232, 45);
    stroke("#ed9f73", 74, 156, 247, 132);
    stroke("#a15b5d", 48, 158, 75, 160);

    poly("#fcdfa2", [45, 86, 61, 77, 78, 77, 87, 68, 114, 68, 155, 60, 185, 64, 237, 54, 261, 60, 253, 83, 262, 94, 239, 120, 194, 121, 166, 133, 136, 134, 82, 143, 71, 139, 53, 144, 43, 134, 51, 120]);
    poly("#cf9176", [43, 134, 53, 144, 71, 139, 82, 143, 136, 134, 166, 133, 194, 121, 239, 120, 262, 94, 250, 109, 237, 116, 225, 115, 216, 119, 192, 118, 165, 130, 133, 131, 119, 136, 81, 138, 70, 135, 53, 139]);
    poly("#ffe8ac", [45, 86, 61, 77, 78, 77, 87, 68, 114, 68, 155, 60, 185, 64, 171, 69, 155, 66, 124, 74, 106, 71, 86, 75, 80, 83, 61, 81]);
    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        const x = 58 + column * 15 + row * 2;
        const y = 85 + row * 9 - Math.floor(column * 1.72);
        if ((column + row) % 2 === 0 && y < 141 && x + row < 243) {
          poly("#eeae90", [x, y, x + 13, y - 2, x + 14, y + 4, x + 1, y + 6]);
        }
      }
    }

    function nugget(x: number, y: number, skew: number, seed: number) {
      const n = (color: string, coords: readonly number[]) => poly(color, coords.map((value, index) => {
        return index % 2 ? Math.round(y + value + (coords[index - 1] - 20) * skew) : x + value;
      }));
      ellipse("#83534d", x + 20, y + 19, 21, 7);
      n(edge, [0, 10, 2, 6, 6, 5, 7, 2, 14, 0, 21, 1, 25, 0, 31, 3, 36, 4, 40, 8, 40, 15, 35, 21, 31, 23, 23, 25, 11, 23, 8, 21, 4, 19, 1, 15]);
      n("#a94e39", [2, 10, 3, 7, 8, 6, 9, 3, 14, 1, 21, 2, 25, 1, 30, 4, 36, 5, 39, 8, 38, 15, 34, 20, 31, 22, 22, 24, 12, 22, 9, 20, 5, 18, 2, 14]);
      n("#d37b3e", [2, 10, 5, 8, 9, 6, 9, 3, 14, 1, 21, 2, 25, 1, 30, 4, 36, 5, 38, 9, 36, 15, 32, 18, 27, 20, 19, 20, 16, 18, 10, 19, 6, 17, 3, 14]);
      n("#ec9c4d", [4, 10, 7, 9, 9, 7, 10, 4, 15, 2, 20, 3, 24, 2, 27, 4, 34, 5, 35, 7, 37, 9, 35, 11, 30, 12, 30, 15, 23, 17, 19, 16, 16, 18, 10, 16, 7, 15, 5, 13]);
      n("#f3bb60", [6, 10, 10, 8, 12, 5, 17, 4, 21, 5, 25, 3, 29, 6, 33, 7, 32, 9, 28, 9, 27, 12, 22, 12, 18, 14, 14, 13, 10, 14]);
      for (let i = 0; i < 32; i += 1) {
        const xDot = 5 + Math.floor(hash(seed + i * 3) * 30);
        const yDot = 7 + Math.floor(hash(seed + i * 5 + 471) * 12);
        if (yDot < 12 || (xDot > 8 && xDot < 31)) {
          const texture = ["#cf793e", "#ffd179", "#b75f36", "#ed9e48", "#ffe095"];
          px(texture[i % texture.length], x + xDot, Math.round(y + yDot + (xDot - 20) * skew), i % 5 === 0 ? 2 : 1);
        }
      }
    }

    nugget(104, 74, -0.13, 23);
    nugget(149, 68, 0.12, 47);
    nugget(185, 79, -0.22, 61);
    nugget(63, 94, -0.1, 81);
    nugget(113, 99, 0.06, 121);
    nugget(154, 107, -0.18, 159);

    for (const [x, y] of [[86, 85], [94, 86], [112, 83], [163, 96], [202, 112], [211, 109], [74, 120], [91, 125], [102, 129], [126, 128], [147, 130], [76, 125], [173, 93]]) {
      px("#a76956", x, y, 3, 2);
      px("#f3b267", x + 1, y, 1);
    }

    ellipse("#71434c", 235, 100, 21, 12);
    ellipse(edge, 235, 96, 19, 14);
    ellipse("#b98675", 235, 97, 17, 12);
    ellipse("#ffdfa9", 235, 93, 17, 10);
    ellipse("#983e49", 235, 93, 13, 7);
    ellipse("#c25245", 233, 92, 10, 5);
    stroke("#ff8a60", 226, 91, 233, 89);
    px("#ffb77b", 229, 90, 2);

    // The discarded neck band uses the same four-point star as the hen.
    poly("#522a34", [256, 132, 276, 125, 287, 128, 288, 134, 299, 143, 298, 156, 287, 164, 270, 164, 254, 154, 250, 145]);
    poly(edge, [253, 130, 275, 122, 288, 126, 289, 132, 299, 138, 300, 146, 291, 156, 277, 159, 265, 155, 256, 153, 246, 144, 247, 137]);
    poly(trim, [255, 131, 275, 124, 286, 127, 287, 133, 297, 139, 298, 145, 289, 154, 277, 157, 265, 153, 257, 151, 248, 144, 249, 137]);
    poly("#77475a", [249, 138, 256, 144, 267, 147, 278, 149, 294, 141, 297, 140, 298, 145, 289, 154, 277, 157, 265, 153, 257, 151, 248, 144]);
    stroke("#ffe4a6", 254, 132, 275, 125);
    stroke("#f4b789", 285, 146, 293, 142);
    poly("#fff0c3", [271, 131, 273, 135, 279, 136, 274, 138, 273, 142, 270, 139, 264, 138, 269, 136]);
    px("#fff9e6", 272, 136);

    const featherX = 26 + Math.round((1 - turn) * 4);
    const featherY = 132 - Math.round((1 - turn) * 8);
    const feather = (color: string, coords: readonly number[]) => poly(color, coords.map((value, index) => value + (index % 2 ? featherY : featherX)));
    feather("#6b3a41", [0, 20, 8, 14, 8, 10, 13, 4, 18, 3, 22, 0, 27, 0, 25, 6, 22, 10, 23, 12, 18, 17, 12, 18, 8, 18, 2, 22]);
    feather("#f0ba93", [9, 15, 10, 10, 14, 6, 18, 5, 23, 2, 26, 1, 24, 6, 20, 11, 22, 11, 17, 16, 13, 17, 9, 17]);
    feather("#fff2cb", [9, 14, 12, 9, 15, 7, 19, 6, 23, 3, 23, 6, 18, 11, 15, 12, 16, 10, 12, 12, 11, 14]);
    stroke("#fee9b8", featherX + 1, featherY + 20, featherX + 22, featherY + 6);
    stroke("#bb8876", featherX + 2, featherY + 21, featherX + 12, featherY + 15);

    if (t < 42.65) {
      const jump = Math.floor((t - 42) * 7);
      for (const [x, y, side] of [[67, 86, -1], [205, 74, 1], [254, 82, 1]]) {
        px(light, x + jump * side, y - jump - 2, 1, 5);
        px(light, x + jump * side - 2, y - jump, 5, 1);
      }
    }
  }

  function arrival(t: number){
    hangar(t);
    panel(14,11,159,43,'#ecaa81','#241e35',4);
    px('#614458',18,28,151);px('#ee9164',22,19,4,4);
    font(copy('before'),31,16,10,'#ffdab0');
    panel(21,34,12,12,'#7ab699','#224547',2);
    stroke('#b1f5b5',24,40,26,42);stroke('#b1f5b5',26,42,30,37);
    font(copy('saved'),39,31,15,'#c6fbbe');
    const crew = (Object.keys(crewTrim) as SuitRole[]).filter(id => id !== role).slice(0, 3);
    crew.forEach((id,i)=>{
      const x=42+i*48, y=158+(i%2)*3;
      ellipse('#2c2337',x,y+2,15,2);
      const jump=reduced?0:Math.max(0,Math.sin((t-33.3)*4+i*1.12));
      astronaut(id,x,y-round(jump*7),2,0,-1,t>34.5&&t<40.5?1:0);
    });
    ellipse('#2c2337',215,159,24,3);
    const bounce=reduced?0:Math.max(0,Math.sin((t-35.5)*3.5))*4;
    hen(212,158-round(bounce),t,crewTrim[role].trim,1.75);
    if(t>34.5 && t<40.7){
      const colors=['#ffb568','#a8f4be','#ff8d8e','#b8a8ff','#ffebaa'];
      for(let i=0;i<39;i++){
        const a=hash(i+361), b=hash(i+997);
        const x=(a*310+Math.sin(t*2+i)*7),y=((t-34.5)*(11+b*14)+hash(i+129)*120)%122+18;
        if(x>175||y>56) px(colors[i%5],x,y,i%3===0?2:1,i%3===1?3:1);
      }
    }
    if(t>=40.05){poly('#efd6b3',[209,104,221,104,226,111]);poly('#503243',[213,105,220,105,224,109]);panel(178,87,58,19,'#efd6b3','#503243');font(copy('chicken'),207,90,12,'#fff2d6',700,'center');}
    const fade=1-ease(prog(t,33.12,33.45));
    fadeScene('#f9d9aa', fade);
  }

  const cues=[
    {a:8.25,b:13.95,kind:'entity',x:112,y:81,w:176,toX:235,toY:68},
    {a:14.15,b:18.0,kind:'hero',x:114,y:108,w:134,toX:94,toY:114},
    {a:18.24,b:23.95,kind:'entity',x:105,y:80,w:195,toX:233,toY:68},
    {a:24.43,b:27.91,kind:'hero',x:114,y:108,w:138,toX:94,toY:114},
    {a:35.4,b:39.1,kind:'team',x:28,y:59,w:148,toX:87,toY:114},
    {a:42.65,b:46.1,kind:'team',x:17,y:12,w:165,toX:2,toY:30},
    {a:46.28,b:50.01,kind:'team',x:19,y:12,w:174,toX:2,toY:30}
  ];
  function bubble(t: number, idx: number, lines: readonly string[]) {
    const cue = cues[idx];
    const entity=cue.kind==='entity', hero=cue.kind==='hero';
    const border=entity?'#aac783':hero?'#98dbc9':'#eab786';
    const fill=entity?'#132821':hero?'#183349':'#392537';
    const ink=entity?'#fff4c5':hero?'#effff7':'#fdf0d8';
    const pop=reduced?1:ease(prog(t,cue.a,cue.a+.17));
    const x=cue.x,y=cue.y+round((1-pop)*3),w=cue.w,h=24+lines.length*13;
    const above=cue.toY<y, side=cue.toX>x+w || cue.toX<x, right=cue.toX>x+w;
    const tx=bound(cue.toX,x+10,x+w-12);
    const yb=above?y:y+h-1;
    const edge=right?x+w-1:x+1;
    const tail=side?[edge,y+11,cue.toX,cue.toY,edge,y+21]:[tx-6,yb,tx+7,yb,cue.toX,cue.toY];
    g.globalAlpha=pop;
    panel(x+2,y+2,w,h,'#061117','#061117',5);
    poly(border,tail);
    panel(x,y,w,h,border,fill,4);
    if(side)poly(fill,[edge+(right?-1:1),y+13,cue.toX+(right?-2:2),cue.toY,edge+(right?-1:1),y+19]);
    else poly(fill,[tx-4,yb+(above?1:-1),tx+5,yb+(above?1:-1),cue.toX,cue.toY+(above?2:-2)]);
    font(copy(cue.kind),x+8,y+4,8,border);
    lines.forEach((line,i)=>{
      let size=12;
      setLetterFont(size);
      while (size > 9 && letters.measureText(line).width > w - 16) {
        setLetterFont(--size);
      }
      font(line,x+8,y+15+i*13,size,ink);
    });
    g.globalAlpha=1;
  }
  function paint(t: number): void {
    letters.setTransform(lettering.width / W, 0, 0, lettering.height / H, 0, 0);
    letters.clearRect(0, 0, W, H);
    g.globalAlpha=1;
    if(t<3.72)lunar(t);
    else if(t<28)voidScene(t);
    else if(t<33.12)rewind(t);
    else if(t<42)arrival(t);
    else supper(t,crewTrim[role].trim);
    const idx=cues.findIndex(c=>t>=c.a&&t<c.b);
    const lines = idx < 0 ? [] : idx === 2 ? [copy('line2'), copy('line2b')] : [copy('line' + idx)];
    if (idx >= 0) bubble(t, idx, lines);
    const speech = idx < 0 ? '' : copy(cues[idx].kind) + ': ' + lines.join(' ');
    if (speech !== lastSpeech) {
      lastSpeech = speech;
      announce(speech);
    }
  }

  return paint;
}
