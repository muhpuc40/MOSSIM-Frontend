'use client'

import React, { useEffect, useState } from 'react'
import Product from '../Product/Product'
import { ProductType } from '@/type/ProductType'
import { productsService } from '@/services/products'
import { motion } from 'framer-motion'

interface Props {
    start?: number
    limit?: number
}

type TabKey = 'all' | 'man' | 'women' | 'kids' | 'unisex'

const TABS: { key: TabKey; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'man',    label: 'Men' },
    { key: 'women',  label: 'Women' },
    { key: 'kids',   label: 'Kids' },
    { key: 'unisex', label: 'Unisex' },
]

const WhatNewOne: React.FC<Props> = ({ start = 0, limit = 16 }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('all')
    const [products, setProducts] = useState<ProductType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        setLoading(true)

        productsService.list({ type: activeTab, per_page: limit })
            .then((data) => { if (mounted) setProducts(data) })
            .catch((err) => { console.error('Product fetch failed:', err); if (mounted) setProducts([]) })
            .finally(() => { if (mounted) setLoading(false) })

        return () => { mounted = false }
    }, [activeTab, limit])

    const visible = products.slice(start, start + limit)

    return (
        <div className="whate-new-block md:pt-20 pt-10">
            <div className="container">
                <div className="heading flex flex-col items-center text-center">
                    <div className="heading3">What{String.raw`'s`} new</div>
                    <div className="menu-tab flex items-center gap-2 p-1 bg-surface rounded-2xl mt-6 overflow-x-auto">
                        {TABS.map((tab) => (
                            <div
                                key={tab.key}
                                className={`tab-item relative text-secondary text-button-uppercase py-2 px-5 cursor-pointer duration-500 hover:text-black whitespace-nowrap ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {activeTab === tab.key && (
                                    <motion.div layoutId="active-pill" className="absolute inset-0 rounded-2xl bg-white"></motion.div>
                                )}
                                <span className="relative text-button-uppercase z-[1]">{tab.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-gray-200 rounded-2xl" />
                                <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
                                <div className="h-3 bg-gray-200 rounded mt-2 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    <div className="text-center py-16 text-secondary">No products found.</div>
                ) : (
                    <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
                        {visible.map((prd) => (
                            <Product data={prd} type="grid" key={prd.id} style="style-1" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default WhatNewOne