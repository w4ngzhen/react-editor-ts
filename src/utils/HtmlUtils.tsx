import {MouseEvent} from 'react'

export default class HtmlUtils {

    /**
     * 工具函数
     * @param event
     * @param htmlEle
     * @returns {{x: number, y: number}}
     */
    static getMousePositionInHtmlElement = (event: MouseEvent<any>, htmlEle: HTMLElement) => {
        // 移动事件对象，从中解构clientX和clientY
        let {clientX, clientY} = event;
        // 解构canvas的boundingClientRect中的left和top
        let {left, top} = htmlEle.getBoundingClientRect();
        // 计算得到鼠标在canvas上的坐标
        return {
            x: clientX - left,
            y: clientY - top
        };
    };
}
