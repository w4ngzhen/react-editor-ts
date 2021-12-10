import MainLayout from "./ui/layout/MainLayout";
import {Button} from "antd";
import React from "react";
import _ from 'lodash';
import ElementCanvas from "./ui/element-canvas/ElementCanvas";

import MockUtils from "./utils/MockUtils";
import DragDataManager from "./manager/DragDataManager";

import ComponentTag from "./component-tag/ComponentTag";
import ComponentTagListPanel from "./ui/component-tag-list-panel/ComponentTagListPanel";

interface AppState {
    componentTagList: ComponentTag[]
}

class App extends React.Component<any, AppState> {

    constructor(props: any) {
        super(props);
        this.state = {
            componentTagList: MockUtils.componentTags,
        };
    }

    updateItemList(keyword: string) {
        let filterList: ComponentTag[];
        if (_.isEmpty(keyword)) {
            filterList = [...MockUtils.componentTags];
        } else {
            // 根据关键字查询组件
            filterList = [...MockUtils.componentTags].filter(item => {
                let {label, tag} = item;
                return ((label || "").indexOf(keyword) >= 0) || ((tag || "").indexOf(keyword) >= 0);
            });
        }
        this.setState((prevState, props) => {
            return {
                componentTagList: filterList
            };
        });
    }

    onItemDragStart(e: any, componentTagType: string) {
        let componentTag = this.state.componentTagList.find(tag => tag.type === componentTagType);
        console.debug('开始拖拽，componentTag：', componentTag);
        DragDataManager.setData(componentTag);
    }

    onItemDragEnd(e: any, componentTagType: string) {
        console.debug('取消了拖拽，componentTag type：' + componentTagType);
        DragDataManager.setData(undefined);
    }

    render() {
        return (
            <MainLayout
                headerSlot={
                    (<Button type="primary">hello</Button>)
                }
                leftSideSlot={(
                    <ComponentTagListPanel
                        componentTags={this.state.componentTagList}
                        onKeywordSearchInputChange={keyword => this.updateItemList(keyword)}
                        onComponentTagListItemDragStart={(key, e) => this.onItemDragStart(e, key)}
                        onComponentTagListItemDragEnd={(key, e) => this.onItemDragEnd(e, key)}
                    />
                )}
                rightSideSlot={'hello, right'}
                contentSlot={
                    (<ElementCanvas/>)
                }
            />
        );
    }
}

export default App;
