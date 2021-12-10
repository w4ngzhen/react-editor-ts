import ComponentDefine from "./ComponentDefine";
import {ReactElement} from "react";
import extend from 'extend';
import _ from 'lodash';

export default class ComponentDefineRenderer {

    renderDefine(define: ComponentDefine): ReactElement | undefined {
        return this.renderDefineInner(define, '/' + define.type);
    }

    private renderDefineInner(define: ComponentDefine, path: string): ReactElement | undefined {
        if (!define) {
            return undefined;
        }

        let commonStyle = {
            border: `1px ${define.virtualElement ? 'dashed' : 'solid'} #000`,
            borderRadius: '3px',
            width: define.width,
            height: define.height
        }

        let currentKey = path;

        if (define.type === 'button') {
            return (
                <button
                    key={currentKey}
                    data-key={currentKey} // 需要在元素上也把key记录下来
                    style={commonStyle}>
                    这是一个button
                </button>
            )
        }
        if (define.type === 'panel') {

            let childrenEle: ReactElement[] = [];

            if (define.children && define.children.length > 0) {
                define.children.forEach((childDef, idx) => {
                    let nextPath = `${path}/${childDef.type}_${idx}`
                    let childEle = this.renderDefineInner(childDef, nextPath);
                    if (childEle) {
                        childrenEle.push(childEle);
                    }
                })
            }

            let divStyle = {
                // width: '100%',
                // height: '100%',
                padding: '10px'
            };
            extend(divStyle, commonStyle);
            return (
                <div
                    key={currentKey}
                    data-key={currentKey}
                    style={divStyle}>
                    {childrenEle}
                </div>
            )
        }
    }

    renderDefineList(defineList: ComponentDefine[], rootPath: string): ReactElement[] | undefined {
        if (_.isEmpty(rootPath)) {
            return undefined;
        }
        let list: ReactElement[] = [];
        defineList.forEach((def, idx) => {
            let path = rootPath + '/' + def.type + '_' + idx;
            console.debug('path', path);
            let reactEle = this.renderDefineInner(def, rootPath + '/' + def.type + '_' + idx);
            if (reactEle) {
                list.push(reactEle);
            }
        })
        return list;
    }
}
