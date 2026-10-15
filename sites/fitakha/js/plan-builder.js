window.FitakhaPlan = {
  build(h, o) {
    const has = c => h.conditions.includes(c), bone = has('5'), joint = has('4'), bp = has('0');
    const notes = ['Use only comfortable, pain-free movement. Stop for chest discomfort, unusual breathlessness, dizziness, or new pain. Follow any existing clinical limits.'];
    if (bp) notes.push('Blood-pressure adaptation: easy dynamic movement, regular breathing, gradual warm-up/cool-down, and no heavy straining or breath-holding. Upright options are used here for convenience; hypertension alone is not a universal ban on lying down.');
    if (bone) notes.push('Bone-health adaptation: no self-myofascial release/foam rolling in this starter plan, no loaded or end-range spinal rounding/twisting, and no impact drills. Use stable support and a neutral spine. This conservative menu is for users with current exercise guidance and no reported fragility fracture/high fracture risk.');
    if (joint) notes.push('Joint adaptation: shorten range as needed, use chair support, and avoid loading a painful or swollen joint. Increase slowly only when symptoms tolerate it.');
    if (has('7')) notes.push('Breathing-condition adaptation: follow your existing clinician-provided action plan and use easy, short bouts.');
    if (h.medication !== '0') notes.push('Medication adaptation: use perceived effort and the talk test rather than an age-predicted heart-rate target; follow medication-specific guidance from your clinician.');
    if (h.smoking === '2' || h.vaping === '1') notes.push('Smoking/vaping is considered context, not an automatic exercise exclusion. Begin with short comfortable bouts and observe breathing tolerance.');
    const exercises = [['Easy level walking', 'Try 3–5 minutes; shorter bouts are fine.', 'Aerobic foundation; finish able to speak comfortably.'], ['Supported sit-to-stand from a higher chair', 'Try 1 set of 5–8 slow repetitions.', 'Leg strength with a comfortable range; use arm support if needed.'], ['Supported standing hip abduction', 'Try 1 set of 5–8 each side.', 'Hip control; keep the torso upright and hold stable support.']];
    const patterns = [];
    if (o && o.movement !== '2') {
      if (o.knees === '1') { patterns.push('Knees moving inward: a coach may assess adductor/TFL activity and gluteal control. Appearance alone does not establish weakness or tightness.'); notes.push('Knee-control focus: keep the sit-to-stand shallow and controlled; reduce range if the knees drift inward.'); }
      if (o.feet === '1' || o.trunk === '2') { patterns.push('Feet turning out or forward lean: a coach may assess calf/ankle mobility and trunk control. Anatomy, technique, and task depth can also explain this pattern.'); exercises.push(['Supported ankle rocks', 'Try 5–8 small controlled repetitions per side.', 'Keep the heel down and stay within an easy ankle range; no forced stretch.']); }
      if (o.trunk === '1') { patterns.push('Increasing lower-back arch: assess hip-flexor mobility and abdominal/gluteal control; this is a hypothesis, not a muscle diagnosis.'); exercises.push(['Standing abdominal brace with normal breathing', 'Try 3–5 gentle repetitions while breathing normally.', 'Avoid strong bracing, straining, or arching; this is coordination practice.']); }
      if (o.arms === '1') { patterns.push('Arms moving forward: a coach may assess lat/pectoral mobility and shoulder/scapular control.'); exercises.push(['Gentle shoulder-blade setting', 'Try 5 easy repetitions.', 'Relax the neck and gently draw shoulder blades back without arching the spine.']); }
    }
    if (o && ['1', '2'].includes(o.standing)) { patterns.push('Forward-head or rounded-shoulder observation: a coach can assess neck and chest mobility plus deep-neck and scapular control.'); if (!exercises.some(e => e[0] === 'Gentle shoulder-blade setting')) exercises.push(['Gentle shoulder-blade setting', 'Try 5 easy repetitions.', 'Keep the neck relaxed; do not force the shoulders back.']); }
    return { notes, exercises, patterns, intensity: 'Start easy: about 2–3 out of 10 perceived effort. Keep enough breath to speak full sentences. These short starter doses do not increase automatically with your chosen goal.' };
  },
  render(h, o) {
    const p = this.build(h, o);
    return '<div style="padding:8px 0">' +
      '<h3>Your adapted starting options</h3><p class="text-muted">' + p.intensity + '</p>' +
      '<p class="small text-muted">A conservative educational starting menu, not a complete clinical exercise prescription. Try only movements you can do comfortably within existing professional guidance; do not perform every item just to complete the list.</p>' +
      '<h3 style="margin-top:24px;">Why these choices?</h3><ul style="padding-left:18px; color:var(--text-muted); font-size:0.92rem;">' + p.notes.map(n => '<li style="margin-bottom:10px">' + n + '</li>').join('') + '</ul>' +
      '<div class="grid grid-2" style="margin-top:8px;">' + p.exercises.map(e => '<div class="card" style="padding:18px;"><strong>' + e[0] + '</strong><p class="small text-muted" style="margin-top:8px;">' + e[1] + ' ' + e[2] + '</p></div>').join('') + '</div>' +
      (p.patterns.length ? '<h3 style="margin-top:24px;">Possible muscle patterns to assess</h3><p class="small text-muted">Self-selected pictures cannot confirm overactive or underactive muscles. These are discussion points to guide a trained assessment.</p><ul style="padding-left:18px; color:var(--text-muted); font-size:0.92rem;">' + p.patterns.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') +
      '<div class="disclaimer-box" style="margin-top:20px;">Health precautions take priority: posture selections never add foam rolling, heavy loads, or demanding positions to this starter menu.</div>' +
      '<details style="margin-top:18px;"><summary style="cursor:pointer; font-weight:600; color:var(--navy-800);">Evidence behind the approach</summary><p class="small" style="margin-top:10px;"><a href="https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/getting-active-to-control-high-blood-pressure" target="_blank" rel="noopener">American Heart Association: activity and blood pressure</a><br><a href="https://www.osteoporosis.foundation/health-professionals/prevention/exercise/exercise-individuals-with-osteoporosis" target="_blank" rel="noopener">International Osteoporosis Foundation: exercise</a><br><a href="https://www.cdc.gov/arthritis/prevention/index.html" target="_blank" rel="noopener">CDC: physical activity and arthritis</a></p></details>' +
      '</div>';
  }
};
