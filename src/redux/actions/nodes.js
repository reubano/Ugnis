export const ADD_CHILD = 'ADD_CHILD'
export const FOCUS_NODE = 'FOCUS_NODE'
export const TEXT_CHANGE = 'TEXT_CHANGE'

const generateRandomId = ()=>{
    var S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function onAddChild(boxType) {
    return (dispatch, getState)=> {
        dispatch({type: ADD_CHILD, boxType, randomId: generateRandomId(), randomColor: generateRandomColor(), selectedNodeId: getState().ui.selectedNodeId})
    }
}

export function focusNode(id) {
    return (dispatch, getState)=> {
        dispatch({type: FOCUS_NODE, id})
    }
}
export function onTextChange(text) {
    return (dispatch, getState)=> {
        dispatch({type: TEXT_CHANGE, text, selectedNodeId: getState().ui.selectedNodeId})
    }
}