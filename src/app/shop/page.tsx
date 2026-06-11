'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import ShopBreadCrumb1 from '@/components/Shop/ShopBreadCrumb1'
import Footer from '@/components/Footer/Footer'

/* useSearchParams must be inside Suspense */
const ShopContent = () => {
    const searchParams = useSearchParams()
    const type     = searchParams.get('type')
    const category = searchParams.get('category')
    const gender   = searchParams.get('gender')

    return (
        <ShopBreadCrumb1
            productPerPage={9}
            dataType={type}
            gender={gender}
            category={category}
        />
    )
}

export default function BreadCrumb1() {
    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
            </div>
            <Suspense fallback={
                <div className="lg:py-20 md:py-14 py-10">
                    <div className="container">
                        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-[30px]">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-surface rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            }>
                <ShopContent />
            </Suspense>
            <Footer />
        </>
    )
}