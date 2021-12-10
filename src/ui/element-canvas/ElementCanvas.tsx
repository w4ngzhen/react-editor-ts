import React, {DragEvent} from "react";
import DragDataManager from "../../manager/DragDataManager";
import ComponentDefine, {componentTagToComponentDefine} from "../../core/ComponentDefine";
import ComponentDefineRenderer from "../../core/ComponentDefineRenderer";
import extend from "extend";
import _ from 'lodash';
import DataUtils from "../../utils/DataUtils";

interface ElementCanvasProps {
}

interface ElementCanvasState {
    componentDefineList: ComponentDefine[]
}

export default class ElementCanvas
    extends React.Component<ElementCanvasProps, ElementCanvasState> {

    /**
     *
     * @type {null}
     */
    _eleCanvasRef: React.RefObject<any>

    _renderer: ComponentDefineRenderer

    /**
     * 构造函数
     * @param props
     * @param context
     */
    constructor(props: any, context: any) {
        super(props, context);
        this._eleCanvasRef = React.createRef();
        this._renderer = new ComponentDefineRenderer();
        this.state = {
            componentDefineList: [{
                type: 'panel',
                name: 'Panel',
                width: '',
                height: '',
                children: [{
                    type: 'button',
                    name: 'Button',
                    width: '100%',
                    height: '100%',
                }, {
                    type: 'panel',
                    name: 'Button',
                    width: '300px',
                    height: '150px',
                    children: [
                        {
                            type: 'button',
                            name: 'Button',
                            width: '100%',
                            height: '100%',
                        }
                    ]
                }]
            }],
        };
    }

    dragOver(e: DragEvent<HTMLDivElement>) {
        // let {current: divDomEle} = this._eleCanvasRef;
        // let {x, y} = HtmlUtils.getMousePositionInHtmlElement(e, divDomEle);
        // e.preventDefault();
    }

    dragEnter(e: DragEvent<HTMLElement>) {
        let draggedTag = DragDataManager.getData();
        if (!draggedTag) {
            return;
        }

        // 将对应的componentTag转换为ComponentDefine
        let componentDefine = componentTagToComponentDefine(draggedTag);
        if (!componentDefine) {
            return;
        }
        componentDefine.virtualElement = true; // DragEnter都是在拖动，处于临时状态

        let target = e.target as HTMLElement;
        if (!target) {
            console.debug('非HTML元素，不处理');
            return;
        }

        console.debug('进入元素：', target);
        let dataKey = target.getAttribute('data-key');
        if (!dataKey) {
            console.debug('dataKey为空')
            return;
        }
        // '/root/panel_0/button_0' => ['root', 'panel_0', 'button_0']
        let pathList = dataKey.split('/').filter(s => s !== '');

        if (pathList.length === 0) {
            return;
        }
        let lastPath = pathList[pathList.length - 1];

        console.debug('拖动元素进入：', lastPath);

        if (lastPath === 'root') {
            console.debug('拖动元素进入根页面');
            // 加入到根页面中
            this.setState((prevState) => {
                // 深拷贝
                let nextState = extend(true, {}, prevState);
                nextState.componentDefineList.push(componentDefine);
                return nextState;
            })
            return;
        }

        this.setState((prevState) => {
            // 深拷贝
            let nextState = extend(true, {}, prevState);
            let tailPathList = [...pathList].slice(1); // 移除首位的root
            console.log(tailPathList);
            let targetComponentDef =
                DataUtils.getChildComponentDefine(nextState.componentDefineList, tailPathList);
            if (targetComponentDef && targetComponentDef.type === 'panel') {
                // 对应路径有元素，且是panel，才能具备容器放置新的元素
                targetComponentDef.children = targetComponentDef.children || [];
                targetComponentDef.children.push(componentDefine)
            }
            return nextState;
        })
    }

    dragLeave(e: DragEvent<HTMLDivElement>) {

        let target = e.target as HTMLElement;
        if (!target) {
            console.debug('非HTML元素，不处理');
            return;
        }
        console.debug('离开元素：', target);
        let dataKey = target.getAttribute('data-key');
        if (!dataKey) {
            console.debug('dataKey为空')
            return;
        }
        // '/root/panel_0/button_0' => ['root', 'panel_0', 'button_0']
        let pathList = dataKey.split('/').filter(s => s !== '');
        if (pathList.length === 0) {
            return;
        }
        let lastPath = pathList[pathList.length - 1];

        if (lastPath === 'root') {
            console.debug('拖动元素离开根页面');
            // 加入到根页面中
            this.setState((prevState) => {
                // 深拷贝
                let nextState = extend(true, {}, prevState);
                // 移除temp的元素
                let tempIdx = nextState.componentDefineList.findIndex(def => def.virtualElement);
                if (tempIdx >= 0) {
                    nextState.componentDefineList.splice(tempIdx, 1);
                }
                return nextState;
            })
            return;
        }

        this.setState((prevState) => {
            // 深拷贝
            let nextState = extend(true, {}, prevState);
            let tailPathList = [...pathList].slice(1); // 移除首位的root
            console.log(tailPathList);
            let targetComponentDef =
                DataUtils.getChildComponentDefine(nextState.componentDefineList, tailPathList);
            if (targetComponentDef && targetComponentDef.children) {
                // 对应路径有元素，且是panel，才能具备容器放置新的元素
                let tempIdx = targetComponentDef.children.findIndex(def => def.virtualElement);
                if (tempIdx >= 0) {
                    targetComponentDef.children.splice(tempIdx, 1);
                }
            }
            return nextState;
        })
    }

    dragDrop(e: DragEvent<HTMLDivElement>) {
        // this.setState((prevState, props) => {
        //     let nextList = [...prevState.componentTagInfoList].map(item => ({...item}));
        //     let exploringItem = nextList.find(item => item.exploring);
        //     if (exploringItem) {
        //         exploringItem.exploring = false;
        //     }
        //     return {
        //         componentTagInfoList: nextList
        //     };
        // });
    }

    render() {
        let rootPath = '/root';
        return (
            <div style={{width: '100%', height: '100%'}}
                 data-key={rootPath} // 根节点
                 ref={this._eleCanvasRef}
                 onDragEnter={e => this.dragEnter(e)}
                 onDragOver={e => this.dragOver(e)}
                 onDragLeave={e => this.dragLeave(e)}
                 onDrop={e => this.dragDrop(e)}
            >
                {this._renderer.renderDefineList(this.state.componentDefineList, rootPath)}
            </div>
        );
    }
}

