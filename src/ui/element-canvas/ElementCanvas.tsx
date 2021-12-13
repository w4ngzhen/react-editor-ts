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

        // 读取拖拽信息，转化为ComponentDefine
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

        // 转换为ComponentDefine后，
        // 准备进行设置
        this.setState(prevState => {

            // 深拷贝
            let nextState = extend(true, {}, prevState);

            let {rootComponentDefine} = nextState;

            // 移除virtual元素
            this.removeVirtualComponentDefine(rootComponentDefine);

            // 准备设置虚拟元素
            // 如果pathNodesWithRoot只有一个：根节点，那么直接添加给根节点的子节点
            if (pathNodesWithRoot.length === 1) {
                // 因为根节点一定是可容器的节点，所以无需考虑是否是容器
                rootComponentDefine.children = rootComponentDefine.children || [];
                rootComponentDefine.children.push(componentDefine);
                return nextState;
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
                let parentComponentDefine = descendantList[descendantList.length - 1];
                // 检查元素是否是容器元素，不是则不能放置
                if (['page', 'panel'].includes(parentComponentDefine.type)) {
                    parentComponentDefine.children = parentComponentDefine.children || [];
                    parentComponentDefine.children.push(componentDefine);
                }
            }

            return nextState;
        })
    }

    dragLeave(e: DragEvent<HTMLDivElement>) {
    }

    dragDrop(e: DragEvent<HTMLDivElement>) {
    }

    removeVirtualComponentDefine(rootComponentDefine: ComponentDefine) {

        console.info('=== ComponentDefine树中的virtual元素 ===')

        // 否则总是先移除ComponentDefine中的虚拟元素节点
        let {pathComponentDefines} =
            DataUtils.getTargetDescendantComponentDefinePathNodes(rootComponentDefine, def => !!def.virtualElement)

        if (pathComponentDefines.length === 0) {
            // 没有对用的虚拟元素
            return;
        }

        let parentComponentDef;
        if (pathComponentDefines.length === 1) {
            // 子路径Path里面只有一个元素，说明 page root ComponentDefine的子元素
            // 从root中的子元素进行移除
            parentComponentDef = rootComponentDefine;
        } else {
            // 否则，说明至少是root的子元素的子元素，倒数第二个则是virtual的父级
            parentComponentDef = pathComponentDefines[pathComponentDefines.length - 2];
        }
        // 移除
        parentComponentDef.children = rootComponentDefine.children || [];
        let idx = parentComponentDef.children.findIndex(def => !!def.virtualElement);
        parentComponentDef.children.splice(idx, 1);
        console.debug('完成移除操作');
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

