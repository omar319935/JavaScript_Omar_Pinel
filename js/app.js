
var calculator = document.getElementById('calculator');
var output = document.getElementById('calculator-output');

calculator.addEventListener('click', calculatorClick);

function calculatorClick(event) {
  var target = event.target;
  var dataset = target.dataset;
  var value = dataset.value;
  var type = dataset.type;
  if (type) {
    calc.input(type, value);
    result = calc.output() ;
    output.innerHTML = result;
  }
}

// Estados
const STATE_LEFT_OPERAND = 'left_operand';
const STATE_RIGHT_OPERAND = 'right_operand';
const STATE_OPERATOR = 'operator';
const STATE_RESULT = 'result';

// Entradas
const TYPE_NUMBER = 'number';
const TYPE_ACTION = 'action';
const TYPE_OPERATOR = 'operator';

// Operadores
const OPERATOR_DIVISION = '/';
const OPERATOR_MULTIPLICATION = '*';
const OPERATOR_ADDITION = '+';
const OPERATOR_SUBTRACTION = '-';

// Acciones
const ACTION_CLEAR = 'C';
const ACTION_RESULT = '=';
const ACTION_POINT = '.';
const ACTION_NEGATIVE = '-';



class BaseStrategy {
  constructor(delegate) {
    this.delegate = delegate;
  }
  onNumber(number) {
    this.delegate.acc.push(number);
  }
  onOperator(operator){}
  onResult(){}
  onClear() {
    this.delegate.reset();
  }
}

class LeftOperandStrategy extends BaseStrategy {
  onOperator(operator){
    let dg = this.delegate;
    dg.setOperator(operator);
    dg.setLeftOperand(dg.getAccumulator());
    dg.transition(STATE_OPERATOR);
  }
}

class OperatorStrategy extends BaseStrategy {
  onNumber(number) {
    let dg = this.delegate;
    dg.clearAccumulator();
    dg.acc.push(number);
    dg.transition(STATE_RIGHT_OPERAND);
  }
  onOperator(operator) {
    this.delegate.setOperator(operator);
  }
  onResult() {
    let dg = this.delegate;
    dg.setRightOperand(dg.getAccumulator());
    dg.setAccumulator(dg.operation());
  }
}

class RightOperandStrategy extends BaseStrategy {
  onOperator(operator) {
    let dg = this.delegate;
    let result = 0;
    dg.setRightOperand(dg.getAccumulator());
    result = dg.operation();
    dg.setAccumulator(result);
    dg.setLeftOperand(result);
    dg.setOperator(operator);
    dg.transition(STATE_OPERATOR);
  }
  onResult() {
    let dg = this.delegate;
    let result = 0;
    let rightOperand = 0;
    dg.setRightOperand(dg.getAccumulator());
    result = dg.operation();
    dg.setAccumulator(result);
    rightOperand = dg.getRightOperand();
    if (dg.getOperator() === OPERATOR_SUBTRACTION) {
      rightOperand = rightOperand * -1;
      dg.setOperator(OPERATOR_ADDITION);
    }
    if (dg.getOperator() === OPERATOR_DIVISION) {
      rightOperand = 1 / rightOperand;
      dg.setOperator(OPERATOR_MULTIPLICATION);
    }
    dg.setLeftOperand(rightOperand);
    dg.transition(STATE_RESULT);
  }
}

class ResultOperandStrategy extends BaseStrategy {
  onOperator(operator) {
    let dg = this.delegate;
    dg.setOperator(operator);
    dg.setLeftOperand(dg.getAccumulator());
    dg.transition(STATE_OPERATOR);
  }
  onResult() {
    let dg = this.delegate;
    dg.setRightOperand(dg.getAccumulator());
    dg.setAccumulator(dg.operation());
  }
}

// ES6
class Calculator {
  constructor() {
    this.init();
  }

  /**
  * Inicializa los valores de la calculadora y selecciona el primer estado
  */
  init() {
    this.acc = [];
    this.operator = null;
    this.leftOperand = 0;
    this.rightOperand = 0;
    this.state = null;
    this.strategy = null;
    this.transition(STATE_LEFT_OPERAND);
  }

  /** 
  * Selecciona la estrategia de acuerdo con el valor de estado
  * @param {String} estado 
  */
  transition(state) {
    this.state = state;
    switch(state) {
      case STATE_LEFT_OPERAND:
        this.strategy = new LeftOperandStrategy(this);
        break;
      case STATE_RIGHT_OPERAND:
        this.strategy = new RightOperandStrategy(this);
        break;
      case STATE_OPERATOR:
        this.strategy = new OperatorStrategy(this);
        break;
      case STATE_RESULT:
        this.strategy = new ResultOperandStrategy(this);
        break;
    }
  }

  /**
  * Establece el valor del acumulador recibido en Tipo de número y luego comberted en una matriz
  * @param {String} tipo de entrada
  * @param {String} tipo Número, operador
  */
  input(type, value) {
    switch(type) {
      case TYPE_NUMBER:
        this.strategy.onNumber(value);
        break;
      case TYPE_OPERATOR:
        this.strategy.onOperator(value);
        break;
      case TYPE_ACTION:
          if (value === ACTION_CLEAR){
            this.strategy.onClear();
          }
          if (value === ACTION_RESULT){
            this.strategy.onResult();
          }
        break;
    }
    this.logger();
  }

  /**
  * Realiza la operación tomando el operando izquierdo, el operador y el operando derecho
  * @return resultado de la operación {Number}
  */
  operation () {
    let operator = this.operator;
    let result = 0;

    switch(operator) {
      case OPERATOR_DIVISION:
        result = this.leftOperand / this.rightOperand;
      break;
      case OPERATOR_MULTIPLICATION:
        result = this.leftOperand * this.rightOperand;
      break;
      case OPERATOR_ADDITION:
        result = this.leftOperand + this.rightOperand;
      break;
      case OPERATOR_SUBTRACTION:
        result = this.leftOperand - this.rightOperand;
      break;
    }
    return result;
  }

 /**
 * Establece el nuevo operando a la izquierda
 * @param {Number} nuevo operando del ledt
 */
  setLeftOperand(value) {
  	this.leftOperand = value;
  }

 /**
   * Devuelve el valor numérico actual del operando izquierdo
   * @return {Number} nuevo operando a la izquierda
 */
  getLeftOperand() {
    return this.leftOperand;
  }

 /**
 * Establece el nuevo valor de operando derecho
 * @param {Number} nuevo valor de operando derecho
 */
  setRightOperand(value) {
    this.rightOperand = value;
  }

 /**
 * Devuelve el valor numérico actual del operando derecho
 * @return {Number} Valor de número de acumulador
 */
  getRightOperand() {
    return this.rightOperand;
  }

 /**
 * Establece el nuevo valor de operador
 * @param {Number} valor del operador
 */
  setOperator(value) {
    this.operator = value;
  }

 /**
 * Devuelve el operador actual
 * @return {String} operador
 */
  getOperator() {
    return this.operator;
  }

 /**
 * Establece el valor del acumulador recibido en Tipo de número y luego comberted en una matriz
 * @param {Number} nuevo valor de Acumulador
 */
  setAccumulator(value) {
    this.acc = Array.from(String(value));
  }

 /**
 * Devuelve el valor numérico actual del acumulador
 * @return {Number} Valor de número de acumulador
 */
  getAccumulator() {
    return parseFloat(this.acc.join(''));
  }

  /**
  *Restablece el valor del acumulador
  */
  clearAccumulator() {
    this.acc = [];
  }

 /**
 * Restablece el estado de la calculadora
 */
  reset() {
    this.init();
  }

 /**
 * Registra el estado de la calculadora
 */
  logger() {
    console.log({
      acc: this.acc,
      operator: this.operator,
      leftOperand: this.leftOperand,
      rightOperand: this.rightOperand,
      state: this.state
    })
  }

 /*
 * Devuelve el valor actual del acumulador
 * @return {String} Valor actual del acumulador
 */
  output() {
    let result = 0;
    if (this.acc.length > 0) {
      result = this.acc.join('');
    }
    return result;
  }

}

var calc = new Calculator();

function click() {

	function C() {
		var c = document.getElementById('C');
		c.addEventListener("mousedown", function(){
	    c.setAttribute("style","transform:scale(0.95,0.95)")})
	    c.addEventListener("mouseout", function(){
	    c.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('C').onclick=C();

	function negativo() {
		var negativo = document.getElementById('negativo');
		negativo.addEventListener("mousedown", function(){
	    negativo.setAttribute("style","transform:scale(0.95,0.95)")})
	    negativo.addEventListener("mouseout", function(){
	    negativo.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('negativo').onclick=negativo();

	function raiz() {
		var raiz = document.getElementById('raiz');
		raiz.addEventListener("mousedown", function(){
	    raiz.setAttribute("style","transform:scale(0.95,0.95)")})
	    raiz.addEventListener("mouseout", function(){
	    raiz.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('raiz').onclick=raiz();

	function division() {
		var division = document.getElementById('division');
		division.addEventListener("mousedown", function(){
	    division.setAttribute("style","transform:scale(0.95,0.95)")})
	    division.addEventListener("mouseout", function(){
	    division.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('division').onclick=division();

	function siete() {
		var siete = document.getElementById('siete');
		siete.addEventListener("mousedown", function(){
	    siete.setAttribute("style","transform:scale(0.95,0.95)")})
	    siete.addEventListener("mouseout", function(){
	    siete.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('siete').onclick=siete();

	function ocho() {
		var ocho = document.getElementById('ocho');
		ocho.addEventListener("mousedown", function(){
	    ocho.setAttribute("style","transform:scale(0.95,0.95)")})
	    ocho.addEventListener("mouseout", function(){
	    ocho.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('ocho').onclick=ocho();

	function nueve() {
		var nueve = document.getElementById('nueve');
		nueve.addEventListener("mousedown", function(){
	    nueve.setAttribute("style","transform:scale(0.95,0.95)")})
	    nueve.addEventListener("mouseout", function(){
	    nueve.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('nueve').onclick=nueve();

	function multiplicacion() {
		var multiplicacion = document.getElementById('multiplicacion');
		multiplicacion.addEventListener("mousedown", function(){
	    multiplicacion.setAttribute("style","transform:scale(0.95,0.95)")})
	    multiplicacion.addEventListener("mouseout", function(){
	    multiplicacion.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('multiplicacion').onclick=multiplicacion();

	function cuatro() {
		var cuatro = document.getElementById('cuatro');
		cuatro.addEventListener("mousedown", function(){
	    cuatro.setAttribute("style","transform:scale(0.95,0.95)")})
	    cuatro.addEventListener("mouseout", function(){
	    cuatro.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('cuatro').onclick=cuatro();

	function cinco() {
		var cinco = document.getElementById('cinco');
		cinco.addEventListener("mousedown", function(){
	    cinco.setAttribute("style","transform:scale(0.95,0.95)")})
	    cinco.addEventListener("mouseout", function(){
	    cinco.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('cinco').onclick=cinco();

	function seis() {
		var seis = document.getElementById('seis');
		seis.addEventListener("mousedown", function(){
	    seis.setAttribute("style","transform:scale(0.95,0.95)")})
	    seis.addEventListener("mouseout", function(){
	    seis.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('seis').onclick=seis();

	function subtraction() {
		var subtraction = document.getElementById('subtraction');
		subtraction.addEventListener("mousedown", function(){
	    subtraction.setAttribute("style","transform:scale(0.95,0.95)")})
	    subtraction.addEventListener("mouseout", function(){
	    subtraction.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('subtraction').onclick=subtraction();

	function uno() {
		var uno = document.getElementById('uno');
		uno.addEventListener("mousedown", function(){
	    uno.setAttribute("style","transform:scale(0.95,0.95)")})
	    uno.addEventListener("mouseout", function(){
	    uno.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('uno').onclick=uno();

	function dos() {
		var dos = document.getElementById('dos');
		dos.addEventListener("mousedown", function(){
	    dos.setAttribute("style","transform:scale(0.95,0.95)")})
	    dos.addEventListener("mouseout", function(){
	    dos.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('dos').onclick=dos();

	function tres() {
		var tres = document.getElementById('tres');
		tres.addEventListener("mousedown", function(){
	    tres.setAttribute("style","transform:scale(0.95,0.95)")})
	    tres.addEventListener("mouseout", function(){
	    tres.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('tres').onclick=tres();

	function cero() {
		var cero = document.getElementById('cero');
		cero.addEventListener("mousedown", function(){
	    cero.setAttribute("style","transform:scale(0.95,0.95)")})
	    cero.addEventListener("mouseout", function(){
	    cero.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('cero').onclick=cero();

	function punto() {
		var punto = document.getElementById('punto');
		punto.addEventListener("mousedown", function(){
	    punto.setAttribute("style","transform:scale(0.95,0.95)")})
	    punto.addEventListener("mouseout", function(){
	    punto.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('punto').onclick=punto();

	function igual() {
		var igual = document.getElementById('igual');
		igual.addEventListener("mousedown", function(){
	    igual.setAttribute("style","transform:scale(0.95,0.95)")})
	    igual.addEventListener("mouseout", function(){
	    igual.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('igual').onclick=igual();

	function addition() {
		var addition = document.getElementById('addition');
		addition.addEventListener("mousedown", function(){
	    addition.setAttribute("style","transform:scale(0.95,0.95)")})
	    addition.addEventListener("mouseout", function(){
	    addition.setAttribute("style","transform:scale(1,1)")})
	}
	document.getElementById('addition').onclick=addition();
}click();