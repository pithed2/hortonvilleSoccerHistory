const {test} = require('node:test');
const assert = require('node:assert/strict');
const {assess} = require('../public/recruiting/fit-assessment.js');
const base = {soccer:['varsity'],feedback:['none'],competition:['national'],matchrole:['regular'],film:['full'],interest:['generic'],time:['major'],position:['forward']};
const titles = result => result.cards.map(c=>c[0]).join('\n');
test('national competition alone leaves D1 as a stretch and flags generic emails',()=>{
 const r=assess(base);assert.match(titles(r),/Start researching D2, D3 and NAIA/);assert.match(titles(r),/D1 is a stretch/);assert.match(titles(r),/Mailing lists/);
});
test('specific coach assessment takes precedence over broad league labels',()=>{
 const r=assess({...base,competition:['local'],feedback:['specific'],coachlevel:['d3','naia']});
 assert.match(r.cards[0][1],/NCAA D3, NAIA/);assert.doesNotMatch(titles(r),/Start researching D2/);
});
test('unsupported coach level selection is not treated as an assessment',()=>{
 const r=assess({...base,competition:['highschool'],coachlevel:['d1']});assert.match(titles(r),/Get a soccer assessment/);assert.doesNotMatch(titles(r),/Start with the programs your coach/);
});
test('regional meaningful minutes yields a broader practical range',()=>{
 const r=assess({...base,competition:['regional']});assert.match(titles(r),/Start with D3, NAIA and junior-college/);assert.match(titles(r),/D2 and D1 as stretch/);
});
test('limited minutes and missing film require assessment and evidence',()=>{
 const r=assess({...base,matchrole:['limited'],film:['none']});assert.match(titles(r),/Get a soccer assessment/);assert.ok(r.tasks.some(t=>t.startsWith('Film:')));
});
test('an offer is a program-specific lead, not a division-wide guarantee',()=>{
 const r=assess({...base,interest:['offer']});assert.match(titles(r),/specific program making an offer/);assert.ok(r.cards.some(c=>c[1].includes('not every team in its division')));
});
test('club-only choice ignores old athletic answers after editing',()=>{
 const r=assess({...base,soccer:['club'],feedback:['specific'],coachlevel:['d1'],interest:['offer']});assert.match(titles(r),/then check club soccer/);assert.doesNotMatch(titles(r),/D1 is a stretch|specific program making an offer|coach can back up/);assert.equal(r.tasks.length,0);
});
test('unknown answers do not produce a confident range or guaranteed roster',()=>{
 const r=assess({soccer:['unsure']});assert.match(titles(r),/Get a soccer assessment/);assert.ok(r.cards.some(c=>c[1].includes('None of those labels means an easy roster place')));
});
