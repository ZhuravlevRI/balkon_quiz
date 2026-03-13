import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: data.id,
        animateLayoutChanges: () => false,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            className={isDragging ? "z-999 relative" : ""}
            style={style}
            {...attributes}
        >
            <button className={"w-full my-1 py-3 opacity-0 divider text-xl " + (isDragging ? "": "hover:opacity-100")} onClick={insertQuestion}>+</button>
            <div className="card bg-base-200 card-border border-base-300 card-sm p-5 pe-2">
                <div className="flex">
                    <div className="w-full">
                        <div className="flex justify-between items-center">
                            <p className="badge badge-neutral p-4">Вопрос {index+1}</p>
                            <button className="btn btn-ghost btn-error p-2 me-2" onClick={() => removeQuestion(index)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
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
                    {/* <div className="drawer"></div> */}
                    <div className={"flex flex-col justify-center hover:bg-base-300 rounded touch-none " + (isDragging ? "bg-base-300": "")}
                        {...listeners}
                        node={setActivatorNodeRef}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" className="size-6" viewBox="0 0 16 16">
                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
