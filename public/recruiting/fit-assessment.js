/* Research guidance, not an eligibility decision or a validated ability score. */
(function (root) {
  function assess(input) {
    const selected = (key, value) => (input[key] || []).includes(value);
    const varsity = selected('soccer', 'varsity') || selected('soccer', 'reserve') || selected('soccer', 'unsure');
    const cards = [], tasks = [];
    const add = (title, body) => cards.push([title, body]);
    const labels = {d1:'NCAA D1',d2:'NCAA D2',d3:'NCAA D3',naia:'NAIA',juco:'Junior college'};
    const assessed = selected('feedback', 'specific') ? (input.coachlevel || []).filter(v => labels[v]) : [];
    const highCompetition = selected('competition','national');
    const strongRole = selected('matchrole','impact') || selected('matchrole','regular');
    const regional = selected('competition','regional');
    const limited = selected('matchrole','limited') || selected('matchrole','unknown');

    if (!varsity) {
      add('Start with schools you want, then check club soccer', "You chose club rather than varsity or reserves. Put your major, cost and campus first. Check each school's club tryouts, dues and completed match schedule. Some club teams are highly competitive too.");
    } else if (assessed.length) {
      add('Start with the programs your coach can back up', `Your coach's suggested research range: ${assessed.map(v=>labels[v]).join(', ')}. That's the strongest starting point you supplied, provided they've watched you recently and compared you with actual teams. Ask for specific school names and what makes each one a fit.`);
      add('Stretch goals need their own evidence', "Keep other levels on a stretch list if you want, but don't let a division label replace a team's standards. A strong D3, D2, NAIA or junior-college team may be a tougher soccer fit than another team in a different division.");
    } else if (highCompetition && strongRole) {
      add('Start researching D2, D3 and NAIA programs', "You report national-level competition and a meaningful match role. That's a reason to research competitive programs across these groups, not proof you're ready for them. Include junior college if the school and transfer plan fit. Have your coach narrow this to actual teams.");
      add('D1 is a stretch to check with your coach', "Your reported background gives you a reason to ask about D1. It doesn't establish D1 ability. Compare full-match film with players at specific programs and ask your coach whether D1 outreach makes sense now.");
    } else if (regional && strongRole) {
      add('Start with D3, NAIA and junior-college programs', "You report regional-level club competition and regular or standout match involvement. These groups offer a broad place to begin research, but the teams vary a lot. Ask your coach which programs match your current game.");
      add('Treat D2 and D1 as stretch questions', "D2 may be worth a closer look if a coach who knows your game can point to specific teams. You haven't supplied enough evidence to make D1 your main recruiting plan. Keep it as a question to evaluate, rather than building your whole list around it.");
    } else {
      add('Get a soccer assessment before building a varsity list', limited
        ? "You report limited minutes or an unclear match role. That makes a recruiting range hard to support. Review a full match with your coach and talk about the development you need before choosing teams to contact."
        : "Your competition and match role don't give us enough evidence to narrow a varsity range. Ask your coach to compare you with actual college players and name programs worth researching. A league name or high school play alone can't establish your college level.");
      add('Keep a practical route to playing on your list', "Explore club soccer at schools you want to attend. With your coach, check whether specific D3, NAIA or junior-college programs could fit now or after more development. None of those labels means an easy roster place.");
      add('D1 and D2 need stronger evidence', "Keep those goals if they matter to you, but your answers don't yet support making them the center of your recruiting plan. Get specific feedback and improve the evidence before spending heavily on camps or outreach.");
    }

    if (varsity) {
      if (selected('interest','offer')) add('Your clearest lead is the specific program making an offer', "You report an offer. Confirm the roster role and any aid in writing, then compare the school and real cost. It gives you evidence about that program, not every team in its division. A roster place does not mean playing time.");
      else if (selected('interest','evaluated')) add('Follow up with the staff who evaluated your play', "You report a college coach discussing your game and recruiting year after watching you. Ask what the next step is and whether they need your position. That's stronger than a general email, but it isn't an offer.");
      else if (selected('interest','personal')) add('Find out whether the coach has actually watched you', "A personal reply opens a conversation. Ask what they've evaluated and whether they're recruiting your position and entering year. A reply alone doesn't establish your level.");
      else add('Mailing lists and silence don\'t establish your level', "General camp emails aren't evidence of soccer interest. No response isn't a complete evaluation either. Coaches may not be allowed to respond yet, may have filled a need or may never reply. Check the rules and seek feedback from someone who's watched you.");
      if (!selected('film','full')) tasks.push('Film: get a recent full match and a short, clearly labeled highlight video. If you only have highlights, ask your coach what they leave out.');
      if (!assessed.length) tasks.push('Coach: watch my full-match film and name a few programs that fit now, plus one or two stretch programs. Explain the gap I need to close.');
      const positions={keeper:'Goalkeeper',defender:'Defender',midfielder:'Midfielder',forward:'Forward'};
      const position=positions[(input.position||[])[0]]||'Position';
      tasks.push(`${position}: ${selected('position','unknown') ? 'ask your coach which role best fits your game, then' : 'at each school,'} check returning players, recent recruits and freshman minutes at your position. Watch a full college match to compare playing style.`);
      if (!selected('role','minutes')) tasks.push('Development: ask the college coach what training, feedback and match opportunities you would get if you rarely play.');
      tasks.push('Recruiting rules: check when coaches in each association can communicate with your entering class. Early silence is not the same as an evaluation.');
    }
    if (!selected('time','major') && varsity) tasks.push('Time: ask current players for a real weekly schedule before deciding varsity fits the college experience you want.');
    if (selected('soccer','reserve')) tasks.push('Reserves: ask how many matches were scheduled and actually played, who coaches them and how players earn a varsity look.');
    if (selected('soccer','club') && varsity) add('Keep club as a real option', "You'd consider club too. Research it alongside varsity rather than saving it for a last-minute fallback. You may find the school you want without needing a varsity roster place.");
    add('School and money still decide whether the list works', "Use your academic interests and must-haves to filter every school. Your answers haven't checked admissions requirements, academic eligibility or actual costs. Compare official school information and written aid offers. Don't assume a lower division is affordable or easier to get into.");
    return {cards, tasks};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {assess};
  else root.HHSFitAssessment = {assess};
})(typeof window !== 'undefined' ? window : {});
