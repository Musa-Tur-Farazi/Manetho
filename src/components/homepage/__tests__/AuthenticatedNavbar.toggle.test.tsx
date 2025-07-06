import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AuthenticatedNavbar from '../AuthenticatedNavbar'

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { firstName: 'Tester', id: 'uid' } }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// stub ThemeProvider context
jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  const ThemeCtx = React.createContext({ theme: 'light', setTheme: () => {} })
  return {
    __esModule: true,
    ThemeProvider: ({ children }: any) => React.createElement(ThemeCtx.Provider, { value: { theme: 'light', setTheme: jest.fn() } }, children),
    useTheme: () => React.useContext(ThemeCtx),
  }
})

describe('AuthenticatedNavbar – mobile menu & theme toggle', () => {
  it('toggles mobile menu and theme button', () => {
    const { getByLabelText, getAllByRole } = render(<AuthenticatedNavbar isScrolled={false} />)

    // theme toggle branch
    const themeBtn = getByLabelText('Toggle theme')
    fireEvent.click(themeBtn)

    const buttons = getAllByRole('button', { hidden: true })
    const menuBtn = buttons[buttons.length - 1]

    // open and close mobile menu
    fireEvent.click(menuBtn)
    fireEvent.click(menuBtn)
  })
}) 