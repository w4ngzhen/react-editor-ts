import ComponentDefine from "../core/ComponentDefine";

export default class DataUtils {

    static getChildComponentDefine(
        children: ComponentDefine[] | undefined,
        pathList: string[]): ComponentDefine | undefined {

        if (!children) {
            return;
        }

        if (pathList.length === 0) {
            return;
        }

        if (pathList.length === 1) {
            return DataUtils.getComponentDefineFromList(children, pathList[0]);
        }

        let [headPath, ...tailPath] = pathList;
        let headComponentDef = DataUtils.getComponentDefineFromList(children, headPath);
        if (!headComponentDef) {
            return;
        }

        return DataUtils.getChildComponentDefine(headComponentDef.children, tailPath);
    }

    /**
     * pathNode = 'panel_0' 意味着从ComponentDefine数组中，找到idx = 0，同时type为panel的ComponentDef
     * @param children ComponentDefine数组
     * @param pathNode 形如 '/root/panel_0' 中的 'panel_0'
     */
    static getComponentDefineFromList(
        children: ComponentDefine[] | undefined,
        pathNode: string | undefined): ComponentDefine | undefined {
        if (!children || !pathNode) {
            return;
        }
        let [type, idxStr] = pathNode.split('_');
        let idx = parseInt(idxStr);
        if (isNaN(idx)) {
            console.warn('无法将字符串转换为number，idxStr：' + idxStr);
            return;
        }
        let componentDefine = children[idx];
        if (!componentDefine) {
            console.warn('无法查找对应的位置的Define')
            return;
        }

        if (componentDefine.type !== type) {
            console.warn('ComponentDefine type无法对应当前path节点', componentDefine.type, type);
            return;
        }

        return componentDefine;
    }
}
