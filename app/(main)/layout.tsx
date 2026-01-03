import React from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="container mx-auto  md:max-w-5xl lg:max-w-7xl xl:max-w-screen-2xl px-2 md:px-0">
            {children}
        </div>
    )
}

export default MainLayout
