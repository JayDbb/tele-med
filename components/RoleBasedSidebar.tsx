'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDoctor } from '@/contexts/DoctorContext'
import { useNurse } from '@/contexts/NurseContext'
import { getCurrentUser } from '@/lib/api'

const RoleBasedSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [userRole, setUserRole] = useState<'doctor' | 'nurse' | null>(null)
    const [loading, setLoading] = useState(true)
    const pathname = usePathname()
    const router = useRouter()
    const { doctor, logout: doctorLogout } = useDoctor()
    const { nurse, logout: nurseLogout } = useNurse()

    useEffect(() => {
        async function fetchUserRole() {
            try {
                const user = await getCurrentUser()
                if (user?.role === 'doctor' || user?.role === 'nurse') {
                    setUserRole(user.role)
                }
            } catch (error) {
                console.error('Error fetching user role:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUserRole()
    }, [])

    const handleLogout = async () => {
        if (userRole === 'doctor') {
            doctorLogout()
        } else if (userRole === 'nurse') {
            await nurseLogout()
        }
        router.push('/login')
    }

    // Determine navigation items based on role
    const getNavItems = () => {
        if (userRole === 'doctor') {
            return [
                { icon: 'home', label: 'Home', href: '/doctor/dashboard' },
                { icon: 'groups', label: 'My Patients', href: '/patients' },
                { icon: 'event_note', label: 'Visits', href: '/visits' },
            ]
        } else if (userRole === 'nurse') {
            return [
                { icon: 'home', label: 'Dashboard', href: '/nurse-portal' },
                { icon: 'groups', label: 'Patients', href: '/patients' },
                { icon: 'event_note', label: 'Visits', href: '/visits' },
            ]
        }
        return []
    }

    const navItems = getNavItems()

    // Get user info for display
    const getUserInfo = () => {
        if (userRole === 'doctor' && doctor) {
            return {
                name: doctor.name || 'Doctor',
                subtitle: doctor.specialty || 'Physician',
                avatar: doctor.avatar
            }
        } else if (userRole === 'nurse' && nurse) {
            return {
                name: nurse.name || 'Nurse',
                subtitle: nurse.department || 'Nursing',
                avatar: nurse.avatar
            }
        }
        return {
            name: 'User',
            subtitle: '',
            avatar: undefined
        }
    }

    const userInfo = getUserInfo()

    if (loading) {
        return (
            <aside className={`flex h-screen ${isCollapsed ? 'w-16' : 'w-64'} flex-col bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 sticky top-0 transition-all duration-300`}>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </aside>
        )
    }

    if (!userRole) {
        return null
    }

    return (
        <aside className={`flex h-screen ${isCollapsed ? 'w-16' : 'w-64'} flex-col bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800 sticky top-0 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-8">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : ''}`}>
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{
                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIvhsI2mvBKXaHlCUz0PA5n5FW4lyFIJhxJpNXoPyBoHFL72A1graDo7-FmfcUdzvHyJAKBwcmxr83-yxj9STK928Og--F5_H0wNRQ_9VdAzZrxxk-eeBdZ8P8Xcsyp5jqHD2KCc3UBFPnoePLA69iZaeOKgxg5mRsGO14CqdGLak3vlMb-KYEDtX0z3re05rOcoV-vlF1Ky8Hn3MqrxdKFFhIT8pCiW3iMVgbHKKzpkRHw-741kfhXZ6RRnrsHalhB4WafkR6mKs")'
                        }}
                    />
                    <h1 className="text-gray-900 dark:text-white text-lg font-medium">
                        {userRole === 'nurse' ? 'Nurse Portal' : 'Intellibus Tele-Medicine'}
                    </h1>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                        menu
                    </span>
                </button>
            </div>

            <nav className="flex flex-col gap-2 flex-grow">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href === '/patients' && pathname.startsWith('/patients')) ||
                        (item.href === '/visits' && pathname.startsWith('/visits')) ||
                        (item.href === '/medications' && pathname.startsWith('/medications')) ||
                        (item.href === '/doctor/dashboard' && pathname.startsWith('/doctor')) ||
                        (item.href === '/nurse-portal' && pathname.startsWith('/nurse-portal'))
                    return (
                        <Link
                            key={item.label}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg relative ${isActive
                                    ? 'text-primary'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            href={item.href}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-blue-500 rounded-r"></div>
                            )}
                            <div className="relative">
                                <span className={`material-symbols-outlined text-xl w-6 h-6 flex items-center justify-center ${isActive ? 'fill' : ''}`}>
                                    {item.icon}
                                </span>
                            </div>
                            {!isCollapsed && <p className="text-sm font-medium">{item.label}</p>}
                        </Link>
                    )
                })}
            </nav>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                    >
                        <span className="material-symbols-outlined text-xl w-6 h-6 flex items-center justify-center">logout</span>
                        {!isCollapsed && <p className="text-sm font-medium">Logout</p>}
                    </button>
                </div>

                <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${isCollapsed ? 'hidden' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{
                                backgroundImage: userInfo.avatar ? `url("${userInfo.avatar}")` : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBevzzTiuFvj77hHgIQO-zsMGw3JH6wML3gRur0C6z0xrjqm75RCjxpea_yuq9YxdfbrSCVugctD9ckg66H_Es4AnRjNeKVKJN-3hhwq3uoZVX4xXctMFHvTAZDBz3PUNqzdAGDvX-raEXyNcmiBKZItUurchM50ZCy5v92O7NEIIYv1seAmACOaiGlWAfwACk8nZhn6Wvww3wdpeK0QrFBb8yGpQA7M9plB7puFkf9xxic63ekREoqqelmGMm-v3TzjOMdbL4291I")'
                            }}
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{userInfo.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo.subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default RoleBasedSidebar

