import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Question } from '@/components/question.jsx'

export const Route = createFileRoute('/quiz/$quizId')({
  component: RouteComponent,
})

import {
    DndContext,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToVerticalAxis,
    restrictToParentElement
} from '@dnd-kit/modifiers';
import { CSS } from "@dnd-kit/utilities";

function RouteComponent() {
    const tempData = {
        id: 1,
        title: "Тестовый квиз",
        description: "Квиз для тестирования работоспособности приложения",
        questions: [],
    }
    // TODO: add id to questions
    const [data, setData] = useState(tempData)
    const [idCount, setIdCount] = useState(tempData.questions.length)

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
                ...data.questions.slice(index+1),
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
        setIdCount(idCount+1);
        return {
            id: idCount,
            title: "",
            image: undefined,
            answers: ["", "", "", ""],
            correct: 0
        }
    }


    // dnd bullshit
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event) {
        const { active, over } = event;
        if (active?.id !== over?.id) {
            const activeIndex = data.questions.findIndex((item) => item.id === active?.id);
            const overIndex = data.questions.findIndex((item) => item.id === over?.id);
            const newQuestions = [...data.questions];
            newQuestions[activeIndex] = newQuestions.splice(overIndex, 1, newQuestions[activeIndex])[0];
            setData({
                    ...data,
                    questions: newQuestions
            });
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
                <input type="text" placeholder="Название квиза" className="input text-2xl w-full" 
                    value={data.title} onChange={e => setData({
                        ...data,
                        title: e.target.value
                    })}
                />
                <textarea type="text" placeholder="Описание" className="w-full textarea text-xl"
                    value={data.description} onChange={e => setData({
                        ...data,
                        description: e.target.value
                    })}
                />
                {/* <div className="card-body"> */}
                {/* </div> */}
            </div>

            <div>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                    <SortableContext items={data.questions} strategy={verticalListSortingStrategy}>
                        {data.questions.map((question, i) => (
                            <Question
                                key={question.id}
                                index={i}
                                data={question} 
                                setQuestionData={setQuestionData}
                                removeQuestion={removeQuestion}
                                insertQuestion={() => insertQuestion(i, emptyQuestion())}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

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
