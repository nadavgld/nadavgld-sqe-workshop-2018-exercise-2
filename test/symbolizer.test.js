import assert from 'assert';
import parser from '../src/js/parser.js';
import symbolizer from '../src/js/symbolizer';
import { parseCode } from '../src/js/code-analyzer';

var obj;
const input_vector = "(x=3,y=2,z=1)";

describe('Check Symbolizer functionallity', () => {
    it('Short function', () => {
        var func = `function foo(x, y, z){
            let a = x + 1;
        
            if (a < z) {
                a = a + 4;
                return x + y + z + a;
            }
        }`
        let parsedCode = parseCode(func);
        

        var {_line, _container} = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[2].line.toString(),
            '5'
        );
    });

    it('Medium function - If - False, Elseif - True', () => {
        var func = ` function foo(x, y, z){
            let a = x + 1;
            z = 2;
        
            if (a < z) {
                a = a + 4;
                return x + y + z + a;
            }else if( a + 8 > z*2 ) {
                a = (z - y);
                return a + y + 2 - x;
            }else{
                
            }
        }`

        let parsedCode = parseCode(func);
        

        var {_line, _container} = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[2].result,
            false
        );
    });

    it('Medium function - If - True ,Elseif - False', () => {
        var func = ` function foo(x, y, z){
            let a = x + 1;
            z = 2;
        
            if (a + 2 > z) {
                a = a + 4;
                return x + y + z + a;
            }else if( a < z*2 ) {
                a = (z - y);
                return a + y + 2 - x;
            }else{
                
            }
        }`

        let parsedCode = parseCode(func);
        

        var {_line, _container} = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);
        var _symbolizedHTML = symbolizer.print(symbols,func);

        console.log(_symbolizedHTML);

        assert.equal(
            symbols[2].result,
            true
        );
    });
});
