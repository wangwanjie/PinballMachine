/* Pocket Pinball 主页：三语、三态主题、七段数码管、滚动渐入 */
(function () {
  'use strict';

  var root = document.documentElement;
  var store = null;
  try {
    store = window.localStorage;
  } catch (e) {
    store = null;
  }

  // ---------- 文案 ----------
  var I18N = {
    'zh-Hans': {
      title: 'Pocket Pinball · 竖屏街机弹珠游戏',
      desc: 'Pocket Pinball 是一款 iPhone 竖屏街机弹珠游戏：投珠、锁倍率、拉弹簧，把钢珠砸进亮槽。9 套机台皮肤、8 种背景音乐、8 种音效风格，无需账号。',
      skip: '跳到正文', iconAlt: 'Pocket Pinball 图标', langLabel: '语言', themeLabel: '主题',
      themeLight: '浅色', themeDark: '深色', themeSystem: '跟随系统',
      kicker: 'iPhone · 竖屏街机弹珠',
      lead: '投珠、锁倍率、拉弹簧，把钢珠砸进亮槽。一台装进口袋的街机，开局快，重来更快。',
      ctaDownload: '下载 IPA', ctaInstall: '安装须知',
      ctaFine: 'v1.0 · iOS 15.0+ · Ad Hoc 签名，仅限已登记设备直接安装',
      sbScore: '得分', sbBall: '球', sbMulti: '倍率',
      canvasLabel: '可以玩的迷你弹珠台：方向键左右或点按左右半屏控制挡板',
      hint: '控制挡板 · 点按左右半屏也行 · 空格发球',
      gameAttract: '按 ← → 接管', gameOver: '游戏结束', gameTap: '点按或空格再来一局', gameStart: '按 ← → 或点按开始',
      howTitle: '一局怎么玩',
      s1t: '投珠', s1d: '点投珠按钮把钢珠投进机台，至少 5 颗才能开局。',
      s2t: '锁倍率', s2d: '机台锁定本局倍率，并点亮底部的若干槽位。',
      s3t: '拉弹簧', s3d: '按住弹簧向下拖动蓄力，看准节奏松手，顶杆击球。',
      s4t: '进亮槽', s4d: '钢珠穿过钉阵落进亮槽就算命中，按倍率返还弹珠。',
      rWin: '命中', rWinD: '落入亮槽，按倍率返还',
      rNear: '差一点', rNearD: '落入暗槽，但擦到亮槽边缘',
      rMiss: '落空', rMissD: '落入暗槽，本局没有返还',
      shotsTitle: '机台实拍',
      shot1Alt: '蓄力阶段：钉阵下方四个槽位被点亮', shot1Cap: '蓄力：弹簧压力实时显示',
      shot2Alt: '命中结算：返还 20 颗弹珠，倍率 4x', shot2Cap: '命中：倍率 4x，返还 +20',
      shot3Alt: '差一点：钢珠落入暗槽，紧挨 8x 亮槽', shot3Cap: '差一点：只差一格进亮槽',
      vibesTitle: '机台氛围',
      vibesLead: '皮肤只换灯光与配色，不改玩法。部分皮肤会同步更换主屏幕图标。',
      skinsT: '机台皮肤', musicT: '背景音乐', sfxT: '音效风格',
      freeNote: '标绿点的为默认免费项（免费范围可由远程配置调整）；其余内容通过应用内「永久解锁」一次性开启。',
      factsTitle: '机台规则',
      f1: '弹珠少于 100 颗时，可一键重置为 100 颗',
      f2: '每日免费重置次数：普通 3 次，永久解锁后 6 次',
      f3: '无需注册账号，进度保存在本机',
      f4: '界面语言：简体中文、繁體中文、English',
      installTitle: '下载与安装',
      tVer: '版本', tSys: '系统要求', tSysV: 'iPhone · iOS 15.0 或更高', tSign: '签名', tSize: '大小', tExp: '描述文件有效期至',
      allReleases: '查看全部版本',
      limitT: '安装限制',
      limitD: '这是 App Store 之外的分发版本。安装包使用 Ad Hoc 描述文件签名，只有 UDID 已登记在该描述文件中的设备才能直接安装；其他设备安装会失败。',
      i1: '已登记设备：用 Mac 上的 Finder 或 Apple Configurator，把 IPA 拖到已连接的 iPhone 上安装。',
      i2: '未登记设备：可以尝试用 AltStore、Sideloadly 等工具以自己的 Apple ID 重新签名后安装，能否成功取决于工具与账号，这里不作保证；免费 Apple ID 签名通常 7 天后需重新签名。',
      i3: '描述文件在 2027-04-05 过期，之后已安装的副本将无法打开，需要换用新的安装包。',
      i4: '应用内购买在这种分发方式下走 Apple 沙盒环境，无法真实付费；默认免费的皮肤、音乐与音效可以直接游玩。',
      privTitle: '隐私',
      p1: '语言、音频、外观、弹珠数量、每日重置计数和安装标识保存在设备本地。',
      p2: '启动时向 RCPlatform 拉取运行时配置（隐私政策链接、免费内容、重置策略等），请求中带有应用版本与本地生成的安装标识。',
      p3: '购买与恢复购买由 Apple StoreKit 处理，应用不接触你的支付卡信息。',
      privLink: '完整隐私政策', supportLink: '技术支持',
      more: 'VanJay 的更多作品', repo: 'GitHub 仓库', feedback: '反馈问题',
      skins: ['晴空街机', '午夜霓虹', '糖果跃动', '赛博脉冲', '粉曜星云', '闪电玩场', '恐龙探险', '云梦港湾', '像素闯关'],
      music: ['霓虹脉冲', '糖弹跳跳', '钢芯街机', '午夜漂移', '晴昼嘉年华', '丛林大鼓', '月夜摇篮', '像素巡游'],
      sfx: ['玻璃电流', '果冻弹珠', '金属核心', '蓝调回响', '彩炮礼花', '恐龙重踏', '星铃微光', '像素火花'],
      freeTag: '默认免费'
    },
    'zh-Hant': {
      title: 'Pocket Pinball · 直向街機彈珠遊戲',
      desc: 'Pocket Pinball 是一款 iPhone 直向街機彈珠遊戲：投珠、鎖倍率、拉彈簧，把鋼珠砸進亮槽。9 套機台皮膚、8 種背景音樂、8 種音效風格，不需要帳號。',
      skip: '跳到正文', iconAlt: 'Pocket Pinball 圖示', langLabel: '語言', themeLabel: '主題',
      themeLight: '淺色', themeDark: '深色', themeSystem: '跟隨系統',
      kicker: 'iPhone · 直向街機彈珠',
      lead: '投珠、鎖倍率、拉彈簧，把鋼珠砸進亮槽。一台裝進口袋的街機，開局快，重來更快。',
      ctaDownload: '下載 IPA', ctaInstall: '安裝須知',
      ctaFine: 'v1.0 · iOS 15.0+ · Ad Hoc 簽署，僅限已登錄裝置直接安裝',
      sbScore: '得分', sbBall: '球', sbMulti: '倍率',
      canvasLabel: '可以玩的迷你彈珠台：方向鍵左右或點按左右半邊螢幕控制擋板',
      hint: '控制擋板 · 點按左右半邊也行 · 空白鍵發球',
      gameAttract: '按 ← → 接手', gameOver: '遊戲結束', gameTap: '點按或空白鍵再來一局', gameStart: '按 ← → 或點按開始',
      howTitle: '一局怎麼玩',
      s1t: '投珠', s1d: '點投珠按鈕把鋼珠投進機台，至少 5 顆才能開局。',
      s2t: '鎖倍率', s2d: '機台鎖定本局倍率，並點亮底部的若干槽位。',
      s3t: '拉彈簧', s3d: '按住彈簧向下拖動蓄力，看準節奏放手，頂桿擊球。',
      s4t: '進亮槽', s4d: '鋼珠穿過釘陣落進亮槽就算命中，按倍率返還彈珠。',
      rWin: '命中', rWinD: '落入亮槽，按倍率返還',
      rNear: '差一點', rNearD: '落入暗槽，但擦到亮槽邊緣',
      rMiss: '落空', rMissD: '落入暗槽，本局沒有返還',
      shotsTitle: '機台實拍',
      shot1Alt: '蓄力階段：釘陣下方四個槽位被點亮', shot1Cap: '蓄力：彈簧壓力即時顯示',
      shot2Alt: '命中結算：返還 20 顆彈珠，倍率 4x', shot2Cap: '命中：倍率 4x，返還 +20',
      shot3Alt: '差一點：鋼珠落入暗槽，緊鄰 8x 亮槽', shot3Cap: '差一點：只差一格進亮槽',
      vibesTitle: '機台氛圍',
      vibesLead: '皮膚只換燈光與配色，玩法維持一致。部分皮膚會同步更換主畫面圖示。',
      skinsT: '機台皮膚', musicT: '背景音樂', sfxT: '音效風格',
      freeNote: '標綠點的為預設免費項目（免費範圍可由遠端設定調整）；其餘內容透過 App 內「永久解鎖」一次開啟。',
      factsTitle: '機台規則',
      f1: '彈珠少於 100 顆時，可一鍵重置為 100 顆',
      f2: '每日免費重置次數：一般 3 次，永久解鎖後 6 次',
      f3: '不需註冊帳號，進度儲存在本機',
      f4: '介面語言：簡體中文、繁體中文、English',
      installTitle: '下載與安裝',
      tVer: '版本', tSys: '系統需求', tSysV: 'iPhone · iOS 15.0 或更新版本', tSign: '簽署', tSize: '大小', tExp: '描述檔有效期限',
      allReleases: '查看所有版本',
      limitT: '安裝限制',
      limitD: '這是 App Store 以外的發佈版本。安裝檔使用 Ad Hoc 描述檔簽署，只有 UDID 已登錄在該描述檔中的裝置才能直接安裝；其他裝置安裝會失敗。',
      i1: '已登錄裝置：用 Mac 上的 Finder 或 Apple Configurator，把 IPA 拖到已連接的 iPhone 上安裝。',
      i2: '未登錄裝置：可以嘗試用 AltStore、Sideloadly 等工具以自己的 Apple ID 重新簽署後安裝，能否成功取決於工具與帳號，這裡無法保證；免費 Apple ID 的簽署通常 7 天後需要重新簽署。',
      i3: '描述檔於 2027-04-05 到期，之後已安裝的副本將無法開啟，需要改用新的安裝檔。',
      i4: 'App 內購買在這種發佈方式下使用 Apple 沙盒環境，無法實際付款；預設免費的皮膚、音樂與音效可以直接遊玩。',
      privTitle: '隱私',
      p1: '語言、音訊、外觀、彈珠數量、每日重置計數和安裝識別碼儲存在裝置本機。',
      p2: '啟動時向 RCPlatform 取得執行期設定（隱私權政策連結、免費內容、重置策略等），請求中帶有 App 版本與本機產生的安裝識別碼。',
      p3: '購買與恢復購買由 Apple StoreKit 處理，App 不會接觸你的付款卡資訊。',
      privLink: '完整隱私權政策', supportLink: '技術支援',
      more: 'VanJay 的更多作品', repo: 'GitHub 儲存庫', feedback: '回報問題',
      skins: ['晴空街機', '午夜霓虹', '糖果躍動', '賽博脈衝', '粉曜星雲', '閃電玩場', '恐龍探險', '雲夢港灣', '像素闖關'],
      music: ['霓虹脈衝', '糖彈跳跳', '鋼芯街機', '午夜漂移', '晴晝嘉年華', '叢林大鼓', '月夜搖籃', '像素巡遊'],
      sfx: ['玻璃電流', '果凍彈珠', '金屬核心', '藍調回響', '彩炮禮花', '恐龍重踏', '星鈴微光', '像素火花'],
      freeTag: '預設免費'
    },
    en: {
      title: 'Pocket Pinball · Portrait arcade pinball for iPhone',
      desc: 'Pocket Pinball is a portrait arcade marble game for iPhone: insert marbles, lock the multiplier, pull the spring and slam the steel ball into a lit slot. 9 cabinet skins, 8 music themes, 8 sound styles, no account needed.',
      skip: 'Skip to content', iconAlt: 'Pocket Pinball icon', langLabel: 'Language', themeLabel: 'Theme',
      themeLight: 'Light', themeDark: 'Dark', themeSystem: 'System',
      kicker: 'iPhone · Portrait arcade pinball',
      lead: 'Insert marbles, lock the multiplier, pull the spring and slam the steel ball into a lit slot. An arcade cabinet in your pocket: quick to start, quicker to retry.',
      ctaDownload: 'Download IPA', ctaInstall: 'Install notes',
      ctaFine: 'v1.0 · iOS 15.0+ · Ad Hoc signed, installs directly only on registered devices',
      sbScore: 'Score', sbBall: 'Ball', sbMulti: 'Multi',
      canvasLabel: 'A playable mini pinball table: use the left and right arrow keys or tap either half to flip',
      hint: 'flip · or tap either half · Space to launch',
      gameAttract: 'Press ← → to take over', gameOver: 'GAME OVER', gameTap: 'Tap or press Space to play again', gameStart: 'Press ← → or tap to start',
      howTitle: 'How a round works',
      s1t: 'Insert', s1d: 'Tap the insert button to feed marbles into the cabinet. You need at least 5 to start.',
      s2t: 'Lock', s2d: 'The cabinet locks this round’s multiplier and lights up some of the slots at the bottom.',
      s3t: 'Pull', s3d: 'Hold the spring and drag down to charge, then release on rhythm to strike the ball.',
      s4t: 'Land', s4d: 'Drop through the peg field into a lit slot to win marbles back at the multiplier.',
      rWin: 'JACKPOT', rWinD: 'Landed in a lit slot, paid at the multiplier',
      rNear: 'SO CLOSE', rNearD: 'Dark slot, but it brushed a lit pocket',
      rMiss: 'MISS', rMissD: 'Dark slot, no payout this round',
      shotsTitle: 'On the cabinet',
      shot1Alt: 'Charging: four slots under the peg field are lit', shot1Cap: 'Charge: live spring pressure',
      shot2Alt: 'Win screen: 20 marbles back at 4x', shot2Cap: 'Jackpot: 4x multiplier, +20 back',
      shot3Alt: 'Near miss: the ball landed in a dark slot next to an 8x lit slot', shot3Cap: 'So close: one slot away',
      vibesTitle: 'Cabinet vibes',
      vibesLead: 'Skins change the lights and colours while the rules stay the same. Some skins also switch the Home Screen icon.',
      skinsT: 'Cabinet skins', musicT: 'Music themes', sfxT: 'Sound styles',
      freeNote: 'Green-dotted items are free by default (the free set can be adjusted by remote configuration); everything else opens with the one-time in-app Lifetime Unlock.',
      factsTitle: 'House rules',
      f1: 'Below 100 marbles? Reset back to 100 in one tap',
      f2: 'Free resets per day: 3 standard, 6 with Lifetime Unlock',
      f3: 'No account. Progress stays on your device',
      f4: 'Languages: English, Simplified and Traditional Chinese',
      installTitle: 'Download & install',
      tVer: 'Version', tSys: 'Requires', tSysV: 'iPhone · iOS 15.0 or later', tSign: 'Signing', tSize: 'Size', tExp: 'Profile expires',
      allReleases: 'All releases',
      limitT: 'Install limits',
      limitD: 'This build is distributed outside the App Store. It is signed with an Ad Hoc provisioning profile, so it installs directly only on devices whose UDID is registered in that profile; installation fails on any other device.',
      i1: 'Registered devices: drag the IPA onto your connected iPhone in Finder or Apple Configurator on a Mac.',
      i2: 'Other devices: you can try re-signing with your own Apple ID using tools such as AltStore or Sideloadly. Success depends on the tool and account and is not guaranteed; free Apple ID signatures usually need refreshing every 7 days.',
      i3: 'The profile expires on 2027-04-05. After that, installed copies will no longer open and you will need a newer build.',
      i4: 'In this distribution, in-app purchases run in Apple’s sandbox and cannot take real payments. The default free skins, music and sounds are fully playable.',
      privTitle: 'Privacy',
      p1: 'Language, audio, appearance, marble balance, daily reset counters and an install identifier are stored on your device.',
      p2: 'At launch the app fetches runtime configuration (privacy link, free content, reset policy and more) from RCPlatform; requests carry the app version and the locally generated install identifier.',
      p3: 'Purchases and restores go through Apple StoreKit. The app never sees your payment card details.',
      privLink: 'Full privacy policy', supportLink: 'Support',
      more: 'More by VanJay', repo: 'GitHub repository', feedback: 'Feedback',
      skins: ['Sunny Arcade', 'Midnight Neon', 'Candy Pop', 'Cyber Pulse', 'Pink Galaxy', 'Volt Play', 'Dino Safari', 'Dream Harbor', 'Pixel Quest'],
      music: ['Neon Pulse', 'Candy Bounce', 'Steel Arcade', 'Midnight Drift', 'Sun Carnival', 'Jungle Drum', 'Moon Lullaby', 'Pixel Parade'],
      sfx: ['Glass Current', 'Jelly Marble', 'Metal Core', 'Blue Echo', 'Confetti Cannon', 'Dino Stomp', 'Starlight Bell', 'Pixel Spark'],
      freeTag: 'Free by default'
    }
  };

  // 默认免费项下标（与 FreeCosmeticConfiguration.default 一致：前两项）
  var FREE = { skins: [0, 1], music: [0, 1], sfx: [0, 1] };

  var lang = I18N[root.lang] ? root.lang : 'en';

  function t(key) {
    var dict = I18N[lang];
    return dict[key] !== undefined ? dict[key] : I18N.en[key];
  }

  function renderChips(id, key) {
    var ul = document.getElementById(id);
    if (!ul) {
      return;
    }
    var names = t(key);
    ul.textContent = '';
    names.forEach(function (name, i) {
      var li = document.createElement('li');
      li.textContent = name;
      if (FREE[key].indexOf(i) >= 0) {
        li.className = 'free';
        li.title = t('freeTag');
      }
      ul.appendChild(li);
    });
  }

  function applyLang(next, persist) {
    lang = I18N[next] ? next : 'en';
    root.lang = lang;
    document.title = t('title');
    var md = document.querySelector('meta[name="description"]');
    if (md) {
      md.setAttribute('content', t('desc'));
    }
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) {
      ogd.setAttribute('content', t('desc'));
    }
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-aria'));
      el.setAttribute('aria-label', v);
      if (el.tagName === 'BUTTON') {
        el.title = v;
      }
    });
    renderChips('chips-skins', 'skins');
    renderChips('chips-music', 'music');
    renderChips('chips-sfx', 'sfx');
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    if (persist && store) {
      store.setItem('pp-lang', lang);
    }
    document.dispatchEvent(new CustomEvent('pp:lang', { detail: lang }));
  }

  // ---------- 主题 ----------
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(mode, persist) {
    if (['light', 'dark', 'system'].indexOf(mode) < 0) {
      mode = 'system';
    }
    var dark = mode === 'dark' || (mode === 'system' && mq.matches);
    root.dataset.themeMode = mode;
    root.dataset.theme = dark ? 'dark' : 'light';
    var meta = document.getElementById('meta-theme-color');
    if (meta) {
      meta.setAttribute('content', dark ? '#0b0614' : '#fff3d8');
    }
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-btn') === mode));
    });
    if (persist && store) {
      store.setItem('pp-theme', mode);
    }
    document.dispatchEvent(new CustomEvent('pp:theme', { detail: root.dataset.theme }));
  }

  var onSchemeChange = function () {
    if (root.dataset.themeMode === 'system') {
      applyTheme('system', false);
    }
  };
  if (mq.addEventListener) {
    mq.addEventListener('change', onSchemeChange);
  } else if (mq.addListener) {
    mq.addListener(onSchemeChange);
  }

  // ---------- 七段数码管 ----------
  // 段位：a 上、b 右上、c 右下、d 下、e 左下、f 左上、g 中
  var SEGS = {
    a: '2,1 11,1 9,3 4,3', b: '11.5,1.5 11.5,10 10,11 9.5,3.5', c: '11.5,12 11.5,20.5 9.5,18.5 10,13',
    d: '2,21 11,21 9,19 4,19', e: '0.5,12 0.5,20.5 2.5,18.5 2,13', f: '0.5,1.5 0.5,10 2,11 2.5,3.5',
    g: '2,11 3.5,9.8 8.5,9.8 10,11 8.5,12.2 3.5,12.2'
  };
  var DIGITS = {
    '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc',
    '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '', 'x': 'bcefg'
  };
  var NS = 'http://www.w3.org/2000/svg';

  function buildDigit() {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 12 22');
    svg.setAttribute('aria-hidden', 'true');
    Object.keys(SEGS).forEach(function (k) {
      var p = document.createElementNS(NS, 'polygon');
      p.setAttribute('points', SEGS[k]);
      p.setAttribute('data-s', k);
      p.setAttribute('class', 'off');
      svg.appendChild(p);
    });
    return svg;
  }

  function setSeg7(el, text) {
    if (!el) {
      return;
    }
    var n = parseInt(el.getAttribute('data-digits'), 10) || 1;
    if (el.childElementCount !== n) {
      el.textContent = '';
      for (var i = 0; i < n; i++) {
        el.appendChild(buildDigit());
      }
    }
    var s = String(text);
    if (s.length > n) {
      s = s.slice(-n);
    }
    while (s.length < n) {
      s = ' ' + s;
    }
    el.setAttribute('aria-label', String(text).trim());
    Array.prototype.forEach.call(el.children, function (svg, idx) {
      var on = DIGITS[s[idx]] || '';
      Array.prototype.forEach.call(svg.children, function (p) {
        var k = p.getAttribute('data-s');
        p.setAttribute('class', on.indexOf(k) >= 0 ? 'on' : 'off');
      });
    });
  }

  // 供 pinball.js 使用
  window.PP = { t: t, seg7: setSeg7 };

  // ---------- 初始化 ----------
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyLang(b.getAttribute('data-lang'), true);
    });
  });
  document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyTheme(b.getAttribute('data-theme-btn'), true);
    });
  });

  applyLang(lang, false);
  applyTheme(root.dataset.themeMode || 'system', false);
  setSeg7(document.getElementById('sb-score'), '0');
  setSeg7(document.getElementById('sb-ball'), '3');
  setSeg7(document.getElementById('sb-multi'), '1');

  // ---------- 滚动渐入 ----------
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) {
      el.classList.add('in');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      io.observe(el);
    });
  }
})();
