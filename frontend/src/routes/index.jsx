import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
    return (
        <div className="flex items-center justify-center text-center h-dvh">
            <div className="card bg-base-200 card-border border-base-300 card-sm">
                <div className="card-body gap-3 p-5">
                    <input type="text" placeholder="Код сессии" className="input text-lg" />
                    <button className="btn btn-primary">Присоединиться</button>
                </div>
            </div>
        </div>
    )
}
