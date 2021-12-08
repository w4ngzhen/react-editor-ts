import ComponentTag from "../component-tag/ComponentTag";
import ComponentCategoryDict from "../core/ComponentCategory";

const randomIcon = [
    'UpCircleOutlined',
    'PlayCircleOutlined',
    'QuestionCircleOutlined',
    'FormOutlined',
    'PieChartOutlined',
    'AppleOutlined',
    'GooglePlusOutlined'
];

export default class MockUtils {

    static componentTags: ComponentTag[] = MockUtils.getSomeComponentTags(20)

    private static getSomeComponentTags(count: number): ComponentTag[] {
        let itemList: ComponentTag[] = [];
        for (let idx = 0; idx < count; idx++) {
            let randomNum = Math.round(Math.random() * 100);
            let iconIdx = randomNum % randomIcon.length;
            let categoryIdx = (randomNum % Object.keys(ComponentCategoryDict.dict).length); // 允许没有值
            itemList.push({
                type: idx.toString(),
                icon: randomIcon[iconIdx],
                label: '组件表示名称' + idx,
                category: Object.keys(ComponentCategoryDict.dict)[categoryIdx],
                tag: '',
            });
        }
        return itemList;
    }
}
