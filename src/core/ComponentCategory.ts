export default class ComponentCategoryDict {
    static dict: {
        [index: string]: string
    } = {
        'BUTTON': '按钮',
        'CONTAINER': '容器',
        'FUNCTION': '功能',
        'DISPLAY': '显示',
        'CUSTOM': '自定义'
    };
    static translate(key: string) {
        return ComponentCategoryDict.dict[key] || '未知分类';
    }
}
