export function Question() {
    const questions = [];
    for(let i = 0; i < 4; i++) {
        questions.push(
            <div className="flex justify-between items-center gap-2 p-1 border border-base-300">
                <button className="badge bg-info">{i+1}</button>
                <input type="text" placeholder="Ответ" className="input text-lg w-full" />
            </div>
        );
    }
    return (
        <div className="card bg-base-200 card-border border-base-300 card-sm p-5">
            <p className="badge badge-neutral p-4">Вопрос 1</p>
            <div className="card-body">
                <input type="text" placeholder="Вопрос" className="input input-ghost text-lg w-full" />
                <div>
                    <button className="btn btn-neutral">Добавить картинку</button>
                </div>
                <div className="divider"></div>
                <div>
                    <div className="flex flex-col gap-1">
                        {questions}
                    </div>
                </div>
            </div>
        </div>
    )
}
