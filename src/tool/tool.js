/***
 * 时间s 与 h:m:s 的格式 互转
 * @param time 时间
 * @param reverse 反转
 * @return {{s: string, h: string, m: string}|number|string}
 */
const timeChangeSecond = (time, reverse = false) => {
    let result;
    if (reverse) {
        if (typeof time === 'object') {
            const
                h = parseInt(time.h || 0),
                m = parseInt(time.m || 0),
                s = parseInt(time.s || 0);
            result = h * 3600 + m * 60 + s + '';
        } else {
            result = 0;
        }
    } else {
        if (typeof time === 'object') {
            result = 0;
        } else {
            // 时间转化为 {h,m,s}的形式
            const _time = parseInt(time);
            let h = 0, m = 0, s = 0;
            h = Math.floor(_time / 3600);
            m = Math.floor((_time - h * 3600) / 60);
            s = _time - h * 3600 - m * 60;
            result = {
                h: h > 9 ? '' + h : '0' + h,
                m: m > 9 ? '' + m : '0' + m,
                s: s > 9 ? '' + s : '0' + s,
            };
        }
    }
    return result;
};


const randomData = (len = 0) => {
    let lists = [];
    for (let i = 0; i < len; i++) {
        lists.push({id: i, name: "卡片" + (i + 1), duration: Math.round(Math.random(0,1)*600)});
    }
    return lists;
};
randomData(5)
module.exports = {
    timeChangeSecond,
    randomData
};
