import assert from 'assert';
import parser from '../src/js/parser.js';
import symbolizer from '../src/js/symbolizer';
import { parseCode } from '../src/js/code-analyzer';

var obj;
var input_vector = "(x=3,y=2,z=1)";

describe('Check Symbolizer functionallity', () => {
    it('Short function', () => {
        var input_vector2 = "(x=3,y=2,z=[1,'test',false])";

        var func = `function foo(x, y, z){ 
            let a = z[0] + x + y;
            return a + 1;            
         }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector2, _line);
         console.log(symbols);
        assert.equal(
            symbols[1].line.toString(),
            '3'
        );
    });

    it('Short function - If', () => {
        var func = `function foo(x, y, z){
            let a = x + 1;
        
            if (a < z) {
                a = a + 4;
                return x + y + z + a;
            }
        }`
        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
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


        var { _line, _container } = parser.objectToTable(parsedCode);
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


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);
        var _symbolizedHTML = symbolizer.print(symbols, func);

        assert.equal(
            symbols[2].result,
            false
        );
    });

    it('Short function - While', () => {
        const input_vector = "(x=3,y=2,z=[1,'test',false])";
        var func = ` function foo(x, y, z){
            let a = x + 1;
            let b = z[1];
            let c = z[2];
            z[0] = 2;
        
            while (a + 2 > z[0]) {
                a = a + 4;
                if(b == 'test')
                    z[0] = 3;
            }
            return x + y + z + a;                
        }`

        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[3].result,
            true
        );
    });

    it('Medium function - While', () => {
        const input_vector = "(x=3,y=2.5,z=[1,'test',false])";
        var func = `function foo(x, y, z){
            let a = x + 1;
            let b = z[1];
            let c = true;
            z[0] = 2;     
            while (a + 2 > z[0]) {
               a = a + 4;
               if(c == z[3]){
                  z[0] = 3;
               }else{
                 return z[2];
               }
            }  
            return z[1];            
         }`

        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);
        var _symbolizedHTML = symbolizer.print(symbols, func);

        assert.equal(
            symbols[3].result,
            false
        );
    });

    it('Medium function - While #2', () => {
        const input_vector = "(x=3,y=2.5,z=[1,'test',false])";
        var func = `function foo(x, y, z){
            let a = x + 1;
            let b = z[1];
            let c = false;
            z[0] = 2;     
            while (a + 2 > z[0]) {
               a = a + 4;
               if(c == z[2]){
                  z[0] = 3;
               }else if('test' == z[1]){
                 return z[2];
               }
            }  
            return z[1];            
         }`

        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[3].result,
            true
        );
    });

    it('Medium function - While #3', () => {
        const input_vector = "(x=3,y=2.5,z=[1,'test',false])";
        var func = `function foo(x, y, z){
            let a = x + 1;
            let b = z[1];
            let c = false;
            let d = y;     
            while (a + 2 > y) {
               a = a + 4 + y;
               if(c == z[2]){
                  z[0] = a;
               }else if('test' == z[1]){
                 return z[2];
               }
            }  
            return z[0] + x + d;            
         }`

        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[2].result,
            true
        );
    });

    it('Medium function - While #4', () => {
        const input_vector = "x=3,y=2.5,z=[1,'test',false]";
        var func = `function foo(x, y, z){
            let a = x + 1;
            let b = z[4];
            let c = false;
            let d = y;     
            while (a + 2 > y) {
               a = a + 4 + y;
               if(c == z[2]){
                  if(c == z[1]){
                     z[0] = a;
                  }else{
                    return z[2];
                  }
               }else if('test' == z[1]){
                 return z[2];
               }
            }  
            return z[0] + x + d;            
         }`

        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[3].result,
            false
        );
    });

    it('Long function - Nested If #4', () => {
        const input_vector = "x=7,y=2.5,z=[1,'test',false]";
        var func = `function foo(x, y, z){
            let a = x + 1;
            let b = z[4];
            let c = false;
            let d = y;     
            while (a + 2 > y) {
               a = a + 4 + y;
               if(c == z[2]){
                  if(c == z[1]){
                     z[0] = a;
                  }else{
                    return z[2];
                  }
               }else if('test' == z[1]){
                  if(c == z[1]){
                     z[0] = a;
                  }else{
                    return z[2];
                  }
               }
            }  
            return z[0] + x + d;            
         }`

        let parsedCode = parseCode(func);


        var { _line, _container } = parser.objectToTable(parsedCode);
        var symbols = symbolizer.symbolizer(_container, input_vector, _line);

        assert.equal(
            symbols[3].result,
            false
        );
    });
});
