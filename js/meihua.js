/**
 * 梅花易数 — Plum Blossom Divination
 * 数占法：任意三数 → 上卦、下卦、动爻 → 本卦变卦互卦
 */
var MeiHua = (function() {
  'use strict';

  // ============ 八卦 ============
  var BA_GUA = [
    { id:1, symbol:'☰', name:'乾', element:'金', nature:'天', direction:'西北', body:'首', animal:'马', trait:'健' },
    { id:2, symbol:'☱', name:'兑', element:'金', nature:'泽', direction:'西',  body:'口', animal:'羊', trait:'悦' },
    { id:3, symbol:'☲', name:'离', element:'火', nature:'火', direction:'南',  body:'目', animal:'雉', trait:'丽' },
    { id:4, symbol:'☳', name:'震', element:'木', nature:'雷', direction:'东',  body:'足', animal:'龙', trait:'动' },
    { id:5, symbol:'☴', name:'巽', element:'木', nature:'风', direction:'东南', body:'股', animal:'鸡', trait:'入' },
    { id:6, symbol:'☵', name:'坎', element:'水', nature:'水', direction:'北',  body:'耳', animal:'豕', trait:'陷' },
    { id:7, symbol:'☶', name:'艮', element:'土', nature:'山', direction:'东北', body:'手', animal:'犬', trait:'止' },
    { id:8, symbol:'☷', name:'坤', element:'土', nature:'地', direction:'西南', body:'腹', animal:'牛', trait:'顺' }
  ];

  var GUAS = {};
  BA_GUA.forEach(function(g) { GUAS[g.id] = g; });

  // ============ 六十四卦 ============
  // 上卦下卦组合 → name
  function getGuaName(upperId, lowerId) {
    var names = {
      '1-1':'乾为天','1-2':'泽天夬','1-3':'火天大有','1-4':'雷天大壮','1-5':'风天小畜','1-6':'水天需','1-7':'山天大畜','1-8':'地天泰',
      '2-1':'天泽履','2-2':'兑为泽','2-3':'火泽睽','2-4':'雷泽归妹','2-5':'风泽中孚','2-6':'水泽节','2-7':'山泽损','2-8':'地泽临',
      '3-1':'天火同人','3-2':'泽火革','3-3':'离为火','3-4':'雷火丰','3-5':'风火家人','3-6':'水火既济','3-7':'山火贲','3-8':'地火明夷',
      '4-1':'天雷无妄','4-2':'泽雷随','4-3':'火雷噬嗑','4-4':'震为雷','4-5':'风雷益','4-6':'水雷屯','4-7':'山雷颐','4-8':'地雷复',
      '5-1':'天风姤','5-2':'泽风大过','5-3':'火风鼎','5-4':'雷风恒','5-5':'巽为风','5-6':'水风井','5-7':'山风蛊','5-8':'地风升',
      '6-1':'天水讼','6-2':'泽水困','6-3':'火水未济','6-4':'雷水解','6-5':'风水涣','6-6':'坎为水','6-7':'山水蒙','6-8':'地水师',
      '7-1':'天山遁','7-2':'泽山咸','7-3':'火山旅','7-4':'雷山小过','7-5':'风山渐','7-6':'水山蹇','7-7':'艮为山','7-8':'地山谦',
      '8-1':'天地否','8-2':'泽地萃','8-3':'火地晋','8-4':'雷地豫','8-5':'风地观','8-6':'水地比','8-7':'山地剥','8-8':'坤为地'
    };
    return names[upperId + '-' + lowerId] || '未知卦';
  }

  // ============ 体用生克 ============
  var SHENG_KE = {
    '金': { sheng:'水', ke:'木', shengBy:'土', keBy:'火' },
    '水': { sheng:'木', ke:'火', shengBy:'金', keBy:'土' },
    '木': { sheng:'火', ke:'土', shengBy:'水', keBy:'金' },
    '火': { sheng:'土', ke:'金', shengBy:'木', keBy:'水' },
    '土': { sheng:'金', ke:'水', shengBy:'火', keBy:'木' }
  };

  function getTiYongRelation(tiElement, yongElement) {
    if (tiElement === yongElement) return { type:'比和', desc:'体用比和，万事顺遂，谋为可成。', level:'good' };
    var rel = SHENG_KE[tiElement];
    if (rel && rel.ke === yongElement) return { type:'体克用', desc:'体克用，诸事可成，但较费力。求财可得，求名可成。', level:'good' };
    if (rel && rel.sheng === yongElement) return { type:'体生用', desc:'体生用，有耗损之忧。宜守不宜攻，慎防泄财耗神。', level:'bad' };
    if (rel && rel.keBy === yongElement) return { type:'用克体', desc:'用克体，诸事难成，易遇阻碍。宜避其锋芒，以退为进。', level:'bad' };
    if (rel && rel.shengBy === yongElement) return { type:'用生体', desc:'用生体，有进益之喜。贵人相助，事半功倍。', level:'good' };
    return { type:'未知', desc:'体用关系需结合具体卦象分析。', level:'neutral' };
  }

  // ============ 起卦 ============
  function divinate(a, b, c) {
    // 三个数 → 上卦(a%8), 下卦(b%8), 动爻(c%6)
    var upperId = ((a - 1) % 8) + 1;
    var lowerId = ((b - 1) % 8) + 1;
    var dongYao = ((c - 1) % 6); // 0-5

    var benName = getGuaName(upperId, lowerId);
    var upperGua = GUAS[upperId];
    var lowerGua = GUAS[lowerId];

    // 变卦：动爻改变对应的卦
    var bianUpperId = upperId, bianLowerId = lowerId;
    if (dongYao < 3) {
      bianLowerId = flipYao(lowerId, dongYao);
    } else {
      bianUpperId = flipYao(upperId, dongYao - 3);
    }
    var bianName = getGuaName(bianUpperId, bianLowerId);

    // 互卦: 234爻为下卦, 345爻为上卦
    var huLowerId = getHuLower(lowerId, upperId);
    var huUpperId = getHuUpper(lowerId, upperId);
    var huName = getGuaName(huUpperId, huLowerId);

    // 体用: 动爻在1-3(下卦)则下卦为用，上卦为体
    var tiGua, yongGua, tiId, yongId;
    if (dongYao < 3) {
      tiId = upperId; yongId = lowerId;
    } else {
      tiId = lowerId; yongId = upperId;
    }
    tiGua = GUAS[tiId]; yongGua = GUAS[yongId];

    var tiYong = getTiYongRelation(tiGua.element, yongGua.element);

    return {
      upperGua: upperGua, lowerGua: lowerGua,
      benName: benName, upperId: upperId, lowerId: lowerId,
      bianName: bianName, bianUpperId: bianUpperId, bianLowerId: bianLowerId,
      huName: huName, huUpperId: huUpperId, huLowerId: huLowerId,
      dongYao: dongYao + 1,
      tiGua: tiGua, yongGua: yongGua, tiYong: tiYong
    };
  }

  function divinateByTime() {
    var now = new Date();
    return divinate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function flipYao(guaId, yaoIdx) {
    // Yao positions (0-2, from bottom): 乾111→兑110 if yaoIdx=0
    var lines = {
      1: [1,1,1], 2: [1,1,0], 3: [1,0,1], 4: [1,0,0],
      5: [0,1,1], 6: [0,1,0], 7: [0,0,1], 8: [0,0,0]
    };
    var key = lines[guaId];
    if (!key) return guaId;
    key = key.slice();
    key[yaoIdx] = key[yaoIdx] ? 0 : 1;
    var newKey = key.join('');
    var map = { '111':1,'110':2,'101':3,'100':4,'011':5,'010':6,'001':7,'000':8 };
    return map[newKey] || guaId;
  }

  function getHuLower(lowerId, upperId) {
    // 互卦下卦 = 本卦2-3-4爻
    // 本卦6爻: 下卦(0-2), 上卦(3-5) -> 2爻是 lower[2], 3爻是 upper[0], 4爻是 upper[1]
    var lines1 = getGuaLines(lowerId);
    var lines2 = getGuaLines(upperId);
    var key = [lines1[1], lines1[2], lines2[0]].join('');
    var map = { '111':1,'110':2,'101':3,'100':4,'011':5,'010':6,'001':7,'000':8 };
    return map[key] || 1;
  }

  function getHuUpper(lowerId, upperId) {
    // 互卦上卦 = 本卦3-4-5爻
    var lines1 = getGuaLines(lowerId);
    var lines2 = getGuaLines(upperId);
    var key = [lines2[0], lines2[1], lines2[2]].join('');
    var map = { '111':1,'110':2,'101':3,'100':4,'011':5,'010':6,'001':7,'000':8 };
    return map[key] || 1;
  }

  function getGuaLines(guaId) {
    var m = { 1:[1,1,1],2:[1,1,0],3:[1,0,1],4:[1,0,0],5:[0,1,1],6:[0,1,0],7:[0,0,1],8:[0,0,0] };
    return m[guaId] || [1,1,1];
  }

  // ============ 五行颜色 ============
  function elementColor(el) {
    var m = { '金':'#f0d78c', '木':'#8cbc6c', '水':'#6cb8d0', '火':'#e06050', '土':'#c0a060' };
    return m[el] || '#ccc';
  }

  // ============ 根据问题类型调整解读 ============
  var QUESTION_TYPES = {
    'love': '感情', 'career': '事业', 'wealth': '财运', 'health': '健康', 'general': '综合'
  };

  function getInterpretation(result, questionType) {
    var t = result.tiYong;
    var h = '';
    h += '<div class="mh-tiyong">';
    h += '<div class="mh-tiyong-label">体用生克</div>';
    h += '<div class="mh-tiyong-detail">';
    h += '<span>体卦：' + result.tiGua.symbol + result.tiGua.name + '（' + result.tiGua.element + '）</span> ';
    h += '<span>用卦：' + result.yongGua.symbol + result.yongGua.name + '（' + result.yongGua.element + '）</span>';
    h += '</div>';
    h += '<div class="mh-tiyong-relation mh-rel-' + t.level + '">' + t.type + '：' + t.desc + '</div>';
    h += '</div>';
    return h;
  }

  // ============ 渲染 ============
  function renderMeiHua(containerId) {
    var a = Math.floor(Math.random() * 999) + 1;
    var b = Math.floor(Math.random() * 999) + 1;
    var c = Math.floor(Math.random() * 999) + 1;
    var result = divinate(a, b, c);
    result.numbers = [a, b, c];
    var html = buildMeiHuaHTML(result);
    var container = document.getElementById(containerId);
    if (container) container.innerHTML = html;
  }

  function buildMeiHuaHTML(result) {
    var h = '';
    h += '<div class="mh-container">';
    h += '<div class="mh-input-row">';
    h += '<span style="color:#888;font-size:0.85em">三数起卦：</span>';
    h += '<input type="number" id="mhNum1" value="' + (result.numbers ? result.numbers[0] : '') + '" class="mh-num" placeholder="上卦数" onchange="MeiHua.onInputChange()">';
    h += '<input type="number" id="mhNum2" value="' + (result.numbers ? result.numbers[1] : '') + '" class="mh-num" placeholder="下卦数" onchange="MeiHua.onInputChange()">';
    h += '<input type="number" id="mhNum3" value="' + (result.numbers ? result.numbers[2] : '') + '" class="mh-num" placeholder="动爻数" onchange="MeiHua.onInputChange()">';
    h += '<button class="btn btn-sm" onclick="MeiHua.onInputChange()">起卦</button>';
    h += '<button class="btn btn-sm" onclick="MeiHua.renderMeiHua(\'meihuaResult\')">🎲 随机</button>';
    h += '<button class="btn btn-sm" onclick="MeiHua.divinateNow()">🕐 当前时间</button>';
    h += '</div>';

    h += '<div class="mh-cards">';

    // 本卦
    h += renderGuaCard('本卦', result.benName, result.upperGua, result.lowerGua, 'ben', result.dongYao);
    // 互卦
    h += renderGuaCard('互卦', result.huName, GUAS[result.huUpperId], GUAS[result.huLowerId], 'hu');
    // 变卦
    h += renderGuaCard('变卦', result.bianName, GUAS[result.bianUpperId], GUAS[result.bianLowerId], 'bian');

    h += '</div>'; // mh-cards

    h += '<div class="mh-meta">动爻：第<b>' + result.dongYao + '</b>爻动</div>';

    h += getInterpretation(result);

    h += '</div>'; // mh-container
    return h;
  }

  function renderGuaCard(label, name, upper, lower, type, dongYao) {
    var h = '<div class="mh-card mh-card-' + type + '">';
    h += '<div class="mh-card-label">' + label + '</div>';
    h += '<div class="mh-card-name">' + name + '</div>';
    h += '<div class="mh-card-trigrams">';
    h += '<div class="mh-upper">' + upper.symbol + '<br>' + upper.name + '（' + upper.element + '）</div>';
    h += '<div class="mh-lower">' + lower.symbol + '<br>' + lower.name + '（' + lower.element + '）</div>';
    h += '</div>';
    h += '</div>';
    return h;
  }

  function onInputChange() {
    var a = parseInt(document.getElementById('mhNum1').value) || 1;
    var b = parseInt(document.getElementById('mhNum2').value) || 1;
    var c = parseInt(document.getElementById('mhNum3').value) || 1;
    var result = divinate(a, b, c);
    result.numbers = [a, b, c];
    var html = buildMeiHuaHTML(result);
    var container = document.getElementById('meihuaResult');
    if (container) container.innerHTML = html;
  }

  function divinateNow() {
    var result = divinateByTime();
    var container = document.getElementById('meihuaResult');
    if (container) container.innerHTML = buildMeiHuaHTML(result);
  }

  return {
    BA_GUA: BA_GUA,
    GUAS: GUAS,
    divinate: divinate,
    divinateByTime: divinateByTime,
    renderMeiHua: renderMeiHua,
    buildMeiHuaHTML: buildMeiHuaHTML,
    onInputChange: onInputChange,
    divinateNow: divinateNow
  };
})();
