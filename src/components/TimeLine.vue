<template>
    <div class="vue-time-line">
        <div class="time-content">
            <div class="time-nav" :style="{left:'50%'}">
                <div class="marks" :style="{left:left*zoom.toFixed(2)+'%'}">
                    <div :class="['mark',i===pageIndex?'active':'']" v-for="(mark,i) in marks"
                         :style='getMarkStyle(i,pageIndex,mark)'>
                        <div :class="['mark-text',{'active':i===pageIndex}]"
                             :style="getMarkTextStyle(i,pageIndex)"
                             :title="`${mark.time.start+'-'+mark.time.end}`"
                             @click="clickMark(i,mark)">
                            <span class="text-ellipsis">{{mark.name}}</span>
                        </div>
                        <div class="dot"></div>
                        <div class="mark-line"></div>
                        <div class="end-time" v-if="i===marks.length-1">
                            <div class="line"></div>
                            <div class="t">{{mark.time.end}}</div>
                        </div>
                        <div class="start-time">
                            <div class="line"></div>
                            <div class="t">{{mark.time.start}}</div>
                        </div>
                    </div>
                </div>
                <div class="time-minor" :style="{left:left*zoom.toFixed(2)+'%','width':(100*zoom).toFixed(2)+'%'}">
                </div>
            </div>
        </div>
        <div class="time-nav-line"></div>
        <div class="tool-bar">
            <div class="back-home" title="重置" @click="backHome">
                <i class="iconfont icon-weibiaoti545"></i>
            </div>
            <div class="zoom-in" title="放大" @click="zoomIn">
                <i class="iconfont icon-fangda"></i>
            </div>
            <div class="zoom-out" title="缩小" @click="zoomOut">
                <i class="iconfont icon-suoxiao"></i>
            </div>
        </div>
        <div class="time-foot"></div>
    </div>
</template>
<script>
    import {timeChangeSecond, randomData} from "../tool/tool";

    export default {
        name: "TimeLine",
        data() {
            return {
                allTime: 0,// 所有时间
                timeArr: [], // 时间数组
                position: {
                    start: 0,
                    end: 0,
                },//坐标位置
                startTime: 0,
                endTime: 0,
                lists: [],
                marks: [],// 标记点
                pageIndex: 0, // 当前页数
                left: 0,// 初始位置
                initZoom: 1,// 初始比例
                zoom: 1,// 缩放比例
                minZoom: 1,//最小的zoom
                maxZoom: 10,// 最大的zoom
                eZoom: 1,//每次改变的zoom
            }
        },
        props: {
            pages: {
                type: Array,
                default() {
                    //模拟5条数据
                    return randomData(5)
                }
            },
            currentPage: {
                type: Number,
                default() {
                    return 0
                }
            }
        },
        mounted() {
            this.init();
        },
        watch: {
            pages(newList) {
                this.lists = [].concat(newList);
                this.init(this.lists);
            }
        },
        methods: {
            clear(list) {
                this.lists = list;
                this.pageIndex = this.currentPage;
                this.allTime = 0;
                this.timeArr = [];
                this.position = {};
                this.startTime = 0;
                this.endTime = 0;
                this.marks = [];
                this.left = 0;
            },
            init() {
                //重置数据
                this.clear(this.pages);
                this.lists = this.lists.map(item => {
                    const {h, m, s} = timeChangeSecond(item.duration);
                    // 处理时间数据
                    this.allTime += parseInt(item.duration) || 0;
                    this.timeArr.push(parseInt(item.duration) || 0);
                    // 处理时间数据
                    item = Object.assign({}, item, {h, m, s});

                    return item;
                });

                this.getPosition(this.lists);

                this.$nextTick(() => {
                    if (this.marks.length > 0) {
                        this.left = this.pageIndex !== -1 ? -this.marks[this.pageIndex].position.start : 0;
                    }
                })
            },
            filterIndex(lists, id) {
                return lists.findIndex(list => list.id === id);
            },
            getPosition(lists) {
                let positions = [];
                lists.forEach((list, i) => {
                    let {time, position} = this.getTime(i);
                    positions[i] = Object.assign({}, list, {position}, {time})
                });
                this.marks = positions;
                return positions;
            },
            getTime(pageIndex = 0) {
                let sum = 0;
                for (let i = 0; i < pageIndex; i++) {
                    sum += this.timeArr[i];
                }
                this.position.start = ((parseFloat(sum * 100) / this.allTime).toFixed(2)) || 0;
                this.position.end = ((parseFloat((sum + this.timeArr[pageIndex]) * 100) / this.allTime).toFixed(2)) || 0;
                const
                    _startTime = timeChangeSecond(sum),
                    _endTime = timeChangeSecond(sum + this.timeArr[pageIndex]);
                this.startTime = `${_startTime.h}:${_startTime.m}:${_startTime.s}`;
                this.endTime = `${_endTime.h}:${_endTime.m}:${_endTime.s}`;

                return {
                    time: {
                        start: this.startTime,
                        end: this.endTime,
                    },
                    position: {
                        start: this.position.start,
                        end: this.position.end
                    }
                }
            },

            clickMark(index, mark) {
                this.switchPage(index);
                this.$emit('switch-page', index, mark);
            },
            switchPage(index) {
                this.pageIndex = index;
                const {start} = index !== -1 ? this.marks[index].position : {};
                this.left = -start;
            },
            backHome() {
                this.zoom = this.initZoom;
            },
            zoomIn() {
                let zoom = this.zoom;
                this.zoom = zoom >= (this.maxZoom - this.eZoom) ? this.maxZoom : zoom + this.eZoom;
            },
            zoomOut() {
                let zoom = this.zoom;
                this.zoom = zoom <= (this.minZoom + this.eZoom) ? this.minZoom : zoom - this.eZoom;
            },
            makePosition(index) {
                let bottom = [this.pxChangeVw(6), this.pxChangeVw(6 + 40), this.pxChangeVw(6 + 105)],
                    len = bottom.length;
                let remainder = index % len;// 余数
                return bottom[remainder];
            },
            getMarkStyle(i, pageIndex, mark) {
                if (i === pageIndex) {
                    return {
                        width: ((mark.position.end - mark.position.start) * this.zoom).toFixed(2) + '%',
                        'margin-left': mark.position.start * this.zoom.toFixed(2) + '%',
                        'z-index': 5,
                    }
                } else {
                    return {
                        width: ((mark.position.end - mark.position.start) * this.zoom).toFixed(2) + '%',
                        'margin-left': mark.position.start * this.zoom.toFixed(2) + '%',
                    }
                }
            },
            getMarkTextStyle(i, pageIndex) {
                if (i === pageIndex) {
                    return {
                        bottom: '50%',
                        transform: 'translateY(50%)'
                    }
                } else {
                    return {
                        bottom: this.makePosition(i)
                    }
                }
            },
            centerPosition() {
                //选中后位于中心
                return this.pxChangeVw(50);
            },
            pxChangeVw(px) {
                return px + 'px';
            },
        }
    }
</script>
<style scoped lang="scss">
    .vue-time-line {
        @import "../assets/font/iconfont.css";
        $baseH: 166px; //内部区域高度
        $paddingTop: 0; //内部区域上边距
        position: relative;
        width: 100%;
        height: $baseH;
        padding: $paddingTop 0 40px 0;
        background: #242829;
        $markW: 150px;
        $markH: 50px;
        $color: #68BFC2;
        $activeColor: #FFAA0D;
        $iconColor: #68BFC2;
        $minorH: 6px; //底部标尺
        $time-navH: 50px;
        $move-transition: all 1s cubic-bezier(0.22, 0.61, 0.36, 1);

        .time-content {
            position: relative;
            width: 100%;
            height: 100%;
            background-color: #323637;
            overflow: hidden;
        }

        .time-nav {
            width: 50%;
            position: relative;
            height: 100%;
        }

        .marks {
            position: relative;
            transition: $move-transition;
            height: 100%;

            .mark {
                position: absolute;
                bottom: 0;
                height: 100%;

                .dot {
                    position: absolute;
                    bottom: 0;
                    left: -1px;
                    $r: 2px;
                    width: $r;
                    height: $baseH;
                    background: #1A1C1D;
                }

                .mark-line {
                    display: block;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: $minorH;
                    background: transparent;

                    &:hover {
                        background-color: $color;
                    }
                }

                .mark-text {
                    display: flex;
                    align-items: center;
                    position: absolute;
                    //width: $markW;
                    width: 90%;
                    overflow: hidden;

                    max-width: $markW;
                    height: $markH;
                    left: 0;
                    bottom: $minorH;;
                    cursor: pointer;
                    z-index: 2;
                    background-repeat: no-repeat;
                    background-size: 100% 100%;
                    background-position: center;
                    background-image: url(../assets/images/nor.png);
                    transition: bottom 1s;
                    padding-left: 5px;
                    box-sizing: border-box;

                    .text-ellipsis {
                        word-break: keep-all;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    &:hover {
                        background-image: url(../assets/images/hover.png);

                        + div {
                            background: $color;
                            z-index: 2;

                            & + div {
                                background: $color;
                                z-index: 1;

                                & + div {
                                    display: block;
                                }
                            }
                        }

                        .dot {
                            z-index: 2;
                        }

                    }

                    .iconfont {
                        font-size: 30px;
                        z-index: 1;
                        color: $color;
                        margin-left: 10px;
                        margin-right: 10px;
                    }

                    > span {
                        flex: 1;
                        color: $color;
                    }
                }

                &:first-child {
                    .start-time, .end-time {
                        display: block;
                    }
                }

                &:last-child {
                    .end-time {
                        display: block;
                    }
                }

                .start-time, .end-time {
                    display: none;
                }

                .start-time {
                    position: absolute;
                    bottom: -35px;
                    left: 0;

                    .line {
                        position: absolute;
                        left: -1px;
                        bottom: 0;
                        width: 1px;
                        height: 35px;
                        background-color: $color;
                    }

                    .t {
                        padding-left: 5px;
                        color: $color;
                    }
                }

                .end-time {
                    position: absolute;
                    bottom: -35px;
                    right: 0;

                    .line {
                        position: absolute;
                        right: -1px;
                        bottom: 0;
                        width: 1px;
                        height: 35px;
                        background-color: $color;
                    }

                    .t {
                        padding-right: 5px;
                        color: $color;
                    }
                }

                &.active {
                    .mark-line {
                        background-color: $activeColor;
                    }

                    .start-time {
                        display: block;

                        .line {
                            background-color: $activeColor;
                        }

                        .t {
                            color: $activeColor;
                        }
                    }

                    &:last-child {
                        .end-time {
                            display: none;
                        }
                    }

                    .mark-text {
                        background-image: url(../assets/images/xuanzhong.png);

                        > .iconfont, > span {
                            color: $activeColor;
                        }

                        &:hover {
                            + div {
                                & + div {
                                    background: $activeColor;
                                }
                            }
                        }
                    }
                }
            }
        }

        .time-minor {
            transition: $move-transition;
            position: absolute;
            bottom: 0;
            width: 100%;
            height: $minorH;
            background-image: url('../assets/images/timeline_bg.jpg');
            background-position: center top;
            white-space: nowrap;
            display: inline-block;
        }

        .tool-bar {
            $r: 30px;
            $h: $r;
            $w: $r;
            position: absolute;
            top: 50%;
            left: 5px;
            transform: translateY(-50%);
            background-color: #111314;
            z-index: 2;

            .back-home, .zoom-in, .zoom-out {
                width: $w;
                height: $h;
                line-height: $w;
                text-align: center;
                color: rgba($iconColor, .5);
                margin: 0;
                cursor: pointer;

                &:hover {
                    color: $iconColor;
                }
            }
        }

        .time-nav-line {
            position: absolute;
            top: $paddingTop;
            left: 50%;
            transform: translateX(-50%);
            width: 3px;
            height: $baseH;
            box-sizing: border-box;
            background: $activeColor;
            box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.3);
            z-index: 5;
        }
    }
</style>
