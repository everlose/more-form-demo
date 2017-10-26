<template>
    <div class="edit-form" :id="config.name">
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
                <!-- 基本输入 -->
                <el-input
                    v-if="item.type === 'input'"
                    :class="{ longInput: item.isLongInput }"
                    v-model="data[item.code]"
                    :placeholder="item.placeholder || '请选择'"
                    :label="item.label"
                    :maxLength="item.maxLength">
                </el-input>
                <!-- 单选 -->
                <el-radio-group
                    v-else-if="item.type === 'radio'"
                    v-model="data[item.code]">
                    <el-radio
                        v-for="(option, radioIndex) in options[item.optionCode]"
                        :key="option.value"
                        :label="option.value">
                        {{ option.label }}
                    </el-radio>
                </el-radio-group>
                <!-- 选择器 -->
                <el-select
                    v-else-if="item.type === 'select'"
                    v-model="data[item.code]"
                    :placeholder="item.placeholder || '请选择'">
                    <el-option
                        v-for="(option, optionsIndex) in options[item.optionCode]"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value">
                    </el-option>
                </el-select>
                <!-- date选择 -->
                <el-date-picker
                    v-else-if="item.type === 'date'"
                    v-model="data[item.code]"
                    type="date"
                    :placeholder="item.placeholder || '请选择'">
                </el-date-picker>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'edit-form',
    props: {
        config: Object,
        data: Object,
        options: Object
    }
};
</script>
