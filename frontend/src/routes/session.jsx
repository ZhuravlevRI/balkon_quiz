import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { UserPanel } from '@/components/userPanel.jsx'
import { QuizCard } from '@/components/quizCard.jsx'

export const Route = createFileRoute('/session')({
  component: RouteComponent,
})

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
            title: "Тестовый квиз",
            description: "Квиз для теста вебсайта"
        },
        {
            id: 2,
            title: "МАИ квиз",
            description: "Квиз для маёвцов про наш любимый институт"
        }
    ];
    const [isSelectingQuiz, setIsSelectingQuiz] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(undefined);

    return (
        <div>
            <div className="flex flex-col text-center h-dvh">
                <div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                </div>
                <div className="flex ms-30 me-10 justify-between gap-10 h-full mb-10">
                    <div className="pe-20">
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
                            <button className="btn btn-primary" disabled={selectedQuiz == undefined}>
                                Запустить квиз
                            </button>
                        </div>
                    </div>
                    <div className="w-full text-left">
                        { isSelectingQuiz ? (
                            <div className="h-full border rounded-box border-base-200">
                                <div>
                                    <h1 className="text-xl px-8 pt-8">Выберите квиз</h1>
                                </div>
                                <div className="divider mb-0"></div>
                                <div className="flex flex-wrap gap-3 p-8 shadow-sm">
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
        </div>
    )
}
