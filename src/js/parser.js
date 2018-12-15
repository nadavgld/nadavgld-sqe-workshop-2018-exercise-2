var _html;
var _container = [];
let line = 0;

const TYPES = {
    FunctionDeclaration: 'function declaration',
    VariableDeclaration: 'variable declaration',
    AssignmentExpression: 'assignment expression',
    WhileStatement: 'while statement',
    ForStatement: 'for statement',
    IfStatement: 'if statement',
    ElseStatement: 'else if statement',
    CallExpression: 'call expression',
    ReturnStatement: 'return statement'
};

function objectToTable(obj) {
    clearTable();
    var body = obj.body;

    // if (body) {
    getBody(body);
    return { line, _container };
    // }
}

function handleFuncDec(obj) {
    var _newLine = {
        line,
        type: TYPES[obj.type],
        name: obj.id.name,
        condition: '',
        value: ''
    };

    _container.push(_newLine);

    if (obj.params.length > 0) {
        obj.params.forEach(param => {
            handleParams(param);
        });
    }
    return _newLine;
}

function handleParams(param) {
    var _newLine = {
        line,
        type: 'variable declaration',
        name: param.name,
        condition: '',
        value: ''
    };

    _container.push(_newLine);

    return _newLine;
}

function handleVarDec(obj) {
    var _newLine;
    obj.declarations.forEach(declare => {
        _newLine = {
            line,
            type: TYPES[obj.type],
            name: declare.id.name,
            condition: '',
            value: declare.init ? recursiveChilds(declare.init) : ''
        };

        _container.push(_newLine);
    });

    return _newLine;
}

function handleAlternate(obj) {
    var _obj = JSON.parse(JSON.stringify(obj.alternate));
    var _newLine;
    const CURRENT_LINE = line + 1;

    _obj.type = _obj.type == 'IfStatement' ? 'ElseStatement' : _obj.type;

    if (_obj.type != 'ElseStatement') {
        _newLine = {
            line: line + 1, type: 'else statement', name: '', value: '', condition: ''
        };

        _container.push(_newLine);
    }
    getBody([_obj]);

    // if (CURRENT_LINE)
    return _container.find(o => o.line == CURRENT_LINE);
}

function handleConsequent(obj) {
    if (obj.consequent.body) {
        getBody(obj.consequent);
    }
    else {
        getBody([obj.consequent]);
    }
}

function handleInnerStates(obj) {
    // if (obj.consequent)
    handleConsequent(obj);

    if (obj.alternate)
        handleAlternate(obj);
}

function handleLoops(obj) {
    const _TEST = obj.test;
    var _newObj = { line, type: TYPES[obj.type], name: '', value: '' }, _cond;
    // if (_TEST) {
    _cond = recursiveChilds(_TEST).toString();
    // _cond = _cond.startsWith('(') ? _cond.substring(1).substring(0, _cond.length - 2).trim() : _cond;
    _cond = _cond.substring(1).substring(0, _cond.length - 2).trim();

    _newObj.condition = _cond;
    _container.push(_newObj);
    // }
    if (obj.type == 'IfStatement' || obj.type == 'ElseStatement') {
        handleInnerStates(obj);
    }
    return _newObj;
}

function init_forHandler(obj) {
    var _res;
    if (obj.init.type == 'VariableDeclaration') {
        _res = handleVarDec(obj.init);
        return obj.init.kind + ' ' + _res.name + ' = ' + _res.value;
        // } else if (obj.init.type == 'AssignmentExpression') {
    } else {
        _res = handleExpression({ expression: obj.init }, true);
        return _res.name + ' = ' + _res.value;
    }
}

function update_forHandler(obj) {
    var _res = '';
    if (obj.update.type == 'AssignmentExpression') {
        var tmp = handleExpression({ expression: obj.update }, true);
        _res = tmp.name + ' = ' + tmp.value;
        // } else if (obj.update.type == 'UpdateExpression') {
    } else {
        _res = '' + obj.update.argument.name + obj.update.operator;
    }

    return _res;
}

function handleForStatement(obj) {
    var init = init_forHandler(obj);
    var test = recursiveChilds(obj.test);
    var update = update_forHandler(obj);

    // test = test.startsWith('(') ? test.substring(1).substring(0, test.length - 2).trim() : test;
    test = test.substring(1).substring(0, test.length - 2).trim();

    _container.push({ line, type: TYPES[obj.type], name: '', value: '', condition: init + ';' + test + ';' + update });

    // if (obj.body)
    if (obj.body.type != 'BlockStatement') {
        getBody([obj.body]);
    }
}

function handleOperator(_newObj, _EXPRESSION, dontPush) {
    _newObj.name = _EXPRESSION.left.name || handleMemberExpression(_EXPRESSION.left);
    var _value = '';

    // if (_EXPRESSION.right) {
    _value = recursiveChilds(_EXPRESSION.right).toString();
    _value = _value.startsWith('(') ? _value.substring(1).substring(0, _value.length - 2).trim() : _value;

    _newObj.value = _value;
    if (!dontPush)
        _container.push(_newObj);
    // }

    return _newObj;
}

function handleExpression(obj, dontPush) {
    const _EXPRESSION = obj.expression;
    var _newObj = { line, type: TYPES[_EXPRESSION.type], condition: '' };

    if (_EXPRESSION.operator == '=') {
        _newObj = handleOperator(_newObj, _EXPRESSION, dontPush);
        // } else if (_EXPRESSION.callee) {
    } else {
        handleCallee(_newObj, _EXPRESSION);
    }
    return _newObj;
}

function handleCallee(_newObj, _EXPRESSION) {
    var _value = recursiveChilds(_EXPRESSION.callee).toString();
    // _value = _value.startsWith('(') ? _value.substring(1).substring(0, _value.length - 2).trim() : _value;

    _newObj.name = _value;
    _newObj.value = '';

    _container.push(_newObj);
}

function handleReturn(obj) {
    var _newObj = {
        line,
        type: TYPES[obj.type],
        name: '',
        condition: ''
    };

    var _val = recursiveChilds(obj.argument).toString();
    _val = _val.startsWith('(') ? _val.substring(1).substring(0, _val.length - 2).trim() : _val;

    _newObj.value = _val;
    _container.push(_newObj);

    return _newObj;
}

function isLoop(obj) {
    return obj.type == 'WhileStatement' || obj.type == 'IfStatement' || obj.type == 'ElseStatement';
}

function typeHandler(obj) {
    if (obj.type == 'FunctionDeclaration') {
        handleFuncDec(obj);
    } else if (obj.type == 'VariableDeclaration') {
        handleVarDec(obj);
    } else
        typeHandler2(obj);
}

function typeHandler2(obj) {
    if (obj.type == 'ExpressionStatement') {
        handleExpression(obj);
    } else if (isLoop(obj)) {
        handleLoops(obj);
    }
    else
        typeHandler3(obj);
}

function typeHandler3(obj) {
    if (obj.type == 'ReturnStatement') {
        handleReturn(obj);
    } else if (obj.type == 'ForStatement')
        handleForStatement(obj);
}

function getBody(_body) {
    if (_body.type == 'BlockStatement') {
        // _container.push({ line, type: 'block statement', name: '', value: '{', condition: '' })
        getBody(_body.body);
        // line++;
        // _container.push({ line, type: 'block statement', name: '', value: '}', condition: '' })
        return;
    }

    for (let index = 0; index < _body.length; index++) {
        line++;
        const obj = _body[index];

        typeHandler(obj);

        if (obj.body) {
            getBody(obj.body);
        }
    }

}

function handleMemberExpression(obj) {
    var prop;
    if (obj.computed) {
        prop = recursiveChilds(obj.property).toString();

        // if(!isNaN(parseInt(prop)))
        //     return prop;

        prop = prop.startsWith('(') ? prop.substring(1).substring(0, prop.length - 2).trim() : prop;
        return '' + obj.object.name + '[' + prop + ']';
    } else {
        // prop = obj.property ? obj.object.name + '.' + obj.property.name : obj.object.name;
        prop = obj.object.name + '.' + obj.property.name;
        return prop;
    }
}

function handleBinaryExpression(obj) {
    // if (obj.left && obj.right)
    return `(  ${recursiveChilds(obj.left)} ${obj.operator} ${recursiveChilds(obj.right)} )`;
    // return '';
}

function recursiveChildsHandler(obj) {
    var res, prop;
    if (obj.type == 'BinaryExpression') {
        res = handleBinaryExpression(obj);
    } else if (obj.type == 'MemberExpression') {
        res = handleMemberExpression(obj);
    } else if (obj.type == 'UnaryExpression') {
        // prop = obj.argument.type == 'Literal' ? obj.argument.value : obj.argument.name;
        prop = obj.argument.value;
        res = '' + obj.operator + prop;
    }

    return res;
}

function recursiveChilds(obj) {
    var res;
    res = recursiveChildsHandler(obj);

    res = obj.type == 'Literal' ? obj.value : obj.type == 'Identifier' ? obj.name : res;
    return res;
}

function printTable() {
    _html = '';
    _container.forEach(obj => {
        // obj.value = obj.value == undefined ? '' : obj.value;
        if (obj.type !== 'block statement')
            _html += `<tr><td>${obj.line}</td><td>${obj.type}</td><td>${obj.name}</td><td>${obj.condition}</td><td>${obj.value}</td></tr>`;
    });

    return _html;
}

function clearTable() {
    _container = [];
    line = 0;
}

module.exports = {
    _html,
    _container,
    line,
    TYPES,
    objectToTable,
    getBody,
    recursiveChilds,
    printTable,
    clearTable,
    handleExpression,
    handleFuncDec,
    handleLoops,
    handleReturn,
    handleVarDec,
    handleParams,
    handleAlternate,
};