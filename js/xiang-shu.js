/**
 * 相 (Xiang) — 五术之"相"
 * 手相分析 · 面相十二宫 · 风水九宫飞星
 */

var XiangShu = (function() {
  'use strict';

  // ==================== 手相三大主线 ====================

  var PALM_LINES = {
    life: {
      name: '生命线', icon: '🌿', color: '#88cc88',
      desc: '环绕拇指根部，起点在食指与拇指之间。反映体质、生命力和健康趋势。',
      readings: {
        deep: '生命力强，体质健康，精力充沛。',
        shallow: '体质偏弱，需要注意养生保健。',
        long: '长寿之相，生命力持久。不代表寿命长度，而是生命力韧性。',
        short: '不一定是短命，可能代表体质需要多加爱护。',
        chained: '早年体质偏弱，但中晚年逐渐好转。',
        double: '有强大的后备能量，抵抗力超乎常人。',
        broken: '可能有大病或重大转折，但断裂后有重生之机。'
      }
    },
    head: {
      name: '智慧线', icon: '🧠', color: '#ddaa44',
      desc: '从食指与拇指之间横向延伸。反映思维方式、智力和决策能力。',
      readings: {
        deep: '注意力集中，思维清晰，决策力强。',
        shallow: '思维较为散漫，但适应性强，多才多艺。',
        long: '思维周密，善于规划，有远见卓识。',
        short: '思维直接，行动力强，是实干型人才。',
        straight: '逻辑思维强，理性务实，适合科学/技术类工作。',
        sloping: '想象力丰富，直觉敏锐，有艺术天赋。',
        forked: '多角度思考，有创造力，但可能优柔寡断。'
      }
    },
    heart: {
      name: '感情线', icon: '💕', color: '#ee7777',
      desc: '从手掌外侧向食指方向延伸。反映情感模式、人际关系和内心世界。',
      readings: {
        deep: '情感真挚深厚，忠诚专一。',
        shallow: '在感情中较为理性，不易被情绪左右。',
        long: '情感丰富绵长，重视长期关系。',
        short: '情感表达直接，不喜拖泥带水。',
        straight: '情感表达理性平和，在关系中重视平等。',
        curved: '情感充沛热烈，浪漫主义，愿意为爱付出。',
        forked: '感情中需要空间和自由，懂得平衡付出与自我。',
        chained: '情路可能有波折，但每次经历都是成长。'
      }
    }
  };

  var PALM_HILLS = {
    venus: { name:'金星丘', position:'拇指根部', meaning:'爱情、美感、生命力', trait:'丰满者热情有活力' },
    jupiter: { name:'木星丘', position:'食指根部', meaning:'领导力、自信、野心', trait:'发达者天生领导者' },
    saturn: { name:'土星丘', position:'中指根部', meaning:'责任感、严谨、谨慎', trait:'发达者稳重可靠' },
    apollo: { name:'太阳丘', position:'无名指根部', meaning:'创造力、艺术、名声', trait:'发达者有艺术天赋' },
    mercury: { name:'水星丘', position:'小指根部', meaning:'沟通、商业头脑', trait:'发达者善于表达和经商' },
    mars: { name:'火星丘', position:'手掌边缘', meaning:'勇气、斗志、抵抗力', trait:'发达者意志坚强' },
    luna: { name:'月丘', position:'手掌外侧下部', meaning:'想象力、直觉、旅行', trait:'发达者直觉敏锐' }
  };

  // ==================== 面相十二宫 ====================

  var FACE_PALACES = [
    { name:'命宫', position:'印堂（两眉之间）', meaning:'整体运势、一生格局',
      good:'印堂开阔饱满，光明如镜，主一生顺遂，贵人运强。',
      bad:'印堂狭窄或有悬针纹，主早年劳碌，需加倍努力。' },
    { name:'兄弟宫', position:'眉毛', meaning:'兄弟姐妹缘、朋友关系',
      good:'眉毛清秀修长，兄弟朋友相助，人缘佳。',
      bad:'眉毛稀疏杂乱，兄弟缘薄，需独立自主。' },
    { name:'夫妻宫', position:'眼尾（鱼尾纹区）', meaning:'婚姻感情、配偶关系',
      good:'眼尾饱满无纹或纹路向上，婚姻美满，夫妻和谐。',
      bad:'眼尾凹陷多杂纹，婚姻波折，需要多沟通维护。' },
    { name:'子女宫', position:'眼下（泪堂）', meaning:'子女缘分、后代发展',
      good:'眼下饱满红润，子女有出息，后代昌盛。',
      bad:'眼下凹陷暗沉，子女缘薄，但可通过教育培养改变。' },
    { name:'财帛宫', position:'鼻子', meaning:'财运、财富格局',
      good:'鼻梁挺直、鼻头饱满、鼻翼有收，正财运强。',
      bad:'鼻梁低塌或鼻翼张开无收，财运起伏大，需理财规划。' },
    { name:'疾厄宫', position:'鼻梁中段（山根）', meaning:'健康运势',
      good:'山根高挺饱满，身体素质好，抵抗力强。',
      bad:'山根低陷或有横纹，体质偏弱，需注意养生。' },
    { name:'迁移宫', position:'额头两侧（驿马位）', meaning:'外出运、变动、旅行',
      good:'额角饱满，适合外出发展，异地运强。',
      bad:'额角凹陷，外出多有波折，本地发展更有利。' },
    { name:'交友宫', position:'两腮', meaning:'朋友、下属、合作伙伴',
      good:'两腮饱满有肉，朋友忠实，得人相助。',
      bad:'两腮削薄，交友需谨慎，防口舌是非。' },
    { name:'官禄宫', position:'额头正中', meaning:'事业运、官运、学业',
      good:'额头高广饱满，事业顺遂，有领导才能。',
      bad:'额头低窄或凹凸不平，事业需靠后天努力。' },
    { name:'田宅宫', position:'上眼皮', meaning:'房产、家宅运',
      good:'上眼皮饱满不浮肿，家宅安宁，房产运佳。',
      bad:'上眼皮浮肿或凹陷，家宅不宁，房产运弱。' },
    { name:'福德宫', position:'眉尾上方', meaning:'福气、享受、晚年运',
      good:'眉尾上方饱满开阔，晚运佳，福气绵长。',
      bad:'眉尾上方低陷，福气平平，需自力更生。' },
    { name:'父母宫', position:'额头两角（日角月角）', meaning:'父母运势、长辈助力',
      good:'额角饱满圆润，得父母长辈庇佑，家庭助力强。',
      bad:'额角削薄或不对称，父母缘薄，但可自己创造天地。' }
  ];

  // ==================== 九宫飞星 (年) ====================

  var FLYING_STARS = [
    { star:'一白', name:'贪狼星', element:'水', nature:'吉', color:'#6699cc',
      desc:'桃花位，主感情、人际、偏财。宜在此方位摆放鲜花或水景。' },
    { star:'二黑', name:'巨门星', element:'土', nature:'凶', color:'#888888',
      desc:'病符位，主健康问题。宜放置金属物品化解，保持安静整洁。' },
    { star:'三碧', name:'禄存星', element:'木', nature:'凶', color:'#77aa66',
      desc:'是非位，主口舌争执。宜放置红色饰品化解木气过旺。' },
    { star:'四绿', name:'文曲星', element:'木', nature:'吉', color:'#55bb55',
      desc:'文昌位，主学业、考试、创作。宜放书桌、绿植催旺文运。' },
    { star:'五黄', name:'廉贞星', element:'土', nature:'大凶', color:'#cc9900',
      desc:'灾煞位，最凶之星。宜放置金属重物镇压，尽量不在此位活动。' },
    { star:'六白', name:'武曲星', element:'金', nature:'吉', color:'#cccccc',
      desc:'偏财位，主意外之财、事业升迁。宜放黄色或金色饰品。' },
    { star:'七赤', name:'破军星', element:'金', nature:'凶', color:'#cc6666',
      desc:'破军位，主盗贼、破财。宜放蓝色或黑色饰品泄金气。' },
    { star:'八白', name:'左辅星', element:'土', nature:'大吉', color:'#ddaa44',
      desc:'正财位，主财运、事业。宜放红色或黄色饰品催旺，不宜堆放杂物。' },
    { star:'九紫', name:'右弼星', element:'火', nature:'吉', color:'#ee6666',
      desc:'喜庆位，主婚嫁、添丁。宜在此方多活动，放绿色植物生旺火气。' }
  ];

  var BAGUA_POSITIONS = [
    { name:'中宫', direction:'中央' },
    { name:'正北', direction:'坎宫' },
    { name:'西南', direction:'坤宫' },
    { name:'正东', direction:'震宫' },
    { name:'东南', direction:'巽宫' },
    { name:'西北', direction:'乾宫' },
    { name:'正西', direction:'兑宫' },
    { name:'东北', direction:'艮宫' },
    { name:'正南', direction:'离宫' }
  ];

  function calcFlyingStars(year) {
    // 年紫白飞星：以年干支入中宫顺飞
    // 简化公式：1900年为上元开始递推
    var offset = (year - 1900) % 9;
    // 入中宫星 = (9 - offset + 9) % 9 + 1
    var centerStar = ((9 - offset) % 9 + 9) % 9 + 1;

    // 九宫顺飞顺序（中→乾→兑→艮→离→坎→坤→震→巽）
    var flySeq = [4, 5, 6, 7, 8, 0, 1, 2, 3]; // 中宫Index映射到八卦位
    var result = [];
    for (var i = 0; i < 9; i++) {
      var starIdx = (centerStar - 1 + i) % 9;
      result.push({
        position: BAGUA_POSITIONS[flySeq[i]],
        star: FLYING_STARS[starIdx]
      });
    }
    return result;
  }

  // ==================== 对外接口 ====================

  return {
    PALM_LINES: PALM_LINES,
    PALM_HILLS: PALM_HILLS,
    FACE_PALACES: FACE_PALACES,
    FLYING_STARS: FLYING_STARS,
    BAGUA_POSITIONS: BAGUA_POSITIONS,
    calcFlyingStars: calcFlyingStars
  };
})();
