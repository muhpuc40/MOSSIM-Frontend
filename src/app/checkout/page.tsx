'use client'
import React, { Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import Loading from '@/components/Other/Loading'
import LoggedInCheckout from '@/components/Checkout/LoggedInCheckout'
import GuestCheckout from '@/components/Checkout/GuestCheckout'

function CheckoutRouter() {
    const { isLoggedIn, loading: authLoading } = useAuth()

    if (authLoading) return <Loading fullScreen />
    return isLoggedIn ? <LoggedInCheckout /> : <GuestCheckout />
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<Loading fullScreen />}>
            <CheckoutRouter />
        </Suspense>
    )
}