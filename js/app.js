const {useState,useEffect,useMemo,useRef} = React;
/* 舊瀏覽器保險:Safari 15.4 前沒有 structuredClone,任何狀態更新都會崩潰 */
if(typeof window.structuredClone!=='function'){
  window.structuredClone=o=>JSON.parse(JSON.stringify(o));
}
/* 資料檔完整性檢查:data.js 被截斷時給出人話指引 */
if(typeof DATA_OK==='undefined'||typeof HANZI==='undefined'){
  document.getElementById('root').innerHTML=
    '<div style="font-family:sans-serif;max-width:560px;margin:60px auto;padding:24px;background:#FFF3F1;border:3px solid #C8432F;border-radius:16px;line-height:1.8">'
    +'<h2 style="margin:0 0 10px">⚠️ 資料檔 data.js 不完整</h2>'
    +'<p><b>原因:</b>上傳到 GitHub 時檔案被截斷了(常見於用「複製貼上」方式編輯,尤其在手機上)。</p>'
    +'<p><b>解法:</b>到 GitHub repo → <b>Add file → Upload files</b> → 選取完整的 <code>js/data.js</code> 檔案上傳覆蓋(不要貼內容),再 Commit。</p>'
    +'<p><b>核對:</b>上傳後點開 GitHub 上的 data.js,頁面頂端會顯示行數——完整版本應接近兩千行;若只有幾百行就是又被截斷了。</p>'
    +'</div>';
  throw new Error('data.js incomplete — re-upload the full file');
}

/* ═══════════════════════════════════════════════════════════
   出題引擎 —— 數學題全部隨機生成,永遠不重複
   ═══════════════════════════════════════════════════════════ */
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[ri(0,a.length-1)];
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=ri(0,i);[x[i],x[j]]=[x[j],x[i]]}return x};

/* 把正確答案 + 干擾選項組裝成題目物件 */
function mc(q,en,answer,distractors,why){
  const seen=new Set([String(answer)]);
  const ds=[];
  for(const d of distractors){if(!seen.has(String(d))){seen.add(String(d));ds.push(d)}}
  let bump=1;
  while(ds.length<3&&typeof answer==='number'&&bump<60){
    for(const cand of [answer+bump,answer-bump]){
      if(ds.length<3&&cand>=0&&!seen.has(String(cand))){seen.add(String(cand));ds.push(cand)}
    }
    bump++;
  }
  const opts=shuffle([answer,...ds.slice(0,3)]);
  return {q,en,options:opts.map(String),ans:opts.indexOf(answer),why};
}
function fi(q,en,answer,distractors,why,fig){
  /* 填答模式包裝器:純數字或分數 → 衝刺改輸入作答;遊戲場景仍用 options */
  const o=mc(q,en,answer,distractors,why);
  const s=String(answer);
  if(/^-?\d+(\.\d+)?$/.test(s)||/^\d+\/\d+$/.test(s)){o.mode='input';o.answer=s;}
  if(fig)o.fig=fig;
  return o;
}
/* ── 幾何圖形工具:回傳 SVG 字串(viewBox 100×100,自適應題卡)── */
const SVG=(inner,vb='0 0 120 100')=>`<svg viewBox="${vb}" class="geosvg" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const gLabel=(x,y,t)=>`<text x="${x}" y="${y}" class="glab">${t}</text>`;
const GEO={
  trapezoid:(top,bot,h)=>SVG(`<polygon points="34,26 86,26 104,76 16,76" class="gshape"/>`+
    gLabel(60,20,top)+gLabel(60,90,bot)+`<line x1="12" y1="26" x2="12" y2="76" class="gdash"/>`+gLabel(6,54,h)),
  anglecmp:(deg)=>{const ex=(24+72*Math.cos(-deg*Math.PI/180)).toFixed(1),ey=(76-72*Math.sin(deg*Math.PI/180)).toFixed(1);const ax=(24+20*Math.cos(-deg*Math.PI/180)).toFixed(1),ay=(76-20*Math.sin(deg*Math.PI/180)).toFixed(1);return SVG(`<line x1="24" y1="76" x2="100" y2="76" class="gline"/><line x1="24" y1="76" x2="${ex}" y2="${ey}" class="gline"/><path d="M44,76 A20,20 0 0,0 ${ax},${ay}" class="gang"/>`+gLabel(52,68,deg+'°'));},
  sector:(deg,r,label)=>{const rad=deg*Math.PI/180;const ex=60+38*Math.cos(-rad),ey=50-38*Math.sin(rad);
    const large=deg>180?1:0;
    return SVG(`<path d="M60,50 L98,50 A38,38 0 ${large},0 ${ex.toFixed(1)},${ey.toFixed(1)} Z" class="gshape"/>`+
    gLabel(66,44,deg+'°')+gLabel(82,64,label));},
  symmetry:(shape)=>SVG(shape+`<line x1="60" y1="10" x2="60" y2="90" class="gdash"/>`+gLabel(60,7,'?')),
  coord:(x,y)=>SVG(`<line x1="14" y1="86" x2="112" y2="86" class="gline"/><line x1="20" y1="92" x2="20" y2="14" class="gline"/>`+
    `<circle cx="${20+x*11}" cy="${86-y*11}" r="3.5" class="gdot"/>`+
    gLabel(20+x*11,86-y*11-6,`(?,?)`)+gLabel(108,94,'x')+gLabel(14,18,'y'),'0 0 120 100'),

  rect:(w,h,uw,uh)=>SVG(`<rect x="18" y="24" width="84" height="52" class="gshape"/>`+
    gLabel(60,20,uw)+gLabel(110,52,uh)),
  square:(u)=>SVG(`<rect x="30" y="18" width="60" height="60" class="gshape"/>`+gLabel(60,14,u)),
  triangle:(a,b,showThird)=>SVG(`<polygon points="20,78 100,78 55,22" class="gshape"/>`+
    `<path d="M32,78 A14,14 0 0,1 40,68" class="gang"/>`+gLabel(30,73,a+'°')+
    `<path d="M88,78 A14,14 0 0,0 80,68" class="gang"/>`+gLabel(84,73,b+'°')+
    gLabel(54,44,showThird?'?':'')),
  rtri:(base,height)=>SVG(`<polygon points="20,80 20,20 92,80" class="gshape"/>`+
    `<rect x="20" y="70" width="10" height="10" class="gright"/>`+
    gLabel(12,52,height)+gLabel(56,92,base)),
  circle:(r,label)=>SVG(`<circle cx="60" cy="50" r="34" class="gshape"/>`+
    `<line x1="60" y1="50" x2="94" y2="50" class="gline"/>`+
    `<circle cx="60" cy="50" r="2.5" class="gdot"/>`+gLabel(74,46,label)),
  Lshape:(inner)=>SVG(`<polygon points="20,20 70,20 70,50 100,50 100,80 20,80" class="gshape"/>`+inner),
  compound:(a,b,c,d)=>SVG(`<polygon points="20,20 ${20+a},20 ${20+a},${20+d} ${20+a+c},${20+d} ${20+a+c},80 20,80" class="gshape"/>`+
    gLabel(20+a/2,15,'')),
};

/* 產生靠近正解的數字干擾項 */
function nearNums(ans,spread){
  const s=new Set();
  while(s.size<3){
    const d=ans+pick([-1,1])*ri(1,spread);
    if(d!==ans&&d>=0)s.add(d);
  }
  return [...s];
}

/* ── 數學題型地圖(科目頁顯示)── */
const MATH_TOPICS={ /* v21 起與 MATH_GEN 逐索引對齊:MATH_TOPICS[lv][i] = MATH_GEN[lv][i] 的題型名(復仇戰依索引重生成) */
  1:['20 以內加法 Add within 20','20 以內減法 Subtract within 20','比大小 Compare numbers','數列偵探 Sequence detective','逆向工程 Find the missing number','生活應用題 Word problems','🏆 奧數:排隊陷阱 Line-up trap','🏆 奧數:圖形週期 Shape cycles','錢幣計算 Coin counting','兩步驟推理 Two-step stories','📐 幾何:數方格 Count squares','📐 幾何:正方形周長 Square perimeter','📐 幾何:數邊形 Count sides','📐 幾何:方格陣列 Square grids','📐 幾何:多邊形偵探 Polygon detective','📐 幾何:長度比較 Compare lengths'],
  2:['二位數加法 Two-digit addition','二位數減法 Two-digit subtraction','九九乘法 Times tables','倍增數列 Doubling sequences','買東西 Money problems','乘法逆向 Reverse multiplication','🏆 奧數:植樹問題 Fencepost problem','🏆 奧數:數字偵探 Digit detective','平分問題 Equal sharing','單位換算 Unit conversion','📐 幾何:長方形面積 Rectangle area','📐 幾何:長方形周長 Rectangle perimeter','📐 幾何:平角拆解 Angles on a line','📐 幾何:面積成長 Growing area','📐 幾何:拼圖組合 Shape combining','📐 幾何:周長逆推 Reverse perimeter'],
  3:['乘法運算 Multiplication','除法運算 Division','分數入門 Fraction basics','餘數偵探 Remainder detective','時間計算 Time math','周長 Perimeter','🏆 奧數:雞兔同籠 Chickens and rabbits','🏆 奧數:星期週期 Weekday cycles','三位數計算 Three-digit math','單位換算 Unit conversion','📐 幾何:三角形內角 Triangle angles','📐 幾何:三角形面積 Triangle area','📐 幾何:梯形面積 Trapezoid area','📐 幾何:正三角形周長 Equilateral perimeter','📐 幾何:面積逆推 Reverse area','📐 幾何:等腰三角形 Isosceles angles'],
  4:['多位數乘法 Multi-digit multiplication','同分母分數 Same-denominator fractions','面積 Area','三角形內角 Triangle angles','小數加法 Decimal addition','遞增數列 Accelerating sequences','🏆 奧數:高斯求和 Gauss summation','🏆 奧數:和差問題 Sum and difference','倍數關係 Times-as-many','小數減法 Decimal subtraction','📐 幾何:複合面積 Compound area','📐 幾何:補角 Supplementary angles','📐 幾何:對稱鏡射 Mirror symmetry','📐 幾何:半徑與直徑 Radius and diameter','📐 幾何:正多邊形 Regular polygons','📐 幾何:相框挖洞 Frame area'],
  5:['異分母分數 Unlike fractions','小數運算 Decimals','體積 Volume','因數偵探 Factor detective','最小公倍數 LCM','分數乘法 Fraction times whole','🏆 奧數:鴿籠原理 Pigeonhole principle','🏆 奧數:平均逆推 Reverse averages','最大公因數 GCF','小數除法 Decimal division','📐 幾何:長方體體積 Box volume','📐 幾何:圓周長 Circumference','📐 幾何:扇形分數 Sector fractions','📐 幾何:表面積 Surface area','📐 幾何:表面積 II Surface area II','📐 幾何:高的逆推 Solve for height'],
  6:['比與比值 Ratios','速率 Speed','分數小數互換 Fractions to decimals','百分率 Percentages','圓周長 Circumference','未知數方程 Solve for x','🏆 奧數:工程問題 Work-rate problems','🏆 奧數:費波那契 Fibonacci detective','圓面積 Circle area','速率反推 Solve for time','📐 幾何:看圖圓面積 Circle area drills','📐 幾何:平行四邊形 Parallelogram','📐 幾何:座標尋寶 Coordinate hunt','📐 幾何:面積比較 Area ratios','📐 幾何:圓環面積 Annulus','📐 幾何:門形組合 Door shapes'],
};

/* ── 出題引擎:每級 6 種生成器,「為什麼」全雙語 ── */
/* ── 出題引擎:why 為陣列 = 詳解步驟(規則→步驟→驗算→英文)── */
const MATH_GEN = {
  1:[
    ()=>{const a=ri(2,9),b=ri(2,10);const k=10-a;const steps=(b>=k)
      ?[`① 把 ${b} 拆成 ${k} 和 ${b-k}。`,`② ${a} + ${k} = 10(先補滿 10)。`,`③ 10 + ${b-k} = ${a+b}。`]
      :[`① 從 ${a} 開始往上數 ${b} 格,到 ${a+b}。`];
      return fi(`${a} + ${b} = ?`,`What is ${a} plus ${b}?`,a+b,nearNums(a+b,3),
      [`🔑 湊十法:10 是最好用的中繼站,先補滿它。`,...steps,`✔ 驗算:${a+b} − ${b} = ${a},回得去,正確!`,`EN: Split ${b} to fill up to ten, then add whats left.`])},
    ()=>{const a=ri(8,20),b=ri(1,a-1);return fi(`${a} − ${b} = ?`,`What is ${a} minus ${b}?`,a-b,nearNums(a-b,3),
      [`🔑 減法在量「距離」:從 ${b} 到 ${a} 有多遠。`,`① 從 ${b} 往上數到 ${a},共走 ${a-b} 步。`,`✔ 驗算:${b} + ${a-b} = ${a},拼得回去 ✓`,`EN: Count up from ${b} to ${a}; the gap is the answer.`])},
    ()=>{let a=ri(1,20),b=ri(1,20);if(a===b)b+=1;const big=Math.max(a,b);return fi(`${a} 和 ${b},哪個比較大?`,`Which is bigger, ${a} or ${b}?`,big,[Math.min(a,b),big+ri(1,5),Math.max(0,Math.min(a,b)-ri(1,3))],
      [`🔑 數線規則:越右邊的數越大。`,`① 想像數線,找到 ${Math.min(a,b)} 和 ${big} 的位置。`,`② ${big} 在右邊 → 比較大。`,`EN: On the number line, further right means bigger.`])},
    ()=>{const s=ri(1,6),d=ri(1,3);const seq=[s,s+d,s+2*d,s+3*d,s+4*d];return fi(`數列偵探:${seq[0]}, ${seq[1]}, ${seq[2]}, ?, ${seq[4]}。? 是多少?`,`Sequence detective: ${seq[0]}, ${seq[1]}, ${seq[2]}, ?, ${seq[4]}. What is missing?`,seq[3],nearNums(seq[3],3),
      [`🔑 數列三步驟:找差 → 驗證 → 預測。`,`① 相鄰的差:${seq[1]}−${seq[0]}=${d}、${seq[2]}−${seq[1]}=${d},固定 +${d}。`,`② 缺格 = ${seq[2]} + ${d} = ${seq[3]}。`,`✔ 驗算:${seq[3]} + ${d} = ${seq[4]},接得上最後一項 ✓`,`EN: The common difference is ${d}; use it to fill the gap.`])},
    ()=>{const a=ri(1,10),b=ri(1,10);return fi(`${a} + ? = ${a+b},? 是多少?`,`${a} plus what equals ${a+b}?`,b,nearNums(b,3),
      [`🔑 加法的反面是減法:未知的部分 = 全部 − 已知。`,`① ${a+b} − ${a} = ${b}。`,`✔ 驗算:${a} + ${b} = ${a+b} ✓`,`EN: The missing part equals the whole minus the known part.`])},
    ()=>{const a=ri(5,15),b=ri(1,a-1);const t=pick([
      {q:`小貓有 ${a} 顆彈珠,送出 ${b} 顆,還剩幾顆?`,en:`A cat has ${a} marbles and gives away ${b}. How many are left?`,ans:a-b,
       why:[`🔑 剩下 = 原有 − 送出(找關鍵字:「送出」=減)。`,`① ${a} − ${b} = ${a-b}。`,`✔ 驗算:剩的 ${a-b} + 送的 ${b} = ${a} ✓`,`EN: Left = start minus given away.`]},
      {q:`盒子裡有 ${a} 顆糖,又放進 ${b} 顆,總共幾顆?`,en:`A box has ${a} candies; ${b} more go in. Total?`,ans:a+b,
       why:[`🔑 總共 = 原有 + 新加(關鍵字:「又放進」=加)。`,`① ${a} + ${b} = ${a+b}。`,`✔ 驗算:${a+b} − ${b} = ${a} ✓`,`EN: Total = start plus added.`]},
    ]);return fi(t.q,t.en,t.ans,nearNums(t.ans,3),t.why)},
    ()=>{const a=ri(2,8),b=ri(2,8);return fi(`🏆 小奇排隊,前面有 ${a} 個人、後面有 ${b} 個人。這一排總共幾個人?`,`Chi stands in line with ${a} people ahead and ${b} behind. How many people in total?`,a+b+1,[a+b,a+b+2,Math.max(1,a+b-1)],
      [`🔑 奧數陷阱:總數 = 前面 + 後面 + 自己!`,`① 前後合計:${a} + ${b} = ${a+b}(小奇還沒被算進去)。`,`② 加上小奇:${a+b} + 1 = ${a+b+1}。`,`💡 心法:題目裡「隱形的人事物」最愛躲進答案。`,`EN: The hidden +1 is you — count yourself in.`])},
    ()=>{const cyc=pick([['○','△'],['○','○','△'],['△','□','○']]);const n=ri(5,12);const L=cyc.length;const posi=((n-1)%L)+1;const ans=cyc[(n-1)%L];const others=shuffle(['○','△','□','☆'].filter(x=>x!==ans)).slice(0,3);
      return fi(`🏆 圖形排隊:${Array.from({length:6},(_,i)=>cyc[i%L]).join(' ')} …一直重複。第 ${n} 個是什麼?`,`The pattern repeats forever. What is shape number ${n}?`,ans,others,
      [`🔑 週期問題:找出重複的「一組」,用餘數定位。`,`① 一組是「${cyc.join('')}」,長度 ${L}。`,`② 第 ${n} 個對應組內第 ${posi} 個 → ${ans}。`,`💡 找到週期後,第 1000 個也不用一個一個數。`,`EN: Find the repeating block, then locate by remainder.`])},
    ()=>{const f=ri(1,3),o=ri(1,4);return fi(`小奇有 ${f} 個 5 元硬幣和 ${o} 個 1 元硬幣,總共多少元?`,`Chi has ${f} five-dollar coins and ${o} one-dollar coins. Total?`,f*5+o,nearNums(f*5+o,3),
      [`🔑 錢幣計算:先算同種硬幣的小計,再相加。`,`① 5 元硬幣:${f} × 5 = ${f*5} 元。`,`② 1 元硬幣:${o} × 1 = ${o} 元。`,`③ 合計:${f*5} + ${o} = ${f*5+o} 元。`,`✔ 驗算:${f*5+o} − ${o} = ${f*5},是 5 的倍數 ✓`,`EN: Subtotal each coin type, then add.`])},
    ()=>{const a=ri(6,12),b=ri(2,6),c=ri(1,5);return fi(`公車上有 ${a} 人,到站後上來 ${b} 人、下去 ${c} 人。現在車上幾人?`,`A bus has ${a} riders; ${b} board and ${c} leave. How many now?`,a+b-c,nearNums(a+b-c,3),
      [`🔑 兩步驟問題:一步一步來,別急著一次算完。`,`① 上車後:${a} + ${b} = ${a+b} 人。`,`② 下車後:${a+b} − ${c} = ${a+b-c} 人。`,`✔ 驗算:${a+b-c} + ${c} − ${b} = ${a},倒推回起點 ✓`,`EN: Two steps: add the boarders, then subtract the leavers.`])},
    ()=>{const w=ri(3,8),h=ri(2,6);return fi(`看圖:一個長方形長 ${w}、寬 ${h} 格。數數看總共有幾個小方格?`,`Count the unit squares in this ${w}×${h} rectangle.`,w*h,nearNums(w*h,4),
      [`🔑 面積的起點:數方格 = 每排數量 × 排數。`,`① 每排 ${w} 格。`,`② 共 ${h} 排:${w} × ${h} = ${w*h} 格。`,`✔ 換方向數:${h} × ${w} = ${w*h} ✓`,`EN: Squares = per row times number of rows.`],
      GEO.rect(w,h,`${w} 格`,`${h} 格`))},
    ()=>{const s=ri(2,7);return fi(`看圖:這個正方形每邊 ${s} 公分。四邊加起來(周長)是多少公分?`,`Each side of this square is ${s} cm. What is the perimeter?`,s*4,nearNums(s*4,4),
      [`🔑 正方形四邊一樣長,周長 = 邊長 × 4。`,`① ${s} × 4 = ${s*4} 公分。`,`✔ 逐邊加:${s}+${s}+${s}+${s} = ${s*4} ✓`,`EN: A square has 4 equal sides: side × 4.`],
      GEO.square(`${s} cm`))},
    ()=>{const n=ri(3,6);const shapes=[['三角形',3],['正方形',4],['五邊形',5],['六邊形',6]];const s=shapes[n-3];const pts=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;pts.push(`${(60+30*Math.cos(a)).toFixed(0)},${(50+30*Math.sin(a)).toFixed(0)}`);}return fi(`看圖:這個形狀有幾個邊?`,`How many sides does this shape have?`,n,nearNums(n,2),
      [`🔑 數邊:繞一圈,每一條直線算一邊。`,`① 這是${s[0]},有 ${n} 條邊。`,`✔ 邊數 = 角數:${n} 個邊配 ${n} 個角。`,`EN: Count each straight line as one side.`],
      SVG(`<polygon points="${pts.join(' ')}" class="gshape"/>`))},
    ()=>{const w=ri(3,7);return fi(`看圖:一個正方形被分成 ${w}×${w} 的小格。總共有幾個小格?`,`This square is split into a ${w}×${w} grid. How many small squares?`,w*w,nearNums(w*w,5),
      [`🔑 方陣總數 = 邊數 × 邊數。`,`① ${w} × ${w} = ${w*w} 格。`,`✔ 正方形的長寬相等,所以是「邊長的平方」。`,`EN: A square grid has side × side small squares.`],
      SVG(`<rect x="30" y="18" width="60" height="60" class="gshape"/>`+Array.from({length:w-1},(_,i)=>`<line x1="${30+60*(i+1)/w}" y1="18" x2="${30+60*(i+1)/w}" y2="78" class="gline"/><line x1="30" y1="${18+60*(i+1)/w}" x2="90" y2="${18+60*(i+1)/w}" class="gline"/>`).join('')))},
    ()=>{const n=pick([[3,'三角形'],[4,'四邊形'],[5,'五邊形'],[6,'六邊形']]);const pts=Array.from({length:n[0]},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n[0];return `${(60+34*Math.cos(a)).toFixed(1)},${(50+34*Math.sin(a)).toFixed(1)}`}).join(' ');return fi(`看圖:這個圖形有幾條邊?`,`How many sides does this shape have?`,n[0],[n[0]+1,Math.max(3,n[0]-1),n[0]+2],
      [`🔑 多邊形的名字藏著答案:幾邊形就有幾條邊、幾個角。`,`① 沿著圖形描一圈,數轉折之間的直線段。`,`② 共 ${n[0]} 條邊——這是${n[1]}。`,`✔ 邊數 = 角數:數角也是 ${n[0]} 個 ✓`,`EN: An n-gon has n sides and n corners.`],
      SVG(`<polygon points="${pts}" class="gshape"/>`))},
    ()=>{const a=ri(6,12),b=ri(2,a-2);return fi(`看圖:上面的棒子長 ${a} 公分,下面的長 ${b} 公分。上面比下面長多少公分?`,`The top bar is ${a} cm, the bottom ${b} cm. How much longer is the top?`,a-b,nearNums(a-b,3),
      [`🔑 「比…長多少」= 兩長度相減。`,`① ${a} − ${b} = ${a-b} 公分。`,`✔ 驗算:${b} + ${a-b} = ${a} ✓`,`EN: How much longer means subtract the two lengths.`],
      SVG(`<rect x="10" y="26" width="${a*8}" height="12" class="gshape"/><rect x="10" y="58" width="${b*8}" height="12" class="gside"/>`+gLabel(10+a*4,20,a+' cm')+gLabel(10+b*4,84,b+' cm')))},
  ],
  2:[
    ()=>{const a=ri(11,89),b=ri(11,99-a);const at=Math.floor(a/10)*10,bt=Math.floor(b/10)*10;return fi(`${a} + ${b} = ?`,`${a} plus ${b}?`,a+b,nearNums(a+b,10),
      [`🔑 分位相加:十位跟十位、個位跟個位。`,`① 十位:${at} + ${bt} = ${at+bt}。`,`② 個位:${a%10} + ${b%10} = ${a%10+b%10}。`,`③ 合併:${at+bt} + ${a%10+b%10} = ${a+b}。`,`✔ 驗算:${a+b} − ${b} = ${a} ✓`,`EN: Add tens with tens, ones with ones, then combine.`])},
    ()=>{const a=ri(30,99),b=ri(11,a-10);const bt=Math.floor(b/10)*10;return fi(`${a} − ${b} = ?`,`${a} minus ${b}?`,a-b,nearNums(a-b,10),
      [`🔑 拆著減:先減整十,再減個位。`,`① ${a} − ${bt} = ${a-bt}。`,`② ${a-bt} − ${b%10} = ${a-b}。`,`✔ 驗算:${a-b} + ${b} = ${a} ✓`,`EN: Subtract the tens first, then the ones.`])},
    ()=>{const a=ri(2,9),b=ri(2,9);return fi(`${a} × ${b} = ?`,`${a} times ${b}?`,a*b,nearNums(a*b,a),
      [`🔑 乘法 = 加法的快捷鍵:${a}×${b} 就是 ${b} 個 ${a}。`,`① 九九乘法表:${a}×${b} = ${a*b}。`,`② 忘了的話用鄰居推:${a}×${b-1} = ${a*(b-1)},再加一個 ${a} → ${a*b}。`,`EN: One times-table fact, or build it from the neighbor fact.`])},
    ()=>{const s=ri(2,5);return fi(`數列偵探:${s}, ${s*2}, ${s*4}, ?。下一個是多少?`,`Sequence detective: ${s}, ${s*2}, ${s*4}, ?. What comes next?`,s*8,[s*6,s*5,s*8+s],
      [`🔑 差不固定時,改查「倍率」。`,`① ${s*2}÷${s}=2、${s*4}÷${s*2}=2 → 每次 ×2。`,`② 下一個:${s*4} × 2 = ${s*8}。`,`✔ 倍增數列長超快——這就是「指數成長」的雛形!`,`EN: When differences fail, check ratios: it doubles.`])},
    ()=>{const p=ri(5,20),n=ri(2,5);return fi(`一枝筆 ${p} 元,買 ${n} 枝要多少元?`,`One pen costs ${p} dollars. How much for ${n} pens?`,p*n,nearNums(p*n,p),
      [`🔑 總價 = 單價 × 數量。`,`① ${p} × ${n} = ${p*n} 元。`,`② 也可以連加驗證:${Array.from({length:n},()=>p).join('+')} = ${p*n}。`,`EN: Total = price per item times how many.`])},
    ()=>{const b=ri(2,9),q=ri(2,9);return fi(`? × ${b} = ${b*q},? 是多少?`,`What times ${b} equals ${b*q}?`,q,nearNums(q,3),
      [`🔑 除法是乘法的逆向偵探。`,`① ? = ${b*q} ÷ ${b} = ${q}。`,`✔ 驗算:${q} × ${b} = ${b*q} ✓`,`EN: Division undoes multiplication.`])},
    ()=>{const d=pick([2,3,5]),k=ri(4,9);const L=d*k;return fi(`🏆 一條 ${L} 公尺的直路,每 ${d} 公尺種一棵樹(頭尾都種),共種幾棵?`,`A ${L} m road gets a tree every ${d} m, both ends included. How many trees?`,k+1,[k,k+2,Math.max(1,k-1)],
      [`🔑 柵欄陷阱:頭尾都種時,樹永遠比「段」多 1。`,`① 段數:${L} ÷ ${d} = ${k} 段。`,`② 樹:${k} + 1 = ${k+1} 棵。`,`✔ 畫小圖驗證:3 段的路 |—|—|—| 有 4 棵 ✓ 規則成立。`,`EN: Segments plus one — the famous fencepost trap.`])},
    ()=>{const u=ri(0,7),t=ri(u+1,9);const num=t*10+u;return fi(`🏆 數字偵探:我是兩位數,兩個數字加起來是 ${t+u},十位比個位大 ${t-u}。我是誰?`,`A two-digit number: digits sum to ${t+u}, tens digit exceeds ones by ${t-u}. Which number am I?`,num,nearNums(num,10),
      [`🔑 和差問題:大的 = (和+差)÷2。`,`① 十位 = (${t+u} + ${t-u}) ÷ 2 = ${t}。`,`② 個位 = ${t+u} − ${t} = ${u} → 答案 ${num}。`,`✔ 檢查:${t}+${u}=${t+u} ✓、${t}−${u}=${t-u} ✓`,`EN: Sum and difference together pin down both digits.`])},
    ()=>{const b=ri(2,9),k=ri(2,9);return fi(`${b*k} 顆糖平分給 ${b} 個人,每人分到幾顆?`,`${b*k} candies shared equally among ${b} people. Each gets?`,k,nearNums(k,3),
      [`🔑 平分=除法:總數 ÷ 人數 = 每人份。`,`① ${b*k} ÷ ${b} = ${k}。`,`✔ 驗算:${k} × ${b} = ${b*k},剛好分完 ✓`,`EN: Sharing equally is division: total over people.`])},
    ()=>{const a=ri(2,9);return fi(`${a} 公尺是幾公分?`,`How many centimeters is ${a} meters?`,a*100,[a*10,a*1000,a*100+10],
      [`🔑 單位換算:1 公尺 = 100 公分(公=×100 的暗號)。`,`① ${a} × 100 = ${a*100} 公分。`,`✔ 反向:${a*100} 公分 ÷ 100 = ${a} 公尺 ✓`,`EN: One meter is 100 centimeters; multiply by 100.`])},
    ()=>{const w=ri(4,12),h=ri(3,9);return fi(`看圖的長方形:長 ${w} 公分、寬 ${h} 公分,面積是多少平方公分?`,`This rectangle is ${w} by ${h} cm. Find its area.`,w*h,nearNums(w*h,12),
      [`🔑 長方形面積 = 長 × 寬。`,`① ${w} × ${h} = ${w*h} 平方公分。`,`✔ 面積在數「裡面塞得下幾個 1×1 方格」。`,`EN: Rectangle area = length times width.`],
      GEO.rect(w,h,`${w} cm`,`${h} cm`))},
    ()=>{const w=ri(4,12),h=ri(3,9);return fi(`看圖的長方形:長 ${w}、寬 ${h} 公分。走一圈的周長是多少公分?`,`Perimeter of this ${w} by ${h} rectangle?`,2*(w+h),nearNums(2*(w+h),8),
      [`🔑 周長 = 繞一圈 = (長 + 寬) × 2。`,`① ${w} + ${h} = ${w+h}(半圈)。`,`② × 2 = ${2*(w+h)} 公分。`,`✔ 別和面積搞混:周長是「邊線總長」。`,`EN: Perimeter = (length + width) × 2.`],
      GEO.rect(w,h,`${w} cm`,`${h} cm`))},
    ()=>{const deg=pick([30,45,60,120,135,150]);const kind=deg<90?'銳角(小於90°)':'鈍角(大於90°)';return fi(`看圖的角是 ${deg}°。180 減掉它等於多少?`,`This angle is ${deg}°. What is 180 minus it?`,180-deg,nearNums(180-deg,15),
      [`🔑 ${deg}° 是${kind}。一直線是 180°。`,`① 180 − ${deg} = ${180-deg}°。`,`✔ 這 ${180-deg}° 和原本的角能拼成一直線。`,`EN: A straight line is 180°; subtract the angle.`],
      GEO.anglecmp(deg))},
    ()=>{const w=ri(5,10),h=ri(3,7);return fi(`看圖的長方形長 ${w}、寬 ${h}。如果長和寬都加 1,新面積是多少?`,`This rectangle is ${w}×${h}. If both grow by 1, what is the new area?`,(w+1)*(h+1),nearNums((w+1)*(h+1),12),
      [`🔑 先變新尺寸,再算面積(別急著用舊數字)。`,`① 新長 ${w+1}、新寬 ${h+1}。`,`② ${w+1} × ${h+1} = ${(w+1)*(h+1)}。`,`💡 注意:面積增加的不只 1,因為長寬「同時」變大。`,`EN: Update both sides first, then multiply.`],
      GEO.rect(w,h,`${w}→${w+1}`,`${h}→${h+1}`))},
    ()=>{const s=ri(2,7);return fi(`看圖:兩個邊長 ${s} 公分的正方形拼成一個長方形。長方形的「長」是多少公分?`,`Two squares of side ${s} cm form a rectangle. How long is the rectangle?`,s*2,[s,s*3,s*2+1],
      [`🔑 拼圖思維:兩個正方形並排,長 = 邊長 × 2,寬不變。`,`① ${s} × 2 = ${s*2} 公分。`,`✔ 寬仍是 ${s} 公分,所以是 ${s*2}×${s} 的長方形 ✓`,`EN: Two squares side by side double the length.`],
      SVG(`<rect x="14" y="30" width="44" height="44" class="gshape"/><rect x="58" y="30" width="44" height="44" class="gshape"/>`+gLabel(36,24,s+' cm')+gLabel(80,24,s+' cm')))},
    ()=>{const s=ri(3,9);return fi(`看圖:正方形的周長是 ${s*4} 公分。一條邊是多少公分?`,`This square has perimeter ${s*4} cm. How long is one side?`,s,nearNums(s,3),
      [`🔑 逆向思考:周長 = 邊 × 4,所以 邊 = 周長 ÷ 4。`,`① ${s*4} ÷ 4 = ${s} 公分。`,`✔ 正向驗算:${s} × 4 = ${s*4} ✓`,`💡 會正著算,也要會倒著推——這叫逆運算。`,`EN: Reverse it: side = perimeter divided by 4.`],
      SVG(`<rect x="30" y="18" width="60" height="60" class="gshape"/>`+gLabel(60,94,`周長 ${s*4} cm`)+gLabel(60,50,'邊 = ?')))},
  ],
  3:[
    ()=>{const a=ri(3,9),b=ri(12,25);const bt=Math.floor(b/10)*10;return fi(`${a} × ${b} = ?`,`${a} times ${b}?`,a*b,nearNums(a*b,a*2),
      [`🔑 拆開算(分配律):把 ${b} 拆成 ${bt} 和 ${b%10}。`,`① ${a} × ${bt} = ${a*bt}。`,`② ${a} × ${b%10} = ${a*(b%10)}。`,`③ 相加:${a*bt} + ${a*(b%10)} = ${a*b}。`,`EN: Split ${b} into tens and ones, multiply each, add.`])},
    ()=>{const b=ri(3,9),q=ri(3,12);return fi(`${b*q} ÷ ${b} = ?`,`${b*q} divided by ${b}?`,q,nearNums(q,3),
      [`🔑 除法反問乘法:「${b} 乘多少等於 ${b*q}?」`,`① 想乘法表:${b} × ${q} = ${b*q}。`,`② 所以答案是 ${q}。`,`✔ 驗算:${q} × ${b} = ${b*q} ✓`,`EN: Division asks the multiplication question backwards.`])},
    ()=>{const d=pick([2,3,4,6,8]),n=ri(1,d-1);const whole=d*ri(2,6);const ans=whole/d*n;return fi(`${whole} 的 ${n}/${d} 是多少?`,`What is ${n}/${d} of ${whole}?`,ans,nearNums(ans,4),
      [`🔑 分數 = 先切再拿。`,`① 切:${whole} ÷ ${d} = ${whole/d}(每一份的大小)。`,`② 拿:${whole/d} × ${n} = ${ans}(拿 ${n} 份)。`,`✔ 驗算:拿滿 ${d} 份 = ${whole/d}×${d} = ${whole},回到全部 ✓`,`EN: Cut into ${d} parts, then take ${n} of them.`])},
    ()=>{const b=ri(3,9),q=ri(3,9),r=ri(1,b-1);const a=b*q+r;return fi(`${a} ÷ ${b} = 商多少、餘多少?`,`${a} divided by ${b}: quotient and remainder?`,`商 ${q} 餘 ${r}`,[`商 ${q+1} 餘 ${r}`,`商 ${q} 餘 ${r===1?2:r-1}`,`商 ${q-1} 餘 ${r}`],
      [`🔑 商 = 裝滿幾組;餘 = 裝不下的零頭(必須小於 ${b})。`,`① ${b} × ${q} = ${b*q}(最接近又不超過 ${a})。`,`② ${a} − ${b*q} = ${r}。`,`✔ 驗算:${b}×${q}+${r} = ${a} ✓`,`EN: Multiply back up; the leftover is the remainder.`])},
    ()=>{const st=ri(1,8),len=ri(1,3);return fi(`電影 ${st} 點開始,演 ${len} 小時,幾點結束?`,`A movie starts at ${st} and runs ${len} hours. When does it end?`,st+len,nearNums(st+len,2),
      [`🔑 結束 = 開始 + 經過。`,`① ${st} + ${len} = ${st+len} 點。`,`✔ 倒推驗算:${st+len} − ${len} = ${st},回到開場 ✓`,`EN: End time = start time plus duration.`])},
    ()=>{const l=ri(4,15),w=ri(3,l);return fi(`長 ${l} 公分、寬 ${w} 公分的長方形,周長是多少公分?`,`Perimeter of a ${l} by ${w} rectangle?`,2*(l+w),[l*w,l+w,2*l+w],
      [`🔑 周長 = 繞一圈:兩條長 + 兩條寬。`,`① 半圈:${l} + ${w} = ${l+w}。`,`② 一圈:${l+w} × 2 = ${2*(l+w)}。`,`✔ 逐邊加驗算:${l}+${w}+${l}+${w} = ${2*(l+w)} ✓`,`EN: Perimeter is the full lap around: (L+W) times two.`])},
    ()=>{const c=ri(2,6),r=ri(2,6);const h=c+r,l=2*c+4*r;return fi(`🏆 雞兔同籠:籠裡共 ${h} 個頭、${l} 隻腳。兔子有幾隻?`,`Chickens and rabbits share a cage: ${h} heads, ${l} legs. How many rabbits?`,r,nearNums(r,2),
      [`🔑 假設法:先假設全部是雞,看腳多出多少。`,`① 全雞的話:${h} × 2 = ${2*h} 隻腳。`,`② 實際多出:${l} − ${2*h} = ${l-2*h} 隻腳。`,`③ 每把一隻雞換成兔,腳多 2 → 兔 = ${l-2*h} ÷ 2 = ${r} 隻。`,`✔ 驗算:兔 ${r}×4 + 雞 ${c}×2 = ${l} 隻腳 ✓`,`EN: Assume all chickens, count extra legs, divide by two.`])},
    ()=>{const days=['日','一','二','三','四','五','六'];const s=ri(0,6),n=ri(8,30);const e=(s+n)%7;return fi(`🏆 今天星期${days[s]},再過 ${n} 天是星期幾?`,`Today is ${'Sun Mon Tue Wed Thu Fri Sat'.split(' ')[s]}. What day is it ${n} days later?`,`星期${days[e]}`,shuffle(days.filter((_,i)=>i!==e)).slice(0,3).map(x=>`星期${x}`),
      [`🔑 星期是「循環 7」的世界,只有餘數重要。`,`① ${n} ÷ 7 = ${Math.floor(n/7)} 週…餘 ${n%7} 天(整週可以直接丟掉)。`,`② 星期${days[s]} 往後 ${n%7} 天 → 星期${days[e]}。`,`💡 一萬天後是星期幾,也是同一招。`,`EN: Whole weeks vanish; only the remainder moves the day.`])},
    ()=>{const a=ri(120,480),b=ri(120,499);return fi(`${a} + ${b} = ?`,`${a} plus ${b}?`,a+b,nearNums(a+b,40),
      [`🔑 三位數加法:百位、十位、個位各自對齊相加。`,`① 百位:${Math.floor(a/100)*100} + ${Math.floor(b/100)*100} = ${Math.floor(a/100)*100+Math.floor(b/100)*100}。`,`② 剩下的:${a%100} + ${b%100} = ${a%100+b%100}。`,`③ 合併:${a+b}。`,`✔ 估算:約 ${Math.round(a/100)*100}+${Math.round(b/100)*100}=${Math.round(a/100)*100+Math.round(b/100)*100},接近 ✓`,`EN: Add hundreds, tens and ones in their own columns.`])},
    ()=>{const t=pick([{q:'公斤是幾公克',u:1000,ue:'kilograms in grams'},{q:'小時是幾分鐘',u:60,ue:'hours in minutes'}]);const a=ri(2,9);return fi(`${a} ${t.q}?`,`${a} ${t.ue}?`,a*t.u,[a*t.u/10,a*t.u*10,a*t.u+t.u/10],
      [`🔑 單位換算:先記住「1 大單位=多少小單位」這把鑰匙(這題是 ${t.u})。`,`① ${a} × ${t.u} = ${a*t.u}。`,`✔ 反向除回去:${a*t.u} ÷ ${t.u} = ${a} ✓`,`EN: Multiply by the conversion key: ${t.u}.`])},
    ()=>{const a=ri(30,80),b=ri(30,150-a);return fi(`看圖的三角形,已知兩個角是 ${a}° 和 ${b}°。第三個角(?)是幾度?`,`Two angles of this triangle are ${a}° and ${b}°. Find the third (?).`,180-a-b,nearNums(180-a-b,15),
      [`🔑 三角形內角和永遠 = 180°。`,`① 已知兩角相加:${a} + ${b} = ${a+b}。`,`② 第三角:180 − ${a+b} = ${180-a-b}。`,`✔ 三角相加:${a}+${b}+${180-a-b} = 180 ✓`,`EN: The three angles of any triangle sum to 180°.`],
      GEO.triangle(a,b,true))},
    ()=>{const base=ri(4,12),h=ri(3,10);const area=base*h/2;return fi(`看圖的直角三角形,底 ${base} 公分、高 ${h} 公分。面積是多少平方公分?`,`This right triangle has base ${base} and height ${h} cm. Find the area.`,area,nearNums(area,6),
      [`🔑 三角形面積 = 底 × 高 ÷ 2(它是長方形的一半!)。`,`① ${base} × ${h} = ${base*h}(整個長方形)。`,`② ÷ 2 = ${area} 平方公分。`,`✔ 想像兩個一樣的三角形拼成長方形,面積剛好一半。`,`EN: Triangle area = base × height ÷ 2.`],
      GEO.rtri(`${base} cm`,`${h} cm`))},
    ()=>{const top=ri(3,6),bot=ri(7,11),h=ri(3,6);const area=(top+bot)*h/2;return fi(`看圖的梯形:上底 ${top}、下底 ${bot}、高 ${h} 公分。面積是多少?`,`This trapezoid has parallel sides ${top} and ${bot}, height ${h}. Find the area.`,area,nearNums(area,8),
      [`🔑 梯形面積 =(上底 + 下底)× 高 ÷ 2。`,`① 上底+下底:${top} + ${bot} = ${top+bot}。`,`② ×高÷2:${top+bot} × ${h} ÷ 2 = ${area}。`,`💡 想像上下兩底的「平均長度」乘以高,就是面積。`,`EN: Trapezoid area = (top + bottom) × height ÷ 2.`],
      GEO.trapezoid(`${top}`,`${bot}`,`${h}`))},
    ()=>{const s=ri(3,8);const per=s*3;return fi(`看圖的正三角形,每邊 ${s} 公分。周長是多少?`,`This equilateral triangle has sides of ${s} cm. Find the perimeter.`,per,nearNums(per,4),
      [`🔑 正三角形三邊等長,周長 = 邊長 × 3。`,`① ${s} × 3 = ${per} 公分。`,`✔ 三邊都是 ${s}:${s}+${s}+${s} = ${per} ✓`,`EN: Equilateral means 3 equal sides: side × 3.`],
      SVG(`<polygon points="60,20 92,74 28,74" class="gshape"/>`+gLabel(60,16,`${s}`)+gLabel(88,80,`${s}`)+gLabel(32,80,`${s}`)))},
    ()=>{const w=ri(3,9),h=ri(3,9);return fi(`看圖:長方形的面積是 ${w*h} 平方公分,長是 ${w} 公分。寬是多少公分?`,`Area is ${w*h} sq cm and length is ${w} cm. Find the width.`,h,nearNums(h,3),
      [`🔑 面積 = 長 × 寬 → 寬 = 面積 ÷ 長(逆運算)。`,`① ${w*h} ÷ ${w} = ${h} 公分。`,`✔ 驗算:${w} × ${h} = ${w*h} ✓`,`EN: Width = area divided by length.`],
      GEO.rect(w,h,`${w} cm`,`?`).replace('</svg>',gLabel(60,52,`面積 ${w*h}`)+'</svg>'))},
    ()=>{const a=pick([40,50,60,70,80,100,120]);const b=(180-a)/2;return fi(`看圖的等腰三角形(兩腰相等,記號相同),頂角是 ${a}°。一個底角是幾度?`,`This isosceles triangle has apex ${a}°. Find one base angle.`,b,nearNums(b,12),
      [`🔑 等腰三角形:兩底角相等;三角和 = 180°。`,`① 兩底角合計:180 − ${a} = ${180-a}°。`,`② 平分給兩個角:${180-a} ÷ 2 = ${b}°。`,`✔ 驗算:${a} + ${b} + ${b} = 180 ✓`,`EN: Base angles are equal: (180 − apex) ÷ 2.`],
      SVG(`<polygon points="60,18 24,80 96,80" class="gshape"/><line x1="40" y1="46" x2="46" y2="52" class="gang"/><line x1="80" y1="46" x2="74" y2="52" class="gang"/>`+gLabel(60,34,a+'°')+gLabel(34,74,'?')))},
  ],
  4:[
    ()=>{const a=ri(12,40),b=ri(12,40);const bt=Math.floor(b/10)*10;return fi(`${a} × ${b} = ?`,`${a} times ${b}?`,a*b,nearNums(a*b,30),
      [`🔑 大數乘法一樣用「拆開算」:把 ${b} 拆成 ${bt} 和 ${b%10}。`,`① ${a} × ${bt} = ${a*bt}。`,`② ${a} × ${b%10} = ${a*(b%10)}。`,`③ 相加:${a*bt} + ${a*(b%10)} = ${a*b}。`,`✔ 估算檢查:約 ${Math.round(a/10)*10}×${bt} = ${Math.round(a/10)*10*bt},數量級接近 ✓`,`EN: Split into tens and ones, multiply each part, add.`])},
    ()=>{const d=pick([5,7,8,9,11]);const n1=ri(1,d-2),n2=ri(1,d-n1-1);const fans=`${n1+n2}/${d}`;const fds=[...new Set([`${n1+n2}/${d*2}`,`${n1+n2+1}/${d}`,`${n1*n2}/${d}`,`${Math.max(1,n1+n2-1)}/${d}`,`${n1+n2}/${d+1}`])].filter(x=>x!==fans).slice(0,3);return fi(`${n1}/${d} + ${n2}/${d} = ?`,`${n1}/${d} plus ${n2}/${d}?`,fans,fds,
      [`🔑 分母 = 切法。切法相同,只加「拿的份數」。`,`① 份數相加:${n1} + ${n2} = ${n1+n2}。`,`② 切法不變:分母仍是 ${d} → ${n1+n2}/${d}。`,`⚠ 最常見的錯:把分母也加起來(${d}+${d}=${d*2})——那等於改變了切法!`,`EN: Same slice size — add only the counts, never the denominators.`])},
    ()=>{const w=ri(3,12),h=ri(3,12);return fi(`長 ${w}、寬 ${h} 公分的長方形,面積是多少平方公分?`,`Area of a ${w} by ${h} rectangle?`,w*h,nearNums(w*h,10),
      [`🔑 面積 = 數 1×1 小方塊:每排 ${w} 塊、共 ${h} 排。`,`① ${w} × ${h} = ${w*h} 平方公分。`,`✔ 換方向數:${h} × ${w} = ${w*h},一樣 ✓(乘法交換律!)`,`EN: Count unit squares: ${w} per row times ${h} rows.`])},
    ()=>{const a=ri(30,80),b=ri(30,140-a);return fi(`三角形兩個角是 ${a}° 和 ${b}°,第三個角是幾度?`,`A triangle has angles ${a}° and ${b}°. The third angle?`,180-a-b,nearNums(180-a-b,15),
      [`🔑 鐵律:任何三角形的內角和都是 180°——撕下三個角拼起來剛好一條直線!`,`① 已知兩角:${a} + ${b} = ${a+b}。`,`② 第三角:180 − ${a+b} = ${180-a-b}。`,`✔ 驗算:${a} + ${b} + ${180-a-b} = 180 ✓`,`EN: The three angles of any triangle always total 180 degrees.`])},
    ()=>{const a=ri(10,99)/10,b=ri(10,99)/10;const s=Math.round((a+b)*10)/10;return fi(`${a} + ${b} = ?`,`${a} plus ${b}?`,s,[Math.round((s+0.3)*10)/10,Math.round((s-0.2)*10)/10,Math.round((s+1)*10)/10],
      [`🔑 小數點 = 「個位在哪裡」的座標,先對齊再加。`,`① 小數點對齊,像直式加法一樣算。`,`② ${a} + ${b} = ${s}。`,`✔ 估算檢查:約 ${Math.round(a)} + ${Math.round(b)} = ${Math.round(a)+Math.round(b)},和 ${s} 接近 ✓`,`EN: Line up the decimal points, then add as usual.`])},
    ()=>{const s=ri(1,8),d=ri(2,4);const t=[s,s+d,s+2*d+2,s+3*d+6];const next=s+4*d+12;return fi(`數列偵探:${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ?。下一個?`,`Sequence detective: ${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}, ?. Next?`,next,nearNums(next,4),
      [`🔑 一階差不固定?往下挖一層,看「差的差」。`,`① 差:+${d}, +${d+2}, +${d+4} → 差本身每次多 2。`,`② 下一個差 = +${d+6}。`,`③ ${t[3]} + ${d+6} = ${next}。`,`💡 這叫「二階規律」——你剛用了微積分的思考雛形。`,`EN: When gaps change, study the gaps of the gaps.`])},
    ()=>{const n=pick([10,20,30,40,50,100]);return fi(`🏆 1+2+3+…+${n} = ?(想想高斯 9 歲時怎麼算)`,`What is 1+2+...+${n}? (Gauss cracked this at age nine)`,n*(n+1)/2,nearNums(n*(n+1)/2,n),
      [`🔑 頭尾配對:1+${n}、2+${n-1}、3+${n-2}…每一對都是 ${n+1}!`,`① 總共可以配 ${n} ÷ 2 = ${n/2} 對。`,`② ${n+1} × ${n/2} = ${n*(n+1)/2}。`,`💡 高斯九歲想出這招——正是你的年紀。這是「萬用工具」:任何等差數列都適用。`,`EN: Pair first with last; every pair sums to ${n+1}.`])},
    ()=>{const small=ri(5,20),big=small+ri(3,15);const s=big+small,d=big-small;return fi(`🏆 兩個數的和是 ${s}、差是 ${d}。比較大的數是多少?`,`Two numbers: sum ${s}, difference ${d}. The larger one is?`,big,nearNums(big,4),
      [`🔑 和差公式:大 = (和+差)÷2。想像把「差」補給小的,兩人就一樣大。`,`① (${s} + ${d}) ÷ 2 = ${big}。`,`② 小的 = ${s} − ${big} = ${small}。`,`✔ 驗算:${big}+${small}=${s} ✓、${big}−${small}=${d} ✓`,`EN: Larger = (sum + difference) divided by two.`])},
    ()=>{const b=ri(3,9),k=ri(3,9);return fi(`${b*k} 是 ${b} 的幾倍?`,`${b*k} is how many times ${b}?`,k,nearNums(k,3),
      [`🔑 「幾倍」就是除法:大 ÷ 小 = 倍數。`,`① ${b*k} ÷ ${b} = ${k}。`,`✔ 驗算:${b} × ${k} = ${b*k} ✓`,`EN: Times-as-many means divide the big by the small.`])},
    ()=>{const a=ri(50,99)/10,b=ri(10,Math.round(a*10)-5)/10;const d=Math.round((a-b)*10)/10;return fi(`${a} − ${b} = ?`,`${a} minus ${b}?`,d,[Math.round((d+0.3)*10)/10,Math.round((d-0.2)*10)/10,Math.round((d+1)*10)/10],
      [`🔑 小數減法:小數點對齊,像整數一樣借位。`,`① 對齊小數點,${a} − ${b}。`,`② 得 ${d}。`,`✔ 驗算:${d} + ${b} = ${a} ✓`,`EN: Line up the decimal points, then subtract as usual.`])},
    ()=>{const a=ri(4,9),b=ri(3,7),c=ri(3,6),d=ri(3,6);const area=a*b+c*d;return fi(`看圖的 L 形,可拆成兩個長方形:${a}×${b} 和 ${c}×${d}。總面積是多少?`,`This L-shape splits into a ${a}×${b} and a ${c}×${d} rectangle. Total area?`,area,nearNums(area,12),
      [`🔑 複合圖形:切成幾個長方形,分別算再相加。`,`① 第一塊:${a} × ${b} = ${a*b}。`,`② 第二塊:${c} × ${d} = ${c*d}。`,`③ 合計:${a*b} + ${c*d} = ${area}。`,`💡 拆解法:再複雜的圖形都能拆成會算的小塊。`,`EN: Split a compound shape into rectangles, then add.`],
      GEO.Lshape(''))},
    ()=>{const a=ri(40,90);return fi(`看圖,一直線上的一個角是 ${a}°,它旁邊的角(補角)是幾度?`,`On a straight line, one angle is ${a}°. Find its supplement.`,180-a,nearNums(180-a,15),
      [`🔑 一直線是 180°:直線上兩角互為「補角」,相加 = 180°。`,`① 180 − ${a} = ${180-a}°。`,`✔ 驗算:${a} + ${180-a} = 180 ✓`,`💡 兩個直角(90°+90°)也剛好拉成一直線。`,`EN: Angles on a straight line add to 180°.`],
      SVG(`<line x1="10" y1="60" x2="110" y2="60" class="gline"/><line x1="60" y1="60" x2="88" y2="26" class="gline"/><path d="M78,60 A18,18 0 0,0 74,44" class="gang"/>`+gLabel(84,50,a+'°')+gLabel(40,54,'?')))},
    ()=>{const half=ri(3,7);return fi(`看圖:虛線是對稱軸。左邊有一個點在距軸 ${half} 格的地方,右邊對稱的點距軸幾格?`,`The dashed line is the axis of symmetry. A point sits ${half} units left of it. How far right is its mirror?`,half,nearNums(half,2),
      [`🔑 對稱=鏡子:兩邊到對稱軸的距離一定相等。`,`① 左邊 ${half} 格 → 右邊也是 ${half} 格。`,`✔ 對稱軸就像鏡面,左右是彼此的鏡像。`,`EN: Symmetry mirrors distance: same on both sides.`],
      SVG(`<line x1="60" y1="12" x2="60" y2="88" class="gdash"/><circle cx="${60-half*6}" cy="50" r="3.5" class="gdot"/><circle cx="${60+half*6}" cy="50" r="3" class="gline" fill="none"/>`+gLabel(60-half*6,42,`${half}`)+gLabel(60+half*6,42,'?')))},
    ()=>{const r=ri(2,6);const d=r*2;return fi(`看圖的圓,半徑是 ${r} 公分。直徑是多少公分?`,`This circle has radius ${r} cm. What is the diameter?`,d,nearNums(d,3),
      [`🔑 直徑 = 半徑 × 2(直徑穿過圓心,是半徑的兩倍)。`,`① ${r} × 2 = ${d} 公分。`,`✔ 反過來:半徑 = 直徑 ÷ 2 = ${r} ✓`,`EN: Diameter = radius × 2.`],
      GEO.circle(r,`r=${r}`))},
    ()=>{const t=pick([[5,'五'],[6,'六'],[8,'八']]);const s=ri(3,9);const pts=Array.from({length:t[0]},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/t[0];return `${(60+32*Math.cos(a)).toFixed(1)},${(50+32*Math.sin(a)).toFixed(1)}`}).join(' ');return fi(`看圖:正${t[1]}邊形每邊 ${s} 公分。周長是多少公分?`,`A regular ${t[0]}-gon with side ${s} cm. Find the perimeter.`,t[0]*s,nearNums(t[0]*s,6),
      [`🔑 「正」多邊形=每邊等長:周長 = 邊長 × 邊數。`,`① ${s} × ${t[0]} = ${t[0]*s} 公分。`,`✔ 和正方形同一條規則,只是邊數不同——規則會遷移!`,`EN: Regular polygon perimeter = side × number of sides.`],
      SVG(`<polygon points="${pts}" class="gshape"/>`+gLabel(60,14,s+' cm')))},
    ()=>{const W=ri(8,12),H=ri(6,10),w=ri(3,W-3),h=ri(2,H-3);return fi(`看圖的相框:外框 ${W}×${H},中間挖掉 ${w}×${h} 的洞。框的面積(灰色部分)是多少?`,`A frame: outer ${W}×${H} minus an inner ${w}×${h} hole. Find the frame area.`,W*H-w*h,nearNums(W*H-w*h,10),
      [`🔑 挖洞問題:大面積 − 小面積 = 剩下的。`,`① 外框:${W} × ${H} = ${W*H}。`,`② 洞:${w} × ${h} = ${w*h}。`,`③ 相減:${W*H} − ${w*h} = ${W*H-w*h}。`,`💡 「補」與「挖」是複合圖形的兩把刀:加法拼、減法挖。`,`EN: Frame area = outer area minus the hole.`],
      SVG(`<rect x="14" y="20" width="96" height="64" class="gshape"/><rect x="38" y="38" width="46" height="30" style="fill:var(--paper);stroke:var(--cobalt);stroke-width:2"/>`+gLabel(62,16,`${W}×${H}`)+gLabel(62,55,`${w}×${h}`)))},
  ],
  5:[
    ()=>{const pairs=[[2,4],[3,6],[2,6],[4,8],[3,9],[2,8]];const [d1,d2]=pick(pairs);const n2=ri(1,d2-1);const L=d2;const s=`${L/d1+n2}/${L}`;return fi(`1/${d1} + ${n2}/${d2} = ?`,`1/${d1} plus ${n2}/${d2}?`,s,[`${1+n2}/${d1+d2}`,`${n2}/${L}`,`${L/d1+n2+1}/${L}`],
      [`🔑 切法不同不能直接加 → 先「通分」統一切法。`,`① 1/${d1} 每份切成 ${L/d1} 小份:1/${d1} = ${L/d1}/${L}(大小沒變,只是切更細)。`,`② 現在切法相同了:${L/d1}/${L} + ${n2}/${L} = ${s}。`,`⚠ 陷阱:分母直接相加(${d1}+${d2})是最常見的錯!`,`EN: Convert to a common denominator first, then add the counts.`])},
    ()=>{const a=ri(2,9),b=ri(11,99)/10;const p=Math.round(a*b*10)/10;return fi(`${a} × ${b} = ?`,`${a} times ${b}?`,p,[Math.round((p+a)*10)/10,Math.round((p-a/2)*10)/10,Math.round(p*10+1)/10],
      [`🔑 先忽略小數點當整數乘,最後再把點放回去。`,`① 當整數:${a} × ${b*10} = ${a*b*10}。`,`② ${b} 有一位小數 → 答案點回一位:${p}。`,`✔ 估算:${a} × ${Math.round(b)} = ${a*Math.round(b)},和 ${p} 接近 ✓`,`EN: Multiply as whole numbers, then restore the decimal point.`])},
    ()=>{const l=ri(2,8),w=ri(2,8),h=ri(2,8);return fi(`長 ${l}、寬 ${w}、高 ${h} 公分的長方體,體積是多少立方公分?`,`Volume of a ${l} by ${w} by ${h} box?`,l*w*h,nearNums(l*w*h,20),
      [`🔑 體積 = 一層的方塊數 × 疊幾層。`,`① 底層:${l} × ${w} = ${l*w} 塊。`,`② 疊 ${h} 層:${l*w} × ${h} = ${l*w*h} 立方公分。`,`✔ 換個方向疊(${w}×${h} 為底)答案一樣 ✓`,`EN: One layer of cubes, times the number of layers.`])},
    ()=>{const N=pick([12,18,24,30,36]);const fs=[];for(let i=2;i<N;i++)if(N%i===0)fs.push(i);const ans=pick(fs);const non=[];let x=2;while(non.length<3){if(N%x!==0&&x!==ans)non.push(x);x++}return fi(`哪一個是 ${N} 的因數?`,`Which one is a factor of ${N}?`,ans,non,
      [`🔑 因數 = 能整除、零餘數的數。`,`① 測試:${N} ÷ ${ans} = ${N/ans},整除 ✓`,`② 其他選項除 ${N} 都會留下餘數。`,`💡 小技巧:因數成雙出現——${ans} × ${N/ans} = ${N},找到一個就送一個。`,`EN: A factor divides in exactly; factors always come in pairs.`])},
    ()=>{const t=pick([[4,6,12],[6,8,24],[3,5,15],[4,10,20],[6,9,18]]);return fi(`${t[0]} 和 ${t[1]} 的最小公倍數是?`,`Least common multiple of ${t[0]} and ${t[1]}?`,t[2],[t[0]*t[1],t[2]*2,t[2]+t[0]],
      [`🔑 最小公倍數 = 兩排倍數第一次「相遇」的地方。`,`① ${t[0]} 的倍數:${t[0]}, ${t[0]*2}, ${t[0]*3}, …`,`② ${t[1]} 的倍數:${t[1]}, ${t[1]*2}, …`,`③ 第一個共同出現的:${t[2]}。`,`⚠ 陷阱:不一定是相乘!${t[0]}×${t[1]}=${t[0]*t[1]},比 ${t[2]} 大。`,`EN: List multiples and find the first meeting point — not always the product.`])},
    ()=>{const d=pick([3,4,5,6,8]);const n=ri(1,d-1);const k=d*ri(1,3);return fi(`${n}/${d} × ${k} = ?`,`${n}/${d} times ${k}?`,n*k/d,nearNums(n*k/d,4),
      [`🔑 分數乘整數 = ${k} 個 ${n}/${d} 疊起來。`,`① 分子先乘:${n} × ${k} = ${n*k}。`,`② ${n*k} ÷ ${d} = ${n*k/d}(剛好整除)。`,`✔ 反推:${n*k/d} × ${d} ÷ ${k} = ${n} ✓`,`EN: Multiply the top by ${k}, then divide by the bottom.`])},
    ()=>{const c=ri(2,5);return fi(`🏆 抽屜裡混著 ${c} 種顏色的襪子。閉著眼最少拿幾隻,才「保證」湊出一雙同色?`,`A drawer holds socks in ${c} colors. Fewest picks to GUARANTEE a matching pair?`,c+1,[c,c*2+1,c+3],
      [`🔑 鴿籠原理:「保證」型題目要想「最壞情況」。`,`① 最倒楣的情況:前 ${c} 隻剛好每色各一隻,還湊不成雙。`,`② 第 ${c+1} 隻無論什麼顏色,一定和手上某隻同色!`,`💡 心法:保證 = 最壞情況 + 1。這是正式的組合數學。`,`EN: Pigeonhole: survive the worst case, then one more pick wins.`])},
    ()=>{const b=ri(70,85),a=b+ri(-5,5);const third=3*a-2*b;return fi(`🏆 小奇三次測驗平均 ${a} 分,前兩次平均 ${b} 分。第三次考了幾分?`,`Three tests average ${a}; the first two average ${b}. The third score?`,third,nearNums(third,5),
      [`🔑 平均是總和的偽裝——先把它變回總和。`,`① 三次總分:${a} × 3 = ${3*a}。`,`② 前兩次總分:${b} × 2 = ${2*b}。`,`③ 第三次:${3*a} − ${2*b} = ${third}。`,`✔ 驗算:(${2*b} + ${third}) ÷ 3 = ${a} ✓`,`EN: Turn every average back into a total, then subtract.`])},
    ()=>{const t=pick([[12,18,6],[8,12,4],[15,20,5],[18,24,6],[16,24,8],[9,12,3]]);return fi(`${t[0]} 和 ${t[1]} 的最大公因數是?`,`Greatest common factor of ${t[0]} and ${t[1]}?`,t[2],[t[2]*2,Math.max(1,t[2]-1),t[2]+2],
      [`🔑 最大公因數=兩個數「都能被整除」的最大數。`,`① ${t[0]} 的因數裡找、${t[1]} 的因數裡找,共同的取最大。`,`② ${t[0]}÷${t[2]}=${t[0]/t[2]}、${t[1]}÷${t[2]}=${t[1]/t[2]},都整除 ✓`,`💡 它是約分的鑰匙:${t[0]}/${t[1]} 用 ${t[2]} 約分 = ${t[0]/t[2]}/${t[1]/t[2]}。`,`EN: The largest number dividing both — the key to simplifying fractions.`])},
    ()=>{const c=ri(2,5);const ans=ri(11,49)/10;const a=Math.round(ans*c*10)/10;return fi(`${a} ÷ ${c} = ?`,`${a} divided by ${c}?`,ans,[Math.round((ans+0.5)*10)/10,Math.round((ans-0.3)*10)/10,Math.round(ans*c*10)/10],
      [`🔑 小數除以整數:照整數除,小數點直直落下來。`,`① ${a*10} ÷ ${c} = ${ans*10}(先當整數)。`,`② 小數點放回:${ans}。`,`✔ 驗算:${ans} × ${c} = ${a} ✓`,`EN: Divide as whole numbers; the decimal point drops straight down.`])},
    ()=>{const l=ri(3,7),w=ri(3,7),h=ri(3,7);return fi(`看圖的長方體,長 ${l}、寬 ${w}、高 ${h}。體積是多少立方公分?`,`This box is ${l}×${w}×${h}. Find the volume.`,l*w*h,nearNums(l*w*h,25),
      [`🔑 體積 = 長 × 寬 × 高(先算一層,再疊高)。`,`① 底面:${l} × ${w} = ${l*w}。`,`② 疊 ${h} 層:${l*w} × ${h} = ${l*w*h} 立方公分。`,`✔ 立方=三個長度相乘,單位是「立方公分」。`,`EN: Volume = length × width × height.`],
      SVG(`<polygon points="24,44 64,44 64,80 24,80" class="gshape"/><polygon points="24,44 40,28 80,28 64,44" class="gtop"/><polygon points="64,44 80,28 80,64 64,80" class="gside"/>`+gLabel(40,92,`${l}`)+gLabel(74,74,`${w}`)+gLabel(14,64,`${h}`),'0 0 100 100'))},
    ()=>{const d=ri(4,14);const c=Math.round(314*d)/100;return fi(`看圖的圓,直徑 ${d} 公分。圓周長是多少?(圓周率 3.14)`,`This circle has diameter ${d} cm. Find the circumference. (π=3.14)`,c,[Math.round(314*d/2)/100,Math.round(314*(d+2))/100,Math.round(157*d)/100],
      [`🔑 圓周長 = 圓周率 × 直徑(繞一圈是直徑的 3.14 倍)。`,`① 3.14 × ${d} = ${c} 公分。`,`✔ 粗估:比直徑的 3 倍(${3*d})多一些 ✓`,`EN: Circumference = π × diameter.`],
      GEO.circle(d,`d=${d}`))},
    ()=>{const deg=pick([90,120,180,270]);const frac={90:'1/4',120:'1/3',180:'1/2',270:'3/4'}[deg];return fi(`看圖的扇形是圓的 ${deg}°。它佔整個圓的幾分之幾?(用分數,如 1/4)`,`This sector is ${deg}° of a circle. What fraction of the whole circle is it?`,frac,['1/2','1/3','1/4','3/4'].filter(f=>f!==frac).slice(0,3),
      [`🔑 整個圓是 360°。扇形佔比 = 扇形角度 ÷ 360。`,`① ${deg} ÷ 360 = ${frac}。`,`✔ 驗算:${frac} × 360 = ${deg}° ✓`,`💡 這是「披薩切幾片」的數學。`,`EN: Fraction of circle = sector angle ÷ 360.`],
      GEO.sector(deg,34,`${deg}°`))},
    ()=>{const l=ri(2,5),w=ri(2,5),h=ri(2,5);const faces=2*(l*w+l*h+w*h);return fi(`看圖的長方體,長 ${l}、寬 ${w}、高 ${h}。表面積(六個面加起來)是多少?`,`This box is ${l}×${w}×${h}. Find the total surface area of all 6 faces.`,faces,nearNums(faces,15),
      [`🔑 表面積=六個面,但只要算三種面各一個,再×2。`,`① 三種面:${l}×${w}=${l*w}、${l}×${h}=${l*h}、${w}×${h}=${w*h}。`,`② 相加再×2:(${l*w}+${l*h}+${w*h})×2 = ${faces}。`,`💡 每種面都有「前後/左右/上下」兩個一樣的,所以×2。`,`EN: Surface area = 2×(lw + lh + wh).`],
      SVG(`<polygon points="24,44 64,44 64,80 24,80" class="gshape"/><polygon points="24,44 40,28 80,28 64,44" class="gtop"/><polygon points="64,44 80,28 80,64 64,80" class="gside"/>`+gLabel(40,92,`${l}`)+gLabel(74,74,`${w}`)+gLabel(14,64,`${h}`),'0 0 100 100'))},
    ()=>{const l=ri(2,6),w=ri(2,6),h=ri(2,6);const sa=2*(l*w+l*h+w*h);return fi(`看圖的長方體:長 ${l}、寬 ${w}、高 ${h} 公分。六個面的表面積總共是多少平方公分?`,`Box ${l}×${w}×${h}: find the total surface area of all six faces.`,sa,nearNums(sa,15),
      [`🔑 表面積:三種面各有一對 → 2×(長×寬 + 長×高 + 寬×高)。`,`① 上下:${l}×${w}=${l*w};前後:${l}×${h}=${l*h};左右:${w}×${h}=${w*h}。`,`② 相加:${l*w}+${l*h}+${w*h}=${l*w+l*h+w*h}。`,`③ 成對 ×2:${sa} 平方公分。`,`⚠ 別和體積(${l*w*h})搞混:表面積是「包起來要多少紙」。`,`EN: Surface area = 2(lw + lh + wh) — the wrapping paper, not the space inside.`],
      SVG(`<polygon points="24,44 64,44 64,80 24,80" class="gshape"/><polygon points="24,44 40,28 80,28 64,44" class="gtop"/><polygon points="64,44 80,28 80,64 64,80" class="gside"/>`+gLabel(44,92,l)+gLabel(76,74,w)+gLabel(14,64,h),'0 0 100 100'))},
    ()=>{const b=ri(4,12),h=ri(2,8)*2;const A=b*h/2;return fi(`看圖的三角形:面積 ${A} 平方公分,底 ${b} 公分。高是多少公分?`,`Triangle area ${A} sq cm with base ${b} cm. Find the height.`,h,nearNums(h,4),
      [`🔑 面積 = 底 × 高 ÷ 2 → 高 = 面積 × 2 ÷ 底(逆運算兩步)。`,`① ${A} × 2 = ${A*2}。`,`② ${A*2} ÷ ${b} = ${h} 公分。`,`✔ 驗算:${b} × ${h} ÷ 2 = ${A} ✓`,`EN: Height = area × 2 ÷ base — undo the halving first.`],
      GEO.rtri(`${b} cm`,`?`).replace('</svg>',gLabel(62,40,`面積 ${A}`)+'</svg>'))},
  ],
  6:[
    ()=>{const k=ri(2,6),a=ri(2,9),b=ri(2,9);return fi(`${a}:${b} = ${a*k}:?`,`${a}:${b} equals ${a*k}:what?`,b*k,nearNums(b*k,6),
      [`🔑 比 = 倍率關係,兩邊必須一起縮放。`,`① 左邊:${a} → ${a*k},放大了 ${k} 倍。`,`② 右邊同樣 ×${k}:${b} × ${k} = ${b*k}。`,`✔ 驗算:${a*k}:${b*k} 同除 ${k} 回到 ${a}:${b} ✓`,`EN: A ratio scales both sides by the same factor.`])},
    ()=>{const v=ri(4,20)*5,t=ri(2,6);return fi(`一台車每小時走 ${v} 公里,${t} 小時走多遠?`,`A car travels ${v} km per hour for ${t} hours. How far?`,v*t,nearNums(v*t,25),
      [`🔑 速率 = 「每 1 小時」的距離,是一種單位化思考。`,`① 每小時 ${v} 公里 × ${t} 小時 = ${v*t} 公里。`,`✔ 反推:${v*t} ÷ ${t} = ${v} 公里/小時,回到速率 ✓`,`EN: Speed is distance per one hour; multiply by the hours.`])},
    ()=>{const d=pick([2,4,5,10]);const n=ri(1,d-1);const dec=n/d;return fi(`${n}/${d} 等於哪個小數?`,`${n}/${d} as a decimal?`,dec,[Math.round((dec+0.1)*100)/100,Math.round(dec/2*100)/100,Math.round((dec+0.25)*100)/100],
      [`🔑 分數線其實就是「÷」:${n}/${d} = ${n} ÷ ${d}。`,`① ${n} ÷ ${d} = ${dec}。`,`💡 常用轉換值得記住:1/2=0.5、1/4=0.25、1/5=0.2、1/10=0.1——它們是同一個數的兩套衣服。`,`EN: The fraction bar is a division sign in disguise.`])},
    ()=>{const p=pick([10,20,25,50]);const b=pick([40,60,80,120,200]);return fi(`${b} 的 ${p}% 是多少?`,`What is ${p}% of ${b}?`,p*b/100,nearNums(p*b/100,8),
      [`🔑 % = 「每 100 份中的份數」:${p}% = ${p}/100。`,`① ${b} × ${p}/100 = ${p*b/100}。`,`💡 心算捷徑:先算 10% = ${b/10},再組合(${p}% = ${p/10} 個 10%)。`,`✔ 檢查:${p*b/100} ÷ ${b} = ${p/100},回到 ${p}% ✓`,`EN: Percent means per hundred; anchor on 10 percent and scale.`])},
    ()=>{const d=ri(2,10);const c=Math.round(314*d)/100;return fi(`直徑 ${d} 公分的圓,圓周長是多少公分?(圓周率用 3.14)`,`Circumference of a circle with diameter ${d} cm? (use 3.14)`,c,[Math.round((3.14*(d+1))*100)/100,Math.round((3.14*d/2)*100)/100,Math.round((3.14*d+3)*100)/100],
      [`🔑 圓周率的意義:繞一圈是直徑的幾倍?答案永遠約 3.14,任何圓都一樣!`,`① 圓周長 = 3.14 × ${d} = ${c} 公分。`,`✔ 粗估:直徑的 3 倍多一點 → 比 ${3*d} 大一些 ✓`,`💡 這個「任何圓都一樣」的常數,人類研究了四千年。`,`EN: Pi says every circle is about 3.14 diameters around.`])},
    ()=>{const a=ri(2,9),x=ri(2,9),b=ri(1,15);const c=a*x+b;return fi(`如果 ${a} × x + ${b} = ${c},那 x = ?`,`If ${a}x + ${b} = ${c}, what is x?`,x,nearNums(x,3),
      [`🔑 解方程 = 逆向拆包裹:最後包上去的,最先拆掉。`,`① x 先被 ×${a}、再被 +${b} → 拆的順序相反。`,`② 兩邊同減 ${b}:${a}x = ${c} − ${b} = ${a*x}。`,`③ 兩邊同除 ${a}:x = ${a*x} ÷ ${a} = ${x}。`,`✔ 代回檢查:${a}×${x}+${b} = ${c} ✓`,`EN: Undo the operations in reverse order: subtract, then divide.`])},
    ()=>{const t=pick([[6,3,2],[4,4,2],[6,6,3],[10,10,5],[12,6,4],[12,4,3],[15,10,6],[8,8,4],[20,5,4]]);return fi(`🏆 一件工作,A 單獨做要 ${t[0]} 天、B 單獨做要 ${t[1]} 天。兩人合作要幾天?`,`A job takes A ${t[0]} days alone, B ${t[1]} days alone. Together?`,t[2],nearNums(t[2],3),
      [`🔑 工程問題心法:把整件工作當成「1」,比較每天的速度。`,`① A 每天做 1/${t[0]}、B 每天做 1/${t[1]}。`,`② 合作每天:1/${t[0]} + 1/${t[1]} = 1/${t[2]}。`,`③ 做完「1」需要 ${t[2]} 天。`,`✔ 驗算:${t[2]}/${t[0]} + ${t[2]}/${t[1]} = 1(整件工作)✓`,`EN: Call the job one whole, add the daily rates, invert.`])},
    ()=>{const s1=ri(1,3),s2=ri(1,4);const t=[s1,s2];for(let i=2;i<6;i++)t.push(t[i-1]+t[i-2]);return fi(`🏆 數列偵探終極版:${t.slice(0,5).join(', ')}, ?。下一個是?`,`Ultimate sequence detective: ${t.slice(0,5).join(', ')}, ?. Next?`,t[5],nearNums(t[5],4),
      [`🔑 差不固定、倍率也不固定?第三招:每項 = 前兩項相加!`,`① 驗證:${t[0]}+${t[1]}=${t[2]} ✓、${t[1]}+${t[2]}=${t[3]} ✓、${t[2]}+${t[3]}=${t[4]} ✓`,`② 下一項:${t[3]} + ${t[4]} = ${t[5]}。`,`💡 這是費波那契數列——向日葵種子的螺旋、鳳梨表皮、鸚鵡螺殼裡都藏著它。`,`EN: Each term is the sum of the previous two — the Fibonacci rule.`])},
    ()=>{const r=ri(2,6);const area=Math.round(314*r*r)/100;return fi(`半徑 ${r} 公分的圓,面積是多少平方公分?(圓周率用 3.14)`,`Area of a circle with radius ${r} cm? (use 3.14)`,area,[Math.round(314*2*r)/100,Math.round(314*(r+1)*(r+1))/100,Math.round(314*r)/100],
      [`🔑 圓面積 = 圓周率 × 半徑 × 半徑(半徑要乘「兩次」!)。`,`① ${r} × ${r} = ${r*r}。`,`② 3.14 × ${r*r} = ${area}。`,`⚠ 陷阱:3.14 × ${r} × 2 = ${Math.round(314*2*r)/100} 是「圓周長」,不是面積!`,`EN: Area is pi times radius squared — square the radius first.`])},
    ()=>{const v=ri(4,12)*10,t=ri(2,6);return fi(`一台車每小時走 ${v} 公里,走 ${v*t} 公里要幾小時?`,`At ${v} km per hour, how many hours to cover ${v*t} km?`,t,nearNums(t,2),
      [`🔑 速率三兄弟:距離 = 速率 × 時間 → 時間 = 距離 ÷ 速率。`,`① ${v*t} ÷ ${v} = ${t} 小時。`,`✔ 驗算:${v} × ${t} = ${v*t} 公里 ✓`,`💡 同一條公式轉三個方向,記一個就有三個。`,`EN: Time equals distance divided by speed — one formula, three faces.`])},
    ()=>{const r=ri(2,7);const area=Math.round(314*r*r)/100;return fi(`看圖的圓,半徑 ${r} 公分。面積是多少平方公分?(圓周率 3.14)`,`This circle has radius ${r} cm. Find the area. (π=3.14)`,area,[Math.round(314*2*r)/100,Math.round(314*(r+1)*(r+1))/100,Math.round(628*r)/100],
      [`🔑 圓面積 = 圓周率 × 半徑 × 半徑(半徑乘兩次!)。`,`① ${r} × ${r} = ${r*r}。`,`② 3.14 × ${r*r} = ${area}。`,`⚠ 陷阱:3.14×${r}×2=${Math.round(628*r)/100} 是周長,不是面積。`,`EN: Circle area = π × radius².`],
      GEO.circle(r,`r=${r}`))},
    ()=>{const base=ri(4,12),h=ri(3,10);const area=base*h;return fi(`看圖的平行四邊形,底 ${base}、高 ${h} 公分。面積是多少?`,`This parallelogram has base ${base} and height ${h} cm. Find the area.`,area,nearNums(area,12),
      [`🔑 平行四邊形面積 = 底 × 高(把斜邊切下來補過去,就變成長方形!)。`,`① ${base} × ${h} = ${area} 平方公分。`,`⚠ 用「高」不是斜邊長:高是垂直距離。`,`EN: Parallelogram area = base × perpendicular height.`],
      SVG(`<polygon points="30,78 100,78 84,26 14,26" class="gshape"/><line x1="30" y1="78" x2="30" y2="26" class="gdash"/><rect x="30" y="68" width="10" height="10" class="gright"/>`+gLabel(52,92,`${base}`)+gLabel(20,54,`${h}`)))},
    ()=>{const x=ri(2,7),y=ri(2,7);return fi(`看圖的座標平面上有一個點,從原點往右 ${x} 格、往上 ${y} 格。它的座標寫成 (${x}, ?),? 是多少?`,`A point sits ${x} right and ${y} up from the origin. Its coordinates are (${x}, ?). Find ?.`,y,nearNums(y,3),
      [`🔑 座標 (x, y):x 是往右幾格、y 是往上幾格。`,`① 往上 ${y} 格 → y = ${y}。`,`② 完整座標:(${x}, ${y})。`,`💡 座標是「地圖上的地址」,兩個數字精準定位一個點。`,`EN: In (x, y), y is how far up from the origin.`],
      GEO.coord(x,y))},
    ()=>{const base=ri(4,10),h=ri(3,8);const tri=base*h/2;return fi(`看圖:一個底 ${base}、高 ${h} 的三角形,和一個長 ${base}、寬 ${h} 的長方形。三角形面積是長方形的幾分之幾?(用分數)`,`A triangle (base ${base}, height ${h}) sits beside a rectangle (${base}×${h}). The triangle's area is what fraction of the rectangle?`,'1/2',['1/3','1/4','2/3'],
      [`🔑 同底同高時,三角形面積永遠是長方形的一半。`,`① 長方形:${base}×${h} = ${base*h}。`,`② 三角形:${base}×${h}÷2 = ${tri},剛好一半。`,`✔ 這就是三角形面積公式「÷2」的來源。`,`EN: Same base and height: triangle is always half the rectangle.`],
      SVG(`<rect x="12" y="30" width="44" height="46" class="gshape"/><polygon points="64,76 108,76 64,30" class="gshape"/>`+gLabel(34,90,`${base}`)+gLabel(86,90,`${base}`)))},
    ()=>{const r=ri(2,5),R=r+ri(2,4);const A=Math.round(314*(R*R-r*r))/100;return fi(`看圖的圓環(甜甜圈):外圓半徑 ${R}、內圓半徑 ${r} 公分。圓環面積是多少?(圓周率 3.14)`,`An annulus with outer radius ${R} and inner radius ${r}. Find its area. (π=3.14)`,A,[Math.round(314*(R-r)*(R-r))/100,Math.round(314*R*R)/100,Math.round(314*(R*R+r*r))/100],
      [`🔑 圓環 = 大圓 − 小圓(挖洞法用在圓上)。`,`① 大圓:3.14 × ${R}² = ${Math.round(314*R*R)/100}。`,`② 小圓:3.14 × ${r}² = ${Math.round(314*r*r)/100}。`,`③ 相減:${A} 平方公分。`,`⚠ 陷阱:不能先算 (${R}−${r})² ——「差的平方」不等於「平方的差」!`,`EN: Annulus = big circle minus small circle; never square the difference.`],
      SVG(`<circle cx="60" cy="50" r="38" class="gshape"/><circle cx="60" cy="50" r="${Math.round(38*r/R)}" style="fill:var(--paper);stroke:var(--cobalt);stroke-width:2"/>`+gLabel(60,10,`R=${R}`)+gLabel(60,54,`r=${r}`)))},
    ()=>{const r=ri(2,5),h=ri(4,9);const w=2*r;const A=Math.round((w*h+314*r*r/2)*100)/100;return fi(`看圖的「門形」:下面是 ${w}×${h} 的長方形,上面加一個半徑 ${r} 的半圓。總面積是多少?(圓周率 3.14)`,`A door shape: a ${w}×${h} rectangle topped by a semicircle of radius ${r}. Total area? (π=3.14)`,A,[Math.round((w*h+314*r*r)*100)/100,Math.round((w*h)*100)/100,Math.round((w*h+157*r)*100)/100],
      [`🔑 組合圖形:長方形 + 半圓,分開算再相加。`,`① 長方形:${w} × ${h} = ${w*h}。`,`② 半圓:3.14 × ${r}² ÷ 2 = ${Math.round(314*r*r/2)/100}。`,`③ 相加:${A} 平方公分。`,`✔ 檢查:半圓直徑 ${2*r} 剛好等於長方形的寬 ${w},拼得起來 ✓`,`EN: Split into rectangle plus half circle, then add.`],
      SVG(`<rect x="32" y="42" width="56" height="44" class="gshape"/><path d="M32,42 A28,28 0 0,1 88,42" class="gshape"/>`+gLabel(60,96,`${w}`)+gLabel(98,66,`${h}`)+gLabel(60,30,`r=${r}`)))},
  ],
};
function genMath(level,n){
  const gens=MATH_GEN[level]||[];
  return Array.from({length:n},()=>{
    const i=Math.floor(Math.random()*gens.length);
    const q=gens[i]();
    q.fp=`m:${level}:${i}`;
    q.topic=(MATH_TOPICS[level]||[])[i]||'';
    return q;
  });
}

/* ── 漢字出題:四種題型,題目與選項皆漢英對照 ── */
function genHanzi(level,n){
  const groups=HANZI[level]||[];
  const pool=groups.flatMap(g=>g.chars.map(ch=>({...ch,f:g.f,fe:g.fe,rule:g.rule,re:g.re})));
  if(pool.length===0)return [];
  const qs=[];
  const chars=shuffle(pool);
  for(let i=0;i<n;i++){
    const h=chars[i%chars.length];
    const fam=groups.find(g=>g.f===h.f);
    let type=i%4;
    if(type===0&&(fam.chars.length<3||ALL_CHARS.filter(x=>x.f!==h.f).length===0))type=2;
    if(type===0){
      /* 臥底偵探:同族 3 字 + 外族 1 字,抓出不屬於這一族的 */
      const insiders=shuffle(fam.chars).slice(0,3);
      const out=pick(ALL_CHARS.filter(x=>x.f!==h.f));
      const opts=shuffle([
        ...insiders.map(x=>({t:x.c,sub:x.en,now:true})),
        {t:out.c,sub:out.en,now:true},
      ]);
      qs.push({fp:`hf:${fam.f}`,q:`「${fam.f}」家族裡混進了一個臥底,把它抓出來!`,
        en:`An undercover agent sneaked into the "${fam.fe}" family. Catch it!`,
        options:opts,ansV:out.c,big:true,
        why:`${out.c}(${out.en})來自「${out.f}」家族。本族規則:${fam.rule} / ${out.c} belongs to the "${out.fe}" family. This family rule: ${fam.re}`});
    }else if(type===1){
      /* 讀音 */
      const zyPool=shuffle([...new Set(pool.map(o=>o.zy))].filter(z=>z!==h.zy)).slice(0,3);
      qs.push({fp:`h:${h.c}`,q:`「${h.c}」怎麼唸?`,en:`How do you pronounce 「${h.c}」?`,
        options:shuffle([h.zy,...zyPool]),ansV:h.zy,
        why:`${h.c}(${h.zy})= ${h.en}。詞語 Word:${h.w} = ${h.we}`});
    }else if(type===2){
      /* 意思 → 字(英文線索在作答後揭曉,避免直接洩題)*/
      const others=shuffle(pool.filter(x=>x.c!==h.c&&x.en!==h.en)).slice(0,3);
      const opts=shuffle([h,...others]).map(x=>({t:x.c,sub:x.en,late:true}));
      qs.push({fp:`h:${h.c}`,q:`哪個字的意思是「${h.en}」?`,en:`Which character means "${h.en}"?`,
        options:opts,ansV:h.c,big:true,
        why:`${h.c} = ${h.en}。詞語 Word:${h.w} = ${h.we}`});
    }else{
      /* 字 → 意思(選項為英文)*/
      const others=shuffle([...new Set(pool.map(x=>x.en))].filter(e=>e!==h.en)).slice(0,3);
      qs.push({fp:`h:${h.c}`,q:`「${h.c}」是什麼意思?`,en:`What does 「${h.c}」 mean?`,
        options:shuffle([h.en,...others]),ansV:h.en,
        why:`${h.c}(${h.zy})= ${h.en}。詞語 Word:${h.w} = ${h.we}`});
    }
  }
  return qs.map(q=>({...q,ans:q.options.findIndex(o=>(typeof o==='object'?o.t:o)===q.ansV)}));
}

/* ── 自然出題:抽取該等級所有概念的題庫 ── */
function genSci(level,n){
  const units=SCI[level]||[];
  const bank=units.flatMap((u,ui)=>u.qs.map((q,qi)=>({...q,fp:`s:${level}:${ui}:${qi}`})));
  return shuffle(bank).slice(0,Math.min(n,bank.length));
}

/* ═══════════════════════════════════════════════════════════
   進度儲存(localStorage)
   ═══════════════════════════════════════════════════════════ */
const KEY='logic-lab-v1';
const DEFAULT={
  xp:0, totalXp:0, seals:[], streak:0, lastDay:'',
  pets:[], activePet:null, petData:{}, best:{match:null,storm:0,defense:0},
  farm:{coins:0,seeds:0,plots:[],harvested:0},
  subjects:{hanzi:{level:1},math:{level:1},science:{level:3}},
  engHints:true, lastBackup:'',
  ledger:{v:1,items:{},days:{},recent:{}},
};
function load(){try{return {...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...DEFAULT}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
const today=()=>new Date().toISOString().slice(0,10);

/* ── mastery ledger(MASTER_HANDOFF §7.1):每題一筆,三路聚合 ──
   items[指紋]={s:科目,ok:答對次數,no:答錯次數,lw:最後答錯日,lc:最後答對日}
   days[日期]={hanzi:[答題,答對],math:[…],science:[…]}   → 成長年輪
   recent[科目]=最近 10 題 0/1                             → 自適應難度
   聚合而非流水帳:大小有上界(指紋數×50B + 每日一筆),十年也撐得住 */
function recordLedger(s,subject,results){
  if(!s.ledger||typeof s.ledger!=='object')s.ledger={v:1,items:{},days:{},recent:{}};
  const L=s.ledger;
  L.items=L.items||{};L.days=L.days||{};L.recent=L.recent||{};
  const t=today();
  const d=L.days[t]||(L.days[t]={});
  const cell=d[subject]||(d[subject]=[0,0]);
  const r=L.recent[subject]||(L.recent[subject]=[]);
  for(const x of (results||[])){
    if(!x||!x.fp)continue;
    const it=L.items[x.fp]||(L.items[x.fp]={s:subject,ok:0,no:0,lw:'',lc:''});
    if(x.ok){it.ok+=1;it.lc=t}else{it.no+=1;it.lw=t}
    cell[0]+=1;cell[1]+=x.ok?1:0;
    r.push(x.ok?1:0);if(r.length>10)r.shift();
  }
}
/* 帳本查詢:總覽統計(印章牆用;星圖/復仇戰/自適應之後都吃同一條脊椎) */
function ledgerStats(state){
  const L=state.ledger||{};
  let q=0,ok=0,rivals=0;const lit=new Set();
  for(const fp in (L.items||{})){
    const it=L.items[fp];
    q+=it.ok+it.no;ok+=it.ok;
    if(fp.startsWith('h:')&&it.ok>0)lit.add(fp.slice(2));
    if(it.lw&&(!it.lc||it.lw>it.lc))rivals+=1;
  }
  const days=[];
  for(let i=6;i>=0;i--){
    const ds=new Date(Date.now()-i*864e5).toISOString().slice(0,10);
    const rec=(L.days||{})[ds]||{};
    let a=0,c=0;
    for(const k in rec){a+=rec[k][0]||0;c+=rec[k][1]||0}
    days.push({d:ds,a,c});
  }
  return {q,ok,lit:lit.size,rivals,days};
}

const SUBJECTS={
  hanzi:{name:'漢字解碼',glyph:'字',color:'var(--cinnabar)',bg:'var(--cinnabar-bg)',
    desc:'把每個字當成「零件組合的謎題」:學會拆解邏輯,一個規則能解開一整個字族。'},
  math:{name:'數學引擎',glyph:'數',color:'var(--cobalt)',bg:'var(--cobalt-bg)',
    desc:'題目由程式即時生成,永遠不重複。每題都附「為什麼」,拆給你看背後的規則。'},
  science:{name:'自然偵探',glyph:'理',color:'var(--moss)',bg:'var(--moss-bg)',
    desc:'不背標準答案,而是像偵探一樣:從證據推理出世界運作的規則。'},
};

/* ═══════════════════════════════════════════════════════════
   介面層
   ═══════════════════════════════════════════════════════════ */
const ALL_CHARS=Object.values(HANZI).flat().flatMap(g=>g.chars.map(ch=>({...ch,f:g.f,fe:g.fe,rule:g.rule,re:g.re})));
const BUILD_INFO=(typeof CONTENT_VERSION!=='undefined'?CONTENT_VERSION:'⚠ 舊版 data.js(請更新後強制重新整理)')
  +` | 各級字數 ${[1,2,3,4,5,6].map(n=>'L'+n+':'+(HANZI[n]||[]).reduce((s,g)=>s+g.chars.length,0)).join(' ')}`;
console.log('[Logic Lab]',BUILD_INFO);

function App(){
  const [state,setState]=useState(load);
  const [view,setView]=useState({page:'home'}); // home | subject | sprint | progress
  useEffect(()=>save(state),[state]);

  const up=fn=>setState(s=>{const n=structuredClone(s);fn(n);return n});

  /* 完成一次衝刺:XP、連續天數、滿分蓋章 */
  const finishSprint=(subject,score,total,results)=>{
    up(s=>{
      recordLedger(s,subject,results);
      s.xp+=score*10;
      s.totalXp=(s.totalXp||0)+score*10;
      const t=today();
      if(s.lastDay!==t){
        const y=new Date(Date.now()-864e5).toISOString().slice(0,10);
        s.streak=(s.lastDay===y)?s.streak+1:1;
        s.lastDay=t;
      }
      if(score===total){
        s.seals.push({ch:pick(SEAL_CHARS),subject,date:t});
      }
      /* 夥伴神獸獲得友情 */
      if(s.activePet){
        s.petData=s.petData||{};
        const pd=s.petData[s.activePet]||(s.petData[s.activePet]={lv:1,bond:0,sprints:0});
        pd.bond+=score*2;pd.sprints+=1;
        while(pd.lv<5&&pd.bond>=pd.lv*25){pd.bond-=pd.lv*25;pd.lv+=1;}
      }
    });
  };

  /* 遊樂園動作:花費、解鎖、換夥伴、刷紀錄 */
  const actions={
    spend:c=>{if(state.xp<c)return false;up(s=>{s.xp-=c});return true},
    unlockPet:p=>{if(state.xp<p.cost||state.pets.includes(p.id))return;
      up(s=>{s.xp-=p.cost;s.pets.push(p.id);s.activePet=p.id})},
    setPet:id=>up(s=>{s.activePet=id}),
    bestMatch:m=>up(s=>{if(!s.best.match||m<s.best.match)s.best.match=m}),
    bestStorm:v=>up(s=>{if(v>(s.best.storm||0))s.best.storm=v}),
    bestDefense:v=>up(s=>{if(v>(s.best.defense||0))s.best.defense=v}),
    farmUpdate:fn=>up(s=>{fn(s.farm)}),
  };
  const activePet=PETS.find(p=>p.id===state.activePet)||null;

  /* 今日之字:用日期挑選,每天固定一個 */
  const dayChar=ALL_CHARS[new Date().getDate()%ALL_CHARS.length];

  /* 備份提醒:有一定進度,且從未備份或距上次備份超過 14 天 */
  const needBackup=(state.totalXp||0)>=100&&
    (!state.lastBackup||Date.now()-new Date(state.lastBackup).getTime()>14*864e5);

  return (
    <div className="wrap">
      <header>
        <div className="logo" onClick={()=>setView({page:'home'})}>
          <div className="logo-seal kai">邏</div>
          <div>
            <h1>Logic Lab</h1>
            <small>邏輯任務基地</small>
          </div>
        </div>
        <div className="hud">
          <div className="chip">🔥 連續 <b className="num">{state.streak}</b> 天</div>
          <div className="chip">⚡ <b className="num">{state.xp}</b> XP</div>
          <div className="chip" style={{cursor:'pointer'}} onClick={()=>setView({page:'play'})}>
            {activePet?activePet.emoji:'🎮'} 遊樂園
          </div>
          <div className="chip" style={{cursor:'pointer'}} onClick={()=>setView({page:'progress'})}>
            <span style={{color:'var(--cinnabar)'}}>印</span> <b className="num">{state.seals.length}</b>
          </div>
          <button className={`chip toggle ${state.engHints?'on':''}`}
            onClick={()=>up(s=>{s.engHints=!s.engHints})}>
            EN {state.engHints?'ON':'OFF'}
          </button>
        </div>
      </header>

      {view.page==='home'&&
        <Home state={state} dayChar={dayChar} activePet={activePet}
          openSubject={k=>setView({page:'subject',key:k})}
          openPlay={()=>setView({page:'play'})}/>}

      {view.page==='subject'&&
        <SubjectPage k={view.key} state={state}
          setLevel={(k,lv)=>up(s=>{s.subjects[k].level=lv})}
          startSprint={qs=>setView({page:'sprint',key:view.key,qs})}
          goHome={()=>setView({page:'home'})}/>}

      {view.page==='sprint'&&
        <Sprint k={view.key} qs={view.qs} eng={state.engHints} pet={activePet}
          onDone={(score,results)=>finishSprint(view.key,score,view.qs.length,results)}
          exit={()=>setView({page:'subject',key:view.key})}/>}

      {view.page==='play'&&
        <PlayPage state={state} actions={actions} goHome={()=>setView({page:'home'})}/>}

      {view.page==='progress'&&
        <ProgressPage state={state} goHome={()=>setView({page:'home'})}
          importSave={s=>setState({...DEFAULT,...s})}
          markBackup={()=>up(s=>{s.lastBackup=new Date().toISOString()})}/>}

      {needBackup&&view.page!=='progress'&&
        <div className="backup-hint" onClick={()=>setView({page:'progress'})}>
          💾 {state.lastBackup?'距離上次備份超過兩週':'你的進度還沒備份過'}──點我打開「資料保險箱」保存進度 / Tap to back up your progress
        </div>}

      <footer className="foot">{BUILD_INFO}</footer>
    </div>
  );
}

/* ── 首頁 ── */
function Home({state,dayChar,activePet,openSubject,openPlay}){
  return (
    <div>
      <div className="hero">
        <div className="hero-char kai">{dayChar.c}</div>
        <div>
          <div className="hero-eyebrow">今日之字 · CHARACTER OF THE DAY</div>
          <div className="hero-logic">
            <span className="kai">{dayChar.c}</span>({dayChar.zy})= {dayChar.en} ── 「{dayChar.f} {dayChar.fe}」家族
          </div>
          <div className="hero-en">{dayChar.rule}</div>
          <div className="hero-en">{dayChar.re} · {dayChar.w} = {dayChar.we}</div>
        </div>
      </div>

      <div className="grid">
        {Object.entries(SUBJECTS).map(([k,s])=>(
          <div key={k} className="subj"
            style={{'--sc':s.color,'--sc-bg':s.bg}}
            onClick={()=>openSubject(k)}>
            <div className="glyph kai">{s.glyph}</div>
            <h2>{s.name}</h2>
            <p className="desc">{s.desc}</p>
            <span className="lvl">挑戰等級 L{state.subjects[k].level}</span>
          </div>
        ))}
      </div>
      <div className="playbar" onClick={openPlay}>
        <span className="pbe">{activePet?activePet.emoji:'🥚'}</span>
        <div>
          <b>神獸遊樂園 Beast Arcade</b>
          <small>用 XP 解鎖神獸夥伴、挑戰小遊戲 / Spend XP to unlock beast companions and play mini games →</small>
        </div>
      </div>
      <p className="note" style={{marginTop:18}}>
        三個科目的等級各自獨立──擅長的科目直接往上跳級,不必等其他科目。 / Each subject levels up independently — race ahead where you are strong.
      </p>
    </div>
  );
}

/* ── 科目頁 ── */
function SubjectPage({k,state,setLevel,startSprint,goHome}){
  const s=SUBJECTS[k];
  const lv=state.subjects[k].level;
  const gen={hanzi:genHanzi,math:genMath,science:genSci}[k];
  const hasContent=k==='math'||(k==='hanzi'?(HANZI[lv]||[]).length>0:(SCI[lv]||[]).length>0);

  return (
    <div style={{'--ac':s.color,'--ac-bg':s.bg}}>
      <button className="back" onClick={goHome}>← 回基地</button>
      <div className="page-head">
        <h2>{s.name}</h2>
        <span style={{color:'var(--ink-soft)',fontSize:14}}>{k==='math'?'題目即時生成':'內容可持續擴充'}</span>
      </div>

      <div className="lvl-row">
        {[1,2,3,4,5,6].map(n=>{
          const cnt=k==='hanzi'?(HANZI[n]||[]).reduce((s,g)=>s+g.chars.length,0)
                   :k==='science'?(SCI[n]||[]).length
                   :null;
          const empty=cnt===0;
          return (
            <button key={n} className={`lvl-pill ${lv===n?'on':''} ${empty?'off':''}`}
              onClick={()=>setLevel(k,n)}>
              L{n}{cnt!==null&&<span className="cnt">{empty?'備置中':cnt+(k==='hanzi'?' 字':' 單元')}</span>}
            </button>
          );
        })}
      </div>

      <div className="mode-row">
        <button className="btn solid" disabled={!hasContent}
          onClick={()=>{const qs=gen(lv,5);if(qs.length)startSprint(qs)}}>
          ⚡ 開始衝刺(5 題)
        </button>
      </div>

      {k==='hanzi'&&<HanziLearn groups={HANZI[lv]||[]}/>}
      {k==='science'&&<SciLearn units={SCI[lv]||[]}/>}
      {k==='math'&&(
        <div>
          <p className="note">本級 {(MATH_TOPICS[lv]||[]).length} 種題型,題目由引擎即時生成、永不重複;每題答完必附雙語「為什麼」。 / {(MATH_TOPICS[lv]||[]).length} question types at this level, freshly generated every time — and every answer comes with a bilingual why.</p>
          <div className="topicgrid">
            {(MATH_TOPICS[lv]||[]).map(t=>(<div key={t} className="topicchip">{t}</div>))}
          </div>
        </div>
      )}
      {!hasContent&&k==='science'&&(
        <p className="empty">這一級的內容還沒放進資料庫。打開檔案裡的 HANZI / SCI 資料區,照同樣格式加入即可。</p>
      )}
    </div>
  );
}

function HanziLearn({groups}){
  if(!groups.length)return (
    <p className="empty">這一級的千字文字族還在製作中,會分批加入(資料格式已備好)。 / This level arrives in the next content batch.</p>
  );
  const total=groups.reduce((s,g)=>s+g.chars.length,0);
  return (
    <div>
      <p className="note">本級共 {groups.length} 個字族、{total} 個字。先讀懂每一族的「破解規則」,再開衝刺──一條規則能解開一整族。 / {groups.length} families, {total} characters. Crack the family rule first; one rule unlocks the whole family.</p>
      {groups.map(g=>(
        <div key={g.f} className="fam">
          <h3>{g.f} <span className="fam-en">{g.fe}</span><span className="fam-count num">{g.chars.length} 字</span></h3>
          <p className="fam-rule">🔑 {g.rule}<br/><span className="fam-rule-en">{g.re}</span></p>
          <div className="chipgrid">
            {g.chars.map(ch=>(
              <div key={ch.c} className="cchip">
                <div className="cc kai">{ch.c}</div>
                <div className="cz">{ch.zy}</div>
                <div className="ce">{ch.en}</div>
                <div className="cw">{ch.w} · {ch.we}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SciLearn({units}){
  return (
    <div className="cards">
      {units.map(u=>(
        <div key={u.title} className="lcard">
          <h3>{u.title}</h3>
          <p className="concept">{u.concept}</p>
          <div className="meta" style={{marginTop:10,fontStyle:'italic'}}>{u.en}</div>
        </div>
      ))}
    </div>
  );
}

/* ── 衝刺(通用測驗器)── */
function Sprint({k,qs,eng,pet,onDone,exit}){
  const s=SUBJECTS[k];
  const [idx,setIdx]=useState(0);
  const [picked,setPicked]=useState(null);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [val,setVal]=useState('');
  const [inputOk,setInputOk]=useState(null); // null=未作答 true/false=結果
  const resultsRef=useRef([]); // mastery ledger:每題 {fp,ok}
  const q=qs[idx];

  /* 數值等價比對:接受分數與等值小數(3/4 = 0.75) */
  const numVal=t=>{
    t=String(t).trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248))
      .replace(/／/g,'/').replace(/,/g,'.').replace(/\s/g,'');
    if(/^\d+\/\d+$/.test(t)){const [a,b]=t.split('/').map(Number);return b?a/b:NaN;}
    return parseFloat(t);
  };
  const submit=()=>{
    if(inputOk!==null||val.trim()==='')return;
    const ok=Math.abs(numVal(val)-numVal(q.answer))<1e-6;
    resultsRef.current.push({fp:q.fp,ok:ok?1:0});
    setInputOk(ok);setPicked(-1); /* picked!==null 觸發詳解顯示 */
    if(ok)setScore(v=>v+1);
  };
  const choose=i=>{
    if(picked!==null)return;
    resultsRef.current.push({fp:q.fp,ok:i===q.ans?1:0});
    setPicked(i);
    if(i===q.ans)setScore(v=>v+1);
  };
  const next=()=>{
    if(idx+1<qs.length){setIdx(idx+1);setPicked(null);setVal('');setInputOk(null)}
    else{
      const final=score; // score 已含本題
      setDone(true);
      onDone(final,resultsRef.current);
    }
  };

  if(done)return <ResultView k={k} score={score} total={qs.length} pet={pet} exit={exit}/>;

  return (
    <div className="sprint" style={{'--ac':s.color}}>
      <button className="back" onClick={exit}>← 放棄這回合</button>
      <div className="prog">
        {qs.map((_,i)=><i key={i} className={i<idx||(i===idx&&picked!==null)?'done':''}></i>)}
      </div>
      <div className="qcard">
        {q.fig&&<div className="geobox" dangerouslySetInnerHTML={{__html:q.fig}}/>}
        <div className="qtext" dangerouslySetInnerHTML={{__html:
          q.q.replace(/「(.)」/g,'「<span class="kai">$1</span>」')}}/>
        {eng&&q.en&&<div className="qen">{q.en}</div>}
        {q.mode==='input'?(
          <div className="fillin">
            <div className="fillrow">
              <input className="fillbox" inputMode={q.answer.includes('/')?'text':'decimal'}
                placeholder={q.answer.includes('/')?'例:3/4(也可輸入小數)':'輸入答案'}
                value={val} disabled={inputOk!==null}
                onChange={e=>setVal(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')submit()}}/>
              <button className="btn solid" disabled={inputOk!==null||!val.trim()} onClick={submit}>確認 Go</button>
            </div>
            {inputOk!==null&&(
              <div className={`fillresult ${inputOk?'ok':'bad'}`}>
                {inputOk?'✔ 答對了!':<span>✗ 正確答案:<b className="num">{q.answer}</b></span>}
              </div>
            )}
          </div>
        ):(
        <div className="opts">
          {q.options.map((o,i)=>{
            const isObj=typeof o==='object';
            const label=isObj?o.t:o;
            const sub=isObj&&o.sub&&(o.now||picked!==null)?o.sub:null;
            return (
              <button key={i} disabled={picked!==null}
                className={`opt ${picked===null?'':i===q.ans?'ok':i===picked?'bad':''}`}
                onClick={()=>choose(i)}>
                <span className={q.big?'kai':''} style={q.big?{fontSize:30}:null}>{label}</span>
                {sub&&<span className="osub">{sub}</span>}
              </button>
            );
          })}
        </div>
        )}
        {picked!==null&&(
          <div className="why">
            {Array.isArray(q.why)
              ? q.why.map((line,i)=>(
                  <p key={i} className={`why-line ${i===0?'why-rule':''} ${line.startsWith('EN:')?'why-en':''}`}>{line}</p>
                ))
              : <span><b>為什麼:</b>{q.why}</span>}
          </div>
        )}
        {picked!==null&&(
          <button className="btn solid next" onClick={next}>
            {idx+1<qs.length?'下一題 →':'看結果'}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultView({k,score,total,pet,exit}){
  const s=SUBJECTS[k];
  const perfect=score===total;
  const [sealCh]=useState(()=>pick(SEAL_CHARS));
  return (
    <div className="sprint" style={{'--ac':s.color}}>
      <div className="qcard result">
        <div className="hero-eyebrow">衝刺完成 · {s.name}</div>
        <div className="score num">{score} / {total}</div>
        <div style={{fontWeight:700,color:'var(--ink-soft)'}}>+{score*10} XP</div>
        {perfect&&(
          <div>
            <div className="seal kai">{sealCh}</div>
            <div style={{fontWeight:900,color:'var(--cinnabar)'}}>滿分!蓋一枚印章 🎉</div>
          </div>
        )}
        {!perfect&&<p className="note" style={{marginTop:14}}>錯的題目都附了「為什麼」──邏輯抓到了,下一回合就是你的。 / Every miss came with a "why" — catch the logic and the next round is yours.</p>}
        {pet&&(
          <div className="cheer">
            <span style={{fontSize:38}}>{pet.emoji}</span> {pet.name}:{perfect?'「太神了!」 / "Legendary!"':'「打得漂亮,再來一場!」 / "Good fight — one more!"'}
            <div style={{fontSize:13,color:'var(--ink-soft)',marginTop:4}}>❤️ 友情 Bond +{score*2}</div>
          </div>
        )}
        <div className="mode-row" style={{justifyContent:'center',marginTop:24}}>
          <button className="btn solid" onClick={exit}>再來一回合</button>
        </div>
      </div>
    </div>
  );
}

/* ── 神獸遊樂園 ── */
function PlayPage({state,actions,goHome}){
  const [mode,setMode]=useState('hub');
  const [poke,setPoke]=useState(false);
  const [bubble,setBubble]=useState('');
  const [hatch,setHatch]=useState(null);
  if(mode==='storm')return <StormGame level={state.subjects.math.level}
    best={state.best.storm} onBest={actions.bestStorm} exit={()=>setMode('hub')}/>;
  if(mode==='defense')return <DefenseGame level={state.subjects.math.level}
    best={state.best.defense} onBest={actions.bestDefense} exit={()=>setMode('hub')}/>;
  if(mode==='farm')return <FarmGame farm={state.farm} hanziLv={state.subjects.hanzi.level}
    mathLv={state.subjects.math.level} update={actions.farmUpdate} exit={()=>setMode('hub')}/>;
  const tryPlay=m=>{if(actions.spend(PLAY_COST))setMode(m)};
  return (
    <div style={{'--ac':'var(--cobalt)'}}>
      <button className="back" onClick={goHome}>← 回基地 Back to base</button>
      <div className="page-head"><h2>神獸遊樂園 <span className="fam-en">Beast Arcade</span></h2></div>
      <p className="note">用衝刺賺來的 XP 解鎖神獸、挑戰小遊戲。目前可用 ⚡ {state.xp} XP。 / Spend the XP you earned in sprints to unlock beasts and play games.</p>

      <h3 className="sec-title">🎮 小遊戲 Mini Games(每場入場費 {PLAY_COST} XP / {PLAY_COST} XP per game)</h3>
      <div className="gamegrid">
        <div className="gamecard">
          <div className="ge">🏰</div>
          <b>知識塔防 Knowledge Defense</b>
          <p>敵人一波波進攻!每答對一題就發射砲火,守住基地。答錯敵人前進。 / Answer correctly to fire on the invaders; a wrong answer lets them advance.</p>
          <div className="gbest">最佳紀錄 Best:第 {state.best.defense||0} 波 wave</div>
          <button className="btn solid" disabled={state.xp<PLAY_COST} onClick={()=>tryPlay('defense')}>
            開始 Play(−{PLAY_COST} XP)
          </button>
        </div>
        <div className="gamecard">
          <div className="ge">🌱</div>
          <b>邏輯農場 Logic Farm</b>
          <p>經營你的田地:買種子→播種→澆水→睡覺過夜作物才長大→收成再投資。答題充體力,進度永久存檔! / Run a real farm: plant, water, sleep to grow, harvest and reinvest. Answers recharge your energy. Auto-saved!</p>
          <div className="gbest">農場金幣 Coins:{state.farm.coins} · 已收成 {state.farm.harvested}</div>
          <button className="btn solid" onClick={()=>setMode('farm')}>
            進入農場 Enter(免費 free)
          </button>
        </div>
        <div className="gamecard">
          <div className="ge">⚡</div>
          <b>速算風暴 Math Storm</b>
          <p>45 秒連續答題,腦速極限測試,題目跟著你的數學等級變難。 / 45 seconds of rapid-fire math at your current level.</p>
          <div className="gbest">最佳紀錄 Best:{state.best.storm||0} 題 solved</div>
          <button className="btn solid" disabled={state.xp<PLAY_COST} onClick={()=>tryPlay('storm')}>
            開始 Play(−{PLAY_COST} XP)
          </button>
        </div>
      </div>

      <h3 className="sec-title">🐾 神獸聖殿 Beast Shrine({state.pets.length}/{PETS.length})</h3>
      {(()=>{
        const ap=PETS.find(p=>p.id===state.activePet);
        if(!ap)return <p className="note">聖殿空著——到下方圖鑑孵化你的第一顆神獸蛋! / The shrine is empty. Hatch your first beast egg below!</p>;
        const pd=(state.petData&&state.petData[ap.id])||{lv:1,bond:0,sprints:0};
        const need=pd.lv*25;
        const TITLES={1:'幼獸 Cub',2:'成長 Youth',3:'覺醒 Awakened',4:'神威 Mighty',5:'傳說 Legend'};
        return (
          <div className="shrine">
            <div className={`shrinePet lv${pd.lv} ${poke?'poked':''}`}
              onClick={()=>{
                setPoke(true);setTimeout(()=>setPoke(false),450);
                const lines=['{n}:「今天想挑戰哪一科?」 / Which subject shall we conquer?','{n}:「我看好你!」 / I believe in you!','{n}:「再一場衝刺,我的力量就更強了!」 / One more sprint and I grow stronger!','{n}:「邏輯就是我們的武器。」 / Logic is our weapon.','{n}:「呼嚕嚕…」 / Purrrr…'];
                setBubble(pick(lines).replace('{n}',ap.name));
                setTimeout(()=>setBubble(''),2000);
              }}>
              <span className="shrineEmoji">{ap.emoji}</span>
              {bubble&&<div className="bubble">{bubble}</div>}
            </div>
            <div className="shrineInfo">
              <b>{ap.name} <span className="fam-en">{ap.ne}</span> <span className="lvtag">Lv{pd.lv} · {TITLES[pd.lv]}</span></b>
              {pd.lv<5
                ?<div className="bondbar"><i style={{width:Math.min(100,pd.bond/need*100)+'%'}}/></div>
                :<div className="bondbar max"><i style={{width:'100%'}}/></div>}
              <small>❤️ 友情 {pd.lv<5?`${pd.bond}/${need}`:'MAX'}(帶著牠完成衝刺就會成長)· 一起衝刺 {pd.sprints} 回</small>
              <small className="plore" style={{minHeight:0}}>{ap.lore}</small>
              <small style={{color:'var(--ink-soft)'}}>👆 點牠一下試試 / Tap the beast!</small>
            </div>
          </div>
        );
      })()}
      <div className="petgrid">
        {PETS.map(p=>{
          const owned=state.pets.includes(p.id);
          const active=state.activePet===p.id;
          const pd=(state.petData&&state.petData[p.id])||{lv:1};
          return (
            <div key={p.id} className={`petcard ${owned?'':'locked'} ${active?'active':''}`}
              onClick={()=>{if(owned)actions.setPet(p.id)}}>
              <div className={`pe ${owned?'':'shadow'}`}>{owned?p.emoji:'❓'}</div>
              <b>{owned?p.name:'???'} <span className="fam-en">{owned?p.ne:''}</span></b>
              {owned&&<div className="lvstars">{'⭐'.repeat(pd.lv)}</div>}
              <p className="plore">{owned?p.lore:'尚未孵化的神獸蛋…完成衝刺賺 XP 來孵化牠。 / An unhatched egg… earn XP in sprints to hatch it.'}</p>
              {owned
                ?<span className="ptag">{active?'夥伴 Companion ✓':'點擊召喚 Summon'}</span>
                :<button className="btn ghost pbtn" disabled={state.xp<p.cost}
                    onClick={e=>{
                      e.stopPropagation();
                      if(state.xp<p.cost)return;
                      actions.unlockPet(p);
                      setHatch({pet:p,stage:0});
                      setTimeout(()=>setHatch(h=>h&&{...h,stage:1}),700);
                      setTimeout(()=>setHatch(h=>h&&{...h,stage:2}),1500);
                      setTimeout(()=>setHatch(h=>h&&{...h,stage:3}),2000);
                      setTimeout(()=>setHatch(null),3600);
                    }}>
                    🥚 孵化 Hatch(−{p.cost} XP)
                  </button>}
            </div>
          );
        })}
      </div>
      {hatch&&(
        <div className="hatchOverlay">
          <div className={`hatchEgg s${hatch.stage}`}>
            {hatch.stage<2?'🥚':hatch.stage===2?'💥':hatch.pet.emoji}
          </div>
          {hatch.stage===1&&<div className="hatchHint">咔…咔咔… / crack… crack…</div>}
          {hatch.stage>=3&&<div className="hatchName">✨ {hatch.pet.name} {hatch.pet.ne} 誕生!已成為你的夥伴</div>}
        </div>
      )}
    </div>
  );
}

/* ── 小遊戲一:速算風暴 ── */
function StormGame({level,best,onBest,exit}){
  const [t,setT]=useState(45);
  const [q,setQ]=useState(()=>pick(MATH_GEN[level])());
  const [score,setScore]=useState(0);
  const over=t<=0;
  useEffect(()=>{
    if(over){onBest(score);return}
    const id=setTimeout(()=>setT(t-1),1000);
    return()=>clearTimeout(id);
  },[t]);
  const answer=i=>{
    if(over)return;
    if(i===q.ans)setScore(s=>s+1);
    setQ(pick(MATH_GEN[level])());
  };
  return (
    <div className="sprint" style={{'--ac':'var(--cobalt)'}}>
      <button className="back" onClick={exit}>← 回遊樂園 Back to arcade</button>
      <div className="page-head"><h2>速算風暴 Math Storm</h2></div>
      <div className="stormbar">
        <span className={`stormt num ${t<=10?'low':''}`}>⏱ {t}s</span>
        <span className="num" style={{fontWeight:700}}>答對 Solved:{score}</span>
      </div>
      {!over?(
        <div className="qcard">
          <div className="qtext">{q.q}</div>
          <div className="opts">
            {q.options.map((o,i)=>(
              <button key={i} className="opt" onClick={()=>answer(i)}>{o}</button>
            ))}
          </div>
        </div>
      ):(
        <div className="qcard result">
          <div className="hero-eyebrow">時間到 TIME UP</div>
          <div className="score num">{score} 題</div>
          <p>{score>(best||0)?'新紀錄 New record! 🎉':`最佳紀錄 Best:${Math.max(best||0,score)} 題`}</p>
          <button className="btn solid" style={{marginTop:14}} onClick={exit}>回遊樂園 Back</button>
        </div>
      )}
    </div>
  );
}

/* ── 小遊戲二:知識塔防(即時制)── */
const TD_WAY=[[-3,22],[38,22],[38,52],[12,52],[12,80],[60,80],[60,40],[85,40],[85,106]];
const TD_SEGS=(()=>{const s=[];let acc=0;
  for(let i=0;i<TD_WAY.length-1;i++){
    const [x1,y1]=TD_WAY[i],[x2,y2]=TD_WAY[i+1];
    const len=Math.hypot(x2-x1,y2-y1);
    s.push({x1,y1,x2,y2,len,acc});acc+=len;
  }
  return {segs:s,total:acc};
})();
function tdPoint(d){
  const {segs,total}=TD_SEGS;
  if(d>=total){const l=segs[segs.length-1];return {x:l.x2,y:l.y2};}
  for(const s of segs){
    if(d<=s.acc+s.len){const t=(d-s.acc)/s.len;
      return {x:s.x1+(s.x2-s.x1)*t,y:s.y1+(s.y2-s.y1)*t};}
  }
  return {x:segs[0].x1,y:segs[0].y1};
}
const TD_SPOTS=[[22,34],[52,30],[24,64],[46,66],[70,58],[72,26]];
const TD_TOWERS={
  archer:{emoji:'🏹',name:'弓箭塔',ne:'Archer',cost:60,range:20,dmg:7,rate:550},
  ice:{emoji:'❄️',name:'寒冰塔',ne:'Frost',cost:80,range:18,dmg:3,rate:700,slow:true},
  mage:{emoji:'🔮',name:'法師塔',ne:'Mage',cost:110,range:24,dmg:18,rate:1200},
};
const TD_FOES=[
  {emoji:'👾',hp:16,spd:21,gold:4},
  {emoji:'🐗',hp:34,spd:15,gold:6},
  {emoji:'🛡️',hp:70,spd:10.5,gold:10},
];
function tdQueue(w){
  const n=Math.min(4+w*2,16);const q=[];
  for(let i=0;i<n;i++){
    const r=Math.random(),t=(w<3||r<0.5)?TD_FOES[0]:(r<0.85||w<5)?TD_FOES[1]:TD_FOES[2];
    q.push({...t,hp:Math.round(t.hp*(1+(w-1)*0.35))});
  }
  if(w%5===0)q.push({emoji:'🐲',hp:100+70*w,spd:8,gold:40,big:true});
  return q.map(t=>({...t,max:t.hp}));
}

const TD_SCENES=[
  {name:'翠風草原 Emerald Plains',cls:'sc0'},
  {name:'黃沙戈壁 Golden Desert',cls:'sc1'},
  {name:'霜雪凍原 Frost Tundra',cls:'sc2'},
  {name:'熔岩火山 Magma Peak',cls:'sc3'},
  {name:'永夜暗域 Eternal Night',cls:'sc4'},
];
const TD_STORY={
  1:'混沌軍團入侵邏輯王國!指揮官,這裡是最後的堡壘——用你的頭腦守住它。 / The Chaos Legion invades the Logic Kingdom! Commander, this fortress is our last stand.',
  5:'偵察回報:敵軍穿越黃沙戈壁而來,首領是一頭厚甲巨龍。準備迎接第一場硬仗! / Scouts report a desert legion led by an armored dragon. Brace for your first true battle!',
  10:'我們被逼進霜雪凍原。寒冰塔在這裡如魚得水——地利,也是兵法的一部分。 / We fall back to the Frost Tundra. Frost towers thrive here — terrain is strategy too.',
  15:'前方就是熔岩火山,混沌軍團的老巢。牠們會傾巢而出,決戰將至! / Ahead lies Magma Peak, the Legion lair. They will come with everything. The final battle nears!',
  20:'永夜暗域……傳說中沒有指揮官撐過這裡。今晚,我們改寫傳說。 / The Eternal Night… no commander in legend survived this far. Tonight, we rewrite the legend.',
};
function DefenseGame({level,best,onBest,exit}){
  const g=useRef(null);
  if(!g.current)g.current={gold:150,lives:10,wave:1,phase:'break',breakT:2600,
    queue:tdQueue(1),spawnT:0,foes:[],towers:{},shots:[],pops:[],shake:0,over:false,reported:false,uid:1,
    paused:false,speed:1,story:TD_STORY[1]||null};
  const [,setTick]=useState(0);
  const [sel,setSel]=useState(null);
  const genFor=w=>pick(MATH_GEN[Math.max(1,Math.min(6,level+Math.floor((w-1)/4)))])();
  const [q,setQ]=useState(()=>genFor(1));
  const [picked,setPicked]=useState(null);

  useEffect(()=>{
    const id=setInterval(()=>{
      const s=g.current;
      if(s.over||s.paused||s.story)return;
      const dt=80*s.speed;
      /* 波次節奏 */
      if(s.phase==='break'){s.breakT-=dt;if(s.breakT<=0)s.phase='wave';}
      else{
        s.spawnT-=dt;
        if(s.queue.length&&s.spawnT<=0){
          s.foes.push({...s.queue.shift(),id:s.uid++,dist:0,slow:0});
          s.spawnT=650;
        }
      }
      /* 敵人移動 */
      for(const f of s.foes){
        f.slow=Math.max(0,f.slow-dt);
        f.dist+=f.spd*(f.slow>0?0.5:1)*dt/1000;
      }
      const leaked=s.foes.filter(f=>f.dist>=TD_SEGS.total);
      if(leaked.length){
        s.lives-=leaked.length;s.shake=280;
        for(const f of leaked){const p=tdPoint(TD_SEGS.total-2);
          s.pops.push({x:p.x,y:p.y,txt:'💔',cls:'hurt',ttl:900});}
        s.foes=s.foes.filter(f=>f.dist<TD_SEGS.total);
        if(s.lives<=0)s.over=true;
      }
      /* 塔攻擊 */
      for(const [idx,t]of Object.entries(s.towers)){
        t.cd-=dt;if(t.cd>0)continue;
        const spec=TD_TOWERS[t.type];const [sx,sy]=TD_SPOTS[idx];
        const range=spec.range+2*(t.lvl-1);
        let tgt=null,td=-1;
        for(const f of s.foes){const p=tdPoint(f.dist);
          if(Math.hypot(p.x-sx,p.y-sy)<=range&&f.dist>td){tgt=f;td=f.dist;}}
        if(!tgt)continue;
        const p=tdPoint(tgt.dist);
        const dmg=Math.round(spec.dmg*Math.pow(1.65,t.lvl-1));
        tgt.hp-=dmg;if(spec.slow)tgt.slow=1000;
        s.shots.push({x1:sx,y1:sy,x2:p.x,y2:p.y,ttl:150,c:t.type});
        s.pops.push({x:p.x,y:p.y-3,txt:'-'+dmg,cls:'dmg',ttl:600});
        t.cd=spec.rate;
        if(tgt.hp<=0){
          s.gold+=tgt.gold;
          s.pops.push({x:p.x,y:p.y,txt:'💥',cls:'boom',ttl:500});
          s.pops.push({x:p.x,y:p.y-6,txt:'+'+tgt.gold+'🪙',cls:'gold',ttl:800});
          s.foes=s.foes.filter(f=>f!==tgt);
        }
      }
      /* 波次結束 */
      if(s.phase==='wave'&&!s.queue.length&&!s.foes.length){
        s.wave+=1;s.gold+=25;s.phase='break';s.breakT=3200;s.queue=tdQueue(s.wave);
        s.pops.push({x:50,y:50,txt:'波次獎勵 +25🪙',cls:'gold',ttl:1100});
        if(TD_STORY[s.wave])s.story=TD_STORY[s.wave];
      }
      /* 特效衰減 */
      s.shake=Math.max(0,s.shake-dt);
      s.shots=s.shots.filter(e=>(e.ttl-=dt)>0);
      s.pops=s.pops.filter(e=>(e.ttl-=dt)>0);
      setTick(t=>t+1);
    },80);
    return ()=>clearInterval(id);
  },[]);

  const s=g.current;
  useEffect(()=>{if(s.over&&!s.reported){s.reported=true;onBest(s.wave);}});

  const answer=i=>{
    if(picked!==null||s.over)return;
    setPicked(i);
    if(i===q.ans){s.gold+=20;s.pops.push({x:50,y:14,txt:'錦囊軍費 +20🪙',cls:'gold',ttl:900});}
    setTimeout(()=>{setPicked(null);setQ(genFor(s.wave));},i===q.ans?350:900);
  };
  const build=type=>{
    const spec=TD_TOWERS[type];
    if(s.gold<spec.cost)return;
    s.gold-=spec.cost;s.towers[sel]={type,lvl:1,cd:0};setSel(null);
  };
  const upgrade=()=>{
    const t=s.towers[sel];const cost=70+50*t.lvl;
    if(!t||t.lvl>=3||s.gold<cost)return;
    s.gold-=cost;t.lvl+=1;setSel(null);
  };

  return (
    <div style={{'--ac':'var(--cobalt)'}}>
      <button className="back" onClick={exit}>← 回遊樂園 Back to arcade</button>
      <div className="tdbar">
        <span>🪙 <b className="num">{s.gold}</b></span>
        <span>❤️ <b className="num">{s.lives}</b></span>
        <span>🌊 第 <b className="num">{s.wave}</b> 波</span>
        <span className="tdscene">{TD_SCENES[Math.floor((s.wave-1)/5)%TD_SCENES.length].name}</span>
        <span className="tdctrl">
          <button className={`tdcbtn ${s.paused?'on':''}`} onClick={()=>{s.paused=!s.paused}}>{s.paused?'▶':'⏸'}</button>
          <button className={`tdcbtn ${s.speed!==1?'on':''}`}
            onClick={()=>{const gears=[0.5,1,1.5,2];s.speed=gears[(gears.indexOf(s.speed)+1)%gears.length]}}>
            {s.speed===0.5?'🐢×0.5':s.speed===1?'▶×1':s.speed===1.5?'⏩×1.5':'⚡×2'}
          </button>
        </span>
        <span className="tdbest">最佳 Best:{Math.max(best||0,s.over?s.wave:0)||'—'}</span>
      </div>

      <div className={`tdboard ${TD_SCENES[Math.floor((s.wave-1)/5)%TD_SCENES.length].cls} ${s.shake>0?'shake':''}`} onClick={()=>setSel(null)}>
        <svg className="tdsvg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={TD_WAY.map(p=>p.join(',')).join(' ')} className="tdroad"/>
          <polyline points={TD_WAY.map(p=>p.join(',')).join(' ')} className="tdroadline"/>
          {sel!==null&&s.towers[sel]&&(()=>{const t=s.towers[sel];const spec=TD_TOWERS[t.type];
            const [x,y]=TD_SPOTS[sel];
            return <circle cx={x} cy={y} r={spec.range+2*(t.lvl-1)} className="tdrange"/>;})()}
          {s.shots.map((e,i)=>(
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              className={`tdshot ${e.c}`} style={{opacity:e.ttl/150}}/>
          ))}
        </svg>
        <span className="tdcastle" style={{left:'85%',top:'92%'}}>🏰</span>
        {TD_SPOTS.map(([x,y],i)=>{
          const t=s.towers[i];
          return (
            <button key={i} className={`tdspot ${t?'built':''} ${sel===i?'sel':''}`}
              style={{left:x+'%',top:y+'%'}}
              onClick={e=>{e.stopPropagation();setSel(sel===i?null:i);}}>
              {t?TD_TOWERS[t.type].emoji:'⛏️'}
              {t&&t.lvl>1&&<i className="tdstar">{'⭐'.repeat(t.lvl-1)}</i>}
            </button>
          );
        })}
        {s.foes.map(f=>{const p=tdPoint(f.dist);
          return (
            <div key={f.id} className={`tdfoe ${f.big?'big':''} ${f.slow>0?'chilled':''}`}
              style={{left:p.x+'%',top:p.y+'%'}}>
              <div className="tdhp"><i style={{width:Math.max(0,f.hp/f.max*100)+'%'}}/></div>
              {f.emoji}
            </div>
          );
        })}
        {s.pops.map((e,i)=>(
          <span key={i} className={`tdpop ${e.cls}`} style={{left:e.x+'%',top:e.y+'%'}}>{e.txt}</span>
        ))}
        {s.story&&!s.over&&(
          <div className="tdstoryOverlay" onClick={e=>e.stopPropagation()}>
            <div className="tdstoryBox">
              <div className="tdnpc">🦉</div>
              <div className="tdstoryTxt">
                <b>軍師墨老 Sage Mo</b>
                <p>{s.story}</p>
                <button className="btn solid" onClick={()=>{s.story=null}}>整軍出擊 To battle!</button>
              </div>
            </div>
          </div>
        )}
        {s.paused&&!s.over&&!s.story&&(
          <div className="tdpauseMask">⏸ 暫停中 PAUSED<br/><small>看清局勢,想好再打——暫停是指揮官的權利。</small></div>
        )}
        {s.phase==='break'&&!s.over&&!s.story&&(
          <div className="tdbanner">⚔️ 第 {s.wave} 波來襲 Wave {s.wave} incoming…</div>
        )}
        {s.over&&(
          <div className="tdover">
            <div className="hero-eyebrow">基地陷落 BASE FALLEN</div>
            <p style={{fontSize:14}}>🦉 墨老:「勝敗乃兵家常事。看清這次是哪一波守不住的——整軍,再來。」 / Defeat teaches what victory cannot. Regroup and return.</p>
            <div className="score num">堅守到第 {s.wave} 波</div>
            <p>{s.wave>(best||0)?'新紀錄 New record! 🎉':`最佳紀錄 Best:第 ${Math.max(best||0,s.wave)} 波`}</p>
            <button className="btn solid" onClick={exit}>回遊樂園 Back</button>
          </div>
        )}
        {sel!==null&&!s.over&&(
          <div className="tdmenu" onClick={e=>e.stopPropagation()}>
            {!s.towers[sel]?(
              <div>
                <b>建造 Build</b>
                {Object.entries(TD_TOWERS).map(([k,t])=>(
                  <button key={k} className="tdbuy" disabled={s.gold<t.cost} onClick={()=>build(k)}>
                    {t.emoji} {t.name} {t.ne} <span className="num">{t.cost}🪙</span>
                  </button>
                ))}
              </div>
            ):(()=>{const t=s.towers[sel];const spec=TD_TOWERS[t.type];const cost=70+50*t.lvl;
              return (
                <div>
                  <b>{spec.emoji} {spec.name} Lv{t.lvl}</b>
                  <p className="tdinfo">攻擊 {Math.round(spec.dmg*Math.pow(1.65,t.lvl-1))} · 射程 {spec.range+2*(t.lvl-1)}{spec.slow?' · 緩速':''}</p>
                  {t.lvl<3
                    ?<button className="tdbuy" disabled={s.gold<cost} onClick={upgrade}>⬆ 升級 Upgrade <span className="num">{cost}🪙</span></button>
                    :<p className="tdinfo">已達頂級 MAX ⭐⭐</p>}
                </div>
              );})()}
          </div>
        )}
      </div>

      <div className="tdq">
        <div className="tdqhead">🧠 軍師錦囊:答對一題,墨老立刻撥發 +20🪙(想快速蓋塔就靠這個)</div>
        <div className="qtext" style={{fontSize:17}}>{q.q}</div>
        <div className="tdopts">
          {q.options.map((o,i)=>(
            <button key={i} disabled={picked!==null}
              className={`opt ${picked===null?'':i===q.ans?'ok':i===picked?'bad':''}`}
              onClick={()=>answer(i)}>{o}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 小遊戲三:邏輯農場(星露谷式)── */
const FARM_CROPS=[
  {id:'radish',name:'蘿蔔',ne:'Radish',seed:5,sell:12,stages:['🌱','🌿','🥕']},
  {id:'tomato',name:'番茄',ne:'Tomato',seed:10,sell:28,stages:['🌱','🌿','🪴','🍅']},
  {id:'pumpkin',name:'南瓜',ne:'Pumpkin',seed:20,sell:60,stages:['🌱','🌿','🍃','🌼','🎃']},
  {id:'melon',name:'西瓜',ne:'Watermelon',seed:35,sell:110,stages:['🌱','🌿','☘️','🍃','🌼','🍉']},
];
const FARM_SEASONS=['🌸 春 Spring','☀️ 夏 Summer','🍂 秋 Autumn','❄️ 冬 Winter'];
const FARM_TILES=24, FARM_EMAX=40;

const FARM_TIPS=[
  '禾寶:「澆過水的作物,睡一覺才會長大——睡前巡一次田,是農夫的儀式。」 / Water first, then sleep — crops grow overnight.',
  '禾寶:「西瓜要等五天,但每天賺得最多。有耐心的人賺大錢!」 / Melons take five days but earn the most per day.',
  '禾寶:「體力不夠?答幾題就回來了。腦力就是農場的太陽能。」 / Out of energy? Answers are this farm\u2019s solar power.',
  '禾寶:「市集日每五天一次,記得留作物等好價錢!」 / Market day comes every fifth day — save crops for the premium!',
  '禾寶:「下雨天是老天爺幫你澆水,省下的體力拿去開新田吧。」 / Rain waters everything — spend the saved energy planting more.',
];
const FARM_WEATHER={sun:{e:'☀️',n:'晴天 Sunny'},rain:{e:'🌧️',n:'雨天 Rainy(全田自動澆水!)'}};
function FarmGame({farm,hanziLv,mathLv,update,exit}){
  const [tool,setTool]=useState('plant');      // plant | water | harvest | clear
  const [cropSel,setCropSel]=useState('radish');
  const [q,setQ]=useState(null);
  const [picked,setPicked]=useState(null);
  const [pops,setPops]=useState([]);           // {x,y,txt,cls,id}
  const [sleeping,setSleeping]=useState(false);
  const popId=useRef(1);

  /* 舊存檔遷移:seeds/plots 版 → v2 田地版 */
  useEffect(()=>{
    if(!farm.tiles){
      update(f=>{
        f.v=2;f.day=f.day||1;f.energy=20;
        f.coins=(f.coins||0)+(f.seeds||0)*2+20;
        f.harvested=f.harvested||0;
        f.tiles=Array(FARM_TILES).fill(null);
        delete f.seeds;delete f.plots;
      });
    }
  },[]);
  if(!farm.tiles)return <p className="empty">整地中… Preparing the field…</p>;

  const pop=(x,y,txt,cls)=>{
    const id=popId.current++;
    setPops(p=>[...p,{x,y,txt,cls,id}]);
    setTimeout(()=>setPops(p=>p.filter(e=>e.id!==id)),850);
  };
  const tilePos=i=>({x:(i%8)*12.5+6.25,y:Math.floor(i/8)*33+17});

  /* 答題回復體力 */
  const newQ=()=>{
    const useHanzi=Math.random()<0.5;
    setQ(useHanzi?genHanzi(hanziLv,1)[0]:pick(MATH_GEN[mathLv])());
    setPicked(null);
  };
  const answer=i=>{
    if(picked!==null)return;
    setPicked(i);
    if(i===q.ans){
      update(f=>{f.energy=Math.min(FARM_EMAX,(f.energy||0)+6)});
      pop(50,-8,'+6⚡','gold');
    }
    setTimeout(newQ,i===q.ans?400:1000);
  };

  /* 田地互動 */
  const clickTile=i=>{
    const t=farm.tiles[i];const p=tilePos(i);
    if(tool==='plant'){
      if(t)return;
      const c=FARM_CROPS.find(c=>c.id===cropSel);
      if(farm.coins<c.seed){pop(p.x,p.y,'金幣不足!','hurt');return;}
      if(farm.energy<2){pop(p.x,p.y,'體力不足,先答題!','hurt');return;}
      update(f=>{f.coins-=c.seed;f.energy-=2;f.tiles[i]={crop:c.id,stage:0,watered:false};});
      pop(p.x,p.y,'🌱','boom');
    }else if(tool==='water'){
      if(!t||t.watered)return;
      const c=FARM_CROPS.find(c=>c.id===t.crop);
      if(t.stage>=c.stages.length-1)return;
      if(farm.energy<1){pop(p.x,p.y,'體力不足!','hurt');return;}
      update(f=>{f.energy-=1;f.tiles[i].watered=true;});
      pop(p.x,p.y,'💦','boom');
    }else if(tool==='harvest'){
      if(!t)return;
      const c=FARM_CROPS.find(c=>c.id===t.crop);
      if(t.stage<c.stages.length-1)return;
      const market=(farm.day||1)%5===0;
      const price=market?Math.round(c.sell*1.5):c.sell;
      update(f=>{f.coins+=price;f.harvested+=1;f.tiles[i]=null;});
      pop(p.x,p.y,`+${price}🪙${market?' 市集價!':''}`,'gold');
    }else if(tool==='clear'){
      if(!t)return;
      if(farm.energy<1){pop(p.x,p.y,'體力不足!','hurt');return;}
      update(f=>{f.energy-=1;f.tiles[i]=null;});
      pop(p.x,p.y,'🪓','boom');
    }
  };

  /* 睡覺過夜:澆過水的作物長一階 */
  const sleep=()=>{
    setSleeping(true);
    setTimeout(()=>{
      update(f=>{
        f.day+=1;
        f.energy=Math.min(FARM_EMAX,(f.energy||0)+4);
        const rain=Math.random()<0.25;
        f.weather=rain?'rain':'sun';
        f.tiles=f.tiles.map(t=>{
          if(!t)return t;
          const c=FARM_CROPS.find(c=>c.id===t.crop);
          const grown=t.watered&&t.stage<c.stages.length-1;
          const nt={...t,stage:t.stage+(grown?1:0),watered:false};
          if(rain&&nt.stage<c.stages.length-1)nt.watered=true; /* 雨天:老天爺代勞 */
          return nt;
        });
      });
      setSleeping(false);
    },1100);
  };

  const season=FARM_SEASONS[Math.floor(((farm.day||1)-1)/7)%4];
  const crop=FARM_CROPS.find(c=>c.id===cropSel);
  const ePct=Math.round((farm.energy||0)/FARM_EMAX*100);

  return (
    <div style={{'--ac':'var(--moss)'}}>
      <button className="back" onClick={exit}>← 回遊樂園 Back to arcade</button>
      <div className="fhud">
        <span>📅 第 <b className="num">{farm.day||1}</b> 天 · {season}</span>
        <span>{FARM_WEATHER[farm.weather||'sun'].e} {FARM_WEATHER[farm.weather||'sun'].n}</span>
        {(farm.day||1)%5===0&&<span className="fmarket">🦝 市集日!收購價 ×1.5</span>}
        <span>🪙 <b className="num">{farm.coins}</b></span>
        <span className="fenergy">⚡ <i className="fbar"><b style={{width:ePct+'%'}}/></i> <span className="num">{farm.energy||0}/{FARM_EMAX}</span></span>
        <span>🧺 <b className="num">{farm.harvested}</b></span>
      </div>

      <div className={`farmboard season${Math.floor(((farm.day||1)-1)/7)%4} ${farm.weather==='rain'?'raining':''}`}>
        <div className="fgrid">
          {farm.tiles.map((t,i)=>{
            const c=t&&FARM_CROPS.find(c=>c.id===t.crop);
            const mature=t&&t.stage>=c.stages.length-1;
            return (
              <button key={i}
                className={`ftile ${t&&t.watered?'wet':''} ${mature?'ripe':''}`}
                onClick={()=>clickTile(i)}>
                {t&&<span className="fcrop">{c.stages[t.stage]}</span>}
                {mature&&<span className="fsparkle">✨</span>}
                {t&&!mature&&(
                  <span className="fdots">
                    {c.stages.slice(1).map((_,d)=>(
                      <i key={d} className={d<t.stage?'on':''}/>
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {pops.map(e=>(
          <span key={e.id} className={`tdpop ${e.cls}`} style={{left:e.x+'%',top:e.y+'%'}}>{e.txt}</span>
        ))}
        {sleeping&&(
          <div className="fnight">🌙 第 {farm.day} 夜…澆過水的作物悄悄長大了<br/><small>明天的天氣是……?</small></div>
        )}
      </div>

      {/* 底部工具熱鍵欄 */}
      <div className="fhotbar">
        {[['plant','🌰','種植 Plant'],['water','💧','澆水 Water'],['harvest','🧺','收成 Harvest'],['clear','🪓','剷除 Clear']].map(([k,e,l])=>(
          <button key={k} className={`fslot ${tool===k?'on':''}`} onClick={()=>setTool(k)} title={l}>
            <span>{e}</span><small>{l.split(' ')[0]}</small>
          </button>
        ))}
        <div className="fsep"/>
        <button className="fslot sleepbtn" onClick={sleep} disabled={sleeping}>
          <span>😴</span><small>睡覺</small>
        </button>
      </div>

      {tool==='plant'&&(
        <div className="croprow">
          {FARM_CROPS.map(c=>{
            const days=c.stages.length-1;
            return (
              <button key={c.id} className={`cropchip ${cropSel===c.id?'on':''}`} onClick={()=>setCropSel(c.id)}>
                <span className="cropemoji">{c.stages[c.stages.length-1]}</span>
                <b>{c.name} {c.ne}</b>
                <small>種子 {c.seed}🪙 · {days} 天熟 · 賣 {c.sell}🪙</small>
              </button>
            );
          })}
        </div>
      )}

      <div className="tdq">
        <div className="tdqhead">☀️ 答題充體力 Answer to recharge(+6⚡,體力用來種植與澆水)</div>
        {!q?<button className="btn solid" onClick={newQ}>抽一題 Draw a question</button>:(
          <div>
            <div className="qtext" style={{fontSize:17}}>{q.q}</div>
            <div className="tdopts">
              {q.options.map((o,i)=>{
                const label=typeof o==='object'?o.t:o;
                return <button key={i} disabled={picked!==null}
                  className={`opt ${picked===null?'':i===q.ans?'ok':i===picked?'bad':''}`}
                  onClick={()=>answer(i)}>{label}</button>;
              })}
            </div>
          </div>
        )}
      </div>
      <div className="fnpc">
        <span className="fnpcface">🐹</span>
        <p>{FARM_TIPS[((farm.day||1)-1)%FARM_TIPS.length]}</p>
      </div>
    </div>
  );
}

/* ── 進度頁:印章牆 ── */
/* ── 資料保險箱:匯出/匯入(MASTER_HANDOFF §7.2 資產保險)── */
function buildBackup(state){
  return JSON.stringify({app:'logic-lab',format:1,
    version:(typeof CONTENT_VERSION!=='undefined'?CONTENT_VERSION:''),
    exportedAt:new Date().toISOString(),save:state},null,2);
}
function parseBackup(text){
  const obj=JSON.parse(text);
  const s=(obj&&obj.app==='logic-lab'&&obj.save)?obj.save:obj;
  const hasXp=s&&(typeof s.totalXp==='number'||typeof s.xp==='number');
  if(!s||typeof s!=='object'||!hasXp||!s.subjects)throw new Error('invalid backup');
  return {save:{...DEFAULT,...s},exportedAt:(obj&&obj.exportedAt)||''};
}
function BackupVault({state,importSave,markBackup}){
  const fileRef=useRef(null);
  const [msg,setMsg]=useState('');
  const [pasteOpen,setPasteOpen]=useState(false);
  const [pasteText,setPasteText]=useState('');

  const doExport=()=>{
    const blob=new Blob([buildBackup(state)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`logic-lab-backup-${today()}.json`;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800);
    markBackup();
    setMsg('✅ 備份檔已下載!請存到雲端硬碟或傳給自己一份。 / Backup downloaded — keep a copy somewhere safe.');
  };
  const doCopy=()=>{
    const text=buildBackup(state);
    const done=()=>{markBackup();
      setMsg('✅ 已複製備份文字!貼到記事本或訊息裡保存。 / Copied — paste it into a note to keep it.');};
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done).catch(()=>fallbackCopy(text,done));
    }else fallbackCopy(text,done);
  };
  const fallbackCopy=(text,done)=>{
    const ta=document.createElement('textarea');ta.value=text;
    ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.focus();ta.select();
    try{document.execCommand('copy');done();}
    catch(e){setMsg('❌ 複製失敗,請改用「匯出備份檔」。 / Copy failed — please use Export instead.');}
    ta.remove();
  };
  const applyText=text=>{
    try{
      const {save:s,exportedAt}=parseBackup(text);
      const ok=window.confirm(
        `即將用備份覆蓋目前進度:\n`
        +`目前累積 XP:${state.totalXp||0} → 備份累積 XP:${s.totalXp||0}\n`
        +`目前印章:${(state.seals||[]).length} → 備份印章:${(s.seals||[]).length}\n`
        +(exportedAt?`備份時間:${String(exportedAt).slice(0,10)}\n`:'')
        +`\n確定要還原嗎?目前的進度會被取代。`);
      if(!ok){setMsg('已取消還原,目前進度保持不變。 / Restore cancelled.');return;}
      importSave(s);setPasteOpen(false);setPasteText('');
      setMsg('✅ 還原完成!進度已載回。 / Restored — your progress is back.');
    }catch(e){
      setMsg('❌ 這不是有效的備份內容,請確認檔案或文字是否完整。 / Not a valid backup — please check the file or text.');
    }
  };
  const onFile=e=>{
    const f=e.target.files&&e.target.files[0];
    if(!f)return;
    const r=new FileReader();
    r.onload=()=>applyText(String(r.result));
    r.readAsText(f);
    e.target.value='';
  };
  const days=state.lastBackup
    ?Math.floor((Date.now()-new Date(state.lastBackup).getTime())/864e5):null;

  return (
    <div className="vault">
      <div className="vault-head">
        <span className="vault-icon">💾</span>
        <div>
          <h3>資料保險箱 · Data Vault</h3>
          <p>進度存在「這台裝置的這個瀏覽器」裡;換裝置或清除快取就會歸零。
            定期匯出備份=幫神獸和印章買保險。
            / Progress lives in this browser only — export a backup so nothing is ever lost.</p>
        </div>
      </div>
      <div className="vault-row">
        <button className="btn solid" onClick={doExport}>⬇ 匯出備份檔 Export</button>
        <button className="btn" onClick={doCopy}>📋 複製備份文字 Copy</button>
        <button className="btn" onClick={()=>fileRef.current&&fileRef.current.click()}>⬆ 匯入檔案還原 Import</button>
        <button className="btn" onClick={()=>{setPasteOpen(o=>!o);setMsg('')}}>📝 貼上文字還原 Paste</button>
        <input ref={fileRef} type="file" accept=".json,.txt,application/json,text/plain"
          style={{display:'none'}} onChange={onFile}/>
      </div>
      {pasteOpen&&
        <div className="vault-paste">
          <textarea className="vault-ta" rows={5} value={pasteText}
            placeholder={'把之前複製的備份文字整段貼在這裡… / Paste your backup text here…'}
            onChange={e=>setPasteText(e.target.value)}/>
          <button className="btn solid" disabled={!pasteText.trim()}
            onClick={()=>applyText(pasteText)}>還原這份備份 Restore</button>
        </div>}
      {msg&&<p className="vault-msg">{msg}</p>}
      <p className="vault-meta">
        {state.lastBackup
          ?`上次備份:${state.lastBackup.slice(0,10)}(${days} 天前) / Last backup ${days} day(s) ago`
          :'還沒有備份過。 / No backup yet.'}
      </p>
    </div>
  );
}

/* ── 成長年輪:mastery ledger 的可見面板(星圖/復仇戰的前哨站)── */
function LedgerPanel({state}){
  const st=ledgerStats(state);
  const max=Math.max(1,...st.days.map(d=>d.a));
  const acc=st.q?Math.round(st.ok/st.q*100):0;
  return (
    <div className="ledger">
      <h3>成長年輪 · Growth Rings</h3>
      {st.q===0
        ?<p className="empty">帳本還是空的──完成第一回合衝刺,年輪就開始生長。 / Finish a sprint and the rings start growing.</p>
        :<div>
          <div className="stat-row">
            <div className="stat"><b className="num">{st.q}</b><span>累計答題 · Answered</span></div>
            <div className="stat"><b className="num">{acc}%</b><span>正確率 · Accuracy</span></div>
            <div className="stat"><b className="num">{st.lit}/{ALL_CHARS.length}</b><span>點亮漢字 · Lit chars</span></div>
            <div className="stat"><b className="num">{st.rivals}</b><span>宿敵 · Rivals</span></div>
          </div>
          <div className="ldg-bars" aria-label="最近七天答題量">
            {st.days.map(d=>(
              <div key={d.d} className="ldg-col" title={`${d.d}:答 ${d.a} 題,對 ${d.c} 題`}>
                <div className="ldg-bar">
                  <i style={{height:`${Math.round(d.a/max*100)}%`}}>
                    <b style={{height:d.a?`${Math.round(d.c/d.a*100)}%`:'0%'}}></b>
                  </i>
                </div>
                <span>{d.d.slice(5).replace('-','/')}</span>
              </div>
            ))}
          </div>
          <p className="note">每答一題,帳本記一筆。點亮的字會成為「千字文星圖」的星星;答錯的題三天後將以「宿敵」身分回歸復仇戰──都吃這條脊椎。 / Every answer is recorded: lit characters will become stars, missed ones will return as rivals.</p>
        </div>}
    </div>
  );
}

function ProgressPage({state,goHome,importSave,markBackup}){
  return (
    <div style={{'--ac':'var(--cinnabar)'}}>
      <button className="back" onClick={goHome}>← 回基地</button>
      <div className="page-head"><h2>印章牆</h2></div>
      <div className="stat-row">
        <div className="stat"><b className="num">{state.totalXp||0}</b><span>累積 XP · Lifetime</span></div>
        <div className="stat"><b className="num">{state.xp}</b><span>可用 XP · Spendable</span></div>
        <div className="stat"><b className="num">{state.streak}</b><span>連續天數 · Streak</span></div>
        <div className="stat"><b className="num">{state.seals.length}</b><span>印章 · Seals</span></div>
        <div className="stat"><b className="num">{state.pets.length}/{PETS.length}</b><span>神獸 · Beasts</span></div>
      </div>
      <p className="note">滿分完成一回合衝刺,就能蓋一枚硃砂印。</p>
      {state.seals.length===0
        ?<p className="empty">還沒有印章──去完成一回合滿分衝刺吧!</p>
        :<div className="seal-wall">
          {state.seals.map((x,i)=>(
            <div key={i} className="seal-mini kai" title={`${SUBJECTS[x.subject].name} · ${x.date}`}>{x.ch}</div>
          ))}
        </div>}
      <LedgerPanel state={state}/>
      <BackupVault state={state} importSave={importSave} markBackup={markBackup}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
