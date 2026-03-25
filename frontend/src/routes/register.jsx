import { createFileRoute } from '@tanstack/react-router'

import { Link } from '@tanstack/react-router'

import { useForm } from "react-hook-form"


export const Route = createFileRoute('/register')({
    component: Register,
})

function Register() {
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm()

    return (
        <div className="flex items-center justify-center text-center h-dvh">
            <form 
                className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4" 
                /* TODO: impl UseAuth() */
                onSubmit={handleSubmit(() => console.log(1))}
                /* onSubmit={handleSubmit(mutation.mutate)} */
            >
                <label className="label">Логин</label>
                <input required type="text" className={"input " + (errors.name && "input-error")} placeholder="Логин"
                    {...register("name", {
                        required: "Логин обязателен",
                        minLength: {value: 3, message: "Логин должен быть от 3 до 20 букв"},
                        maxLength: {value: 20, message: "Логин должен быть от 3 до 20 букв"},
                        pattern: {value: /^[A-Za-z0-9]+$/i, message: "Логин должен использовать только латинские буквы и цифры"},
                    })} />
                <p className="text-error">{errors.name?.message}</p>

                <label className="label">Почта</label>
                <input required type="email" className={"input " + (errors.email && "input-error")} placeholder="Почта"
                    {...register("email", {
                        required: "Почта обязательна",
                        pattern: {value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Неправильный формат почты"},
                    })} />
                <p className="text-error">{errors.email?.message}</p>

                <label className="label">Пароль</label>
                <input required type="password" className={"input " + (errors.password && "input-error")} placeholder="Пароль" 
                    {...register("password", {
                        required: "Пароль обязателен",
                        minLength: {value: 8, message: "Пароль должен быть от 8 до 64 символов"},
                        maxLength: {value: 64, message: "Пароль должен быть от 8 до 64 символов"},
                    })} />
                <p className="text-error">{errors.password?.message}</p>

                <button type="submit" className="btn btn-neutral mt-4">Зарегистрироваться</button>
                <div className="pt-2">
                    Уже есть аккаунт? <Link to="/login" className="link link-hover link-info">Войти</Link>
                </div>
            </form>
        </div>
    )
}
