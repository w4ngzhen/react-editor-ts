import React, {DragEvent} from "react";
import {v4 as uuidV4} from 'uuid';
import _ from 'lodash';
import DragDataManager from "../../manager/DragDataManager";
import HtmlUtils from "../../utils/HtmlUtils";


interface ComponentTagInfo {
    uid: string,
    itemKey: string,
    exploring: boolean,
}

interface ElementCanvasProps {
}

interface ElementCanvasState {
    componentTagInfoList: ComponentTagInfo[]
}

export default class ElementCanvas
    extends React.Component<ElementCanvasProps, ElementCanvasState> {

    /**
     *
     * @type {null}
     */
    _eleCanvasRef: React.RefObject<any>

    /**
     * 构造函数
     * @param props
     * @param context
     */
    constructor(props: any, context: any) {
        super(props, context);
        this._eleCanvasRef = React.createRef();
        this.state = {
            componentTagInfoList: [],
        };
    }

    dragOver(e: DragEvent<HTMLDivElement>) {
        let {current: divDomEle} = this._eleCanvasRef;
        let {x, y} = HtmlUtils.getMousePositionInHtmlElement(e, divDomEle);
        e.preventDefault();
    }

    dragEnter(e: DragEvent<HTMLDivElement>) {
        if (e.target !== e.currentTarget) {
            // 事件对象和EleCanvas(e.currentTarget)不是同一个，
            // 则说明是内部元素冒泡上来的事件，不进行处理
            return;
        }

        let draggedItemKey = DragDataManager.getData();
        if (_.isEmpty(draggedItemKey)) {
            return;
        }

        this.setState((prevState, props) => {
            let nextList = [...prevState.componentTagInfoList].map(item => ({...item}));
            // 移除exploring的item
            let idx = nextList.findIndex(item => item.exploring);
            if (idx >= 0) {
                nextList.splice(idx, 1);
            }
            let itemKeyState = {
                uid: uuidV4(),
                itemKey: draggedItemKey,
                exploring: true,
            };
            nextList.push(itemKeyState);
            return {
                componentTagInfoList: nextList
            };
        });
    }

    dragLeave(e: DragEvent<HTMLDivElement>) {

        if (e.target !== e.currentTarget) {
            // 事件对象和EleCanvas(e.currentTarget)不是同一个，
            // 则说明是内部元素冒泡上来的事件，不进行处理
            return;
        }

        // 是当前EleCanvas触发的事件，但是需要考虑是否可能是进入exploring的元素进而造成的leave事件
        // 如果是的话，也不能进行后面的移除操作
        // 因为移除div后，又会触发Enter事件，添加div，因为鼠标还在div里面，又会触发leave事件，如此循环
        let relatedTarget = e.relatedTarget as HTMLDivElement;
        if (relatedTarget) {
            let attribute = relatedTarget.getAttribute('data-exploring');
            console.debug('data-exploring: ' + attribute);
            if (attribute) {
                return;
            }
        }

        this.setState((prevState, props) => {
            let nextList = [...prevState.componentTagInfoList].map(item => ({...item}));
            let exploringIdx = nextList.findIndex(item => item.exploring);
            if (exploringIdx >= 0) {
                console.log(exploringIdx);
                nextList.splice(exploringIdx, 1);
            }
            return {
                componentTagInfoList: nextList
            };
        });
    }

    dragDrop(e: DragEvent<HTMLDivElement>) {
        this.setState((prevState, props) => {
            let nextList = [...prevState.componentTagInfoList].map(item => ({...item}));
            let exploringItem = nextList.find(item => item.exploring);
            if (exploringItem) {
                exploringItem.exploring = false;
            }
            return {
                componentTagInfoList: nextList
            };
        });
    }

    render() {
        let {
            componentTagInfoList
        } = this.state;
        return (
            <div style={{width: '100%', height: '100%'}}
                 ref={this._eleCanvasRef}
                 onDragEnter={e => this.dragEnter(e)}
                 onDragOver={e => this.dragOver(e)}
                 onDragLeave={e => this.dragLeave(e)}
                 onDrop={e => this.dragDrop(e)}
            >
                {componentTagInfoList.map(info => {
                    let line = info.exploring ? 'dashed' : 'solid';
                    let exploring = info.exploring ? 'true' : 'false';
                    const style = {
                        border: `1px ${line} #000`,
                        width: '80px',
                        height: '40px',
                        marginBottom: '5px'
                    };
                    return (
                        <div
                            key={info.uid}
                            data-exploring={exploring}
                            style={style}>
                        </div>
                    );
                })}
            </div>
        );
    }
}

