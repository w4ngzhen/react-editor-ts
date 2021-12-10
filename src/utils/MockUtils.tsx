import ComponentTag from "../component-tag/ComponentTag";
import ComponentCategory from "../core/ComponentCategory";

const randomIcon = [
    'UpCircleOutlined',
    'PlayCircleOutlined',
    'QuestionCircleOutlined',
    'FormOutlined',
    'PieChartOutlined',
    'AppleOutlined',
    'GooglePlusOutlined'
];

const componentTags: ComponentTag[] = [
    {
        type: 'button',
        icon: 'CheckCircleOutlined',
        label: '按钮',
        category: 'BUTTON',
        tag: '按钮',
    },
    {
        type: 'panel',
        icon: 'BorderOuterOutlined',
        label: '面板',
        category: 'CONTAINER',
        tag: '面板',
    },
];

export default class MockUtils {

    static componentTags: ComponentTag[] = componentTags

    private static getSomeComponentTags(count: number): ComponentTag[] {
        let itemList: ComponentTag[] = [];
        for (let idx = 0; idx < count; idx++) {
            let randomNum = Math.round(Math.random() * 100);
            let iconIdx = randomNum % randomIcon.length;
            let categoryIdx = (randomNum % Object.keys(ComponentCategory.getDict()).length); // 允许没有值
            itemList.push({
                type: idx.toString(),
                icon: randomIcon[iconIdx],
                label: '组件表示名称' + idx,
                category: Object.keys(ComponentCategory.getDict())[categoryIdx],
                tag: '',
            });
        }
        return itemList;
    }
}
