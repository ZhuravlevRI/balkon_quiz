import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { UserPanel } from '@/components/userPanel.jsx'
import { QuizCard } from '@/components/quizCard.jsx'

import { useAtom } from 'jotai'
import { statusAtom } from '@/atoms.jsx'

export const Route = createFileRoute('/session')({
  component: RouteComponent,
})

function Anwser({index, answer, pick, picked, correct}) {
    return (
        <button className={"flex items-center gap-2 p-3 md:w-48/100 w-full bg-base-200 rounded-box " + 
            (picked ? "outline-3 " + (correct == undefined ? "" : correct==index ? "outline-success" : "outline-error") : "")}
        onClick={pick}>
            <div className={"badge py-4 " + (correct == undefined ? "bg-primary" : correct==index ? "bg-success" : "bg-error")}>{index+1}</div>
            <p className="text-xl">{answer}</p>
        </button>
    )
}

function RouteComponent() {
    const users = [
        {name: "Лазарев Николай Владиславович", score: 100},
        {name: "Трифонова София Львовна", score: 100},
        {name: "Васильев Матвей Артемьевич", score: 100},
        {name: "Романов Александр Артёмович", score: 100},
        {name: "Максимова Софья Ярославовна", score: 100},
        {name: "Черкасова Мария Ильинична", score: 100},
        {name: "Титова Полина Артёмовна", score: 100},
        {name: "Потапова Кира Станиславовна", score: 100},
        {name: "Денисов Артём Степанович", score: 100},
        {name: "Воробьева Кира Максимовна", score: 100},
        {name: "Максимова Софья Ярославовна", score: 100},
        {name: "Черкасова Мария Ильинична", score: 100},

        {name: "Титова Полина Артёмовна", score: 100},
        {name: "Потапова Кира Станиславовна", score: 100},
        {name: "Денисов Артём Степанович", score: 100},
        {name: "Воробьева Кира Максимовна", score: 100},
        {name: "Максимова Софья Ярославовна", score: 100},
        {name: "Черкасова Мария Ильинична", score: 100},
    ];
    const quizData = [
        {
            id: 1,
            title: "Тестовый квиз с длинным, интересным названием",
            description: "Квиз для теста вебсайта",
            questionCount: 10,
        },
        {
            id: 2,
            title: "МАИ квиз",
            description: "Квиз для маёвцов про наш любимый институт",
            questionCount: 15,
        }
    ];
    const [isSelectingQuiz, setIsSelectingQuiz] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(undefined);
    const quiz = quizData.find(x => x.id == selectedQuiz);

    // const [status, setStatus] = useState("idle");
    // const [status, setStatus] = useState("question");
    const [status, setStatus] = useAtom(statusAtom);

    const [question, setQuestion] = useState({
        id: 1,
        title: "Что это такое?",
        image: undefined,
        answers: [
            "Незнаю",
            "Я программист",
            "Помогите",
            "Какае-то там функция, вроде как",
        ],
        correct: undefined
    });

    const [pickedAnswer, setPickedAnswer] = useState(undefined);

    function pickAnswer(index) {
        setPickedAnswer(index)
    }

    return (
        <div>
            {(status == "idle") ? (
                <div className="flex flex-col text-center h-dvh">
                    <div>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                    </div>
                    <div className="flex lg:ms-20 lg:me-20 justify-between gap-10 h-full mb-10 lg:flex-nowrap flex-wrap justify-center">
                        <div className="">
                            <div className="flex justify-center">
                                <h1 className="text-[6em] sm:text-[11em] bg-base-200 px-6 rounded-box font-semibold">
                                    A3sE5
                                </h1>
                            </div>
                            <br/>
                            <div className="flex justify-center gap-5">
                                <button className="btn btn-neutral"
                                onClick={() => setIsSelectingQuiz(!isSelectingQuiz)}>
                                    Выбрать квиз
                                </button>
                                <button className="btn btn-primary" disabled={selectedQuiz == undefined}
                                onClick={() => {
                                        document.getElementById("root").requestFullscreen()
                                        setStatus("question")
                                        setSelectedQuiz(undefined)
                                        setPickedAnswer(undefined)
                                }}>
                                    Запустить квиз
                                </button>
                            </div>
                            {selectedQuiz && (
                                <div className="flex justify-center mt-6 text-left mx-5 lg:mx-0">
                                    <QuizCard data={quiz} 
                                        isSelecting={true}
                                        current={true}
                                        isDisplay={true}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="w-full text-left mb-5">
                            { isSelectingQuiz ? (
                                <div className="h-full border rounded-box border-base-200 shadow-xl mx-2">
                                    <div>
                                        <h1 className="text-xl px-8 pt-8">Выберите квиз</h1>
                                    </div>
                                    <div className="divider mb-0"></div>
                                    <div className="flex flex-wrap gap-3 p-8">
                                        {quizData.map(e => (
                                            <QuizCard data={e} 
                                                isSelecting={true}
                                                current={e.id == selectedQuiz}
                                                setQuiz={() => {
                                                    setSelectedQuiz(e.id)
                                                    setIsSelectingQuiz(false)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                    <div className="flex flex-wrap gap-3 px-8">
                                        {users.map(e => <UserPanel user={e} scoreless admin={true}/>)}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
                ) : (status == "question") ? (
                    <div className="h-dvh flex pb-4">
                        <div className="mx-auto max-w-7xl px-3 flex flex-col justify-between grow gap-5">
                            <div>
                                <div className="flex">
                                    <div className="flex w-1/3"></div>
                                    <div className="flex w-1/3 justify-center">
                                        <div className="text-center card card-sm bg-base-200 border border-base-300 my-3 p-1">
                                            <h1 className="text-2xl px-2 font-semibold">
                                                {question.id}/10
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex w-1/3 justify-end">
                                        <div className="text-center card card-sm bg-base-200 border border-base-300 my-3 p-1">
                                            <div className="flex items-center gap-2 px-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                </svg>
                                                <h1 className="text-2xl pe-1 font-semibold">
                                                    5/10
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center card bg-base-200 border border-base-300 p-5 pe-2 overflow-y-scroll shadow-sm max-h-80">
                                    <h1 className="text-2xl md:text-4xl px-6 font-semibold">
                                        {question.title}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex justify-center max-w h-100">
                                <img className="object-contain" src="dummyquestion.jpg"/>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {question.answers.map((answer, i) => (
                                        <Anwser answer={answer} index={i} pick={() => {
                                            if(question.correct == undefined) pickAnswer(i)
                                        }}
                                            picked={pickedAnswer == i} correct={question.correct}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <div className="flex flex-row items-center justify-center card bg-base-200 p-3 gap-3">
                                        <button className="btn btn-neutral"
                                            onClick={() => {
                                                setStatus("idle")
                                                setQuestion({...question, correct: undefined})
                                            }}>Завершить квиз</button>
                                        <div className="divider divider-horizontal mx-1"></div>
                                        {(question.correct == undefined) ? (
                                            <button className="btn btn-primary"
                                                onClick={() => {
                                                    setQuestion({
                                                        ...question,
                                                        correct: 3
                                                    })
                                                }}
                                            >Завершить вопрос</button>
                                        ) : (
                                            <button className="btn btn-primary"
                                                onClick={() => setStatus("ranking")}
                                            >Следующий вопрос</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (status == "ranking") ? (
                    <div className="h-dvh max-h-dvh flex">
                        <div className="grow flex flex-col text-center gap-5 py-15">
                            <div className="flex grow justify-center">
                                <div className="text-center card outline-none card-sm bg-base-200 border border-base-300 p-4 mx-4">
                                    <h1 className="text-5xl">Результаты вопроса {question.id}/10</h1>
                                </div>
                            </div>
                            <div className="flex flex-row-reverse text-center gap-5 justify-center flex-wrap grow min-h-0 content-start">
                                {/* <div className="flex flex-col "> */}
                                    {/* {users.map(e => <UserPanel user={e}/>)} */}
                                    {/* <div className="flex flex-col hcard border rounded-box border-base-200 "> */}
                                        {/* <div className="flex flex-col gap-3 px-8 card-body"> */}
                                        {/* </div> */}
                                    {/* </div> */}
                                    {/* <h1 className="text-5xl">aontsehuaosnteu</h1> */}
                                {/* </div> */}
                                <div className="flex flex-col text-center gap-5 justify-center">
                                    <UserPanel user={{name: "Текующий игрок", score: 100}}/>
                                    <div className="flex flex-row items-center justify-center card bg-base-200 p-3 gap-3">
                                        <button className="btn btn-neutral"
                                            onClick={() => {
                                                setStatus("idle")
                                                setQuestion({...question, correct: undefined})
                                            }}>Завершить квиз</button>
                                        <div className="divider divider-horizontal mx-1"></div>
                                        <button className="btn btn-primary"
                                            onClick={() => setStatus("leaderboard")}
                                        >Следующий вопрос</button>
                                    </div>
                                </div>
                                <div className="lg:max-h-full flex flex-col ">
                                    <div className="flex flex-col card border rounded-box border-base-200 overflow-y-scroll mx-2">
                                        <div className="flex flex-col gap-3 px-4 lg:px-8 card-body">
                                            {users.map((e, i) => <UserPanel user={e} index={i+1} admin={true}/>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (status == "leaderboard") ? (
                    <></>
                ) : (
                    <></>
                )
            }
        </div>
    )
}
