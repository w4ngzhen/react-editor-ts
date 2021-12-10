import ComponentTag from "../component-tag/ComponentTag";

export default class DragDataManager {

    private static data: ComponentTag | undefined

    static setData(data: ComponentTag | undefined) {
        DragDataManager.data = data;
    }

    static getData() {
        return DragDataManager.data;
    }
}
