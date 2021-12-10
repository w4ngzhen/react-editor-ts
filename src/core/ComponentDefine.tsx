import ComponentTag from "../component-tag/ComponentTag";

export default interface ComponentDefine {
    type: string,
    name: string,
    virtualElement?: boolean,
    container?: boolean,
    width: string,
    height: string,
    children?: ComponentDefine[]
}

export function componentTagToComponentDefine(src: ComponentTag): ComponentDefine {
    let {label, type} = src;
    let width, height;
    if (type === 'panel') {
        width = '300px';
        height = '200px';
    } else {
        console.debug(`type = ${type}的宽度和高度使用默认`);
        width = '';
        height = '';
    }
    return {
        type: type,
        name: label,
        width: width,
        height: height
    }
}
