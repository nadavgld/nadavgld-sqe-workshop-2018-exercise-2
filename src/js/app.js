import $ from 'jquery';
import { parseCode } from './code-analyzer';
import parser from './parser';
import symbolizer from './symbolizer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let input_vector = $('#input_vector').val();

        parser.clearTable();
        print(parser.printTable());

        var {_line, _container} = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        print(parser.printTable(codeToParse));

        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        var _symbolizedHTML = symbolizer.print(symbols,codeToParse);
        printSymbols(_symbolizedHTML, input_vector);
    });
});

function print(_html) {
    document.getElementById('sol').style.display = 'table';
    document.getElementById('outputTable').innerHTML = _html;
}

function printSymbols(symbols, inputs){
    var _html = '';

    _html += `<tr><td> ${inputs} </td></tr>`;
    symbols.forEach(symbol => {
        _html += `<tr><td style='background:${symbol.color}'> ${symbol.html} </td></tr>`;
    });

    $('#symbolizedCode').html(_html);
}