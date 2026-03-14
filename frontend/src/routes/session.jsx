import { createFileRoute } from '@tanstack/react-router'

import { UserPanel } from '@/components/userPanel.jsx'

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
                            <button className="btn btn-neutral">
                                Выбрать квиз
                            </button>
                            <button className="btn btn-primary">
                                Запустить квиз
                            </button>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="flex flex-wrap gap-3 px-8">
                            {users.map(e => (
                                <UserPanel user={e}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
