(() => {
  'use strict';
  const root = document.getElementById('posture-flow');
  if (!root) return;
  let health = null;

  // Display individual illustration panels from the original uploads without modifying them.
  const crops = { s1: ['standing', 24, 274, 264, 360], s2: ['standing', 302, 274, 251, 360], s3: ['standing', 566, 274, 257, 360], d1: ['movement', 24, 200, 345, 239], d2: ['movement', 390, 200, 339, 239], d3: ['movement', 749, 200, 350, 239], d4: ['movement', 25, 569, 347, 239], d5: ['movement', 390, 569, 339, 239], d6: ['movement', 749, 569, 350, 239] };
  const pictureMap = { standing: ['s1', 's2', 's3'], feet: ['d1', 'd2'], knees: ['d1', 'd3'], trunk: ['d1', 'd5', 'd4'], arms: ['d1', 'd6'] };
  function picture(key) {
    const [sheet, x, y, w, h] = crops[key];
    return '<span class="posture-crop" style="aspect-ratio:' + w + '/' + h + '"><img alt="" aria-hidden="true" src="assets/images/posture_assessment/posture-' + sheet + '.png" style="width:' + (1122 / w * 100) + '%;height:' + (1402 / h * 100) + '%;left:' + (-x / w * 100) + '%;top:' + (-y / h * 100) + '%"></span>';
  }
  function field(name, title, choices) {
    const withPictures = !!pictureMap[name];
    return '<fieldset><legend>' + title + '</legend><div class="' + (withPictures ? 'posture-choices' : 'choice-list') + '">' +
      choices.map((v, i) => '<label class="' + (withPictures ? 'posture-choice' : 'choice-line') + '"><input required type="radio" name="' + name + '" value="' + i + '"><span class="posture-choice-content">' + (withPictures ? (pictureMap[name][i] ? picture(pictureMap[name][i]) : '') : '') + '<span>' + v + '</span></span></label>').join('') +
      '</div></fieldset>';
  }
  const actions = (label) => '<div class="btn-row" style="margin-top:28px;"><button class="btn btn-primary" type="submit">' + label + '</button><button class="btn btn-secondary" type="button" data-back>Back to starting point</button></div>';

  function back() { window.location.href = 'index.html#posture-teaser'; }

  function render(html, submit) {
    root.innerHTML = html;
    root.classList.remove('hidden');
    const form = root.querySelector('form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); submit(new FormData(form)); });
    const backBtn = root.querySelector('[data-back]');
    if (backBtn) backBtn.addEventListener('click', back);
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function healthScreen() {
    render(
      '<h3>Step 1 · Health history &amp; exercise readiness</h3>' +
      '<p class="text-muted">Help us identify precautions before the posture check. This adult preview is not a diagnosis, medical clearance, or a validated screening questionnaire. Answers stay in this visit and are not sent or saved.</p>' +
      '<form class="selfcheck">' +
      field('symptoms', 'Any concerning symptoms?', ['None of the symptoms below', 'Chest pain/pressure, severe breathlessness at rest, or fainting happening now', 'Recent or unexplained chest discomfort, breathlessness with mild activity, fainting/dizziness, or palpitations', 'Not sure']) +
      field('history', 'Have you been told you have a chronic health condition?', ['No known chronic conditions', 'Yes — select all that apply below', 'Not sure', 'Prefer not to say']) +
      '<fieldset><legend>Conditions — select all that apply</legend><div class="choice-list">' + window.FitakhaHealth.conditions.map((label, i) => '<label class="choice-line"><input type="checkbox" name="conditions" value="' + i + '"><span>' + label + '</span></label>').join('') + '</div></fieldset>' +
      field('control', 'If you have a condition, what is its current status?', ['Not applicable', 'Stable / managed according to my clinician', 'New, worsening, or not well controlled', 'Not sure']) +
      field('restrictions', 'Any current exercise restrictions, pain affecting movement, or recent injury, fracture, or surgery?', ['No', 'Yes', 'Not sure']) +
      field('medication', 'Do medicines affect your heart rate, blood pressure, blood sugar, balance, or exercise tolerance?', ['No / none known', 'Yes', 'Not sure']) +
      field('guidance', 'Do you have current professional guidance for exercising with your conditions or medication effects?', ['Not applicable', 'Yes — symptoms and treatment have not changed', 'No / not sure']) +
      field('fracture', 'Bone health: previous fragility or spinal fracture, or known high fracture risk?', ['No / not applicable', 'Yes', 'Not sure']) +
      field('smoking', 'Smoking history', ['Never smoked', 'Former smoker', 'Current smoker', 'Prefer not to say']) +
      field('vaping', 'Do you currently vape?', ['No', 'Yes', 'Prefer not to say']) +
      field('activity', 'Your recent exercise pattern', ['Not exercising regularly', 'Exercising regularly for at least 3 months', 'Not sure']) +
      field('intensity', 'What exercise intensity are you considering?', ['Light / easy', 'Moderate', 'Vigorous / strenuous', 'Not sure']) +
      '<p class="small text-muted">A condition or smoking history does not automatically mean exercise is unsuitable. The type, intensity, symptoms, and individual clinical advice matter. Please do not include medical details in a general contact email.</p>' +
      '<p id="health-error" class="small" role="alert" style="color:var(--orange-600); font-weight:600;"></p>' +
      actions('Continue') + '</form>' +
      '<button class="btn btn-secondary" type="button" data-decline style="margin-top:18px">Prefer not to complete health screening</button>',
      data => {
        const h = Object.fromEntries(data.entries());
        h.conditions = data.getAll('conditions');
        const error = root.querySelector('#health-error');
        if (h.history === '1' && !h.conditions.length) { error.textContent = 'Please select at least one condition, or change your health-history answer.'; return; }
        if (h.history !== '1' && h.conditions.length) { error.textContent = 'You selected a condition. Please choose "Yes" under health history or uncheck the conditions.'; return; }
        if (h.history === '1' && h.control === '0') { error.textContent = 'Please choose the current status of your condition(s).'; return; }
        if (h.history === '0' && h.control !== '0') { error.textContent = 'Please choose "Not applicable" for condition status, or update your health history.'; return; }
        health = h;
        const route = window.FitakhaHealth.route(h);
        if (route === 'continue') safety(); else healthReview(route);
      }
    );
    root.querySelector('[data-decline]').onclick = () => { health = null; healthReview('incomplete'); };
    const form = root.querySelector('form');
    if (health) {
      for (const input of form.querySelectorAll('input')) {
        input.checked = input.name === 'conditions' ? health.conditions.includes(input.value) : health[input.name] === input.value;
      }
    }
    form.addEventListener('change', e => {
      if (e.target.name === 'symptoms' && e.target.value === '1') { health = null; healthReview('urgent'); }
    });
  }

  function healthReview(route) {
    const urgent = route === 'urgent', incomplete = route === 'incomplete';
    const title = urgent ? 'Stop the assessment and seek urgent help' : incomplete ? 'Health screening not completed' : 'Your next step: individual review';
    const message = urgent ? 'If chest pain, severe breathlessness at rest, or fainting is happening now, call 911 in the U.S. or your local emergency number. Do not continue exercising or wait for a reply from Fitakha.' :
      incomplete ? 'You can keep exploring the site. We cannot check suitability without these answers, so this flow will not offer a movement test or exercise suggestions.' :
      route === 'pause' ? 'Pause the movement test and discuss symptoms, restrictions, or uncertainty with a healthcare professional before starting or resuming exercise.' :
      'This combination needs a more specific exercise plan than the starter rules can provide. Continue an existing clinician-approved plan within its limits, if you have one; ask your healthcare professional or qualified exercise specialist before starting something new. Your condition does not mean all exercise is unsuitable.';
    const bannerClass = urgent ? 'stop' : incomplete ? 'info' : 'warn';
    const icon = urgent ? '⛔' : incomplete ? 'ℹ️' : '⚠️';
    render(
      '<div class="banner ' + bannerClass + '"><div class="icon">' + icon + '</div><div><h4>' + title + '</h4><p>' + message + '</p></div></div>' +
      '<div id="health-summary" class="small text-muted"></div>' +
      '<div class="btn-row" style="margin-top:20px;"><button class="btn btn-secondary" type="button" data-health-edit>Review my answers</button><a class="btn btn-primary" href="index.html">Explore Fitakha</a></div>' +
      '<p class="small text-muted" style="margin-top:14px;">Fitakha contact is not a medical or emergency service.</p>',
      () => {}
    );
    if (health) root.querySelector('#health-summary').textContent = window.FitakhaHealth.summary(health);
    root.querySelector('[data-health-edit]').onclick = healthScreen;
  }

  function safety() {
    render(
      '<h3>Step 2 · Posture &amp; movement self-check</h3>' +
      '<p class="text-muted">Notice patterns, without labelling your body as "good" or "bad." This is a self-observation guide, not a professional assessment or medical clearance.</p>' +
      '<form class="selfcheck">' +
      field('safety', 'Before you begin: do any of these apply?', ['No current pain, dizziness, injury concerns, or restrictions affecting movement', 'I have pain, dizziness, numbness/tingling, a recent injury/surgery, or a restriction on exercise', 'I’m not sure whether movement is appropriate for me']) +
      actions('Continue') + '</form>' +
      '<button type="button" class="btn btn-secondary" data-skip style="margin-top:18px">Skip the self-check</button>',
      data => { if (data.get('safety') === '0') observe(); else refer(); }
    );
    root.querySelector('[data-skip]').onclick = () => recommend(null);
  }

  function refer() {
    render(
      '<div class="banner stop"><div class="icon">⛔</div><div><h4>Let’s get the right guidance first.</h4><p>Pause the movement check and speak with a qualified healthcare professional about these symptoms or restrictions before choosing exercises. We won’t show exercise suggestions from this self-check.</p><p>If symptoms are sudden or severe, seek prompt medical help.</p></div></div>' +
      '<div class="btn-row" style="margin-top:20px;"><button type="button" class="btn btn-secondary" data-change>Change my answers</button><a class="btn btn-primary" href="contact.html">Contact Fitakha</a></div>',
      () => {}
    );
    root.querySelector('[data-change]').onclick = safety;
  }

  function observe() {
    const boneNote = health && health.conditions.includes('5')
      ? '<div class="banner warn"><div class="icon">⚠️</div><div><h4>Bone-health modification</h4><p>Use familiar observations or choose "did not try"; do not perform the pictured deep overhead squat for this self-check. Keep the spine comfortably neutral and use stable support.</p></div></div>'
      : '';
    render(
      boneNote +
      '<h3>Pick the picture closest to what you notice.</h3>' +
      '<p class="text-muted">Stand naturally in a clear, well-lit space. A mirror or a helper can make observations easier. Don’t force a position. Choose "not sure" whenever you cannot tell.</p>' +
      '<form class="selfcheck">' +
      field('standing', 'Standing: what do you notice from the side?', ['Head and shoulders appear comfortably stacked', 'Head appears forward of the shoulders', 'Shoulders appear rounded forward', 'Not sure / skip']) +
      field('movement', 'Optional movement: how did it feel?', ['Comfortable to observe', 'Pain, dizziness, or other concerning symptoms appeared', 'I prefer to skip movement']) +
      '<p class="small text-muted">Only if comfortable: try a few slow, shallow bodyweight squats near a stable support. Keep to an easy range. If comfortable raising your arms overhead, you may observe them too. Stop immediately for pain, dizziness, numbness, or tingling. Use the pictures as rough visual cues, not exact positions to copy. No bar or weights are needed; do not copy the deep squat shown. Body proportions and comfortable movement vary. A modified self-check is not a standardized overhead squat assessment.</p>' +
      field('feet', 'During the squat, what did you notice at the feet?', ['No obvious outward turning as I lowered', 'My feet appeared to turn outward as I lowered', 'Not sure / did not try']) +
      field('knees', 'During the squat, what did you notice at the knees?', ['They appeared to follow the direction of my feet', 'They appeared to move inward', 'Not sure / did not try']) +
      field('trunk', 'From the side, what did you notice?', ['No obvious change that I could see', 'My lower back appeared to arch more', 'My torso leaned farther forward than expected', 'Not sure / did not try']) +
      field('arms', 'If you raised your arms, what did you notice?', ['They stayed comfortably overhead', 'They moved forward as I lowered', 'Not sure / did not try']) +
      '<p class="small text-muted">No photos or video are uploaded. These observations stay in this visit.</p>' +
      actions('See my adapted options') + '</form>' +
      '<p class="small text-muted" style="margin-top:14px;">Fitakha illustrations are visual learning aids, not diagnostic images. More than one pattern can occur; choose the closest match for each question.</p>',
      data => { if (data.get('movement') === '1') refer(); else recommend(Object.fromEntries(data.entries())); }
    );
  }

  function recommend(observations) {
    if (!health || window.FitakhaHealth.route(health) !== 'continue') { healthReview('incomplete'); return; }
    let html = '<div style="border-bottom:1px solid var(--border); margin-bottom:18px; padding-bottom:16px;"><h3>Your posture self-check</h3>';
    if (!observations) {
      html += '<p class="text-muted">Skipped. The options below are general starting guidance based on your health history alone.</p>';
    } else {
      const labels = { standing: ['Comfortably stacked', 'Head forward', 'Shoulders rounded', 'Not sure'], feet: ['No outward turning observed', 'Feet turn outward', 'Not observed'], knees: ['Knees follow feet', 'Knees move inward', 'Not observed'], trunk: ['No obvious change', 'Increased back arch', 'Forward lean', 'Not observed'], arms: ['Arms overhead', 'Arms move forward', 'Not observed'] };
      const lines = ['Standing: ' + labels.standing[observations.standing]];
      if (observations.movement === '2') lines.push('Movement check skipped');
      else for (const k of ['feet', 'knees', 'trunk', 'arms']) lines.push(k + ': ' + labels[k][observations[k]]);
      html += '<p class="text-muted">' + lines.join(' &middot; ') + '. Self-reported observations cannot identify a diagnosis or prove a muscle imbalance.</p>';
    }
    html += '<button class="btn btn-secondary btn-sm" type="button" data-revisit>Revisit my self-check</button> ';
    html += '<p class="small text-muted" style="margin-top:14px;">' + window.FitakhaHealth.summary(health) + '. Your answers have been considered by the starter rules; this is not medical clearance. Smoking alone does not automatically block this educational flow.</p>';
    html += '<button class="btn btn-secondary btn-sm" type="button" data-review-health>Review health history</button></div>';
    html += window.FitakhaPlan.render(health, observations);
    html += '<div class="card" style="margin-top:28px; background:var(--surface-alt);"><h3>Ready for a more personal journey?</h3><p class="text-muted">Explore the planned Fitakha account experience for personalized programs and progress tracking.</p><a class="btn btn-primary" href="account.html">Log in / Register</a><p class="small text-muted" style="margin-top:10px;">Fitakha registration and cross-device tracking are coming soon.</p></div>';
    root.innerHTML = html;
    root.querySelector('[data-revisit]').onclick = safety;
    root.querySelector('[data-review-health]').onclick = healthScreen;
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  healthScreen();
})();
