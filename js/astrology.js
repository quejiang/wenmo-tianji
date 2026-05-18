/**
 * 西洋占星星盘引擎 v2 — 测测风格增强
 * 行星计算、SVG星盘(含相位线)、行星落座解读、宫位解读
 */

var Astrology = (function() {

  var ZODIAC = ['白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手','摩羯','水瓶','双鱼'];
  var ZODIAC_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  var ZODIAC_SYMBOL = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  var ZODIAC_COLORS = ['#e06050','#8ab860','#e0c050','#8899cc','#f0a050','#a08060','#e0a0b0','#cc5060','#b070d0','#708090','#60b0d0','#6088c0'];
  var ZODIAC_ELEMENT = ['火','土','风','水','火','土','风','水','火','土','风','水'];
  var ZODIAC_MODE = ['基本','固定','变动','基本','固定','变动','基本','固定','变动','基本','固定','变动'];

  var HOUSE_NAMES = ['一宫·命宫','二宫·财帛','三宫·兄弟','四宫·田宅','五宫·子女','六宫·奴仆','七宫·夫妻','八宫·疾厄','九宫·迁移','十宫·官禄','十一宫·福德','十二宫·玄秘'];

  var PLANETS = [
    { key:'sun',     name:'太阳',   symbol:'☉', color:'#f0c060', glyph:'☉' },
    { key:'moon',    name:'月亮',   symbol:'☽', color:'#c0c0e0', glyph:'☽' },
    { key:'mercury', name:'水星',   symbol:'☿', color:'#e0c080', glyph:'☿' },
    { key:'venus',   name:'金星',   symbol:'♀', color:'#e0b0c0', glyph:'♀' },
    { key:'mars',    name:'火星',   symbol:'♂', color:'#e06040', glyph:'♂' },
    { key:'jupiter', name:'木星',   symbol:'♃', color:'#d0a060', glyph:'♃' },
    { key:'saturn',  name:'土星',   symbol:'♄', color:'#b0a080', glyph:'♄' },
    { key:'uranus',  name:'天王星', symbol:'♅', color:'#60c0c0', glyph:'♅' },
    { key:'neptune', name:'海王星', symbol:'♆', color:'#6080c0', glyph:'♆' },
    { key:'pluto',   name:'冥王星', symbol:'♇', color:'#8060a0', glyph:'♇' }
  ];

  // ---- 行星落座解读 ----
  var PLANET_SIGN_MEANING = {
    sun: {
      '白羊':'自我意识强烈，行动力强，天生的领导者。勇敢直率但有时冲动。',
      '金牛':'稳重务实，重视物质安全感，有艺术品味。固执但可靠。',
      '双子':'思维敏捷，好奇心旺盛，善于沟通表达。多变但适应力极强。',
      '巨蟹':'情感丰富，家庭观念重，有保护欲。敏感但有强大的滋养力。',
      '狮子':'自信大方，有领导力和表现欲。慷慨热情但需注意自我中心。',
      '处女':'细致严谨，分析力强，追求完美。谦逊务实但易焦虑。',
      '天秤':'追求和谐，有社交手腕和审美品味。公正但有时优柔寡断。',
      '天蝎':'意志力强，洞察力深刻，情感强烈。有强大的转化和再生能力。',
      '射手':'乐观开朗，热爱自由和探索，有哲学思维。直率但需注意分寸。',
      '摩羯':'自律坚韧，目标导向，有强烈的责任感。成熟稳重但易压抑情感。',
      '水瓶':'独立思考，创新意识强，有人道主义精神。理性但有时疏离。',
      '双鱼':'直觉敏锐，富有同情心和想象力。有艺术天赋但边界感较弱。'
    },
    moon: {
      '白羊':'情绪来得快去得也快，内心有强烈的征服欲。需要独立的情感空间。',
      '金牛':'情绪稳定，需要物质和情感的双重安全感。享受舒适的生活节奏。',
      '双子':'情绪多变，需要通过交流和阅读来获得内心的平静。',
      '巨蟹':'月亮入庙，情感丰富细腻，直觉力强。极其重视家庭和安全感。',
      '狮子':'内心渴望被关注和认可，情感表达热烈而戏剧化。',
      '处女':'情感克制，习惯用分析和实际行动来表达关心。',
      '天秤':'内心追求平衡和谐，需要伴侣的陪伴和支持。讨厌冲突。',
      '天蝎':'月亮落陷，情感深沉强烈，有不安全感和控制欲。',
      '射手':'内心乐观自由，情绪不易被负面事物影响。需要探索空间。',
      '摩羯':'月亮失势，情感内敛克制，不轻易表达脆弱。',
      '水瓶':'情感独立，不喜欢被束缚。需要理解和尊重个人空间。',
      '双鱼':'情感丰富，共情能力极强。容易吸收他人的情绪。'
    },
    mercury: {
      '白羊':'思维直接快速，说话不拐弯抹角。决策果断但需注意倾听。',
      '金牛':'学习速度稳健，一旦掌握不易忘记。思维务实。',
      '双子':'水星入庙，思维极其敏捷，口才好，信息处理能力一流。',
      '巨蟹':'思维方式受情绪影响，记忆力好，善于讲故事情感表达。',
      '狮子':'表达自信有说服力，思维有创意和领导力。',
      '处女':'水星入庙，逻辑分析能力极强，注重细节，精益求精。',
      '天秤':'思维平衡公正，善于权衡利弊。表达优雅得体。',
      '天蝎':'思维深刻敏锐，善于挖掘真相。有强大的研究能力。',
      '射手':'思维开阔，喜欢宏观和哲学层面的思考。不拘小节。',
      '摩羯':'思维严谨有条理，善于规划和执行。表达简洁有力。',
      '水瓶':'水星旺相，思维超前创新，有独特见解和发明潜力。',
      '双鱼':'水星落陷，思维感性模糊，但想象力和直觉力卓越。'
    },
    venus: {
      '白羊':'感情主动热烈，喜欢追求的过程。爱情来得快去得也快。',
      '金牛':'金星入庙，享受爱情和物质生活。忠诚专一，注重感官享受。',
      '双子':'喜欢轻松有趣的恋爱关系，情感表达灵活多变。',
      '巨蟹':'情感温柔细腻，重视家庭和承诺。需要安全感。',
      '狮子':'爱情中热情浪漫，喜欢被瞩目和宠爱。大方慷慨。',
      '处女':'金星落陷，感情含蓄克制，用行动表达爱意。对伴侣有较高标准。',
      '天秤':'金星入庙，天生的恋爱达人。追求和谐优雅的关系。',
      '天蝎':'金星失势，感情极端深刻，有强烈的占有欲和嫉妒心。',
      '射手':'爱情观自由开放，不喜欢被束缚。喜欢与伴侣一起冒险。',
      '摩羯':'感情认真克制，重视责任和长期承诺。爱得深沉持久。',
      '水瓶':'爱情观独特，需要精神层面的共鸣。不喜欢传统束缚。',
      '双鱼':'金星旺相，浪漫梦幻，有牺牲奉献精神。艺术审美卓越。'
    },
    mars: {
      '白羊':'火星入庙，行动力爆棚，竞争意识强。敢闯敢拼但需控制脾气。',
      '金牛':'火星落陷，行动稳健缓慢，但一旦决定则坚定不移。',
      '双子':'精力充沛，善变多动，同时处理多件事务。口才好。',
      '巨蟹':'行动受情绪驱动，保护欲强。为家庭而战的斗士。',
      '狮子':'行动力强，喜欢主导和掌控。有强烈的表现欲望。',
      '处女':'行动精准高效，注重细节和技巧。',
      '天秤':'火星失势，不喜欢冲突，行动犹豫摇摆。',
      '天蝎':'火星入庙，意志力极为强大，执行力强。有强大的竞争和报复心理。',
      '射手':'行动热情奔放，喜欢冒险和挑战。精力旺盛。',
      '摩羯':'火星旺相，行动力持久，有强大的耐力和执行力。',
      '水瓶':'行动方式独特不羁，不喜欢被指挥。有创新精神。',
      '双鱼':'行动力较弱，容易被情绪和环境影响。但直觉力强。'
    },
    jupiter: {
      '白羊':'乐观积极，有开拓精神。通过行动和冒险获得成长。',
      '金牛':'通过物质积累和稳定发展获得幸运。财运较好。',
      '双子':'通过学习和交流获得成长。多才多艺，信息来源广泛。',
      '巨蟹':'幸运来自家庭和情感的滋养。有良好的直觉力。',
      '狮子':'自信乐观，有领导魅力。通过表现自我获得幸运。',
      '处女':'通过服务他人和精细工作获得成长。注重健康。',
      '天秤':'通过合作和人际关系获得幸运。有良好的社交运。',
      '天蝎':'通过深度转化和危机处理获得成长。有强大的再生力。',
      '射手':'木星入庙，天生幸运乐观，有哲学智慧和探索精神。',
      '摩羯':'幸运来得较晚但持久。通过努力和责任感获得成功。',
      '水瓶':'通过创新和集体事业获得成长。思想超前。',
      '双鱼':'木星入庙，有强大的直觉和慈悲心。通过艺术和灵性获得成长。'
    },
    saturn: {
      '白羊':'需要学习耐心和自我控制。事业上适合独立创业。',
      '金牛':'对财务安全感有强烈需求。通过坚持获得物质成就。',
      '双子':'需要专注和深入学习。适合以言辞为业。',
      '巨蟹':'家庭责任感重。需要建立情感安全边界。',
      '狮子':'需要学习谦逊和团队合作。有领导潜力但需克服自我。',
      '处女':'追求完美和秩序。适合需要精确度的工作。',
      '天秤':'土星旺相，有公正和责任感。适合法律和管理行业。',
      '天蝎':'有强大的意志力。需要学习信任和放手。',
      '射手':'需要建立信仰体系。适合教育和出版。',
      '摩羯':'土星入庙，自律和责任感的化身。大器晚成。',
      '水瓶':'土星入庙，有组织能力和创新精神。适合科技和社会改革。',
      '双鱼':'需要建立现实的边界。适合慈善和艺术领域。'
    }
  };

  // ---- 宫位解读 ----
  var HOUSE_MEANING = [
    '第一宫（命宫）代表自我、外表、给人的第一印象。宫内有星则自我特质鲜明。',
    '第二宫（财帛宫）代表正财、价值观、物质安全感。宫内星曜影响赚钱方式。',
    '第三宫（兄弟宫）代表沟通、学习、短途旅行、手足邻里关系。',
    '第四宫（田宅宫）代表家庭、根源、父亲、不动产、晚年生活。',
    '第五宫（子女宫）代表创造力、恋爱、子女、娱乐、投机。',
    '第六宫（奴仆宫）代表日常工作、健康、同事、服务精神。',
    '第七宫（夫妻宫）代表婚姻、合作伙伴、公开的敌人。',
    '第八宫（疾厄宫）代表偏财、遗产、生死、性、深层心理学。',
    '第九宫（迁移宫）代表高等教育、长途旅行、哲学、信仰。',
    '第十宫（官禄宫）代表事业、名声、社会地位、母亲。',
    '第十一宫（福德宫）代表朋友、社团、理想、未来愿景。',
    '第十二宫（玄秘宫）代表潜意识、因果、隐秘、灵性、牺牲。'
  ];

  // ---- 儒略日 ----
  function toJD(year, month, day, hour) {
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045 + (hour - 12) / 24;
  }

  function calcPlanetLon(T, planetKey) {
    var L, M, T2 = T * T;
    switch (planetKey) {
      case 'sun':     L = 280.46646 + 36000.76983*T + 0.0003032*T2; break;
      case 'moon':    L = 218.3165 + 481267.8813*T; break;
      case 'mercury': L = 252.2509 + 149472.6746*T; M = (174.7948 + 149472.6746*T)*Math.PI/180; L += 23.44*Math.sin(M)+2.98*Math.sin(2*M); break;
      case 'venus':   L = 181.9798 + 58517.8157*T; M = (177.8553+58517.8157*T)*Math.PI/180; L += 0.83*Math.sin(M); break;
      case 'mars':    L = 355.4330 + 19140.2993*T; M = (19.3730+19140.2993*T)*Math.PI/180; L += 10.60*Math.sin(M)+1.85*Math.sin(2*M); break;
      case 'jupiter': L = 34.3515 + 3034.9057*T; M = (20.0993+3034.9057*T)*Math.PI/180; L += 5.55*Math.sin(M)-0.32*Math.sin(2*M); break;
      case 'saturn':  L = 50.0774 + 1222.1138*T; M = (317.0207+1222.1138*T)*Math.PI/180; L += 6.40*Math.sin(M)+0.64*Math.sin(2*M); break;
      case 'uranus':  L = 314.0550 + 428.4670*T + 0.0003*T2; break;
      case 'neptune': L = 304.3486 + 218.4862*T + 0.0006*T2; break;
      case 'pluto':   L = 250.4740 + 144.6113*T; break;
      default: L = 0;
    }
    return ((L % 360) + 360) % 360;
  }

  function calcASC(jd, lat) {
    var T = (jd - 2451545.0) / 36525;
    var obl = 23.439291 - 0.0130042 * T;
    var oblR = obl * Math.PI / 180;
    var latR = (lat || 39.9) * Math.PI / 180;
    var LSTR = ((280.46061837 + 360.98564736629*(jd-2451545.0) + 120) % 360 + 360) % 360 * Math.PI / 180;
    var y = -Math.cos(oblR) * Math.sin(LSTR);
    var x = Math.cos(latR) * Math.sin(oblR) - Math.sin(latR) * Math.cos(oblR) * Math.cos(LSTR);
    return ((Math.atan2(y, x) * 180 / Math.PI % 360) + 360) % 360;
  }

  function lonToZodiac(lon) {
    var idx = Math.floor(lon / 30) % 12;
    var deg = Math.floor((lon % 30) * 10) / 10;
    var min = Math.floor(((lon % 30) - deg) * 60);
    return { zodiac:ZODIAC[idx], zodiacEn:ZODIAC_EN[idx], symbol:ZODIAC_SYMBOL[idx], degree:deg, minute:min, index:idx, element:ZODIAC_ELEMENT[idx], mode:ZODIAC_MODE[idx] };
  }

  var ASPECT_DEFS = [
    { name:'合',   angle:0,   orb:8, symbol:'☌', color:'#ff9999', desc:'融合强化', weight:'强' },
    { name:'六合', angle:60,  orb:6, symbol:'⚹', color:'#99cc99', desc:'和谐机遇', weight:'中' },
    { name:'刑',   angle:90,  orb:6, symbol:'□', color:'#ff6666', desc:'挑战冲突', weight:'强' },
    { name:'三合', angle:120, orb:8, symbol:'△', color:'#99ff99', desc:'顺利天赋', weight:'强' },
    { name:'冲',   angle:180, orb:8, symbol:'☍', color:'#ff4444', desc:'对立互补', weight:'强' }
  ];

  function calcAspects(planets) {
    var aspects = [];
    for (var i = 0; i < planets.length; i++) {
      for (var j = i + 1; j < planets.length; j++) {
        var diff = Math.abs(planets[i].lon - planets[j].lon);
        if (diff > 180) diff = 360 - diff;
        ASPECT_DEFS.forEach(function(a) {
          if (Math.abs(diff - a.angle) <= a.orb) {
            aspects.push({
              p1:planets[i].key, p2:planets[j].key,
              p1Lon:planets[i].lon, p2Lon:planets[j].lon,
              angle:diff,
              name:a.name, symbol:a.symbol, color:a.color, desc:a.desc, weight:a.weight,
              orb:Math.round(Math.abs(diff - a.angle)*10)/10
            });
          }
        });
      }
    }
    return aspects;
  }

  // ---- 相位解读 ----
  function getAspectInterpretation(p1Name, p2Name, aspectName) {
    var interpretations = {
      // === 太阳相位 ===
      '太阳_月亮_合':'个性与情感高度统一，内外一致，生命力旺盛。',
      '太阳_月亮_冲':'自我意识与情感需求之间有张力，需在自我和他人之间找到平衡。',
      '太阳_月亮_刑':'自我与情感之间存在内在矛盾，需学习整合内外。',
      '太阳_月亮_三合':'自信与情感和谐统一，性格开朗，人际关系良好。',
      '太阳_月亮_六合':'自我与情感自然协调，性格温和讨喜。',
      '太阳_水星_合':'思维与自我高度融合，表达能力强，聪明自信。',
      '太阳_水星_六合':'思维敏捷，学习能力强，沟通顺畅自如。',
      '太阳_金星_合':'魅力四射，热爱美好事物，有艺术天赋和社交魅力。',
      '太阳_金星_三合':'社交魅力自然流露，生活充满美感和愉悦。',
      '太阳_金星_六合':'人缘好，审美品味佳，生活态度优雅。',
      '太阳_火星_合':'精力充沛，行动力强，有领导力和竞争意识。',
      '太阳_火星_三合':'行动力与自信协调，做事果断有魄力。',
      '太阳_火星_刑':'自我表达与行动方式冲突，易冲动行事。',
      '太阳_火星_六合':'精力旺盛，做事积极主动有冲劲。',
      '太阳_木星_合':'乐观自信，心胸开阔，天生好运，有贵人运。',
      '太阳_木星_三合':'自信豁达，机遇多，人生顺遂有福气。',
      '太阳_木星_刑':'过度乐观或膨胀，需注意节制和脚踏实地。',
      '太阳_木星_六合':'天性乐观，心胸宽广，遇事总有转机。',
      '太阳_土星_合':'自律严谨，责任感强，大器晚成的潜力。',
      '太阳_土星_三合':'稳重可靠，事业有规划，步步为营。',
      '太阳_土星_刑':'自我表达受压制，需克服自卑和阻碍。',
      '太阳_土星_冲':'自我与责任之间存在张力，需平衡个人需求与义务。',
      '太阳_天王_合':'个性独特，独立自由，有创新和改革精神。',
      '太阳_天王_三合':'思想前卫，善于创新，不走寻常路。',
      '太阳_天王_刑':'个性叛逆，生活变动多，需学会适应。',
      '太阳_海王_合':'直觉力强，富有想象力和艺术天赋，但边界感弱。',
      '太阳_海王_三合':'灵感丰富，有艺术和灵性天赋。',
      '太阳_海王_刑':'自我认知模糊，需警惕逃避现实的倾向。',
      '太阳_冥王_合':'意志力极强，有深刻的转化能力和掌控欲。',
      '太阳_冥王_三合':'有强大的自我重建能力，愈挫愈勇。',
      '太阳_冥王_刑':'权力斗争或控制议题，需学会放下执念。',
      // === 月亮相位 ===
      '月亮_水星_合':'情感与思维结合，善于用语言表达感受。',
      '月亮_水星_三合':'感性理性平衡，沟通温润有说服力。',
      '月亮_水星_刑':'情绪影响理性判断，需学习区分感受与事实。',
      '月亮_金星_合':'情感温柔，有艺术天赋，恋爱中体贴入微。',
      '月亮_金星_三合':'情感和谐，温柔善良，生活充满美感。',
      '月亮_金星_刑':'情感需求与享乐欲望冲突，需注意感情中的过度依赖。',
      '月亮_金星_六合':'天生温柔体贴，人际关系和谐温馨。',
      '月亮_火星_合':'情绪激烈，行动受情感驱动，保护欲强。',
      '月亮_火星_三合':'情感能量充沛，敢爱敢恨，执行力强。',
      '月亮_火星_刑':'情绪易怒，需学会管理脾气和冲动。',
      '月亮_火星_六合':'情感行动力协调，遇事果断不拖沓。',
      '月亮_木星_合':'情感丰沛，慷慨大度，有福气和良好直觉。',
      '月亮_木星_三合':'心地善良，人缘好，生活富足安逸。',
      '月亮_木星_刑':'情感过度扩张，需注意情绪化消费。',
      '月亮_土星_合':'情感深沉克制，责任感强但需学会表达感情。',
      '月亮_土星_三合':'情感稳定成熟，给人可靠的安全感。',
      '月亮_土星_刑':'情感压抑或童年有情感缺失，需疗愈内在小孩。',
      '月亮_天王_合':'情绪波动大，需要自由的情感空间，独立性强。',
      '月亮_海王_合':'直觉力极强，有艺术和灵性天赋，但需设边界。',
      '月亮_冥王_合':'情感深沉强烈，有控制欲和转化力量。',
      // === 水星相位 ===
      '水星_金星_合':'语言优美动听，有写作和艺术表达天赋。',
      '水星_金星_三合':'善于用美感表达思想，沟通令人愉悦。',
      '水星_金星_六合':'说话讨人喜欢，社交场合中言辞得体。',
      '水星_火星_合':'思维敏捷果断，言辞犀利有攻击性。',
      '水星_火星_三合':'思维与行动协调，善于快速决策。',
      '水星_火星_刑':'言辞冲动激烈，需注意说话伤人。',
      '水星_木星_合':'学习能力强，思维开阔，语言表达有说服力。',
      '水星_木星_三合':'学习运佳，思维宏观，善于把握大局。',
      '水星_木星_刑':'想法过多不聚焦，需警惕眼高手低。',
      '水星_土星_合':'思维严谨，学习扎实，适合学术研究和深度思考。',
      '水星_土星_三合':'逻辑严密，有计划有步骤，学习循序渐进。',
      '水星_土星_刑':'思维僵化或学习受阻，需开放心态。',
      '水星_天王_合':'思维跳跃有创意，有发明和创新的天赋。',
      '水星_天王_三合':'灵感频现，善于突破常规思维。',
      '水星_海王_合':'想象力丰富，有诗意的表达能力。',
      '水星_冥王_合':'思维深刻洞察力强，善于挖掘真相。',
      // === 金星相位 ===
      '金星_火星_合':'情感与行动力结合，魅力与激情并存，桃花旺盛。',
      '金星_火星_三合':'感情与行动和谐，恋爱主动且浪漫，人际关系融洽。',
      '金星_火星_刑':'情感与行动有冲突，爱情中容易产生矛盾。',
      '金星_火星_六合':'恋爱主动浪漫，异性缘佳。',
      '金星_木星_合':'桃花运旺盛，热爱享受生活，有良好的艺术品味。',
      '金星_木星_三合':'人缘极好，生活富足美满，有艺术才华。',
      '金星_木星_刑':'过度享乐或铺张浪费，需注意节制。',
      '金星_土星_合':'感情保守认真，有责任感但需克服情感上的冷淡。',
      '金星_土星_三合':'感情成熟稳定，婚姻责任感强。',
      '金星_土星_刑':'感情受挫或延迟，需学习打开心扉。',
      '金星_天王_合':'感情独立自由，追求新鲜刺激，不稳定。',
      '金星_天王_三合':'恋爱中有惊喜和新意，不喜平淡。',
      '金星_海王_合':'浪漫至极，有艺术和音乐才华，但需防感情幻想。',
      '金星_海王_三合':'感情温柔浪漫，有艺术和灵性天赋。',
      '金星_冥王_合':'感情深刻强烈，有占有欲和转化力。',
      // === 火星相位 ===
      '火星_木星_合':'行动力与运气结合，冒险精神强，做事有魄力。',
      '火星_木星_三合':'行动力充沛，机遇把握能力强。',
      '火星_木星_刑':'冲动冒进，需注意风险控制和耐心。',
      '火星_土星_合':'行动力与纪律结合，有强大的执行力但需注意压力。',
      '火星_土星_三合':'意志力与行动力协调，做事有章法。',
      '火星_土星_刑':'行动受阻或愤怒被压抑，需找到健康的释放方式。',
      '火星_天王_合':'行动大胆突破，有爆发力但也易出意外。',
      '火星_天王_三合':'行动有创意，敢于突破常规。',
      '火星_海王_合':'行动受直觉驱使，艺术创作力强但方向感弱。',
      '火星_冥王_合':'意志力和执行力极为强大，有控制和转化的力量。',
      // === 木星相位 ===
      '木星_土星_合':'理想与现实结合，有实现远大目标的能力。',
      '木星_土星_三合':'循序渐进地实现理想，事业有长期规划。',
      '木星_土星_刑':'理想与现实的矛盾，需在扩张和收缩间找平衡。',
      '木星_天王_合':'创新与扩张的结合，有改革社会的理想。',
      '木星_天王_三合':'机遇来得出其不意，善于抓住时代风口。',
      '木星_海王_合':'有强烈的理想主义和灵性追求，慈悲为怀。',
      '木星_冥王_合':'有强大的转化和影响力，追求深刻的变革。',
      // === 土星相位 ===
      '土星_天王_合':'传统与创新的张力，有建设性的改革能力。',
      '土星_海王_合':'现实与理想的拉扯，需脚踏实地追梦。',
      '土星_冥王_合':'有强大的忍耐力和转化力，能承受巨大压力。',
      // === 三王星相位 ===
      '天王_海王_合':'代际相位，代表集体意识的创新与灵性融合。',
      '天王_冥王_合':'代际相位，代表深刻的变革和权力重构。',
      '海王_冥王_合':'代际相位，代表灵性与转化的深度结合。',
    };
    var key1 = p1Name + '_' + p2Name + '_' + aspectName;
    var key2 = p2Name + '_' + p1Name + '_' + aspectName;
    return interpretations[key1] || interpretations[key2] || '';
  }

  function calculateChart(year, month, day, hour, minute, lat) {
    if (lat === undefined) lat = 39.9;
    var jd = toJD(year, month, day, hour + (minute||0) / 60);
    var T = (jd - 2451545.0) / 36525;

    var planets = [];
    PLANETS.forEach(function(p) {
      var lon = calcPlanetLon(T, p.key);
      var zod = lonToZodiac(lon);
      var planetInfo = PLANET_SIGN_MEANING[p.key];
      var signMeaning = planetInfo ? (planetInfo[zod.zodiac] || '') : '';
      planets.push({
        key:p.key, name:p.name, symbol:p.symbol, color:p.color, glyph:p.glyph,
        lon:lon, zodiac:zod.zodiac, zodiacEn:zod.zodiacEn, zodiacSymbol:zod.symbol,
        degree:zod.degree, minute:zod.minute, index:zod.index,
        element:zod.element, mode:zod.mode,
        signMeaning:signMeaning
      });
    });

    var asc = calcASC(jd, lat);
    var ascZod = lonToZodiac(asc);
    var desc = (asc + 180) % 360, descZod = lonToZodiac(desc);
    var mc = (asc + 270) % 360, mcZod = lonToZodiac(mc);
    var ic = (asc + 90) % 360, icZod = lonToZodiac(ic);

    var houses = [];
    for (var h = 0; h < 12; h++) {
      var cuspLon = (asc + h * 30) % 360;
      var zod = lonToZodiac(cuspLon);
      houses.push({ num:h+1, name:HOUSE_NAMES[h], meaning:HOUSE_MEANING[h], cuspLon:cuspLon, zodiac:zod.zodiac, symbol:zod.symbol, degree:zod.degree });
    }

    var aspects = calcAspects(planets);

    return { planets:planets, asc:asc, ascZod:ascZod, desc:desc, descZod:descZod, mc:mc, mcZod:mcZod, ic:ic, icZod:icZod, houses:houses, aspects:aspects };
  }

  // ========= SVG 星盘(含相位连线) =========
  function renderSvg(chart, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var size = Math.min(container.clientWidth || 680, 680);
    container.innerHTML = '';
    container.style.width = size + 'px';
    container.style.height = size + 'px';

    // 存储全局引用供点击弹窗使用
    window._astroChart = chart;

    var cx = size/2, cy = size/2;
    var rOuter = size/2 - 16;
    var rRing1 = rOuter - 14;           // 外环（星座带外沿）
    var rRing2 = rRing1 - 38;           // 星座带内沿
    var rRingMid = (rRing1 + rRing2) / 2; // 星座带中线（行星位）
    var rHouseInner = rRing2 - 6;       // 宫位扇区内沿
    var rInner = rOuter * 0.25;         // 中心圆

    var HOUSE_COLORS = [
      'rgba(255,150,130,0.12)','rgba(180,210,140,0.12)','rgba(240,200,100,0.12)',
      'rgba(130,160,220,0.12)','rgba(240,140,90,0.12)','rgba(170,150,120,0.12)',
      'rgba(230,170,190,0.12)','rgba(210,100,120,0.12)','rgba(160,120,220,0.12)',
      'rgba(120,140,170,0.12)','rgba(100,190,220,0.12)','rgba(100,150,210,0.12)'
    ];

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';

    // 背景
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(rOuter+12)+'" fill="rgba(10,10,32,0.94)" stroke="rgba(200,180,140,0.25)" stroke-width="1.5"/>';

    // ---- 宫位扇形填充 ----
    for (var h = 0; h < 12; h++) {
      var hAngleStart = -chart.houses[h].cuspLon + 90;
      var hNextIdx = (h + 1) % 12;
      var hAngleEnd = -chart.houses[hNextIdx].cuspLon + 90;
      if (hAngleEnd < hAngleStart) hAngleEnd += 360;

      var radS = hAngleStart * Math.PI / 180;
      var radE = hAngleEnd * Math.PI / 180;

      var x1o = cx + rOuter * Math.cos(radS);
      var y1o = cy - rOuter * Math.sin(radS);
      var x1i = cx + rHouseInner * Math.cos(radS);
      var y1i = cy - rHouseInner * Math.sin(radS);
      var x2o = cx + rOuter * Math.cos(radE);
      var y2o = cy - rOuter * Math.sin(radE);
      var x2i = cx + rHouseInner * Math.cos(radE);
      var y2i = cy - rHouseInner * Math.sin(radE);
      var large = (hAngleEnd - hAngleStart) > 180 ? 1 : 0;

      svg += '<path class="clickable" d="M'+x1i.toFixed(1)+' '+y1i.toFixed(1)+' L'+x1o.toFixed(1)+' '+y1o.toFixed(1)+' A'+rOuter+' '+rOuter+' 0 '+large+' 1 '+x2o.toFixed(1)+' '+y2o.toFixed(1)+' L'+x2i.toFixed(1)+' '+y2i.toFixed(1)+' A'+rHouseInner+' '+rHouseInner+' 0 '+large+' 0 '+x1i.toFixed(1)+' '+y1i.toFixed(1)+'" fill="'+HOUSE_COLORS[h]+'" stroke="none" onclick="showAstroPopup(\'house\','+h+',event)"/>';
    }

    // ---- 外环边框 ----
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+rOuter+'" fill="none" stroke="rgba(200,180,140,0.35)" stroke-width="2"/>';
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+rRing1+'" fill="none" stroke="rgba(200,180,140,0.2)" stroke-width="1"/>';
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+rRing2+'" fill="none" stroke="rgba(200,180,140,0.25)" stroke-width="1.5"/>';
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+rHouseInner+'" fill="none" stroke="rgba(200,180,140,0.12)" stroke-width="0.8"/>';
    svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+rInner+'" fill="rgba(10,10,32,0.92)" stroke="rgba(200,180,140,0.3)" stroke-width="1.5"/>';

    // ---- 宫位分割线 + 宫位号 + 星座标签 ----
    for (var h = 0; h < 12; h++) {
      var angle = -chart.houses[h].cuspLon + 90;
      var rad = angle * Math.PI / 180;

      // 分割线 (从内圆到外环)
      var x1 = cx + rInner * Math.cos(rad);
      var y1 = cy - rInner * Math.sin(rad);
      var x2 = cx + rOuter * Math.cos(rad);
      var y2 = cy - rOuter * Math.sin(rad);
      svg += '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="rgba(200,180,140,0.5)" stroke-width="1.2"/>';

      // 宫位标号 (在内圆外沿)
      var midAngle = (-((chart.houses[h].cuspLon + chart.houses[(h+1)%12].cuspLon)/2) + 90);
      // handle wrap-around
      var da = chart.houses[(h+1)%12].cuspLon - chart.houses[h].cuspLon;
      if (da < 0) da += 360;
      var midAngle2 = -((chart.houses[h].cuspLon + da/2) % 360) + 90;
      var midRad = midAngle2 * Math.PI / 180;
      var mnx = cx + (rInner + 26) * Math.cos(midRad);
      var mny = cy - (rInner + 26) * Math.sin(midRad);
      svg += '<text x="'+mnx.toFixed(1)+'" y="'+mny.toFixed(1)+'" text-anchor="middle" fill="rgba(200,180,140,0.6)" font-size="10" font-weight="bold" dy="3.5">'+(h+1)+'</text>';

      // 宫头星座标签 (在外环上)
      var hz = chart.houses[h];
      var hzx = cx + (rOuter - 10) * Math.cos(rad);
      var hzy = cy - (rOuter - 10) * Math.sin(rad);
      svg += '<text x="'+hzx.toFixed(1)+'" y="'+hzy.toFixed(1)+'" text-anchor="middle" fill="'+ZODIAC_COLORS[hz.zodiac ? (ZODIAC.indexOf(hz.zodiac)) : h]+'" font-size="9" dy="-5">'+hz.symbol+'</text>';
      svg += '<text x="'+hzx.toFixed(1)+'" y="'+hzy.toFixed(1)+'" text-anchor="middle" fill="rgba(200,180,140,0.5)" font-size="6.5" dy="6">'+hz.zodiac+' '+hz.degree+'°</text>';
    }

    // ---- 星座符号环（在Ring2和Ring1之间均匀分布12星座30°区间中点） ----
    for (var s = 0; s < 12; s++) {
      var sMidAngle = -s * 30 + 105;  // center of sign sector
      var sRad = sMidAngle * Math.PI / 180;
      var sx = cx + rRingMid * Math.cos(sRad);
      var sy = cy - rRingMid * Math.sin(sRad);
      svg += '<text class="clickable" x="'+sx.toFixed(1)+'" y="'+sy.toFixed(1)+'" text-anchor="middle" fill="'+ZODIAC_COLORS[s]+'" font-size="13" font-weight="bold" dy="4" opacity="0.85" onclick="showAstroPopup(\'sign\','+s+',event)">'+ZODIAC_SYMBOL[s]+'</text>';
    }

    // ---- 相位连线 ----
    chart.aspects.forEach(function(a) {
      var p1 = chart.planets.find(function(pl){return pl.key===a.p1;});
      var p2 = chart.planets.find(function(pl){return pl.key===a.p2;});
      if (!p1 || !p2) return;
      var rad1 = (-p1.lon + 90) * Math.PI/180;
      var rad2 = (-p2.lon + 90) * Math.PI/180;
      var px1 = cx + rRingMid * Math.cos(rad1), py1 = cy - rRingMid * Math.sin(rad1);
      var px2 = cx + rRingMid * Math.cos(rad2), py2 = cy - rRingMid * Math.sin(rad2);
      var isMajor = a.weight === '强';
      var alpha = isMajor ? (a.name==='合' ? 0.55 : a.name==='三合' ? 0.45 : a.name==='刑' ? 0.4 : 0.35) : 0.25;
      var dash = isMajor ? '' : ' stroke-dasharray="4,3"';
      var sw = isMajor ? '1.2' : '0.8';
      svg += '<line x1="'+px1.toFixed(1)+'" y1="'+py1.toFixed(1)+'" x2="'+px2.toFixed(1)+'" y2="'+py2.toFixed(1)+'" stroke="'+a.color+'" stroke-width="'+sw+'" opacity="'+alpha+'"'+dash+'/>';
    });

    // ---- 行星（均匀分布在星座环内） ----
    var planetRadStart = rRing2 + 10;
    var planetRadEnd = rRing1 - 12;
    var planetSpacing = (planetRadEnd - planetRadStart) / 3;
    var usedSlots = {};
    chart.planets.forEach(function(p, pi) {
      var rad = (-p.lon + 90) * Math.PI / 180;
      var signIdx = Math.floor(((p.lon % 360) + 360) % 360 / 30);
      var slotKey = signIdx;
      var slot = usedSlots[slotKey] || 0;
      usedSlots[slotKey] = slot + 1;
      var rP = planetRadStart + slot * planetSpacing;
      if (rP > planetRadEnd) rP = planetRadStart + (slot % 4) * planetSpacing;
      var px = cx + rP * Math.cos(rad), py = cy - rP * Math.sin(rad);
      svg += '<circle class="clickable" cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" r="9" fill="rgba(15,15,40,0.93)" stroke="'+p.color+'" stroke-width="1.8" onclick="showAstroPopup(\'planet\','+pi+',event)"/>';
      svg += '<text x="'+px.toFixed(1)+'" y="'+py.toFixed(1)+'" text-anchor="middle" fill="'+p.color+'" font-size="10" dy="3.5" font-weight="bold" style="pointer-events:none">'+p.glyph+'</text>';
    });

    // ---- 四轴标记 ----
    function axisMark(lon, label, color, key) {
      var rad = (-lon + 90) * Math.PI / 180;
      var x = cx + (rOuter + 2) * Math.cos(rad), y = cy - (rOuter + 2) * Math.sin(rad);
      svg += '<rect class="clickable" x="'+(x-16)+'" y="'+(y-9)+'" width="32" height="16" rx="8" fill="rgba(10,10,32,0.92)" stroke="'+color+'" stroke-width="1.2" onclick="showAstroPopup(\'axis\',\''+key+'\',event)"/>';
      svg += '<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="'+color+'" font-size="9" font-weight="bold" dy="4.5" style="pointer-events:none">'+label+'</text>';
    }
    axisMark(chart.asc,  'ASC', '#ff8888', 'asc');
    axisMark(chart.desc, 'DES', '#ff8888', 'desc');
    axisMark(chart.mc,   'MC',  '#88ccff', 'mc');
    axisMark(chart.ic,   'IC',  '#88ccff', 'ic');

    // ---- 中心文字 ----
    var ascZod = chart.ascZod || lonToZodiac(chart.asc);
    svg += '<text class="clickable" x="'+cx+'" y="'+(cy-10)+'" text-anchor="middle" fill="rgba(220,200,160,0.7)" font-size="10" letter-spacing="1" onclick="showAstroPopup(\'axis\',\'asc\',event)">ASC</text>';
    svg += '<text class="clickable" x="'+cx+'" y="'+(cy+8)+'" text-anchor="middle" fill="'+ZODIAC_COLORS[ascZod.index]+'" font-size="13" font-weight="bold" onclick="showAstroPopup(\'sign\','+ascZod.index+',event)">'+ascZod.symbol+' '+ascZod.zodiac+'</text>';
    svg += '<text class="clickable" x="'+cx+'" y="'+(cy+24)+'" text-anchor="middle" fill="rgba(200,180,140,0.5)" font-size="8" onclick="showAstroPopup(\'sign\','+ascZod.index+',event)">'+ascZod.degree+'°</text>';

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ========= 行星列表渲染 =========
  function renderPlanetTable(chart, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '';
    chart.planets.forEach(function(p, pi) {
      html += '<div class="planet-row clickable" onclick="showAstroPopup(\'planet\','+pi+',event)" style="cursor:pointer">';
      html += '<span class="pl-symbol" style="color:'+p.color+'">'+p.glyph+'</span>';
      html += '<span class="pl-name">'+p.name+'</span>';
      html += '<span class="pl-info">'+p.zodiacSymbol+' '+p.zodiac+' '+p.degree+'°'+p.minute+'\'</span>';
      html += '<span class="pl-info-sm">'+p.element+' · '+p.mode+'</span>';
      html += '</div>';
      if (p.signMeaning) {
        html += '<div class="planet-interp">'+p.signMeaning+'</div>';
      }
    });
    // 四轴
    var axes = [
      { label:'上升 ASC', zod:chart.ascZod, color:'#ff9999' },
      { label:'下降 DES', zod:chart.descZod, color:'#ff9999' },
      { label:'中天 MC', zod:chart.mcZod, color:'#99ccff' },
      { label:'天底 IC', zod:chart.icZod, color:'#99ccff' }
    ];
    html += '<div class="planet-section-title">四轴</div>';
    axes.forEach(function(a) {
      var axKey = a.label.indexOf('ASC')>=0?'asc':a.label.indexOf('DES')>=0?'desc':a.label.indexOf('MC')>=0?'mc':'ic';
      html += '<div class="planet-row axis-row clickable" onclick="showAstroPopup(\'axis\',\''+axKey+'\',event)" style="cursor:pointer">';
      html += '<span class="pl-symbol" style="color:'+a.color+'">'+(a.label.indexOf('ASC')>=0?'AC':a.label.indexOf('DES')>=0?'DS':'MC')+'</span>';
      html += '<span class="pl-name">'+a.label+'</span>';
      html += '<span class="pl-info">'+a.zod.symbol+' '+a.zod.zodiac+' '+a.zod.degree+'°</span>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  // ========= 相位表格渲染(含解读) =========
  function renderAspectTable(chart, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '';
    chart.aspects.forEach(function(a) {
      var p1 = chart.planets.find(function(pl){return pl.key===a.p1;});
      var p2 = chart.planets.find(function(pl){return pl.key===a.p2;});
      if (!p1 || !p2) return;
      var interp = getAspectInterpretation(p1.name, p2.name, a.name);
      html += '<div class="aspect-row" style="border-left:3px solid '+a.color+'">';
      html += '<span class="asp-symbol" style="color:'+a.color+'">'+a.symbol+'</span>';
      html += '<span class="asp-planets">'+p1.glyph+' '+p1.name+' '+a.name+' '+p2.name+' '+p2.glyph+'</span>';
      html += '<span class="asp-orb">'+a.orb+'°</span>';
      html += '</div>';
      html += '<div class="aspect-interp">'+a.desc+' · '+(interp||'')+'</div>';
    });
    if (!chart.aspects.length) html = '<div class="aspect-empty">无显著相位</div>';
    container.innerHTML = html;
  }

  // ========= 宫位含星渲染 =========
  function renderHouseTable(chart, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = '';
    chart.houses.forEach(function(h) {
      var inHouse = [];
      chart.planets.forEach(function(p) {
        var houseIdx = Math.floor(((p.lon - chart.asc + 360) % 360) / 30);
        if (houseIdx === h.num - 1) inHouse.push(p);
      });
      html += '<div class="house-row'+(inHouse.length>0?' has-planet':'')+' clickable" onclick="showAstroPopup(\'house\','+(h.num-1)+',event)" style="cursor:pointer">';
      html += '<span class="hr-num">'+h.num+'</span>';
      html += '<span class="hr-name">'+h.zodiac+' '+h.symbol+' '+h.degree+'°</span>';
      html += '<span class="hr-label">'+h.name+'</span>';
      if (inHouse.length) html += '<span class="hr-planets">'+inHouse.map(function(p){return '<span style="color:'+p.color+'">'+p.glyph+'</span>';}).join(' ')+'</span>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  // ---- 星盘格局检测 ----
  function detectPatterns(chart) {
    var patterns = [];
    // 1. 星群 (Stellium) — 3+ 行星在同一星座
    var signCounts = {};
    chart.planets.forEach(function(p) { var k = p.zodiac; signCounts[k] = (signCounts[k]||0) + 1; });
    Object.keys(signCounts).forEach(function(s) {
      if (signCounts[s] >= 3) patterns.push({name:'星群 Stellium', desc:s+'座聚集'+signCounts[s]+'颗行星，该星座能量极强，是人生核心议题。',color:'#f0c060'});
    });

    // 2. 大三角 (Grand Trine) — 3星两两三合(120°)
    for (var i = 0; i < chart.planets.length; i++) {
      for (var j = i+1; j < chart.planets.length; j++) {
        for (var k = j+1; k < chart.planets.length; k++) {
          var d12 = Math.abs(chart.planets[i].lon - chart.planets[j].lon); if (d12>180) d12=360-d12;
          var d23 = Math.abs(chart.planets[j].lon - chart.planets[k].lon); if (d23>180) d23=360-d23;
          var d31 = Math.abs(chart.planets[k].lon - chart.planets[i].lon); if (d31>180) d31=360-d31;
          if (Math.abs(d12-120)<=8 && Math.abs(d23-120)<=8 && Math.abs(d31-120)<=8) {
            patterns.push({name:'大三角 Grand Trine', desc:chart.planets[i].name+'·'+chart.planets[j].name+'·'+chart.planets[k].name+'形成大三角，天赋流畅，所在领域事半功倍。',color:'#99ff99'});
          }
        }
      }
    }

    // 3. T三角 (T-Square) — 2对冲+1刑
    chart.aspects.forEach(function(a1) {
      if (a1.name !== '冲') return;
      chart.aspects.forEach(function(a2) {
        if (a2.name !== '刑') return;
        var apex = (a2.p1 === a1.p1 || a2.p1 === a1.p2) ? a2.p2 : (a2.p2 === a1.p1 || a2.p2 === a1.p2) ? a2.p1 : null;
        if (apex && apex !== a1.p1 && apex !== a1.p2) {
          patterns.push({name:'T三角 T-Square', desc:'顶点行星'+apex+'承受对冲压力，需要主动突破才能化解紧张格局。',color:'#ff6666'});
        }
      });
    });

    // 4. 大十字 (Grand Cross) — 4星十字对冲
    var oppPairs = [];
    chart.aspects.forEach(function(a) {
      if (a.name === '冲') oppPairs.push([a.p1, a.p2]);
    });
    for (var oi = 0; oi < oppPairs.length; oi++) {
      for (var oj = oi+1; oj < oppPairs.length; oj++) {
        var set = oppPairs[oi].concat(oppPairs[oj]);
        if (new Set(set).size === 4) {
          patterns.push({name:'大十字 Grand Cross', desc:'四星形成十字格局，人生充满挑战与张力，但也蕴含着巨大的成就潜力。',color:'#ff4444'});
        }
      }
    }

    // 去重
    var seen = {};
    return patterns.filter(function(p) {
      var key = p.name + p.desc;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  // ---- 元素分布 ----
  function calcElementDist(chart) {
    var counts = {火:0,土:0,风:0,水:0};
    chart.planets.forEach(function(p) { counts[p.element] = (counts[p.element]||0) + 1; });
    return counts;
  }

  return {
    calculateChart:calculateChart, renderSvg:renderSvg,
    renderPlanetTable:renderPlanetTable, renderAspectTable:renderAspectTable, renderHouseTable:renderHouseTable,
    detectPatterns:detectPatterns, calcElementDist:calcElementDist,
    ZODIAC:ZODIAC, ZODIAC_SYMBOL:ZODIAC_SYMBOL, PLANETS:PLANETS, HOUSE_MEANING:HOUSE_MEANING
  };
})();
