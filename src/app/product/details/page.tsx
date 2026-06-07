'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import BreadcrumbProduct from '@/components/Breadcrumb/BreadcrumbProduct'
import Default from '@/components/Product/Detail/Default'
import Footer from '@/components/Footer/Footer'
import productData from '@/data/Product.json'

const ProductDetailsContent = () => {
    const searchParams = useSearchParams()
    let productId = searchParams.get('id')

    if (productId === null) {
        productId = '1'
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-white" />
                <BreadcrumbProduct data={productData} productPage='default' productId={productId} />
            </div>
            <Default data={productData} productId={productId} />
            <Footer />
        </>
    )
}

const ProductDetails = () => {
    return (
        <Suspense fallback={<div className="text-center py-32 text-secondary">Loading...</div>}>
            <ProductDetailsContent />
        </Suspense>
    )
}

export default ProductDetails