import {getResource} from './services';

const headElem = document.getElementById("head");
const buttonsElem = document.getElementById("buttons");
const pagesElem = document.getElementById("pages");
const btnRestart = document.querySelector('.restart');

// //Массив с вопросами и ответами
let questions = [];

// //Массив с результатами 
let results = [];

//Класс, представляющий сам тест
class Quiz {
    constructor (type, questions, results) {
        // Type test. Classic - 1 / 2 
        this.type = type;

        // Массив с вопросами
        this.questions = questions;

        // Массив с возможными результатам
        this.results = results;

        // Количество набранных очков
        this.score = 0;

        // Номер результата из массива
        this.result = 0;

        // Текущий вопрос
        this.current = 0;
    }

    Click(index) {
        // Добавляем очки
        let value = this.questions[this.current].Click(index);
        this.score += value;

        let correct = -1;

        //Если было добавлено хотя бы одно очко, то считаем, что ответ верный
        if(value >= 1) {
           correct = index;
        } else { //Иначе ищем, какой ответ может быть правильным
            for (let i = 0; i < this.questions[this.current].answers.length; i++) {
                if (this.questions[this.current].answers[i].value >= 1) {
                    correct = i;
                    break;
                }
            }
        }

       this.Next();
       return correct;
    }

    // Переход к следующем вопросу
    Next () {
        this.current++;
        if (this.current >= this.questions.length) {
            this.End();
        }
    }

    // Если вопросы кончились, метод проверяет какой результат получился у пользователя
    End () {
        for (let i = 0; i < this.results.length; i++) {
            if (this.results[i].Check(this.score)) {
                this.result = i;
            }
        }
    }

}

// Класс, представляющий вопросы
class Question {
    constructor (text, answers) {
        this.text = text;
        this.answers = answers;
    }
    Click (index) {
        return this.answers[index].value;
    }
}
    
// Класс, представляющий ответы
class Answer {
   constructor(text, value) {
       this.text = text;
       this.value = value;
   }
}

// Получаем вопросы и ответы с сервера
getResource('http://localhost:3000/questions')
.then(data => {
    data.forEach(function (element) {
        for (let key in element) {
            let array = [];
            questions.push(new Question(key, array));
            let answersInKey = element[key][0];

            for (let key in answersInKey) {
                array.push(new Answer(key, answersInKey[key]));
            }

        }
    });
});

// Класс, представляющий результаты
class Result {
    constructor (text, value) {
        this.text = text;
        this.value = value;
    }

    // Проверка достаточно ли очков набрал юзер
    Check (value) {
        if (this.value <= value) {
            return true;
        } else {
            return false;
        }
    }
}

Update();

async function Update () {
    // Дожидаемся ответа результатов с сервера
    await getResource('http://localhost:3000/results')
    .then(data => {
        data.forEach(function (element) {
            for (let key in element) {
                results.push(new Result(element[key], key));
            }
        });
    });

    if (quiz.current < quiz.questions.length) {
        // Если есть, меняем вопрос в заголовке
        headElem.innerHTML = quiz.questions[quiz.current].text;

        // Удаляем старые варианты ответов
        buttonsElem.innerHTML = '';

        // Создаем кнопки для новых ваиантов ответов 
        for (let i = 0; i < quiz.questions[quiz.current].answers.length; i++) {
            let btn = document.createElement('button');
            btn.className = 'button';
            btn.innerHTML = quiz.questions[quiz.current].answers[i].text;
            btn.setAttribute('index', i);
            buttonsElem.appendChild(btn);
        }

        //Выводим номер текущего вопроса
        pagesElem.innerHTML = (quiz.current + 1) + ' / ' + quiz.questions.length;

        // Вызываем функцию, которая прикрепит события к новым кнопкам
        Init();
    } else {
        // Если конец то показывае результат
        btnRestart.style.display = 'block';
        buttonsElem.innerHTML = '';
        headElem.innerHTML = quiz.results[quiz.result].text;
        pagesElem.innerHTML = 'Очки: ' + quiz.score;
    }
}

// Инициализируем все кнопки
function Init(){
	//Находим все кнопки
	let btns = document.getElementsByClassName("button");
	for(let i = 0; i < btns.length; i++) {
		//Прикрепляем событие для каждой отдельной кнопки
		//При нажатии на кнопку будет вызываться функция Click()
		btns[i].addEventListener("click", function (e) { Click(e.target.getAttribute("index")); });
	}
}

// Обрабатываем клик по ответу
function Click (index) {
    // Правильный ответ:
    let correct = quiz.Click(index);
    // Находим все кнопки.
    let btns = document.getElementsByClassName('button');

    // Делаем кнопки серыми
    for (let i = 0; i < btns.length; i++) {
        btns[i].className = 'button button_passive';
    }

    //Если это тест тип №1, то мы подсвечиваем правильный ответ зелёным, а неправильный - красным
   if(quiz.type == 1) {
       if(correct >= 0) {
           btns[correct].className = "button button_correct";
       }
       if(index != correct) {
           btns[index].className = "button button_wrong";
       }
   }
   else {
       //Иначе просто подсвечиваем зелёным ответ пользователя
       btns[index].className = "button button_correct";
   }
 
   //Ждём секунду и обновляем тест
   setTimeout(Update, 1000);
}

// Начинаем опрос сначала
btnRestart.addEventListener('click', () => {
    location.reload();
});

//Сам тест
const quiz = new Quiz(1, questions, results);