class CalculatorController {
    constructor() {
        /**
         * last operator e last number vão armazernar último número e último operador
         * vamos utilizar essas variáveis para quando realizarmos uma equação e clicarmos
         * em igual e se por ventura clicar em igual novamente, precisamos ter o último número
         * e o último operador
         */
        this._lastOperator = '';
        this._lastNumber = "";
        /** ------------------------------------------------------------- */
        this._operation = [];
        this._displayCalcHTML = document.querySelector("#display");
        this._dateHTML = document.querySelector("#data");
        this._hourHTML = document.querySelector("#hora");     
        this._currentDate;
        this._locale = "pt-br";
        this.initialize();
        this.initButtonsEvents();
    }

    initialize() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        this.setDisplayTime();

        let interval = setInterval(() => {
            this.setDisplayTime();
        }, 1000);

           setTimeout(() => {
            clearInterval(interval);
        }, 10000);
    }

    setDisplayTime() { 
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        // para cada botão percorrido, adicione evento.
        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, "click drag", e=> {
                /**
                 * com o className pegamos o nome da classe, mas como estamos
                 * trabalhando com svg, usamos o baseVal.
                 * usamos o replace para retirar o btn do nome
                 */
                let textbtn = btn.className.baseVal.replace("btn-", "");
                this.executeButtonAction(textbtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    clearAll() {
        this._operation = [];
        this.setLastNumberToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    setError() {
        this.displayCalc = "Error";
    }

    /**
     * método responsável por pegar último item do array
     */
    getLastOperation(){
        return this._operation[this._operation.length - 1];
    }

    isOperator(value) {
        /**
         * indexof busca em um array se existe alguns dos elementos passados.
         * se ele encontrar, ele pode retornar o index, ou seja 0,1,2,3 etc..
         * se não encontrar, ele retorna -1
         */
        return ["+", "-", "*", "%", "/"].indexOf(value) > -1;
    }

    /**
     * método que visa pegar o último item do array, seja ele número ou operador.
     * Por padrão ele se vai sempre trazer o último operador, mas se definirmos o parâmetro
     * como false ele trará um número
     */
    getLastItem(isOperator = true) {

        let lastItem;

       
        for (let i = this._operation.length-1; i >= 0; i--) {
            /**
             * como o método isOperator retorna false ou true, podemos simplesmente passar
             * como validação o operador pois ele também retorna um booleano
             */
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        /**
         * Em dado momento pode ser que ele retorne o último item como
         * undefined, nesse momento devemos simplesmente definir que o 
         * último item deve ser o que está nas variáveis privadas lastOperator
         * ou lastNumber.
        */

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    /**
     * método para mostrar o número na tela
     */
    setLastNumberToDisplay() {
      
        let lastNumber = this.getLastItem(false);
        /**
         * se não houver nada no último item, então que seja 0 mas nunca nulo.
         */
        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    addOperation(value) {
        /**
         * Precisamos verificar se a última operação foi um número ou não.
         * Caso não seja um número, entraremos no primeiro if, caso seja, entraremos
         * no else.
         * 
         * porém o método getLastOperation por tentar sempre acessar o último item 
         * isso acaba gerando um problema, pois se caso for o primeiro elemento, o último ainda não existe.
         * 
         * obs: Esse if NÃO VERIFICA a operação do momento
         */
        if (isNaN(this.getLastOperation())) {
            /**
             * como aqui vai entrar somente elementos que não sejam números, precisamos tratar
             * as condições diferentes como operadores aritméticos (-, +, /, *) que será um tratamento
             * diferente em relação ao ponto ou porcento.
             *
             * as vezes o usuário acaba colocando o sinal errado, ele pode digitar "2 +" e de repente
             * trocar o operador, verificar se o valor do momento é um operador também, se for, realiza troca 
             */
            
            if (this.isOperator(value)) {
                // trocar operador
                this.setLastOperation(value);
            // Aqui podemos tratar o ponto, igual, porcento, etc...
            /**
             * porém na primeira vez, a verificação do getLastOperation retornará true pois como ele tenta
             * buscar o último item do array e na primeira vez ainda não possui último item, a consulta
             * vai retornar em "undefined", e teoricamente undefined não é um número, isso significa que 
             * na verificação com o isNaN ele retornará true e cairá no bloco dos não números.
             * isso vai fazer com que tente executar o if acima, porém o undefined também não é um operador
             * cairá nesse bloco else por fim, devemos simplesmente adicionar um novo item ao array, assim a
             * instrução continuará.
             * 
             * Porém esse novo item não necessáriamente pode ser um número, pode ser um sinal ou ponto, devemos
             * verificar o que esse primeiro elemento é.
             */
            } else if (isNaN(value)) {
                
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            /**
             * Diferente dos sinais, ao digitar um número vamos concatenar com
             * outro número criando assim uma fila, se o usuário digitar um sinal significa que
             * devemos adicionar um novo item ao array ao invés de concatenar.
             * 
             * como o if nunca verifica o valor da vez, sempre o último, a instrução do if acima 
             * só será aceita caso não seja um número, se digitarmos um sinal na vez do momento, significa
             * que o último valor ainda é um número, caindo na instrução do else.
             * por isso devemos adicionar um novo elemento no array se ele for um operador.
             */

            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(parseInt(newValue));
                // método para mostrar número na tela
                this.setLastNumberToDisplay();
            }
        }
    }

    /**
     * método responsável por adicionar elemento ao array this._operation.
     * Por padrão a calculadora ao adicionar 2 números e 1 operador, ela 
     * automáticamente realiza a operação.
    */
    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3 ){
           
            // método para calcular
            this.calc();
        }
    }

    /**
     * método utilizado para realizar cáculo no array
     */
    getResult() {
        /* join pega um array e transforma em string, podemos passar 
         * como argumento aquilo que será o separador entre os elementos 
         * do array.
         * já o eval executa uma string, ele pode transformar string em
         * operação aritmética por exemplo.
        */
        console.log("getResult", this._operation);
        return eval(this._operation.join(""));
    }

    calc() {
        /**
         * se apertarmos no botão igual para realizar operação de
         * 2 números, não podemos retirar o último item do array
         */
        let lastItem;
        // pegar último operador
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            /** retira o último item do array 
             * nesse momento estamos pressupondo que o elemento que vai ser
             * tirado é um sinal, exemplo: [3 + 4 +], só existirá 4° elemento
             * se ao invés de clicarmos no igual, clicarmos em um sinal.
             * Calcula os 3 primeiros elementos, removeremos o 4° elemento para depois
             * do calculo adicionarmos ao array junto com o resultadom sendo assim:
             * [resultado, sinal]
             */
            lastItem = this._operation.pop();
            /**
             * imagina a situação em fazemos uma conta básica ex. [3 + 2 -], automáticamente
             * ele calcula os 3 primeiros elementos, mas e se apertarmos no igual ?
             * teoricamente ele deve pegar o último sinal e o último número e realizar equações
             * a cada vez que apertarmos no igual 
             */
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3) {
             /**
             * a diferença entre os if e elseif é que no if acima a gente guarda o resultado
             * como último número com o getResult(), quando dois números forem calculados
             * teremos 3 elementos ex. [3 + 4], ai o último elemento é o 4.
             */
            // pegar último número
            this._lastNumber = this.getLastItem(false);
        }
        
        console.log("último operador: ", this._lastOperator);
        console.log("último número: ", this._lastNumber);
        let result = this.getResult();

        // se o último item for porcentagem, entre no if
        if (lastItem == "%") {
            result /= 100;
            this._operation = [result];
        } else {
           
            /**
             * após isso zeramos o array e colocamos o novo resultado com o último
             * elemento digitado pelo usuário
             */
            this._operation = [result];
            // o último elemento só deve ser adicionado se ele existir
            if (lastItem) this._operation.push(lastItem);
        }
        this.setLastNumberToDisplay();

    }

    /**
     * método para trocar elemento do array pelo novo 
     */
    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    executeButtonAction(value) {
        switch(value) {
            case 'ac':
                this.clearAll();
            break;
            case 'ce':
                this.clearEntry();
            break;
            case 'soma':
                this.addOperation("+");
            break;
            case 'subtracao':
                this.addOperation("-");
            break;
            case 'multiplicacao':
                this.addOperation("*");
            break;
            case 'divisao':
                this.addOperation("/");
            break;
            case 'porcento':
                this.addOperation("%");
            break;
            case 'igual':
                this.calc();
            break;
            case 'ponto':
                this.addOperation(".");
            break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
            break;
            default:
                this.setError();
            break;
        }
    }

    /**
     * O método addEventListener adiciona somente 1 evento ao botão.
     * se precisarmos de 2 ou mais eventos no botão deveríamos criar
     * blocos de instrução separados. o método addEventListenerAll
     * adiciona múltiplos eventos ao botão.
     * 3 parâmetros: o elemento à ser recebido, evento e ação a ser executada
     */
    addEventListenerAll(element, events, action) {
        events.split(" ").forEach(event => {
            /**
             * passamos o último parâmetro como false para que o evento seja executado
             * 1 vez somente, como no nosso projeto há classes sendo repetidas (no part e no button)
             * pode ser que ele dispare cada evento 2 vezes, para isso não ocorrer, o false
             * garante que ele seja executado 1 vez
             */
            element.addEventListener(event, action, false);
        });
    }

    get displayCalc() {
        return this._displayCalcHTML.innerHTML;
    }

    set displayCalc(value) {
        this._displayCalcHTML.innerHTML = value; 
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

    get displayTime() {
        return this._hourHTML;
    }

    set displayTime(value) {
        this._hourHTML.innerHTML = value;
    }

    get displayDate() {
        return this._dateHTML.innerHTML;
    }

    set displayDate(value) {
        this._dateHTML.innerHTML = value;
    }
}