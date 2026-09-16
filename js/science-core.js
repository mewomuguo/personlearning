/* Pure science content/assessment functions; shared by the browser and Node tests. */
(function (root) {
  'use strict';
  const domains = { life: '生命科學', physical: '物質與物理', earth: '地球與宇宙' };
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = value => typeof value === 'string' && value.trim().length > 0;
  function validateBank(bank) {
    const ids = new Set(), legacy = new Set();
    const check = (ok, where) => { if (!ok) throw new Error(`Science content: ${where}`); };
    check(object(bank) && text(bank.version) && Array.isArray(bank.units) && bank.units.length, 'bank');
    for (const u of bank.units) {
      check(object(u) && text(u.id) && !ids.has(u.id), 'unit id'); ids.add(u.id);
      check(Number.isInteger(u.level) && u.level >= 1 && u.level <= 6 && Object.hasOwn(domains,u.domain), u.id + ' level/domain');
      check(text(u.title) && text(u.titleEn) && text(u.concept) && text(u.en) && Array.isArray(u.qs) && u.qs.length, u.id + ' fields');
      for (const q of u.qs) {
        check(object(q) && text(q.id) && !ids.has(q.id), u.id + ' question id'); ids.add(q.id);
        check(Number.isInteger(q.revision) && q.revision > 0 && text(q.familyId), q.id + ' revision/family');
        check(text(q.q) && text(q.en) && Array.isArray(q.why) && q.why.length && q.why.every(text), q.id + ' text');
        check(['single-choice','data-reading'].includes(q.taskType),q.id+' task type');
        if(q.taskType==='data-reading') check(object(q.stimulus)&&text(q.stimulus.caption)&&Array.isArray(q.stimulus.headers)&&q.stimulus.headers.length>0&&q.stimulus.headers.every(text)&&Array.isArray(q.stimulus.rows)&&q.stimulus.rows.length>0&&q.stimulus.rows.every(row=>Array.isArray(row)&&row.length===q.stimulus.headers.length&&row.every(text)),q.id+' stimulus');
        check(['legacy-unreviewed','corrected-awaiting-review','reviewed'].includes(q.reviewStatus), q.id + ' review status');
        check(Array.isArray(q.options) && q.options.length === 4 && q.options.every(o=>object(o)&&text(o.id)&&text(o.t)&&text(o.en)), q.id + ' options');
        check(new Set(q.options.map(o=>o.id)).size === 4 && new Set(q.options.map(o=>o.t)).size === 4, q.id + ' duplicate option');
        check(q.options.some(o=>o.id===q.correctOptionId), q.id + ' correct option');
        if (q.legacyFp) { check(/^s:[1-6]:\d+:\d+$/.test(q.legacyFp) && !legacy.has(q.legacyFp), q.id + ' legacy mapping'); legacy.add(q.legacyFp); }
      }
    }
    for(const u of bank.units) {
      check(text(u.objective)&&text(u.objectiveEn)&&Array.isArray(u.prerequisites)&&u.prerequisites.every(id=>id!==u.id&&bank.units.some(other=>other.id===id)),u.id+' learning goals');
    }
    return true;
  }
  const fingerprint = q => `s:${q.id}:r${q.revision}`;
  function shuffled(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i+1));
      [copy[i],copy[j]] = [copy[j],copy[i]];
    }
    return copy;
  }
  const isWrong = item => item && item.lastOk === false;
  function generate(bank, level, count = 5, { unitId, domain, review = false, delayed = false, now = Date.now(), state = {}, random = Math.random } = {}) {
    const ledger = state.ledger?.items || {};
    const units = bank.units.filter(u=>u.level===level && (!unitId || u.id===unitId) && (!domain || u.domain===domain));
    // Pick one variant per family. Prefer unseen questions, or latest errors in review mode.
    const pool = [];
    for (const unit of units) {
      const groups = new Map();
      for (const q of shuffled(unit.qs,random)) {
        if (review && !isWrong(ledger[fingerprint(q)])) continue;
        if (delayed) {
          const item=ledger[fingerprint(q)];
          if(!item || !item.lastOk || !item.lc || !Number.isFinite(Date.parse(item.lc+'T00:00:00')) || now-Date.parse(item.lc+'T00:00:00')<3*86400000) continue;
        }
        const current = groups.get(q.familyId);
        if (!current || (!ledger[fingerprint(q)] && ledger[fingerprint(current)])) groups.set(q.familyId,q);
      }
      const questions = shuffled([...groups.values()],random).sort((a,b)=>Number(!!ledger[fingerprint(a)])-Number(!!ledger[fingerprint(b)]));
      pool.push({unit,questions});
    }
    const selected = [];
    // Round-robin across the selected units rather than flattening into one biased pool.
    const queues = shuffled(pool,random);
    while (selected.length < count && queues.some(x=>x.questions.length)) {
      for (const {unit,questions} of queues) {
        if (!questions.length || selected.length >= count) continue;
        const q = questions.shift();
        const options = shuffled(q.options,random).map(o=>({...o}));
        selected.push({...q, fp:fingerprint(q), unitId:unit.id, unitTitle:unit.title, unitTitleEn:unit.titleEn, level:unit.level, domain:unit.domain,
          options, ans:options.findIndex(o=>o.id===q.correctOptionId), why:[...q.why]});
      }
    }
    return selected;
  }
  function progress(bank, state, level) {
    const ledger = state.ledger?.items || {};
    return bank.units.filter(u=>!level || u.level===level).map(u=>{
      const rows = u.qs.map(q=>({q,item:ledger[fingerprint(q)]}));
      return {...u, seen:rows.filter(x=>x.item).length, review:rows.filter(x=>isWrong(x.item)).length,
        answered:rows.reduce((n,x)=>n+(x.item?.ok||0)+(x.item?.no||0),0),
        correct:rows.reduce((n,x)=>n+(x.item?.ok||0),0)};
    });
  }
  function newId() {
    return root.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
  function validateLedger(ledger = {}) {
    const check = (ok, field) => { if(!ok) throw new Error('Invalid science ledger: '+field); };
    const attempts=ledger.scienceAttempts || {}, sessions=ledger.scienceSessions || {};
    check(object(attempts)&&object(sessions),'collections');
    for(const [id,a] of Object.entries(attempts)) {
      check(object(a)&&text(id)&&a.id===id&&text(a.questionId)&&Number.isInteger(a.revision)&&a.revision>0,'attempt identity');
      if('confidence' in a) check(['sure','unsure','unspecified'].includes(a.confidence),'confidence');
      check(a.fp===fingerprint({id:a.questionId,revision:a.revision})&&text(a.sessionId)&&text(a.unitId),'attempt reference');
      check(Array.isArray(a.optionOrder)&&a.optionOrder.length===4&&a.optionOrder.every(text)&&new Set(a.optionOrder).size===4,'option order');
      check(a.optionOrder.includes(a.selectedOptionId)&&a.optionOrder.includes(a.correctOptionId)&&typeof a.ok==='boolean'&&a.ok===(a.selectedOptionId===a.correctOptionId),'answer');
      check(text(a.answeredAt)&&Number.isFinite(Date.parse(a.answeredAt))&&/^\d{4}-\d{2}-\d{2}$/.test(a.day),'time');
      check(object(sessions[a.sessionId])&&sessions[a.sessionId].answers?.[a.fp]===id,'orphan attempt');
    }
    for(const [id,session] of Object.entries(sessions)) {
      check(text(id)&&object(session)&&typeof session.completed==='boolean'&&object(session.answers),'session');
      check(Array.isArray(session.questionFps)&&session.questionFps.length>0&&session.questionFps.every(fp=>typeof fp==='string'&&/^s:.+:r[1-9]\d*$/.test(fp))&&new Set(session.questionFps).size===session.questionFps.length,'question list');
      for(const [fp,eventId] of Object.entries(session.answers)) {
        const a=attempts[eventId];
        check(session.questionFps.includes(fp)&&text(eventId)&&object(a)&&a.sessionId===id&&a.fp===fp,'session answer');
      }
      if('archived' in session) check(typeof session.archived==='boolean','archived');
      if('optionOrders' in session) check(object(session.optionOrders)&&Object.entries(session.optionOrders).every(([fp,ids])=>session.questionFps.includes(fp)&&Array.isArray(ids)&&ids.length===4&&ids.every(text)&&new Set(ids).size===4),'saved option order');
      check(!session.completed || Object.keys(session.answers).length===session.questionFps.length,'incomplete completed session');
    }
    return true;
  }
  function begin(state, sessionId, qs) {
    state.ledger.scienceSessions ||= {};
    if(state.ledger.scienceSessions[sessionId]) return;
    if(!qs.length || new Set(qs.map(q=>q.fp)).size!==qs.length) throw new Error('Invalid science round');
    state.ledger.scienceSessions[sessionId]={questionFps:qs.map(q=>q.fp),answers:{},completed:false,archived:false,createdAt:new Date().toISOString(),optionOrders:Object.fromEntries(qs.map(q=>[q.fp,q.options.map(o=>o.id)]))};
  }
  function archive(state, sessionId, archived) {
    const session=state.ledger.scienceSessions?.[sessionId];
    if(session && !session.completed) session.archived=!!archived;
  }
  // Record each answer immediately; retrying the same event/session-question is idempotent.
  function record(state, event, question, sessionId, questionFps, day) {
    if (event.questionId !== question.id || event.revision !== question.revision ||
        !question.options.some(o=>o.id===event.selectedOptionId)) throw new Error('Invalid science answer');
    state.ledger.scienceAttempts ||= {};
    state.ledger.scienceSessions ||= {};
    const sessions = state.ledger.scienceSessions;
    const session = sessions[sessionId] ||= {questionFps:[...questionFps], answers:{}, completed:false};
    const fp = fingerprint(question);
    if (!session.questionFps.includes(fp) || new Set(session.questionFps).size !== session.questionFps.length) throw new Error('Invalid science session');
    if (session.completed || state.ledger.scienceAttempts[event.id] || session.answers[fp]) return null;
    const answer = {id:event.id, questionId:question.id, revision:question.revision, fp, unitId:question.unitId,
      selectedOptionId:event.selectedOptionId, correctOptionId:question.correctOptionId,
      optionOrder:question.options.map(o=>o.id), ok:event.selectedOptionId===question.correctOptionId,
      sessionId, day, answeredAt:event.answeredAt, confidence:event.confidence || "unspecified"};
    state.ledger.scienceAttempts[event.id] = answer;
    session.answers[fp] = event.id;
    return answer;
  }
  // Resolve only exact current revisions; stale or inconsistent rounds remain historical.
  function resumable(bank, state, level, includeArchived = false) {
    const questions = new Map(bank.units.flatMap(u=>u.qs.map(q=>[fingerprint(q),
      {...q,fp:fingerprint(q),unitId:u.id,unitTitle:u.title,unitTitleEn:u.titleEn,level:u.level,domain:u.domain}])));
    return Object.entries(state.ledger?.scienceSessions || {}).flatMap(([sessionId,session])=>{
      if(session.completed || (!includeArchived && session.archived) || !session.questionFps.length || new Set(session.questionFps).size!==session.questionFps.length) return [];
      const qs=session.questionFps.map(fp=>questions.get(fp));
      if(qs.some(q=>!q || (level && q.level!==level))) return [];
      const answers={};
      for(const [fp,id] of Object.entries(session.answers)) {
        const a=state.ledger.scienceAttempts?.[id], q=questions.get(fp);
        if(!session.questionFps.includes(fp) || !a || a.sessionId!==sessionId || a.fp!==fp ||
          a.questionId!==q.id || a.revision!==q.revision || a.correctOptionId!==q.correctOptionId ||
          !q.options.some(o=>o.id===a.selectedOptionId) || a.ok!==(a.selectedOptionId===q.correctOptionId)) return [];
        answers[fp]=a;
      }

      return [{sessionId,answers,archived:!!session.archived,qs:qs.map(q=>{
        const order=session.optionOrders?.[q.fp];
        const options=order && order.length===q.options.length && new Set(order).size===q.options.length && order.every(id=>q.options.some(o=>o.id===id))
          ? order.map(id=>({...q.options.find(o=>o.id===id)})) : shuffled(q.options).map(o=>({...o}));
        return {...q,options,ans:options.findIndex(o=>o.id===q.correctOptionId)};
      })}];
    });
  }
  function complete(state, sessionId) {
    const session = state.ledger.scienceSessions?.[sessionId];
    if (!session || session.completed || !session.questionFps.length) return null;
    const answers = session.questionFps.map(fp=>state.ledger.scienceAttempts?.[session.answers[fp]]);
    if (new Set(session.questionFps).size!==session.questionFps.length || answers.some((a,i)=>!a || a.sessionId!==sessionId || a.fp!==session.questionFps[i] || a.ok!==(a.selectedOptionId===a.correctOptionId))) return null;
    session.completed = true;
    return {score:answers.filter(a=>a.ok).length,total:answers.length};
  }
  function report(bank,state) {
    const lines=['自然科學習紀錄', '題庫：'+bank.version,'這是作答紀錄，不是能力認證；未測單元不推算掌握。',''];
    for(const u of progress(bank,state)) {
      lines.push(`L${u.level} · ${domains[u.domain]} · ${u.title}`,`目標：${u.objective}`,`已作答 ${u.seen}/${u.qs.length} 題；答對 ${u.correct}/${u.answered} 次；待復習 ${u.review} 題。`,'');
    }
    lines.push('已保存的作答明細（包括歷史版本）');
    for(const a of Object.values(state.ledger?.scienceAttempts||{})) lines.push(`${a.answeredAt} | ${a.fp} | 選 ${a.selectedOptionId} | 正解 ${a.correctOptionId} | ${a.ok?'答對':'答錯'} | ${a.confidence==='unsure'?'不確定':a.confidence==='sure'?'有把握':'未標示把握度'}`);
    return lines.join('\n');
  }
  const api = {domains,validateBank,fingerprint,shuffled,generate,progress,newId,record,complete,resumable,validateLedger,begin,archive,report};
  root.Science = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
