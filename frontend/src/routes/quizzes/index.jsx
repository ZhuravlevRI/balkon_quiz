import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quizzes/')({
  component: RouteComponent,
})

import { QuizCard } from '@/components/quizCard.jsx'

function RouteComponent() {
    return <div className="mx-12 p-3">
        <br/>
        <br/>
        <br/>
        <h1 className="text-xl">Ваши квизы</h1>
        <br/>
        <button className="ms-2 btn btn-primary btn-sm">Создать новый квиз</button>
        <div className="mt-4 flex gap-5 flex-wrap">
            <QuizCard />
        </div>
    </div>
}
