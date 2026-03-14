import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
    const [roomCode, setRoomCode] = useState("")
    const [name, setName] = useState("")
    return (
        <div>
            <div className="flex items-center justify-center text-center h-dvh">
                <div className="card bg-base-200 card-border border-base-300 card-sm">
                    <div className="card-body gap-3 p-5">
                        <input type="text" placeholder="Код сессии" className="input text-lg"
                            value={roomCode} onChange={e => setRoomCode(e.target.value)}
                        />
                        <button className="btn btn-primary"
                            onClick={()=>document.getElementById('modal').showModal()}
                        >Присоединиться</button>
                    </div>
                </div>
            </div>
            <dialog id="modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Введите имя</h3>
                    <div className="card-body">
                        <input type="text" placeholder="Имя" className="input text-lg"
                            value={name} onChange={e => setName(e.target.value)}
                        />
                        <div className="pt-2">
                            <button className="btn btn-primary"

                            >Присоединиться</button>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}
