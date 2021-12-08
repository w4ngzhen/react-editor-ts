import React, {DragEvent, ReactElement} from "react";
import './index.css'
import _ from "lodash";
import {Input} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import ComponentTag from "../../component-tag/ComponentTag";
import ComponentTagListItem from "./ComponentTagListItem";
import ComponentCategoryDict from "../../core/ComponentCategory";

interface ComponentTagListPanelProps {
    componentTags: ComponentTag[],
    onKeywordSearchInputChange: (keywordSearchInput: string) => void,

    onComponentTagListItemDragStart: (tagType: string, e: DragEvent<HTMLDivElement>) => void | undefined,
    onComponentTagListItemDragEnd: (tagType: string, e: DragEvent<HTMLDivElement>) => void | undefined,
}

export default class ComponentTagListPanel extends React.Component<ComponentTagListPanelProps, any> {

    render() {

        let {componentTags, onKeywordSearchInputChange} = this.props;

        // 首先根据 category 进行分类
        let groupedItems = _.groupBy(componentTags, c => c.category);
        console.debug(groupedItems);
        // 获取对应描述类型列表
        let categoryList = Object.keys(groupedItems);

        let htmlEleList: ReactElement[] = [];
        categoryList.forEach(category => {
            // 设置分组的Title
            let title = (
                <p style={{margin: '5px'}}
                   key={category}>
                    {ComponentCategoryDict.translate(category) || '自定义'}
                </p>
            );
            htmlEleList.push(title);
            // 遍历对应分组添加组件
            let groupedItemListElement = groupedItems[category];
            groupedItemListElement.forEach(item => {
                let tagListItem = (
                    <ComponentTagListItem
                        key={item.type}
                        icon={item.icon}
                        label={item.label}

                        onDragStart={e => {
                            if (this.props.onComponentTagListItemDragStart) {
                                this.props.onComponentTagListItemDragStart(item.type, e)
                            }
                        }}

                        onDragEnd={e => {
                            if (this.props.onComponentTagListItemDragEnd) {
                                this.props.onComponentTagListItemDragEnd(item.type, e)
                            }
                        }}
                    />
                );
                htmlEleList.push(tagListItem);
            });

        });

        return (
            <div
                className={'component-tag-list-panel'}>
                <div className={'component-tag-list-panel__header'}>
                    <Input suffix={<SearchOutlined style={{color: 'rgba(0,0,0,.45)'}}/>}
                           onChange={e => onKeywordSearchInputChange(e.target.value)}
                           placeholder="输入关键字可过滤组件"/>
                </div>
                <div className={'component-tag-list-panel__body'}>
                    {htmlEleList}
                </div>
            </div>
        );
    }
}
