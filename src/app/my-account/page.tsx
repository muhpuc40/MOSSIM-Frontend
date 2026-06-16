'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Loading from '@/components/Other/Loading'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/auth'
import { ordersService } from '@/services/orders'
import { CustomerAddress } from '@/type/Auth'
import { Order } from '@/type/Order'

/* ── Status colours ─────────────────────── */
const STATUS_STYLE: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    accepted:  'bg-purple-100 text-purple-700',
    shipped:   'bg-blue-100   text-blue-700',
    delivered: 'bg-green-100  text-green-700',
    cancelled: 'bg-red-100    text-red-600',
    rejected:  'bg-red-100    text-red-600',
    returned:  'bg-orange-100 text-orange-700',
}

/* ── Password field with eye ────────────── */
const PasswordInput: React.FC<{
    id: string; label: string; value: string
    onChange: (v: string) => void; placeholder?: string
}> = ({ id, label, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false)
    return (
        <div>
            <label htmlFor={id} className='caption1'>{label} <span className='text-red'>*</span></label>
            <div className="relative mt-2">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    className="border-line px-4 py-3 pr-12 w-full rounded-lg"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    required
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-black duration-200"
                    onClick={() => setShow(p => !p)}
                >
                    {show ? <Icon.EyeSlash size={18} /> : <Icon.Eye size={18} />}
                </button>
            </div>
        </div>
    )
}

/* ── Main ───────────────────────────────── */
const MyAccount = () => {
    const router = useRouter()
    const { user, token, isLoggedIn, loading, logout, setUser } = useAuth()

    /* ── Tabs — URL hash driven ───────────── */
    const TABS = ['dashboard', 'orders', 'address', 'setting']
    const [activeTab, setActiveTab] = useState('dashboard')

    useEffect(() => {
        const hash = window.location.hash.replace('#', '')
        if (TABS.includes(hash)) setActiveTab(hash)
    }, [])

    const gotoTab = (tab: string) => {
        setActiveTab(tab)
        window.history.replaceState(null, '', `#${tab}`)
    }

    /* ── Auth guard ──────────────────────── */
    useEffect(() => {
        if (!loading && !isLoggedIn) router.push('/login')
    }, [loading, isLoggedIn, router])

    /* ════════════ ORDERS ════════════ */
    const [orders,       setOrders]       = useState<Order[]>([])
    const [ordersMeta,   setOrdersMeta]   = useState<any>(null)
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [activeOrderTab, setActiveOrderTab] = useState('all')
    const [detailOrder,  setDetailOrder]  = useState<Order | null>(null)
    const [detailOpen,   setDetailOpen]   = useState(false)
    const [detailLoading, setDetailLoading] = useState(false)
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    const loadOrders = useCallback(async (status?: string) => {
        if (!token) return
        setOrdersLoading(true)
        try {
            const res = await ordersService.list(token, status === 'all' ? undefined : status)
            setOrders(res.data)
            setOrdersMeta(res.meta)
        } catch (err) {
            console.error('orders:', err)
        } finally {
            setOrdersLoading(false)
        }
    }, [token])

    useEffect(() => {
        if (activeTab === 'orders' && token) loadOrders(activeOrderTab)
    }, [activeTab, activeOrderTab, token])

    const handleViewDetail = async (orderId: string) => {
        if (!token) return
        setDetailOpen(true)
        setDetailLoading(true)
        try {
            const order = await ordersService.show(token, orderId)
            setDetailOrder(order)
        } catch (err) {
            console.error('order detail:', err)
        } finally {
            setDetailLoading(false)
        }
    }

    const handleCancel = async (orderId: string) => {
        if (!token || !confirm('Cancel this order?')) return
        setCancellingId(orderId)
        try {
            await ordersService.cancel(token, orderId, 'Cancelled by customer.')
            await loadOrders(activeOrderTab)
        } catch (err: any) {
            alert(err?.message || 'Failed to cancel order.')
        } finally {
            setCancellingId(null)
        }
    }

    /* ════════════ ADDRESSES ════════════ */
    const emptyAddr = {
        recipient_name: '', address_line_1: '', address_line_2: '',
        city: '', state: '', postal_code: '', country: '', phone: '', is_default: false,
    }
    const [addresses,       setAddresses]       = useState<CustomerAddress[]>([])
    const [addressLoading,  setAddressLoading]  = useState(false)
    const [addressError,    setAddressError]    = useState('')
    const [addressSuccess,  setAddressSuccess]  = useState('')
    const [editingAddress,  setEditingAddress]  = useState<CustomerAddress | null>(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [addressForm,     setAddressForm]     = useState(emptyAddr)

    const loadAddresses = useCallback(async () => {
        if (!token) return
        setAddressLoading(true)
        try { setAddresses(await authService.getAddresses(token)) }
        catch { console.error('Failed to load addresses') }
        finally { setAddressLoading(false) }
    }, [token])

    useEffect(() => {
        if (activeTab === 'address' && token) loadAddresses()
    }, [activeTab, token])

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return
        setAddressError(''); setAddressSuccess(''); setAddressLoading(true)
        try {
            if (editingAddress) {
                await authService.updateAddress(token, editingAddress.id, addressForm)
                setAddressSuccess('Address updated.')
            } else {
                await authService.createAddress(token, addressForm as any)
                setAddressSuccess('Address added.')
            }
            setShowAddressForm(false); setEditingAddress(null); setAddressForm(emptyAddr)
            await loadAddresses()
        } catch (err: any) {
            setAddressError(err?.message || 'Failed to save address.')
        } finally { setAddressLoading(false) }
    }

    const handleDeleteAddress = async (id: string) => {
        if (!token || !confirm('Delete this address?')) return
        try {
            await authService.deleteAddress(token, id)
            setAddresses(prev => prev.filter(a => a.id !== id))
        } catch { console.error('delete address failed') }
    }

    const handleSetDefault = async (id: string) => {
        if (!token) return
        try { await authService.setDefaultAddress(token, id); await loadAddresses() }
        catch { console.error('set default failed') }
    }

    const openEditAddress = (addr: CustomerAddress) => {
        setEditingAddress(addr)
        setAddressForm({
            recipient_name: addr.recipient_name,
            address_line_1: addr.address_line_1,
            address_line_2: addr.address_line_2 || '',
            city: addr.city, state: addr.state || '',
            postal_code: addr.postal_code || '',
            country: addr.country, phone: addr.phone,
            is_default: addr.is_default,
        })
        setShowAddressForm(true); setAddressError(''); setAddressSuccess('')
    }

    /* ════════════ SETTINGS ════════════ */
    const [profileForm,    setProfileForm]    = useState({ name: '', email: '', phone: '' })
    const [profileError,   setProfileError]   = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')
    const [profileSaving,  setProfileSaving]  = useState(false)
    const [passForm,       setPassForm]       = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
    const [passError,      setPassError]      = useState('')
    const [passSuccess,    setPassSuccess]    = useState('')
    const [passSaving,     setPassSaving]     = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const [avatarSaving,   setAvatarSaving]   = useState(false)

    useEffect(() => {
        if (user) setProfileForm({ name: user.name, email: user.email, phone: user.phone })
    }, [user])

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return
        setProfileError(''); setProfileSuccess(''); setProfileSaving(true)
        try {
            const updated = await authService.updateProfile(token, profileForm)
            setUser(updated); setProfileSuccess('Profile updated successfully.')
        } catch (err: any) {
            const msg = err?.errors ? Object.values(err.errors).flat().join(' ') : err?.message || 'Failed.'
            setProfileError(msg)
        } finally { setProfileSaving(false) }
    }

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return
        if (passForm.new_password !== passForm.new_password_confirmation) {
            setPassError('New passwords do not match.'); return
        }
        setPassError(''); setPassSuccess(''); setPassSaving(true)
        try {
            await authService.changePassword(token, passForm)
            setPassSuccess('Password changed successfully.')
            setPassForm({ current_password: '', new_password: '', new_password_confirmation: '' })
        } catch (err: any) {
            setPassError(err?.message || 'Failed to change password.')
        } finally { setPassSaving(false) }
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !token) return
        setAvatarSaving(true)
        try {
            const { avatar_url } = await authService.uploadAvatar(token, file)
            setUser({ ...user!, avatar_url })
        } catch { console.error('Avatar upload failed') }
        finally { setAvatarSaving(false) }
    }

    const handleLogout = async () => { await logout(); router.push('/') }

    /* ── Guard ───────────────────────── */
    if (loading || !user) {
        return <Loading fullScreen />
    }
    const avatarSrc = user.avatar_url || '/images/avatar/1.png'

    /* ── Order status filter tabs ────── */
    const ORDER_TABS = [
        { key: 'all',       label: 'All' },
        { key: 'pending',   label: 'Pending' },
        { key: 'accepted',  label: 'Accepted' },
        { key: 'shipped',   label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' },
    ]

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='My Account' subHeading='My Account' />
            </div>

            <div className="profile-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex gap-y-8 max-md:flex-col w-full">

                        {/* ── Sidebar ──────────────────────── */}
                        <div className="left md:w-1/3 w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
                            <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                                <div className="heading flex flex-col items-center justify-center">
                                    <div className="avatar relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                        <Image
                                            src={avatarSrc}
                                            width={140} height={140} alt='avatar'
                                            className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full object-cover'
                                            unoptimized={avatarSrc.startsWith('http')}
                                        />
                                        <div className="absolute bottom-1 right-1 w-7 h-7 bg-black rounded-full flex items-center justify-center">
                                            {avatarSaving
                                                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                : <Icon.Camera size={13} color='white' />
                                            }
                                        </div>
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                            disabled={avatarSaving}
                                        />
                                    </div>
                                    <div className="name heading6 mt-4 text-center">{user.name}</div>
                                    <div className="caption1 text-secondary text-center mt-1">{user.email}</div>
                                </div>

                                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                                    {[
                                        { key: 'dashboard', icon: <Icon.HouseLine size={20} />, label: 'Dashboard' },
                                        { key: 'orders',    icon: <Icon.Package    size={20} />, label: 'My Orders' },
                                        { key: 'address',   icon: <Icon.MapPin     size={20} />, label: 'My Addresses' },
                                        { key: 'setting',   icon: <Icon.GearSix    size={20} />, label: 'Settings' },
                                    ].map(tab => (
                                        <div
                                            key={tab.key}
                                            className={`item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5 ${activeTab === tab.key ? 'active bg-white' : ''}`}
                                            onClick={() => gotoTab(tab.key)}
                                        >
                                            {tab.icon}
                                            <strong className="heading6">{tab.label}</strong>
                                        </div>
                                    ))}
                                    <div
                                        className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg cursor-pointer duration-300 hover:bg-white mt-1.5"
                                        onClick={handleLogout}
                                    >
                                        <Icon.SignOut size={20} />
                                        <strong className="heading6">Logout</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right content ────────────────── */}
                        <div className="right md:w-2/3 w-full pl-2.5">

                            {/* ══ DASHBOARD ══ */}
                            <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
                                <div className="overview grid sm:grid-cols-3 gap-5">
                                    {[
                                        { label: 'Total Orders',    value: ordersMeta?.total ?? '—', icon: <Icon.Package    className='text-4xl' /> },
                                        { label: 'Pending Orders',  value: orders.filter(o => o.status === 'pending').length || '—', icon: <Icon.HourglassMedium className='text-4xl' /> },
                                        { label: 'Delivered',       value: orders.filter(o => o.status === 'delivered').length || '—', icon: <Icon.CheckCircle  className='text-4xl' /> },
                                    ].map((stat, i) => (
                                        <div key={i} className="item flex items-center justify-between p-5 border border-line rounded-xl box-shadow-xs">
                                            <div>
                                                <span className="text-secondary caption1">{stat.label}</span>
                                                <h5 className="heading5 mt-1">{stat.value}</h5>
                                            </div>
                                            {stat.icon}
                                        </div>
                                    ))}
                                </div>

                                {/* Recent orders preview */}
                                <div className="recent_order pt-5 px-5 pb-2 mt-7 border border-line rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h6 className="heading6">Recent Orders</h6>
                                        <button
                                            className="caption1 text-secondary hover:text-black duration-200 underline"
                                            onClick={() => gotoTab('orders')}
                                        >
                                            View all
                                        </button>
                                    </div>
                                    {orders.length === 0 ? (
                                        <div className="text-secondary caption1 py-6 text-center">No orders yet.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[500px]">
                                                <thead className="border-b border-line">
                                                    <tr>
                                                        <th className="pb-3 text-left caption1 text-secondary font-semibold uppercase">Order</th>
                                                        <th className="pb-3 text-left caption1 text-secondary font-semibold uppercase">Items</th>
                                                        <th className="pb-3 text-left caption1 text-secondary font-semibold uppercase">Total</th>
                                                        <th className="pb-3 text-right caption1 text-secondary font-semibold uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.slice(0, 5).map(order => (
                                                        <tr key={order.id} className="border-b border-line last:border-0">
                                                            <td className="py-3 text-button">{order.order_number}</td>
                                                            <td className="py-3 caption1 text-secondary">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</td>
                                                            <td className="py-3 caption1">৳{order.total_amount.toLocaleString()}</td>
                                                            <td className="py-3 text-right">
                                                                <span className={`caption2 px-3 py-1 rounded-full font-semibold ${STATUS_STYLE[order.status] ?? 'bg-surface text-secondary'}`}>
                                                                    {order.status_label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ══ ORDERS ══ */}
                            <div className={activeTab === 'orders' ? 'block' : 'hidden'}>
                                <div className="tab text-content overflow-hidden w-full p-7 border border-line rounded-xl">
                                    <h6 className="heading6 mb-4">My Orders</h6>

                                    {/* Status filter tabs */}
                                    <div className="w-full overflow-x-auto">
                                        <div className="flex gap-1 border-b border-line mb-5 min-w-max">
                                            {ORDER_TABS.map(tab => (
                                                <button
                                                    key={tab.key}
                                                    className={`px-4 py-2.5 caption1 duration-200 border-b-2 whitespace-nowrap ${activeOrderTab === tab.key ? 'border-black text-black font-semibold' : 'border-transparent text-secondary hover:text-black'}`}
                                                    onClick={() => setActiveOrderTab(tab.key)}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order list */}
                                    {ordersLoading ? (
                                        <div className="space-y-3">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-16">
                                            <Icon.Package size={48} className="opacity-20 mx-auto mb-3" />
                                            <div className="heading6 mb-1">No orders found</div>
                                            <div className="caption1 text-secondary mb-5">You haven't placed any orders yet.</div>
                                            <Link href="/shop/breadcrumb1" className="button-main bg-black inline-block">Shop Now</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <div key={order.id} className="border border-line rounded-xl overflow-hidden">
                                                    {/* Order header */}
                                                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-surface border-b border-line">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-button">{order.order_number}</span>
                                                                <span className={`caption2 px-3 py-0.5 rounded-full font-semibold ${STATUS_STYLE[order.status] ?? 'bg-surface text-secondary'}`}>
                                                                    {order.status_label}
                                                                </span>
                                                            </div>
                                                            <div className="caption2 text-secondary mt-1">
                                                                {new Date(order.placed_at).toLocaleDateString('en-BD', {
                                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                                &nbsp;·&nbsp;
                                                                {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="heading6">৳{order.total_amount.toLocaleString()}</div>
                                                        </div>
                                                    </div>

                                                    {/* Order actions */}
                                                    <div className="flex flex-wrap gap-3 px-5 py-3">
                                                        <button
                                                            className="caption1 px-4 py-2 border border-black rounded-lg hover:bg-black hover:text-white duration-200 font-semibold"
                                                            onClick={() => handleViewDetail(order.id)}
                                                        >
                                                            View Details
                                                        </button>
                                                        {order.status === 'pending' && (
                                                            <button
                                                                className="caption1 px-4 py-2 border border-red-400 text-red-600 rounded-lg hover:bg-red-600 hover:text-white duration-200 font-semibold disabled:opacity-50"
                                                                onClick={() => handleCancel(order.id)}
                                                                disabled={cancellingId === order.id}
                                                            >
                                                                {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ══ ADDRESSES ══ */}
                            <div className={activeTab === 'address' ? 'block' : 'hidden'}>
                                <div className="tab_address text-content w-full p-7 border border-line rounded-xl">
                                    <div className="flex items-center justify-between mb-5">
                                        <h6 className="heading6">My Addresses</h6>
                                        <button
                                            className="button-main bg-black text-sm px-4 py-2"
                                            onClick={() => {
                                                setEditingAddress(null); setAddressForm(emptyAddr)
                                                setAddressError(''); setAddressSuccess('')
                                                setShowAddressForm(true)
                                            }}
                                        >+ Add New</button>
                                    </div>

                                    {addressError   && <div className="text-red   caption1 mb-3 p-3 bg-red/5    rounded-lg border border-red/20">{addressError}</div>}
                                    {addressSuccess && <div className="text-success caption1 mb-3 p-3 bg-green/5 rounded-lg border border-green/20">{addressSuccess}</div>}

                                    {!showAddressForm && (
                                        addressLoading ? (
                                            <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />)}</div>
                                        ) : addresses.length === 0 ? (
                                            <div className="caption1 text-secondary py-10 text-center">No addresses yet. Add one above.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {addresses.map(addr => (
                                                    <div key={addr.id} className={`p-5 border rounded-xl ${addr.is_default ? 'border-black' : 'border-line'}`}>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                {addr.is_default && <span className="caption2 bg-black text-white px-2 py-0.5 rounded mb-2 inline-block">Default</span>}
                                                                <div className="caption1 font-semibold mt-1">{addr.recipient_name}</div>
                                                                <div className="caption1">{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}</div>
                                                                <div className="caption1">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}</div>
                                                                <div className="caption1">{addr.country}</div>
                                                                <div className="caption1 text-secondary mt-1">{addr.phone}</div>
                                                            </div>
                                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                                <button className="caption2 px-3 py-1 border border-line rounded hover:border-black duration-200" onClick={() => openEditAddress(addr)}>Edit</button>
                                                                {!addr.is_default && (
                                                                    <button className="caption2 px-3 py-1 border border-line rounded hover:border-black duration-200" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                                                                )}
                                                                <button className="caption2 px-3 py-1 border border-red-300 rounded text-red-600 hover:bg-red-600 hover:text-white duration-200" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}

                                    {showAddressForm && (
                                        <form onSubmit={handleAddressSubmit}>
                                            <div className="heading6 mb-4">{editingAddress ? 'Edit Address' : 'New Address'}</div>
                                            <div className='grid sm:grid-cols-2 gap-4 gap-y-5'>
                                                <div>
                                                    <label className='caption1'>Recipient Name <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.recipient_name} onChange={e => setAddressForm(p => ({ ...p, recipient_name: e.target.value }))} required />
                                                </div>
                                                <div>
                                                    <label className='caption1'>Phone <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} required />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className='caption1'>Street Address <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.address_line_1} onChange={e => setAddressForm(p => ({ ...p, address_line_1: e.target.value }))} required />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className='caption1'>Address Line 2</label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.address_line_2} onChange={e => setAddressForm(p => ({ ...p, address_line_2: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className='caption1'>City <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} required />
                                                </div>
                                                <div>
                                                    <label className='caption1'>State</label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className='caption1'>Postal Code</label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.postal_code} onChange={e => setAddressForm(p => ({ ...p, postal_code: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className='caption1'>Country <span className='text-red'>*</span></label>
                                                    <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" type="text" value={addressForm.country} onChange={e => setAddressForm(p => ({ ...p, country: e.target.value }))} required />
                                                </div>
                                                <div className="sm:col-span-2 flex items-center gap-2">
                                                    <input type="checkbox" id="addrDefault" checked={addressForm.is_default} onChange={e => setAddressForm(p => ({ ...p, is_default: e.target.checked }))} />
                                                    <label htmlFor="addrDefault" className="caption1 cursor-pointer">Set as default address</label>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 mt-6">
                                                <button className="button-main bg-black" type="submit" disabled={addressLoading}>
                                                    {addressLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                                                </button>
                                                <button type="button" className="button-main bg-surface border border-line hover:bg-black text-black hover:text-white" onClick={() => { setShowAddressForm(false); setEditingAddress(null) }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* ══ SETTINGS ══ */}
                            <div className={activeTab === 'setting' ? 'block' : 'hidden'}>
                                <div className="tab text-content w-full p-7 border border-line rounded-xl">

                                    {/* Profile */}
                                    <form onSubmit={handleProfileSave}>
                                        <div className="heading5 pb-4">Profile Information</div>

                                        {/* Avatar */}
                                        <div className="flex flex-wrap items-center gap-5 mb-6">
                                            <div className="relative w-[7.5rem] h-[7.5rem] rounded-xl overflow-hidden bg-surface flex-shrink-0">
                                                <Image src={avatarSrc} width={300} height={300} alt='avatar' className="w-full h-full object-cover" unoptimized={avatarSrc.startsWith('http')} />
                                            </div>
                                            <div>
                                                <strong className="text-button">Profile Photo</strong>
                                                <p className="caption1 text-secondary mt-1 mb-3">JPG, PNG — max 2MB</p>
                                                <label htmlFor="uploadAvatar" className="caption1 px-4 py-2 border border-line rounded-lg cursor-pointer hover:border-black duration-200">
                                                    {avatarSaving ? 'Uploading...' : 'Change Photo'}
                                                </label>
                                                <input type="file" id="uploadAvatar" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatarChange} disabled={avatarSaving} />
                                            </div>
                                        </div>

                                        {profileError   && <div className="text-red    caption1 mb-4 p-3 bg-red/5    rounded-lg border border-red/20">{profileError}</div>}
                                        {profileSuccess && <div className="text-success caption1 mb-4 p-3 bg-green/5 rounded-lg border border-green/20">{profileSuccess}</div>}

                                        <div className='grid sm:grid-cols-2 gap-4 gap-y-5'>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="profileName" className='caption1'>Full Name <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="profileName" type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                                            </div>
                                            <div>
                                                <label htmlFor="profileEmail" className='caption1'>Email <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="profileEmail" type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} required />
                                            </div>
                                            <div>
                                                <label htmlFor="profilePhone" className='caption1'>Phone <span className='text-red'>*</span></label>
                                                <input className="border-line mt-2 px-4 py-3 w-full rounded-lg" id="profilePhone" type="text" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} required />
                                            </div>
                                        </div>
                                        <div className="block-button mt-6">
                                            <button className="button-main bg-black" type="submit" disabled={profileSaving}>
                                                {profileSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Password */}
                                    <form onSubmit={handlePasswordSave} className="mt-10 pt-10 border-t border-line">
                                        <div className="heading5 pb-4">Change Password</div>

                                        {passError   && <div className="text-red    caption1 mb-4 p-3 bg-red/5    rounded-lg border border-red/20">{passError}</div>}
                                        {passSuccess && <div className="text-success caption1 mb-4 p-3 bg-green/5 rounded-lg border border-green/20">{passSuccess}</div>}

                                        <div className="space-y-5">
                                            <PasswordInput
                                                id="currentPass"
                                                label="Current Password"
                                                value={passForm.current_password}
                                                onChange={v => setPassForm(p => ({ ...p, current_password: v }))}
                                                placeholder="Enter current password"
                                            />
                                            <PasswordInput
                                                id="newPass"
                                                label="New Password"
                                                value={passForm.new_password}
                                                onChange={v => setPassForm(p => ({ ...p, new_password: v }))}
                                                placeholder="Minimum 8 characters"
                                            />
                                            <PasswordInput
                                                id="confirmPass"
                                                label="Confirm New Password"
                                                value={passForm.new_password_confirmation}
                                                onChange={v => setPassForm(p => ({ ...p, new_password_confirmation: v }))}
                                                placeholder="Re-enter new password"
                                            />
                                        </div>
                                        <div className="block-button mt-6">
                                            <button className="button-main bg-black" type="submit" disabled={passSaving}>
                                                {passSaving ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ══ ORDER DETAIL MODAL ══ */}
            {detailOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setDetailOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-line">
                            <h5 className="heading5">Order Details</h5>
                            <button
                                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-black hover:text-white duration-200"
                                onClick={() => setDetailOpen(false)}
                            >
                                <Icon.X size={14} />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="p-6 space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-12 bg-surface rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : detailOrder ? (
                            <div className="p-6 space-y-6">

                                {/* Status + number */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-button">{detailOrder.order_number}</div>
                                        <div className="caption2 text-secondary mt-1">
                                            {new Date(detailOrder.placed_at).toLocaleDateString('en-BD', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <span className={`caption1 px-3 py-1 rounded-full font-semibold ${STATUS_STYLE[detailOrder.status] ?? 'bg-surface text-secondary'}`}>
                                        {detailOrder.status_label}
                                    </span>
                                </div>

                                {/* Shipping address */}
                                {detailOrder.shipping_address && (
                                    <div className="bg-surface p-4 rounded-xl">
                                        <div className="caption2 text-secondary font-semibold uppercase mb-2">Shipping Address</div>
                                        <div className="caption1 font-semibold">{detailOrder.shipping_address.recipient_name}</div>
                                        <div className="caption1 text-secondary">{detailOrder.shipping_address.phone}</div>
                                        <div className="caption1 mt-1">{detailOrder.shipping_address.address_line_1}</div>
                                        <div className="caption1">
                                            {detailOrder.shipping_address.city}
                                            {detailOrder.shipping_address.state ? `, ${detailOrder.shipping_address.state}` : ''}
                                            {detailOrder.shipping_address.postal_code ? ` ${detailOrder.shipping_address.postal_code}` : ''}
                                        </div>
                                        <div className="caption1">{detailOrder.shipping_address.country}</div>
                                    </div>
                                )}

                                {/* Items */}
                                {detailOrder.items && detailOrder.items.length > 0 && (
                                    <div>
                                        <div className="caption2 text-secondary font-semibold uppercase mb-3">Order Items</div>
                                        <div className="space-y-3">
                                            {detailOrder.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-4 p-3 border border-line rounded-xl">
                                                    {item.product?.image && (
                                                        <Image
                                                            src={item.product.image}
                                                            width={56} height={72}
                                                            alt={item.product.name ?? ''}
                                                            className="w-14 aspect-[3/4] object-cover rounded-lg flex-shrink-0"
                                                            unoptimized
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-button text-sm line-clamp-1">{item.product?.name}</div>
                                                        <div className="caption2 text-secondary mt-0.5">
                                                            {item.variant?.color?.name && <span className="capitalize">{item.variant.color.name}</span>}
                                                            {item.variant?.color?.name && item.variant?.size?.name && <span> / </span>}
                                                            {item.variant?.size?.name && <span>{item.variant.size.name}</span>}
                                                        </div>
                                                        <div className="caption2 text-secondary mt-0.5 font-mono">{item.variant?.sku}</div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="caption1 text-secondary">{item.qty} × ৳{item.unit_price.toLocaleString()}</div>
                                                        <div className="text-button mt-0.5">৳{item.line_total.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Totals */}
                                <div className="bg-surface p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between caption1">
                                        <span className="text-secondary">Subtotal</span>
                                        <span>৳{detailOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    {detailOrder.discount_amount > 0 && (
                                        <div className="flex justify-between caption1">
                                            <span className="text-secondary">Discount{detailOrder.coupon ? ` (${detailOrder.coupon.code})` : ''}</span>
                                            <span className="text-red">-৳{detailOrder.discount_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between caption1">
                                        <span className="text-secondary">Shipping</span>
                                        <span>{detailOrder.shipping_fee === 0 ? <span className="text-success">Free</span> : `৳${detailOrder.shipping_fee}`}</span>
                                    </div>
                                    <div className="flex justify-between heading6 pt-2 border-t border-line">
                                        <span>Total</span>
                                        <span>৳{detailOrder.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Cancel from modal */}
                                {detailOrder.status === 'pending' && (
                                    <button
                                        className="w-full caption1 px-4 py-3 border border-red-400 text-red-600 rounded-xl hover:bg-red-600 hover:text-white duration-200 font-semibold"
                                        onClick={async () => {
                                            await handleCancel(detailOrder.id)
                                            setDetailOpen(false)
                                        }}
                                        disabled={cancellingId === detailOrder.id}
                                    >
                                        {cancellingId === detailOrder.id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 text-center caption1 text-secondary">Failed to load order details.</div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}

export default MyAccount