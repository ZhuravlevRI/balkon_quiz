import { Link } from '@tanstack/react-router'
import { useMatchRoute } from '@tanstack/react-router'

import { useAtomValue } from 'jotai'
import { statusAtom } from '@/atoms.jsx'

import { useAuth } from '@/hooks/useAuth.jsx'

export function Navbar() {
    const matchRoute = useMatchRoute()
    const status = useAtomValue(statusAtom)
    const cleanNavbar = (
        matchRoute({ to: '/login' }) || matchRoute({ to: '/register' })
        || (matchRoute({ to: '/session' }) && status != "idle")
    )

    const { user, logoutMutation } = useAuth()

    return (
        <div className={"absolute navbar z-50" + (!cleanNavbar && "bg-base-100 shadow-sm")}>
            <div className="navbar-start">
                {!cleanNavbar && (
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><Link to="/quiz">Квизы</Link></li>
                        <li><Link to="/session">Управление сессией</Link></li>
                    </ul>
                </div>
                )}
                <Link to="/" className="btn btn-ghost text-xl">Квиззер</Link>
            </div>
            {(!cleanNavbar && (user && user != 1)) && (
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-1">
                    <li><Link to="/quiz" className="[&.active]:menu-active">Квизы</Link></li>
                    <li><Link to="/session" className="[&.active]:menu-active">Управление сессией</Link></li>
                </ul>
            </div>
            )}
            {!cleanNavbar && (
                <div className="navbar-end">
                    {(user && user != 1) ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                {user.username}
                            </div>
                            <ul tabIndex="-1" className="menu dropdown-content mt-2 bg-base-100 rounded-box z-1 p-2 shadow-sm">
                                <li><button className="text-error"
                                    onClick={logoutMutation.mutate}
                                >Выйти</button></li>
                            </ul>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-neutral">Войти</Link>
                    )}
                </div>
            )}
        </div>
    )
}
