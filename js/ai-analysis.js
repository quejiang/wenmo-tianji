/**
 * 紫微斗数 · AI 命盘分析引擎
 * 基于规则引擎生成个性化命盘解读
 */

var AIAnalysis = (function() {

  // ==================== 命宫主星性格分析 ====================
  var PERSONALITY_TRAITS = {
    '紫微': {
      miao: '您天生具备领袖气质，自尊心强，处事圆融有度，在人群中自然而然地成为焦点。您追求体面与尊严，有较强的管理天赋，适合担任领导岗位。内心渴望被认可和尊重，对生活品质有较高要求。',
      wang: '您有较强的领导欲望和组织能力，行事稳重得体。虽不如庙旺时那般光芒万丈，但依然能在团队中脱颖而出，获得他人信任。',
      de: '您具备一定的组织才能和领导潜质，但需要后天努力才能充分发挥。建议多参与团队合作，在实践中培养管理能力。',
      li: '您的领导气质较为内敛，有时显得优柔寡断。建议增强自信，勇敢表达自己的想法，敢于承担责任。',
      ping: '您性格中带有一定的孤傲倾向，好面子但执行力稍弱。需要注意避免眼高手低，脚踏实地方能有所作为。',
      bu: '您的自尊心较强但现实中的掌控力有限，容易产生怀才不遇之感。建议调整心态，从小事做起逐步积累。',
      xian: '您内心渴望被尊重和认可，但现实中容易受到挫折。建议降低期望值，学会在平凡中找到自我价值。'
    },
    '天机': {
      miao: '您思维敏捷、足智多谋，是天生的策划者和分析师。您善于从复杂的信息中找出规律，具有超前的前瞻性眼光。学习能力强，对新事物充满好奇，适合从事研究、咨询、IT等需要脑力的工作。',
      wang: '您头脑灵活，反应迅速，善于分析和规划。虽偶有犹豫，但多数时候能做出明智的判断。',
      de: '您思维活跃，但有时过于发散。建议培养专注力，在一个领域深耕，避免浅尝辄止。',
      li: '您的思绪较多，容易陷入过度思考。建议学会放松大脑，通过冥想、运动等方式缓解精神压力。',
      ping: '您思虑过多，容易心神不宁。建议培养决断力，减少不必要的忧虑，学会"想好就做"。',
      bu: '您的神经较为敏感，容易焦虑失眠。建议规律作息，适当运动，减少咖啡因摄入。',
      xian: '您容易陷入反复思虑的漩涡中，决策困难。建议寻求可靠的参谋帮助，避免独自钻牛角尖。'
    },
    '太阳': {
      miao: '您热情大方、光明磊落，是天生的奉献者。您心胸开阔，乐于助人，在社交场合中如太阳般温暖他人。事业心强，适合从事公益、教育、管理等工作。日生人更是光芒万丈，事业有成。',
      wang: '您性格开朗，待人真诚，有较强的社会责任感和奉献精神，人缘相当不错。',
      de: '您为人正直热情，但偶尔会因过于直率而得罪人。建议在表达方式上稍加柔和。',
      li: '您的热情有时会因外界环境而受到抑制。建议多与积极向上的人交往，保持内心的阳光。',
      ping: '您内心热情但外在表现有时不够坚定。建议增强自信心，不要因为他人的评价而动摇。',
      bu: '您虽心怀热忱但现实中容易感到力不从心，奔波劳碌却收获有限。建议聚焦目标，集中精力。',
      xian: '您容易感到精力不足，热情被现实消耗。建议合理分配精力，避免过度付出导致枯竭。'
    },
    '武曲': {
      miao: '您刚毅果决、执行力强，是典型的行动派。您有卓越的理财天赋，对数字敏感，善于投资和资产管理。做事干脆利落，不拖泥带水，适合从事金融、军警、工程等需要决断力的行业。',
      wang: '您做事果断，有较强的执行力和理财能力，在事业上能够独当一面。',
      de: '您有不错的经济头脑和执行力，但偶尔会过于刚硬，建议在人际交往中多一些柔性。',
      li: '您的决断力在特定环境下才能充分发挥。建议选择适合自己的行业和岗位。',
      ping: '您性格刚强但有时刚愎自用，需要注意听取他人意见，避免一意孤行。',
      bu: '您容易因过于刚硬而与人产生摩擦，财运起伏较大。建议培养柔韧度，学会变通。',
      xian: '您的执行力受到压制，常有壮志难酬之感。建议寻找适合的舞台，不要在不合适的环境中硬撑。'
    },
    '天同': {
      miao: '您性格温和、知足常乐，是天生的福星。您人缘极好，善于协调人际关系，在团队中扮演润滑剂的角色。懂得享受生活，不喜争斗，适合从事服务、协调、创意类工作。',
      wang: '您性格随和，处事圆融，有不错的福气和贵人缘，生活相对顺遂。',
      de: '您为人温和，但有时缺乏进取心。建议在安逸之余适当给自己一些挑战。',
      li: '您的随和性格在竞争激烈的环境中可能显得被动。建议学会适时表达自己的立场。',
      ping: '您容易安于现状，缺乏奋斗的动力。建议设定明确的目标，逐步提升自我。',
      bu: '您的懒散倾向较为明显，容易错失良机。建议培养自律性，制定计划并坚持执行。',
      xian: '您的进取心较弱，容易随波逐流。建议寻找自己真正热爱的事物，激发内在动力。'
    },
    '廉贞': {
      miao: '您性格刚烈执着，爱憎分明，有强烈的正义感和责任心。您有能力承担重要职责，做事认真专注。情感丰富，异性缘佳，但需注意感情中的执念和控制欲。',
      wang: '您做事认真负责，有较强的原则性和执行力，在团队中是不可或缺的中坚力量。',
      de: '您有一定的责任心，但有时过于较真。建议学会适度放松，不要事事追求完美。',
      li: '您的执着在某些情境下是优势，但在另一些情境下可能成为负担。建议培养灵活性。',
      ping: '您容易钻牛角尖，情感纠葛较多。建议学会放下，不要让自己陷入不必要的执念中。',
      bu: '您的偏执倾向较强，需注意情绪管理。建议多与信任的朋友倾诉，避免情绪积压。',
      xian: '您的情感较为复杂，容易陷入困境。建议寻求专业的心理疏导，学会与自己和解。'
    },
    '天府': {
      miao: '您稳重包容、从容不迫，是天生的管理者。您善于储蓄和资产管理，不动产运强，一生富足。做事不急不躁，有大将之风，适合从事管理、金融、房地产等行业。',
      wang: '您为人稳重，有不错的经济头脑和管理能力，生活相对优渥。',
      de: '您有一定的统筹能力和财运，但需要在实践中不断提升自己的管理水平。',
      li: '您性格稳重但有时过于保守。建议在稳健的基础上适当尝试新的可能性。',
      ping: '您的保守倾向可能限制了发展空间。建议适度开放心态，接受新鲜事物。',
      bu: '您容易因过于保守而错失机遇，理财方面需更加主动。建议学习投资知识。',
      xian: '您的管理才能和财运受到一定的限制。建议从小处着手，逐步积累。'
    },
    '太阴': {
      miao: '您细腻温柔、善解人意，有丰富的内心世界和艺术天赋。您容貌秀丽，气质优雅，在人群中给人舒适的感觉。情感丰富，是很好的倾听者和知己。夜生人更是运势亨通。',
      wang: '您情感细腻，有不错的审美和艺术修养，人际关系和谐。',
      de: '您有一定的艺术天赋和感知能力，建议多发展自己的兴趣爱好。',
      li: '您的情绪较为敏感，容易受到外界影响。建议学会情绪管理，保持内心平静。',
      ping: '您容易情绪化，缺乏安全感。建议建立稳定的生活节奏和可靠的人际支持系统。',
      bu: '您的情绪波动较大，容易陷入低潮。建议规律运动，通过艺术表达来宣泄情感。',
      xian: '您的情感需求较强但现实中难以满足，容易感到孤独。建议主动建立亲密关系。'
    },
    '贪狼': {
      miao: '您多才多艺、擅长社交，是天生的交际家。您有出众的艺术修养和审美品味，在人群中魅力四射。充满好奇心和学习欲望，适合从事艺术、娱乐、外交等行业。',
      wang: '您有不错的社交能力和才艺，人缘好，生活丰富多彩。',
      de: '您有一定的才艺和社交能力，建议专注发展一两项核心技能，避免样样通样样松。',
      li: '您的社交才能在特定场合才能发挥。建议选择适合自己的社交圈子，不要强求融入。',
      ping: '您容易被欲望驱动，需注意节制。建议培养健康的生活习惯，避免过度放纵。',
      bu: '您的欲望控制力较弱，容易沉迷。建议建立自律机制，寻求健康的情趣出口。',
      xian: '您的才华受到压抑，容易产生不满。建议转换环境，在新的平台上展示自我。'
    },
    '巨门': {
      miao: '您口才卓越、善于表达，有强大的洞察力和研究精神。适合从事律师、教师、传媒、咨询等以口为业的职业。您能看到事物的阴暗面，因此也具有优秀的风险评估能力。',
      wang: '您善于分析问题，表达能力不错，在需要逻辑推理和语言表达的领域有优势。',
      de: '您有一定的口才和洞察力，但需注意表达方式，避免因言语过于犀利而伤人。',
      li: '您的表达才能在某些领域有优势，建议选择适合自己的职业方向。',
      ping: '您容易因言辞产生是非，建议谨言慎行，学会在适当的场合说适当的话。',
      bu: '您的是非较多，祸从口出的风险较大。建议沉默是金，多听少说。',
      xian: '您的研究精神和洞察力难以发挥，容易感到憋闷。建议找到适合发挥的环境。'
    },
    '天相': {
      miao: '您公正无私、善于辅助协调，是最优秀的"二把手"。您注重生活品质和外貌仪表，有良好的审美品味。处理行政事务井井有条，适合从事管理、行政、美容时尚等行业。',
      wang: '您为人公正，有不错的协调能力和审美品味，工作中深受同事信赖。',
      de: '您有一定的组织协调能力，建议在团队中发挥自己的辅助特长。',
      li: '您的辅助性格使您在独立决策时可能缺乏主见。建议培养独立思考能力。',
      ping: '您容易随波逐流，缺乏坚定的立场。建议明确自己的价值观和人生目标。',
      bu: '您容易被他人意见左右，失去自我。建议学会说"不"，保护自己的边界。',
      xian: '您的辅助才能难以施展，容易感到不被重视。建议主动展示自己的价值。'
    },
    '天梁': {
      miao: '您成熟稳重、有长者之风，是天生的"解厄之星"。您善于为人排忧解难，一生逢凶化吉。具有教育、医疗、公益方面的天赋，适合从事教师、医生、心理咨询师等助人职业。',
      wang: '您有不错的解厄能力和助人精神，生活中常有贵人相助。',
      de: '您有一定的成熟度和助人意愿，建议发展自己的专业技能以更好地帮助他人。',
      li: '您的解厄能力在特定环境中能够发挥。建议选择适合自己的助人领域。',
      ping: '您虽有心助人但有时力不从心。建议先修炼自身，再帮助他人。',
      bu: '您容易孤高自许，助人反被误解。建议调整方式，用他人能接受的方式表达关心。',
      xian: '您的解厄能力受到限制，建议寻求他人的帮助而非总是承担帮助者的角色。'
    },
    '七杀': {
      miao: '您勇猛果断、独立自主，是天生的开创者。您敢闯敢拼，有强烈的冒险精神和开拓意识。适合创业、军警、极限运动等需要勇气和魄力的领域。',
      wang: '您独立性强，有不错的开拓精神和执行力，在竞争性行业中有优势。',
      de: '您有一定的冒险精神和独立能力，建议在可控范围内大胆尝试。',
      li: '您的开创精神在某些领域有优势，但需注意风险控制，避免过于冒进。',
      ping: '您容易冲动行事，需注意安全。建议在做重大决定前多咨询他人意见。',
      bu: '您的冒险倾向较强，需防意外血光之灾。建议做好安全防护，避免高危活动。',
      xian: '您的勇猛之气受到压抑，容易感到憋闷。建议通过运动等方式合理释放能量。'
    },
    '破军': {
      miao: '您敢于打破常规、推陈出新，是天生的改革家。您有强大的创新能力和变革魄力，不满足于现状。适合创业、产品设计、技术革新等需要"破而后立"的领域。',
      wang: '您有不错的创新意识和变革能力，在工作中善于提出新的思路和方案。',
      de: '您有一定的创新精神，但需注意变革的节奏，循序渐进比激进变革更稳妥。',
      li: '您的变革意识在特定环境中才能发挥。建议选择有创新空间的工作环境。',
      ping: '您的人生变动较多，建议学会在变动中找到稳定，避免频繁切换导致一事无成。',
      bu: '您容易陷入动荡不安的状态，消耗大于建设。建议控制变革的节奏和规模。',
      xian: '您的创新才能受到压制，建议寻找能够接受变革的环境和平台。'
    }
  };

  // 默认性格描述（命宫无主星）
  var NO_MAIN_STAR_PERSONALITY = '您的命宫无主星，性格多面且富有弹性，容易受到环境和他人影响。您不拘泥于固定的模式，能够根据情况灵活调整自己。建议借助迁移宫（对宫）的星曜来了解自己的外在形象，同时通过身宫找到人生的着力点。';

  // ==================== 宫位专项分析 ====================

  function analyzePalace(chart, palaceName) {
    var palace = chart.palaces.find(function(p) { return p.name === palaceName; });
    if (!palace) return '';
    
    var mainStars = palace.stars;
    var auxStars = palace.auxStars;
    var sihua = palace.sihua || [];
    var allStarNames = mainStars.map(function(s) { return s.name; });
    var auxStarNames = auxStars.map(function(s) { return s.name; });
    var isMing = palaceName === '命宫';
    var isShen = palace.isShenGong;
    var daXian = palace.daXian;
    
    var lines = [];
    
    // 命宫特殊处理
    if (isMing) {
      if (mainStars.length > 0) {
        var mainStar = mainStars[0];
        var brightness = mainStar.brightness || '';
        var traitMap = PERSONALITY_TRAITS[mainStar.name];
        if (traitMap) {
          var key = ['庙','旺'].indexOf(brightness) >= 0 ? 'miao' :
                    brightness === '得' ? 'de' :
                    brightness === '利' ? 'li' :
                    brightness === '平' ? 'ping' :
                    ['不','陷'].indexOf(brightness) >= 0 ? brightness === '不' ? 'bu' : 'xian' :
                    'de';
          lines.push(traitMap[key] || traitMap.de);
        }
      } else {
        lines.push(NO_MAIN_STAR_PERSONALITY);
      }
      
      // 双主星
      if (mainStars.length >= 2) {
        lines.push('命宫有' + mainStars[0].name + '和' + mainStars[1].name + '双星坐守，性格更为丰富多元，兼具两种星曜的特质。需要在两者之间找到平衡。');
      }
    }
    
    // 财帛宫分析
    if (palaceName === '财帛') {
      var wealthAnalysis = analyzeWealth(mainStars, auxStars, auxStarNames, sihua);
      if (wealthAnalysis) lines.push(wealthAnalysis);
    }
    
    // 官禄宫分析
    if (palaceName === '官禄') {
      var careerAnalysis = analyzeCareer(mainStars, auxStars, auxStarNames, sihua);
      if (careerAnalysis) lines.push(careerAnalysis);
    }
    
    // 夫妻宫分析
    if (palaceName === '夫妻') {
      var spouseAnalysis = analyzeSpouse(mainStars, auxStars, auxStarNames, sihua);
      if (spouseAnalysis) lines.push(spouseAnalysis);
    }
    
    // 迁移宫分析
    if (palaceName === '迁移') {
      if (mainStars.length > 0) {
        lines.push('迁移宫有' + mainStars.map(function(s) { return s.name; }).join('、') + '，适合向外发展。' + (auxStarNames.indexOf('天马') >= 0 ? '天马同宫，走动中生财，宜多出差或从事与外勤相关的工作。' : ''));
      }
    }
    
    // 疾厄宫分析
    if (palaceName === '疾厄') {
      var healthNote = '';
      if (auxStarNames.indexOf('擎羊') >= 0 || auxStarNames.indexOf('陀罗') >= 0) healthNote += '需注意外伤或慢性疾病，定期体检很重要。';
      if (auxStarNames.indexOf('火星') >= 0 || auxStarNames.indexOf('铃星') >= 0) healthNote += '需防急性炎症或突发健康问题。';
      if (auxStarNames.indexOf('天月') >= 0) healthNote += '体质偏弱，需长期调理。';
      if (healthNote) lines.push(healthNote);
    }
    
    // 四化提示
    sihua.forEach(function(sh) {
      var sourceTag = sh.source === '生年' ? '生年四化' : (sh.source === '离心' ? '离心自化' : '向心自化');
      if (sh.source === '生年') {
        if (sh.type === '禄' && palaceName === '财帛') lines.push('生年禄在财帛宫，财运丰沛，一生不缺钱花，赚钱相对轻松。');
        if (sh.type === '权' && palaceName === '官禄') lines.push('生年权在官禄宫，事业有掌控力，适合担任管理职位，有较强的职场竞争力。');
        if (sh.type === '科' && palaceName === '命宫') lines.push('生年科在命宫，气质优雅，得人欣赏，一生名声不错。');
        if (sh.type === '忌' && palaceName === '疾厄') lines.push('生年忌在疾厄宫，需格外关注健康，建议定期体检，培养良好的生活习惯。');
      }
    });
    
    return lines.length > 0 ? lines.join('\n\n') : '';
  }

  function analyzeWealth(mainStars, auxStars, auxStarNames, sihua) {
    var notes = [];
    var starNames = mainStars.map(function(s) { return s.name; });
    
    if (starNames.indexOf('武曲') >= 0) notes.push('武曲在财帛，正财运强，适合通过专业技能和稳定工作积累财富，理财能力出众。');
    if (starNames.indexOf('天府') >= 0) notes.push('天府在财帛，财库充盈，善于储蓄和资产管理，不动产运佳。');
    if (starNames.indexOf('太阴') >= 0) notes.push('太阴在财帛，财运细水长流，宜通过服务、艺术或女性相关行业获利。');
    if (starNames.indexOf('贪狼') >= 0) notes.push('贪狼在财帛，偏财运旺但也容易大起大落。适合娱乐、艺术、中介等偏财行业，需注意节制消费。');
    if (starNames.indexOf('廉贞') >= 0) notes.push('廉贞在财帛，求财需格外谨慎，避免因感情用事或法律纠纷破财。');
    
    if (auxStarNames.indexOf('禄存') >= 0) notes.push('禄存同宫，财星加持，有稳定的财富积累能力，不愁吃穿。');
    if (auxStarNames.indexOf('地空') >= 0 || auxStarNames.indexOf('地劫') >= 0) notes.push('地空/地劫在财帛，钱财较难聚集，宜从事创意行业或"快进快出"的生意模式。');
    if (auxStarNames.indexOf('擎羊') >= 0 || auxStarNames.indexOf('陀罗') >= 0) notes.push('擎羊/陀罗在财帛，求财过程中易有竞争和波折，需防因冲突或拖延导致财务损失。');
    
    sihua.forEach(function(sh) {
      if (sh.type === '禄' && sh.source === '生年') notes.push('生年禄在此，财运亨通，来财轻松。');
      if (sh.type === '忌' && sh.source === '生年') notes.push('生年忌在此，需谨慎理财，避免因冲动投资或过度消费导致财务压力。');
    });
    
    return notes.length > 0 ? '【财运分析】\n' + notes.join('\n') : '';
  }

  function analyzeCareer(mainStars, auxStars, auxStarNames, sihua) {
    var notes = [];
    var starNames = mainStars.map(function(s) { return s.name; });
    
    if (starNames.indexOf('紫微') >= 0) notes.push('紫微在官禄，适合担任领导岗位，有管理天赋，宜从政或做企业高管。');
    if (starNames.indexOf('天相') >= 0) notes.push('天相在官禄，适合行政管理、人事协调等辅助性工作，是优秀的"二把手"。');
    if (starNames.indexOf('太阳') >= 0) notes.push('太阳在官禄，适合教育、公益、媒体等传播类工作，事业光明正大。');
    if (starNames.indexOf('巨门') >= 0) notes.push('巨门在官禄，适合律师、教师、咨询顾问等以口为业的职业。');
    if (starNames.indexOf('天机') >= 0) notes.push('天机在官禄，适合IT、研究、策划等需要脑力的工作，思维敏捷是核心优势。');
    if (starNames.indexOf('七杀') >= 0 || starNames.indexOf('破军') >= 0) notes.push('七杀/破军在官禄，适合创业、军警、竞技等需要开拓精神的行业。');
    
    if (auxStarNames.indexOf('文昌') >= 0 || auxStarNames.indexOf('文曲') >= 0) notes.push('文昌/文曲在官禄，学术或才艺方面有天赋，宜从事文化教育或创意工作。');
    if (auxStarNames.indexOf('左辅') >= 0 || auxStarNames.indexOf('右弼') >= 0) notes.push('左辅/右弼在官禄，事业有贵人辅助，适合团队协作而非单打独斗。');
    
    sihua.forEach(function(sh) {
      if (sh.type === '权' && sh.source === '生年') notes.push('生年权在此，事业有主导权，适合争取管理职位，掌控力强。');
    });
    
    return notes.length > 0 ? '【事业分析】\n' + notes.join('\n') : '';
  }

  function analyzeSpouse(mainStars, auxStars, auxStarNames, sihua) {
    var notes = [];
    var starNames = mainStars.map(function(s) { return s.name; });
    
    if (starNames.indexOf('天同') >= 0) notes.push('天同在夫妻，配偶性格温和，婚姻生活较为和谐甜蜜。');
    if (starNames.indexOf('太阳') >= 0) notes.push('太阳在夫妻，配偶热情大方，性格阳光，但有时会较为强势。');
    if (starNames.indexOf('太阴') >= 0) notes.push('太阴在夫妻，配偶温柔体贴，容貌端正，家庭生活温馨。');
    if (starNames.indexOf('贪狼') >= 0) notes.push('贪狼在夫妻，需注意婚姻中的新鲜感维持，避免日久生厌。桃花星在此，异性缘旺。');
    if (starNames.indexOf('廉贞') >= 0) notes.push('廉贞在夫妻，感情中投入较深，但需防执念过重。宜晚婚或与年长之人结合。');
    if (starNames.indexOf('巨门') >= 0) notes.push('巨门在夫妻，夫妻间需加强沟通，避免因言语误会产生矛盾。');
    
    if (auxStarNames.indexOf('红鸾') >= 0 || auxStarNames.indexOf('天喜') >= 0) notes.push('红鸾/天喜在夫妻，婚缘早成，婚姻喜庆美满。');
    if (auxStarNames.indexOf('孤辰') >= 0 || auxStarNames.indexOf('寡宿') >= 0) notes.push('孤辰/寡宿在夫妻，婚缘较迟，宜晚婚，婚后需保持各自的独立空间。');
    
    return notes.length > 0 ? '【婚姻分析】\n' + notes.join('\n') : '';
  }

  // ==================== 格局判断 ====================

  function detectPatterns(chart) {
    var patterns = [];
    var mingPalace = chart.palaces.find(function(p) { return p.name === '命宫'; });
    var fuPalace = chart.palaces.find(function(p) { return p.name === '福德'; });
    var caiPalace = chart.palaces.find(function(p) { return p.name === '财帛'; });
    
    if (!mingPalace) return patterns;
    
    var mingZhi = mingPalace.zhiIndex;
    var allStars = mingPalace.stars.concat(mingPalace.auxStars);
    var allStarNames = allStars.map(function(s) { return s.name; });
    
    // 紫府同宫格
    if (allStarNames.indexOf('紫微') >= 0 && allStarNames.indexOf('天府') >= 0) {
      patterns.push('您命宫形成"紫府同宫格"，二帝同宫，贵气非凡，有管理和领导的双重才能，适合从政或做大型企业的管理者。');
    }
    
    // 紫微+左辅右弼
    if (allStarNames.indexOf('紫微') >= 0 && allStarNames.indexOf('左辅') >= 0 && allStarNames.indexOf('右弼') >= 0) {
      patterns.push('命宫紫微得左辅右弼拱照，帝王得佐，事业有贵人扶持，格局大为提升。');
    }
    
    // 铃昌陀武格（铃星+文昌+陀罗+武曲同宫）
    if (allStarNames.indexOf('铃星') >= 0 && allStarNames.indexOf('文昌') >= 0 && allStarNames.indexOf('陀罗') >= 0 && allStarNames.indexOf('武曲') >= 0) {
      patterns.push('需注意"铃昌陀武"格局，易有财务和法律方面的风险，建议凡事留有余地。');
    }
    
    // 火贪格（火星+贪狼同宫）
    if (allStarNames.indexOf('火星') >= 0 && allStarNames.indexOf('贪狼') >= 0) {
      patterns.push('命宫形成"火贪格"，贪狼遇火反而激发其能量，是暴发格局，但需注意来得快去得也快的特质。');
    }
    
    // 禄马交驰
    if (allStarNames.indexOf('禄存') >= 0 && allStarNames.indexOf('天马') >= 0) {
      patterns.push('命宫"禄马交驰"，走动中生财，宜向外发展，越动越有财。');
    }
    
    // 命身同宫
    if (chart.shenGong.zhiIndex === chart.mingGong.zhiIndex) {
      patterns.push('命身同宫，一生目标明确，内外一致，是比较稳定的格局。');
    }
    
    // 空劫夹命
    var emptyCount = allStarNames.filter(function(n) { return n === '地空' || n === '地劫'; }).length;
    if (emptyCount >= 2) {
      patterns.push('地空地劫汇聚命宫，需注意想法过多而落实不足，建议将创意转化为实际行动。');
    }
    
    // 杀破狼格局
    var shaPoLang = allStarNames.filter(function(n) { return n === '七杀' || n === '破军' || n === '贪狼'; }).length;
    if (shaPoLang >= 2) {
      patterns.push('命宫"杀破狼"格局，人生变动较大，适合创业和创新，不适合过于安稳的工作。');
    }
    
    return patterns;
  }

  // ==================== 身宫分析 ====================

  function analyzeShenGong(chart) {
    var shenPalace = chart.palaces.find(function(p) { return p.isShenGong; });
    if (!shenPalace || shenPalace.zhiIndex === chart.mingGong.zhiIndex) return '';
    
    var lines = [];
    lines.push('您的身宫在' + shenPalace.name + '宫，这意味着中晚年之后，您的人生重心将逐渐转向' + shenPalace.name + '宫所代表的领域。');
    
    if (shenPalace.name === '财帛') lines.push('后半生财运将成为您最重要的关注点，建议及早规划财务。');
    if (shenPalace.name === '官禄') lines.push('后半生事业将成为您人生的重要支柱，适合在中晚年发力。');
    if (shenPalace.name === '夫妻') lines.push('后半生婚姻家庭将成为您的核心关注，宜用心经营伴侣关系。');
    if (shenPalace.name === '福德') lines.push('后半生精神享受和生活品质将是您的追求，晚景安逸。');
    
    return lines.join(' ');
  }

  // ==================== 来因宫分析 ====================

  function analyzeLaiyin(chart) {
    if (chart.laiyinZhi === undefined || chart.laiyinZhi < 0) return '';
    var laiyinPalace = chart.palaces.find(function(p) { return p.zhiIndex === chart.laiyinZhi; });
    if (!laiyinPalace) return '';
    
    var notes = {
      '命宫': '来因宫在命宫，您的人生课题与自我成长密切相关。这一生最重要的是认识自己、完善自己，活出真实的自我。',
      '财帛': '来因宫在财帛宫，您此生的核心课题与财富有关。如何创造价值、管理财富是您需要深入思考的命题。',
      '官禄': '来因宫在官禄宫，事业和社会价值是您此生的主题。找到自己的使命并为之奋斗是您的核心驱动力。',
      '夫妻': '来因宫在夫妻宫，感情和伴侣关系是您此生的核心课题。学会爱与被爱是您最重要的修行。',
      '福德': '来因宫在福德宫，精神世界和内在修养是您这辈子的关键。找到内心的平静和满足比外在成功更重要。'
    };
    
    return notes[laiyinPalace.name] || '';
  }

  // ==================== 五行局解读 ====================

  function analyzeBureau(bureauNum, bureauName) {
    var notes = {
      2: '水二局之人，思维流畅，适应力强，处事灵活但需防优柔寡断。',
      3: '木三局之人，仁爱宽厚，有上进心和创造力，但需防过于理想化。',
      4: '金四局之人，刚毅果决，执行力强，善于管理但需防过于刚硬。',
      5: '土五局之人，稳重可靠，诚信务实，善于积累但需防过于保守。',
      6: '火六局之人，热情奔放，行动力强，富有感染力但需防冲动冒进。'
    };
    return notes[bureauNum] || '';
  }

  // ==================== 吉煞分布 ====================

  function analyzeStarDistribution(chart) {
    var totalJi = 0;
    var totalSha = 0;
    chart.palaces.forEach(function(p) {
      p.auxStars.forEach(function(s) {
        if (['左辅','右弼','文昌','文曲','天魁','天钺','禄存'].indexOf(s.name) >= 0) totalJi++;
        if (['擎羊','陀罗','火星','铃星','地空','地劫'].indexOf(s.name) >= 0) totalSha++;
      });
    });
    
    if (totalJi >= 5 && totalSha <= 3) return '您的命盘中吉星汇聚，一生贵人多助，顺境较多。';
    if (totalSha >= 5 && totalJi <= 3) return '您的命盘中煞星较多，人生历练丰富，经得起风雨方能见彩虹。';
    if (totalJi >= 5 && totalSha >= 4) return '您的命盘吉煞并存，人生有起有伏，既有贵人相助也需面对挑战。';
    return '';
  }

  // ==================== 大限提示 ====================

  function analyzeDaXian(chart, bazi) {
    var mingPalace = chart.palaces.find(function(p) { return p.zhiIndex === chart.mingGong.zhiIndex; });
    if (!mingPalace || !mingPalace.daXian) return '';
    
    var dx = mingPalace.daXian;
    var note = '';
    if (dx.startAge <= 3) note = '您的大限从命宫起步，幼年成长环境对一生影响重大。';
    else if (dx.startAge <= 6) note = '您的大限起运较早，少年时期即开始人生的重要阶段。';
    else note = '您的大限起运在' + dx.startAge + '岁，在此之前为根基阶段。';
    return note;
  }

  // ==================== 总体建议 ====================

  function generateRecommendations(chart) {
    var recs = [];
    var mingPalace = chart.palaces.find(function(p) { return p.name === '命宫'; });
    var allAux = mingPalace ? mingPalace.auxStars.map(function(s) { return s.name; }) : [];
    
    // 根据命宫星曜组合给建议
    if (allAux.indexOf('文昌') >= 0 || allAux.indexOf('文曲') >= 0) {
      recs.push('命宫文星加持，建议持续学习和提升自己的文化素养，将知识转化为核心竞争力。');
    }
    if (allAux.indexOf('禄存') >= 0 && allAux.indexOf('擎羊') >= 0) {
      recs.push('命宫禄存被擎羊所夹，需防小人觊觎，建议理财方面保持低调。');
    }
    if (allAux.indexOf('天马') >= 0) {
      recs.push('天马入命，一生不宜久居一地，多走动、多旅行对运势有利。');
    }
    
    // 通用建议
    if (recs.length === 0) recs.push('建议您关注本命盘的四化分布，生年禄权科忌的宫位是您人生的重点方向。');
    
    return recs;
  }

  // ==================== 主入口 ====================

  function analyze(chart, bazi) {
    var sections = [];
    
    // 1. 个性总论
    var personality = analyzePalace(chart, '命宫');
    if (personality) {
      sections.push({ title: '个性分析', content: personality, icon: '🧠' });
    }
    
    // 2. 格局
    var patterns = detectPatterns(chart);
    if (patterns.length > 0) {
      sections.push({ title: '特殊格局', content: patterns.join('\n\n'), icon: '🌟' });
    }
    
    // 3. 五行局
    var bureauAnalysis = analyzeBureau(chart.bureau, chart.bureauName);
    if (bureauAnalysis) {
      sections.push({ title: '五行局解读', content: bureauAnalysis, icon: '🪐' });
    }
    
    // 4. 身宫
    var shenAnalysis = analyzeShenGong(chart);
    if (shenAnalysis) {
      sections.push({ title: '身宫提示', content: shenAnalysis, icon: '🎯' });
    }
    
    // 5. 来因宫
    var laiyinAnalysis = analyzeLaiyin(chart);
    if (laiyinAnalysis) {
      sections.push({ title: '人生课题（来因宫）', content: laiyinAnalysis, icon: '🔮' });
    }
    
    // 6. 财帛
    var wealth = analyzePalace(chart, '财帛');
    if (wealth && wealth.indexOf('财运分析') >= 0) {
      sections.push({ title: '财运', content: wealth, icon: '💰' });
    }
    
    // 7. 事业
    var career = analyzePalace(chart, '官禄');
    if (career && career.indexOf('事业分析') >= 0) {
      sections.push({ title: '事业', content: career, icon: '💼' });
    }
    
    // 8. 婚姻
    var spouse = analyzePalace(chart, '夫妻');
    if (spouse && spouse.indexOf('婚姻分析') >= 0) {
      sections.push({ title: '婚姻', content: spouse, icon: '💕' });
    }
    
    // 9. 健康
    var health = analyzePalace(chart, '疾厄');
    if (health) {
      sections.push({ title: '健康提示', content: health, icon: '🏥' });
    }
    
    // 10. 迁移
    var move = analyzePalace(chart, '迁移');
    if (move) {
      sections.push({ title: '外出运', content: move, icon: '✈️' });
    }
    
    // 11. 吉煞分布
    var dist = analyzeStarDistribution(chart);
    if (dist) {
      sections.push({ title: '星曜格局', content: dist, icon: '⚖️' });
    }
    
    // 12. 大限
    var dx = analyzeDaXian(chart, bazi);
    if (dx) {
      sections.push({ title: '大限提示', content: dx, icon: '⏳' });
    }
    
    // 13. 建议
    var recs = generateRecommendations(chart);
    sections.push({ title: '发展建议', content: recs.join('\n\n'), icon: '💡' });
    
    return sections;
  }

  return { analyze: analyze, analyzePalace: analyzePalace, detectPatterns: detectPatterns };
})();
