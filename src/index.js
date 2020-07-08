import Vue from 'vue'

const timeLine = {};
import TimeLine from "./components/TimeLine"

timeLine.install = function (Vue, options) {
    console.log(options);
    Vue.prototype.$version = '0.0.1';
    // todo 添加全局方法或 property
    Vue.prototype.$func = function () {
        // 逻辑...
        console.log('func')
    };
    // todo 添加全局资源
    Vue.directive('my-directive', {
        bind(el, binding, vnode, oldVnode) {
            // 逻辑...
        }
    });
    // todo 注入组件选项
    Vue.mixin({
        created: function () {
            // 逻辑...
        }
    });
    console.log(TimeLine);
    Vue.component(TimeLine.name, TimeLine);
};


export {TimeLine};
export default timeLine;
