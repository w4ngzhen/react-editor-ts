import React, {DragEvent} from "react";
import DragDataManager from "../../manager/DragDataManager";
import ComponentDefine, {componentTagToComponentDefine} from "../../core/ComponentDefine";
import ComponentDefineRenderer from "../../core/ComponentDefineRenderer";
import extend from "extend";
import _ from 'lodash';
import DataUtils from "../../utils/DataUtils";
import HtmlUtils from "../../utils/HtmlUtils";

interface ElementCanvasProps {
}

interface ElementCanvasState {
    componentDefineList: ComponentDefine[]
}

export default class ElementCanvas
    extends React.Component<ElementCanvasProps, ElementCanvasState> {

    _renderer: ComponentDefineRenderer

    /**
     * 构造函数
     * @param props
     * @param context
     */
    constructor(props: any, context: any) {
        super(props, context);
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

    }

    dragEnter(e: DragEvent<HTMLElement>) {

        // 检测对应target和relatedTarget是否有一个是virtual的，如果是的话，就不需要处理
        // todo 说明原因

        let targetEle = e.target;
        let relatedTarget = e.relatedTarget;
        console.debug('进入元素：', targetEle);
        console.debug('离开元素：', relatedTarget);

        let targetDataVirtual =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-virtual');
        let relateTargetDataVirtual =
            HtmlUtils.getHtmlElementAttrData(relatedTarget, 'data-virtual');
        if ([targetDataVirtual, relateTargetDataVirtual].includes('true')) {
            return;
        }

        let targetDataPath =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-path');
        if (_.isEmpty(targetDataPath)) {
            console.warn('targetDataPath为空')
            return;
        }
        // '/root/panel_0/button_0' => ['root', 'panel_0', 'button_0']
        let pathList = targetDataPath.split('/').filter(s => s !== '');
        if (pathList.length === 0) {
            console.warn('targetDataPath为空')
            return;
        }
        let lastPath = pathList[pathList.length - 1];

        // 将拖拽的信息，转化为ComponentDefine
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

        // 转换为ComponentDefine后，准备进行设置
        this.setState(prevState => {

            // 深拷贝
            let nextState = extend(true, {}, prevState);

            if (lastPath === 'root') {
                console.debug('拖动元素进入根页面');
                nextState.componentDefineList.push(componentDefine);
                return nextState;
            }

            console.debug('进入非根页面');
            let [, ...tailPathList] = pathList; // 取 除开第一个元素的 剩下尾部
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

        // 检测对应target和relatedTarget是否有一个是virtual的，如果是的话，就不需要处理
        // todo 说明原因

        let targetEle = e.target;
        let relatedTarget = e.relatedTarget;
        console.debug('离开元素：', targetEle);
        console.debug('进入元素：', relatedTarget);

        let targetDataVirtual =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-virtual');
        let relateTargetDataVirtual =
            HtmlUtils.getHtmlElementAttrData(relatedTarget, 'data-virtual');
        if ([targetDataVirtual, relateTargetDataVirtual].includes('true')) {
            return;
        }

        let targetDataPath =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-path');
        if (_.isEmpty(targetDataPath)) {
            console.warn('targetDataPath为空')
            return;
        }
        // '/root/panel_0/button_0' => ['root', 'panel_0', 'button_0']
        let targetPathList = targetDataPath.split('/').filter(s => s !== '');
        if (targetPathList.length === 0) {
            console.warn('targetDataPath为空')
            return;
        }
        let targetPastPath = targetPathList[targetPathList.length - 1];

        // 找到对应的元素以后，只需要设置对应的元素里面的virtual为false

        this.setState(prevState => {

            // 深拷贝
            let nextState = extend(true, {}, prevState);

            // 离开的元素是root根页面
            if (targetPastPath === 'root') {
                // 移除temp的元素
                let tempIdx =
                    nextState.componentDefineList.findIndex(def => def.virtualElement);
                if (tempIdx >= 0) {
                    nextState.componentDefineList.splice(tempIdx, 1);
                }
                return nextState;
            }

            // 离开的元素非根页面元素
            let [, ...tailPathList] = targetPathList; // 取 除开第一个元素的 剩下尾部
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

    }

    render() {
        let rootDataPath = '/root';
        return (
            <div style={{width: '100%', height: '100%'}}

                 data-path={rootDataPath} // 根节点

                 onDragEnter={e => this.dragEnter(e)}
                 onDragOver={e => this.dragOver(e)}
                 onDragLeave={e => this.dragLeave(e)}
                 onDrop={e => this.dragDrop(e)}
            >
                {this._renderer.renderDefineList(this.state.componentDefineList, rootDataPath)}
            </div>
        );
    }
}

