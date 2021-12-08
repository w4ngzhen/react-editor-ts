import React, {DragEvent} from "react";
import * as Icon from "@ant-design/icons";
import {InfoCircleOutlined} from "@ant-design/icons";

interface ComponentTagListItemProps {
    icon: string,
    label: string,
    onDragStart: (e: DragEvent<HTMLDivElement>) => void | undefined,
    onDragEnd: (e: DragEvent<HTMLDivElement>) => void | undefined,
}

const ComponentTagListItem = (props: ComponentTagListItemProps) => {

    let {icon, label} = props;
    // @ts-ignore
    // todo
    let iconElement = Icon[icon];
    let iconComp = iconElement ? React.createElement(iconElement) : null;

    return (
        <div className={'component-tag-list-item'}
             draggable
             onDragStart={e => props.onDragStart ? props.onDragStart(e) : {}}
             onDragEnd={e => props.onDragEnd ? props.onDragEnd(e) : {}}
        >
            <div className={'component-tag-list-item__icon'}>
                {iconComp}
            </div>
            <div className={'component-tag-list-item__label'}>
                <p>{label}</p>
            </div>
            <div className={'component-tag-list-item_info'}>
                <InfoCircleOutlined onClick={() => console.log('click icon')}/>
            </div>
        </div>
    );
};

export default ComponentTagListItem;
