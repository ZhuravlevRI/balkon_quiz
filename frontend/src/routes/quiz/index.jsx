import { Fragment } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
    useMutation,
    useInfiniteQuery
} from '@tanstack/react-query'

export const Route = createFileRoute('/quiz/')({
  component: RouteComponent,
})

import { QuizCard } from '@/components/quizCard.jsx'

import { 
    postQuizCreate,
    getQuizList
} from "@/api.js"

import toast from 'react-hot-toast';
import { handleError } from '@/utils.js';

function RouteComponent() {
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
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
    console.log(data, status, error, hasNextPage, isFetching)

    const navigate = Route.useNavigate();

    const quizCreateMutation = useMutation({
        mutationFn: postQuizCreate,
        onSuccess: (data) => {
            navigate({ to: "/quiz/$quizId", params: { quizId: data.id } })
        },
        onError: handleError.bind(toast.error),
    })

    return <div className="md:mx-4 p-4">
        <br/>
        <br/>
        <br/>
        <h1 className="text-3xl">Ваши квизы</h1>
        <div className="divider"></div>
        <button className="ms-2 btn btn-primary mb-6" onClick={quizCreateMutation.mutate}>Создать новый квиз</button>
        {status == 'pending' ? (
            <div className="justify-center">
                 <span className="loading loading-spinner loading-xl"></span>
            </div>
        ) : status == 'error' ? (
            <p className="text-center text-2xl"> Ошибка: {error.message} </p>
        ) : data?.pages[0].length == 0 ? (
            <p className="text-center text-2xl"> Нет квизов </p>
        ) : (
            <div className="flex gap-5 flex-wrap">
            {data.pages.map((group, i) => (
                <Fragment key={i}>
                    {group.map(e => <QuizCard key={e.id} data={e}/>)}
                </Fragment>
            ))}
            </div>
        )}
        {(isFetching && !isFetchingNextPage) && (
            <div className="justify-center">
                 <span className="loading loading-spinner loading-xl"></span>
            </div>
        )}
        <div className="lg:justify-start flex justify-center ms-2 mt-6">
            {data?.pages[0].length > 0 && (
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
}
