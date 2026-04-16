import { Link } from '@tanstack/react-router'

import { deleteQuiz } from '@/api.js'

import { useMutation, useQueryClient } from "@tanstack/react-query"

import toast from 'react-hot-toast';
import { handleError } from '@/utils.js';

export function QuizCard({ data, isSelecting, current, setQuiz, isDisplay }) {
    const queryClient = useQueryClient()

    const quizDeleteMutation = useMutation({
        mutationFn: deleteQuiz,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["quizes"] })
            toast.success("Квиз был успешно удален")
        },
        onError: handleError.bind(toast.error),
    })

    return (
        <div className={"card card-md bg-base-200 border-base-300 rounded-box border p-4 " + (isDisplay ? "w-full lg:h-100" : "w-md")}>
            <div className="border-base-300 border-b border-dashed flex items-center justify-between pb-2">
                <div className="badge p-4 me-3">{data.questionCount || 0}</div>
                { isSelecting ? 
                    (
                        <>
                            <a className={"link link-hover " + (isDisplay ? "text-3xl w-full" : "")}
                                onClick={setQuiz}
                            >{data.title}</a>
                            { (!isDisplay) && (
                                <button className={"btn " + (current ? "btn-info" : "btn-neutral")}
                                    onClick={setQuiz}
                                >
                                    {current ? "Выбран" : "Выбрать"}
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to={"/quiz/"+data.id} className="link link-hover">{data.title}</Link>
                            <details className="dropdown">
                                <summary className="btn btn-ghost px-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5"> <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /> </svg>
                                </summary>
                                <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                    <li><Link to={"/quiz/"+data.id}>Открыть</Link></li>
                                    <li><button className="text-error"
                                        onClick={() => quizDeleteMutation.mutate(data.id)}
                                    >Удалить</button></li>
                                </ul>
                            </details>
                        </>
                    )
                }
            </div>
            <div className={"card-body pb-2 " + (isDisplay ? "text-xl" : "")}>
                <p>{data.description}</p>
            </div>
        </div>
    )
}
