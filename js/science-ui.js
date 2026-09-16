/* Science views use the same visual language as the shared subject/sprint pages. */
function ScienceLearn({state, level, eng, startSprint, archiveRound}) {
  const h = React.createElement;
  const [domain,setDomain] = React.useState('');
  const [showArchived,setShowArchived] = React.useState(false);
  const rows = Science.progress(SCIENCE_BANK,state,level).filter(u=>!domain || u.domain===domain);
  const begin = (unitId,review=false,delayed=false) => {
    const qs = Science.generate(SCIENCE_BANK,level,5,{unitId,domain,review,delayed,state});
    if(qs.length) startSprint(qs);
  };
  const rounds = Science.resumable(SCIENCE_BANK,state,level,showArchived);
  const reviewCount = rows.reduce((n,u)=>n+u.review,0);
  const oldCount = Object.keys(state.ledger.items).filter(fp=>/^s:[1-6]:\d+:\d+$/.test(fp)).length;
  return h('section',{className:'science-learn'},
    h('p',{className:'note'},'L1–L6 是主題批次，不代表學校年級或能力排名。可自由選級；進度以本版各單元的作答呈現。',eng&&' / Levels are topic collections, not grades or ability ranks.'),
    rounds.length>0&&h('section',{className:'lcard'},h('h3',null,'繼續未完成的練習'),h('p',{className:'note'},'保留已確認的答案，從未答題繼續。新回合也會保留選項順序；封存不會刪除紀錄。'),rounds.map((r,i)=>h('div',{key:r.sessionId,className:'mode-row'},h('button',{className:'btn ghost',onClick:()=>startSprint(r.qs,r.sessionId,r.answers)},`${r.archived?'已封存 · ':''}繼續練習 ${i+1} · 已答 ${Object.keys(r.answers).length}/${r.qs.length} 題`),h('button',{className:'btn ghost',onClick:()=>archiveRound(r.sessionId,!r.archived)},r.archived?'取消封存':'封存此回合')))),
    h('button',{className:'btn ghost','aria-pressed':showArchived,onClick:()=>setShowArchived(!showArchived)},showArchived?'隱藏已封存回合':'顯示已封存回合'),
    h('div',{className:'mode-row'},h('label',null,'領域 ',h('select',{value:domain,onChange:e=>setDomain(e.target.value)},
      h('option',{value:''},'所有領域'),Object.entries(Science.domains).map(([id,name])=>h('option',{key:id,value:id},name)))),
      h('button',{className:'btn solid',disabled:!rows.length,onClick:()=>begin()},'綜合練習（最多5題）'),
      h('button',{className:'btn ghost',disabled:!reviewCount,onClick:()=>begin(undefined,true)},`復習錯題 · ${reviewCount}`),
      h('button',{className:'btn ghost',disabled:!Science.generate(SCIENCE_BANK,level,1,{domain,delayed:true,state}).length,onClick:()=>begin(undefined,false,true)},'延後複習（答對至少3天）')),
    oldCount>0&&h('p',{className:'note'},'舊版自然紀錄已保留在備份與歷史統計中。因舊題答案位置偏差與內容修訂，不把舊分數當作本版理解證據。'),
    h('p',{className:'note'},'已作答不等於已掌握；重複練習會增加作答次數。'),
    h('button',{className:'btn ghost',onClick:()=>downloadSaveText(Science.report(SCIENCE_BANK,state),'science-progress.txt','text/plain;charset=utf-8')},'下載自然科學習紀錄'),
    h('div',{className:'cards'},rows.map(u=>h('section',{key:u.id,className:'lcard'},
      h('div',{className:'meta'},Science.domains[u.domain]),h('h3',null,u.title),eng&&h('p',{className:'meta',lang:'en'},u.titleEn),h('p',{className:'concept'},u.concept),h('p',null,'學習目標：'+u.objective),eng&&h('p',{className:'meta',lang:'en'},u.objectiveEn),u.prerequisites.length>0&&h('p',{className:'note'},'建議先熟悉：'+u.prerequisites.map(id=>SCIENCE_BANK.units.find(x=>x.id===id).title).join('、')),
      eng&&h('p',{className:'meta',lang:'en'},u.en),
      h('p',{className:'note'},`本版已作答 ${u.seen}/${u.qs.length} 題 · 待復習 ${u.review} 題`,u.answered>0?` · 答對 ${u.correct}/${u.answered} 次`:''),
      h('div',{className:'mode-row'},h('button',{className:'btn solid',onClick:()=>begin(u.id)},'練習這個單元'),
      h('button',{className:'btn ghost',disabled:!u.review,onClick:()=>begin(u.id,true)},'復習本單元錯題'))))));
}
function ScienceSprint({qs,eng,sessionId,initialAnswers={},onAnswer,onComplete,exit}) {
  const h = React.createElement;
  const [confidence,setConfidence]=React.useState('unspecified');
  const [reason,setReason]=React.useState('');
  const [index,setIndex] = React.useState(()=>Math.max(0,qs.findIndex(q=>!initialAnswers[q.fp]))), [selected,setSelected]=React.useState(null);
  const [feedback,setFeedback]=React.useState(null), [done,setDone]=React.useState(()=>qs.length>0&&qs.every(q=>initialAnswers[q.fp]));
  const answered = React.useRef(new Map(Object.entries(initialAnswers).map(([fp,a])=>[fp,a.ok]))), locked = React.useRef(false), heading = React.useRef(null);
  const question=qs[index];
  React.useEffect(()=>{heading.current?.focus();},[index,done]);
  React.useEffect(()=>{if(qs.length>0&&qs.every(q=>initialAnswers[q.fp])) onComplete(sessionId);},[]);
  if(!question) return h('div',{className:'sprint'},h('p',{role:'alert'},'目前沒有可練習的題目。'),h('button',{onClick:exit},'返回'));
  const submit=()=>{
    if(locked.current || !selected) return;
    locked.current=true;
    const ok=selected===question.correctOptionId;
    answered.current.set(question.fp,ok);
    onAnswer({id:Science.newId(),questionId:question.id,revision:question.revision,selectedOptionId:selected,confidence,answeredAt:new Date().toISOString()},question,sessionId,qs.map(q=>q.fp));
    setFeedback(ok);
    if(answered.current.size===qs.length) onComplete(sessionId);
  };
  const next=()=>{
    if(feedback===null)return;
    const nextIndex=qs.findIndex(q=>!answered.current.has(q.fp));
    if(nextIndex<0){setDone(true);return;}
    setIndex(nextIndex);setReason('');setConfidence('unspecified');setSelected(null);setFeedback(null);locked.current=false;
  };
  const score=[...answered.current.values()].filter(Boolean).length;
  if(done)return h('section',{className:'sprint',style:{'--ac':'var(--moss)'}},h('div',{className:'qcard result'},
    h('h2',{tabIndex:-1,ref:heading},'自然練習完成'),h('div',{className:'score num'},`${score} / ${qs.length}`),
    h('p',null,`本回合 +${score*10} XP`),h('p',{className:'note'},'這是本回合結果，不代表整個領域已掌握。錯題可從單元卡再次練習。'),
    h('button',{className:'btn solid',onClick:exit},'返回選擇練習')));
  return h('section',{className:'sprint',style:{'--ac':'var(--moss)'}},
    h('button',{className:'back',onClick:exit},'← 返回練習（已確認的作答會保留）'),
    h('p',{className:'meta'},`${question.unitTitle}${eng ? " / "+question.unitTitleEn : ""} · ${index+1}/${qs.length}`),
    h('div',{className:'qcard'},h('h2',{className:'qtext',tabIndex:-1,ref:heading},question.q),
      eng&&h('p',{className:'qen',lang:'en'},question.en),
      question.stimulus&&h('div',{className:'science-table'},h('table',null,h('caption',null,eng?question.stimulus.caption:question.stimulus.caption.split(' / ')[0]),h('thead',null,h('tr',null,question.stimulus.headers.map((t,i)=>h('th',{key:i,scope:'col'},eng?t:t.split(' / ')[0])))),h('tbody',null,question.stimulus.rows.map((row,i)=>h('tr',{key:i},row.map((t,j)=>h('td',{key:j},eng?t:t.split(' / ')[0]))))))),
      h('div',{className:'opts',role:'group','aria-label':'選擇答案'},question.options.map(o=>h('button',{
        key:o.id,className:`opt ${selected===o.id?'selected':''} ${feedback===null?'':o.id===question.correctOptionId?'ok':o.id===selected?'bad':''}`,
        'aria-pressed':selected===o.id,disabled:feedback!==null,onClick:()=>setSelected(o.id)
      },h('span',null,o.t),eng&&o.en&&h('span',{className:'osub',lang:'en'},o.en),
      feedback!==null&&o.id===question.correctOptionId&&h('strong',null,' ✓ 正確答案'),
      feedback===false&&o.id===selected&&h('strong',null,' ✗ 你的答案')))),
      feedback===null&&h('label',null,'把握度（選填） ',h('select',{value:confidence,onChange:e=>setConfidence(e.target.value)},h('option',{value:'unspecified'},'未選擇'),h('option',{value:'sure'},'有把握'),h('option',{value:'unsure'},'不確定／猜測'))),
      feedback===null&&h('button',{className:'btn ghost',onClick:exit},'稍後再答（保留回合）'),
      feedback===null&&h('label',{className:'science-reason'},'我的理由（選填，不計分；不儲存文字）',h('textarea',{value:reason,maxLength:1000,onChange:e=>setReason(e.target.value),placeholder:'哪個觀察支持你的答案？'})),
      feedback===null&&h('button',{className:'btn solid next',disabled:!selected,onClick:submit},'確認答案'),
      h('div',{'aria-live':'polite',role:'status'},feedback!==null&&h('p',null,feedback?'✓ 答對了':'✗ 這題需要再練習，請看正確答案與解釋。')),
      feedback!==null&&reason&&h('p',{className:'note'},'我的理由：'+reason),
      feedback!==null&&h('div',{className:'why'},question.why.filter(line=>eng||!line.startsWith('EN:')).map((line,i)=>h('p',{className:'why-line',key:i,lang:line.startsWith('EN:')?'en':undefined},line))),
      feedback!==null&&h('button',{className:'btn solid next',onClick:next},answered.current.size===qs.length?'看結果':'下一題 →')));
}
