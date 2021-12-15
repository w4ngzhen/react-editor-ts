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
    rootComponentDefine: ComponentDefine
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
            rootComponentDefine: {
                type: 'page',
                name: 'Page',
                width: '',
                height: '',
                children: [{
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
                }]
            }
        };
    }

    dragOver(e: DragEvent<HTMLDivElement>) {

    }

    dragEnter(e: DragEvent<HTMLElement>) {

        let targetEle = e.target;
        console.info('=== 进入元素 ===', targetEle);
        let targetDataVirtual =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-virtual');

        if (targetDataVirtual.toLowerCase() === 'true') {
            // 鼠标本身就进入了虚拟元素，那么不要进行任何的处理
            return;
        }

        // 获取并解析target元素上的data-path，备用
        let targetDataPath =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-path');
        if (_.isEmpty(targetDataPath)) {
            // 进入的是
            return;
        }
        // '/page/panel_0/button_0' => ['page', 'panel_0', 'button_0']
        let pathNodesWithRoot = targetDataPath.split('/').filter(s => s !== '');
        if (pathNodesWithRoot.length === 0) {
            console.warn('targetDataPath为空')
            return;
        }

        // 转换为ComponentDefine后，
        // 准备进行设置
        this.setState(prevState => {

            console.info('=== 设置新元素，进行setState ===');

            // 深拷贝
            let nextState = extend(true, {}, prevState);
            let {rootComponentDefine} = nextState;

            // 将新的虚拟元素设置到rootComponentDefine目的位置
            console.info('=== 设置虚拟元素 === ');
            this.setVirtualComponentDefine(rootComponentDefine, pathNodesWithRoot);
            console.info('=== 完成虚拟元素设置操作 ===');

            return nextState;
        })
    }

    dragLeave(e: DragEvent<HTMLDivElement>) {

        this.setState(prevState => {

            // 深拷贝
            let nextState = extend(true, {}, prevState);
            let {rootComponentDefine} = nextState;

            let targetEle = e.target;

            let targetDataPath =
                HtmlUtils.getHtmlElementAttrData(targetEle, 'data-path');
            if (_.isEmpty(targetDataPath)) {
                // 不是从具备data-path的元素leave，通常是包裹root的外层div
                // 那么无需处理
                return nextState;
            }

            let relatedTargetDataVirtual =
                HtmlUtils.getHtmlElementAttrData(e.relatedTarget, 'data-virtual');
            if ('true' === relatedTargetDataVirtual.toLowerCase()) {
                // 历来的
                return nextState;
            }


            let pathNodesWithRoot = targetDataPath.split('/').filter(path => path !== '');

            this.removeVirtualComponentDefineByPath(rootComponentDefine, pathNodesWithRoot);

            return nextState;
        });
    }

    dragDrop(e: DragEvent<HTMLDivElement>) {
    }

    removeVirtualComponentDefineByPath(
        rootComponentDefine: ComponentDefine,
        pathNodesWithRoot: string[]): void {

        let parentComponentDef;
        if (pathNodesWithRoot.length === 1) {
            // 就是从根节点元素中leave，那么父级就是root
            parentComponentDef = rootComponentDefine;
        } else {
            let [, ...childrenPathNodes] = pathNodesWithRoot;
            let pathComponentDefines =
                DataUtils.getDescendantComponentDefineListByPathNodes(
                    rootComponentDefine, childrenPathNodes, true);
            // 从最后一个元素中找到虚拟子元素
            parentComponentDef = pathComponentDefines[pathComponentDefines.length - 1];
        }

        // 移除
        parentComponentDef.children = parentComponentDef.children || [];
        let idx = parentComponentDef.children.findIndex(def => !!def.virtualElement);
        if (idx >= 0) {
            parentComponentDef.children.splice(idx, 1);
        }
    }

    setVirtualComponentDefine(
        rootComponentDefine: ComponentDefine,
        pathNodesWithRoot: string[]): void {


        // 读取拖拽信息，转化为一个虚拟的ComponentDefine
        let draggedTag = DragDataManager.getData();
        if (!draggedTag) {
            return;
        }
        let componentDefine = componentTagToComponentDefine(draggedTag);
        if (!componentDefine) {
            return;
        }
        // DragEnter都是在拖动，处于虚拟状态
        componentDefine.virtualElement = true;


        // 如果pathNodesWithRoot只有一个：根节点，那么直接添加给根节点的子节点
        if (pathNodesWithRoot.length === 1) {
            console.info('移入根元素，直接添加给根节点的子节点');
            // 因为根节点一定是可容器的节点，所以无需考虑是否是容器
            rootComponentDefine.children = rootComponentDefine.children || [];
            rootComponentDefine.children.push(componentDefine);
            return;
        }

        // 否则，说明将要设置的节点至少是根节点的子节点的子节点
        // pathNodesWithRoot = ['page', 'panel_0', 'button_0']
        // => childPathNodes = ['panel_0', 'button_0']
        let [, ...childPathNodes] = pathNodesWithRoot;
        // 因为函数 getDescendantComponentDefineListByPathNodes 入参pathNodes是指子节点的路径
        // 设置新的虚拟元素
        let descendantList =
            DataUtils.getDescendantComponentDefineListByPathNodes(
                rootComponentDefine, childPathNodes, true);

        console.log('descendantList', descendantList);

        if (descendantList.length > 0) {
            // 具备 至少子元素的子元素 这个条件
            let parentComponentDefine = descendantList[descendantList.length - 1];
            // 检查元素是否是容器元素，不是则不能放置
            if (['page', 'panel'].includes(parentComponentDefine.type)) {
                parentComponentDefine.children = parentComponentDefine.children || [];
                parentComponentDefine.children.push(componentDefine);
            }
        }

    }

    checkIsVirtualElement(targetEle: HTMLElement): boolean {
        let targetDataVirtual =
            HtmlUtils.getHtmlElementAttrData(targetEle, 'data-virtual') || '';
        return 'true' === targetDataVirtual.toLowerCase();
    }

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}
                 onDragEnter={e => this.dragEnter(e)}
                 onDragOver={e => this.dragOver(e)}
                 onDragLeave={e => this.dragLeave(e)}
                 onDrop={e => this.dragDrop(e)}>

                {this._renderer.renderDefine(this.state.rootComponentDefine)}

            </div>
        );
    }
}

