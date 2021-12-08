export default class DragDataManager {

    private static data: any

    static setData(data: any) {
        DragDataManager.data = data;
    }

    static getData() {
        return DragDataManager.data;
    }
}
