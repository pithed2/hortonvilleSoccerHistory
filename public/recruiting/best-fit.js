/* Original HHS fit guide. School priorities and athletic evidence shape research. */
(() => {
  const questions = [
    {id:'study',title:"What would you like to learn or do for a living?",help:"You don't need a career picked out. Tell us what classes you enjoy, what work interests you, or what you still want to explore.",text:true},
    {id:'budget',title:"What can your family realistically spend on college each year?",help:"If you haven't worked this out together, that's a good place to start. Think about the whole bill after grants and scholarships, including housing. Borrowing isn't a price reduction.",options:[['set',"We've set a yearly amount we can work with."],['talk',"We've started talking about costs, but don't have a firm number."],['unknown',"We still need to sit down and work through the budget."]],notes:"You can note a rough yearly limit here. Leave out income, account information and other private details."},
    {id:'school',title:"What would make a campus feel like a place you belong?",help:"Picture an ordinary week there. How far from home would you go? Would you enjoy a big campus, a smaller school, a city or a quieter town?",text:true},
    {id:'without',title:"Does the school you attend matter to you?",help:"At any point, an injury could happen, your role could change, or life could take soccer out of the equation. Would you still be OK attending that school?",options:[['yes',"Yes. I'd want to be there even without soccer."],['depends',"I'm not sure. I need to think about what else I'd want from the school."],['play',"Soccer comes first for me, even if the school wouldn't be my first choice."]]},
    {id:'soccer',title:"How would you like to keep playing after high school?",help:"Choose the options you'd actually consider. Varsity, reserves and student-run club teams can offer very different experiences. Club can still involve tryouts, travel and dues.",multiple:true,options:[['varsity',"A varsity roster and the commitment that comes with it."],['reserve',"A reserve or JV team with worthwhile training and real matches."],['club',"A college club team at a school I want to attend."],['unsure',"I'm not sure yet."]]},
    {id:'time',title:"What else do you want room for during college?",help:"Practices, lifting, meetings and trips take time. Think about your classes, a job, friends and anything else you want college to include.",options:[['major',"I'm willing to plan much of my week around soccer and classes."],['balance',"I want to keep playing without soccer taking up most of my free time."],['unknown',"I'd need to hear what a normal week looks like before deciding."]]},
    {id:'feedback',title:"Has a coach helped you figure out where your game could fit?",help:"Think about someone who's watched you play recently. 'You can play in college' is encouragement. Naming teams and explaining how you compare is more useful.",options:[['specific',"A coach has named college programs and explained what makes them a fit."],['general',"Coaches have been encouraging, but we haven't discussed actual programs."],['none',"I haven't had that conversation with a coach yet."]],notes:"What was the advice? Note any schools mentioned and what your coach thinks you need to improve."},
    {id:'role',title:"How would you feel about earning a roster spot but spending matches on the bench?",help:"It happens, especially early on. Think about whether the training and development would still be worth it to you, and what you'd need to know before committing.",options:[['develop',"I'd consider it if I understood the plan to help me improve and earn a role."],['minutes',"I'd prefer a team where I have a realistic chance to compete for match time."],['unknown',"I'd need more detail about my role before I could answer."]]},
    {id:'priorities',title:"What would put a school on your list, or take it off?",help:"Separate what you need from what would be nice. Then list anything you couldn't live with and the questions you haven't answered. Use the headings Must-haves, Preferences, Dealbreakers and Unknowns.",text:true},
    {id:'competition',athletic:true,title:"Who are you playing against outside the high school season?",help:"Describe your own team's schedule, rather than the strongest team your club runs. Pick the closest description. If you aren't sure, name the league in your notes so your coach can help.",options:[['national','A national club or academy platform, such as MLS NEXT or ECNL.'],['regional','Regional-level club leagues and tournaments.'],['local','Mostly local club competition.'],['highschool','High school only, or no current club team.'],['unknown',"I'm not sure how to describe it."]],notes:'What team and league do you play in? Add recent tournaments if useful.'},
    {id:'matchrole',athletic:true,title:"When those matches get competitive, how much are you involved?",help:"Use your recent season as a whole. Think about the minutes you actually get and what your coach has said about your contribution.",options:[['impact',"I play substantial minutes and my coach identifies me as one of the team's strongest players."],['regular','I play regular, meaningful minutes.'],['rotation','I rotate in and get some meaningful minutes.'],['limited','I get little match time or am still working toward a regular role.'],['unknown',"I'm not sure how my coach would assess my role."]]},
    {id:'coachlevel',athletic:true,title:"Where has your coach told you to start looking?",help:"Select the groups your coach connected to actual programs that could fit your game. This should build on the coach conversation you described earlier. Leave it undecided if the advice was just general encouragement.",multiple:true,options:[['d1','NCAA D1'],['d2','NCAA D2'],['d3','NCAA D3'],['naia','NAIA'],['juco','Junior college'],['unsure','No specific level or program assessment yet.']]},
    {id:'film',athletic:true,title:"If a coach asked for video today, what could you send?",help:"A highlight reel can get a conversation started. A recent full match lets a coach see your decisions, movement and work when you don't have the ball.",options:[['full','Recent full-match film, with me clearly identified.'],['highlights','Highlights or short clips, but no recent full match.'],['none','No usable film yet.']]},
    {id:'interest',athletic:true,title:"What's actually happened in your conversations with college programs?",help:"Pick the furthest you've gotten with a college staff. Separate a coach discussing your game from a school inviting everyone to a camp. A recruiting service's opinion isn't an offer from a team.",options:[['offer','A specific program has offered me a roster place or an aid agreement.'],['evaluated','A college coach watched my game or film and discussed my play and recruiting year.'],['personal','A personal reply, but no clear discussion of my play yet.'],['generic','General camp invitations, questionnaires or mailing-list emails.'],['none','No contact yet, or no replies.']],notes:'If useful, name the program, your entering year and what the coach actually said. Leave out private contact details.'},
    {id:'position',athletic:true,title:"What role would you want a college coach to consider you for?",help:"Choose your main position for now. When you research a team, look at who's returning in that role and how the coach uses those players. You can talk through other positions with your coach.",options:[['keeper','Goalkeeper'],['defender','Defender'],['midfielder','Midfielder'],['forward','Forward'],['unknown',"I'm still figuring that out."]]}
  ];
  let index=0;
  const answers=questions.map(() => ({values:[],notes:''}));
  const form=document.getElementById('fit-form'),results=document.getElementById('results'),area=document.getElementById('question');
  const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  function activeQuestions(){const soccer=value('soccer');return questions.map((q,i)=>i).filter(i=>!questions[i].athletic||soccer.some(v=>['varsity','reserve','unsure'].includes(v)));}
  function save(){answers[index]={values:Array.from(area.querySelectorAll('input:checked')).map(n=>n.value),notes:area.querySelector('textarea')?.value.trim()||''};}
  function ready(){const q=questions[index],a=answers[index];return q.text?!!a.notes:a.values.length>0;}
  function draw(focus=false){
    const q=questions[index],a=answers[index];area.replaceChildren();
    const field=el('fieldset'),legend=el('legend',q.title);legend.id='question-title';legend.tabIndex=-1;field.append(legend);
    const help=el('p',q.help);help.className='help';help.id='question-help';field.append(help);
    if(q.options)q.options.forEach(([value,label])=>{
      const wrap=el('label');wrap.className='option';const input=el('input');input.type=q.multiple?'checkbox':'radio';input.name=q.id;input.value=value;input.checked=a.values.includes(value);input.setAttribute('aria-describedby','question-help');
      input.addEventListener('change',()=>{
        if(q.multiple){const checked=area.querySelectorAll('input:checked');if(value==='unsure'&&input.checked){checked.forEach(n=>{if(n!==input)n.checked=false;});}else if(input.checked){area.querySelector('input[value="unsure"]').checked=false;}}
        save();document.getElementById('next').disabled=!ready();
      });wrap.append(input,el('span',label));field.append(wrap);
    });
    if(q.text||q.notes){const label=el('label',q.notes||'Your notes');label.className='notes';label.htmlFor='notes';const text=el('textarea');text.id='notes';text.maxLength=2500;text.value=a.notes;text.setAttribute('aria-describedby','question-help');text.addEventListener('input',()=>{save();document.getElementById('next').disabled=!ready();});field.append(label,text);}
    const active=activeQuestions(),step=active.indexOf(index)+1;
    area.append(field);document.getElementById('progress').textContent=`${q.athletic?'Soccer evidence':'School and soccer priorities'}: question ${step} of ${active.length}`;document.getElementById('progress-bar').max=active.length;document.getElementById('progress-bar').value=step;document.getElementById('back').disabled=index===0;
    document.getElementById('next').textContent=index===active[active.length-1]?'See my plan':'Next';document.getElementById('next').disabled=!ready();if(focus)legend.focus();
  }
  function value(id){return answers[questions.findIndex(q=>q.id===id)].values;}
  function plan(){
    const routes=[],tasks=[];const soccer=value('soccer');
    const assessment=window.HHSFitAssessment.assess(Object.fromEntries(questions.map(q=>[q.id,value(q.id)])));
    routes.push(...assessment.cards);tasks.push(...assessment.tasks);
    if(!value('budget').includes('set'))tasks.push('Parents: agree on a yearly budget and borrowing limit before getting attached to a school.');
    else tasks.push('Parents: check school costs with the net price calculator, then compare written aid offers. Leave hoped-for athletic aid out of the budget.');
    if(!value('without').includes('yes'))tasks.push("Family: talk about which school trade-offs I'm willing to make if soccer's my biggest priority. What happens if I don't play?");
    if(!value('time').includes('major'))tasks.push('Current players: show me a normal week, including travel and classes. Would that leave room for what I want?');
    tasks.push('Me: use my must-haves to make a starting school list. Check the major, campus and unanswered questions on official school pages.');
    return {routes,tasks};
  }
  function summary(){return activeQuestions().map(i=>{const q=questions[i],a=answers[i],labels=a.values.map(v=>q.options.find(o=>o[0]===v)[1]);return [q.title,[...labels,a.notes].filter(Boolean).join('\n')];});}
  function show(){
    save();const {routes,tasks}=plan();const paths=document.getElementById('pathways');paths.replaceChildren();routes.forEach(([title,body])=>{const article=el('article');article.append(el('h3',title),el('p',body));paths.append(article);});
    const dl=document.getElementById('answers');dl.replaceChildren();summary().forEach(([title,answer])=>dl.append(el('dt',title),el('dd',answer)));
    const ul=document.getElementById('follow-ups');ul.replaceChildren();tasks.forEach(task=>ul.append(el('li',task)));form.hidden=true;results.hidden=false;results.focus();
  }
  form.addEventListener('submit',event=>{event.preventDefault();save();if(!ready())return;const active=activeQuestions(),step=active.indexOf(index);if(step===active.length-1)show();else{index=active[step+1];draw(true);}});
  document.getElementById('back').addEventListener('click',()=>{save();const active=activeQuestions(),step=active.indexOf(index);if(step>0){index=active[step-1];draw(true);}});
  document.getElementById('edit').addEventListener('click',()=>{form.hidden=false;results.hidden=true;index=0;draw(true);});
  document.getElementById('reset').addEventListener('click',()=>{answers.forEach(a=>{a.values=[];a.notes='';});index=0;form.hidden=false;results.hidden=true;draw(true);});
  document.getElementById('print').addEventListener('click',()=>window.print());
  document.getElementById('download').addEventListener('click',()=>{
    const p=plan();const text=["HHS soccer: What's your best fit?",'',...summary().flatMap(([q,a])=>[q,a,'']),'Directions to explore',...p.routes.flatMap(([q,a])=>[q,a,'']),'Questions to settle next',...p.tasks.map(t=>'- '+t),'',"This is a research starting point based on self-reported answers, not a coach's evaluation, eligibility decision or prediction of an offer."].join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='hhs-college-fit-notes.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('status').textContent='Your notes have been downloaded.';
  });draw();
})();
