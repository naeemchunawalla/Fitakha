(() => {
  'use strict';
  const root = document.getElementById('trivia');
  if (!root) return;

  const sources = {
    macro: ['National Academies · Dietary Reference Intakes', 'https://www.nationalacademies.org/read/10925/chapter/25'],
    supp: ['NIH · Exercise and athletic performance', 'https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-Consumer/'],
    activity: ['CDC · Adult activity guidelines', 'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html']
  };
  const bank = [
    ['Nutrition', 'Which adult carbohydrate range is in the Dietary Reference Intakes?', ['45–65% of daily calories', '5–10% of daily calories', '90–100% of daily calories'], 0, 'The adult AMDR is 45–65% carbohydrate, 10–35% protein, and 20–35% fat. These are general ranges, not one ideal ratio for everyone.', 'macro'],
    ['Supplements', 'Which statement about creatine is most accurate?', ['It is essential for everyone', 'It is generally safe for healthy adults, but individual circumstances matter', 'It replaces exercise'], 1, 'Creatine is well studied in healthy adults. Water-related weight gain and digestive discomfort can occur. Discuss use with a clinician, especially with medical conditions or medications.', 'supp'],
    ['Fitness foundations', 'What is the general weekly moderate aerobic activity target for adults?', ['15 minutes', '150 minutes', '600 minutes minimum'], 1, 'Aim for at least 150 minutes weekly, or 75 minutes vigorous activity, or an equivalent combination. Some movement is better than none.', 'activity'],
    ['Strength', 'How often do adult guidelines recommend muscle-strengthening activity?', ['Only once a month', 'Only when sore', 'At least 2 days a week'], 2, 'Include all major muscle groups on at least two days weekly, alongside aerobic activity.', 'activity'],
    ['Nutrition', 'Which adult fat range is in the Dietary Reference Intakes?', ['20–35% of daily calories', '0%', '70–90% for everyone'], 0, 'The adult AMDR for fat is 20–35% of energy. Personal dietary needs can differ.', 'macro'],
    ['Fitness foundations', 'Does physical activity have to happen in one long session?', ['Yes, only one continuous session counts', 'No, activity can be spread across the week', 'Only gym sessions count'], 1, 'You can spread movement through your week and break it into smaller chunks.', 'activity'],
    ['Supplements', 'Which activity is creatine most likely to help?', ['Repeated short bursts of intense effort', 'Every activity equally', 'Only gentle stretching'], 0, 'Research supports benefits for repeated high-intensity efforts such as sprinting and lifting; endurance benefits are more limited.', 'supp'],
    ['Nutrition', 'What is one major role of dietary protein?', ['Replacing sleep', 'Building and repairing muscle', 'Eliminating the need to train'], 1, 'Protein supplies amino acids used to maintain and repair muscle. Supplements are not required if food meets your needs.', 'supp'],
    ['Nutrition', 'Which adult protein range is in the Dietary Reference Intakes?', ['1–3% of daily calories', '80–100% for everyone', '10–35% of daily calories'], 2, 'The adult AMDR for protein is 10–35% of energy. An individual target also depends on total intake and personal circumstances.', 'macro'],
    ['Everyday movement', 'Which can count as moderate aerobic activity?', ['Brisk walking', 'Only running', 'Only competitive sport'], 0, 'Brisk walking is one example of moderate activity. Choose activities suited to your abilities.', 'activity'],
    ['Supplements', 'Can performance supplements replace a nutritious diet?', ['Yes, entirely', 'No', 'Only on training days'], 1, 'Supplements cannot take the place of an adequate diet. Benefits and risks vary by product and person.', 'supp'],
    ['Fitness foundations', 'What is a useful starting principle if you are below activity targets?', ['Do nothing until you can meet the whole target', 'Only intense workouts have value', 'Some activity is better than none'], 2, 'Start with what you can manage and build activity over time.', 'activity']
  ];

  const stamp = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  let day = stamp(), items = [], index = 0, answers = [], practice = false, history = {}, storageOK = true;
  try { history = JSON.parse(localStorage.getItem('fitakha-trivia-v1') || '{}'); if (!history || Array.isArray(history) || typeof history !== 'object') history = {}; } catch { storageOK = false; history = {}; }
  const valid = r => r && Array.isArray(r.answers) && r.answers.length === 5 && Number.isInteger(r.score) && r.score >= 0 && r.score <= 50;
  function selection() { const n = Math.floor(Date.parse(day + 'T12:00:00Z') / 86400000); return Array.from({ length: 5 }, (_, i) => bank[(n * 5 + i) % bank.length]); }
  function stats() {
    const today = Date.parse(day + 'T12:00:00Z'), d = new Date(today), dow = (d.getUTCDay() + 6) % 7, start = today - dow * 86400000;
    const rows = Object.entries(history).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && valid(v));
    let weekly = 0, monthly = 0;
    for (const [k, v] of rows) { const t = Date.parse(k + 'T12:00:00Z'); if (t >= start && t <= today) weekly += v.score; if (k.slice(0, 7) === day.slice(0, 7) && k <= day) monthly += v.score; }
    const el = document.getElementById('personal-stats');
    if (el) el.innerHTML = '<h3>Your learning points</h3><p class="text-muted">Today: ' + (valid(history[day]) ? history[day].score : 0) + ' / 50<br>This week: ' + weekly + '<br>This month: ' + monthly + '</p>';
  }
  function button(label, fn, primary) { const b = document.createElement('button'); b.className = primary === false ? 'btn btn-secondary' : 'btn btn-primary'; b.textContent = label; b.onclick = fn; return b; }
  function checkDate() { if (stamp() !== day) { day = stamp(); init(); return false; } return true; }
  function show() {
    if (!checkDate()) return;
    const q = items[index];
    root.innerHTML = '<p class="small text-muted">' + (practice ? 'Practice · ' : '') + 'Question ' + (index + 1) + ' of 5 · ' + q[0] + '</p><h3>' + q[1] + '</h3>';
    const box = document.createElement('div');
    box.style = 'display:grid;gap:10px';
    q[2].forEach((label, i) => {
      const b = button(label, () => {
        if (!checkDate()) return;
        answers.push(i);
        box.querySelectorAll('button').forEach(x => x.disabled = true);
        const detail = document.createElement('p');
        detail.className = 'text-muted';
        detail.textContent = (i === q[3] ? 'Correct! ' : 'The answer is: ' + q[2][q[3]] + '. ') + q[4];
        root.append(detail);
        const a = document.createElement('a');
        a.href = sources[q[5]][1]; a.textContent = sources[q[5]][0] + ' ↗'; a.target = '_blank'; a.rel = 'noopener';
        a.style = 'display:block;text-decoration:underline;margin:14px 0;font-size:0.85rem;';
        root.append(a, button(index === 4 ? 'See my score' : 'Next question', () => { index++; if (index === 5) finish(); else show(); }));
      }, false);
      b.style = 'text-align:left;justify-content:flex-start;white-space:normal;';
      box.append(b);
    });
    root.append(box);
  }
  function finish() {
    if (!checkDate()) return;
    const score = answers.reduce((sum, a, i) => sum + (a === items[i][3] ? 10 : 0), 0);
    if (!practice && !valid(history[day])) { history[day] = { score, answers }; try { localStorage.setItem('fitakha-trivia-v1', JSON.stringify(history)); } catch { storageOK = false; } }
    root.innerHTML = '<span class="eyebrow">' + (practice ? 'Practice complete' : 'Daily challenge complete') + '</span><h3>' + score + ' / 50 points</h3><p class="text-muted">' + (score === 50 ? 'Five for five! Keep that curiosity moving.' : 'Every answer is a chance to learn. Come back tomorrow for another challenge.') + '</p><p class="small text-muted">' + (practice ? 'Practice does not change your daily score.' : storageOK ? 'Your first completed score is saved in this browser.' : 'Your score is available this visit, but browser storage is unavailable.') + '</p>';
    root.append(button('Practise again', () => { practice = true; index = 0; answers = []; show(); }, false));
    stats();
  }
  function init() {
    items = selection(); index = 0; answers = []; practice = false;
    const dateEl = document.getElementById('quiz-date');
    if (dateEl) dateEl.textContent = day + ' · 5 QUESTIONS · NEW YORK TIME';
    stats();
    if (valid(history[day])) {
      root.innerHTML = '<h3>Today’s challenge is complete.</h3><p class="text-muted">Your recorded score: ' + history[day].score + ' / 50. Come back tomorrow or practise again.</p>';
      root.append(button('Practise today’s questions', () => { practice = true; show(); }, false));
    } else {
      root.innerHTML = '<h3>Build your fitness know-how.</h3><p class="text-muted">Take a few minutes to test your knowledge. Each correct answer earns 10 learning points.</p>';
      root.append(button('Start today’s quiz ↗', show));
    }
  }
  init();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDate(); });
})();
