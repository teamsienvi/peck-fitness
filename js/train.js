// js/train.js - PECK Train Standalone Web Application Engine
// Handles sessions, audio cues, interactive angle simulator, breath pacer, and local storage stats.

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // WORKOUT DATA DEFINITIONS
  // --------------------------------------------------------------------------
  const WORKOUTS = [
    {
      id: 'calf-ankle-flow',
      title: 'Calf + Ankle Flow',
      category: 'mobility',
      durationMinutes: 5,
      tag: 'Mobility Reset',
      desc: 'The essential starter routine. Restores ankle dorsiflexion, decompresses tight calves, and warms up the lower leg.',
      inclineRange: '10° – 20° Incline',
      footOrientation: 'Toes Elevated',
      exercises: [
        {
          name: 'Bilateral Calf Raise',
          duration: 60,
          targetReps: 12,
          incline: 10,
          placement: 'Toes Elevated',
          cue: 'Slow 3-second eccentric lower into full ankle stretch. Pause at the bottom for 1 second before driving up.'
        },
        {
          name: 'Split Stance Dorsiflexion Hold (Right)',
          duration: 45,
          targetReps: null,
          incline: 15,
          placement: 'Toes Elevated',
          cue: 'Place right foot on board, drive right knee forward past toes while keeping heel flat on the surface.'
        },
        {
          name: 'Split Stance Dorsiflexion Hold (Left)',
          duration: 45,
          targetReps: null,
          incline: 15,
          placement: 'Toes Elevated',
          cue: 'Switch sides. Focus on deep ankle flexion without allowing the arch to collapse inward.'
        },
        {
          name: 'Eccentric Heel Drops',
          duration: 60,
          targetReps: 10,
          incline: 20,
          placement: 'Toes Elevated',
          cue: 'Rise up on both feet, lower slowly on one foot for 4 seconds to strengthen Achilles tendon.'
        }
      ]
    },
    {
      id: 'squat-depth-prep',
      title: 'Squat Depth & Hip Opener',
      category: 'strength',
      durationMinutes: 8,
      tag: 'Strength & Range',
      desc: 'Elevates heels to remove ankle restrictions, allowing deep upright torso squats and improved hip mobility.',
      inclineRange: '20° – 30° Incline',
      footOrientation: 'Heels Elevated',
      exercises: [
        {
          name: 'Slant Board Bodyweight Squats',
          duration: 90,
          targetReps: 12,
          incline: 20,
          placement: 'Heels Elevated',
          cue: 'Keep chest upright. Track knees forward in line with second toes. Descend to full comfortable depth.'
        },
        {
          name: 'Deep Squat Pry & Hold',
          duration: 60,
          targetReps: null,
          incline: 20,
          placement: 'Heels Elevated',
          cue: 'Hold bottom position. Use elbows inside knees to gently pry hips open. Keep spine long and breath steady.'
        },
        {
          name: 'Tempo Goblet Squats',
          duration: 90,
          targetReps: 10,
          incline: 25,
          placement: 'Heels Elevated',
          cue: 'Control the descent (3 seconds down, 1 second hold at the bottom). Squeeze quads and glutes at the top.'
        },
        {
          name: 'Elevated Cossack Squats',
          duration: 90,
          targetReps: 8,
          incline: 20,
          placement: 'Heels Elevated',
          cue: 'Shift weight laterally from side to side to open adductors and build single-leg lateral stability.'
        }
      ]
    },
    {
      id: 'vmo-knee-resilience',
      title: 'VMO & Knee Resilience',
      category: 'knee',
      durationMinutes: 10,
      tag: 'Tendon Strength',
      desc: 'Targeted quad and vastus medialis oblique (VMO) loading to build bulletproof patellar tendons.',
      inclineRange: '25° – 35° Incline',
      footOrientation: 'Heels Elevated',
      exercises: [
        {
          name: 'Poliquin Step-Ups (Right Leg)',
          duration: 75,
          targetReps: 12,
          incline: 25,
          placement: 'Heels Elevated',
          cue: 'Right heel on board. Slowly lower left heel to tap the floor lightly without pushing off. Drive through right quad.'
        },
        {
          name: 'Poliquin Step-Ups (Left Leg)',
          duration: 75,
          targetReps: 12,
          incline: 25,
          placement: 'Heels Elevated',
          cue: 'Switch sides. Focus on complete control of the knee path directly over the foot.'
        },
        {
          name: 'Slant Board ATG Split Squat (Right)',
          duration: 90,
          targetReps: 8,
          incline: 30,
          placement: 'Heel Elevated',
          cue: 'Cover your calf with your hamstring. Keep torso upright and back leg gently active.'
        },
        {
          name: 'Slant Board ATG Split Squat (Left)',
          duration: 90,
          targetReps: 8,
          incline: 30,
          placement: 'Heel Elevated',
          cue: 'Switch sides. Emphasize full knee flexion under controlled, steady bodyweight tension.'
        },
        {
          name: 'Incline Wall-Sit Burnout',
          duration: 60,
          targetReps: null,
          incline: 25,
          placement: 'Heels Elevated',
          cue: 'Back flat against wall, thighs parallel to floor. Maintain steady breathing as quads engage.'
        }
      ]
    },
    {
      id: 'achilles-dorsiflexion',
      title: 'Achilles & Dorsiflexion Builder',
      category: 'mobility',
      durationMinutes: 7,
      tag: 'Tendon Mobility',
      desc: 'Deep angle stretch focusing on soleus, gastrocnemius, and the plantar fascia for running and jumping health.',
      inclineRange: '30° – 40° Incline',
      footOrientation: 'Toes Elevated',
      exercises: [
        {
          name: 'Straight-Leg Gastroc Stretch (Right)',
          duration: 60,
          targetReps: null,
          incline: 30,
          placement: 'Toes Elevated',
          cue: 'Keep knee locked straight. Shift hips forward over front foot until you feel deep stretch in upper calf.'
        },
        {
          name: 'Straight-Leg Gastroc Stretch (Left)',
          duration: 60,
          targetReps: null,
          incline: 30,
          placement: 'Toes Elevated',
          cue: 'Switch sides. Do not arch lower back; keep glutes lightly engaged.'
        },
        {
          name: 'Bent-Knee Soleus Stretch (Right)',
          duration: 60,
          targetReps: null,
          incline: 35,
          placement: 'Toes Elevated',
          cue: 'Bend front knee slightly to shift tension lower down into the soleus and Achilles tendon.'
        },
        {
          name: 'Bent-Knee Soleus Stretch (Left)',
          duration: 60,
          targetReps: null,
          incline: 35,
          placement: 'Toes Elevated',
          cue: 'Switch sides. Maintain firm heel contact with the textured aluminum surface.'
        },
        {
          name: 'Tibialis Anterior Toe Raises',
          duration: 60,
          targetReps: 15,
          incline: 10,
          placement: 'Heels on floor, toes up',
          cue: 'Flex toes up toward shins as high as possible. Hold for 1 second at top to balance lower leg strength.'
        }
      ]
    },
    {
      id: 'post-training-reset',
      title: 'Post-Training Decompression',
      category: 'recovery',
      durationMinutes: 6,
      tag: 'Cool Down',
      desc: 'Gentle recovery sequence to downregulate nervous system and relieve lower leg tightness.',
      inclineRange: '15° – 25° Incline',
      footOrientation: 'Toes Elevated',
      exercises: [
        {
          name: 'Passive Bilateral Calf Hang',
          duration: 90,
          targetReps: null,
          incline: 20,
          placement: 'Toes Elevated',
          cue: 'Stand relaxed with toes elevated. Allow gravity to gently open the calves. Focus on deep belly breathing.'
        },
        {
          name: 'Ankle Rotations & Controlled Pumps',
          duration: 60,
          targetReps: 10,
          incline: 15,
          placement: 'Toes Elevated',
          cue: 'Gentle slow ankle circles and flexion pumps to restore blood flow.'
        },
        {
          name: 'Standing Forward Fold on Slant',
          duration: 90,
          targetReps: null,
          incline: 20,
          placement: 'Toes Elevated',
          cue: 'Hinge at the hips. Let head and arms hang heavy. Decompress entire posterior chain from heels to neck.'
        }
      ]
    }
  ];

  // --------------------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER (No external audio files needed!)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, vol = 0.25) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  }

  function playTick() {
    playTone(520, 'triangle', 0.08, 0.2);
  }

  function playCueChange() {
    playTone(440, 'sine', 0.1, 0.3);
    setTimeout(() => playTone(880, 'sine', 0.2, 0.35), 100);
  }

  function playCompleteChime() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.3, 0.4), i * 120);
    });
  }

  // --------------------------------------------------------------------------
  // LOCAL STORAGE STATS
  // --------------------------------------------------------------------------
  const STATS_KEY = 'peck_train_stats';

  function getStats() {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      totalReps: 128,
      totalMinutes: 42,
      sessionsCompleted: 6,
      streak: 3,
      history: [
        { date: 'Yesterday', routine: 'Calf + Ankle Flow', duration: '5m', reps: 24 },
        { date: '2 days ago', routine: 'Squat Depth & Hip Opener', duration: '8m', reps: 38 },
        { date: '4 days ago', routine: 'VMO & Knee Resilience', duration: '10m', reps: 42 }
      ],
      weeklyDays: [40, 70, 20, 85, 55, 95, 10] // Mon-Sun percentage fills
    };
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {}
    renderStats();
  }

  function addCompletedSession(routineTitle, minutes, reps) {
    const stats = getStats();
    stats.totalReps += reps;
    stats.totalMinutes += minutes;
    stats.sessionsCompleted += 1;
    stats.streak = (stats.streak || 1) + 1;
    stats.history.unshift({
      date: 'Just now',
      routine: routineTitle,
      duration: `${minutes}m`,
      reps: reps
    });
    // Bump Saturday or today's bar
    const dayIdx = new Date().getDay();
    const barIdx = (dayIdx + 6) % 7; // Convert Sun(0)-Sat(6) to Mon(0)-Sun(6)
    stats.weeklyDays[barIdx] = Math.min((stats.weeklyDays[barIdx] || 20) + 30, 100);
    saveStats(stats);
  }

  // --------------------------------------------------------------------------
  // APP NAVIGATION & TABS
  // --------------------------------------------------------------------------
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  const viewPanes = document.querySelectorAll('.train-view-pane');

  function switchTab(targetId) {
    tabButtons.forEach(btn => {
      const isMatch = btn.getAttribute('data-tab-target') === targetId;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
    });
    viewPanes.forEach(pane => {
      const isMatch = pane.id === targetId;
      pane.classList.toggle('active', isMatch);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab-target');
      switchTab(targetId);
    });
  });

  // --------------------------------------------------------------------------
  // WORKOUTS RENDER & FILTERING
  // --------------------------------------------------------------------------
  const gridEl = document.getElementById('workouts-grid');
  const filterBtns = document.querySelectorAll('.train-filter-btn');

  function renderWorkouts(filter = 'all') {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    const filtered = filter === 'all' ? WORKOUTS : WORKOUTS.filter(w => w.category === filter);

    filtered.forEach(w => {
      const card = document.createElement('article');
      card.className = 'workout-box';
      card.innerHTML = `
        <div class="workout-box-top">
          <span class="workout-tag">${w.tag}</span>
          <span style="font-size:0.75rem; font-weight:800; color:var(--train-accent-hot);">⏱ ${w.durationMinutes} MIN</span>
        </div>
        <h3>${w.title}</h3>
        <p>${w.desc}</p>
        <div class="workout-incline-badge">
          <span>📐 ${w.inclineRange}</span>
          <span>·</span>
          <span>🦶 ${w.footOrientation}</span>
        </div>
        <div class="workout-exercises-preview">
          ${w.exercises.slice(0, 3).map(e => `
            <div class="preview-row">
              <strong>${e.name}</strong>
              <span>${e.targetReps ? `${e.targetReps} reps` : `${e.duration}s`}</span>
            </div>
          `).join('')}
          ${w.exercises.length > 3 ? `<div style="font-size:0.7rem; color:var(--train-text-dim); margin-top:2px;">+ ${w.exercises.length - 3} more exercise${w.exercises.length - 3 > 1 ? 's' : ''}</div>` : ''}
        </div>
        <button class="train-btn-primary" data-start-workout="${w.id}" style="width:100%; justify-content:center;">
          Start Session ↗
        </button>
      `;
      gridEl.appendChild(card);
    });

    // Wire Start Session buttons
    gridEl.querySelectorAll('[data-start-workout]').forEach(btn => {
      btn.addEventListener('click', () => {
        const workoutId = btn.getAttribute('data-start-workout');
        loadAndStartWorkout(workoutId);
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWorkouts(btn.getAttribute('data-filter'));
    });
  });

  // --------------------------------------------------------------------------
  // ACTIVE WORKOUT PLAYER LOGIC
  // --------------------------------------------------------------------------
  let currentWorkout = WORKOUTS[0];
  let currentExerciseIndex = 0;
  let remainingSeconds = 60;
  let exerciseTotalSeconds = 60;
  let timerInterval = null;
  let isTimerRunning = false;
  let loggedSessionReps = 0;

  const playerTitle = document.getElementById('player-title');
  const playerExName = document.getElementById('player-exercise-name');
  const playerTimeDisplay = document.getElementById('player-time-display');
  const playerCircle = document.getElementById('player-progress-circle');
  const playerCue = document.getElementById('player-cue');
  const playerBoardBadge = document.getElementById('player-board-badge');
  const playerStepInfo = document.getElementById('player-step-info');
  const playerSeqList = document.getElementById('player-sequence-list');
  const playPauseBtn = document.getElementById('player-play-pause');
  const prevExBtn = document.getElementById('player-prev');
  const nextExBtn = document.getElementById('player-next');
  const repCountDisplay = document.getElementById('player-rep-count');
  const repPlusBtn = document.getElementById('rep-plus');
  const repMinusBtn = document.getElementById('rep-minus');

  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 110; // r=110 from SVG => 691.15

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function updateCircleProgress() {
    if (!playerCircle) return;
    const progress = (exerciseTotalSeconds - remainingSeconds) / exerciseTotalSeconds;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    playerCircle.style.strokeDashoffset = offset;
  }

  function setExercise(idx) {
    if (!currentWorkout || idx < 0 || idx >= currentWorkout.exercises.length) return;
    currentExerciseIndex = idx;
    const ex = currentWorkout.exercises[idx];
    exerciseTotalSeconds = ex.duration || 60;
    remainingSeconds = exerciseTotalSeconds;

    if (playerTitle) playerTitle.textContent = currentWorkout.title;
    if (playerStepInfo) playerStepInfo.textContent = `Exercise ${idx + 1} of ${currentWorkout.exercises.length}`;
    if (playerExName) playerExName.textContent = ex.name;
    if (playerCue) playerCue.textContent = ex.cue;
    if (playerBoardBadge) {
      playerBoardBadge.innerHTML = `📐 ${ex.incline}° Incline · 🦶 ${ex.placement}`;
    }
    if (playerTimeDisplay) playerTimeDisplay.textContent = fmtTime(remainingSeconds);

    updateCircleProgress();
    renderPlayerSequence();
    playCueChange();
  }

  function renderPlayerSequence() {
    if (!playerSeqList || !currentWorkout) return;
    playerSeqList.innerHTML = '';
    currentWorkout.exercises.forEach((ex, idx) => {
      const item = document.createElement('div');
      item.className = `seq-item ${idx === currentExerciseIndex ? 'active' : ''} ${idx < currentExerciseIndex ? 'done' : ''}`;
      item.innerHTML = `
        <div>
          <span>${idx + 1}.</span> <strong>${ex.name}</strong>
        </div>
        <span style="font-size:0.75rem; color:var(--train-accent-hot);">${ex.targetReps ? `${ex.targetReps} reps` : `${ex.duration}s`}</span>
      `;
      playerSeqList.appendChild(item);
    });
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    if (playPauseBtn) playPauseBtn.textContent = 'Pause Session';
    initAudio();

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        if (playerTimeDisplay) playerTimeDisplay.textContent = fmtTime(remainingSeconds);
        updateCircleProgress();

        // 3-2-1 Audio tick cues
        if (remainingSeconds <= 3 && remainingSeconds > 0) {
          playTick();
        }
      } else {
        // Exercise finished
        if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
          setExercise(currentExerciseIndex + 1);
        } else {
          // Entire workout complete!
          pauseTimer();
          finishWorkout();
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    if (playPauseBtn) playPauseBtn.textContent = 'Resume Session';
  }

  function togglePlayPause() {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function finishWorkout() {
    playCompleteChime();
    addCompletedSession(currentWorkout.title, currentWorkout.durationMinutes, loggedSessionReps);

    // Show celebration modal
    const modal = document.getElementById('celebration-modal');
    const celebTitle = document.getElementById('celeb-title');
    const celebTime = document.getElementById('celeb-time');
    const celebReps = document.getElementById('celeb-reps');
    if (celebTitle) celebTitle.textContent = currentWorkout.title;
    if (celebTime) celebTime.textContent = `${currentWorkout.durationMinutes} MIN`;
    if (celebReps) celebReps.textContent = `${loggedSessionReps} REPS`;
    if (modal) modal.hidden = false;
  }

  function loadAndStartWorkout(workoutId) {
    const w = WORKOUTS.find(item => item.id === workoutId) || WORKOUTS[0];
    currentWorkout = w;
    loggedSessionReps = 0;
    if (repCountDisplay) repCountDisplay.textContent = '0';
    pauseTimer();
    setExercise(0);
    switchTab('view-player');
    startTimer();
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
  }

  if (nextExBtn) {
    nextExBtn.addEventListener('click', () => {
      if (currentExerciseIndex < currentWorkout.exercises.length - 1) {
        setExercise(currentExerciseIndex + 1);
      } else {
        finishWorkout();
      }
    });
  }

  if (prevExBtn) {
    prevExBtn.addEventListener('click', () => {
      if (currentExerciseIndex > 0) {
        setExercise(currentExerciseIndex - 1);
      }
    });
  }

  // Rep counter buttons
  if (repPlusBtn && repCountDisplay) {
    repPlusBtn.addEventListener('click', () => {
      loggedSessionReps += 1;
      repCountDisplay.textContent = loggedSessionReps;
      playTick();
    });
  }
  if (repMinusBtn && repCountDisplay) {
    repMinusBtn.addEventListener('click', () => {
      loggedSessionReps = Math.max(0, loggedSessionReps - 1);
      repCountDisplay.textContent = loggedSessionReps;
    });
  }

  // Keyboard shortcut: Spacebar to count rep or pause when in active player
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
      const playerPane = document.getElementById('view-player');
      if (playerPane && playerPane.classList.contains('active')) {
        e.preventDefault();
        loggedSessionReps += 1;
        if (repCountDisplay) repCountDisplay.textContent = loggedSessionReps;
        playTick();
      }
    }
  });

  // Modal dismiss
  const closeCelebBtn = document.getElementById('close-celeb-btn');
  if (closeCelebBtn) {
    closeCelebBtn.addEventListener('click', () => {
      const modal = document.getElementById('celebration-modal');
      if (modal) modal.hidden = true;
      switchTab('view-progress');
    });
  }

  // Hero Quick Start
  const heroStartBtn = document.getElementById('hero-quick-start');
  if (heroStartBtn) {
    heroStartBtn.addEventListener('click', () => {
      loadAndStartWorkout('calf-ankle-flow');
    });
  }

  // --------------------------------------------------------------------------
  // ANGLE LAB (Interactive Slant Board Simulator)
  // --------------------------------------------------------------------------
  const angleSlider = document.getElementById('angle-slider');
  const angleValueTag = document.getElementById('angle-value-tag');
  const angleBoardPlate = document.getElementById('board-plate-visual');
  const angleStrut = document.getElementById('board-strut-visual');
  const angleTitle = document.getElementById('angle-info-title');
  const angleDesc = document.getElementById('angle-info-desc');
  const angleMuscles = document.getElementById('angle-info-muscles');
  const anglePresets = document.querySelectorAll('.preset-btn');

  const ANGLE_DATA = {
    10: {
      title: '10° — Foundation & Gentle Warm-Up',
      desc: 'Minimal elevation. Perfect for beginners, post-run decompression, or high-volume calf endurance without excessive Achilles strain.',
      muscles: ['Gastrocnemius', 'Soleus', 'Plantar Fascia'],
      safety: 'Ideal angle to test foot placement and establish baseline comfort before moving to steeper pitches.'
    },
    20: {
      title: '20° — Standard Mobility & Squat Pitch',
      desc: 'The optimal general fitness incline. Elevates heels sufficiently to keep torso upright during deep squats, even with restricted ankle mobility.',
      muscles: ['Quadriceps', 'VMO', 'Ankle Dorsiflexors', 'Achilles Tendon'],
      safety: 'Ensure boards are placed shoulder-width apart and non-marring floor pads are firmly positioned.'
    },
    30: {
      title: '30° — Knee Resilience & VMO Loading',
      desc: 'Targeted quad and knee angle. Drastically increases patellar tendon and VMO loading during ATG split squats and Poliquin step-ups.',
      muscles: ['Vastus Medialis (VMO)', 'Patellar Tendon', 'Rectus Femoris', 'Glutes'],
      safety: 'Only perform controlled movements. Always dismount smoothly without bouncing or jumping.'
    },
    40: {
      title: '40° — Deep Posterior Chain Stretch',
      desc: 'Intense calf and Achilles stretch. Recommended for dedicated mobility work, plantar fascia release, and high-level calf building.',
      muscles: ['Soleus (Deep)', 'Achilles Tendon', 'Hamstring Line'],
      safety: 'Step onto the board gently. Hold a wall or sturdy support if balance feels challenged.'
    },
    50: {
      title: '50° — Peak Incline & Extreme Flexibility',
      desc: 'Maximum angle. Built for elite athletic mobility routines, extreme ankle flexion development, and hamstring decompression.',
      muscles: ['Deep Soleus', 'Achilles', 'Calf Complex', 'Posterior Chain'],
      safety: 'CAUTION: Highly challenging pitch. Do not use heavy weights at 50°. Always adjust unloaded.'
    }
  };

  function updateAngleLab(deg) {
    deg = Math.max(10, Math.min(50, Number(deg)));
    if (angleSlider) angleSlider.value = deg;
    if (angleValueTag) angleValueTag.textContent = `${deg}° INCLINE`;

    // Rotate the top plate in SVG
    if (angleBoardPlate) {
      // Board rotates around bottom-left pivot (x=60, y=210)
      angleBoardPlate.setAttribute('transform', `rotate(-${deg}, 60, 210)`);
    }

    // Update preset button active state
    anglePresets.forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-angle')) === deg);
    });

    // Closest match data
    const keys = [10, 20, 30, 40, 50];
    const closest = keys.reduce((prev, curr) => Math.abs(curr - deg) < Math.abs(prev - deg) ? curr : prev);
    const data = ANGLE_DATA[closest];

    if (angleTitle) angleTitle.textContent = data.title;
    if (angleDesc) angleDesc.textContent = data.desc;
    if (angleMuscles) {
      angleMuscles.innerHTML = data.muscles.map(m => `<span class="muscle-pill">${m}</span>`).join('');
    }
  }

  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      updateAngleLab(e.target.value);
    });
  }

  anglePresets.forEach(btn => {
    btn.addEventListener('click', () => {
      updateAngleLab(btn.getAttribute('data-angle'));
    });
  });

  // --------------------------------------------------------------------------
  // BREATH STUDIO (Recovery Pacer Engine)
  // --------------------------------------------------------------------------
  const breathOrb = document.getElementById('breath-core-orb');
  const orbText = document.getElementById('orb-text');
  const breathCyclesEl = document.getElementById('breath-cycles-count');
  const breathTimerEl = document.getElementById('breath-session-timer');
  const breathInstructionEl = document.getElementById('breath-instruction');
  const breathProtocolBtns = document.querySelectorAll('[data-protocol]');
  const breathToggleBtn = document.getElementById('breath-toggle-btn');

  let breathRunning = false;
  let breathTimeout = null;
  let breathSecondInterval = null;
  let breathSessionSeconds = 0;
  let breathCycleCount = 0;
  let currentProtocol = 'box'; // 'box', 'cadence', 'relax'

  const PROTOCOLS = {
    box: {
      name: 'Box Breathing (4-4-4-4)',
      steps: [
        { phase: 'IN', duration: 4, scale: 1.35, cue: 'Inhale smoothly through the nose for 4 seconds.' },
        { phase: 'HOLD', duration: 4, scale: 1.35, cue: 'Hold full breath with relaxed shoulders.' },
        { phase: 'OUT', duration: 4, scale: 0.85, cue: 'Exhale slowly through the mouth.' },
        { phase: 'HOLD', duration: 4, scale: 0.85, cue: 'Hold empty lungs calmly before next breath.' }
      ]
    },
    cadence: {
      name: 'Cadence Flow (4-4)',
      steps: [
        { phase: 'IN', duration: 4, scale: 1.3, cue: 'Breathe in steady and deep.' },
        { phase: 'OUT', duration: 4, scale: 0.85, cue: 'Release all tension on the outward breath.' }
      ]
    },
    relax: {
      name: '4-7-8 Deep Recovery',
      steps: [
        { phase: 'IN', duration: 4, scale: 1.3, cue: 'Inhale quietly through your nose.' },
        { phase: 'HOLD', duration: 7, scale: 1.3, cue: 'Hold breath gently without strain.' },
        { phase: 'OUT', duration: 8, scale: 0.8, cue: 'Make a whoosh exhale for 8 seconds.' }
      ]
    }
  };

  let currentStepIdx = 0;

  function runBreathStep() {
    if (!breathRunning) return;
    const proto = PROTOCOLS[currentProtocol];
    const step = proto.steps[currentStepIdx];

    if (orbText) orbText.textContent = step.phase;
    if (breathInstructionEl) breathInstructionEl.textContent = step.cue;
    if (breathOrb) {
      breathOrb.style.transform = `scale(${step.scale})`;
      breathOrb.style.transition = `transform ${step.duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
    }

    playTone(step.phase === 'IN' ? 380 : 300, 'sine', 0.25, 0.2);

    breathTimeout = setTimeout(() => {
      currentStepIdx = (currentStepIdx + 1) % proto.steps.length;
      if (currentStepIdx === 0) {
        breathCycleCount++;
        if (breathCyclesEl) breathCyclesEl.textContent = `${breathCycleCount} CYCLES`;
      }
      runBreathStep();
    }, step.duration * 1000);
  }

  function startBreath() {
    if (breathRunning) return;
    breathRunning = true;
    currentStepIdx = 0;
    if (breathToggleBtn) breathToggleBtn.textContent = 'Stop Breathing Flow';
    initAudio();

    runBreathStep();

    breathSecondInterval = setInterval(() => {
      breathSessionSeconds++;
      if (breathTimerEl) breathTimerEl.textContent = fmtTime(breathSessionSeconds);
    }, 1000);
  }

  function stopBreath() {
    breathRunning = false;
    clearTimeout(breathTimeout);
    clearInterval(breathSecondInterval);
    breathTimeout = null;
    breathSecondInterval = null;
    if (breathToggleBtn) breathToggleBtn.textContent = 'Start Breathing Flow';
    if (orbText) orbText.textContent = 'START';
    if (breathOrb) breathOrb.style.transform = 'scale(1)';
    if (breathInstructionEl) breathInstructionEl.textContent = 'Tap to begin paced breathing for post-workout recovery.';
  }

  if (breathToggleBtn) {
    breathToggleBtn.addEventListener('click', () => {
      if (breathRunning) {
        stopBreath();
      } else {
        startBreath();
      }
    });
  }

  breathProtocolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      breathProtocolBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProtocol = btn.getAttribute('data-protocol');
      stopBreath();
    });
  });

  // --------------------------------------------------------------------------
  // PROGRESS & STATS DISPLAY
  // --------------------------------------------------------------------------
  function renderStats() {
    const stats = getStats();
    const statReps = document.getElementById('stat-reps');
    const statMinutes = document.getElementById('stat-minutes');
    const statSessions = document.getElementById('stat-sessions');
    const statStreak = document.getElementById('stat-streak');
    const headerStreak = document.getElementById('header-streak-badge');
    const historyList = document.getElementById('history-list');

    if (statReps) statReps.textContent = stats.totalReps;
    if (statMinutes) statMinutes.textContent = stats.totalMinutes;
    if (statSessions) statSessions.textContent = stats.sessionsCompleted;
    if (statStreak) statStreak.textContent = `${stats.streak} DAYS`;
    if (headerStreak) headerStreak.textContent = `🔥 ${stats.streak} DAY STREAK · ${stats.totalReps} REPS`;

    // Render Weekly Bars
    const barFills = document.querySelectorAll('.train-bar-fill');
    if (barFills && stats.weeklyDays) {
      barFills.forEach((fill, i) => {
        fill.style.height = `${stats.weeklyDays[i] || 15}%`;
      });
    }

    // Render History
    if (historyList && stats.history) {
      historyList.innerHTML = stats.history.map(item => `
        <div class="history-item">
          <div>
            <strong>${item.routine}</strong>
            <div style="font-size:0.7rem; color:var(--train-text-dim);">${item.date}</div>
          </div>
          <span>+${item.reps || 12} reps · ${item.duration}</span>
        </div>
      `).join('');
    }
  }

  // Audio Toggle Button
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      audioToggleBtn.classList.toggle('active', audioEnabled);
      audioToggleBtn.innerHTML = audioEnabled ? '🔊 Audio Cues: ON' : '🔇 Audio Cues: OFF';
    });
  }

  // Reset Stats Button
  const resetStatsBtn = document.getElementById('reset-stats-btn');
  if (resetStatsBtn) {
    resetStatsBtn.addEventListener('click', () => {
      if (confirm('Reset your training stats to defaults?')) {
        localStorage.removeItem(STATS_KEY);
        renderStats();
      }
    });
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATION & LOGIN GATE (Required Access)
  // --------------------------------------------------------------------------
  const authGate = document.getElementById('auth-gate');
  const mainAppWrap = document.getElementById('main');
  const userEmailDisplay = document.getElementById('user-email-display');
  const logoutBtn = document.getElementById('logout-btn');

  const gateEmailForm = document.getElementById('gate-email-form');
  const gateOtpForm = document.getElementById('gate-otp-form');
  const gateEmailInput = document.getElementById('gate-email');
  const gateCodeInput = document.getElementById('gate-code');
  const gateSendBtn = document.getElementById('gate-send-btn');
  const gateVerifyBtn = document.getElementById('gate-verify-btn');
  const gateEmailStatus = document.getElementById('gate-email-status');
  const gateOtpStatus = document.getElementById('gate-otp-status');
  const gateOtpNotice = document.getElementById('gate-otp-notice');
  const gateResendBtn = document.getElementById('gate-resend-btn');
  const gateChangeEmailBtn = document.getElementById('gate-change-email-btn');

  let pendingAuthToken = null;
  let pendingAuthEmail = '';

  function getVerifiedEmail() {
    return localStorage.getItem('peck_verified_email');
  }

  function checkAuthAndRender() {
    const verifiedEmail = getVerifiedEmail();
    if (!verifiedEmail) {
      if (mainAppWrap) mainAppWrap.style.display = 'none';
      if (authGate) authGate.style.display = 'flex';
      return false;
    } else {
      if (authGate) authGate.style.display = 'none';
      if (mainAppWrap) mainAppWrap.style.display = 'block';
      if (userEmailDisplay) userEmailDisplay.textContent = verifiedEmail;
      return true;
    }
  }

  // Handle Send Code
  if (gateEmailForm) {
    gateEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = gateEmailInput.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        gateEmailStatus.className = 'auth-status-msg error';
        gateEmailStatus.textContent = 'Please enter a valid email address.';
        return;
      }

      gateSendBtn.disabled = true;
      gateEmailStatus.className = 'auth-status-msg';
      gateEmailStatus.textContent = 'Sending 6-digit access code…';

      try {
        const res = await fetch('/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send-code', email })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          pendingAuthToken = data.token;
          pendingAuthEmail = email;
          gateEmailForm.style.display = 'none';
          gateOtpForm.style.display = 'block';
          gateOtpNotice.textContent = `Verification code sent to ${email}. Enter the 6-digit code:`;
          gateCodeInput.value = '';
          gateCodeInput.focus();
        } else {
          gateEmailStatus.className = 'auth-status-msg error';
          gateEmailStatus.textContent = data.error || 'Failed to send verification code.';
          gateSendBtn.disabled = false;
        }
      } catch (err) {
        gateEmailStatus.className = 'auth-status-msg error';
        gateEmailStatus.textContent = 'Network error connecting to verification service.';
        gateSendBtn.disabled = false;
      }
    });
  }

  // Handle Verify Code
  if (gateOtpForm) {
    gateOtpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = gateCodeInput.value.trim();
      if (!code || code.length < 6) {
        gateOtpStatus.className = 'auth-status-msg error';
        gateOtpStatus.textContent = 'Please enter the complete 6-digit code.';
        return;
      }

      gateVerifyBtn.disabled = true;
      gateOtpStatus.className = 'auth-status-msg';
      gateOtpStatus.textContent = 'Verifying access code…';

      try {
        const res = await fetch('/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify-code',
            email: pendingAuthEmail,
            code,
            token: pendingAuthToken
          })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          localStorage.setItem('peck_verified_email', pendingAuthEmail);
          if (data.verifiedToken) {
            localStorage.setItem('peck_verified_token', data.verifiedToken);
          }
          gateOtpStatus.className = 'auth-status-msg success';
          gateOtpStatus.textContent = '✓ Verified! Unlocking PECK Train…';
          playCompleteChime();
          setTimeout(() => {
            checkAuthAndRender();
          }, 500);
        } else {
          gateOtpStatus.className = 'auth-status-msg error';
          gateOtpStatus.textContent = data.error || 'Incorrect code. Please try again.';
          gateVerifyBtn.disabled = false;
        }
      } catch (err) {
        gateOtpStatus.className = 'auth-status-msg error';
        gateOtpStatus.textContent = 'Network error verifying code.';
        gateVerifyBtn.disabled = false;
      }
    });
  }

  // Resend code button
  if (gateResendBtn) {
    gateResendBtn.addEventListener('click', async () => {
      if (!pendingAuthEmail) return;
      gateOtpStatus.className = 'auth-status-msg';
      gateOtpStatus.textContent = 'Resending code…';
      try {
        const res = await fetch('/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send-code', email: pendingAuthEmail })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          pendingAuthToken = data.token;
          gateOtpStatus.className = 'auth-status-msg success';
          gateOtpStatus.textContent = 'New code sent! Check your inbox.';
        } else {
          gateOtpStatus.className = 'auth-status-msg error';
          gateOtpStatus.textContent = data.error || 'Failed to resend code.';
        }
      } catch {
        gateOtpStatus.className = 'auth-status-msg error';
        gateOtpStatus.textContent = 'Network error resending code.';
      }
    });
  }

  // Change email button
  if (gateChangeEmailBtn) {
    gateChangeEmailBtn.addEventListener('click', () => {
      gateOtpForm.style.display = 'none';
      gateEmailForm.style.display = 'block';
      gateSendBtn.disabled = false;
      gateEmailStatus.textContent = '';
      gateOtpStatus.textContent = '';
      gateEmailInput.focus();
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out of PECK Train?')) {
        localStorage.removeItem('peck_verified_email');
        localStorage.removeItem('peck_verified_token');
        checkAuthAndRender();
        if (gateEmailForm) gateEmailForm.style.display = 'block';
        if (gateOtpForm) gateOtpForm.style.display = 'none';
        if (gateSendBtn) gateSendBtn.disabled = false;
        if (gateEmailStatus) gateEmailStatus.textContent = '';
        if (gateOtpStatus) gateOtpStatus.textContent = '';
      }
    });
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  checkAuthAndRender();
  renderWorkouts();
  setExercise(0);
  updateAngleLab(20);
  renderStats();

})();
