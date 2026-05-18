/**
 * 小六壬 (Little Six Ren) — 掌诀占卜
 * 月上起日 · 日上起时 · 时上查掌诀
 *
 * 六掌诀位：大安(0) → 留连(1) → 速喜(2) → 赤口(3) → 小吉(4) → 空亡(5)
 * 公式：掌诀位 = (月 + 日 + 时辰索引 - 2) % 6
 */

var XiaoLiuRen = (function() {
  'use strict';

  // ==================== 六掌诀定义 ====================

  var PALM_POSITIONS = [
    {
      id: 0,
      name: '大安',
      shortName: '大安',
      glyph: '☯',
      color: '#6fcf6f',
      element: '木',
      direction: '东方',
      zodiac: '寅',
      finger: '食指根部',
      trait: '光明正大，平稳安定',
      overall: '大安事事昌，求谋在东方，失物去不远，宅舍保安康。\n行人身未动，病者主无妨，将军回田野，仔细与推详。',
      love: '感情平稳和谐，双方互相信任。单身者近期桃花运一般，不宜强求。',
      career: '工作安稳，按部就班推进即可。求职者东方有利。',
      wealth: '财运平稳，正财为主，不宜投机。宜守不宜攻。',
      health: '身体健康，小病易愈。注意肝胆保养。',
      travel: '出行平安顺利，东方大利。行人身未动，短期内不会远行。',
      lost: '失物未走远，仍在附近。在家中寻找，东方方位最有可能。',
      lawsuit: '官司平稳，宜和解。有理有据，可获公正裁决。',
      keywords: ['平安', '稳定', '正财', '健康', '守成']
    },
    {
      id: 1,
      name: '留连',
      shortName: '留连',
      glyph: '☳',
      color: '#e0c050',
      element: '水',
      direction: '南方',
      zodiac: '卯',
      finger: '食指指尖',
      trait: '纠缠拖延，事难速成',
      overall: '留连事难成，求谋日不明，官事宜迟缓，去者未回程。\n失物南方见，急讨方遂心，更须防口舌，人口且平平。',
      love: '感情纠缠不清，易有误会拖延。需要耐心沟通，不要急于做决定。',
      career: '事业进展缓慢，计划容易搁浅。宜静不宜动，多观察少行动。',
      wealth: '财运阻滞，有拖延之象。投资不宜，借款难回。',
      health: '注意肾脏、泌尿系统。慢性病容易反复，需耐心调理。',
      travel: '出行容易耽搁，计划多变。行程宜留有余地。',
      lost: '失物在南方寻找，需要反复寻找。找回需要时间。',
      lawsuit: '官司拖延难决，宜调解缓和。不要激化矛盾。',
      keywords: ['拖延', '反复', '口舌', '阻滞', '等待']
    },
    {
      id: 2,
      name: '速喜',
      shortName: '速喜',
      glyph: '☲',
      color: '#ff6666',
      element: '火',
      direction: '南方',
      zodiac: '巳',
      finger: '中指指尖',
      trait: '喜事速至，火速成功',
      overall: '速喜喜来临，求财向南行，失物申午见，官事有福德。\n病人无大害，行人即可归，田宅六畜吉，交易遂心成。',
      love: '喜事临门！桃花运旺盛，有快速发展的可能。大胆表达，顺势而为。',
      career: '事业有快速进展，好消息即将到来。求职顺利，南方有利。',
      wealth: '财运来势迅速，偏财有利。适合短期投资。',
      health: '病情来得快去得也快。注意心火旺盛，防止急症。',
      travel: '出行顺利快速，南方大利。行人在归途中。',
      lost: '失物可能在午时、申时找到。去南方寻找。',
      lawsuit: '官司有福德星照，宜速战速决。有理可胜。',
      keywords: ['迅速', '喜事', '成功', '南方', '火速']
    },
    {
      id: 3,
      name: '赤口',
      shortName: '赤口',
      glyph: '☱',
      color: '#cc6666',
      element: '金',
      direction: '西方',
      zodiac: '午',
      finger: '无名指指尖',
      trait: '口舌是非，破败多端',
      overall: '赤口主口舌，官非切要防，失物急去寻，行人有惊慌。\n鸡犬多作怪，病者出西方，更须防咒咀，恐怕染瘟癀。',
      love: '感情易有口舌争执，双方情绪激动。忌冲动发言，冷静后再谈。',
      career: '职场易有是非口舌，谨防小人背后议论。合同文书需仔细。',
      wealth: '财运破损，谨防破财。不宜投资，小心诈骗。',
      health: '注意肺部、呼吸道疾病。容易有炎症、发热。',
      travel: '出行需小心意外，西方方向有障碍。谨防交通事故。',
      lost: '失物需紧急寻找，可能与金属物品有关。西方方位寻找。',
      lawsuit: '官司口舌是非多，宜退让和解。签署文件要格外小心。',
      keywords: ['口舌', '是非', '破财', '警惕', '争执']
    },
    {
      id: 4,
      name: '小吉',
      shortName: '小吉',
      glyph: '☴',
      color: '#88cc66',
      element: '木',
      direction: '东北',
      zodiac: '申',
      finger: '无名指根部',
      trait: '凡事可谋，小有吉利',
      overall: '小吉最吉昌，路上好商量，阳人来报喜，失物在坤方。\n行人即便至，交关甚是强，凡事皆和合，病者叩穹苍。',
      love: '感情和合美满，适合表白和推进关系。有贵人牵线。',
      career: '事业小有成就，合作顺利。适合谈判和签约。',
      wealth: '财运小吉，正偏财均有收获。适合合作求财。',
      health: '身体小有不适但无大碍。注意脾胃保养。',
      travel: '出行顺利，东北方有利。路上有好人相助。',
      lost: '失物在坤方（西南）寻找。可能有人拾获。',
      lawsuit: '诉讼有利，适合调解和谈判。凡事皆可商量。',
      keywords: ['小利', '和合', '合作', '贵人', '顺利']
    },
    {
      id: 5,
      name: '空亡',
      shortName: '空亡',
      glyph: '☵',
      color: '#888899',
      element: '土',
      direction: '无定方',
      zodiac: '亥',
      finger: '中指根部',
      trait: '事不长久，谋望落空',
      overall: '空亡事不长，阴人多乖张，求财无利益，行人有灾殃。\n失物寻不见，官事有刑伤，病人逢暗鬼，禳解保安康。',
      love: '感情落空之象，暧昧难成，交往不稳定。宜重新审视关系。',
      career: '计划容易落空，求职困难。建议等待时机，不要强行推进。',
      wealth: '财运虚空，不宜投资。谨防破财，减少不必要的开支。',
      health: '注意脾胃和整体能量不足。大病需多求医问药。',
      travel: '出行计划容易取消或变动。行人迟迟不归。',
      lost: '失物难以找回。可能已被转移。',
      lawsuit: '诉讼不利，宜求和化解。刑伤之象，避免激化。',
      keywords: ['落空', '虚无', '不顺', '等待', '退守']
    }
  ];

  // ==================== 核心计算 ====================

  /**
   * 掌诀推算
   * @param {number} lunarMonth - 农历月 (1-12)
   * @param {number} lunarDay - 农历日 (1-30)
   * @param {number} shichenIdx - 时辰索引 (0=子, 1=丑, ..., 11=亥)
   * @returns {object} { position, steps }
   */
  function calculate(lunarMonth, lunarDay, shichenIdx) {
    var monthStep = (lunarMonth - 1) % 6;
    var dayStep = (lunarDay - 1) % 6;
    var hourStep = shichenIdx % 6;

    var finalIdx = (monthStep + dayStep + hourStep) % 6;

    return {
      position: PALM_POSITIONS[finalIdx],
      steps: {
        monthStep: monthStep,
        dayStep: dayStep,
        hourStep: hourStep,
        total: monthStep + dayStep + hourStep,
        formula: '(' + lunarMonth + ' + ' + lunarDay + ' + ' + shichenIdx + ' - 2) % 6 = ' + finalIdx
      },
      inputs: {
        lunarMonth: lunarMonth,
        lunarDay: lunarDay,
        shichenIdx: shichenIdx,
        shichenName: SHICHEN_NAME[shichenIdx]
      }
    };
  }

  /**
   * 从公历日期 + 小时推算小六壬
   * @param {number} year - 公历年
   * @param {number} month - 公历月
   * @param {number} day - 公历日
   * @param {number} hour - 公历小时 (0-23)
   */
  function calculateFromSolar(year, month, day, hour) {
    var lunar = solarToLunar(year, month, day);
    var shichenIdx = hourToShichen(hour);
    return calculate(lunar.lunarMonth, lunar.lunarDay, shichenIdx);
  }

  // ==================== 多问占法 ====================

  /**
   * 取三数推算（任意三个数字，适合数字占）
   * @param {number} n1 - 月数
   * @param {number} n2 - 日数
   * @param {number} n3 - 时数
   */
  function calculateFromNumbers(n1, n2, n3) {
    n1 = ((n1 - 1) % 6 + 6) % 6;
    n2 = ((n2 - 1) % 6 + 6) % 6;
    n3 = ((n3 - 1) % 6 + 6) % 6;
    var finalIdx = (n1 + n2 + n3) % 6;
    return {
      position: PALM_POSITIONS[finalIdx],
      steps: { inputs: [n1+1, n2+1, n3+1], formula: '(' + (n1+1) + '+' + (n2+1) + '+' + (n3+1) + '-2)%6=' + finalIdx },
      inputs: { num1: n1+1, num2: n2+1, num3: n3+1 }
    };
  }

  /**
   * 时辰吉凶速查 — 快速判断某个时辰做某事的吉凶
   */
  function quickCheck(shichenIdx, questionCategory) {
    var scores = {
      '大安': { general:9, love:7, career:8, wealth:7, health:9, travel:9 },
      '留连': { general:4, love:5, career:4, wealth:3, health:5, travel:3 },
      '速喜': { general:9, love:9, career:8, wealth:8, health:7, travel:8 },
      '赤口': { general:3, love:3, career:4, wealth:2, health:4, travel:3 },
      '小吉': { general:7, love:8, career:7, wealth:7, health:6, travel:7 },
      '空亡': { general:2, love:2, career:2, wealth:1, health:3, travel:2 }
    };
    return scores[PALM_POSITIONS[shichenIdx % 6].name] || scores['大安'];
  }

  // ==================== 辅组函数 ====================

  function solarToLunar(year, month, day) {
    var jd = gregorianToJDN(year, month, day);
    // 简化查表：用公历日序估算农历
    // 2000-01-06 是农历腊月初一（己卯年）
    var baseJD = gregorianToJDN(2000, 1, 6);
    var baseLunarMonth = 12;
    var baseLunarDay = 1;

    var diff = jd - baseJD;
    var lunarDayOffset = diff;
    var lunarMonth = baseLunarMonth;
    var lunarDay = baseLunarDay + Math.round(diff);
    var lunarYear = 1999; // 己卯

    // 简化：直接算相对偏移
    if (lunarDay < 1) lunarDay += 30;
    if (lunarDay > 30) { lunarMonth += Math.floor(lunarDay / 30); lunarDay = lunarDay % 30 || 30; }
    lunarMonth = (lunarMonth % 12) || 12;

    return { lunarMonth: lunarMonth, lunarDay: lunarDay || 1, lunarYear: lunarYear };
  }

  function hourToShichen(hour) {
    return Math.floor(((hour + 1) % 24) / 2);
  }

  // ==================== 对外接口 ====================

  return {
    PALM_POSITIONS: PALM_POSITIONS,
    calculate: calculate,
    calculateFromSolar: calculateFromSolar,
    calculateFromNumbers: calculateFromNumbers,
    quickCheck: quickCheck,
    hourToShichen: hourToShichen
  };
})();
