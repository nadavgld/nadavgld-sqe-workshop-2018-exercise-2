import assert from 'assert';
import parser from '../src/js/parser.js';

var obj;
describe('Check parser functionallity', () => {
    it('Function declaration type', () => {
        obj = {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "binarySearch"
            },
            "params": [
                {
                    "type": "Identifier",
                    "name": "X"
                },
                {
                    "type": "Identifier",
                    "name": "V"
                },
                {
                    "type": "Identifier",
                    "name": "n"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "body": []
            },
            "generator": false,
            "expression": false,
            "async": false
        };

        assert.equal(
            parser.handleFuncDec(obj).type,
            'function declaration'
        );
    });

    it('Params parsing', () => {
        obj =
            {
                "type": "Identifier",
                "name": "X"
            };

        assert.equal(
            parser.handleParams(obj).name,
            obj.name
        );
    });

    it('Var declaration', () => {
        obj = {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "a"
                    },
                    "init": {
                        "type": "Literal",
                        "value": 1,
                        "raw": "1"
                    }
                }
            ],
            "kind": "let"
        };

        assert.equal(
            parser.handleVarDec(obj).value.toString(),
            '1'
        );
    });

    it('While condition', () => {
        obj = {
            "type": "WhileStatement",
            "test": {
                "type": "BinaryExpression",
                "operator": ">",
                "left": {
                    "type": "Identifier",
                    "name": "x"
                },
                "right": {
                    "type": "Literal",
                    "value": 2,
                    "raw": "2"
                }
            },
            "body": {
                "type": "EmptyStatement"
            }
        };

        assert.equal(
            parser.handleLoops(obj).condition,
            'x > 2'
        );
    });

    it('Expression to string', () => {
        obj = {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": "a"
                },
                "right": {
                    "type": "BinaryExpression",
                    "operator": "/",
                    "left": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 2,
                            "raw": "2"
                        }
                    },
                    "right": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                    }
                }
            }
        };

        var exp = parser.handleExpression(obj);
        assert.equal(exp.name, 'a');
        assert.equal(exp.value, '(  x + 2 ) / 2');
    });

    it('Return statement`s expression', () => {
        obj = {
            "type": "ReturnStatement",
            "argument": {
                "type": "BinaryExpression",
                "operator": "+",
                "left": {
                    "type": "Identifier",
                    "name": "a"
                },
                "right": {
                    "type": "Literal",
                    "value": 1,
                    "raw": "1"
                }
            }
        };

        var ret = parser.handleReturn(obj);
        assert.equal(ret.type, 'return statement');
        assert.equal(ret.value, 'a + 1');
    });

    it('get body content', () => {
        obj = {
            "type": "Program",
            "body": [
                {
                    "type": "FunctionDeclaration",
                    "id": {
                        "type": "Identifier",
                        "name": "asd"
                    },
                    "params": [],
                    "body": {
                        "type": "BlockStatement",
                        "body": [
                            {
                                "type": "ReturnStatement",
                                "argument": {
                                    "type": "UnaryExpression",
                                    "operator": "-",
                                    "argument": {
                                        "type": "Literal",
                                        "value": 1,
                                        "raw": "1"
                                    },
                                    "prefix": true
                                }
                            }
                        ]
                    },
                    "generator": false,
                    "expression": false,
                    "async": false
                },
                {
                    "type": "VariableDeclaration",
                    "declarations": [
                        {
                            "type": "VariableDeclarator",
                            "id": {
                                "type": "Identifier",
                                "name": "a"
                            },
                            "init": null
                        },
                        {
                            "type": "VariableDeclarator",
                            "id": {
                                "type": "Identifier",
                                "name": "x"
                            },
                            "init": {
                                "type": "Literal",
                                "value": 1,
                                "raw": "1"
                            }
                        }
                    ],
                    "kind": "let"
                }
            ],
            "sourceType": "script"
        };

        var parsed = parser.objectToTable(obj);
        assert.equal(parseInt(parsed.line), 3);
        assert.equal(parsed._container.length, 4);
    });

    it('if statement alternation', () => {
        obj = {
            "type": "IfStatement",
            "test": {
                "type": "BinaryExpression",
                "operator": "==",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "-",
                    "left": {
                        "type": "Identifier",
                        "name": "x"
                    },
                    "right": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                    }
                },
                "right": {
                    "type": "Literal",
                    "value": 1,
                    "raw": "1"
                }
            },
            "consequent": {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "alert"
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "name": "x"
                        }
                    ]
                }
            },
            "alternate": {
                "type": "IfStatement",
                "test": {
                    "type": "BinaryExpression",
                    "operator": "==",
                    "left": {
                        "type": "Identifier",
                        "name": "x"
                    },
                    "right": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                    }
                },
                "consequent": {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "alert"
                        },
                        "arguments": [
                            {
                                "type": "Identifier",
                                "name": "x"
                            }
                        ]
                    }
                },
                "alternate": null
            }
        };

        var alter = parser.handleAlternate(obj);
        assert.equal(alter.type, 'else if statement');
    });

    it('if statement condition', () => {
        obj = {
            "type": "IfStatement",
            "test": {
                "type": "BinaryExpression",
                "operator": "==",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "-",
                    "left": {
                        "type": "Identifier",
                        "name": "x"
                    },
                    "right": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                    }
                },
                "right": {
                    "type": "Literal",
                    "value": 1,
                    "raw": "1"
                }
            },
            "consequent": {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "alert"
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "name": "x"
                        }
                    ]
                }
            },
            "alternate": {
                "type": "IfStatement",
                "test": {
                    "type": "BinaryExpression",
                    "operator": "==",
                    "left": {
                        "type": "Identifier",
                        "name": "x"
                    },
                    "right": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                    }
                },
                "consequent": {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "alert"
                        },
                        "arguments": [
                            {
                                "type": "Identifier",
                                "name": "x"
                            }
                        ]
                    }
                },
                "alternate": null
            }
        };
        var _if = parser.handleLoops(obj);
        assert.equal(_if.line, 5);
        assert.equal(_if.condition, '(  x - 2 ) == 1');
        assert.equal(_if.type, 'if statement');
    });

    it('object counter', () => {
        obj = {
            "type": "Program",
            "body": [
                {
                    "type": "FunctionDeclaration",
                    "id": {
                        "type": "Identifier",
                        "name": "binarySearch"
                    },
                    "params": [
                        {
                            "type": "Identifier",
                            "name": "X"
                        },
                        {
                            "type": "Identifier",
                            "name": "V"
                        },
                        {
                            "type": "Identifier",
                            "name": "n"
                        }
                    ],
                    "body": {
                        "type": "BlockStatement",
                        "body": [
                            {
                                "type": "VariableDeclaration",
                                "declarations": [
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "low"
                                        },
                                        "init": null
                                    },
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "high"
                                        },
                                        "init": null
                                    },
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "mid"
                                        },
                                        "init": null
                                    }
                                ],
                                "kind": "let"
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "low"
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "value": 0,
                                        "raw": "0"
                                    }
                                }
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "high"
                                    },
                                    "right": {
                                        "type": "BinaryExpression",
                                        "operator": "-",
                                        "left": {
                                            "type": "Identifier",
                                            "name": "n"
                                        },
                                        "right": {
                                            "type": "Literal",
                                            "value": 1,
                                            "raw": "1"
                                        }
                                    }
                                }
                            },
                            {
                                "type": "WhileStatement",
                                "test": {
                                    "type": "BinaryExpression",
                                    "operator": "<=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "low"
                                    },
                                    "right": {
                                        "type": "Identifier",
                                        "name": "high"
                                    }
                                },
                                "body": {
                                    "type": "BlockStatement",
                                    "body": [
                                        {
                                            "type": "ExpressionStatement",
                                            "expression": {
                                                "type": "AssignmentExpression",
                                                "operator": "=",
                                                "left": {
                                                    "type": "Identifier",
                                                    "name": "mid"
                                                },
                                                "right": {
                                                    "type": "BinaryExpression",
                                                    "operator": "/",
                                                    "left": {
                                                        "type": "BinaryExpression",
                                                        "operator": "+",
                                                        "left": {
                                                            "type": "Identifier",
                                                            "name": "low"
                                                        },
                                                        "right": {
                                                            "type": "Identifier",
                                                            "name": "high"
                                                        }
                                                    },
                                                    "right": {
                                                        "type": "Literal",
                                                        "value": 2,
                                                        "raw": "2"
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            "type": "IfStatement",
                                            "test": {
                                                "type": "BinaryExpression",
                                                "operator": "<",
                                                "left": {
                                                    "type": "Identifier",
                                                    "name": "X"
                                                },
                                                "right": {
                                                    "type": "MemberExpression",
                                                    "computed": true,
                                                    "object": {
                                                        "type": "Identifier",
                                                        "name": "V"
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "mid"
                                                    }
                                                }
                                            },
                                            "consequent": {
                                                "type": "ExpressionStatement",
                                                "expression": {
                                                    "type": "AssignmentExpression",
                                                    "operator": "=",
                                                    "left": {
                                                        "type": "Identifier",
                                                        "name": "high"
                                                    },
                                                    "right": {
                                                        "type": "BinaryExpression",
                                                        "operator": "-",
                                                        "left": {
                                                            "type": "Identifier",
                                                            "name": "mid"
                                                        },
                                                        "right": {
                                                            "type": "Literal",
                                                            "value": 1,
                                                            "raw": "1"
                                                        }
                                                    }
                                                }
                                            },
                                            "alternate": {
                                                "type": "IfStatement",
                                                "test": {
                                                    "type": "BinaryExpression",
                                                    "operator": ">",
                                                    "left": {
                                                        "type": "Identifier",
                                                        "name": "X"
                                                    },
                                                    "right": {
                                                        "type": "MemberExpression",
                                                        "computed": true,
                                                        "object": {
                                                            "type": "Identifier",
                                                            "name": "V"
                                                        },
                                                        "property": {
                                                            "type": "Identifier",
                                                            "name": "mid"
                                                        }
                                                    }
                                                },
                                                "consequent": {
                                                    "type": "BlockStatement",
                                                    "body": [
                                                        {
                                                            "type": "ExpressionStatement",
                                                            "expression": {
                                                                "type": "CallExpression",
                                                                "callee": {
                                                                    "type": "MemberExpression",
                                                                    "computed": false,
                                                                    "object": {
                                                                        "type": "Identifier",
                                                                        "name": "console"
                                                                    },
                                                                    "property": {
                                                                        "type": "Identifier",
                                                                        "name": "log"
                                                                    }
                                                                },
                                                                "arguments": [
                                                                    {
                                                                        "type": "Identifier",
                                                                        "name": "mid"
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                },
                                                "alternate": {
                                                    "type": "ReturnStatement",
                                                    "argument": {
                                                        "type": "Identifier",
                                                        "name": "mid"
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "type": "ReturnStatement",
                                "argument": {
                                    "type": "Identifier",
                                    "name": "low"
                                }
                            }
                        ]
                    },
                    "generator": false,
                    "expression": false,
                    "async": false
                }
            ],
            "sourceType": "script"
        };

        var parsed = parser.objectToTable(obj);
        assert.equal(parsed._container.length, 18);
        assert.equal(parsed.line, 12);
    });

    it('table line amount', () => {
        obj = {
            "type": "Program",
            "body": [
                {
                    "type": "FunctionDeclaration",
                    "id": {
                        "type": "Identifier",
                        "name": "binarySearch"
                    },
                    "params": [
                        {
                            "type": "Identifier",
                            "name": "X"
                        },
                        {
                            "type": "Identifier",
                            "name": "V"
                        },
                        {
                            "type": "Identifier",
                            "name": "n"
                        }
                    ],
                    "body": {
                        "type": "BlockStatement",
                        "body": [
                            {
                                "type": "VariableDeclaration",
                                "declarations": [
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "low"
                                        },
                                        "init": null
                                    },
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "high"
                                        },
                                        "init": null
                                    },
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "mid"
                                        },
                                        "init": null
                                    }
                                ],
                                "kind": "let"
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "low"
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "value": 0,
                                        "raw": "0"
                                    }
                                }
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "high"
                                    },
                                    "right": {
                                        "type": "BinaryExpression",
                                        "operator": "-",
                                        "left": {
                                            "type": "Identifier",
                                            "name": "n"
                                        },
                                        "right": {
                                            "type": "Literal",
                                            "value": 1,
                                            "raw": "1"
                                        }
                                    }
                                }
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "n"
                                    },
                                    "right": {
                                        "type": "MemberExpression",
                                        "computed": true,
                                        "object": {
                                            "type": "Identifier",
                                            "name": "X"
                                        },
                                        "property": {
                                            "type": "BinaryExpression",
                                            "operator": "+",
                                            "left": {
                                                "type": "Identifier",
                                                "name": "high"
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": 1,
                                                "raw": "1"
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    "generator": false,
                    "expression": false,
                    "async": false
                }
            ],
            "sourceType": "script"
        };
        parser.objectToTable(obj);
        const html = parser.printTable().toString();

        assert(html.split("<tr>").length - 1, 10);
    });

    it('for loop', () => {
        obj = {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "declarations": [
                        {
                            "type": "VariableDeclarator",
                            "id": {
                                "type": "Identifier",
                                "name": "x"
                            },
                            "init": {
                                "type": "Literal",
                                "value": 1,
                                "raw": "1"
                            }
                        }
                    ],
                    "kind": "let"
                },
                {
                    "type": "ForStatement",
                    "init": {
                        "type": "VariableDeclaration",
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "id": {
                                    "type": "Identifier",
                                    "name": "x"
                                },
                                "init": {
                                    "type": "Literal",
                                    "value": 0,
                                    "raw": "0"
                                }
                            }
                        ],
                        "kind": "let"
                    },
                    "test": {
                        "type": "BinaryExpression",
                        "operator": "<",
                        "left": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 10,
                            "raw": "10"
                        }
                    },
                    "update": {
                        "type": "UpdateExpression",
                        "operator": "++",
                        "argument": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "prefix": false
                    },
                    "body": {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "console"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "log"
                                }
                            },
                            "arguments": [
                                {
                                    "type": "Identifier",
                                    "name": "x"
                                }
                            ]
                        }
                    }
                },
                {
                    "type": "ForStatement",
                    "init": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 0,
                            "raw": "0"
                        }
                    },
                    "test": {
                        "type": "BinaryExpression",
                        "operator": "<",
                        "left": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 10,
                            "raw": "10"
                        }
                    },
                    "update": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "right": {
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": {
                                "type": "Identifier",
                                "name": "x"
                            },
                            "right": {
                                "type": "Literal",
                                "value": 2,
                                "raw": "2"
                            }
                        }
                    },
                    "body": {
                        "type": "BlockStatement",
                        "body": [
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "=",
                                    "left": {
                                        "type": "Identifier",
                                        "name": "x"
                                    },
                                    "right": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "Identifier",
                                            "name": "x"
                                        },
                                        "right": {
                                            "type": "Literal",
                                            "value": 1,
                                            "raw": "1"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ],
            "sourceType": "script"
        }

        var parsed = parser.objectToTable(obj);
        assert.equal(parsed._container.length, 6);
        assert.equal(parsed.line, 5);
    })
});
