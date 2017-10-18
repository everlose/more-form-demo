<template>
    <div id="app">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>主页</el-breadcrumb-item>
            <el-breadcrumb-item>某表单页</el-breadcrumb-item>
        </el-breadcrumb>
        <main class="ct-wrap">
            <div class="ct">
                <div class="basic-info ct-form" v-for="(config, configIndex) in formConfig" :key="configIndex">
                    <h3 class="form__title">{{config.title}}</h3>
                    <el-form class="form-content" ref="form" label-width="150px">
                        <el-form-item
                            class="basic-form-item"
                            v-for="(item, itemIndex) in config.formItems"
                            :key="itemIndex"
                            :prop="item.code"
                            :class="item.singleRow ? 'single-row' : ''"
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
            </div>
        </main>
    </div>
</template>

<script>
import API from './api';

export default {
    name: 'app',
    data() {
        return {
            formOptions: {},
            formConfig: [],
            formData: {},
            msg: 'Welcome to Your Vue.js App'
        }
    },
    methods: {},
    created () {
        API.getFormConfigData()
        .then((d) => {
            this.formOptions = d.formOptions;
            this.formConfig = d.formConfig;
            this.formData = d.formData;
        });
    }
}

</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 60px auto;
}
.ct-wrap {
    position: relative;
    margin-top: 64px;
}
.ct {
    width: 1110px;
    margin: 0 auto;
    border: 1px solid #BFBFBF;
    padding: 56px 40px 40px;
    box-sizing: border-box;
}
.ct-form {
    margin-bottom: 48px;
}
.form__title {
    margin-bottom: 32px;
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
}
.form-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

}
.form-content .el-form-item {
    width: 440px;
}
.form-content .el-input {
    width: 194px;
}
.form-content .el-form-item.form-item--full {
    width: 100%;
}
.form-content .form-item-unit--full {
    width: 696px;
}
</style>
