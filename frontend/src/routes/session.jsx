import { Fragment, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { UserPanel } from '@/components/userPanel.jsx'
import { QuizCard } from '@/components/quizCard.jsx'

import { useAtom } from 'jotai'
import { statusAtom } from '@/atoms.jsx'

import {
    useMutation,
    useInfiniteQuery,
    useQuery,
    useQueryClient
} from '@tanstack/react-query'

import { 
    getQuizList,
    postCreateSession,
    getSessionStatus,
    deleteSession,
    postSessionQuiz,
    getSessionPlayerList,
    postSessionPlayerKick,
    postSessionProgress,
    getImage
} from "@/api.js"

import toast from 'react-hot-toast';
import { handleError } from '@/utils.js';

import { useAuth } from '@/hooks/useAuth.jsx'

export const Route = createFileRoute('/session')({
  component: RouteComponent,
})

function Anwser({index, answer, pick, picked, correct}) {
    return (
        <button className={"flex items-center gap-2 p-3 md:w-48/100 w-full bg-base-200 rounded-box " + 
            (picked ? "outline-3 " + (correct == undefined ? "" : correct==index ? "outline-success" : "outline-error") : "")}
        onClick={pick}>
            <div className={"badge py-4 " + (correct == undefined ? "bg-primary" : correct==index ? "bg-success" : "bg-error")}>{index+1}</div>
            <p className="text-xl">{answer}</p>
        </button>
    )
}

function RouteComponent() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    // const users = [
    //     {name: "Лазарев Николай Владиславович", score: 100},
    //     {name: "Трифонова София Львовна", score: 100},
    //     {name: "Васильев Матвей Артемьевич", score: 100},
    //     {name: "Романов Александр Артёмович", score: 100},
    //     {name: "Максимова Софья Ярославовна", score: 100},
    //     {name: "Черкасова Мария Ильинична", score: 100},
    //     {name: "Титова Полина Артёмовна", score: 100},
    //     {name: "Потапова Кира Станиславовна", score: 100},
    //     {name: "Денисов Артём Степанович", score: 100},
    //     {name: "Воробьева Кира Максимовна", score: 100},
    //     {name: "Максимова Софья Ярославовна", score: 100},
    //     {name: "Черкасова Мария Ильинична", score: 100},
    //
    //     {name: "Титова Полина Артёмовна", score: 100},
    //     {name: "Потапова Кира Станиславовна", score: 100},
    //     {name: "Денисов Артём Степанович", score: 100},
    //     {name: "Воробьева Кира Максимовна", score: 100},
    //     {name: "Максимова Софья Ярославовна", score: 100},
    //     {name: "Черкасова Мария Ильинична", score: 100},
    // ];

    const {
        data: users,
        usersRefetch,
    } = useQuery({
        queryKey: ['players'],
        queryFn: getSessionPlayerList,
        refetchInterval: 5_000, // every 5 seconds
        retry: false
    })

    const {
        data: quizPoll,
        status: pollStatus,
        refetch: refetchStatus
    } = useQuery({
        queryKey: ['prices'],
        queryFn: getSessionStatus,
        refetchInterval: 2_000, // every 5 seconds
        retry: false
    })
    console.log(quizPoll)
    // console.log(pollStatus)

    const [status, setStatus] = useAtom(statusAtom);
    const [pickedAnswer, setPickedAnswer] = useState(undefined);

    if(quizPoll) {
        if(quizPoll.status != "idle" && status == "idle") {
            setStatus(1)
        }
        if(quizPoll.status == "idle" && status != "idle") {
            setStatus("idle")
        }
        if(!(quizPoll?.status == "question" || quizPoll?.status == "question_with_answers") && pickedAnswer != undefined) {
            setPickedAnswer(undefined)
        }
    }

    const postCreateSessionMutation = useMutation({
        mutationFn: (data) => postCreateSession(),
        onError: handleError.bind(toast.error),
        onSuccess: () => {
            refetchStatus()
        }
    })

    const deleteSessionMutation = useMutation({
        mutationFn: (data) => deleteSession(),
        onError: handleError.bind(toast.error),
        onSuccess: () => {
            refetchStatus()
        }
    })

    const postSessionPlayerKickMutation = useMutation({
        mutationFn: (data) => postSessionPlayerKick(data.id),
        onError: handleError.bind(toast.error),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["players"] })
        }
    })

    const postSessionQuizMutation = useMutation({
        mutationFn: (data) => postSessionQuiz(data.id),
        onError: handleError.bind(toast.error),
        onSuccess: (data, context) => {
            setQuiz(context)
            setIsSelectingQuiz(false)
        }
    })

    const postSessionProgressMutation = useMutation({
        mutationFn: (data) => postSessionProgress(),
        onError: handleError.bind(toast.error),
        onSuccess: () => {
            refetchStatus()
        }
    })

    const {
        data: quizesData,
        error: quizesError,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status: quizesStatus,
    } = useInfiniteQuery({
        queryKey: ['quizes'],
        queryFn: getQuizList,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0 || lastPage.length < 10) {
                return null;
            }
            return lastPageParam + 1;
        },
    })

    const [isSelectingQuiz, setIsSelectingQuiz] = useState(false);
    const [quiz, setQuiz] = useState(undefined);

    const [question, setQuestion] = useState({
        id: 1,
        title: "Что это такое?",
        image: undefined,
        answers: [
            "Незнаю",
            "Я программист",
            "Помогите",
            "Какае-то там функция, вроде как",
        ],
        correct: undefined
    });


    function pickAnswer(index) {
        setPickedAnswer(index)
    }


    return (
        <div>
            {(user && pollStatus == "error") ? (
                <div className="flex items-center justify-center text-center h-dvh">
                    <div className="card bg-base-200 card-border border-base-300 card-sm outline-none ">
                        <div className="card-body gap-3 p-5">
                            <button className="btn btn-primary"
                                onClick={postCreateSessionMutation.mutate}
                            >Создать сессию</button>
                        </div>
                    </div>
                </div>
            ) : (!user && pollStatus == "error") ? (
                <div className="flex items-center justify-center text-center h-dvh">
                    <div className="card bg-base-200 card-border border-base-300 card-sm outline-none">
                        <div className="card-body gap-3 p-5">
                            <p className="text-xl">Нету доступа к сессии</p>
                        </div>
                    </div>
                </div>
            ) : (quizPoll?.status == "idle") ? (
                <div className="flex flex-col text-center h-dvh max-h-dvh">
                    <div>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                    </div>

                    <div className="flex lg:ms-20 lg:me-20 justify-between gap-10 grow min-h-0 mb-10 lg:flex-nowrap flex-wrap justify-center">
                        <div className="">
                            <div className="flex justify-center">
                                <h1 className="text-[6em] sm:text-[11em] bg-base-200 px-6 rounded-box font-semibold">
                                    {quizPoll.code}
                                </h1>
                            </div>
                            <br/>
                            <div className="flex justify-center gap-3">
                                {(user) ? (
                                    <>
                                        <button className="btn btn-neutral"
                                        onClick={() => setIsSelectingQuiz(!isSelectingQuiz)}>
                                        Выбрать квиз
                                        </button>
                                        <button className="btn btn-primary" disabled={quiz == undefined}
                                        onClick={() => {
                                            // document.getElementById("root").requestFullscreen()
                                            // setStatus("question")
                                            setQuiz(undefined)
                                            setPickedAnswer(undefined)
                                            postSessionProgressMutation.mutate()
                                        }}>
                                        Запустить квиз
                                        </button>
                                        <button className="btn btn-error"
                                        onClick={deleteSessionMutation.mutate}>
                                        Завершить сессию
                                        </button>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </div>
                            {quiz && (
                                <div className="flex justify-center mt-6 text-left mx-5 lg:mx-0">
                                    <QuizCard data={quiz} 
                                        isSelecting={true}
                                        current={true}
                                        isDisplay={true}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="text-left mb-5 flex flex-col max-h-full w-full">
                            {/* <div className=""> */}
                            { isSelectingQuiz ? (
                                <div className="border rounded-box border-base-200 shadow-xl flex flex-col grow max-h-full w-full">
                                    <div>
                                        <h1 className="text-xl px-8 pt-8">Выберите квиз</h1>
                                    </div>
                                    <div className="divider mb-0"></div>
                                    {quizesStatus == 'pending' ? (
                                        <div className="justify-center">
                                            <span className="loading loading-spinner loading-xl"></span>
                                        </div>
                                    ) : quizesStatus == 'error' ? (
                                        <p className="text-center text-2xl"> Ошибка: {quizesError.message} </p>
                                    ) : quizesData?.pages[0].length == 0 ? (
                                        <p className="text-center text-2xl"> Нет квизов </p>
                                    ) : (
                                        <div className="flex flex-col grow lg:overflow-y-scroll">
                                            <div className="flex flex-wrap justify-center gap-3 grow content-start p-4">
                                                {quizesData?.pages.map((group, i) => (
                                                    <Fragment key={i}>
                                                        {group.map(e => (
                                                            <QuizCard data={e} 
                                                                key={e.id}
                                                                isSelecting={true}
                                                                current={e.id == quiz?.id}
                                                                setQuiz={() => {
                                                                    console.log("aoeuou", e)
                                                                    postSessionQuizMutation.mutate(e)
                                                                }}
                                                            />
                                                        ))}
                                                    </Fragment>
                                                ))}
                                            </div>
                                            <div className="flex justify-center pb-4">
                                                {quizesData?.pages[0].length > 0 && (
                                                    <button className="btn btn-primary"
                                                        onClick={() => fetchNextPage()}
                                                        disabled={!hasNextPage || isFetching}
                                                    >
                                                        {isFetchingNextPage
                                                            ? 'Загрузка...'
                                                            : hasNextPage
                                                                ? 'Загрузить больше'
                                                                : 'Все квизы загружены'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {(isFetching && !isFetchingNextPage) && (
                                        <div className="justify-center">
                                            <span className="loading loading-spinner loading-xl"></span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                    <div className="flex flex-wrap gap-3 px-8 lg:overflow-y-scroll">
                                    {(users) && (
                                            users.map((e, i) => <UserPanel key={i} user={e} scoreless admin={!!user} kick={() => postSessionPlayerKickMutation.mutate(e)}/>)
                                        )
                                    }
                                    </div>
                                )
                            }
                            {/* </div> */}
                        </div>
                    </div>
                </div>
                ) : (quizPoll?.status == "question" || quizPoll?.status == "question_with_answers" ) ? (
                    <div className="h-dvh flex pb-4">
                        <div className="mx-auto max-w-7xl px-3 flex flex-col justify-between grow gap-5">
                            <div>
                                <div className="flex">
                                    <div className="flex w-1/3"></div>
                                    <div className="flex w-1/3 justify-center">
                                        <div className="text-center card card-sm bg-base-200 border border-base-300 my-3 p-1">
                                            <h1 className="text-2xl px-2 font-semibold">
                                                {question.id}/10
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex w-1/3 justify-end">
                                        <div className="text-center card card-sm bg-base-200 border border-base-300 my-3 p-1">
                                            <div className="flex items-center gap-2 px-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                </svg>
                                                <h1 className="text-2xl pe-1 font-semibold">
                                                    0/{quizPoll.players_count}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center card bg-base-200 border border-base-300 p-5 pe-2 overflow-y-scroll shadow-sm max-h-80">
                                    <h1 className="text-2xl md:text-4xl px-6 font-semibold">
                                        {quizPoll.question.title}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex justify-center max-w h-100">
                                {quizPoll.question.img && (
                                    <img className="object-contain" src={getImage(quizPoll.question.img)}/>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {quizPoll.question.answers.map((answer, i) => (
                                        <Anwser key={i} answer={answer} index={i} pick={() => {
                                            if(quizPoll.correct_answer == undefined) pickAnswer(i)
                                        }}
                                            picked={pickedAnswer == i} correct={quizPoll.correct_answer}
                                        />
                                    ))}
                                </div>
                                {(user) ? (
                                    <div className="flex justify-center">
                                        <div className="flex flex-row items-center justify-center card bg-base-200 p-3 gap-3">
                                            <button className="btn btn-neutral"
                                                onClick={() => {
                                                    setStatus("idle")
                                                    setQuestion({...question, correct: undefined})
                                                }}>Завершить квиз</button>
                                            <div className="divider divider-horizontal mx-1"></div>
                                            {(question.correct_answer == undefined) ? (
                                                <button className="btn btn-primary"
                                                    onClick={() => {
                                                        postSessionProgressMutation.mutate()
                                                    }}
                                                >Завершить вопрос</button>
                                            ) : (
                                                <button className="btn btn-primary"
                                                    onClick={() => postSessionProgressMutation.mutate()}
                                                >Следующий вопрос</button>
                                            )}
                                        </div>
                                    </div>
                                ) : ( <></> )}
                            </div>
                        </div>
                    </div>
                ) : (quizPoll?.status == "ranking") ? (
                    <div className="h-dvh max-h-dvh flex">
                        <div className="grow flex flex-col text-center gap-5 py-15">
                            <div className="flex justify-center">
                                <div className="text-center card outline-none card-sm bg-base-200 border border-base-300 p-4 mx-4">
                                    <h1 className="text-5xl">Результаты вопроса {quizPoll.question_number+1}/{quizPoll.total_questions}</h1>
                                </div>
                            </div>
                            <div className="flex flex-row-reverse text-center gap-5 justify-center flex-wrap grow min-h-0 content-start">
                                {/* <div className="flex flex-col "> */}
                                    {/* {users.map(e => <UserPanel user={e}/>)} */}
                                    {/* <div className="flex flex-col hcard border rounded-box border-base-200 "> */}
                                        {/* <div className="flex flex-col gap-3 px-8 card-body"> */}
                                        {/* </div> */}
                                    {/* </div> */}
                                    {/* <h1 className="text-5xl">aontsehuaosnteu</h1> */}
                                {/* </div> */}
                                <div className="flex flex-col text-center gap-5 justify-center">
                                    <UserPanel user={{username: "Текщий игрок", score: 0}} index={1}/>
                                        {user && (
                                    <div className="flex flex-row items-center justify-center card bg-base-200 p-3 gap-3">
                                        <button className="btn btn-neutral"
                                            onClick={() => {
                                                setStatus("idle")
                                                setQuestion({...question, correct: undefined})
                                            }}>Завершить квиз</button>
                                        <div className="divider divider-horizontal mx-1"></div>
                                        <button className="btn btn-primary"
                                            onClick={() => postSessionProgressMutation.mutate()}
                                        >Следующий вопрос</button>
                                    </div>
                                        )}
                                </div>
                                <div className="lg:max-h-full flex flex-col ">
                                    <div className="flex flex-col card border rounded-box border-base-200 overflow-y-scroll mx-2">
                                        <div className="flex flex-col gap-3 px-4 lg:px-8 card-body">
                                            {users.map((e, i) => <UserPanel user={e} key={i} index={i+1} admin={!!user}/>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (quizPoll?.status == "leaderboard") ? (
                    <div className="grow flex flex-col text-center gap-5 py-6">
                        <div className="flex grow justify-center">
                            <div className="text-center card outline-none card-sm bg-base-200 border border-base-300 p-4 mx-4">
                                <h1 className="text-5xl">Результаты квиза</h1>
                            </div>
                        </div>
                        <div className="flex justify-center">
                                    <div className="grow flex max-w-3xl justify-center gap-5 items-end h-75 md:h-125 mx-3">
                                        <div className="flex flex-col gap-3 h-17/20 w-1/3">
                                            <h1 className="text-md md:text-2xl">Игрок 1</h1>
                                            <div className="grow flex flex-col bg-slate-400 rounded-box justify-between items-center p-3 pb-6">
                                                <div className="text-3xl md:text-5xl">
                                                    300
                                                </div>
                                                <div className="text-3xl md:text-5xl rounded-full bg-slate-500 border-0 badge p-6 md:p-8">
                                                    2
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 h-full w-1/3">
                                            <h1 className="text-md md:text-2xl">Игрок 2</h1>
                                            <div className="grow flex flex-col bg-yellow-500 rounded-box justify-between items-center p-3 pb-6">
                                                <div className="text-3xl md:text-5xl">
                                                    500
                                                </div>
                                                <div className="text-3xl md:text-5xl rounded-full bg-yellow-600 border-0 badge p-6 md:p-8">
                                                    1
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 h-7/10 w-1/3">
                                            <h1 className="text-md md:text-2xl">Игрок 3</h1>
                                            <div className="grow flex flex-col bg-yellow-700 rounded-box justify-between items-center p-3 pb-6">
                                                <div className="text-3xl md:text-5xl">
                                                    200
                                                </div>
                                                <div className="text-3xl md:text-5xl rounded-full bg-yellow-800 border-0 badge p-6 md:p-8">
                                                    3
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        </div>
                        <div className="flex grow justify-center">
                            <div className="flex flex-col text-center gap-5 justify-center">
                                <UserPanel user={{username: "Текущий игрок", score: 0}} index={1}/>
                            </div>
                        </div>
                        <div className="flex grow justify-center">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col card border rounded-box border-base-200 overflow-y-scroll mx-2">
                                    <div className="flex flex-col gap-3 px-4 lg:px-8 card-body">
                                        {users.map((e, i) => <UserPanel user={e} key={i} index={i+1} admin={!!user}/>)}
                                    </div>
                                </div>
                                        <div className="flex justify-center">
                                            {user && (
                                            <div className="flex flex-row items-center justify-center card bg-base-200 p-3 gap-3">
                                                <button className="btn btn-neutral"
                                                    onClick={() => {
                                                        // setStatus("idle")
                                                        // setQuestion({...question, correct: undefined})
                                                        postSessionProgressMutation.mutate()
                                                    }}>Завершить квиз</button>
                                            </div>
                                            )}
                                        </div>
                            </div>
                        </div>
                    </div>
                ) : (
                        <div className="flex items-center justify-center text-center h-dvh">
                            <div className="card bg-base-200 card-border border-base-300 card-sm">
                                <div className="card-body gap-3 p-5">
                                    <button className="btn btn-primary"
                                        onClick={postCreateSessionMutation.mutate}
                                    >Создать сессию</button>
                                </div>
                            </div>
                        </div>
                )
            }
        </div>
    )
}
