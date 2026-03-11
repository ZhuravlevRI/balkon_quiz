import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Question } from '@/components/question.jsx'

export const Route = createFileRoute('/quiz/$quizId')({
  component: RouteComponent,
})

function RouteComponent() {
    const tempData = {
        id: 1,
        title: "Тестовый квиз",
        description: "Квиз для тестирования работоспособности приложения",
        questions: [

        ],
    }
    const [data, setData] = useState(tempData)

    function setQuestionData(index, questionData) {
        setData({
            ...data,
            questions: data.questions.map((question, i) => {
                if(i==index) {
                    return questionData;
                }
                return question;
            })
        });
    }

    function removeQuestion(index) {
        setData({
            ...data,
            questions: [
                ...data.questions.slice(0, index),
                ...data.questions.slice(index),
            ]
        });
    }

    function insertQuestion(index, questionData) {
        setData({
            ...data,
            questions: [
                ...data.questions.slice(0, index),
                questionData,
                ...data.questions.slice(index),
            ]
        });
    }

    function emptyQuestion() {
        return {
            title: "",
            image: undefined,
            answers: [
                { answer: "", correct: false },
                { answer: "", correct: false },
                { answer: "", correct: false },
                { answer: "", correct: false },
            ]
        }
    }

    return <div>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        {/* <div className="flex flex-col justify-center items-center"> */}
        {/* </div> */}
        <div className="mx-auto max-w-3xl px-3 flex flex-col gap">
            <div className="card bg-base-200 card-border border-base-300 card-sm p-5 gap-1">
                <input type="text" placeholder="Название квиза" defaultValue={data.title} className="input text-2xl w-full" />
                <textarea type="text" placeholder="Описание" defaultValue={data.description} className="w-full textarea text-xl" />
                {/* <div className="card-body"> */}
                {/* </div> */}
            </div>
            {data.questions.map((question, i) => (
                <>
                    <button className="m-2 opacity-0 hover:opacity-100 divider text-xl">+</button>
                    <Question key={i} index={i} data={question} />
                    {/* {(i!=data.questions.length-1) && ( */}
                    {/* )} */}
                </>
            ))}
            <div className="flex justify-center">
                <button className="btn btn-primary rounded-full p-4 mt-4"
                    onClick={() => {
                        insertQuestion(
                            data.questions.length,
                            emptyQuestion()
                        )
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg>
                </button>
            </div>
        </div>
        <br/>
        <br/>
        <br/>
    </div>
}
