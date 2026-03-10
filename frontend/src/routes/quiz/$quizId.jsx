import { createFileRoute } from '@tanstack/react-router'

import { Question } from '@/components/question.jsx'

export const Route = createFileRoute('/quiz/$quizId')({
  component: RouteComponent,
})

function RouteComponent() {
    const data = {
        id: 1,
        title: "Тестовый квиз",
        description: "Квиз для тестирования работоспособности приложения"
    }

    return <div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        {/* <div className="flex flex-col justify-center items-center"> */}
        {/* </div> */}
        <div className="mx-auto max-w-3xl px-3 flex flex-col gap-3">
            <div className="card bg-base-200 card-border border-base-300 card-sm p-5">
                <input type="text" defaultValue={data.title} className="input input-ghost text-2xl w-full" />
                <textarea type="text" defaultValue={data.description} className="w-full textarea input-ghost text-xl" />
                {/* <div className="card-body"> */}
                {/* </div> */}
            </div>
            <Question />
            <div className="flex justify-center">
                <button className="btn btn-primary rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg>
                </button>
            </div>
        </div>
    </div>
}
