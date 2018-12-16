// Global variables
var var_table = {}, temp_table = {}, symbolize = [], input = [], pred_table, _isGlobal = true;

// On printing symbolized code - replace original code by statement type
const printSymbolReplacement = {
    'return statement': (c, symbol) => c.code.replace(/return.*/, 'return ' + symbol.value + ';'),
    'if statement': (c, symbol) => c.code.replace(/if.*{/, 'if (' + symbol.condition + ') {').toString(),
    'else if statement': (c, symbol) => c.code.replace(/else if.*{/, 'else if (' + symbol.condition + ') {').toString(),
    'assignment expression': (c, symbol) => c.code.replace(/=.*/, '= ' + symbol.value + ';'),
    'while statement': (c, symbol) => c.code.replace(/while.*{/, 'while (' + symbol.condition + ') {').toString(),
};

// Initialize Symbolizer - convert input and handle predicats
// Input - Parser obj result, String of input vector ex: (x=1,y=2..)
function symbolizer(obj, input_vector) {
    _init();
    pred_table = obj;
    convertInput(input_vector);

    pred_table.forEach(pred => {
        handlePreds(pred);
    });

    return symbolize;
}

// Clear Global variables
function _init() {
    _isGlobal = true;
    var_table = {};
    temp_table = {};
    symbolize = [];
    input = [];
    pred_table = null;
}

// First type handler - check the predicat type and handle it
function handlePreds(pred) {
    if (pred.type == 'function declaration'){
        symbolize.push(pred);
        _isGlobal = false;
    }
    else if (pred.type == 'variable declaration') {
        handleVarDecleration(pred);
    }
    else handlePreds2(pred);
}

// Second type handler - check the predicat type and handle it
function handlePreds2(pred) {
    if (pred.type == 'if statement' || pred.type == 'else if statement') {
        var callback = pred.type == 'else if statement' ? handleElse : undefined;
        handleIfStatement(pred, callback);
    } else if (pred.type == 'assignment expression') {
        handleAssignmentExp(pred);
    } else handlePreds3(pred);
}

// Third and last type handler - check the predicat type and handle it
function handlePreds3(pred) {
    if (pred.type == 'return statement') {
        handleReturnStatement(pred);
    } else if (pred.type == 'else statement') {
        var p = handleElse(pred);
        symbolize.push(p);
        // } else if (pred.type == 'while statement') {
    } else {
        handleWhile(pred);
    }
}

// Save temp variable table on block enter
function blockEnter() {
    temp_table = {};
    Object.keys(var_table).forEach(_var => temp_table[_var] = JSON.parse(JSON.stringify(var_table[_var])));
}

// Retrieve previous temp variable table on block exit
function blockExit() {
    Object.keys(temp_table).forEach(_var => var_table[_var] = JSON.parse(JSON.stringify(temp_table[_var])));
    temp_table = {};
}

// Handle return-statement: Convert value, push to symbolize array, exit block
function handleReturnStatement(_pred) {
    var pred = JSON.parse(JSON.stringify(_pred));
    var _convertedValue = convertValueToInputVars(pred.value, false, false);

    _convertedValue = removeZeros(_convertedValue);

    pred.value = _convertedValue;
    symbolize.push(pred);

    blockExit();
}

// Handle Assignmets -  Convert value, push to symbolize array if is Input assign
function handleAssignmentExp(pred) {
    var _convertedValue = convertValueToInputVars(pred.value, true, false);
    var _result = parseInt(convertValueToInputVars(pred.value, true, true));

    if (isInput(pred.name)) {
        pred.value = _result;
        symbolize.push(pred);
    }

    if (isInputArray(pred.name)) {
        setInputArrayValue(pred.name, _result);
        symbolize.push(pred);
    } else {
        _convertedValue = removeZeros(_convertedValue);
        var_table[pred.name] = { value: _convertedValue, result: _result };
    }
}

// Handle variable declaration - Remove bracletes (because of Parser result), Convert value, Evaluate result, update var table
function handleVarDecleration(pred) {
    if (!isParam(pred)) {
        var _value = removeBracelets(pred.value);

        var valueFromDictionary = convertValueToInputVars(_value, false, false);
        var _result = convertValueToInputVars(_value, true, true);

        var_table[pred.name] = { value: valueFromDictionary, result: _result };

        if (_isGlobal){
            input.push({ key: pred.name, value: _result });
            symbolize.push(pred);
        }
    }
}

// Handle If-statements - Enter block(scope), Convert value, Evaluate result, push to symbolize array
// handle Else-if-statements as well, different - by callback, get previous statements result (if - true => else if - false)
function handleIfStatement(_pred, callback) {
    if (callback)
        blockExit();

    blockEnter();
    var pred = JSON.parse(JSON.stringify(_pred));

    var _convertedCondition = convertValueToInputVars(pred.condition, false, false);
    var _result = convertValueToInputVars(pred.condition, true, false);

    pred.condition = _convertedCondition;
    pred.result = _result;

    if (callback)
        pred = callback(pred);

    symbolize.push(pred);
}

// Handle Else-statements - get previous statements result (if - true & else if - false => else - false)
function handleElse(_pred) {
    blockExit();
    var pred = JSON.parse(JSON.stringify(_pred));

    var _result = getPreviousIfResult();

    pred.result = pred.result === undefined ? _result : pred.result && _result;
    return pred;
}

// Handle While-statements - Convert condition, push to symbolize array
function handleWhile(_pred) {
    var pred = JSON.parse(JSON.stringify(_pred));
    var _convertedCondition = convertValueToInputVars(pred.condition, false, true);

    pred.condition = _convertedCondition;
    symbolize.push(pred);
}

// Convert predict input by input variables
// Params: value - predict value, toEval - boolean if to evaluate, notIf - boolean if the predict is if
function convertValueToInputVars(value, toEval) {
    // if (value === undefined) return '';
    if (isNumber(value) || isInputArray(value) || isInput(value))
        return handleQuickReplace(value, toEval);

    // if (isCondition(value))
    return conditionHandler(value, toEval);
}

function handleQuickReplace(value, toEval) {
    if (isNumber(value)) return parseFloat(value);

    if (isInputArray(value)) return handleArrayQuick(value, toEval);

    return handleInputQuick(value, toEval);
}

function handleInputQuick(value, toEval) {
    if (toEval) return eval(var_table[value].value);

    return var_table[value].value;
}

function handleArrayQuick(value, toEval) {
    if (toEval) {
        try {
            return eval(getInputArrayValue(value));
        } catch (e) {
            return getInputArrayValue(value);
        }
    }
    return getInputArrayValue(value);
}

function conditionHandler(value, toEval) {
    // if (value === undefined) return '';
    var _val = value.split(/==|===|!=|!==|[+]|-|[*]|\/|>|<|>=|=>|<=|=<|:|\(|\)/);
    _val.forEach(val => {
        var replacement = conditionTypeHandler(val, toEval);

        replacement = setReplacement(replacement, toEval, val);
        value = replaceAll(value, val.trim(), replacement);
        value = replaceAll(value, `''`, `'`);
    });
    value = cleanValue(value);
    return toEval ? eval(value) : value;
}

function conditionTypeHandler(val, toEval) {
    var replacement;
    if (isInputArray(val.trim()))
        replacement = toEval ? getInputArrayValue(val.trim()) : val.trim();
    else if (isInput(val.trim()))
        replacement = toEval ? var_table[val.trim()].value : val.trim();
    else
        replacement = conditionTypeHandler2(val, toEval);

    return replacement;
}

function conditionTypeHandler2(val, toEval) {
    var replacement;

    if (var_table[val.trim()] !== undefined)
        replacement = var_table[val.trim()].value;
    else if (isBoolean(val.trim()) && toEval)
        replacement = toBoolean(val.trim());

    return replacement;
}

function cleanValue(value) {
    const _arr = ['==', '===', '!=', '!==', '>', '<', '>=', '=>', '<=', '=<', '+', '*', '/', ':', ')', '('];
    _arr.forEach(symbol => {
        value.replace(`' + ${symbol} + '`, symbol);
        value.replace(`' + ${symbol}`, symbol);
        value.replace(`${symbol} + '`, symbol);
    });

    return value;

}

function setReplacement(replacement, toEval, val) {
    if (replacement === undefined)
        replacement = val.trim();

    if (isNumberOrString(replacement) && toEval)
        replacement = `'` + replacement + `'`;

    return replacement;
}

function isNumberOrString(val) {
    val = val.toString();
    /*(val.charCodeAt(0) >= 48 && val.charCodeAt(0) <= 57) ||*/
    return (val.charCodeAt(0) >= 65 && val.charCodeAt(0) <= 90) || (val.charCodeAt(0) >= 97 && val.charCodeAt(0) <= 122);
}

// Remove +zeros from predicat input
function removeZeros(x) {
    var res;
    try {
        res = x.replace(/\+0/g, '').replace(/\+ 0/g, '');
    } catch (e) {
        res = x;
    }

    return res;
}

// Run over latest If\else-if statements and check thier result (true/false)
function getPreviousIfResult() {
    var _hasTrue = false;
    var _prevIfs = 0;
    for (var i = symbolize.length - 1; i >= 0; i--) {
        _prevIfs = isNestedIf(symbolize[i], _prevIfs);
        _hasTrue = checkPrevSymbol(symbolize[i]);
        if (_hasTrue)
            break;

        if (symbolize[i].type == 'if statement') {
            _prevIfs--;
            if (_prevIfs == -1)
                break;
        }
    }
    return !_hasTrue;
}

function isNestedIf(symbol, _prevIfs) {
    return symbol.type == 'else statement' ? _prevIfs + 1 : _prevIfs;
}

// Returns true if previous symbol was if\else-if and its value is true
function checkPrevSymbol(symbol) {
    return (symbol.type == 'else if statement' || symbol.type == 'if statement') && symbol.result === true;
}

// Check if predicat is a Function-Param
function isParam(obj) {
    var func = pred_table.find(o => o.line == obj.line && o.type == 'function declaration');

    if (func)
        return true;

    return false;
}

// Remove all '(' , ')' from value
function removeBracelets(value) {
    var t = value;
    t = replaceAll(t, '(', '');
    t = replaceAll(t, ')', '');
    t = replaceAll(t, ' ', '');

    return t;
}

// Check if predicat is an Input to the function
function isInput(key) {
    for (var i = 0; i < input.length; i++)
        if (input[i].key == key && !(input[i].value instanceof Array))
            return true;

    return false;
}

function isInputArray(key) {
    // if (key === undefined) return false;

    if (key.indexOf('[') > -1 && key.indexOf(']') == key.length - 1) {
        var _key = key.trim().split(/\[|\]/)[0];

        return checkAllInputsAsArray(_key);
    }

    return var_table[key] !== undefined && var_table[key].value instanceof Array;
}

function checkAllInputsAsArray(_key) {
    for (var i = 0; i < input.length; i++)
        if (input[i].key == _key && (input[i].value instanceof Array))
            return true;

    return false;
}

function getInputArrayValue(str) {
    // if (isInputArray(str)) {
    var _key = str.trim().split(/\[|\]/)[0];
    var _index = str.trim().split(/\[|\]/)[1];
    var index = convertValueToInputVars(_index, true, true);

    return var_table[_key].value[index];
    // }

    // return undefined;
}

function setInputArrayValue(str, _result) {
    var _key = str.trim().split(/\[|\]/)[0];
    var _index = str.trim().split(/\[|\]/)[1];
    var index = parseInt(convertValueToInputVars(_index, true, true));

    var_table[_key].value[index] = _result;
}


//-----------------------------

// Print function - converts symbolized array of objects to html by source-code-string
// Input - Symbols (symbolized array to print), srcCode (original code on left table)
function print(symbols, srcCode) {
    var factor = 0, _splitSrc = srcCode.split('\n'), _filtered = [], _removeSpaces = removeSpaces(_splitSrc);
    for (var i = 0; i < _removeSpaces.length; i++) {
        var hasAdded = false;
        if (_removeSpaces[i].trim() == '}') {
            factor--;
            hasAdded = pushToArray(_filtered, _removeSpaces, i, i + Math.abs(factor));
            factor++;
            factor = toReduceFactor(hasAdded, _removeSpaces, i, factor);
            continue;
        }
        var isSymbol = symbols.find(t => t.line == i + 1 + factor);
        if (isSymbol) {
            var line = calculateLine(isSymbol, factor);
            pushToArray(_filtered, _removeSpaces, i, line, isSymbol.line);
        }
    }
    return _replaceSymbols(symbols, _filtered);
}

function toReduceFactor(hasAdded, _removeSpaces, i, factor) {
    if (hasAdded && _removeSpaces[i + 1]) return factor - 1;

    return factor;
}

function calculateLine(isSymbol, factor) {
    return factor < 0 ? isSymbol.line + Math.abs(factor) : isSymbol.line;
}

//Push data to new array and filter undefined and duplicated
function pushToArray(array, oldArray, code, line, realLine) {
    // if (oldArray[code] == undefined) return false;

    if (array.find(l => l.line == line) === undefined || array.find(l => l.line == line).realLine === undefined) {
        array.push({ code: oldArray[code], line, realLine });

        return true;
    } else { return false; }
    // return false;
}

// Remove empty lines
function removeSpaces(_splitSrc) {
    var _removeSpaces = [];
    for (var i = 0; i < _splitSrc.length; i++) {
        if (_splitSrc[i].trim().length != 0)
            _removeSpaces.push(_splitSrc[i]);
    }

    return _removeSpaces;
}

//Foreach line of source-code, if it found on symbols array - replace the content to the symbolized value\condition
function _replaceSymbols(symbols, code) {
    var result = [];
    code.forEach(c => {
        // if (c.code === undefined) return;
        if (c.code.trim() == '}') {
            // Keep on the amount of "spaces" (indent)
            c.html = c.code.replace(/ /g, '&nbsp; ');
            result.push(c);
            return;
        }
        var symbol = symbols.find(s => s.line == c.realLine);
        // If symbol is found on the line of source code - replace its previous value\condition
        // if (symbol)
        c = replaceSymbol(c, symbol);
        result.push(c);
    });
    return result;
}

function replaceSymbol(c, symbol) {
    if (printSymbolReplacement[symbol.type])
        c.html = printSymbolReplacement[symbol.type](c, symbol);

    if (!c.html)
        c.html = c.code;

    // Replace certain symbols that makes problems when injected to HTML text
    c.html = replaceHTMLSymbols(c.html);

    // Colorize if\else\elseif statements 
    if (symbol.result !== undefined)
        c.color = symbol.result ? 'lime' : 'salmon';

    return c;
}

function replaceHTMLSymbols(html) {
    html = html.replace(/ /g, '&nbsp;');
    html = html.replace(/>/g, '&gt;');
    html = html.replace(/</g, '&lt;');

    return html;
}

//-----------------------------

// Input Conversion
function convertInput(input_vector) {
    // Remove input brackets
    if (input_vector.startsWith('(') && input_vector.endsWith(')'))
        input_vector = input_vector.substr(1).substr(0, input_vector.length - 2).trim();

    // Split input vector by , and =
    var _splitted = input_vector.split(/,|=/);

    conversionHandler(_splitted);
    return var_table;
}

// Convert Input splitted array to a table of variable
function conversionHandler(_splitted) {
    var _lastKey;
    for (var i = 0; i < _splitted.length; i++) {
        var _var = _splitted[i].trim();
        var isArray = _var.indexOf('[') > -1;
        if (isArray) {
            const key = _splitted[i - 1].trim();
            var arr = handleArrayInput(_splitted, _var, i);
            input.push({ key: key, value: arr });
            var_table[key] = { value: arr };
            while (_splitted[i].indexOf(']') == -1)
                i++;
            _lastKey = null;
        } else if (!_lastKey) {
            _lastKey = _var;
        } else {
            _lastKey = updateVarValue(_lastKey, _var);
        }
    }
}

// Enter new entry of variable to var_table
function updateVarValue(_lastKey, _var) {
    var_table[_lastKey] = { value: convertToType(_var) };
    input.push({ key: _lastKey, value: convertToType(_var) });
}

// Handler for input variable that is an array
function handleArrayInput(_splitted, _var, i) {
    var arr = [];
    arr.push(convertToType(_var.substr(1)));

    i++;
    var _var2 = _splitted[i];
    while (_var2.indexOf(']') == -1) {
        arr.push(convertToType(_var2));

        i++;
        _var2 = _splitted[i];
    }
    arr.push(convertToType(_var2.substr(0, _var2.length - 1)));

    return arr;
}

// Check what type of the input variable - Int\Float\Array\Boolean
function convertToType(_value) {
    if (!isNaN(parseInt(_value)))
        return isInt(_value) ? parseInt(_value) : parseFloat(_value);
    else if (isBoolean(_value))
        return toBoolean(_value);
    else
        return _value.substr(1, _value.length - 2);
}

function isNumber(_value) {
    return !isNaN(Number(_value));
}

function isInt(n) {
    return n % 1 === 0;
}

function isBoolean(value) {
    value = value.toString();
    return value.toLowerCase() == 'true' || value.toLowerCase() == 'false';
}

function toBoolean(value) {
    return value.toLowerCase() == 'true';
}

// Help function - replace all "search" text with "replacement" text in target string
function replaceAll(target, search, replacement) {
    var prev = target.toString();
    var _res = target.toString().split(search).join(replacement);
    while (_res.length < prev.length) {
        prev = _res;
        _res = _res.toString().split(search).join(replacement);
    }

    return _res;
}

function _getInput(){
    return input;
}

export default { symbolizer, convertInput, print, _getInput};