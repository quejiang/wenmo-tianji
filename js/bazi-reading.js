/**
 * 八字命理详细解读引擎 v2 — 问真八字风格
 * 纳音、藏干、空亡、神煞、十神、用神、大运、流年、专项解读
 */

var BaZiReading = (function() {

  var WUXING = ['木','火','土','金','水'];
  var WUXING_COLORS = ['#7ec87e','#e06040','#d0a040','#e0d080','#6090d0'];
  var GAN_WUXING = [0,0,1,1,2,2,3,3,4,4];

  // ---- 地支藏干 (本气/中气/余气) ----
  var ZHI_CANG_GAN = [
    [{g:9,s:'癸'}],                    // 子：癸
    [{g:5,s:'己'},{g:9,s:'癸'},{g:0,s:'辛'}], // 丑：己癸辛
    [{g:0,s:'甲'},{g:2,s:'丙'},{g:4,s:'戊'}], // 寅：甲丙戊
    [{g:1,s:'乙'}],                    // 卯：乙
    [{g:4,s:'戊'},{g:1,s:'乙'},{g:9,s:'癸'}], // 辰：戊乙癸
    [{g:2,s:'丙'},{g:4,s:'戊'},{g:6,s:'庚'}], // 巳：丙戊庚
    [{g:3,s:'丁'},{g:5,s:'己'}],              // 午：丁己
    [{g:5,s:'己'},{g:3,s:'丁'},{g:1,s:'乙'}], // 未：己丁乙
    [{g:6,s:'庚'},{g:8,s:'壬'},{g:4,s:'戊'}], // 申：庚壬戊
    [{g:7,s:'辛'}],                    // 酉：辛
    [{g:4,s:'戊'},{g:7,s:'辛'},{g:3,s:'丁'}], // 戌：戊辛丁
    [{g:8,s:'壬'},{g:0,s:'甲'}]               // 亥：壬甲
  ];

  // ---- 60甲子纳音 ----
  var NAJIA_30 = [
    '海中金','炉中火','大林木','路旁土','剑锋金','山头火',
    '涧下水','城头土','白蜡金','杨柳木','泉中水','屋上土',
    '霹雳火','松柏木','长流水','砂中金','山下火','平地木',
    '壁上土','金箔金','覆灯火','天河水','大驿土','钗钏金',
    '桑柘木','大溪水','沙中土','天上火','石榴木','大海水'
  ];

  // ---- 60甲子配索引 ----
  // 计算 (ganIndex, zhiIndex) 在 60 甲子中的序号 0-59
  // 满足 p%10 == ganIndex && p%12 == zhiIndex (前置: gan%2 == zhi%2)
  function get60JiaziIndex(ganIndex, zhiIndex) {
    var p = ganIndex;
    while (p % 12 !== zhiIndex) p += 10;
    return p;
  }

  // ---- 空亡计算 (旬空) ----
  // 6旬, 每旬10对, 空2个地支
  var XUN_KONG_BY_XUN = [[10,11],[8,9],[6,7],[4,5],[2,3],[0,1]];

  function getXunKong(ganIndex, zhiIndex) {
    var p = get60JiaziIndex(ganIndex, zhiIndex);
    return XUN_KONG_BY_XUN[Math.floor(p / 10)];
  }

  function getNajia(ganIndex, zhiIndex) {
    return NAJIA_30[Math.floor(get60JiaziIndex(ganIndex, zhiIndex) / 2)];
  }

  // ---- 十神 ----
  function getShiShen(dayGanIdx, otherGanIdx) {
    var dayWx = GAN_WUXING[dayGanIdx];
    var otherWx = GAN_WUXING[otherGanIdx];
    var sameYin = (dayGanIdx % 2) === (otherGanIdx % 2);
    if (dayWx === otherWx) return sameYin ? '比肩' : '劫财';
    var rel = (otherWx - dayWx + 5) % 5;
    if (rel === 1) return sameYin ? '偏印' : '正印';
    if (rel === 2) return sameYin ? '食神' : '伤官';
    if (rel === 3) return sameYin ? '七杀' : '正官';
    if (rel === 4) return sameYin ? '偏财' : '正财';
    return '';
  }

  // ---- 五行旺衰 ----
  function calcWuxingStrength(bazi) {
    var weights = [0,0,0,0,0];
    [bazi.year.ganIndex, bazi.month.ganIndex, bazi.day.ganIndex, bazi.hour.ganIndex].forEach(function(g) {
      weights[GAN_WUXING[g]] += 3;
    });
    [bazi.year.zhiIndex, bazi.month.zhiIndex, bazi.day.zhiIndex, bazi.hour.zhiIndex].forEach(function(z) {
      ZHI_CANG_GAN[z].forEach(function(cg, idx) {
        weights[GAN_WUXING[cg.g]] += (idx === 0 ? 2 : 1);
      });
    });
    var monthMainGan = ZHI_CANG_GAN[bazi.month.zhiIndex][0].g;
    weights[GAN_WUXING[monthMainGan]] += 3;
    return weights;
  }

  // ---- 用神 ----
  function calcYongShen(bazi) {
    var ws = calcWuxingStrength(bazi);
    var dayWx = GAN_WUXING[bazi.day.ganIndex];
    var maxIdx = 0, maxVal = 0;
    ws.forEach(function(w,i){ if(w>maxVal){maxVal=w;maxIdx=i;} });
    var yongShen='', xiShen='', jiShen='';
    if (ws[dayWx] < 9) {
      yongShen = WUXING[(dayWx+4)%5];
      xiShen = WUXING[dayWx];
      jiShen = WUXING[maxIdx];
    } else if (ws[dayWx] > 16) {
      yongShen = WUXING[(dayWx+2)%5];
      xiShen = WUXING[(dayWx+3)%5];
      jiShen = WUXING[(dayWx+4)%5];
    } else {
      yongShen = WUXING[(dayWx+1)%5];
      xiShen = WUXING[(dayWx+2)%5];
    }
    return { yongShen:yongShen, xiShen:xiShen, jiShen:jiShen, dayWx:WUXING[dayWx], weights:ws };
  }

  // ---- 神煞 ----
  function calcShenSha(bazi) {
    var ss = [];
    var yM = bazi.year.zhiIndex, yG = bazi.year.ganIndex;
    var moM = bazi.month.zhiIndex, moG = bazi.month.ganIndex;
    var dM = bazi.day.zhiIndex, dG = bazi.day.ganIndex;
    var hM = bazi.hour.zhiIndex, hG = bazi.hour.ganIndex;

    // 天乙贵人: 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 壬癸→巳卯, 辛→午寅
    var tianYiMap = [[1,7],[0,8],[11,9],[10,4],[5,3],[1,7],[0,8],[11,9],[10,4],[5,3]];
    var tianYi = tianYiMap[yG % 10];
    if (tianYi.indexOf(dM)>=0 || tianYi.indexOf(hM)>=0) ss.push({name:'天乙贵人',desc:'一生多得贵人相助，遇难呈祥。',good:true});

    // 文昌: 甲→巳,乙→午,丙→申,丁→酉,戊→申,己→酉,庚→亥,辛→子,壬→寅,癸→卯
    var wenchangMap = [5,6,8,9,8,9,11,0,2,3];
    if (wenchangMap[yG%10] === dM) ss.push({name:'文昌星',desc:'聪明好学，有文采和学术天赋。',good:true});

    // 学堂: 正月(寅)起, 甲→亥,乙→午,...
    var xueTangMap = [11,6,2,11,11,6,2,11,11,6];
    if (xueTangMap[dG%10] === moM) ss.push({name:'学堂',desc:'学习能力强，有学术造诣。',good:true});

    // 驿马: 申子辰在寅,寅午戌在申,巳酉丑在亥,亥卯未在巳
    var tri = dM % 4;
    var yiMaMap = [2,8,11,5];
    if (yiMaMap[tri] === moM || yiMaMap[tri] === hM) ss.push({name:'驿马',desc:'一生奔波走动多，宜向外发展。',good:true});

    // 华盖: 申子辰在辰,寅午戌在戌,巳酉丑在丑,亥卯未在未
    var huaGaiMap = [4,10,1,7];
    if (huaGaiMap[tri] === dM) ss.push({name:'华盖',desc:'性格孤高，有哲学艺术天赋。',good:true});

    // 桃花(咸池): 申子辰在酉,寅午戌在卯,巳酉丑在午,亥卯未在子
    var taoHuaMap = [9,3,6,0];
    if (taoHuaMap[tri] === dM) ss.push({name:'桃花',desc:'异性缘佳，有魅力和艺术天赋。',good:true});

    // 羊刃: 甲→卯,乙→寅,丙→午,丁→巳,戊→午,己→巳,庚→酉,辛→申,壬→子,癸→亥
    var yangRenMap = [3,2,6,5,6,5,9,8,0,11];
    if (yangRenMap[dG%10] === dM) ss.push({name:'羊刃',desc:'性格刚强果决，但需防冲动和意外。',good:false});

    // 劫煞: 申子辰在巳,寅午戌在亥,巳酉丑在寅,亥卯未在申
    var jieShaMap = [5,11,2,8];
    if (jieShaMap[tri] === dM) ss.push({name:'劫煞',desc:'需防意外损失和小人暗算。',good:false});

    // 孤辰: 寅申巳亥在巳(5),子午卯酉在寅(2)
    var guChen = dM%2===0 ? 2 : 5;
    if (guChen === hM) ss.push({name:'孤辰',desc:'性格独立，喜独处，婚缘较迟。',good:false});

    return ss;
  }

  // ---- 性格 ----
  function analyzePersonality(bazi) {
    var dayGan = bazi.day.ganIndex;
    var dayWx = GAN_WUXING[dayGan];
    var yin = dayGan % 2 ? '阴' : '阳';
    return {
      0:{yang:'甲木为参天大树，您性格正直刚毅，有上进心和领导力。为人直率坦诚，不喜拐弯抹角。内心有强烈的成长欲望，渴望在社会中有所建树。有时过于耿直，需要注意柔韧度。',yin:'乙木为藤萝花草，您性格柔韧灵活，适应力强，善于在复杂环境中找到生存之道。为人温和细腻，有艺术天赋。外表柔软但内心坚韧，懂得顺势而为。'},
      1:{yang:'丙火为太阳之火，您性格热情奔放，光明磊落，有强烈的表现欲和感染力。待人真诚大方，走到哪里都是焦点。做事雷厉风行，但需注意持续性。',yin:'丁火为灯烛之火，您性格内敛但内心温暖，有敏锐的洞察力。为人细心周到，善于照顾他人感受。做事专注执着，像烛火一样虽小但能持续燃烧。'},
      2:{yang:'戊土为城墙之土，您性格稳重可靠，诚实守信，有强大的承载力和包容心。为人踏实肯干，是团队中可靠的支柱。但有时过于保守固执。',yin:'己土为田园之土，您性格温和包容，善于滋养他人，有良好的协调能力。为人低调务实，不争不抢但也不轻易妥协。'},
      3:{yang:'庚金为刀剑之金，您性格刚毅果决，有强烈的正义感和原则性。为人干脆利落，执行力强，不喜拖泥带水。适合从事需要决断力的工作。',yin:'辛金为首饰之金，您性格精致细腻，追求完美，有良好的审美品味。为人讲究品质，不将就。外表精致但内心有主见，柔中带刚。'},
      4:{yang:'壬水为江河之水，您性格豁达大气，思维开阔，有强大的包容力和应变能力。为人洒脱不羁，不拘小节。聪明好学，但有时注意力不够集中。',yin:'癸水为雨露之水，您性格细腻敏感，直觉力强，有丰富的内心世界。为人温柔体贴，善于倾听。心思缜密，但有时容易多愁善感。'}
    }[dayWx][yin==='阳'?'yang':'yin'];
  }

  // ---- 事业解读 ----
  function analyzeCareer(bazi, dayWx) {
    var ss = calcShiShenDistribution(bazi);
    var notes = [];
    var ssVals = ss.map(function(s){return s.ganSS;}).concat(ss.map(function(s){return s.zhiSS;}));
    if (ssVals.indexOf('正官')>=0 || ssVals.indexOf('七杀')>=0) notes.push('八字官杀有力，适合从政、管理、军警等需要权威和纪律的行业。');
    if (ssVals.indexOf('正财')>=0 || ssVals.indexOf('偏财')>=0) notes.push('财星显露，有商业头脑，适合经商、金融、贸易等行业。');
    if (ssVals.indexOf('食神')>=0 || ssVals.indexOf('伤官')>=0) notes.push('食伤泄秀，有创意和表达能力，适合艺术、设计、写作、咨询等行业。');
    if (ssVals.indexOf('正印')>=0 || ssVals.indexOf('偏印')>=0) notes.push('印星得力，有学习天赋和贵人运，适合教育、研究、文化等行业。');
    if (ssVals.indexOf('比肩')>=0 || ssVals.indexOf('劫财')>=0) notes.push('比劫旺相，适合与人合作创业或从事需要体力和团队协作的工作。');
    var wxJobs = {木:'教育、文化、环保、出版',火:'传媒、餐饮、能源、演艺',土:'房地产、建筑、金融、管理',金:'科技、法律、精密制造、金融',水:'物流、贸易、咨询、旅游'};
    notes.push('从五行看，' + WUXING[dayWx] + '日主适合从事：' + (wxJobs[WUXING[dayWx]] || '综合类') + '。');
    return notes;
  }

  // ---- 财运解读 ----
  function analyzeWealth(bazi) {
    var ss = calcShiShenDistribution(bazi);
    var ssVals = ss.map(function(s){return s.ganSS;}).concat(ss.map(function(s){return s.zhiSS;}));
    var notes = [];
    var hasZhengCai = ssVals.indexOf('正财')>=0;
    var hasPianCai = ssVals.indexOf('偏财')>=0;
    if (hasZhengCai && hasPianCai) notes.push('正偏财皆备，既有稳定收入来源，也有偏财机遇。理财宜稳中求进。');
    else if (hasZhengCai) notes.push('正财为主，财运通过稳定工作和储蓄积累。建议专注于主业发展。');
    else if (hasPianCai) notes.push('偏财为主，财运起伏较大，有投机获利的可能，但需控制风险。');
    else notes.push('财星不显，财运较为平稳但需主动创造机会。不建议高风险投资。');
    if (ssVals.indexOf('劫财')>=0 && (hasZhengCai||hasPianCai)) notes.push('劫财见财，需注意理财和开销控制，避免因朋友或竞争导致破财。');
    return notes;
  }

  // ---- 婚姻解读 ----
  function analyzeMarriage(bazi) {
    var dayZhi = bazi.day.zhiIndex;
    var ss = calcShiShenDistribution(bazi);
    var notes = [];
    var dayZhiSS = getShiShen(bazi.day.ganIndex, ZHI_CANG_GAN[dayZhi][0].g);
    if (dayZhiSS === '正官' || dayZhiSS === '七杀') notes.push('日支配偶宫坐官星，配偶有一定权威或社会地位，但需注意关系中的掌控平衡。');
    if (dayZhiSS === '正财' || dayZhiSS === '偏财') notes.push('日支坐财星，婚姻中经济因素较重要，配偶务实可靠。');
    if (dayZhiSS === '正印' || dayZhiSS === '偏印') notes.push('日支坐印星，配偶体贴照顾，但有依赖倾向，需保持人格独立。');
    // 桃花神煞
    var tri = dayZhi % 4;
    var taoHuaMap = [9,3,6,0];
    if (taoHuaMap[tri] === bazi.month.zhiIndex) notes.push('月柱带桃花，早年异性缘较旺，感情经历丰富。');
    if (!notes.length) notes.push('婚姻运势适中，需在相处中不断磨合与成长。');
    return notes;
  }

  // ---- 健康解读 ----
  function analyzeHealth(bazi, dayWx) {
    var ws = calcWuxingStrength(bazi);
    var notes = [];
    // 过旺之行 → 相关脏腑
    ws.forEach(function(w,i){ if(w>14) {
      var wxHealth = {0:'木过旺，需注意肝胆和筋骨健康，避免过度劳累。',1:'火过旺，需注意心脑血管和眼部健康，避免情绪过激。',2:'土过旺，需注意脾胃消化系统，饮食宜清淡规律。',3:'金过旺，需注意肺部和呼吸道，避免吸烟和空气污染。',4:'水过旺，需注意肾脏和泌尿系统，避免熬夜和过度饮水。'};
      notes.push(wxHealth[i]);
    }});
    // 过弱
    ws.forEach(function(w,i){ if(w<4) {
      var wxWeak = {0:'木偏弱，注意肝胆保养，多吃绿色蔬菜，多接触自然。',1:'火偏弱，注意补充阳气，适当运动提升代谢。',2:'土偏弱，注意脾胃调理，饮食规律，少食多餐。',3:'金偏弱，注意呼吸道保养，适当深呼吸和肺部锻炼。',4:'水偏弱，注意肾脏保养，保证充足睡眠。'};
      notes.push(wxWeak[i]);
    }});
    if (!notes.length) notes.push('五行相对平衡，身体底子较好，保持规律作息即可。');
    return notes;
  }

  // ---- 胎元 (出生前受胎月份) ----
  // 月柱天干+1，地支+3
  function calcTaiYuan(bazi) {
    var ganIdx = (bazi.month.ganIndex + 1) % 10;
    var zhiIdx = (bazi.month.zhiIndex + 3) % 12;
    var ss = getShiShen(bazi.day.ganIndex, ganIdx);
    return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx], ganIndex: ganIdx, zhiIndex: zhiIdx, full: GAN[ganIdx] + ZHI[zhiIdx], ss: ss, najia: getNajia(ganIdx, zhiIdx) };
  }

  // ---- 命宫 (八字命宫，非紫微) ----
  // 子为正月逆数至生月，再从该位起子时逆数至生时
  function calcBaZiMingGong(bazi) {
    var m = bazi.lunar.lunarMonth; // 1-12
    var s = bazi.hour.shichenIdx;   // 0-11
    var zhiIdx = (25 - m - s + 12) % 12;
    var yearGan = bazi.year.ganIndex;
    var ganBase = [2, 4, 6, 8, 0][yearGan % 5]; // 五虎遁：甲己→丙寅
    var ganIdx = (ganBase + (zhiIdx - 2 + 12) % 12) % 10;
    var ss = getShiShen(bazi.day.ganIndex, ganIdx);
    return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx], ganIndex: ganIdx, zhiIndex: zhiIdx, full: GAN[ganIdx] + ZHI[zhiIdx], ss: ss, najia: getNajia(ganIdx, zhiIdx) };
  }

  // ---- 身宫 (八字身宫，非紫微) ----
  // 子为正月逆数至生月，再从该位起子时顺数至生时
  function calcBaZiShenGong(bazi) {
    var m = bazi.lunar.lunarMonth;
    var s = bazi.hour.shichenIdx;
    var zhiIdx = (13 - m + s + 12) % 12;
    var yearGan = bazi.year.ganIndex;
    var ganBase = [2, 4, 6, 8, 0][yearGan % 5];
    var ganIdx = (ganBase + (zhiIdx - 2 + 12) % 12) % 10;
    var ss = getShiShen(bazi.day.ganIndex, ganIdx);
    return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx], ganIndex: ganIdx, zhiIndex: zhiIdx, full: GAN[ganIdx] + ZHI[zhiIdx], ss: ss, najia: getNajia(ganIdx, zhiIdx) };
  }

  // ---- 流月 (当月干支) ----
  function calcLiuYue(bazi, targetYear, targetMonth) {
    // 流月：以节气为界的月干支
    var lichunYearGan = ((targetYear - 4) % 10 + 10) % 10;
    var ganBase = [2, 4, 6, 8, 0][lichunYearGan % 5]; // 五虎遁
    var zhiIdx = (targetMonth + 1) % 12; // 正月寅(2)
    var ganIdx = (ganBase + (zhiIdx - 2 + 12) % 12) % 10;
    var ss = getShiShen(bazi.day.ganIndex, ganIdx);
    return { gan: GAN[ganIdx], zhi: ZHI[zhiIdx], full: GAN[ganIdx] + ZHI[zhiIdx], ss: ss };
  }

  // ---- 流日 (当日干支) ----
  function calcLiuRi(year, month, day, dayGanIndex) {
    // 基于儒略日计算当日干支
    // 使用简化的日干支推算
    return null; // 外部用 getDayGanZhi 即可
  }

  // ---- 流时 (当前时辰干支) ----
  function calcLiuShi(bazi, hour) {
    var shichenIdx = hour >= 23 || hour < 1 ? 0 : hour < 3 ? 1 : hour < 5 ? 2 : hour < 7 ? 3 : hour < 9 ? 4 : hour < 11 ? 5 : hour < 13 ? 6 : hour < 15 ? 7 : hour < 17 ? 8 : hour < 19 ? 9 : hour < 21 ? 10 : 11;
    var ganBase = [0, 2, 4, 6, 8][bazi.day.ganIndex % 5];
    var ganIdx = (ganBase + shichenIdx) % 10;
    var ss = getShiShen(bazi.day.ganIndex, ganIdx);
    return { gan: GAN[ganIdx], zhi: ZHI[shichenIdx], full: GAN[ganIdx] + ZHI[shichenIdx], ss: ss };
  }

  // ---- 大运 ----
  function calcDaYun(bazi, gender) {
    var isYangYear = bazi.year.ganIndex % 2 === 0;
    var shun = (gender==='male'&&isYangYear) || (gender==='female'&&!isYangYear);
    var results = [];
    for (var i=0; i<8; i++) {
      var offset = shun ? i+1 : -(i+1);
      var gan = ((bazi.month.ganIndex+offset)%10+10)%10;
      var zhi = ((bazi.month.zhiIndex+offset)%12+12)%12;
      results.push({
        gan:GAN[gan], zhi:ZHI[zhi], ganIndex:gan, zhiIndex:zhi,
        startAge:10+i*10, endAge:19+i*10,
        label:GAN[gan]+ZHI[zhi]+'运',
        najia:getNajia(gan,zhi),
        ss:getShiShen(bazi.day.ganIndex,gan)
      });
    }
    return results;
  }

  // ---- 流年 ----
  function analyzeLiuNian(bazi, currentYear) {
    var yearGanIdx = (currentYear-4)%10;
    var yearZhiIdx = (currentYear-4)%12;
    var ss = getShiShen(bazi.day.ganIndex, yearGanIdx);
    var notes = [];

    // 十神主调
    if (['正官','七杀'].indexOf(ss)>=0) notes.push('事业机遇年，适合争取晋升、转换跑道或承担更多责任。');
    if (['正财','偏财'].indexOf(ss)>=0) notes.push('财运活跃，正偏财皆有机会，但开销也大，注意收支平衡。');
    if (['正印','偏印'].indexOf(ss)>=0) notes.push('学习运佳，贵人运好。适合进修、考证或启动研究项目。');
    if (['食神','伤官'].indexOf(ss)>=0) notes.push('创意和表达力提升。适合发展兴趣爱好，但注意言辞分寸。');
    if (['比肩','劫财'].indexOf(ss)>=0) notes.push('社交活跃年，拓展人脉的好时机。注意合作竞争和开销控制。');

    // 流年神煞
    var dM = bazi.day.zhiIndex, dG = bazi.day.ganIndex;
    var yG = bazi.year.ganIndex;

    // 天乙贵人: 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 壬癸→巳卯, 辛→午寅
    var tianYiMap = [[1,7],[0,8],[11,9],[10,4],[5,3],[1,7],[0,8],[11,9],[10,4],[5,3]];
    var tianYi = tianYiMap[yG % 10];
    if (tianYi.indexOf(yearZhiIdx)>=0) notes.push('流年逢天乙贵人，贵人运旺，遇难有助，诸事顺遂。');

    // 文昌: 甲→巳,乙→午,丙→申,丁→酉,戊→申,己→酉,庚→亥,辛→子,壬→寅,癸→卯
    var wenchangMap = [5,6,8,9,8,9,11,0,2,3];
    if (wenchangMap[yG%10] === yearZhiIdx) notes.push('文昌星入流年，学业考试运佳，宜进修考证。');

    // 驿马: 申子辰在寅,寅午戌在申,巳酉丑在亥,亥卯未在巳
    var tri = dM % 4;
    var yiMaMap = [2,8,11,5];
    if (yiMaMap[tri] === yearZhiIdx) notes.push('流年驿马动，走动奔波频繁，宜外出发展或旅行。');

    // 桃花: 申子辰在酉,寅午戌在卯,巳酉丑在午,亥卯未在子
    var taoHuaMap = [9,3,6,0];
    if (taoHuaMap[tri] === yearZhiIdx) notes.push('流年桃花旺，异性缘佳，未婚者宜把握姻缘机会。');

    // 华盖: 申子辰在辰,寅午戌在戌,巳酉丑在丑,亥卯未在未
    var huaGaiMap = [4,10,1,7];
    if (huaGaiMap[tri] === yearZhiIdx) notes.push('流年华盖，适合独处思考、钻研学术或艺术创作。');

    // 羊刃: 甲→卯,乙→寅,丙→午,丁→巳,戊→午,己→巳,庚→酉,辛→申,壬→子,癸→亥
    var yangRenMap = [3,2,6,5,6,5,9,8,0,11];
    if (yangRenMap[dG%10] === yearZhiIdx) notes.push('⚠ 流年逢羊刃，需防冲动、意外、与人冲突，注意安全。');

    // 劫煞: 申子辰在巳,寅午戌在亥,巳酉丑在寅,亥卯未在申
    var jieShaMap = [5,11,2,8];
    if (jieShaMap[tri] === yearZhiIdx) notes.push('⚠ 流年劫煞，需防小人、破财、突如其来的损失。');

    // 年柱关系
    var yearZhi = bazi.year.zhiIndex;
    if (yearZhiIdx === yearZhi) notes.push('流年与生年相同（伏吟），宜稳不宜动，守成为佳。');
    if ((yearZhiIdx + 6) % 12 === yearZhi) notes.push('流年与生年相冲，变动较大，宜顺势而为。');
    if (yearZhiIdx === dM) notes.push('流年与日支相同，个人生活领域易有变化。');

    // 纳音
    var najia = getNajia(yearGanIdx, yearZhiIdx);
    if (najia) notes.push('流年纳音：'+najia+'。');

    return { ss:ss, notes:notes, yearGan:GAN[yearGanIdx], yearZhi:ZHI[yearZhiIdx], yearGanIdx:yearGanIdx, yearZhiIdx:yearZhiIdx, najia:najia };
  }

  // ---- 十神分布 ----
  function calcShiShenDistribution(bazi) {
    var dayGan = bazi.day.ganIndex;
    var result = [];
    [{label:'年柱',gan:bazi.year.ganIndex,zhi:bazi.year.zhiIndex,najia:getNajia(bazi.year.ganIndex,bazi.year.zhiIndex),xunKong:getXunKong(bazi.year.ganIndex,bazi.year.zhiIndex)},
     {label:'月柱',gan:bazi.month.ganIndex,zhi:bazi.month.zhiIndex,najia:getNajia(bazi.month.ganIndex,bazi.month.zhiIndex),xunKong:getXunKong(bazi.month.ganIndex,bazi.month.zhiIndex)},
     {label:'日柱',gan:bazi.day.ganIndex,zhi:bazi.day.zhiIndex,najia:getNajia(bazi.day.ganIndex,bazi.day.zhiIndex),xunKong:getXunKong(bazi.day.ganIndex,bazi.day.zhiIndex)},
     {label:'时柱',gan:bazi.hour.ganIndex,zhi:bazi.hour.zhiIndex,najia:getNajia(bazi.hour.ganIndex,bazi.hour.zhiIndex),xunKong:getXunKong(bazi.hour.ganIndex,bazi.hour.zhiIndex)}
    ].forEach(function(p){
      var cangGan = ZHI_CANG_GAN[p.zhi];
      var cangGanStr = cangGan.map(function(c){return c.s+'('+getShiShen(dayGan,c.g)+')';}).join('  ');
      result.push({
        label:p.label, gan:GAN[p.gan], zhi:ZHI[p.zhi],
        ganSS: p.label==='日柱'?'日主':getShiShen(dayGan,p.gan),
        zhiSS: getShiShen(dayGan,ZHI_CANG_GAN[p.zhi][0].g),
        najia:p.najia, xunKong:p.xunKong, cangGan:cangGanStr
      });
    });
    return result;
  }

  // ---- 综合解读 ----
  function fullReading(bazi, gender) {
    var sections = [];
    var dayGan = bazi.day.ganIndex;
    var dayWx = GAN_WUXING[dayGan];
    var yongShen = calcYongShen(bazi);
    var ws = calcWuxingStrength(bazi);

    // 1. 日主总论
    sections.push({
      title:'日主分析', icon:'☀',
      content: bazi.day.full+'日主，五行属'+WUXING[dayWx]+'（'+(dayGan%2?'阴':'阳')+'干），'+
        '纳音'+getNajia(bazi.day.ganIndex,bazi.day.zhiIndex)+'。日主'+
        (ws[dayWx]>=16?'偏旺':ws[dayWx]>=9?'中和':'偏弱')+
        '。八字五行权重：'+WUXING.map(function(w,i){return w+ws[i];}).join('  ')+'。'
    });

    // 2. 性格
    sections.push({ title:'性格特质', icon:'🎭', content:analyzePersonality(bazi) });

    // 3. 用神
    sections.push({
      title:'用神喜忌', icon:'🔑',
      content:'用神【'+yongShen.yongShen+'】· 喜神【'+yongShen.xiShen+'】'+
        (yongShen.jiShen?(' · 忌神【'+yongShen.jiShen+'】'):'')+
        '。日常多接触'+yongShen.yongShen+'和'+yongShen.xiShen+'属性的事物（颜色、方位、行业）对运势有利。'
    });

    // 4. 神煞
    var shenSha = calcShenSha(bazi);
    if (shenSha.length>0) {
      var ssText = shenSha.map(function(s){
        return (s.good?'🟢 ':'🔴 ')+s.name+'：'+s.desc;
      }).join('\n');
      sections.push({ title:'神煞', icon:'✨', content:ssText });
    }

    // 5. 事业
    var careerNotes = analyzeCareer(bazi, dayWx);
    sections.push({ title:'事业方向', icon:'💼', content:careerNotes.join('\n') });

    // 6. 财运
    var wealthNotes = analyzeWealth(bazi);
    sections.push({ title:'财运分析', icon:'💰', content:wealthNotes.join('\n') });

    // 7. 婚姻
    var marriageNotes = analyzeMarriage(bazi);
    sections.push({ title:'婚姻感情', icon:'💕', content:marriageNotes.join('\n') });

    // 8. 健康
    var healthNotes = analyzeHealth(bazi, dayWx);
    sections.push({ title:'健康提示', icon:'🏥', content:healthNotes.join('\n') });

    // 9. 大运
    var daYun = calcDaYun(bazi, gender);
    var dyText = daYun.map(function(d){
      return d.label+'（'+d.startAge+'-'+d.endAge+'岁） 纳音'+d.najia+' · 天干'+d.ss;
    }).join('\n');
    sections.push({ title:'大运走势', icon:'📈', content:dyText+'\n\n每十年一大运，大运天干地支会对此阶段的运势产生重要影响。' });

    // 10. 胎元/命宫/身宫
    var taiYuan = calcTaiYuan(bazi);
    var baZiMingGong = calcBaZiMingGong(bazi);
    var baZiShenGong = calcBaZiShenGong(bazi);
    sections.push({
      title:'胎元 · 命宫 · 身宫', icon:'🏠',
      content: '胎元：'+taiYuan.full+'（'+taiYuan.najia+'）天干十神：'+taiYuan.ss+'\n'+
        '命宫：'+baZiMingGong.full+'（'+baZiMingGong.najia+'）天干十神：'+baZiMingGong.ss+'\n'+
        '身宫：'+baZiShenGong.full+'（'+baZiShenGong.najia+'）天干十神：'+baZiShenGong.ss+'\n\n'+
        '胎元为先天禀赋根基，命宫为一生精神倾向与天赋领域，身宫为后天努力方向。三者在八字命理中与四柱同重，合称"七柱"。'
    });

    // 11. 流月/流日/流时
    var now = new Date();
    var currYear = now.getFullYear();
    var currMonth = now.getMonth() + 1;
    var currDay = now.getDate();
    var currHour = now.getHours();
    var liuYue = calcLiuYue(bazi, currYear, currMonth);
    var liuShi = calcLiuShi(bazi, currHour);
    // 流日：基于儒略日计算
    var currJd = gregorianToJDN(currYear, currMonth, currDay);
    var currDayIdx = ((currJd + 49) % 60 + 60) % 60;
    var currDayG = currDayIdx % 10, currDayZ = currDayIdx % 12;
    var currDayGZ = { gan: GAN[currDayG], zhi: ZHI[currDayZ], full: GAN[currDayG] + ZHI[currDayZ] };
    var liuRiSS = getShiShen(bazi.day.ganIndex, currDayG);
    sections.push({
      title:'当前流月/流日/流时（'+currYear+'年'+currMonth+'月'+currDay+'日）', icon:'⏳',
      content: '流月：'+liuYue.full+'（十神：'+liuYue.ss+'）\n'+
        '流日：'+currDayGZ.full+'（十神：'+liuRiSS+'）\n'+
        '流时：'+liuShi.full+'（十神：'+liuShi.ss+'）\n\n'+
        '流月主当月运势基调，流日为当日吉凶，流时为当下气运。'
    });

    // 12. 流年
    var liuNian = analyzeLiuNian(bazi, now.getFullYear());
    sections.push({
      title:'当前流年（'+liuNian.yearGan+liuNian.yearZhi+'年）', icon:'📅',
      content:'流年天干为'+liuNian.ss+'。\n'+liuNian.notes.join('\n')
    });

    // 13. 古籍参考
    var classics = matchClassics(bazi);
    if (classics.length > 0) {
      var cText = classics.map(function(c){
        return '📖 '+c.book+'：'+c.match;
      }).join('\n');
      sections.push({ title:'古籍参考', icon:'📚', content:cText+'\n\n以上匹配由智能规则引擎自动推演，仅供参考研习。' });
    }

    return sections;
  }

  // ---- 古籍智能匹配 ----
  function matchClassics(bazi) {
    var matches = [];
    var dayG = bazi.day.ganIndex, dayZ = bazi.day.zhiIndex;
    var moG = bazi.month.ganIndex, moZ = bazi.month.zhiIndex;
    var dayWx = GAN_WUXING[dayG];

    // 《穷通宝鉴》调候用神
    var qiongtong = {
      0:['庚','丁','丙','戊'], // 甲木:喜庚金雕琢,冬喜丁火暖局
      1:['丙','癸','戊'],      // 乙木:喜丙火照暖,喜癸水滋润
      2:['壬','庚','甲'],      // 丙火:喜壬水相济,庚金生水
      3:['甲','庚','丙'],      // 丁火:喜甲木燃火,庚金劈甲
      4:['甲','丙','癸'],      // 戊土:喜甲木疏土,丙火暖土
      5:['丙','癸','甲'],      // 己土:喜丙火暖土,癸水润土
      6:['丁','壬','甲'],      // 庚金:喜丁火锻炼,壬水淬金
      7:['壬','丙','甲'],      // 辛金:喜壬水洗金,丙火暖金
      8:['戊','庚','甲'],      // 壬水:喜戊土堤防,庚金生水
      9:['丙','辛','庚']       // 癸水:喜丙火暖局,辛金生水
    };
    var qtGans = qiongtong[dayG];
    var foundQt = [];
    [bazi.year.gan,bazi.month.gan,bazi.hour.gan].forEach(function(g) {
      if (qtGans.indexOf(g) >= 0 && foundQt.indexOf(g) < 0) foundQt.push(g);
    });
    if (foundQt.length >= 2) {
      matches.push({ book:'《穷通宝鉴》', match:'调候用神得配（天干见'+foundQt.join('、')+'），格局清纯，人生顺遂有贵气。' });
    } else if (foundQt.length >= 1) {
      matches.push({ book:'《穷通宝鉴》', match:'调候用神见'+foundQt[0]+'，部分得配，需后天运势配合。' });
    }

    // 《滴天髓》旺衰判断
    var ws = calcWuxingStrength(bazi);
    var wsLevel = ws[dayWx];
    if (wsLevel >= 18) {
      matches.push({ book:'《滴天髓》', match:'日主极旺，宜泄不宜克。如大厦将倾，众木难支，需食伤泄秀或财星耗身。' });
    } else if (wsLevel >= 14) {
      matches.push({ book:'《滴天髓》', match:'日主偏旺，身强体健。宜用财官克泄，方能有所成就。' });
    } else if (wsLevel <= 5) {
      matches.push({ book:'《滴天髓》', match:'日主偏弱，宜得印比生扶。如寒木向阳，需阳光雨露滋养。' });
    }

    // 《三命通会》格局
    var ssDist = calcShiShenDistribution(bazi);
    var allSS = ssDist.map(function(s){return s.ganSS;}).concat(ssDist.map(function(s){return s.zhiSS;}));
    if (allSS.indexOf('正官') >= 0 && allSS.indexOf('正印') >= 0) {
      matches.push({ book:'《三命通会》', match:'官印相生格：官星有印星护卫，清正廉洁，宜仕途公职。' });
    }
    if (allSS.indexOf('食神') >= 0 && allSS.indexOf('正财') >= 0) {
      matches.push({ book:'《三命通会》', match:'食神生财格：以技艺才华生财，宜技术、艺术、商业领域。' });
    }
    if (allSS.indexOf('七杀') >= 0 && allSS.indexOf('食神') >= 0) {
      matches.push({ book:'《三命通会》', match:'食神制杀格：以智慧制伏困难，乱世英雄，适合高压行业。' });
    }

    // 《神峰通考》病药说
    if (wsLevel < 8 && allSS.indexOf('正印') >= 0) {
      matches.push({ book:'《神峰通考》', match:'日弱得印生扶，以印为药治身弱之病。宜亲近师长，注重学习。' });
    }
    if (wsLevel > 15 && allSS.indexOf('伤官') >= 0) {
      matches.push({ book:'《神峰通考》', match:'身强伤官泄秀，以伤官为药治身强之病。才华能得施展。' });
    }

    // 《八字提要》日柱特性
    var dayCombo = GAN[dayG] + ZHI[dayZ];
    var tiYao = {
      '甲子':'甲木坐子水正印，聪明仁慈，但子水寒湿，需火调候。',
      '乙丑':'乙木坐丑土偏财，丑为金库暗藏七杀，外柔内刚。',
      '丙寅':'丙火坐寅木长生，光辉灿烂，精力充沛，一生顺遂。',
      '丁卯':'丁火坐卯木偏印，聪明细腻，但卯为病地需注意健康。',
      '戊辰':'戊土坐辰土比肩，厚重稳健，辰为水库暗藏财星。',
      '己巳':'己土坐巳火正印，巳中藏庚丙戊，温暖有生。',
      '庚午':'庚金坐午火正官，午火锻炼庚金，刚毅中带柔情。',
      '辛未':'辛金坐未土偏印，未中藏丁乙己，温润含蓄。',
      '壬申':'壬水坐申金偏印，申为壬水长生，智慧超群。',
      '癸酉':'癸水坐酉金偏印，酉为癸水病地，聪慧但易多愁。',
      '甲戌':'甲木坐戌土偏财，戌为火库，热情大方。',
      '乙亥':'乙木坐亥水正印，亥中藏壬甲，柔中带刚生命力强。',
      '丙子':'丙火坐子水正官，水火既济，热情中带理性。',
      '丁丑':'丁火坐丑土食神，丑中藏己癸辛，内秀务实。',
      '戊寅':'戊土坐寅木七杀，寅中藏甲丙戊，领袖气质。',
      '己卯':'己土坐卯木七杀，卯中乙木专气，外柔内刚，有事业心。',
      '庚辰':'庚金坐辰土偏印，辰为水库润金，刚柔并济。',
      '辛巳':'辛金坐巳火正官，巳中藏丙戊庚，柔金得炼。',
      '壬午':'壬水坐午火正财，午中藏丁己，大方有经济头脑。',
      '癸未':'癸水坐未土七杀，未中藏己丁乙，温和外表下有韧劲。',
      '甲申':'甲木坐申金七杀，申中藏庚壬戊，能力出众但有压力。',
      '乙酉':'乙木坐酉金七杀，酉中辛金专气，外表柔和内心刚烈。',
      '丙戌':'丙火坐戌土食神，戌中藏戊辛丁，创意与务实并存。',
      '丁亥':'丁火坐亥水正官，亥中藏壬甲，有管理才能。',
      '戊子':'戊土坐子水正财，子中癸水专气，稳重中有灵活。',
      '己丑':'己土坐丑土比肩，丑中藏己癸辛，包容力强。',
      '庚寅':'庚金坐寅木偏财，寅中藏甲丙戊，刚毅有经济头脑。',
      '辛卯':'辛金坐卯木偏财，卯中乙木专气，细腻有审美品味。',
      '壬辰':'壬水坐辰土七杀，辰为水库，外刚内柔有领导力。',
      '癸巳':'癸水坐巳火正财，巳中藏丙戊庚，内敛有经济意识。',
      '甲午':'甲木坐午火伤官，午中藏丁己，才华横溢但耗身。',
      '乙未':'乙木坐未土偏财，未中藏己丁乙，务实有艺术细胞。',
      '丙申':'丙火坐申金偏财，申中藏庚壬戊，大方有远见。',
      '丁酉':'丁火坐酉金偏财，酉中辛金专气，精明有投资眼光。',
      '戊戌':'戊土坐戌土比肩，戌中藏戊辛丁，厚重如山。',
      '己亥':'己土坐亥水正财，亥中藏壬甲，宽容有财运。',
      '庚子':'庚金坐子水伤官，子中癸水专气，刚毅中带才华。',
      '辛丑':'辛金坐丑土偏印，丑中藏己癸辛，温润有内秀。',
      '壬寅':'壬水坐寅木食神，寅中藏甲丙戊，聪明豁达。',
      '癸卯':'癸水坐卯木食神，卯中乙木专气，细腻有创意。',
      '甲辰':'甲木坐辰土偏财，辰中藏戊乙癸，大方有经济才能。',
      '乙巳':'乙木坐巳火伤官，巳中藏丙戊庚，柔中有才华。',
      '丙午':'丙火坐午火劫财，午中藏丁己，热情如烈日，需注意人际。',
      '丁未':'丁火坐未土食神，未中藏己丁乙，内秀有创意。',
      '戊申':'戊土坐申金食神，申中藏庚壬戊，稳重中有才华。',
      '己酉':'己土坐酉金食神，酉中辛金专气，温和有输出才华。',
      '庚戌':'庚金坐戌土偏印，戌中藏戊辛丁，刚毅有谋略。',
      '辛亥':'辛金坐亥水伤官，亥中藏壬甲，细腻中带才华外露。',
      '壬子':'壬水坐子水劫财，子中癸水专气，聪明但易自我。',
      '癸丑':'癸水坐丑土七杀，丑中藏己癸辛，外柔内刚有韧劲。',
      '甲寅':'甲木坐寅木比肩，寅中藏甲丙戊，参天之树有领导力。',
      '乙卯':'乙木坐卯木比肩，卯中乙木专气，柔韧中有骨气。',
      '丙辰':'丙火坐辰土食神，辰中藏戊乙癸，创意与包容并存。',
      '丁巳':'丁火坐巳火劫财，巳中藏丙戊庚，热情中有贵气。',
      '戊午':'戊土坐午火正印，午中藏丁己，稳重中有热情。',
      '己未':'己土坐未土比肩，未中藏己丁乙，包容中有主见。',
      '庚申':'庚金坐申金比肩，申中藏庚壬戊，刚毅果断执行力强。',
      '辛酉':'辛金坐酉金比肩，酉中辛金专气，精致有原则。',
      '壬戌':'壬水坐戌土七杀，戌中藏戊辛丁，有魄力但压力大。',
      '癸亥':'癸水坐亥水劫财，亥中藏壬甲，细腻中有包容心。'
    };
    if (tiYao[dayCombo]) {
      matches.push({ book:'《八字提要》', match:'日柱'+dayCombo+'：'+tiYao[dayCombo] });
    }

    return matches;
  }

  // ---- 八字合婚/合盘 ----
  function heHun(bazi1, bazi2, gender1, gender2) {
    var score = 0;
    var details = [];
    var maxScore = 100;

    // 1. 五行互补 (0-25分)
    var ws1 = calcWuxingStrength(bazi1);
    var ws2 = calcWuxingStrength(bazi2);
    var dayWx1 = GAN_WUXING[bazi1.day.ganIndex];
    var dayWx2 = GAN_WUXING[bazi2.day.ganIndex];
    var rel = (dayWx2 - dayWx1 + 5) % 5;
    if (rel === 3) { score += 12; details.push('日主相生，根基和谐 (+12)'); }
    else if (rel === 1) { score += 8; details.push('日主被生，一方滋养另一方 (+8)'); }
    else if (rel === 2 || rel === 4) { score += 4; details.push('日主无生克，需后天磨合 (+4)'); }
    else { score += 0; details.push('日主同行/相克，易有争合 (+0)'); }

    // 2. 互补五行 (0-20分)
    var compScore = 0;
    for (var i = 0; i < 5; i++) {
      if (ws1[i] > 10 && ws2[i] < 6) compScore += 4;
      if (ws2[i] > 10 && ws1[i] < 6) compScore += 4;
    }
    compScore = Math.min(compScore, 20);
    score += compScore;
    if (compScore >= 12) details.push('五行高度互补 (+'+compScore+')');
    else if (compScore >= 6) details.push('五行有一定互补 (+'+compScore+')');
    else details.push('五行互补不明显 (+'+compScore+')');

    // 3. 年柱相合 (0-15分)
    var yearG1 = bazi1.year.ganIndex, yearZ1 = bazi1.year.zhiIndex;
    var yearG2 = bazi2.year.ganIndex, yearZ2 = bazi2.year.zhiIndex;
    var ganHe = (yearG1 % 5) === (yearG2 % 5) && yearG1 !== yearG2;
    var zhiHeMap = {0:1,1:0,2:11,11:2,3:10,10:3,4:9,9:4,5:8,8:5,6:7,7:6};
    var zhiHe = zhiHeMap[yearZ1] === yearZ2;
    if (ganHe && zhiHe) { score += 15; details.push('年柱天地合，缘分深厚 (+15)'); }
    else if (ganHe) { score += 8; details.push('年干相合 (+8)'); }
    else if (zhiHe) { score += 8; details.push('年支六合 (+8)'); }
    else { score += 2; details.push('年柱无冲合，平常缘分 (+2)'); }

    // 4. 日支(夫妻宫)关系 (0-20分)
    var dayZ1 = bazi1.day.zhiIndex, dayZ2 = bazi2.day.zhiIndex;
    if (zhiHeMap[dayZ1] === dayZ2) { score += 20; details.push('夫妻宫六合，高度默契 (+20)'); }
    else if (dayZ1 === dayZ2) { score += 10; details.push('夫妻宫相同，性格相似需互补 (+10)'); }
    else if ((dayZ1 + 6) % 12 === dayZ2) { score += 3; details.push('夫妻宫相冲，易有矛盾需包容 (+3)'); }
    else { score += 8; details.push('夫妻宫无冲合，需后天经营 (+8)'); }

    // 5. 神煞相配 (0-10分)
    var s1 = calcShenSha(bazi1), s2 = calcShenSha(bazi2);
    var bothGood = s1.filter(function(s){return s.good;}).length + s2.filter(function(s){return s.good;}).length;
    if (bothGood >= 4) { score += 10; details.push('双方吉神俱足，相互旺运 (+10)'); }
    else if (bothGood >= 2) { score += 6; details.push('有一定吉神护佑 (+6)'); }
    else { score += 3; details.push('吉神较少，需后天修善 (+3)'); }

    // 6. 大运同步 (0-10分)
    var dy1 = calcDaYun(bazi1, gender1);
    var dy2 = calcDaYun(bazi2, gender2);
    var syncCount = 0;
    for (var i = 0; i < Math.min(dy1.length, dy2.length); i++) {
      if (dy1[i].ganIndex === dy2[i].ganIndex || dy1[i].zhiIndex === dy2[i].zhiIndex) syncCount++;
    }
    if (syncCount >= 4) { score += 10; details.push('大运高度同步，人生节奏一致 (+10)'); }
    else if (syncCount >= 2) { score += 6; details.push('大运部分同步 (+6)'); }
    else { score += 3; details.push('大运不同步，需主动协调 (+3)'); }

    score = Math.min(score, maxScore);
    var level = score >= 80 ? '天作之合' : score >= 65 ? '佳偶天成' : score >= 50 ? '可堪匹配' : score >= 35 ? '磨合较多' : '需深思熟虑';

    return {
      score: score, maxScore: maxScore, level: level,
      details: details,
      bazi1Summary: bazi1.year.full + ' ' + bazi1.month.full + ' ' + bazi1.day.full + ' ' + bazi1.hour.full,
      bazi2Summary: bazi2.year.full + ' ' + bazi2.month.full + ' ' + bazi2.day.full + ' ' + bazi2.hour.full
    };
  }

  // ==================== 袁天罡称骨算命 ====================

  var YEAR_WEIGHT = {'甲子':12,'乙丑':9,'丙寅':6,'丁卯':7,'戊辰':12,'己巳':5,'庚午':9,'辛未':8,'壬申':7,'癸酉':8,'甲戌':15,'乙亥':9,'丙子':16,'丁丑':8,'戊寅':8,'己卯':19,'庚辰':12,'辛巳':6,'壬午':8,'癸未':7,'甲申':5,'乙酉':15,'丙戌':6,'丁亥':16,'戊子':15,'己丑':7,'庚寅':9,'辛卯':12,'壬辰':12,'癸巳':7,'甲午':15,'乙未':6,'丙申':5,'丁酉':14,'戊戌':14,'己亥':9,'庚子':7,'辛丑':7,'壬寅':9,'癸卯':12,'甲辰':8,'乙巳':7,'丙午':13,'丁未':5,'戊申':14,'己酉':5,'庚戌':9,'辛亥':17,'壬子':5,'癸丑':7,'甲寅':12,'乙卯':8,'丙辰':8,'丁巳':6,'戊午':19,'己未':6,'庚申':8,'辛酉':16,'壬戌':5,'癸亥':7};
  var MONTH_WEIGHT = [6,7,18,9,5,16,9,15,18,8,9,6];
  var DAY_WEIGHT = [5,10,8,15,16,15,8,16,8,16,9,17,8,17,10,8,9,18,5,15,10,9,8,9,15,18,7,8,16,6];
  var HOUR_WEIGHT = [16,6,7,10,9,16,10,8,8,9,6,6];

  var CHENGGU_SONGS = {
    21:'短命非业谓大凶，平生灾难事重重；凶祸频临陷逆境，终世困苦事不成。',
    22:'身寒骨冷苦伶仃，此命推来行乞人；劳劳碌碌无度日，终年打拱过平生。',
    23:'此命推来骨格轻，求谋作事事难成；妻儿兄弟应难许，别处他乡作散人。',
    24:'此命推来福禄无，门庭困苦总难荣；六亲骨肉皆无靠，流浪他乡作老翁。',
    25:'此命推来祖业微，门庭营度似稀奇；六亲骨肉如冰炭，一世勤劳自把持。',
    26:'平生衣禄苦中求，独自营谋事不休；离祖出门宜早计，晚来衣禄自无休。',
    27:'一生作事少商量，难靠祖宗作主张；独马单枪空做去，早年晚岁总无长。',
    28:'一生行事似飘蓬，祖宗产业在梦中；若不过房改名姓，也当移徒二三通。',
    29:'初年运限未曾亨，纵有功名在后成；须过四旬才可立，移居改姓始为良。',
    30:'劳劳碌碌苦中求，东奔西走何日休；若使终身勤与俭，老来稍可免忧愁。',
    31:'忙忙碌碌苦中求，何日云开见日头；难得祖基家可立，中年衣食渐无忧。',
    32:'初年运蹇事难谋，渐有财源如水流；到得中年衣食旺，那时名利一齐收。',
    33:'早年做事事难成，百年勤劳枉费心；半世自如流水去，后来运到始得金。',
    34:'此命福气果如何，僧道门中衣禄多；离祖出家方为妙，朝晚拜佛念弥陀。',
    35:'生平福量不周全，祖业根基觉少传；营事生涯宜守旧，时来衣食胜从前。',
    36:'不须劳碌过平生，独自成家福不轻；早有福星常照命，任君行去百般成。',
    37:'此命般般事不成、弟兄少力自孤行；虽然祖业须微有，来得明时去不明。',
    38:'一身骨肉最清高，早入簧门姓氏标；待到年将三十六，蓝衫脱去换红袍。',
    39:'此命终身运不通，劳劳作事尽皆空；苦心竭力成家计，到得那时在梦中。',
    40:'平生衣禄是绵长，件件心中自主张；前面风霜多受过，后来必定享安康。',
    41:'此命推来自不同，为人能干异凡庸；中年还有逍遥福，不比前时运未通。',
    42:'得宽怀处且宽怀，何用双眉皱不开；若使中年命运济，那时名利一起来。',
    43:'为人心性最聪明，作事轩昂近贵人；衣禄一生天注定，不须劳碌是丰亨。',
    44:'万事由天莫苦求，须知福碌赖人修；当年财帛难如意，晚景欣然便不忧。',
    45:'名利推求竟若何，前番辛苦后奔波；命中难养男和女，骨肉扶持也不多。',
    46:'东西南北尽皆通，出姓移居更觉隆；衣禄无穷无数定，中年晚景一般同。',
    47:'此命推求旺末年，妻荣子贵自怡然；平生原有滔滔福，可卜财源若水泉。',
    48:'初年运道未曾通，几许蹉跎命亦穷；兄弟六亲无依靠，一生事业晚来整。',
    49:'此命推来福不轻，自成自立显门庭；从来富贵人钦敬，使婢差奴过一生。',
    50:'为利为名终日劳，中年福禄也多遭；老来自有财星照，不比前番目下高。',
    51:'一世荣华事事通，不须劳碌自亨通；兄弟叔侄皆如意，家业成时福禄宏。',
    52:'一世亨通事事能，不须劳苦自然宁；宗族有光欣喜甚，家产丰盈自称心。',
    53:'此格推来福泽宏，兴家立业在其中；一生衣食安排定，却是人间一福翁。',
    54:'此格详采福泽宏，诗书满腹看功成；丰衣足食多安稳，正是人间有福人。',
    55:'策马扬鞭争名利，少年作事费筹论；一朝福禄源源至，富贵荣华显六亲。',
    56:'此格推来礼义通，一身福禄用无穷；甜酸苦辣皆尝过，滚滚财源盈而丰。',
    57:'福禄丰盈万事全，一身荣耀乐天年；名扬威震人争羡，此世逍遥宛似仙。',
    58:'平生衣食自然来，名利双全富贵偕；金榜题名登甲第，紫袍玉带走金阶。',
    59:'细推此格秀而清，必定才高学业成；甲第之中应有分，扬鞭走马显威荣。',
    60:'一朝金榜快题名，显祖荣宗大器成；衣禄定然无欠缺，田园财帛更丰盈。',
    61:'不作朝中金榜客，定为世上大财翁；聪明天赋经书熟，名显高科自是荣。',
    62:'此命生来福不穷，读书必定显亲宗；紫衣金带为卿相，富贵荣华孰与同。',
    63:'命主为官福禄长，得来富贵实非常；名题雁塔传金榜，大显门庭天下扬。',
    64:'此格威权不可当，紫袍金带尘高堂；荣华富贵谁能及，万古留名姓氏扬。',
    65:'细推此命福非轻，富贵荣华孰与争；定国安邦人极品，威声显赫震寰瀛。',
    66:'此格人间一福人，堆金积玉满堂春；从来富贵有天定，金榜题名更显亲。',
    67:'此命生来福自宏，田园家业最高隆；平生衣禄盈丰足，一路荣华万事通。',
    68:'富贵由天莫苦求，万金家计不须谋；如今不比前番事，祖业根基百世留。',
    69:'君是人间衣禄星，一生富贵众人钦；总然福禄由天定，安享荣华过一生。',
    70:'此命推来福禄宏，不须愁虑苦劳心；荣华富贵天注定，正笏垂绅拜紫宸。',
    71:'此命生成大不同，公侯卿相在其中；一生自有逍遥福，富贵荣华极品隆。',
    72:'此格世界罕有生，十代积善产此人；天上紫微来照命，统治万民乐太平。'
  };

  function calcChengGuWeight(ganZhiYear, lunarMonth, lunarDay, shichenIdx) {
    return (YEAR_WEIGHT[ganZhiYear]||12) + (MONTH_WEIGHT[(lunarMonth-1+12)%12]||9) + (DAY_WEIGHT[Math.min(lunarDay-1,29)]||10) + (HOUR_WEIGHT[shichenIdx%12]||10);
  }

  function getChengGuSong(totalQian) {
    if (CHENGGU_SONGS[totalQian]) return CHENGGU_SONGS[totalQian];
    var keys = Object.keys(CHENGGU_SONGS).map(Number).sort(function(a,b){return a-b;});
    var nearest = keys[0];
    for (var i=0;i<keys.length;i++) { if (Math.abs(keys[i]-totalQian) < Math.abs(nearest-totalQian)) nearest = keys[i]; }
    return CHENGGU_SONGS[nearest] || '命格非凡，无法以常规称骨论断。';
  }

  function chengGuReading(bazi, gender) {
    var ganzhiYear = bazi.year.full;
    var lunarMonth = bazi.lunar ? bazi.lunar.lunarMonth : 1;
    var lunarDay = bazi.lunar ? bazi.lunar.lunarDay : 1;
    var shichenIdx = bazi.hour.shichenIdx;
    var totalQian = calcChengGuWeight(ganzhiYear, lunarMonth, lunarDay, shichenIdx);
    var liang = Math.floor(totalQian / 10), qian = totalQian % 10;
    var song = getChengGuSong(totalQian);
    var level = totalQian<35?'下等':totalQian<45?'中下':totalQian<52?'中等':totalQian<60?'中上':totalQian<70?'上等':'上上等';
    var desc = totalQian<35?'称骨偏轻，一生劳碌奔波较多。但命由天定运由己造，积德行善勤勉努力同样可以改变命运。':totalQian<45?'称骨中等偏下，早年多有波折，中晚年后运势渐入佳境。':totalQian<52?'称骨中等，一生平稳，衣食无忧，偶有小波折但无大碍。':totalQian<60?'称骨中等偏上，命带福禄，事业有成，晚景荣华。':totalQian<70?'称骨上等，福禄深厚，名成利就，一生顺遂。':'称骨上上等，世间罕有，大贵之命，福禄寿俱全。';
    return {totalQian:totalQian, liang:liang, qian:qian, weight:liang+'两'+qian+'钱', song:song, level:level, desc:desc, breakdown:{year:{label:'年柱 '+ganzhiYear, qian:YEAR_WEIGHT[ganzhiYear]||12}, month:{label:'农历'+lunarMonth+'月', qian:MONTH_WEIGHT[(lunarMonth-1+12)%12]||9}, day:{label:'农历'+lunarDay+'日', qian:DAY_WEIGHT[Math.min(lunarDay-1,29)]||10}, hour:{label:bazi.hour.zhi+'时', qian:HOUR_WEIGHT[shichenIdx%12]||10}}};
  }

  return {
    calcWuxingStrength:calcWuxingStrength, calcYongShen:calcYongShen,
    calcShiShenDistribution:calcShiShenDistribution, getShiShen:getShiShen,
    calcDaYun:calcDaYun, analyzeLiuNian:analyzeLiuNian,
    getNajia:getNajia, getXunKong:getXunKong,
    ZHI_CANG_GAN:ZHI_CANG_GAN, calcShenSha:calcShenSha,
    fullReading:fullReading,
    calcTaiYuan:calcTaiYuan, calcBaZiMingGong:calcBaZiMingGong,
    calcBaZiShenGong:calcBaZiShenGong, calcLiuYue:calcLiuYue,
    calcLiuShi:calcLiuShi, heHun:heHun, matchClassics:matchClassics,
    WUXING:WUXING, WUXING_COLORS:WUXING_COLORS,
    chengGuReading:chengGuReading, calcChengGuWeight:calcChengGuWeight
  };
})();
