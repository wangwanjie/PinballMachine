/* 首屏迷你弹珠台：重力、挡板、碰撞得分与灯光闪烁。
 * 坐标系为 360×580 的逻辑单位，按画布实际像素缩放绘制。
 * 未接管时进入「招徕模式」由简单 AI 自动打；按 ← → 或点按左右半屏即接管。 */
(function () {
  'use strict';

  var canvas = document.getElementById('table');
  if (!canvas || !canvas.getContext) {
    return;
  }
  var ctx = canvas.getContext('2d');
  var W = 360;
  var H = 580;
  var PP = window.PP || { t: function (k) { return k; }, seg7: function () {} };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 台面几何 ----------
  var LANE_X = 318;      // 发射通道左墙
  var OUTER_R = 346;     // 右外墙
  var OUTER_L = 14;      // 左外墙
  var ARC_C = { x: 180, y: 180, r: 166 };
  var BALL_R = 7;
  var GRAVITY = 760;
  var STEP = 1 / 360;    // 物理子步长

  var walls = [];
  function wall(ax, ay, bx, by) {
    walls.push({ ax: ax, ay: ay, bx: bx, by: by });
  }
  // 顶部圆弧（左右外墙之间的半圆）
  (function () {
    var n = 28;
    for (var i = 0; i < n; i++) {
      var a0 = Math.PI + Math.PI * i / n;
      var a1 = Math.PI + Math.PI * (i + 1) / n;
      wall(ARC_C.x + ARC_C.r * Math.cos(a0), ARC_C.y + ARC_C.r * Math.sin(a0),
        ARC_C.x + ARC_C.r * Math.cos(a1), ARC_C.y + ARC_C.r * Math.sin(a1));
    }
  })();
  wall(OUTER_L, 180, OUTER_L, 420);           // 左外墙
  wall(OUTER_R, 180, OUTER_R, H);             // 右外墙
  wall(LANE_X, 205, LANE_X, H);               // 发射通道隔墙
  wall(LANE_X, 560, OUTER_R, 560);            // 发射通道底
  wall(OUTER_L, 420, 96, 498);                // 左引导
  wall(LANE_X, 420, 236, 498);                // 右引导

  var bumpers = [
    { x: 104, y: 150, r: 17, flash: 0 },
    { x: 228, y: 150, r: 17, flash: 0 },
    { x: 166, y: 212, r: 17, flash: 0 }
  ];
  var lanes = [
    { x: 112, y: 84, lit: false, flash: 0 },
    { x: 166, y: 70, lit: false, flash: 0 },
    { x: 220, y: 84, lit: false, flash: 0 }
  ];
  var pegs = [];
  (function () {
    var rows = [272, 306, 340, 374];
    rows.forEach(function (y, ri) {
      var off = ri % 2 ? 21 : 0;
      for (var x = 46 + off; x <= 290; x += 42) {
        pegs.push({ x: x, y: y, r: 4, flash: 0 });
      }
    });
  })();

  // 挡板：用角度描述，左挡板向右下，右挡板向左下
  var FL_LEN = 58;
  var FL_W = 6;
  var flippers = [
    { px: 96, py: 498, rest: 0.5, up: -0.5, a: 0.5, w: 0, pressed: false, ai: 0 },
    { px: 236, py: 498, rest: Math.PI - 0.5, up: Math.PI + 0.5, a: Math.PI - 0.5, w: 0, pressed: false, ai: 0 }
  ];

  // ---------- 游戏状态 ----------
  var ball = { x: 332, y: 552, vx: 0, vy: 0 };
  var state = {
    mode: reduceMotion ? 'idle' : 'attract',  // idle | attract | play | over
    score: 0,
    balls: 3,
    mult: 1,
    inLane: true,
    laneTimer: 0,
    stillTimer: 0,
    overTimer: 0,
    time: 0
  };
  var sparks = [];
  var shown = { score: -1, balls: -1, mult: -1 };

  function resetBall() {
    ball.x = 332;
    ball.y = 552;
    ball.vx = 0;
    ball.vy = 0;
    state.inLane = true;
    state.laneTimer = 0;
  }

  function newGame(mode) {
    state.mode = mode;
    state.score = 0;
    state.balls = 3;
    state.mult = 1;
    lanes.forEach(function (l) {
      l.lit = false;
    });
    resetBall();
  }

  function addScore(n) {
    state.score = Math.min(999999, state.score + n * state.mult);
  }

  function updateBoard() {
    if (shown.score !== state.score) {
      shown.score = state.score;
      PP.seg7(document.getElementById('sb-score'), String(state.score));
    }
    if (shown.balls !== state.balls) {
      shown.balls = state.balls;
      PP.seg7(document.getElementById('sb-ball'), String(Math.max(0, state.balls)));
    }
    if (shown.mult !== state.mult) {
      shown.mult = state.mult;
      PP.seg7(document.getElementById('sb-multi'), String(state.mult));
    }
  }

  function launch() {
    if (!state.inLane) {
      return;
    }
    state.inLane = false;
    ball.vy = -(1040 + Math.random() * 70);
    ball.vx = 0;
  }

  function burst(x, y, n, hue) {
    if (reduceMotion) {
      return;
    }
    for (var i = 0; i < n && sparks.length < 40; i++) {
      var a = Math.random() * Math.PI * 2;
      var s = 60 + Math.random() * 160;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, hue: hue });
    }
  }

  // ---------- 碰撞 ----------
  // 圆与线段（带厚度）碰撞；sv 为接触点表面速度（挡板转动时非零）
  function collideSegment(ax, ay, bx, by, thick, e, surfVel) {
    var dx = bx - ax;
    var dy = by - ay;
    var len2 = dx * dx + dy * dy;
    var u = ((ball.x - ax) * dx + (ball.y - ay) * dy) / len2;
    if (u < 0) {
      u = 0;
    } else if (u > 1) {
      u = 1;
    }
    var cx = ax + dx * u;
    var cy = ay + dy * u;
    var nx = ball.x - cx;
    var ny = ball.y - cy;
    var d = Math.sqrt(nx * nx + ny * ny);
    var minD = BALL_R + thick;
    if (d >= minD || d === 0) {
      return false;
    }
    nx /= d;
    ny /= d;
    ball.x = cx + nx * minD;
    ball.y = cy + ny * minD;
    var sx = 0;
    var sy = 0;
    if (surfVel) {
      var sv = surfVel(cx, cy);
      sx = sv[0];
      sy = sv[1];
    }
    var rvx = ball.vx - sx;
    var rvy = ball.vy - sy;
    var vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      rvx -= (1 + e) * vn * nx;
      rvy -= (1 + e) * vn * ny;
      ball.vx = rvx + sx;
      ball.vy = rvy + sy;
    }
    return true;
  }

  function collideCircle(c, e, kick) {
    var nx = ball.x - c.x;
    var ny = ball.y - c.y;
    var d = Math.sqrt(nx * nx + ny * ny);
    var minD = BALL_R + c.r;
    if (d >= minD || d === 0) {
      return false;
    }
    nx /= d;
    ny /= d;
    ball.x = c.x + nx * minD;
    ball.y = c.y + ny * minD;
    var vn = ball.vx * nx + ball.vy * ny;
    if (vn < 0) {
      ball.vx -= (1 + e) * vn * nx;
      ball.vy -= (1 + e) * vn * ny;
    }
    if (kick) {
      ball.vx += nx * kick;
      ball.vy += ny * kick;
    }
    return true;
  }

  function flipperTip(f) {
    return [f.px + Math.cos(f.a) * FL_LEN, f.py + Math.sin(f.a) * FL_LEN];
  }

  // ---------- 招徕模式 AI ----------
  function aiThink(dt) {
    flippers.forEach(function (f, i) {
      if (f.ai > 0) {
        f.ai -= dt;
        f.pressed = f.ai > 0.08;
        return;
      }
      f.pressed = false;
      var sideOk = i === 0 ? ball.x < 170 : ball.x > 162;
      if (!state.inLane && sideOk && ball.vy > -40 && ball.y > 462 && ball.y < 520) {
        // 略带随机延迟，避免每次都完美接住
        if (Math.random() < 0.55) {
          f.ai = 0.26;
        }
      }
    });
  }

  // ---------- 物理步进 ----------
  function physics(dt) {
    // 挡板转动
    flippers.forEach(function (f) {
      var target = f.pressed ? f.up : f.rest;
      var speed = f.pressed ? 22 : 13;
      var old = f.a;
      if (f.a < target) {
        f.a = Math.min(target, f.a + speed * dt);
      } else if (f.a > target) {
        f.a = Math.max(target, f.a - speed * dt);
      }
      f.w = (f.a - old) / dt;
    });

    if (state.inLane) {
      ball.x = 332;
      ball.y = 552;
      return;
    }

    ball.vy += GRAVITY * dt;
    var sp = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (sp > 1300) {
      ball.vx *= 1300 / sp;
      ball.vy *= 1300 / sp;
    }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    for (var i = 0; i < walls.length; i++) {
      var s = walls[i];
      collideSegment(s.ax, s.ay, s.bx, s.by, 0, 0.5, null);
    }
    flippers.forEach(function (f) {
      var tip = flipperTip(f);
      collideSegment(f.px, f.py, tip[0], tip[1], FL_W, 0.35, function (cx, cy) {
        return [-f.w * (cy - f.py), f.w * (cx - f.px)];
      });
    });
    bumpers.forEach(function (b) {
      if (collideCircle(b, 0.9, 260)) {
        if (b.flash < 0.7) {
          addScore(100);
          burst(b.x, b.y, 8, 0);
        }
        b.flash = 1;
      }
    });
    pegs.forEach(function (p) {
      if (collideCircle(p, 0.45, 0)) {
        if (p.flash < 0.5) {
          addScore(10);
        }
        p.flash = 1;
      }
    });
    lanes.forEach(function (l) {
      var dx = ball.x - l.x;
      var dy = ball.y - l.y;
      if (!l.lit && dx * dx + dy * dy < 16 * 16) {
        l.lit = true;
        l.flash = 1;
        addScore(50);
        burst(l.x, l.y, 6, 1);
      }
    });
    if (lanes.every(function (l) { return l.lit; })) {
      // 三条上方通道全亮：倍率 +1（最高 5），通道复位
      state.mult = Math.min(5, state.mult + 1);
      lanes.forEach(function (l) {
        l.lit = false;
        l.flash = 1.4;
      });
    }

    // 落回发射通道：重新发射
    if (ball.x > LANE_X && ball.y > 540 && Math.abs(ball.vy) < 120) {
      resetBall();
    }
  }

  function tick(dt) {
    state.time += dt;
    if (state.mode === 'attract') {
      aiThink(dt);
    }
    if (state.inLane && (state.mode === 'attract' || state.mode === 'play')) {
      state.laneTimer += dt;
      if (state.laneTimer > (state.mode === 'attract' ? 0.9 : 1.6)) {
        launch();
      }
    }
    if (state.mode === 'over') {
      state.overTimer += dt;
      if (state.overTimer > 6) {
        // 减少动态效果时回到静止待机，否则回到招徕模式
        newGame(reduceMotion ? 'idle' : 'attract');
        if (reduceMotion) {
          draw();
          sync();
        }
      }
    }

    var n = Math.round(dt / STEP);
    for (var i = 0; i < n; i++) {
      physics(STEP);
    }

    // 卡死检测：长时间几乎不动就轻推一下
    var sp = Math.abs(ball.vx) + Math.abs(ball.vy);
    if (!state.inLane && sp < 12 && !flippers[0].pressed && !flippers[1].pressed) {
      state.stillTimer += dt;
      if (state.stillTimer > 2.5) {
        ball.vy = -320;
        ball.vx = (Math.random() - 0.5) * 200;
        state.stillTimer = 0;
      }
    } else {
      state.stillTimer = 0;
    }

    // 漏球
    if (ball.y > H + 20) {
      if (state.mode === 'play') {
        state.balls -= 1;
        if (state.balls <= 0) {
          state.balls = 0;
          state.mode = 'over';
          state.overTimer = 0;
        }
      } else if (state.mode === 'attract') {
        state.balls -= 1;
        if (state.balls <= 0) {
          newGame('attract');
        }
      }
      resetBall();
    }

    bumpers.forEach(function (b) {
      b.flash = Math.max(0, b.flash - dt * 2.6);
    });
    pegs.forEach(function (p) {
      p.flash = Math.max(0, p.flash - dt * 2.2);
    });
    lanes.forEach(function (l) {
      l.flash = Math.max(0, l.flash - dt * 2);
    });
    for (var k = sparks.length - 1; k >= 0; k--) {
      var s = sparks[k];
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 300 * dt;
      if (s.life <= 0) {
        sparks.splice(k, 1);
      }
    }
    updateBoard();
  }

  // ---------- 绘制 ----------
  var PAL = {
    dark: {
      bg0: '#0d0720', bg1: '#1a0b2e', wall: '#ff3fd2', wallGlow: 'rgba(255,63,210,.8)', lane: '#3a1d5c',
      peg: '#b56cff', pegHit: '#ffffff', bumper: '#2df4ff', bumperCore: '#0d2b3a', flipper: '#ffb43a',
      flipperEdge: '#ffe2a8', laneOff: 'rgba(139,255,107,.18)', laneOn: '#8bff6b', ball0: '#ffffff', ball1: '#9aa6c7',
      text: '#ffffff', textGlow: '#ff3fd2', sub: '#2df4ff', ink: null, sparks: ['#2df4ff', '#8bff6b']
    },
    light: {
      bg0: '#fffaf0', bg1: '#ffeec8', wall: '#1d1530', wallGlow: null, lane: '#ffe1a0',
      peg: '#1b5fe0', pegHit: '#e0322b', bumper: '#e0322b', bumperCore: '#ffd23f', flipper: '#ffd23f',
      flipperEdge: '#1d1530', laneOff: 'rgba(29,21,48,.12)', laneOn: '#12a150', ball0: '#ffffff', ball1: '#7d86a0',
      text: '#1d1530', textGlow: null, sub: '#e0322b', ink: '#1d1530', sparks: ['#e0322b', '#1b5fe0']
    }
  };
  var pal = PAL.dark;
  var staticLayer = document.createElement('canvas');
  var scale = 1;

  function themeName() {
    return root.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var cssW = rect.width || 360;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssW * H / W * dpr);
    scale = canvas.width / W;
    buildStatic();
    draw();
  }

  // 背景、墙体等静态元素预渲染到离屏画布
  function buildStatic() {
    pal = PAL[themeName()];
    staticLayer.width = canvas.width;
    staticLayer.height = canvas.height;
    var g = staticLayer.getContext('2d');
    g.setTransform(scale, 0, 0, scale, 0, 0);
    var grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, pal.bg0);
    grd.addColorStop(1, pal.bg1);
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);

    // 发射通道底色
    g.fillStyle = pal.lane;
    g.globalAlpha = 0.35;
    g.fillRect(LANE_X, 205, OUTER_R - LANE_X, 355);
    g.globalAlpha = 1;

    if (themeName() === 'dark') {
      // 台面网格，营造街机厅地板感
      g.strokeStyle = 'rgba(181,108,255,.08)';
      g.lineWidth = 1;
      for (var x = 0; x <= W; x += 24) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, H);
        g.stroke();
      }
      for (var y = 0; y <= H; y += 24) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
    } else {
      g.fillStyle = 'rgba(27,95,224,.10)';
      for (var yy = 6; yy < H; yy += 14) {
        for (var xx = (yy / 14) % 2 ? 13 : 6; xx < W; xx += 14) {
          g.beginPath();
          g.arc(xx, yy, 1.4, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = pal.wall;
    g.lineWidth = themeName() === 'dark' ? 2.5 : 4;
    if (pal.wallGlow) {
      g.shadowColor = pal.wallGlow;
      g.shadowBlur = 10;
    }
    walls.forEach(function (s) {
      g.beginPath();
      g.moveTo(s.ax, s.ay);
      g.lineTo(s.bx, s.by);
      g.stroke();
    });
    g.shadowBlur = 0;
  }

  function glow(color, blur) {
    if (themeName() === 'dark') {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
    }
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(staticLayer, 0, 0);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    var dark = themeName() === 'dark';

    // 上方通道灯
    lanes.forEach(function (l) {
      var on = l.lit || l.flash > 0;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = on ? pal.laneOn : pal.laneOff;
      if (on) {
        glow(pal.laneOn, 16);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      if (pal.ink) {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = pal.ink;
        ctx.stroke();
      }
    });

    // 钉阵
    pegs.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + p.flash * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = p.flash > 0.05 ? pal.pegHit : pal.peg;
      if (p.flash > 0.05) {
        glow(pal.peg, 12);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 弹跳柱
    bumpers.forEach(function (b) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + b.flash * 3, 0, Math.PI * 2);
      ctx.fillStyle = b.flash > 0.05 ? pal.bumper : pal.bumperCore;
      glow(pal.bumper, 8 + b.flash * 24);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = dark ? 3 : 3.5;
      ctx.strokeStyle = dark ? pal.bumper : pal.ink;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = dark ? (b.flash > 0.05 ? '#ffffff' : pal.bumper) : (b.flash > 0.05 ? '#ffffff' : pal.bumper);
      ctx.fill();
    });

    // 挡板
    flippers.forEach(function (f) {
      var tip = flipperTip(f);
      ctx.lineCap = 'round';
      if (pal.ink) {
        ctx.strokeStyle = pal.ink;
        ctx.lineWidth = FL_W * 2 + 4;
        ctx.beginPath();
        ctx.moveTo(f.px, f.py);
        ctx.lineTo(tip[0], tip[1]);
        ctx.stroke();
      }
      ctx.strokeStyle = pal.flipper;
      ctx.lineWidth = FL_W * 2;
      glow(pal.flipper, f.pressed ? 18 : 8);
      ctx.beginPath();
      ctx.moveTo(f.px, f.py);
      ctx.lineTo(tip[0], tip[1]);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = pal.flipperEdge;
      ctx.beginPath();
      ctx.arc(f.px, f.py, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 火花
    sparks.forEach(function (s) {
      ctx.globalAlpha = Math.max(0, s.life / 0.45);
      ctx.fillStyle = pal.sparks[s.hue];
      ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    });
    ctx.globalAlpha = 1;

    // 钢珠
    var bg = ctx.createRadialGradient(ball.x - 2.5, ball.y - 2.5, 1, ball.x, ball.y, BALL_R);
    bg.addColorStop(0, pal.ball0);
    bg.addColorStop(1, pal.ball1);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    glow('rgba(255,255,255,.9)', 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (pal.ink) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = pal.ink;
      ctx.stroke();
    }

    // 文字层
    var blinkOn = reduceMotion || Math.floor(state.time * 2) % 2 === 0;
    if (state.mode === 'attract' && blinkOn) {
      banner(PP.t('gameAttract'), null, 448);
    } else if (state.mode === 'idle') {
      banner(PP.t('gameStart'), null, 448);
    } else if (state.mode === 'over') {
      banner(PP.t('gameOver'), blinkOn ? PP.t('gameTap') : '', 300);
    }
  }

  function banner(title, sub, y) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var big = title.length > 14 ? 17 : 26;
    ctx.font = '900 ' + big + 'px ' + getComputedStyle(document.body).fontFamily;
    if (pal.ink) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(title, 166, y);
    }
    ctx.fillStyle = pal.text;
    glow(pal.textGlow || '#000', 14);
    ctx.fillText(title, 166, y);
    ctx.shadowBlur = 0;
    if (sub) {
      ctx.font = '700 13px ' + getComputedStyle(document.body).fontFamily;
      ctx.fillStyle = pal.sub;
      ctx.fillText(sub, 166, y + 30);
    }
  }

  // ---------- 主循环（离开视口或页面隐藏时暂停） ----------
  var running = false;
  var inView = true;
  var last = 0;
  var acc = 0;
  var FRAME = 1 / 60;

  function frame(now) {
    if (!running) {
      return;
    }
    var dt = last ? Math.min(0.05, (now - last) / 1000) : FRAME;
    last = now;
    acc += dt;
    while (acc >= FRAME) {
      tick(FRAME);
      acc -= FRAME;
    }
    draw();
    requestAnimationFrame(frame);
  }

  function shouldRun() {
    return inView && document.visibilityState !== 'hidden' && state.mode !== 'idle';
  }

  function sync() {
    var want = shouldRun();
    if (want && !running) {
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    } else if (!want && running) {
      running = false;
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.05 }).observe(canvas);
  }
  document.addEventListener('visibilitychange', sync);

  // ---------- 输入 ----------
  function takeOver() {
    if (state.mode === 'attract' || state.mode === 'idle') {
      newGame('play');
      sync();
      return true;
    }
    if (state.mode === 'over') {
      newGame('play');
      return true;
    }
    return false;
  }

  function setFlipper(i, down) {
    flippers[i].pressed = down;
    flippers[i].ai = 0;
  }

  var pointers = {};
  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    var restarted = takeOver();
    var rect = canvas.getBoundingClientRect();
    var side = e.clientX - rect.left < rect.width / 2 ? 0 : 1;
    pointers[e.pointerId] = side;
    if (!restarted && state.inLane) {
      launch();
    }
    setFlipper(side, true);
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(e.pointerId);
    }
  });
  function release(e) {
    if (pointers[e.pointerId] !== undefined) {
      setFlipper(pointers[e.pointerId], false);
      delete pointers[e.pointerId];
    }
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  var KEYS = { ArrowLeft: 0, KeyA: 0, KeyZ: 0, ArrowRight: 1, KeyD: 1, Slash: 1 };
  function typing(e) {
    var tag = e.target && e.target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }
  window.addEventListener('keydown', function (e) {
    if (typing(e) || !inView) {
      return;
    }
    if (KEYS[e.code] !== undefined) {
      e.preventDefault();
      if (!e.repeat) {
        takeOver();
      }
      setFlipper(KEYS[e.code], true);
    } else if (e.code === 'Space' && (state.mode === 'play' || state.mode === 'over')) {
      e.preventDefault();
      if (!takeOver()) {
        launch();
      }
    }
  });
  window.addEventListener('keyup', function (e) {
    if (KEYS[e.code] !== undefined) {
      setFlipper(KEYS[e.code], false);
    }
  });

  document.addEventListener('pp:theme', function () {
    buildStatic();
    draw();
  });
  document.addEventListener('pp:lang', function () {
    draw();
  });
  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 120);
  });

  newGame(state.mode);
  resize();
  updateBoard();
  sync();
})();
