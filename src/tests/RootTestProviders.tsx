import React from 'react'
import {
	AppProvider,
	AuthProvider,
	ToastProvider,
	UsersProvider,
	SubjectsProvider,
	TasksProvider,
} from '../providers'

// Canonical provider stack for tests
export const RootTestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<AppProvider>
		<ToastProvider>
			<AuthProvider>
				<UsersProvider>
					<SubjectsProvider>
						<TasksProvider>{children}</TasksProvider>
					</SubjectsProvider>
				</UsersProvider>
			</AuthProvider>
		</ToastProvider>
	</AppProvider>
)