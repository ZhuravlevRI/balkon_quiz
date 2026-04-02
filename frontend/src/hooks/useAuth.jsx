import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { 
    getMe,
    postLogin,
    postRegister,
} from "@/api.js"

import toast from 'react-hot-toast';
import { handleError } from '@/utils.js';

export const useAuth = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const {
        data: user,
        refetch
    } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getMe,
        retry: false
        // enabled: isLoggedIn(),
    })

    const signUpMutation = useMutation({
        mutationFn: (data) =>
            postRegister(data),
        onSuccess: () => {
            toast.success("Вы успешно зарегестрировались");
            navigate({ to: "/login" })
        },
        onError: handleError.bind(toast.error),
        // onSettled: () => {
        //     queryClient.invalidateQueries({ queryKey: ["users"] })
        // },
    })

    const login = async (data) => {
        const response = await postLogin(data)
    }

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            navigate({ to: "/" })
            queryClient.invalidateQueries({ queryKey: ["currentUser"] })
            refetch()
        },
        onError: handleError.bind(toast.error),
        // onSettled: () => {
            // queryClient.invalidateQueries({ queryKey: ["currentUser"] })
        // },
    })

    // const logout = () => {
    //     localStorage.removeItem("access_token")
    //     navigate({ to: "/login" })
    // }

    return {
        signUpMutation,
        loginMutation,
        // logout,
        user,
    }
}
