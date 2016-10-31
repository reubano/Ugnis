//TODO remove snabbdom
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

export const component = (definition, defaultState) => {
    const {rootNode, nodes, styles, state, actions, mutators} = definition
    let currentState = Object.keys(state).reduce((acc, val)=> {
        acc[val] = state[val].defaultValue;
        return acc
    }, {})
    if(defaultState){
        currentState = Object.assign(currentState, defaultState)
    }
    // global state for resolver
    let currentEvent = null
    let actionData = null
    let currentMapValue = {}
    let currentMapIndex = {}
    let currentRepeaters = {}
    const resolve = (def)=> {
        if (def === undefined) {
            return;
        }
        // static value
        if (def._type === undefined) {
            return def;
        }
        if (def._type === 'vNode') {
            return toNode(def);
        }
        if (def._type === 'conditional') {
            return resolve(def.statement) ? resolve(def.then) : resolve(def.else)
        }
        if (def._type === 'equals') {
            return resolve(def.first) === resolve(def.second)
        }
        if (def._type === 'sum') {
            return resolve(def.first) + resolve(def.second)
        }
        if (def._type === 'ifExists') {
            return resolve(def.data)[resolve(def.key)] || resolve(def.else)
        }
        if (def._type === 'length') {
            return resolve(def.value).length
        }
        if (def._type === 'filter') {
            const data = resolve(def.data).filter((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return resolve(def.filter)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'list') {
            const data = resolve(def.data).map((value, index)=> {
                currentMapValue[def.identifier] = value
                currentMapIndex[def.identifier] = index
                return resolve(def.list)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'listObj') {
            const mapData = resolve(def.data)
            const data = Object.keys(mapData).map((index)=> {
                currentMapValue[def.identifier] = mapData[index]
                currentMapIndex[def.identifier] = index
                return resolve(def.list)
            })
            delete currentMapValue[def.identifier]
            delete currentMapIndex[def.identifier]
            return data
        }
        if (def._type === 'repeater') {
            currentRepeaters[def.identifier] = def.value
            currentMapValue[def.identifier] = resolve(def.data)
            const data = resolve(def.value)
            delete currentRepeaters[def.identifier]
            delete currentMapValue[def.identifier]
            return data
        }
        if (def._type === 'repeat') {
            // I should really stop using global state,
            // it would be embarrassing if anyone ever asked why didn't I just pass data through every resolve
            // good thing no one is ever going to read this code
            const previous = currentMapValue[def.identifier]
            currentMapValue[def.identifier] = resolve(def.data)
            const data = resolve(currentRepeaters[def.identifier])
            currentMapValue[def.identifier] = previous
            return data
        }
        if (def._type === 'actionName') {
            return {actionName: def.actionName, data: resolve(def.data)}
        }
        if (def._type === 'listValue') {
            return currentMapValue[def.value]
        }
        if (def._type === 'listIndex') {
            return currentMapIndex[def.value]
        }
        if (def._type === 'string') {
            return def.value
        }
        if (def._type === 'boolean') {
            return def.value
        }
        if (def._type === 'not') {
            return !resolve(def.value)
        }
        if (def._type === 'number') {
            return def.value
        }
        if (def._type === 'array') {
            return def.value
        }
        if (def._type === 'push') {
            return resolve(def.data).concat(resolve(def.value))
        }
        if (def._type === 'object') {
            return Object.keys(def.value).reduce((acc, val)=> {
                acc[val] = resolve(def.value[val]);
                return acc
            }, {})
        }
        if (def._type === 'merge') { // maybe call it "set" but it would actually be an immutable merge?
            return Object.assign({}, resolve(def.first), resolve(def.second))
        }
        if (def._type === 'set') { // why not both?
            return Object.assign({}, resolve(def.data), {[resolve(def.name)]: resolve(def.value)})
        }
        if (def._type === 'objectValue') {
            return resolve(def.object)[resolve(def.value)]
        }
        if (def._type === 'state') {
            return currentState[def.value]
        }
        if (def._type === 'actionData') {
            return actionData
        }
        if (def._type === 'actionData') {
            return actionData
        }
        if (def._type === 'eventValue') {
            return currentEvent.target.value
        }
        throw Error(def._type)
    }
    
    function toNode(node) {
        if (node === undefined) {
            return; // noop
        }
        let sel = node.nodeType === 'box' ? 'div'
            : node.nodeType === 'text' ? 'span'
            : node.nodeType === 'input' ? 'input'
            : 'error'
        let children;
        if (node.childrenIds) {
            children = []
            for (let i = 0; i < node.childrenIds.length; i++) {
                const child = resolve(nodes[node.childrenIds[i]])
                if(child === undefined){
                    continue
                }
                //flatten (let's hope no one is imitating array with object)
                if (child.constructor === Array) {
                    for (let j = 0; j < child.length; j++) {
                        children.push(child[j])
                    }
                } else {
                    children.push(child)
                }
            }
        }
        const on = {
            click: node.onClick ? [onClick, node.onClick.actionName, resolve(node.onClick.data), node] : undefined,
            change: node.onChange ? [emitAction, node.onChange.actionName, resolve(node.onChange.data)] : undefined,
            input: node.onInput ? [emitAction, node.onInput.actionName, resolve(node.onInput.data)] : undefined,
            keydown: node.onEnter ? [onEnter, node.onEnter.actionName, resolve(node.onEnter.data)] : undefined
        }
        const data = {
            style: node.styleId ? resolve(styles[node.styleId]) : undefined,
            on,
            props: node.nodeType === 'input' ? {
                value: resolve(node.value),
                placeholder: node.placeholder
            } : undefined,
        }
        const text = node.nodeType === 'text' ? node.value && resolve(node.value) : undefined
        
        return {sel, data, children, text}
    }
    
    function onClick(actionName, data, node, e) {
        emitAction(actionName, data, e)
    }
    
    function onEnter(actionName, data, e) {
        if (e.keyCode == 13) {
            emitAction(actionName, data, e)
        }
    }
    
    const listeners = [];
    
    function addListener(callback) {
        const length = listeners.push(callback)
        
        // for unsubscribing
        return () => listeners.splice(length - 1, 1)
    }
    
    function emitAction(actionName, data, e) {
        currentEvent = e
        actionData = data
        let mutations = {};
        if(actions[actionName]){
            actions[actionName].forEach((key)=> {
                mutations[key] = resolve(mutators[state[key].mutators[actionName]])
            })
            currentState = Object.assign({}, currentState, mutations)
        }
        console.log(actionData)
        console.log(mutations)
        currentEvent = null
        actionData = null
        listeners.forEach(callback => callback(actionName, data, e, currentState, mutations))
        if(Object.keys(mutations).length){
            render()
        }
    }
    
    let vdom = resolve(nodes[rootNode])
    
    function render() {
        const newvdom = resolve(nodes[rootNode])
        patch(vdom, newvdom)
        vdom = newvdom
    }
    
    return {
        definition,
        vdom,
        currentState,
        render,
        emitAction,
        addListener,
    };
}

export default (node, definition, defaultState) => {
    const app = component(definition, defaultState);
    patch(node, app.vdom)
    return app
}