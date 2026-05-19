/**
 * 紫微斗数 · 特殊格局自动检测
 * 根据命盘星曜分布自动识别 40+ 种格局
 */

var ZiweiPatterns = (function() {
  'use strict';

  // 依据命盘检测所有格局
  function detectAll(chart) {
    var results = [];
    var palaces = chart.palaces;
    var mingPalace = findPalaceByZhi(palaces, chart.mingGong.zhiIndex);
    var mingStars = (mingPalace ? mingPalace.stars.map(function(s) { return s.key; }) : []);
    var mingAux = (mingPalace ? mingPalace.auxStars.map(function(s) { return s.key; }) : []);
    var allPalaceStars = {};
    palaces.forEach(function(p) {
      allPalaceStars[p.zhiIndex] = {
        main: p.stars.map(function(s) { return s.key; }),
        aux: p.auxStars.map(function(s) { return s.key; }),
        sihua: p.sihua || []
      };
    });

    // 1. 紫府同宫格
    if (hasStars(mingStars, ['ziwei', 'tianfu'])) {
      results.push(pattern('紫府同宫格', '大贵格', '紫微与天府同宫坐命，帝王将相之格，主贵气逼人，事业有成，一生福禄双全。'));
    }

    // 2. 君臣庆会格
    if (hasStar(mingStars, 'ziwei') && (hasStar(mingAux, 'zuofu') || hasStar(mingAux, 'youbi') || hasStar(mingAux, 'wenchang') || hasStar(mingAux, 'wenqu') || hasStar(mingAux, 'tiankui') || hasStar(mingAux, 'tianyue'))) {
      results.push(pattern('君臣庆会格', '贵格', '紫微坐命得左右昌曲魁钺拱照，如君主得贤臣辅佐，主贵气且有助力。'));
    }

    // 3. 极向离明格
    if (hasStar(mingStars, 'ziwei') && mingPalace.zhiIndex === 6) {
      results.push(pattern('极向离明格', '贵格', '紫微在午宫坐命，午属离卦，光芒最盛，主贵气逼人，领袖气质。'));
    }

    // 4. 日照雷门格 (日出扶桑格)
    if (hasStar(mingStars, 'taiyang') && mingPalace.zhiIndex === 3) {
      results.push(pattern('日照雷门格', '贵格', '太阳在卯宫坐命，卯时为旭日东升之象，主前程光明，贵气显露。'));
    }

    // 5. 日丽中天格 (金灿光辉格)
    if (hasStar(mingStars, 'taiyang') && mingPalace.zhiIndex === 6) {
      results.push(pattern('日丽中天格', '贵格', '太阳在午宫坐命，午时太阳光芒最盛，主光明磊落，富贵双全。'));
    }

    // 6. 月朗天门格
    if (hasStar(mingStars, 'taiyin') && mingPalace.zhiIndex === 11) {
      results.push(pattern('月朗天门格', '富格', '太阴在亥宫坐命，亥为天门，月朗天门主富贵，尤利女命。'));
    }

    // 7. 明珠出海格
    if (mingPalace.zhiIndex === 7 && mingStars.length === 0) {
      var taiyangPalace = findPalaceByZhi(palaces, 3);
      var taiyinPalace = findPalaceByZhi(palaces, 11);
      if (taiyangPalace && taiyinPalace && hasStar(taiyangPalace.stars.map(function(s){return s.key;}), 'taiyang') && hasStar(taiyinPalace.stars.map(function(s){return s.key;}), 'taiyin')) {
        results.push(pattern('明珠出海格', '大贵格', '未宫无主星坐命，日月在卯亥对拱，如明珠出海，主早年艰辛终成大器。'));
      }
    }

    // 8. 石中隐玉格
    if (hasStar(mingStars, 'jumen') && (mingPalace.zhiIndex === 0 || mingPalace.zhiIndex === 6)) {
      results.push(pattern('石中隐玉格', '贵格', '巨门在子午坐命，如石中美玉，主口才出众，历经磨砺而成大器。'));
    }

    // 9. 贪武同行格
    if ((hasStar(mingStars, 'tanlang') && hasStar(mingStars, 'wuqu')) || (mingPalace.zhiIndex === 1 || mingPalace.zhiIndex === 7) && (hasStar(mingStars, 'wuqu') || hasStar(mingStars, 'tanlang'))) {
      if (mingPalace.zhiIndex === 1 || mingPalace.zhiIndex === 7) {
        results.push(pattern('贪武同行格', '富格', '武曲贪狼在丑未同宫坐命，大器晚成，三十岁后渐入佳境，主富贵。'));
      }
    }

    // 10. 府相朝垣格
    if (hasStar(mingStars, 'tianfu') || hasStar(mingStars, 'tianxiang')) {
      var tianfuPalace = findPalaceByStar(palaces, 'tianfu');
      var tianxiangPalace = findPalaceByStar(palaces, 'tianxiang');
      if (tianfuPalace && tianxiangPalace && isTriadOrOpposite(tianfuPalace.zhiIndex, tianxiangPalace.zhiIndex)) {
        results.push(pattern('府相朝垣格', '贵格', '天府天相在三方四正会照命宫，主稳重有福，事业有成。'));
      }
    }

    // 11. 机月同梁格
    var starKeys = mingStars.join(',');
    var countML = countMatches(mingStars, ['tianji', 'taiyin', 'tiantong', 'tianliang']);
    if (countML >= 2) {
      results.push(pattern('机月同梁格', '清贵格', '命宫及三方见天机、太阴、天同、天梁中多颗，主为人机敏温和，适合文职公务。'));
    }

    // 12. 杀破狼格
    var countSPL = countMatches(mingStars, ['qisha', 'pojund', 'tanlang']);
    if (countSPL >= 1) {
      results.push(pattern('杀破狼格', '变动格', '命宫见七杀、破军、贪狼之一，主人一生变动大，敢闯敢拼，适合创业开拓。'));
    }

    // 13. 阳梁昌禄格
    var sanFangStars = getSanFangStars(allPalaceStars, mingPalace.zhiIndex);
    if (countMatches(sanFangStars, ['taiyang', 'tianliang', 'wenchang']) >= 2 && hasStar(mingAux, 'lucun')) {
      results.push(pattern('阳梁昌禄格', '贵格', '太阳、天梁、文昌、禄存在三方四正会齐，利考试升迁，金榜题名之象。'));
    }

    // 14. 双禄交流格 (禄合鸳鸯格)
    var sfSihua = getSanFangSihua(palaces, mingPalace.zhiIndex);
    var luCount = 0;
    sfSihua.forEach(function(sh) { if (sh.type === '禄') luCount++; });
    if (luCount >= 2) {
      results.push(pattern('双禄交流格', '富格', '命宫三方四正见双禄交流，主财源广进，事业有成富之机运。'));
    }

    // 15. 三奇嘉会格
    var sfSihuaTypes = {};
    sfSihua.forEach(function(sh) { sfSihuaTypes[sh.type] = true; });
    if (sfSihuaTypes['禄'] && sfSihuaTypes['权'] && sfSihuaTypes['科']) {
      results.push(pattern('三奇嘉会格', '大贵格', '禄权科三奇在三方四正会齐，主才华出众，人生多机遇，名利双收。'));
    }

    // 16. 科权禄夹格
    var leftPalace = getNeighborPalace(palaces, mingPalace.zhiIndex, -1);
    var rightPalace = getNeighborPalace(palaces, mingPalace.zhiIndex, 1);
    if (leftPalace && rightPalace) {
      var allSihua = (leftPalace.sihua || []).concat(rightPalace.sihua || []);
      var types = {};
      allSihua.forEach(function(sh) { types[sh.type] = true; });
      if (types['禄'] && types['权'] || types['禄'] && types['科'] || types['权'] && types['科']) {
        results.push(pattern('科权禄夹格', '贵格', '禄权科中有二星在左右邻宫夹命，主能获意外好运及贵人相助。'));
      }
    }

    // 17. 日月夹命格
    var leftStars = leftPalace ? leftPalace.stars.map(function(s){return s.key;}) : [];
    var rightStars = rightPalace ? rightPalace.stars.map(function(s){return s.key;}) : [];
    if ((hasStar(leftStars, 'taiyang') && hasStar(rightStars, 'taiyin')) || (hasStar(leftStars, 'taiyin') && hasStar(rightStars, 'taiyang'))) {
      results.push(pattern('日月夹命格', '富格', '太阳太阴在左右邻宫夹命，主有财运，利于事业发展。'));
    }

    // 18. 昌曲夹命格
    if ((hasStar(leftStars, 'wenchang') && hasStar(rightStars, 'wenqu')) || (hasStar(leftStars, 'wenqu') && hasStar(rightStars, 'wenchang'))) {
      results.push(pattern('昌曲夹命格', '文贵格', '文昌文曲在左右邻宫夹命，利于学术发展，文星暗拱之象。'));
    }

    // 19. 禄马交驰格
    var hasLuMa = (hasStar(mingStars, 'lucun') || hasStar(mingAux, 'lucun')) && hasStar(mingAux, 'tianma');
    if (!hasLuMa) {
      sanFangStars.forEach(function(s) {
        if (s === 'lucun' || s === 'tianma') {
          if (sanFangStars.indexOf('lucun') >= 0 && sanFangStars.indexOf('tianma') >= 0) hasLuMa = true;
        }
      });
    }
    if (hasLuMa) {
      results.push(pattern('禄马交驰格', '富格', '禄存（或化禄）与天马同宫或三方会照，主奔波劳碌而招财，动中得财。'));
    }

    // 20. 禄马配印格
    if (hasStar(mingStars, 'tianxiang') && (hasStar(mingAux, 'lucun') || hasStar(mingAux, 'tianma'))) {
      results.push(pattern('禄马配印格', '富格', '禄存天马与天相同宫守命，主奔波劳碌而招财，以诚信得财。'));
    }

    // 21. 将星得地格
    if (hasStar(mingStars, 'wuqu') && (mingPalace.zhiIndex === 4 || mingPalace.zhiIndex === 10)) {
      results.push(pattern('将星得地格', '武贵格', '武曲在辰戌坐命，将星得地，大器晚成，三十岁后渐能发达。'));
    }

    // 22. 甲第登庸格
    var sfKe = sfSihua.filter(function(sh) { return sh.type === '科'; });
    var sfQuan = sfSihua.filter(function(sh) { return sh.type === '权'; });
    if (sfKe.length > 0 && sfQuan.length > 0) {
      results.push(pattern('甲第登庸格', '贵格', '化科在命宫，化权在三方四正会照，主聪明有学历，入社会时可飞黄腾达。'));
    }

    // 23. 科名会禄格
    var sfLu = sfSihua.filter(function(sh) { return sh.type === '禄'; });
    if (sfKe.length > 0 && sfLu.length > 0) {
      results.push(pattern('科名会禄格', '贵格', '化科在命宫，化禄在三方四正会照，才华卓越，可得擢升。'));
    }

    // 24. 极居卯酉格
    if ((mingPalace.zhiIndex === 3 || mingPalace.zhiIndex === 9) && (hasStar(mingStars, 'ziwei') || hasStar(mingStars, 'tanlang'))) {
      results.push(pattern('极居卯酉格', '特殊格', '紫微贪狼在卯酉坐命，主人生多变，对宗教哲学有特殊缘分，需防感情困扰。'));
    }

    // 25. 命无正曜格
    if (mingStars.length === 0) {
      results.push(pattern('命无正曜格', '特殊格', '命宫无主星，需借对宫星曜来看，人生方向较需要他人引导，但也更具弹性。'));
    }

    // 26. 命里逢空格
    if (hasStar(mingAux, 'dikong') || hasStar(mingAux, 'dijie')) {
      results.push(pattern('命里逢空格', '特殊格', '地空地劫守命，主精神上孤独，钱财不易留住，但利于哲学宗教研究。'));
    }

    // 27. 空劫夹命格
    if ((hasStar(leftPalace ? leftPalace.auxStars.map(function(s){return s.key;}) : [], 'dikong') && hasStar(rightPalace ? rightPalace.auxStars.map(function(s){return s.key;}) : [], 'dijie')) ||
        (hasStar(leftPalace ? leftPalace.auxStars.map(function(s){return s.key;}) : [], 'dijie') && hasStar(rightPalace ? rightPalace.auxStars.map(function(s){return s.key;}) : [], 'dikong'))) {
      results.push(pattern('空劫夹命格', '特殊格', '地空地劫在左右邻宫夹命，钱财难聚，精神上较孤独，宜修身养性。'));
    }

    // 28. 火铃夹命格
    if ((hasStar(leftPalace ? leftPalace.auxStars.map(function(s){return s.key;}) : [], 'huoxing') && hasStar(rightPalace ? rightPalace.auxStars.map(function(s){return s.key;}) : [], 'lingxing')) ||
        (hasStar(leftPalace ? leftPalace.auxStars.map(function(s){return s.key;}) : [], 'lingxing') && hasStar(rightPalace ? rightPalace.auxStars.map(function(s){return s.key;}) : [], 'huoxing'))) {
      results.push(pattern('火铃夹命格', '凶格', '火星铃星在左右邻宫夹命，主人生多突发的波折与挑战，但也激发斗志。'));
    }

    // 29. 刑忌夹印格
    if (hasStar(mingStars, 'tianxiang')) {
      if (hasStar(mingAux, 'qingyang') || hasStar(mingAux, 'tuoluo')) {
        results.push(pattern('刑忌夹印格', '凶格', '天相被刑煞夹，容易有官非口舌，需注意文书合约和法律问题。'));
      }
    }

    // 30. 财荫夹印格
    if (hasStar(mingStars, 'tianxiang') && (hasStar(mingAux, 'tianliang') || hasStar(leftPalace ? leftPalace.stars.map(function(s){return s.key;}) : [], 'tianliang') || hasStar(rightPalace ? rightPalace.stars.map(function(s){return s.key;}) : [], 'tianliang'))) {
      results.push(pattern('财荫夹印格', '富格', '天相坐命得左右财荫夹之，主福寿双全，得祖上庇荫。'));
    }

    // 31. 巨机同宫格
    if (hasStar(mingStars, 'jumen') && hasStar(mingStars, 'tianji')) {
      results.push(pattern('巨机同宫格', '特殊格', '巨门天机同宫坐命，聪明但多思虑，需注意口舌是非，感情上易有困扰。'));
    }

    // 32. 天府朝垣格
    if (hasStar(mingStars, 'tianfu') && (mingPalace.zhiIndex === 4 || mingPalace.zhiIndex === 8 || mingPalace.zhiIndex === 10)) {
      results.push(pattern('天府朝垣格', '富格', '天府在辰申戌坐命，稳重包容，善于管理，财运丰隆。'));
    }

    // 33. 文桂文华格
    if (hasStar(mingStars, 'wenchang') || hasStar(mingStars, 'wenqu')) {
      if (hasStar(mingAux, 'wenchang') || hasStar(mingAux, 'wenqu')) {
        results.push(pattern('文桂文华格', '文贵格', '文昌文曲入命，主聪明好学，文笔出众，适合文化教育领域。'));
      }
    }

    // 34. 天乙拱命格
    if ((hasStar(mingAux, 'tiankui') || hasStar(mingAux, 'tianyue')) &&
        (hasStar(leftPalace ? leftPalace.auxStars.map(function(s){return s.key;}) : [], 'tiankui') ||
         hasStar(rightPalace ? rightPalace.auxStars.map(function(s){return s.key;}) : [], 'tianyue'))) {
      results.push(pattern('天乙拱命格', '贵格', '天魁天钺在命宫及左右拱照，主贵人运强，处处得人相助。'));
    }

    // 35. 辅拱文星格
    if ((hasStar(mingAux, 'zuofu') || hasStar(mingAux, 'youbi')) && (hasStar(mingAux, 'wenchang') || hasStar(mingAux, 'wenqu'))) {
      results.push(pattern('辅拱文星格', '文贵格', '左右辅弼拱照文昌文曲入命，主文才出众且得贤人辅助。'));
    }

    // 36. 廉贞文武格
    if (hasStar(mingStars, 'lianzhen') && (hasStar(mingAux, 'wenchang') || hasStar(mingAux, 'wenqu'))) {
      results.push(pattern('廉贞文武格', '武贵格', '廉贞遇文昌文曲，文武双全之象，主果断又有文采。'));
    }

    // 37. 擎羊入庙格 (马头带箭)
    if (hasStar(mingAux, 'qingyang') && mingPalace.zhiIndex === 6) {
      results.push(pattern('马头带箭格', '武贵格', '擎羊在午宫坐命，虽有波折但最终能脱颖而出，利于军警武职。'));
    }

    // 38. 禄逢冲破格 (两重华盖)
    if ((hasStar(mingAux, 'lucun') && (hasStar(mingAux, 'dikong') || hasStar(mingAux, 'dijie')))) {
      results.push(pattern('禄逢冲破格', '特殊格', '禄存与地空地劫同宫，禄被冲破，虽有钱财却难聚，宜皈依宗教可享清福。'));
    }

    // 39. 水澄桂萼格
    if (hasStar(mingStars, 'tiantong') && hasStar(mingStars, 'taiyin') && mingPalace.zhiIndex === 0) {
      results.push(pattern('水澄桂萼格', '清贵格', '天同太阴在子宫坐命，水澄桂萼之象，主清秀聪慧，女命尤佳。'));
    }

    // 40. 月生沧海格
    if (hasStar(mingStars, 'tiantong') && hasStar(mingStars, 'taiyin') && mingPalace.zhiIndex === 0) {
      // 与水澄桂萼格相同宫位组合
      results.push(pattern('月生沧海格', '富格', '天同太阴在子，如月生沧海，主福寿绵长，财运丰隆。'));
    }

    return deduplicate(results);
  }

  // 辅助函数
  function pattern(name, category, desc) {
    return { name: name, category: category, desc: desc };
  }

  function hasStar(list, key) { return list.indexOf(key) !== -1; }
  function hasStars(list, keys) { return keys.every(function(k) { return list.indexOf(k) !== -1; }); }
  function countMatches(list, keys) { return keys.filter(function(k) { return list.indexOf(k) !== -1; }).length; }

  function findPalaceByZhi(palaces, zhiIdx) {
    for (var i = 0; i < palaces.length; i++) {
      if (palaces[i].zhiIndex === zhiIdx) return palaces[i];
    }
    return null;
  }

  function findPalaceByStar(palaces, starKey) {
    for (var i = 0; i < palaces.length; i++) {
      for (var j = 0; j < palaces[i].stars.length; j++) {
        if (palaces[i].stars[j].key === starKey) return palaces[i];
      }
    }
    return null;
  }

  function getSanFangStars(allPalaceStars, zhiIdx) {
    var result = [];
    var triads = getTriadPositions(zhiIdx);
    var opposite = getOppositePosition(zhiIdx);
    var allPositions = triads.concat([opposite]);
    allPositions.forEach(function(z) {
      var data = allPalaceStars[z];
      if (data) {
        result = result.concat(data.main).concat(data.aux);
      }
    });
    return result;
  }

  function getSanFangSihua(palaces, zhiIdx) {
    var result = [];
    var triads = getTriadPositions(zhiIdx);
    var opposite = getOppositePosition(zhiIdx);
    var allPositions = triads.concat([opposite]);
    allPositions.forEach(function(z) {
      var p = findPalaceByZhi(palaces, z);
      if (p && p.sihua) result = result.concat(p.sihua);
    });
    return result;
  }

  function getTriadPositions(zhiIdx) {
    return [(zhiIdx + 4) % 12, (zhiIdx + 8) % 12];
  }

  function getOppositePosition(zhiIdx) {
    return (zhiIdx + 6) % 12;
  }

  function isTriadOrOpposite(a, b) {
    return (a + 4) % 12 === b || (b + 4) % 12 === a || (a + 6) % 12 === b;
  }

  function getNeighborPalace(palaces, zhiIdx, offset) {
    var target = (zhiIdx + offset + 12) % 12;
    return findPalaceByZhi(palaces, target);
  }

  function deduplicate(results) {
    var seen = {};
    return results.filter(function(r) {
      if (seen[r.name]) return false;
      seen[r.name] = true;
      return true;
    });
  }

  return {
    detectAll: detectAll
  };
})();
