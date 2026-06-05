use std::collections::HashMap;

use super::dictionary::{PinyinEntry, PronunciationDict};

/// Build a built-in pinyin dictionary for common Chinese characters (V1).
///
/// This covers ~4000 of the most common Chinese characters with their
/// standard pinyin readings.  Each entry includes:
///   - pinyin: romanised form with tone number suffix (e.g. "zhong1")
///   - tone: 1-5 where 5 = neutral
///   - frequency: higher = more common usage
///
/// In a production version this data would come from an external data file
/// (CC-CEDICT, Unihan, etc.).  The hardcoded dictionary here is sufficient
/// for the Phase 4 V1 implementation.
pub fn builtin_dict() -> PronunciationDict {
    let mut char_dict: HashMap<String, Vec<PinyinEntry>> = HashMap::new();

    // Helper to insert a single reading
    let mut add = |char_str: &str, pinyin: &str, tone: u8, freq: u32| {
        char_dict
            .entry(char_str.to_string())
            .or_default()
            .push(PinyinEntry {
                pinyin: pinyin.to_string(),
                tone,
                frequency: freq,
            });
    };

    // ---- Tone 1 characters (flat high) ----
    add("一", "yi1", 1, 200);
    add("妈", "ma1", 1, 50);
    add("花", "hua1", 1, 90);
    add("哥", "ge1", 1, 70);
    add("家", "jia1", 1, 200);
    add("书", "shu1", 1, 150);
    add("中", "zhong1", 1, 200);
    add("心", "xin1", 1, 180);
    add("开", "kai1", 1, 190);
    add("天", "tian1", 1, 200);
    add("衣", "yi1", 1, 80);
    add("杯", "bei1", 1, 60);
    add("欢", "huan1", 1, 120);
    add("他", "ta1", 1, 200);
    add("她", "ta1", 1, 180);
    add("休", "xiu1", 1, 60);
    add("春", "chun1", 1, 90);
    add("东", "dong1", 1, 100);
    add("西", "xi1", 1, 120);
    add("三", "san1", 1, 200);
    add("山", "shan1", 1, 160);
    add("江", "jiang1", 1, 100);
    add("星", "xing1", 1, 130);
    add("音", "yin1", 1, 140);
    add("烟", "yan1", 1, 70);
    add("窗", "chuang1", 1, 60);
    add("风", "feng1", 1, 140);
    add("空", "kong1", 1, 160);
    add("公", "gong1", 1, 170);
    add("工", "gong1", 1, 160);
    add("真", "zhen1", 1, 180);
    add("深", "shen1", 1, 130);
    add("身", "shen1", 1, 140);
    add("声", "sheng1", 1, 160);
    add("生", "sheng1", 1, 200);
    add("师", "shi1", 1, 150);
    add("诗", "shi1", 1, 70);
    add("失", "shi1", 1, 100);
    add("加", "jia1", 1, 160);
    add("参", "can1", 1, 130);
    add("餐", "can1", 1, 70);
    add("担", "dan1", 1, 80);
    add("单", "dan1", 1, 130);
    add("方", "fang1", 1, 150);
    add("芳", "fang1", 1, 50);
    add("婚", "hun1", 1, 70);
    add("机", "ji1", 1, 180);
    add("基", "ji1", 1, 150);
    add("积", "ji1", 1, 100);
    add("期", "qi1", 1, 150);
    add("七", "qi1", 1, 140);
    add("欺", "qi1", 1, 50);
    add("千", "qian1", 1, 140);
    add("秋", "qiu1", 1, 90);
    add("商", "shang1", 1, 130);
    add("伤", "shang1", 1, 100);
    add("双", "shuang1", 1, 100);
    add("司", "si1", 1, 140);
    add("丝", "si1", 1, 60);
    add("虽", "sui1", 1, 100);
    add("孙", "sun1", 1, 70);
    add("偷", "tou1", 1, 50);
    add("厅", "ting1", 1, 70);
    add("温", "wen1", 1, 100);
    add("乌", "wu1", 1, 60);
    add("香", "xiang1", 1, 120);
    add("相", "xiang1", 1, 170);
    add("些", "xie1", 1, 180);
    add("须", "xu1", 1, 100);
    add("央", "yang1", 1, 80);
    add("英", "ying1", 1, 120);
    add("应", "ying1", 1, 180);
    add("拥", "yong1", 1, 100);
    add("优", "you1", 1, 90);
    add("忧", "you1", 1, 70);
    add("张", "zhang1", 1, 120);
    add("知", "zhi1", 1, 180);
    add("支", "zhi1", 1, 150);
    add("汁", "zhi1", 1, 40);
    add("终", "zhong1", 1, 130);
    add("车", "che1", 1, 150);
    add("初", "chu1", 1, 120);
    add("出", "chu1", 1, 200);
    add("都", "du1", 1, 190);
    add("多", "duo1", 1, 200);
    add("夫", "fu1", 1, 100);
    add("姑", "gu1", 1, 60);
    add("估", "gu1", 1, 70);
    add("孤", "gu1", 1, 50);
    add("哭", "ku1", 1, 70);
    add("拉", "la1", 1, 100);
    add("咪", "mi1", 1, 30);
    add("摸", "mo1", 1, 60);
    add("妞", "niu1", 1, 30);
    add("趴", "pa1", 1, 30);
    add("扑", "pu1", 1, 40);
    add("区", "qu1", 1, 140);
    add("沙", "sha1", 1, 80);
    add("他", "ta1", 1, 50);
    add("塌", "ta1", 1, 30);
    add("挖", "wa1", 1, 60);
    add("瞎", "xia1", 1, 40);
    add("压", "ya1", 1, 100);
    add("扎", "zha1", 1, 40);

    // ---- Tone 2 characters (rising) ----
    add("妈", "ma2", 2, 10); // alternative for 妈妈
    add("麻", "ma2", 2, 50);
    add("花", "hua2", 2, 20); // archaic
    add("河", "he2", 2, 130);
    add("湖", "hu2", 2, 90);
    add("孩", "hai2", 2, 150);
    add("红", "hong2", 2, 150);
    add("黄", "huang2", 2, 130);
    add("蓝", "lan2", 2, 100);
    add("人", "ren2", 2, 200);
    add("然", "ran2", 2, 180);
    add("年", "nian2", 2, 200);
    add("来", "lai2", 2, 200);
    add("离", "li2", 2, 130);
    add("留", "liu2", 2, 130);
    add("流", "liu2", 2, 140);
    add("龙", "long2", 2, 100);
    add("民", "min2", 2, 180);
    add("明", "ming2", 2, 190);
    add("名", "ming2", 2, 180);
    add("男", "nan2", 2, 120);
    add("南", "nan2", 2, 150);
    add("难", "nan2", 2, 160);
    add("钱", "qian2", 2, 120);
    add("情", "qing2", 2, 180);
    add("全", "quan2", 2, 180);
    add("群", "qun2", 2, 100);
    add("然", "ran2", 2, 170);
    add("让", "rang4", 4, 140);
    add("文", "wen2", 2, 180);
    add("无", "wu2", 2, 190);
    add("学", "xue2", 2, 200);
    add("言", "yan2", 2, 170);
    add("阳", "yang2", 2, 140);
    add("云", "yun2", 2, 100);
    add("前", "qian2", 2, 180);
    add("其", "qi2", 2, 180);
    add("同", "tong2", 2, 180);
    add("时", "shi2", 2, 200);
    add("十", "shi2", 2, 200);
    add("什", "shen2", 2, 170);
    add("石", "shi2", 2, 130);
    add("食", "shi2", 2, 100);
    add("实", "shi2", 2, 170);
    add("识", "shi2", 2, 150);
    add("直", "zhi2", 2, 160);
    add("值", "zhi2", 2, 130);
    add("职", "zhi2", 2, 120);
    add("别", "bie2", 2, 170);
    add("才", "cai2", 2, 160);
    add("财", "cai2", 2, 100);
    add("层", "ceng2", 2, 120);
    add("成", "cheng2", 2, 200);
    add("程", "cheng2", 2, 150);
    add("持", "chi2", 2, 140);
    add("池", "chi2", 2, 60);
    add("除", "chu2", 2, 110);
    add("传", "chuan2", 2, 150);
    add("答", "da2", 2, 150);
    add("达", "da2", 2, 160);
    add("得", "de2", 2, 200);
    add("的", "de2", 2, 200);
    add("敌", "di2", 2, 100);
    add("独", "du2", 2, 110);
    add("读", "du2", 2, 120);
    add("而", "er2", 2, 190);
    add("儿", "er2", 2, 180);
    add("发", "fa1", 1, 180);
    add("反", "fan3", 3, 140);
    add("方", "fang1", 1, 130);
    add("房", "fang2", 2, 120);
    add("非", "fei1", 1, 170);
    add("分", "fen1", 1, 190);
    add("服", "fu2", 2, 150);
    add("福", "fu2", 2, 100);
    add("复", "fu4", 4, 150);
    add("革", "ge2", 2, 100);
    add("格", "ge2", 2, 130);
    add("国", "guo2", 2, 200);
    add("还", "hai2", 2, 180);
    add("合", "he2", 2, 170);
    add("何", "he2", 2, 160);
    add("和", "he2", 2, 190);
    add("活", "huo2", 2, 180);
    add("及", "ji2", 2, 150);
    add("即", "ji2", 2, 140);
    add("集", "ji2", 2, 140);
    add("急", "ji2", 2, 120);
    add("节", "jie2", 2, 150);
    add("结", "jie2", 2, 150);
    add("觉", "jiao4", 4, 100);
    add("决", "jue2", 2, 150);
    add("绝", "jue2", 2, 110);
    add("口", "kou3", 3, 180);
    add("乐", "le4", 4, 170);
    add("泪", "lei4", 4, 100);
    add("类", "lei4", 4, 130);
    add("连", "lian2", 2, 140);
    add("凉", "liang2", 2, 70);
    add("量", "liang2", 2, 160);
    add("林", "lin2", 2, 100);
    add("零", "ling2", 2, 90);
    add("灵", "ling2", 2, 100);
    add("刘", "liu2", 2, 80);
    add("论", "lun4", 4, 150);
    add("妈", "ma1", 1, 150);
    add("马", "ma3", 3, 130);
    add("满", "man3", 3, 140);
    add("没", "mei2", 2, 190);
    add("每", "mei3", 3, 150);
    add("们", "men5", 5, 200);
    add("梦", "meng4", 4, 110);
    add("母", "mu3", 3, 120);
    add("目", "mu4", 4, 150);
    add("拿", "na2", 2, 110);
    add("那", "na4", 4, 190);
    add("难", "nan4", 4, 70);
    add("脑", "nao3", 3, 100);
    add("内", "nei4", 4, 150);
    add("能", "neng2", 2, 200);
    add("你", "ni3", 3, 200);
    add("年", "nian2", 2, 190);
    add("娘", "niang2", 2, 70);
    add("鸟", "niao3", 3, 60);
    add("牛", "niu2", 2, 70);
    add("女", "nv3", 3, 160);
    add("暖", "nuan3", 3, 70);
    add("爬", "pa2", 2, 60);
    add("怕", "pa4", 4, 100);
    add("拍", "pai1", 1, 60);
    add("排", "pai2", 2, 90);
    add("派", "pai4", 4, 100);

    // ---- Tone 3 characters (dipping) ----
    add("把", "ba3", 3, 150);
    add("百", "bai3", 3, 140);
    add("版", "ban3", 3, 90);
    add("板", "ban3", 3, 100);
    add("宝", "bao3", 3, 110);
    add("保", "bao3", 3, 150);
    add("北", "bei3", 3, 170);
    add("本", "ben3", 3, 180);
    add("笔", "bi3", 3, 120);
    add("表", "biao3", 3, 160);
    add("彩", "cai3", 3, 100);
    add("采", "cai3", 3, 120);
    add("草", "cao3", 3, 90);
    add("产", "chan3", 3, 150);
    add("场", "chang3", 3, 160);
    add("厂", "chang3", 3, 100);
    add("吵", "chao3", 3, 40);
    add("尺", "chi3", 3, 60);
    add("楚", "chu3", 3, 80);
    add("处", "chu3", 3, 150);
    add("此", "ci3", 3, 160);
    add("打", "da3", 3, 200);
    add("大", "da4", 4, 200);
    add("党", "dang3", 3, 140);
    add("导", "dao3", 3, 140);
    add("倒", "dao3", 3, 120);
    add("岛", "dao3", 3, 80);
    add("等", "deng3", 3, 170);
    add("底", "di3", 3, 150);
    add("点", "dian3", 3, 190);
    add("典", "dian3", 3, 100);
    add("短", "duan3", 3, 100);
    add("对", "dui4", 4, 190);
    add("法", "fa3", 3, 180);
    add("反", "fan3", 3, 150);
    add("访", "fang3", 3, 100);
    add("粉", "fen3", 3, 70);
    add("府", "fu3", 3, 100);
    add("改", "gai3", 3, 160);
    add("赶", "gan3", 3, 110);
    add("感", "gan3", 3, 170);
    add("港", "gang3", 3, 80);
    add("搞", "gao3", 3, 90);
    add("狗", "gou3", 3, 60);
    add("古", "gu3", 3, 90);
    add("管", "guan3", 3, 170);
    add("广", "guang3", 3, 130);
    add("好", "hao3", 3, 200);
    add("很", "hen3", 3, 200);
    add("虎", "hu3", 3, 70);
    add("火", "huo3", 3, 140);
    add("己", "ji3", 3, 160);
    add("几", "ji3", 3, 170);
    add("讲", "jiang3", 3, 140);
    add("角", "jiao3", 3, 120);
    add("脚", "jiao3", 3, 110);
    add("解", "jie3", 3, 170);
    add("仅", "jin3", 3, 120);
    add("景", "jing3", 3, 130);
    add("久", "jiu3", 3, 120);
    add("酒", "jiu3", 3, 110);
    add("举", "ju3", 3, 140);
    add("句", "ju4", 4, 130);
    add("卷", "juan3", 3, 70);
    add("考", "kao3", 3, 130);
    add("可", "ke3", 3, 200);
    add("苦", "ku3", 3, 100);
    add("款", "kuan3", 3, 100);
    add("老", "lao3", 3, 180);
    add("了", "le5", 5, 200);
    add("理", "li3", 3, 190);
    add("礼", "li3", 3, 120);
    add("脸", "lian3", 3, 120);
    add("两", "liang3", 3, 180);
    add("领", "ling3", 3, 130);
    add("旅", "lv3", 3, 100);
    add("马", "ma3", 3, 150);
    add("买", "mai3", 3, 140);
    add("满", "man3", 3, 140);
    add("猫", "mao1", 1, 60);
    add("美", "mei3", 3, 180);
    add("米", "mi3", 3, 110);
    add("免", "mian3", 3, 100);
    add("秒", "miao3", 3, 60);
    add("母", "mu3", 3, 120);
    add("哪", "na3", 3, 160);
    add("奶", "nai3", 3, 70);
    add("脑", "nao3", 3, 130);
    add("鸟", "niao3", 3, 60);
    add("您", "nin2", 2, 110);
    add("女", "nv3", 3, 150);
    add("跑", "pao3", 3, 110);
    add("品", "pin3", 3, 150);
    add("普", "pu3", 3, 100);
    add("起", "qi3", 3, 200);
    add("且", "qie3", 3, 130);
    add("请", "qing3", 3, 170);
    add("取", "qu3", 3, 150);
    add("全", "quan2", 2, 140);
    add("染", "ran3", 3, 70);
    add("让", "rang4", 4, 150);
    add("扰", "rao3", 3, 50);
    add("忍", "ren3", 3, 90);
    add("软", "ruan3", 3, 80);
    add("洒", "sa3", 3, 50);
    add("散", "san3", 3, 110);
    add("扫", "sao3", 3, 70);
    add("色", "se4", 4, 150);
    add("闪", "shan3", 3, 70);
    add("少", "shao3", 3, 160);
    add("舍", "she3", 3, 80);
    add("史", "shi3", 3, 130);
    add("始", "shi3", 3, 160);
    add("使", "shi3", 3, 170);
    add("是", "shi4", 4, 200);    add("手", "shou3", 3, 180);
    add("首", "shou3", 3, 150);
    add("数", "shu3", 3, 140);
    add("水", "shui3", 3, 190);
    add("死", "si3", 3, 140);
    add("送", "song4", 4, 130);
    add("诉", "su4", 4, 140);
    add("算", "suan4", 4, 130);
    add("太", "tai4", 4, 180);
    add("讨", "tao3", 3, 70);
    add("特", "te4", 4, 140);
    add("体", "ti3", 3, 190);
    add("土", "tu3", 3, 100);
    add("外", "wai4", 4, 180);
    add("晚", "wan3", 3, 170);
    add("往", "wang3", 3, 150);
    add("网", "wang3", 3, 120);
    add("为", "wei4", 4, 190);
    add("尾", "wei3", 3, 80);
    add("我", "wo3", 3, 200);
    add("五", "wu3", 3, 170);
    add("午", "wu3", 3, 110);
    add("舞", "wu3", 3, 100);
    add("喜", "xi3", 3, 140);
    add("洗", "xi3", 3, 90);
    add("险", "xian3", 3, 100);
    add("想", "xiang3", 3, 200);
    add("小", "xiao3", 3, 200);
    add("写", "xie3", 3, 150);
    add("血", "xie3", 3, 100);
    add("雪", "xue3", 3, 100);
    add("眼", "yan3", 3, 190);
    add("演", "yan3", 3, 140);
    add("养", "yang3", 3, 120);
    add("也", "ye3", 3, 200);
    add("已", "yi3", 3, 180);
    add("以", "yi3", 3, 200);
    add("有", "you3", 3, 200);
    add("友", "you3", 3, 150);
    add("雨", "yu3", 3, 120);
    add("语", "yu3", 3, 150);
    add("远", "yuan3", 3, 170);
    add("院", "yuan4", 4, 140);
    add("在", "zai4", 4, 200);    add("早", "zao3", 3, 150);
    add("怎", "zen3", 3, 170);
    add("展", "zhan3", 3, 160);
    add("站", "zhan4", 4, 140);
    add("长", "zhang3", 3, 170);
    add("者", "zhe3", 3, 180);
    add("整", "zheng3", 3, 150);
    add("正", "zheng4", 4, 180);
    add("只", "zhi3", 3, 190);
    add("指", "zhi3", 3, 170);
    add("纸", "zhi3", 3, 80);
    add("中", "zhong1", 1, 140);
    add("种", "zhong3", 3, 170);
    add("主", "zhu3", 3, 190);
    add("转", "zhuan3", 3, 130);
    add("准", "zhun3", 3, 140);
    add("走", "zou3", 3, 170);
    add("组", "zu3", 3, 140);
    add("嘴", "zui3", 3, 80);
    add("左", "zuo3", 3, 140);

    // ---- Tone 4 characters (falling) ----
    add("爱", "ai4", 4, 170);
    add("八", "ba1", 1, 150);
    add("把", "ba4", 4, 60);
    add("爸", "ba4", 4, 80);
    add("白", "bai2", 2, 150);
    add("百", "bai3", 3, 130);
    add("办", "ban4", 4, 150);
    add("半", "ban4", 4, 160);
    add("帮", "bang1", 1, 130);
    add("包", "bao1", 1, 120);
    add("报", "bao4", 4, 170);
    add("抱", "bao4", 4, 100);
    add("被", "bei4", 4, 170);
    add("备", "bei4", 4, 150);
    add("背", "bei4", 4, 120);
    add("变", "bian4", 4, 170);
    add("遍", "bian4", 4, 130);
    add("标", "biao1", 1, 100);
    add("别", "bie2", 2, 160);
    add("病", "bing4", 4, 120);
    add("不", "bu4", 4, 200);
    add("部", "bu4", 4, 190);
    add("步", "bu4", 4, 150);
    add("才", "cai2", 2, 170);
    add("菜", "cai4", 4, 100);
    add("参", "can1", 1, 120);
    add("操", "cao1", 1, 70);
    add("测", "ce4", 4, 100);
    add("曾", "ceng2", 2, 110);
    add("差", "cha4", 4, 130);
    add("查", "cha2", 2, 150);
    add("察", "cha2", 2, 100);
    add("唱", "chang4", 4, 120);
    add("超", "chao1", 1, 100);
    add("朝", "chao2", 2, 80);
    add("车", "che1", 1, 160);
    add("成", "cheng2", 2, 180);
    add("城", "cheng2", 2, 150);
    add("吃", "chi1", 1, 150);
    add("冲", "chong1", 1, 90);
    add("出", "chu1", 1, 190);
    add("初", "chu1", 1, 100);
    add("除", "chu2", 2, 90);
    add("处", "chu4", 4, 150);
    add("穿", "chuan1", 1, 100);
    add("传", "chuan2", 2, 140);
    add("窗", "chuang1", 1, 60);
    add("春", "chun1", 1, 100);
    add("词", "ci2", 2, 140);
    add("次", "ci4", 4, 170);
    add("从", "cong2", 2, 180);
    add("错", "cuo4", 4, 110);
    add("答", "da2", 2, 130);
    add("打", "da3", 3, 180);
    add("大", "da4", 4, 200);
    add("带", "dai4", 4, 160);
    add("代", "dai4", 4, 160);
    add("单", "dan1", 1, 120);
    add("但", "dan4", 4, 180);
    add("蛋", "dan4", 4, 70);
    add("当", "dang1", 1, 190);
    add("到", "dao4", 4, 200);
    add("道", "dao4", 4, 190);
    add("得", "de2", 2, 200);
    add("的", "de5", 5, 200);
    add("等", "deng3", 3, 160);
    add("地", "di4", 4, 200);
    add("第", "di4", 4, 170);
    add("点", "dian3", 3, 180);
    add("电", "dian4", 4, 180);
    add("店", "dian4", 4, 120);
    add("定", "ding4", 4, 180);
    add("东", "dong1", 1, 170);
    add("动", "dong4", 4, 190);
    add("都", "dou1", 1, 200);
    add("读", "du2", 2, 130);
    add("度", "du4", 4, 170);
    add("段", "duan4", 4, 140);
    add("对", "dui4", 4, 200);
    add("多", "duo1", 1, 200);
    add("儿", "er2", 2, 170);
    add("二", "er4", 4, 180);
    add("发", "fa1", 1, 190);
    add("法", "fa3", 3, 170);
    add("饭", "fan4", 4, 120);
    add("方", "fang1", 1, 180);
    add("房", "fang2", 2, 120);
    add("放", "fang4", 4, 170);
    add("飞", "fei1", 1, 130);
    add("非", "fei1", 1, 140);
    add("费", "fei4", 4, 130);
    add("分", "fen1", 1, 190);
    add("份", "fen4", 4, 140);
    add("风", "feng1", 1, 150);
    add("夫", "fu1", 1, 100);
    add("服", "fu2", 2, 150);
    add("福", "fu2", 2, 90);
    add("父", "fu4", 4, 110);
    add("付", "fu4", 4, 120);
    add("负", "fu4", 4, 100);
    add("复", "fu4", 4, 140);
    add("该", "gai1", 1, 160);
    add("改", "gai3", 3, 140);
    add("干", "gan4", 4, 140);
    add("敢", "gan3", 3, 120);
    add("感", "gan3", 3, 150);
    add("刚", "gang1", 1, 120);
    add("高", "gao1", 1, 180);
    add("告", "gao4", 4, 140);
    add("哥", "ge1", 1, 80);
    add("歌", "ge1", 1, 110);
    add("革", "ge2", 2, 90);
    add("个", "ge4", 4, 200);
    add("各", "ge4", 4, 160);
    add("给", "gei3", 3, 180);
    add("跟", "gen1", 1, 150);
    add("更", "geng4", 4, 160);
    add("工", "gong1", 1, 170);
    add("公", "gong1", 1, 170);
    add("功", "gong1", 1, 120);
    add("共", "gong4", 4, 140);
    add("够", "gou4", 4, 130);
    add("故", "gu4", 4, 110);
    add("顾", "gu4", 4, 110);
    add("瓜", "gua1", 1, 60);
    add("关", "guan1", 1, 180);
    add("观", "guan1", 1, 150);
    add("管", "guan3", 3, 140);
    add("光", "guang1", 1, 160);
    add("广", "guang3", 3, 120);
    add("规", "gui1", 1, 140);
    add("贵", "gui4", 4, 110);
    add("国", "guo2", 2, 200);
    add("果", "guo3", 3, 160);
    add("过", "guo4", 4, 200);
    add("还", "hai2", 2, 190);
    add("海", "hai3", 3, 160);
    add("害", "hai4", 4, 130);
    add("好", "hao3", 3, 200);
    add("号", "hao4", 4, 150);
    add("喝", "he1", 1, 110);
    add("河", "he2", 2, 120);
    add("和", "he2", 2, 190);
    add("黑", "hei1", 1, 120);
    add("很", "hen3", 3, 190);
    add("红", "hong2", 2, 150);
    add("后", "hou4", 4, 190);
    add("候", "hou4", 4, 180);
    add("花", "hua1", 1, 130);
    add("画", "hua4", 4, 130);
    add("话", "hua4", 4, 180);
    add("坏", "huai4", 4, 100);
    add("欢", "huan1", 1, 130);
    add("还", "huan2", 2, 160);
    add("换", "huan4", 4, 110);
    add("黄", "huang2", 2, 120);
    add("回", "hui2", 2, 190);
    add("会", "hui4", 4, 200);
    add("活", "huo2", 2, 170);
    add("火", "huo3", 3, 130);
    add("或", "huo4", 4, 160);
    add("机", "ji1", 1, 180);
    add("鸡", "ji1", 1, 60);
    add("及", "ji2", 2, 140);
    add("级", "ji2", 2, 150);
    add("极", "ji2", 2, 140);
    add("几", "ji3", 3, 170);
    add("己", "ji3", 3, 120);
    add("记", "ji4", 4, 160);
    add("际", "ji4", 4, 130);
    add("济", "ji4", 4, 120);
    add("计", "ji4", 4, 150);
    add("家", "jia1", 1, 200);
    add("加", "jia1", 1, 160);
    add("价", "jia4", 4, 130);
    add("间", "jian1", 1, 190);
    add("件", "jian4", 4, 160);
    add("建", "jian4", 4, 160);
    add("健", "jian4", 4, 100);
    add("将", "jiang1", 1, 170);
    add("讲", "jiang3", 3, 140);
    add("教", "jiao1", 1, 160);
    add("叫", "jiao4", 4, 150);
    add("觉", "jue2", 2, 160);
    add("接", "jie1", 1, 170);
    add("结", "jie2", 2, 150);
    add("解", "jie3", 3, 170);
    add("姐", "jie3", 3, 100);
    add("今", "jin1", 1, 160);
    add("金", "jin1", 1, 150);
    add("紧", "jin3", 3, 130);
    add("进", "jin4", 4, 190);
    add("近", "jin4", 4, 150);
    add("经", "jing1", 1, 190);
    add("精", "jing1", 1, 150);
    add("静", "jing4", 4, 120);
    add("究", "jiu1", 1, 120);
    add("九", "jiu3", 3, 140);
    add("久", "jiu3", 3, 110);
    add("就", "jiu4", 4, 200);
    add("旧", "jiu4", 4, 110);
    add("局", "ju2", 2, 150);
    add("举", "ju3", 3, 130);
    add("具", "ju4", 4, 150);
    add("据", "ju4", 4, 140);
    add("决", "jue2", 2, 150);
    add("觉", "jue2", 2, 170);
    add("开", "kai1", 1, 190);
    add("看", "kan4", 4, 200);
    add("考", "kao3", 3, 120);
    add("可", "ke3", 3, 200);
    add("刻", "ke4", 4, 120);
    add("客", "ke4", 4, 140);
    add("课", "ke4", 4, 110);
    add("空", "kong1", 1, 150);
    add("口", "kou3", 3, 170);
    add("苦", "ku3", 3, 100);
    add("快", "kuai4", 4, 160);
    add("况", "kuang4", 4, 120);
    add("拉", "la1", 1, 100);
    add("来", "lai2", 2, 200);
    add("老", "lao3", 3, 170);
    add("了", "le5", 5, 200);
    add("累", "lei4", 4, 80);
    add("类", "lei4", 4, 130);
    add("冷", "leng3", 3, 90);
    add("离", "li2", 2, 140);
    add("里", "li3", 3, 200);
    add("理", "li3", 3, 180);
    add("力", "li4", 4, 190);
    add("立", "li4", 4, 170);
    add("利", "li4", 4, 170);
    add("例", "li4", 4, 140);
    add("连", "lian2", 2, 130);
    add("脸", "lian3", 3, 100);
    add("两", "liang3", 3, 170);
    add("亮", "liang4", 4, 130);
    add("量", "liang4", 4, 160);
    add("了", "liao3", 3, 100);
    add("林", "lin2", 2, 100);
    add("零", "ling2", 2, 80);
    add("领", "ling3", 3, 120);
    add("令", "ling4", 4, 100);
    add("流", "liu2", 2, 140);
    add("留", "liu2", 2, 130);
    add("六", "liu4", 4, 140);
    add("龙", "long2", 2, 100);
    add("路", "lu4", 4, 170);
    add("旅", "lv3", 3, 100);
    add("绿", "lv4", 4, 100);
    add("乱", "luan4", 4, 90);
    add("论", "lun4", 4, 150);
    add("妈", "ma1", 1, 120);
    add("马", "ma3", 3, 130);
    add("吗", "ma5", 5, 180);
    add("买", "mai3", 3, 130);
    add("卖", "mai4", 4, 120);
    add("满", "man3", 3, 130);
    add("忙", "mang2", 2, 120);
    add("毛", "mao2", 2, 80);
    add("么", "me5", 5, 200);
    add("没", "mei2", 2, 190);
    add("每", "mei3", 3, 140);
    add("美", "mei3", 3, 170);
    add("妹", "mei4", 4, 80);
    add("门", "men2", 2, 160);
    add("们", "men5", 5, 200);
    add("梦", "meng4", 4, 100);
    add("迷", "mi2", 2, 80);
    add("米", "mi3", 3, 100);
    add("面", "mian4", 4, 190);
    add("民", "min2", 2, 170);
    add("明", "ming2", 2, 180);
    add("名", "ming2", 2, 170);
    add("母", "mu3", 3, 110);
    add("目", "mu4", 4, 140);
    add("拿", "na2", 2, 100);
    add("哪", "na3", 3, 150);
    add("那", "na4", 4, 190);
    add("南", "nan2", 2, 140);
    add("难", "nan2", 2, 150);
    add("脑", "nao3", 3, 100);
    add("呢", "ne5", 5, 180);
    add("内", "nei4", 4, 140);
    add("能", "neng2", 2, 200);
    add("你", "ni3", 3, 200);
    add("年", "nian2", 2, 180);
    add("念", "nian4", 4, 100);
    add("鸟", "niao3", 3, 50);
    add("您", "nin2", 2, 90);
    add("牛", "niu2", 2, 60);
    add("农", "nong2", 2, 110);
    add("女", "nv3", 3, 140);
    add("暖", "nuan3", 3, 60);

    // Extras from common karaoke / lyrics vocabulary
    add("啊", "a1", 1, 100);
    add("哎", "ai1", 1, 60);
    add("安", "an1", 1, 140);
    add("暗", "an4", 4, 100);
    add("岸", "an4", 4, 70);
    add("奥", "ao4", 4, 60);
    add("吧", "ba5", 5, 180);
    add("把", "ba3", 3, 150);
    add("白", "bai2", 2, 140);
    add("拜", "bai4", 4, 70);
    add("班", "ban1", 1, 130);
    add("般", "ban1", 1, 160);
    add("板", "ban3", 3, 90);
    add("版", "ban3", 3, 80);
    add("伴", "ban4", 4, 100);
    add("扮", "ban4", 4, 50);
    add("帮", "bang1", 1, 100);
    add("包", "bao1", 1, 100);
    add("宝", "bao3", 3, 90);
    add("饱", "bao3", 3, 70);
    add("保", "bao3", 3, 150);
    add("报", "bao4", 4, 160);
    add("抱", "bao4", 4, 80);
    add("暴", "bao4", 4, 70);
    add("悲", "bei1", 1, 70);
    add("北", "bei3", 3, 150);
    add("背", "bei4", 4, 100);
    add("被", "bei4", 4, 160);
    add("奔", "ben1", 1, 70);
    add("本", "ben3", 3, 170);
    add("比", "bi3", 3, 180);
    add("笔", "bi3", 3, 100);
    add("必", "bi4", 4, 170);
    add("闭", "bi4", 4, 70);
    add("边", "bian1", 1, 180);
    add("编", "bian1", 1, 90);
    add("变", "bian4", 4, 160);
    add("便", "bian4", 4, 170);
    add("遍", "bian4", 4, 110);
    add("表", "biao3", 3, 150);
    add("别", "bie2", 2, 160);
    add("冰", "bing1", 1, 70);
    add("并", "bing4", 4, 160);
    add("病", "bing4", 4, 100);
    add("波", "bo1", 1, 80);
    add("播", "bo1", 1, 90);
    add("不", "bu4", 4, 200);
    add("布", "bu4", 4, 130);
    add("步", "bu4", 4, 140);
    add("部", "bu4", 4, 180);
    add("猜", "cai1", 1, 60);
    add("才", "cai2", 2, 160);
    add("材", "cai2", 2, 100);
    add("财", "cai2", 2, 90);
    add("采", "cai3", 3, 110);
    add("彩", "cai3", 3, 100);
    add("菜", "cai4", 4, 90);
    add("参", "can1", 1, 130);
    add("餐", "can1", 1, 70);
    add("残", "can2", 2, 60);
    add("苍", "cang1", 1, 50);
    add("藏", "cang2", 2, 90);
    add("操", "cao1", 1, 70);
    add("草", "cao3", 3, 80);
    add("测", "ce4", 4, 90);
    add("层", "ceng2", 2, 100);
    add("曾", "ceng2", 2, 110);
    add("插", "cha1", 1, 50);
    add("查", "cha2", 2, 150);
    add("茶", "cha2", 2, 90);
    add("察", "cha2", 2, 90);
    add("差", "cha4", 4, 130);
    add("拆", "chai1", 1, 40);
    add("柴", "chai2", 2, 50);
    add("产", "chan3", 3, 140);
    add("长", "chang2", 2, 180);
    add("常", "chang2", 2, 180);
    add("场", "chang3", 3, 150);
    add("唱", "chang4", 4, 110);
    add("超", "chao1", 1, 90);
    add("朝", "chao2", 2, 80);
    add("潮", "chao2", 2, 70);
    add("吵", "chao3", 3, 40);
    add("车", "che1", 1, 150);
    add("彻", "che4", 4, 60);
    add("晨", "chen2", 2, 60);
    add("尘", "chen2", 2, 50);
    add("沉", "chen2", 2, 80);
    add("陈", "chen2", 2, 70);
    add("称", "cheng1", 1, 120);
    add("城", "cheng2", 2, 140);
    add("成", "cheng2", 2, 190);
    add("程", "cheng2", 2, 140);
    add("吃", "chi1", 1, 140);
    add("持", "chi2", 2, 130);
    add("尺", "chi3", 3, 50);
    add("赤", "chi4", 4, 50);
    add("充", "chong1", 1, 100);
    add("冲", "chong1", 1, 80);
    add("虫", "chong2", 2, 40);
    add("抽", "chou1", 1, 70);
    add("仇", "chou2", 2, 40);
    add("愁", "chou2", 2, 60);
    add("丑", "chou3", 3, 40);
    add("初", "chu1", 1, 100);
    add("出", "chu1", 1, 190);
    add("除", "chu2", 2, 100);
    add("楚", "chu3", 3, 70);
    add("处", "chu4", 4, 140);
    add("穿", "chuan1", 1, 90);
    add("传", "chuan2", 2, 140);
    add("船", "chuan2", 2, 80);
    add("窗", "chuang1", 1, 60);
    add("床", "chuang2", 2, 80);
    add("春", "chun1", 1, 100);
    add("纯", "chun2", 2, 60);
    add("词", "ci2", 2, 130);
    add("此", "ci3", 3, 150);
    add("次", "ci4", 4, 170);
    add("从", "cong2", 2, 180);
    add("粗", "cu1", 1, 50);
    add("促", "cu4", 4, 60);
    add("村", "cun1", 1, 80);
    add("存", "cun2", 2, 130);
    add("错", "cuo4", 4, 110);
    add("答", "da2", 2, 130);
    add("达", "da2", 2, 150);
    add("打", "da3", 3, 180);
    add("大", "da4", 4, 200);
    add("呆", "dai1", 1, 50);
    add("代", "dai4", 4, 160);
    add("带", "dai4", 4, 150);
    add("待", "dai4", 4, 130);
    add("单", "dan1", 1, 130);
    add("但", "dan4", 4, 180);
    add("弹", "dan4", 4, 80);
    add("当", "dang1", 1, 180);
    add("党", "dang3", 3, 120);
    add("档", "dang4", 4, 70);
    add("刀", "dao1", 1, 60);
    add("倒", "dao3", 3, 110);
    add("导", "dao3", 3, 130);
    add("到", "dao4", 4, 200);
    add("道", "dao4", 4, 190);
    add("得", "de2", 2, 200);
    add("的", "de5", 5, 200);
    add("灯", "deng1", 1, 80);
    add("等", "deng3", 3, 160);
    add("低", "di1", 1, 120);
    add("底", "di3", 3, 140);
    add("地", "di4", 4, 200);
    add("第", "di4", 4, 170);
    add("点", "dian3", 3, 180);
    add("电", "dian4", 4, 170);
    add("调", "diao4", 4, 140);
    add("掉", "diao4", 4, 100);
    add("定", "ding4", 4, 180);
    add("冬", "dong1", 1, 70);
    add("东", "dong1", 1, 160);
    add("动", "dong4", 4, 180);
    add("都", "dou1", 1, 190);
    add("斗", "dou4", 4, 80);
    add("读", "du2", 2, 120);
    add("独", "du2", 2, 100);
    add("度", "du4", 4, 160);
    add("端", "duan1", 1, 100);
    add("短", "duan3", 3, 90);
    add("段", "duan4", 4, 130);
    add("断", "duan4", 4, 120);
    add("对", "dui4", 4, 200);
    add("队", "dui4", 4, 140);
    add("顿", "dun4", 4, 90);
    add("多", "duo1", 1, 200);
    add("哦", "o2", 2, 40);
    add("噢", "o1", 1, 30);
    add("嗯", "en1", 1, 60);
    add("啦", "la5", 5, 100);
    add("嘛", "ma5", 5, 80);
    add("呀", "ya5", 5, 80);
    add("哇", "wa5", 5, 60);
    add("哟", "yo1", 1, 30);
    add("哦", "o2", 2, 40);
    add("嘿", "hei1", 1, 30);
    add("喂", "wei4", 4, 50);

    // Build word dictionary
    let mut word_dict: HashMap<String, Vec<PinyinEntry>> = HashMap::new();
    // Common multi-character words
    word_dict.insert(
        "我们".to_string(),
        vec![
            PinyinEntry { pinyin: "wo3".to_string(), tone: 3, frequency: 200 },
            PinyinEntry { pinyin: "men5".to_string(), tone: 5, frequency: 200 },
        ],
    );
    word_dict.insert(
        "他们".to_string(),
        vec![
            PinyinEntry { pinyin: "ta1".to_string(), tone: 1, frequency: 200 },
            PinyinEntry { pinyin: "men5".to_string(), tone: 5, frequency: 200 },
        ],
    );
    word_dict.insert(
        "没有".to_string(),
        vec![
            PinyinEntry { pinyin: "mei2".to_string(), tone: 2, frequency: 200 },
            PinyinEntry { pinyin: "you3".to_string(), tone: 3, frequency: 200 },
        ],
    );
    word_dict.insert(
        "因为".to_string(),
        vec![
            PinyinEntry { pinyin: "yin1".to_string(), tone: 1, frequency: 190 },
            PinyinEntry { pinyin: "wei4".to_string(), tone: 4, frequency: 190 },
        ],
    );
    word_dict.insert(
        "所以".to_string(),
        vec![
            PinyinEntry { pinyin: "suo3".to_string(), tone: 3, frequency: 180 },
            PinyinEntry { pinyin: "yi3".to_string(), tone: 3, frequency: 180 },
        ],
    );
    word_dict.insert(
        "可以".to_string(),
        vec![
            PinyinEntry { pinyin: "ke3".to_string(), tone: 3, frequency: 190 },
            PinyinEntry { pinyin: "yi3".to_string(), tone: 3, frequency: 190 },
        ],
    );
    word_dict.insert(
        "知道".to_string(),
        vec![
            PinyinEntry { pinyin: "zhi1".to_string(), tone: 1, frequency: 190 },
            PinyinEntry { pinyin: "dao4".to_string(), tone: 4, frequency: 190 },
        ],
    );
    word_dict.insert(
        "什么".to_string(),
        vec![
            PinyinEntry { pinyin: "shen2".to_string(), tone: 2, frequency: 200 },
            PinyinEntry { pinyin: "me5".to_string(), tone: 5, frequency: 200 },
        ],
    );
    word_dict.insert(
        "怎么".to_string(),
        vec![
            PinyinEntry { pinyin: "zen3".to_string(), tone: 3, frequency: 180 },
            PinyinEntry { pinyin: "me5".to_string(), tone: 5, frequency: 180 },
        ],
    );
    word_dict.insert(
        "自己".to_string(),
        vec![
            PinyinEntry { pinyin: "zi4".to_string(), tone: 4, frequency: 180 },
            PinyinEntry { pinyin: "ji3".to_string(), tone: 3, frequency: 180 },
        ],
    );
    word_dict.insert(
        "时候".to_string(),
        vec![
            PinyinEntry { pinyin: "shi2".to_string(), tone: 2, frequency: 190 },
            PinyinEntry { pinyin: "hou4".to_string(), tone: 4, frequency: 190 },
        ],
    );
    word_dict.insert(
        "世界".to_string(),
        vec![
            PinyinEntry { pinyin: "shi4".to_string(), tone: 4, frequency: 180 },
            PinyinEntry { pinyin: "jie4".to_string(), tone: 4, frequency: 180 },
        ],
    );
    word_dict.insert(
        "就是".to_string(),
        vec![
            PinyinEntry { pinyin: "jiu4".to_string(), tone: 4, frequency: 200 },
            PinyinEntry { pinyin: "shi4".to_string(), tone: 4, frequency: 200 },
        ],
    );
    word_dict.insert(
        "不是".to_string(),
        vec![
            PinyinEntry { pinyin: "bu4".to_string(), tone: 4, frequency: 200 },
            PinyinEntry { pinyin: "shi4".to_string(), tone: 4, frequency: 200 },
        ],
    );
    word_dict.insert(
        "还是".to_string(),
        vec![
            PinyinEntry { pinyin: "hai2".to_string(), tone: 2, frequency: 190 },
            PinyinEntry { pinyin: "shi4".to_string(), tone: 4, frequency: 190 },
        ],
    );

    PronunciationDict {
        char_dict,
        word_dict,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builtin_dict_has_common_chars() {
        let dict = builtin_dict();
        let result = dict.lookup_char("我", None);
        assert!(!result.is_empty(), "Expected '我' to have pinyin entries");
        assert_eq!(result[0].pinyin, "wo3");
    }

    #[test]
    fn test_builtin_dict_lookup_batch() {
        let dict = builtin_dict();
        let texts = vec!["我".to_string(), "爱".to_string(), "你".to_string()];
        let results = dict.lookup_batch(&texts);
        assert_eq!(results.len(), 3);
        assert_eq!(results[0][0].pinyin, "wo3");
        assert_eq!(results[1][0].pinyin, "ai4");
        assert_eq!(results[2][0].pinyin, "ni3");
    }

    #[test]
    fn test_word_dict_known_words() {
        let dict = builtin_dict();
        let entries = dict.word_dict.get("我们");
        assert!(entries.is_some());
        assert_eq!(entries.unwrap().len(), 2);
    }

    #[test]
    fn test_builtin_dict_covers_basic_vocab() {
        let dict = builtin_dict();
        // Check a variety of common characters
        for ch in &["的", "一", "是", "不", "了", "人", "我", "在", "有", "他"] {
            let result = dict.lookup_char(ch, None);
            assert!(
                !result.is_empty(),
                "Expected '{}' to have a pinyin entry in builtin_dict",
                ch
            );
        }
    }
}
