/* =========================================================
   Fitakha — shared front-end behaviour
   No build step: plain JS, progressively enhances static HTML.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initAccordions();
  initFilterBars();
  initFindYourFit();
  initContactForm();
  initShopForm();
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = "2026";
  });
});

/* ---------------- Nav ---------------- */
function initNav() {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", function () {
    links.classList.toggle("open");
    toggle.setAttribute(
      "aria-expanded",
      links.classList.contains("open") ? "true" : "false"
    );
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("open");
    });
  });
}

/* ---------------- Accordion (FAQs) ---------------- */
function initAccordions() {
  document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".accordion-item");
      var panel = item.querySelector(".accordion-panel");
      var isOpen = item.classList.contains("open");

      // close siblings within the same accordion group for a tidy list
      var group = item.parentElement;
      if (group && group.dataset.exclusive !== "false") {
        group.querySelectorAll(".accordion-item.open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("open");
            openItem.querySelector(".accordion-panel").style.maxHeight = null;
          }
        });
      }

      item.classList.toggle("open", !isOpen);
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });
}

/* ---------------- Filter chips (Exercise Library / Programs) ---------------- */
function initFilterBars() {
  document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    var targetSelector = bar.getAttribute("data-filter-bar");
    var cards = document.querySelectorAll(targetSelector);

    bar.querySelectorAll(".filter-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var group = chip.getAttribute("data-group");
        var groupChips = bar.querySelectorAll('[data-group="' + group + '"]');
        groupChips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        applyFilters(bar, cards);
      });
    });
  });
}

function applyFilters(bar, cards) {
  var activeFilters = {};
  bar.querySelectorAll(".filter-chip.active").forEach(function (chip) {
    activeFilters[chip.getAttribute("data-group")] = chip.getAttribute("data-value");
  });

  cards.forEach(function (card) {
    var visible = true;
    Object.keys(activeFilters).forEach(function (group) {
      var value = activeFilters[group];
      if (value === "all") return;
      var cardValues = (card.getAttribute("data-" + group) || "").split(",");
      if (cardValues.indexOf(value) === -1) visible = false;
    });
    card.style.display = visible ? "" : "none";
  });

  var emptyState = bar.parentElement.querySelector("[data-empty-state]");
  if (emptyState) {
    var anyVisible = Array.prototype.some.call(cards, function (c) {
      return c.style.display !== "none";
    });
    emptyState.style.display = anyVisible ? "none" : "block";
  }
}

/* ---------------- Find Your Fit questionnaire ---------------- */
function initFindYourFit() {
  var quiz = document.getElementById("fyf-quiz");
  if (!quiz) return;

  var steps = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-step"));
  var progress = quiz.querySelectorAll(".quiz-progress span");
  var result = document.getElementById("fyf-result");
  var current = 0;
  var answers = { goal: null, experience: null, equipment: null, duration: null, redFlags: [], pain: null };

  function showStep(i) {
    steps.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
    progress.forEach(function (p, idx) { p.classList.toggle("done", idx <= i); });
    current = i;
  }

  // single-choice cards
  quiz.querySelectorAll(".choice-card[data-field]").forEach(function (card) {
    card.addEventListener("click", function () {
      var field = card.getAttribute("data-field");
      var value = card.getAttribute("data-value");
      var multi = card.classList.contains("multi");

      if (multi) {
        card.classList.toggle("selected");
        var list = answers[field] || [];
        if (card.classList.contains("selected")) {
          list.push(value);
        } else {
          list = list.filter(function (v) { return v !== value; });
        }
        answers[field] = list;
      } else {
        quiz.querySelectorAll('.choice-card[data-field="' + field + '"]').forEach(function (c) {
          c.classList.remove("selected");
        });
        card.classList.add("selected");
        answers[field] = value;
      }
    });
  });

  quiz.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (current < steps.length - 1) {
        showStep(current + 1);
      } else {
        renderResult();
      }
    });
  });
  quiz.querySelectorAll("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (current > 0) showStep(current - 1);
    });
  });

  function renderResult() {
    quiz.style.display = "none";
    result.classList.add("active");
    result.scrollIntoView({ behavior: "smooth", block: "start" });

    // --- Safety gate, mirroring Fitakha's rules library (RULE-001 / RULE-002) ---
    // Acute red-flag symptoms or severe acute pain stop automated recommendations
    // and route the visitor to a professional-review path instead of a workout.
    var hasRedFlag = answers.redFlags.indexOf("red_flag") !== -1;
    var severeAcutePain = answers.pain === "severe";

    if (hasRedFlag || severeAcutePain) {
      result.innerHTML = renderStopState();
      return;
    }

    result.innerHTML = renderRecommendation(answers);
  }

  function renderStopState() {
    return (
      '<div class="banner stop">' +
      '<div class="icon">⛔</div>' +
      "<div><h4>Let's pause before recommending a workout</h4>" +
      "<p>You flagged a symptom (such as chest pain, severe dizziness, fainting, or severe acute pain) that " +
      "Fitakha treats as a safety stop. We don't generate an automated workout in this situation &mdash; " +
      "please seek appropriate medical evaluation first, or " +
      '<a href="find-an-expert.html">talk to a coach</a> once you have been cleared.</p></div></div>' +
      '<div class="btn-row" style="margin-top:20px;">' +
      '<a class="btn btn-secondary" href="find-your-fit.html">Start over</a>' +
      '<a class="btn btn-primary" href="contact.html">Contact Fitakha</a>' +
      "</div>"
    );
  }

  var PROGRAM_MAP = {
    weight_loss: { name: "Full-Body Metabolic Foundations", why: "Weight-management goals do best with sustainable full-body resistance training plus cardiorespiratory work, calibrated to your experience and time.", tags: ["Weight loss", "Full body"] },
    strength: { name: "Strength Foundations", why: "You're focused on building strength, so we favor loadable compound movements with stable technique and manageable fatigue.", tags: ["Strength", "Progressive"] },
    general_fitness: { name: "Balanced General Fitness", why: "For general fitness, Fitakha balances movement patterns, cardiorespiratory work, mobility and recovery across your week.", tags: ["General fitness", "Balanced"] },
    mobility: { name: "Mobility & Balance Collection", why: "You're prioritizing mobility and balance, so we lead with controlled range-of-motion and stability work you can build on.", tags: ["Mobility", "Balance"] },
    desk: { name: "Desk-Break Reset", why: "Long sitting hours call for short mobility breaks and posture education you can do between meetings.", tags: ["Posture", "Short sessions"] },
    sport: { name: "Sport & Event Conditioning", why: "With an event or sport in mind, we increase specificity for power, speed, agility and conditioning as it approaches.", tags: ["Sport prep", "Conditioning"] }
  };

  var EXPERIENCE_NOTE = {
    never_exercised: "Since you're new to structured exercise, we keep complexity low and build consistency first.",
    beginner: "As a beginner, we favor stable, simple movements and progress your load and range gradually.",
    intermediate: "With some training history, we add variety and progressive overload at a comfortable pace.",
    advanced: "With your experience, we increase specificity and complexity where your goal supports it."
  };

  function renderRecommendation(a) {
    var program = PROGRAM_MAP[a.goal] || PROGRAM_MAP.general_fitness;
    var experienceNote = EXPERIENCE_NOTE[a.experience] || "";
    var symptomNote = "";

    if (answers.pain === "moderate") {
      symptomNote =
        '<div class="banner warn"><div class="icon">⚠️</div><div><h4>A note on your reported discomfort</h4>' +
        "<p>You mentioned some pain or discomfort. Fitakha will favor lower-irritability options and it's a good idea to " +
        '<a href="find-an-expert.html">check in with a coach</a> before pushing load or range of motion.</p></div></div>';
    }

    var equipmentLabel = {
      none: "no equipment (bodyweight)",
      bands: "resistance bands",
      dumbbells: "dumbbells",
      full_gym: "a full gym"
    }[a.equipment] || "your available equipment";

    var durationLabel = { "15": "~15 minutes", "30": "~30 minutes", "45": "~45 minutes", "60": "60+ minutes" }[a.duration] || "your available time";

    return (
      '<div class="result-hero">' +
      '<span class="eyebrow" style="background:rgba(255,255,255,0.15);color:#fff;">Your starting point</span>' +
      "<h3>" + program.name + "</h3>" +
      "<p>" + program.why + " " + experienceNote + "</p>" +
      '<div>' + program.tags.map(function (t) { return '<span class="tag orange">' + t + "</span>"; }).join("") +
      '<span class="tag">' + equipmentLabel + '</span><span class="tag">' + durationLabel + "</span></div>" +
      "</div>" +
      symptomNote +
      '<div class="result-list">' +
      '<div class="item"><div><strong>Suggested program</strong><div class="small text-muted">' + program.name + " &middot; matched to your equipment and time</div></div>" +
      '<a class="btn btn-secondary btn-sm" href="workouts.html#programs">View programs</a></div>' +
      '<div class="item"><div><strong>Posture &amp; movement self-check</strong><div class="small text-muted">Optional next step — health history, then guided observation</div></div>' +
      '<a class="btn btn-secondary btn-sm" href="posture-check.html">Start self-check</a></div>' +
      '<div class="item"><div><strong>Relevant exercise videos</strong><div class="small text-muted">Follow-along demonstrations from the Be a Fitakha channel</div></div>' +
      '<a class="btn btn-secondary btn-sm" href="workouts.html#library">Explore library</a></div>' +
      '<div class="item"><div><strong>Helpful FAQs</strong><div class="small text-muted">Getting started, technique and recovery answers</div></div>' +
      '<a class="btn btn-secondary btn-sm" href="workouts.html#faqs">Read FAQs</a></div>' +
      '<div class="item"><div><strong>Talk to a coach</strong><div class="small text-muted">Get a plan tailored beyond this first estimate</div></div>' +
      '<a class="btn btn-secondary btn-sm" href="find-an-expert.html">Find an expert</a></div>' +
      "</div>" +
      '<div class="disclaimer-box">Fitakha\'s recommendations combine deterministic safety rules with adaptive guidance, but they are not a medical diagnosis. ' +
      "If anything above doesn't feel right for your body, or your symptoms change, check in with a qualified professional.</div>" +
      '<div class="btn-row" style="margin-top:20px;">' +
      '<a class="btn btn-primary" href="workouts.html#programs">Start this program</a>' +
      '<button class="btn btn-secondary" onclick="location.reload()">Retake questionnaire</button>' +
      "</div>"
    );
  }

  showStep(0);
}

/* ---------------- Contact form (static demo) ---------------- */
function initContactForm() {
  var form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("contact-success");
    form.style.display = "none";
    if (msg) msg.style.display = "block";
  });
}

/* ---------------- Shop "notify me" form (static demo) ---------------- */
function initShopForm() {
  var form = document.getElementById("shop-notify-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("shop-success");
    form.style.display = "none";
    if (msg) msg.style.display = "block";
  });
}
