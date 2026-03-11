function QuestionAnswer({index, data}) {
    return (
        <div className="flex justify-between items-center gap-2 p-1">
            <input type="checkbox" className="checkbox bg-red-500 border-red-700 checked:bg-success checked:border-success" />
            <button className="badge bg-primary py-4">{index}</button>
            <input type="text" placeholder="Ответ" className="input text-lg w-full" />
        </div>
    )
}

export function Question({index, data}) {
    return (
        <div className="card bg-base-200 card-border border-base-300 card-sm p-5">
            <p className="badge badge-neutral p-4">Вопрос {index+1}</p>
            <div className="card-body">
                <input type="text" placeholder="Вопрос" className="input input text-lg w-full" />
                <div>
                    <button className="btn btn-neutral">Добавить картинку</button>
                </div>
                <div className="divider my-0"></div>
                <div>
                    <div className="flex flex-col gap-1">
                        {data.answers.map((answer, i) => (
                            <QuestionAnswer key={i} index={i+1} data={answer}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
