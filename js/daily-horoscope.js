/**
 * 每日运势 · 星座性格 · 万年历
 */

var DailyHoroscope = (function() {
  'use strict';

  var ZODIAC_ALL = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  var ZODIAC_SYM = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  var ZODIAC_ELEM = ['火','土','风','水','火','土','风','水','火','土','风','水'];
  var ZODIAC_MODE = ['基本','固定','变动','基本','固定','变动','基本','固定','变动','基本','固定','变动'];
  var ZODIAC_RULER = ['火星','金星','水星','月亮','太阳','水星','金星','冥王星','木星','土星','天王星','海王星'];
  var ZODIAC_DATES = [
    '3月21日-4月19日','4月20日-5月20日','5月21日-6月21日','6月22日-7月22日',
    '7月23日-8月22日','8月23日-9月22日','9月23日-10月23日','10月24日-11月22日',
    '11月23日-12月21日','12月22日-1月19日','1月20日-2月18日','2月19日-3月20日'
  ];

  // 星座详细描述
  var ZODIAC_PROFILES = {
    '白羊': { trait:'热情冲动，勇往直前，充满竞争心和开拓精神。作为黄道第一个星座，白羊拥有初生般的活力和无畏。',
      love:'在爱情中主动热情，喜欢追求和征服的感觉。坦率直接的表达方式。',
      career:'适合需要开创性和竞争性的工作，如创业、销售、体育、军警等。',
      keywords:['勇敢','直接','热情','冲动','领导','竞争'] },
    '金牛': { trait:'稳重务实，重视物质安全感，具有艺术审美。固执但可靠，是值得信赖的朋友和伴侣。',
      love:'对待感情认真持久，注重身体的触碰和实际的付出。慢热但深情。',
      career:'适合金融、美食、艺术设计、农业等需要耐心和审美的领域。',
      keywords:['稳重','务实','审美','顽固','忠诚','享受'] },
    '双子': { trait:'机智灵活，好奇心旺盛，善于沟通表达。多变是双子的天性，喜欢同时处理多件事情。',
      love:'在关系中需要智力上的刺激和新鲜感，善于用语言表达爱意。',
      career:'适合媒体、销售、写作、教育、互联网等需要沟通和适应力的工作。',
      keywords:['机智','好奇','沟通','多变','幽默','灵活'] },
    '巨蟹': { trait:'情感丰富，家庭观念强，具有强烈的保护欲。敏感而温柔，记忆力极好。',
      love:'在爱情中极度忠诚和照顾对方，需要安全感，容易产生依赖。',
      career:'适合教育、护理、餐饮、房地产、心理咨询等需要关怀和滋养的工作。',
      keywords:['温柔','顾家','敏感','保护','念旧','直觉'] },
    '狮子': { trait:'自信大方，具有天生的领导力和舞台魅力。慷慨热情，喜欢成为关注的中心。',
      love:'浪漫热情，喜欢被崇拜和赞美，会大方为爱人付出。',
      career:'适合演艺、管理、教育、时尚、创意等需要展现个人魅力的工作。',
      keywords:['自信','慷慨','领导','热情','骄傲','创意'] },
    '处女': { trait:'细致严谨，追求完美，善于分析和解决问题。谦虚务实，是团队中不可或缺的执行者。',
      love:'在感情中注重细节和服务，不善于表达但会默默付出。',
      career:'适合医疗、研究、编辑、数据分析、质量管理等需要精细操作的工作。',
      keywords:['细致','完美','分析','服务','谦虚','务实'] },
    '天秤': { trait:'优雅平衡，追求和谐与美感，善于社交和调解。犹豫不决是最大弱点。',
      love:'注重关系的平等和和谐，浪漫温柔，是体贴周到的伴侣。',
      career:'适合法律、外交、设计、公关、艺术等需要审美和社交能力的工作。',
      keywords:['优雅','公正','社交','犹豫','和谐','审美'] },
    '天蝎': { trait:'深沉强烈，具有强大的意志力和洞察力。情感深刻，爱恨分明。',
      love:'爱情中极度专一和热烈，占有欲强，渴望灵魂层面的连接。',
      career:'适合侦探、心理、投资、科研、医疗等需要深度和洞察力的工作。',
      keywords:['深刻','执着','洞察','神秘','极端','意志'] },
    '射手': { trait:'乐观自由，热爱冒险和探索，具有哲学思维。坦诚直率，不喜欢被束缚。',
      love:'在关系中需要自由空间，热情但不喜欢黏腻，追求精神共鸣。',
      career:'适合旅行、教育、出版、外贸、哲学等需要视野和自由的工作。',
      keywords:['乐观','自由','冒险','坦率','哲学','探索'] },
    '摩羯': { trait:'踏实稳重，具有强烈的责任感和事业心。坚韧不拔，目标明确，大器晚成。',
      love:'对待感情认真负责，虽然不浪漫但极为可靠，是值得托付终身的伴侣。',
      career:'适合管理、工程、建筑、金融、政府等需要耐心和实力的工作。',
      keywords:['踏实','负责','坚韧','务实','野心','传统'] },
    '水瓶': { trait:'独立创新，思维超前，具有人道主义精神。理性冷静，重视朋友和社群。',
      love:'在感情中需要精神共鸣和独立的个人空间，朋友式恋爱最舒适。',
      career:'适合科技、发明、公益、设计、占星等需要创新和独立思维的工作。',
      keywords:['创新','独立','博爱','理性','独特','超前'] },
    '双鱼': { trait:'温柔梦幻，具有丰富的想象力和共情能力。感性而浪漫，是天然的艺术家。',
      love:'在爱情中充满浪漫幻想，容易为爱牺牲，需要被保护和理解。',
      career:'适合艺术、音乐、电影、公益、心理咨询等需要灵感和同情心的工作。',
      keywords:['梦幻','温柔','感性','艺术','同情','灵感'] }
  };

  // ==================== 每日运势 ====================

  function getDailyHoroscope(zodiacIndex, date) {
    date = date || new Date();
    var daySeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + zodiacIndex;
    var rng = mulberry32(daySeed);

    var categories = ['综合','爱情','事业','财运','健康'];
    var result = { zodiac: ZODIAC_ALL[zodiacIndex], symbol: ZODIAC_SYM[zodiacIndex], date: date.toISOString().slice(0,10), ratings:{}, advice:{} };

    categories.forEach(function(cat) {
      var rating = Math.floor(rng() * 5) + 1;
      result.ratings[cat] = rating;
      result.advice[cat] = generateAdvice(cat, rating, zodiacIndex);
    });

    result.luckyColor = ['红色','蓝色','绿色','金色','紫色','白色','橙色','粉色'][Math.floor(rng() * 8)];
    result.luckyNumber = Math.floor(rng() * 99) + 1;
    result.luckyZodiac = ZODIAC_ALL[(zodiacIndex + Math.floor(rng() * 5) + 3) % 12];
    result.summary = result.advice['综合'];

    return result;
  }

  function getWeeklyHoroscope(zodiacIndex, startDate) {
    startDate = startDate || new Date();
    var days = [];
    for (var d = 0; d < 7; d++) {
      var date = new Date(startDate);
      date.setDate(date.getDate() + d);
      days.push(getDailyHoroscope(zodiacIndex, date));
    }
    return { zodiac: ZODIAC_ALL[zodiacIndex], symbol: ZODIAC_SYM[zodiacIndex], days: days };
  }

  function getYearlyHoroscope(zodiacIndex, year) {
    year = year || new Date().getFullYear();
    var yearSeed = year * 100 + zodiacIndex;
    var rng = mulberry32(yearSeed);

    return {
      zodiac: ZODIAC_ALL[zodiacIndex], symbol: ZODIAC_SYM[zodiacIndex], year: year,
      overall: { rating: Math.floor(rng() * 3) + 3, text: generateYearlyText(zodiacIndex, year, rng) },
      career: { rating: Math.floor(rng() * 3) + 3, text: '今年你的事业将' + ['稳步发展','迎来转折','充满挑战','有重大突破'][Math.floor(rng()*4)] },
      love: { rating: Math.floor(rng() * 3) + 3, text: '感情方面' + ['桃花运旺盛','需要多些耐心','会有重要邂逅','关系趋于稳定'][Math.floor(rng()*4)] },
      money: { rating: Math.floor(rng() * 3) + 3, text: '财运' + ['稳中有升','需要谨慎理财','有意外的收获','适合投资'][Math.floor(rng()*4)] }
    };
  }

  function generateAdvice(category, rating, zIdx) {
    var advicePool = {
      '综合': {
        1: ['今天可能有些挑战，保持耐心和冷静最重要','建议减少重要决策，先观察再行动'],
        2: ['整体运势平平，适合专注于日常事务','稳扎稳打，不要急于求成'],
        3: ['运势尚可，把握机会展现自己','中规中矩的一天，保持平常心'],
        4: ['运势不错，诸事顺遂，可以大胆推进计划','好运气在身边，适合社交和扩展人脉'],
        5: ['运势极佳！今天是你的幸运日，把握每一个机会','能量爆棚，适合做重要决策和开启新项目']
      },
      '爱情': {
        1: ['感情运势低迷，避免与伴侣争执','单身者今天不宜主动出击'],
        2: ['感情平淡，给对方多一些空间','伴侣之间需要更多耐心'],
        3: ['感情运势一般，适合平淡相处','可以给伴侣准备一个小惊喜'],
        4: ['爱情运势佳，适合约会和表白','感情甜蜜，伴侣互动愉快'],
        5: ['桃花旺盛！单身者有机会遇到心仪对象','感情升温，是表达爱意的最佳时机']
      },
      '事业': {
        1: ['工作中可能遇到阻碍，保持冷静应对','避免与同事发生冲突'],
        2: ['工作效率一般，适合处理常规事务','重要项目暂时延后'],
        3: ['工作稳步推进，可以尝试新的方法','与同事合作会有不错的结果'],
        4: ['事业运势上升，适合展示自己的能力','今天工作效率很高，把握良机'],
        5: ['事业运势爆棚！大胆推进你的计划','领导赏识，有望获得晋升或重要机会']
      },
      '财运': {
        1: ['财运欠佳，避免不必要的开支','今天不适合投资或大额消费'],
        2: ['财务状况稳定，保持现有的理财策略','不建议冒险投资'],
        3: ['财运平稳，小额消费可以接受','可以考虑适度的财务规划'],
        4: ['财运良好，可能有意外收入','适合进行合理的投资决策'],
        5: ['财运旺盛！可能会有较大的收获','适合投资和理财，把握赚钱机会']
      },
      '健康': {
        1: ['身体状况需要关注，避免熬夜','注意饮食卫生，多休息'],
        2: ['健康一般，适当运动有益身心','注意压力和情绪管理'],
        3: ['健康尚可，保持规律作息','喝足够的水，注意营养均衡'],
        4: ['身体状况不错，精力充沛','适合进行一些运动锻炼'],
        5: ['健康状态极佳，充满活力','今天适合尝试新的运动方式']
      }
    };
    var pool = advicePool[category] || advicePool['综合'];
    var options = pool[rating] || pool[3];
    return options[Math.floor(Math.random() * options.length)];
  }

  function generateYearlyText(zIdx, year, rng) {
    var texts = [
      '今年是' + ZODIAC_ALL[zIdx] + '座充满机遇的一年，土星和木星的位置对你有利，特别是在事业和个人成长方面。',
      '对于' + ZODIAC_ALL[zIdx] + '来说，今年将是转型和突破的重要年份。注意把握好年中出现的几个关键机会。',
      '今年' + ZODIAC_ALL[zIdx] + '座的整体运势较为平稳，适合深耕现有领域，不宜贸然转型。感情方面有不错的进展。',
      ZODIAC_ALL[zIdx] + '座今年将迎来重要的成长机会，挑战与机遇并存。保持信心，你能够跨越所有障碍。'
    ];
    return texts[Math.floor(rng() * texts.length)];
  }

  // ==================== 星座性格 ====================

  function getZodiacProfile(zodiacIndex) {
    var name = ZODIAC_ALL[zodiacIndex];
    var profile = ZODIAC_PROFILES[name];
    return {
      name: name, symbol: ZODIAC_SYM[zodiacIndex],
      element: ZODIAC_ELEM[zodiacIndex], mode: ZODIAC_MODE[zodiacIndex],
      ruler: ZODIAC_RULER[zodiacIndex], dateRange: ZODIAC_DATES[zodiacIndex],
      trait: profile.trait, love: profile.love, career: profile.career, keywords: profile.keywords
    };
  }

  function getZodiacByBirthDate(month, day) {
    var boundaries = [20,19,21,20,21,22,23,23,23,22,22,19];
    var idx = month - 1;
    if (day >= boundaries[idx]) idx = (idx + 1) % 12;
    return idx;
  }

  // ==================== 万年历 ====================

  function getCalendarMonth(year, month) {
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    var weeks = [];
    var week = [];

    // Fill leading blanks (Monday start)
    var startOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (var i = 0; i < startOffset; i++) {
      week.push(null);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      week.push({ day: d, date: year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0') });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    while (week.length > 0 && week.length < 7) {
      week.push(null);
    }
    if (week.length > 0) weeks.push(week);

    return {
      year: year, month: month,
      daysInMonth: daysInMonth,
      weeks: weeks
    };
  }

  // ==================== 公共接口 ====================

  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  return {
    ZODIAC_ALL: ZODIAC_ALL,
    ZODIAC_SYM: ZODIAC_SYM,
    ZODIAC_ELEM: ZODIAC_ELEM,
    ZODIAC_PROFILES: ZODIAC_PROFILES,
    getDailyHoroscope: getDailyHoroscope,
    getWeeklyHoroscope: getWeeklyHoroscope,
    getYearlyHoroscope: getYearlyHoroscope,
    getZodiacProfile: getZodiacProfile,
    getZodiacByBirthDate: getZodiacByBirthDate,
    getCalendarMonth: getCalendarMonth
  };
})();
