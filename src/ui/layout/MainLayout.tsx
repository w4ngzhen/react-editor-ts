import React, {ReactElement} from "react";
import './main-layout.css';

interface MainLayoutProps {
    headerSlot: ReactElement | any,
    leftSideSlot: ReactElement | any,
    rightSideSlot: ReactElement | any,
    contentSlot: ReactElement | any,
}

export default class MainLayout extends React.Component<MainLayoutProps, never> {
    render() {
        let {headerSlot, leftSideSlot, rightSideSlot, contentSlot} = this.props;
        return (
            <div className={'main-layout'}>
                <div className={'main-layout-header'}>
                    {headerSlot}
                </div>
                <div className={'main-layout-body'}>
                    <div className={'main-layout-left-side'}>
                        {leftSideSlot}
                    </div>
                    <div className={'main-layout-content'}>
                        {contentSlot}
                    </div>
                    <div className={'main-layout-right-side'}>
                        {rightSideSlot}
                    </div>
                </div>
            </div>
        );
    }
}
