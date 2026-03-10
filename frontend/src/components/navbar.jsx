import { Link } from '@tanstack/react-router'
import { useMatchRoute } from '@tanstack/react-router'

export function Navbar() {
    const matchRoute = useMatchRoute()
    const matchAuth = matchRoute({ to: '/login' }) || matchRoute({ to: '/register' })

    return (
        <div className="fixed navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                {!matchAuth && (
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex="-1"
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><Link to="/quizzes">Квизы</Link></li>
                        <li><Link to="/session">Управление сессией</Link></li>
                    </ul>
                </div>
                )}
                <Link to="/" className="btn btn-ghost text-xl">Квиззер</Link>
            </div>
            {!matchAuth && (
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/quizzes" className="[&.active]:menu-active">Квизы</Link></li>
                    <li><Link to="/session" className="[&.active]:menu-active">Управление сессией</Link></li>
                </ul>
            </div>
            )}
            {!matchAuth && (
            <div className="navbar-end">
                <Link to="/login" className="btn btn-neutral">Войти</Link>
            </div>
            )}
        </div>
    )
}
