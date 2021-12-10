export default class ComponentCategory {

    static CATEGORY_BUTTON = 'BUTTON'

    static CATEGORY_CONTAINER = 'CONTAINER'

    static CATEGORY_FUNCTION = 'FUNCTION'

    static CATEGORY_DISPLAY = 'DISPLAY'

    static CATEGORY_CUSTOM = 'CUSTOM'

    static getDict() {
        let dict: { [index: string]: string } = {};
        dict[ComponentCategory.CATEGORY_BUTTON] = '按钮';
        dict[ComponentCategory.CATEGORY_CONTAINER] = '容器';
        dict[ComponentCategory.CATEGORY_FUNCTION] = '功能';
        dict[ComponentCategory.CATEGORY_DISPLAY] = '显示';
        dict[ComponentCategory.CATEGORY_CUSTOM] = '自定义';
        return dict;
    }

    static translate(key: string) {
        return ComponentCategory.getDict()[key] || '未知分类';
    }

}
