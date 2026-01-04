'use client'
import React, { useEffect, useRef, createContext, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/button'

interface User {
	username: string
}

interface AuthContextValue {
	user: User | null
	logout: () => void
}

interface AuthProviderProps {
	children: React.ReactNode
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const formRef = useRef<HTMLFormElement | null>(null)
	const [user, setUser] = useState<User | null>(() => {
		if (typeof window !== 'undefined') {
			const storedUser = localStorage.getItem('user')
			return storedUser ? JSON.parse(storedUser) : null
		}
		return null
	})
	const [error, setError] = useState<string | null>(null)

	const login = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault()
		setError(null)
		const formData = new FormData(e.currentTarget)
		const username = formData.get('username') as string
		const password = formData.get('password') as string

		if (
			username === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
			password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
		) {
			setUser({ username })
		} else {
			setError('Invalid usernmame or password.')
		}
	}

	const logout = (): void => {
		setUser(null)
		if (typeof window !== 'undefined') {
			localStorage.removeItem('user')
		}
	}

	const LoginForm: React.FC = () => {
		return (
			<Card cardColor="white" className="w-full h-full my-8">
				<p>Please log in to continue</p>
				<p className="text-sm">
					To request preview access, send an email to{' '}
					<a href="mailto:alexlyon@rightpoint.com">alexlyon@rightpoint.com</a> with your
					name and email.
				</p>
				{error && <p className="text-red-500">{error}</p>}
				<form onSubmit={login} ref={formRef} className="flex flex-col gap-5">
					<input
						className="p-4 border-[2px] border-vulcan"
						name="username"
						type="text"
						placeholder="Username"
					/>
					<input
						className="p-4 border-[2px] border-vulcan"
						name="password"
						type="password"
						placeholder="Password"
					/>
					<Button
						buttonVariant="cta"
						className="text-center my-8"
						onClick={() => {
							// submit the form
							if (formRef.current) {
								formRef.current.dispatchEvent(
									new Event('submit', { bubbles: true })
								)
							}
						}}
					>
						Login
					</Button>
				</form>
			</Card>
		)
	}

	useEffect(() => {
		if (!user) return
		localStorage.setItem('user', JSON.stringify(user))
	}, [user])

	return (
		<AuthContext.Provider value={{ user, logout }}>
			{user ? children : <LoginForm />}
		</AuthContext.Provider>
	)
}

