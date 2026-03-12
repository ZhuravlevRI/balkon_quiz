function QuestionAnswer({index, data, setAnswer}) {
    return (
        <div className="flex justify-between items-center gap-2 p-1">
            <input type="checkbox" className="checkbox bg-red-500 border-red-700 checked:bg-success checked:border-success" 
                checked={data.correct} onChange={e => {
                    setAnswer({
                        ...data,
                        correct: e.target.checked
                    })}
                }
            />
            <button className="badge bg-primary py-4">{index}</button>
            <input type="text" placeholder="Ответ" className="input text-lg w-full"
                value={data.answer} onChange={e => {
                    setAnswer({
                        ...data,
                        answer: e.target.value
                    })}
                }
            />
        </div>
    )
}

export function Question({index, data, setQuestionData, removeQuestion, insertQuestion}) {
    return (<>
        <button className="m-2 opacity-0 hover:opacity-100 divider text-xl" onClick={insertQuestion}>+</button>
        <div className="card bg-base-200 card-border border-base-300 card-sm p-5">
            <div className="flex justify-between items-center">
                <p className="badge badge-neutral p-4">Вопрос {index+1}</p>
                <button className="btn btn-error" onClick={() => removeQuestion(index)}>X</button>
            </div>
            <div className="card-body">
                <input type="text" placeholder="Вопрос" className="input input text-lg w-full"
                    value={data.title} onChange={e => {
                        setQuestionData(index, {
                            ...data,
                            title: e.target.value,
                        })
                    }}
                />
                <div>
                    <button className="btn btn-neutral">Добавить картинку</button>
                </div>
                <div className="divider my-0"></div>
                <div>
                    <div className="flex flex-col gap-1">
                        {data.answers.map((answer, i) => (
                            <QuestionAnswer key={i} index={i+1} data={answer}
                                setAnswer={(answerData) => setQuestionData(
                                    index,
                                    {
                                        ...data,
                                        answers: data.answers.map((answer, j) => {
                                            if(j==i) {
                                                return answerData;
                                            }
                                            return answer;
                                        })
                                    }
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </>)
}
