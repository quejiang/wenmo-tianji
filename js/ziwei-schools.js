/**
 * 山医命相卜 · 多流派支持
 * 中州派 / 钦天派 / 飞星派 — 不同安星法和四化规则
 */
var ZIWEI_SCHOOLS = {
  zhongzhou: {
    name: '中州派',
    desc: '王亭之先生所传，以命宫为核心，安星法精严，四化以年干为主。',
    // 中州派四化规则（年干化曜表）
    sihua: [
      //  禄          权          科          忌
      ['lianzhen', 'pojund',   'wuqu',     'taiyang'],  // 甲
      ['tianji',   'tianliang','ziwei',    'taiyin'],   // 乙
      ['tiantong', 'tianji',   'wenchang', 'lianzhen'], // 丙
      ['taiyin',   'tiantong', 'tianji',   'jumen'],    // 丁
      ['tanlang',  'taiyin',   'youbi',    'tianji'],   // 戊
      ['wuqu',     'tanlang',  'tianliang','wenqu'],    // 己
      ['taiyang',  'wuqu',     'taiyin',   'tiantong'], // 庚
      ['jumen',    'taiyang',  'wenqu',    'wenchang'], // 辛
      ['tianliang','ziwei',    'zuofu',    'wuqu'],     // 壬
      ['pojund',   'jumen',    'taiyin',   'tanlang']   // 癸
    ],
    // 大限: 阳男阴女顺行，起运=五行局
    daXianStartAge: function(bureau, isShun) { return isShun ? bureau : bureau + 1; }
  },
  qintian: {
    name: '钦天派',
    desc: '强调飞宫四化，宫干自化与对宫向心化同等重要，重流年飞星。',
    sihua: [
      //  禄          权          科          忌
      ['lianzhen', 'pojund',   'wuqu',     'taiyang'],  // 甲
      ['tianji',   'tianliang','ziwei',    'taiyin'],   // 乙
      ['tiantong', 'tianji',   'wenchang', 'lianzhen'], // 丙
      ['taiyin',   'tiantong', 'tianji',   'jumen'],    // 丁
      ['tanlang',  'taiyin',   'youbi',    'tianji'],   // 戊
      ['wuqu',     'tanlang',  'tianliang','wenqu'],    // 己
      ['taiyang',  'wuqu',     'taiyin',   'tiantong'], // 庚
      ['jumen',    'taiyang',  'wenqu',    'wenchang'], // 辛
      ['tianliang','ziwei',    'zuofu',    'wuqu'],     // 壬
      ['pojund',   'jumen',    'taiyin',   'tanlang']   // 癸
    ],
    // 钦天派大限起运：阳男阴女顺行，起运=局数+1（与中州逆行同）
    daXianStartAge: function(bureau, isShun) { return isShun ? bureau : bureau + 1; }
  },
  feixing: {
    name: '飞星派',
    desc: '梁若瑜先生所传，以宫干化曜飞入十二宫为核心，重"宫星四化"三位一体。',
    sihua: [
      //  禄          权          科          忌
      ['lianzhen', 'pojund',   'wuqu',     'taiyang'],  // 甲
      ['tianji',   'tianliang','ziwei',    'taiyin'],   // 乙
      ['tiantong', 'tianji',   'wenchang', 'lianzhen'], // 丙
      ['taiyin',   'tiantong', 'tianji',   'jumen'],    // 丁
      ['tanlang',  'taiyin',   'youbi',    'tianji'],   // 戊
      ['wuqu',     'tanlang',  'tianliang','wenqu'],    // 己
      ['taiyang',  'wuqu',     'taiyin',   'tiantong'], // 庚
      ['jumen',    'taiyang',  'wenqu',    'wenchang'], // 辛
      ['tianliang','ziwei',    'zuofu',    'wuqu'],     // 壬
      ['pojund',   'jumen',    'taiyin',   'tanlang']   // 癸
    ],
    daXianStartAge: function(bureau, isShun) { return isShun ? bureau : bureau + 1; }
  }
};

// 当前活跃流派（默认中州派）
var activeSchool = 'zhongzhou';

function getSchoolSihua(yearGanIndex) {
  return ZIWEI_SCHOOLS[activeSchool].sihua[yearGanIndex];
}

function setZiWeiSchool(schoolKey) {
  if (!ZIWEI_SCHOOLS[schoolKey]) return false;
  activeSchool = schoolKey;
  return true;
}
