export function UserPanel({ user, scoreless, index, admin }) {
    console.log(index)
    return (
        <div className="card card-sm bg-base-200 border-base-300 rounded-box border ps-4 pe-2 py-2">
            <div className="flex justify-between items-center gap-6">
                <div className="flex gap-1 items-center">
                    {(!!index) && (
                        <>
                            <p className="text-xl">{index}</p>
                            <div className="divider divider-horizontal mx-0"></div>
                        </>
                    )}
                    <h1 className="text-xl">{user.name}</h1>
                </div>
                <div className="flex items-center justify-end">
                    {(!scoreless) && (
                        <p className="text-xl me-2">{user.score}</p>
                    )}
                    {admin && (
                        <button className="btn btn-ghost btn-error p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="" viewBox="0 0 16 16">
                                <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
