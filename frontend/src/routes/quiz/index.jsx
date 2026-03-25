import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/')({
  component: RouteComponent,
})

import { QuizCard } from '@/components/quizCard.jsx'

function RouteComponent() {
    const quizData = [
        {
            id: 1,
            title: "Тестовый квиз",
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

    const navigate = Route.useNavigate();

    return <div className="mx-12 p-3">
        <br/>
        <br/>
        <br/>
        <h1 className="text-3xl">Ваши квизы</h1>
        <div className="divider"></div>
        <button className="ms-2 btn btn-primary" onClick={() => navigate({ to: '/quiz/1' })}>Создать новый квиз</button>
        <div className="mt-6 flex gap-5 flex-wrap">
            {quizData.map(e => <QuizCard data={e}/>)}
        </div>
    </div>
}
