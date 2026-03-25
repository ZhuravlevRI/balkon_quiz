import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { UserPanel } from '@/components/userPanel.jsx'
import { QuizCard } from '@/components/quizCard.jsx'

import { useAtom } from 'jotai'
import { statusAtom } from '@/atoms.jsx'

export const Route = createFileRoute('/session')({
  component: RouteComponent,
})

function Anwser({index, answer, pick}) {
    return (
        <div className="flex items-center gap-2 p-3 md:w-48/100 w-full bg-base-200 rounded-box">
            <button className="badge bg-primary py-4">{index+1}</button>
            <p className="text-xl">{answer}</p>
        </div>
    )
}

function RouteComponent() {
    const users = [
        "Лазарев Николай Владиславович", 
        "Трифонова София Львовна", 
        "Васильев Матвей Артемьевич", 
        "Романов Александр Артёмович", 
        "Максимова Софья Ярославовна", 
        "Черкасова Мария Ильинична", 
        "Титова Полина Артёмовна", 
        "Потапова Кира Станиславовна", 
        "Денисов Артём Степанович", 
        "Воробьева Кира Максимовна", 
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

    const question = {
        id: 1,
        title: "Что это такое?",
        image: undefined,
        answers: [
            "Незнаю",
            "Я программист",
            "Помогите",
            "Какае-то там функция, вроде как",
        ],
        correct: 3
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
                        <br/>
                    </div>
                    <div className="flex ms-20 me-10 justify-between gap-10 h-full mb-10">
                        <div className="pe-10">
                            <div className="flex">
                                <h1 style={{"font-size": "11em"}}className="bg-base-200 px-6 rounded-box font-semibold">
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
                                }}>
                                    Запустить квиз
                                </button>
                            </div>
                            {selectedQuiz && (
                                <div className="flex justify-center mt-4 text-left">
                                    <QuizCard data={quiz} 
                                        isSelecting={true}
                                        current={true}
                                        isDisplay={true}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="w-full text-left">
                            { isSelectingQuiz ? (
                                <div className="h-full border rounded-box border-base-200 shadow-xl">
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
                                        {users.map(e => <UserPanel user={e}/>)}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
                ) : (status == "question") ? (
                    <div className="h-dvh flex py-15">
                        <div className="mx-auto max-w-7xl px-3 flex flex-col justify-between grow gap-5">
                            <div className="text-center card bg-base-200 border border-base-300 p-5 pe-2 overflow-y-scroll shadow-sm max-h-80">
                                <h1 className="text-2xl md:text-4xl px-6 font-semibold">
                                    {question.title}
                                </h1>
                            </div>
                            <div className="flex justify-center max-w h-100">
                                <img className="object-contain" src="public/dummyquestion.jpg"/>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {question.answers.map((answer, i) => (
                                    <Anwser answer={answer} index={i}/>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (status == "ranking") ? (
                    <></>
                ) : (status == "leaderboard") ? (
                    <></>
                ) : (
                    <></>
                )
            }
        </div>
    )
}
