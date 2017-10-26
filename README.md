## 启动

```
npm install
npm run dev
```

## 背景

身为一个表单表格工程师，自然日复一日的写着表单表格，本以为已经没啥难点的时候转眼间就来了一个有意思的情况，在超大量 数据绑定在 vue 的时候出现了表单操作起来卡顿的情况。

这里先贴上[本项目出现的情况演示的 github 上的地址，tag1.0.1](https://github.com/everlose/more-form-demo/tree/v1.0.1)

如图所见，当在 input 输入数据的时候，连续输入会感觉明显的延迟。

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-10-26/99045022.jpg)

那么，这到底是怎么回事？

## 代码

上述的表单数据项修改频繁由后端返回，于是在前端需要渲染从后端返回的 68kb 的一个 JSON 数据串，包括所有配置表单项以及其可能的选项值，[数据见这里](https://github.com/everlose/more-form-demo/blob/v1.0.1/src/data.json)

核心渲染是有这么一段

```html
<div class="basic-info ct-form" v-for="(config, configIndex) in formConfig" :key="configIndex">
    <h3 class="form__title">{{config.title}}</h3>
    <el-form class="form-content" ref="form" label-width="150px">
        <el-form-item
            class="basic-form-item"
            v-for="(item, itemIndex) in config.formItems"
            :key="itemIndex"
            :prop="item.code"
            :label="item.name"
            :required="item.required"
            :rules="item.rules">
            <el-radio-group
                v-if="item.type === 'radio'"
                v-model="formData[item.code]">
                <el-radio
                    v-for="(option, radioIndex) in formOptions[item.optionCode]"
                    :key="option.value"
                    :label="option.value"
                    :disabled="item.disabled">
                    {{ option.label }}
                </el-radio>
            </el-radio-group>
            <el-input
                v-else-if="item.type === 'input'"
                :class="{ longInput: item.isLongInput }"
                :placeholder="item.placeholder || '请输入'"
                v-model="formData[item.code]"
                :label="item.label"
                :disabled="item.disabled"
                :maxlength="item.maxLength">
            </el-input>
            <el-select
                v-else-if="item.type === 'select'"
                v-model="formData[item.code]"
                :disabled="item.disabled"
                :placeholder="item.placeholder || '请选择'">
                <el-option
                    v-for="(option, optionsIndex) in formOptions[item.optionCode]"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value">
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
</div>
```

这就是一个简单的双层遍历渲染所有表单配置项的模版代码，其中的 formConfig 正是所有配置表单项，数据量极多。formOptions 挂载了所有表单选项值，也是动辄几千项。

## 思路

正当我对着这么高的操作延时发愁的时候，组里一个大佬提醒我，可能是 Vue.prototype._update 这个触发的太频繁了。

我急忙找到这一段打了个断点调试

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-10-26/49459645.jpg)

Vue.prototype._update 这函数里触发的是 VNode 虚拟节点的比对更新，打断点调试后发现实际上这是一个循环，在控制台里输出 `this.$el` 的时候能得到正在深度遍历中的节点，沿着根结点 App（也是 formConfig 数据绑定的作用域） 开始直到具体触发输入的那个表单元素。

在本项目里是使用了遍历输出所有的表单元素，并且当前组件的作用域是直接挂在根结点上的，是否就是这个遍历引发了如此高的延时呢？于是我找到上图右侧的调用堆栈，发现正是 `flushSchedulerQueue` 函数写着一个 for 循环。

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-10-26/45559864.jpg)

在 `flushSchedulerQueue` 函数中的 for 循环里头尾插入代码来获取耗费时间。

结果得知输入时的延迟大概在 300ms 之上。

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-10-26/12172972.jpg)

似乎问题就找到了，`flushSchedulerQueue` 函数针对 data 中数据的修改把 watcher 推送进队列里在更新，这一循环耗费的时间比较长。

## 解决

其实早在调试 `Vue.prototype._update` 函数就初见端倪，循环中的 `this.$el` 从当前组件的根部开始深度遍历，遍历了太多次，那么只要想办法缩小当前组件所绑定的数据量就解决了。

于是核心代码调整为

```html
<div class="basic-info ct-form" v-for="(config, configIndex) in formConfig" :key="configIndex">
    <edit-form
        :config="config"
        :data="formData"
        :options="formOptions">
    </edit-form>
</div>
```

只是用一个 edit-form 包裹刚刚所有的 el-form-item 的渲染代码就解决了，再次调试 `Vue.prototype._update` 得出遍历节点 `this.$el` 已经变为下图所示的 `div.edit-form` 了，`flushSchedulerQueue` 函数 for 循环的延迟也变为 10ms 左右

![](http://7xn4mw.com1.z0.glb.clouddn.com/17-10-26/88158757.jpg)

修复版的代码在2.0.0的tag上，[这里贴上链接](https://github.com/everlose/more-form-demo/tree/v2.0.0)

## 后记

本质上这就是一个原则，最好不要在一个vue组件上直接绑定如此多的数据，如果有大量数据请分多个组件绑定。这么浅尝辄止实在让人不够尽兴，于是这里贴上 Vue.prototype._update 前的关键部分调用堆栈以及其函数作用。

找到项目中 node_modules 下的 vue.esm.js

```
# 往input里输入将会触发model data的更新
978 set: function reactiveSetter (newVal)
# 订阅器dep是数据绑定和视图更新的关键，这里触发去通知相关视图的更新
994 dep.notify();
673 Dep.prototype.notify
# notify函数里的subs实际上是Watcher对象的实例，这里触发视图更新操作
677 subs[i].update(); subs实际上是包裹watcher的数组
3093 Watcher.prototype.update
# 把watcher塞进一个队列里，这里是和异步更新视图有关。
3100 queueWatcher(this);
2945 function queueWatcher (watcher) push到队列里
# nextTick是具体做异步更新的部分
2963 nextTick(flushSchedulerQueue); 
1778 function nextTick (cb, ctx)
# 异步操作实际上是原生 H5 MessageChannel API 通道通信来推送消息来实现变化。
1738 port.postMessage(1); 

# 注意在异步操作中，最终传入的回调函数被执行来进行下面视图的更新。这里是执行一个任务调度队列的调度过程，需要循环遍历。
2856 function flushSchedulerQueue
3108 Watcher.prototype.run
# Evaluate the getter, and re-collect dependencies.
3043 Watcher.prototype.get
# watcher中的getter的name就叫updateComponent，于是被执行
2689 updateComponent
2690 vm._update(vm._render(), hydrating);
# 进入vue的生命周期中的update函数
2548 Vue.prototype._update
# patch做的是vnode的节点比对，最终把新的vnode结构渲染到具体视图，不再多做描述。
2572 vm.$el = vm.__patch__(prevVnode, vnode);
```
