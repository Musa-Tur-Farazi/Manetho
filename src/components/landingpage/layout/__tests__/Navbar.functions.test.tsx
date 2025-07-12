import React from 'react'
import { render, fireEvent, screen } from '@/__tests__/utils/test-utils'

// --- THEME MOCK ------------------------------------------------------------------
jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  const Ctx = React.createContext({ theme: 'light', setTheme: jest.fn() })
  return {
    __esModule: true,
    ThemeProvider: ({ children }: any) => {
      return React.createElement(Ctx.Provider, { value: { theme: 'light', setTheme: jest.fn() } }, children)
    },
    useTheme: () => {
      const ctx = React.useContext(Ctx)
      setThemeSpy = ctx.setTheme
      return ctx
    },
  }
})

let setThemeSpy: jest.Mock

// --- ROUTER MOCK -----------------------------------------------------------------
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
}))

// --- CLERK MOCK (variable flag) ---------------------------------------------------
let mockSignedIn = false
jest.mock('@clerk/nextjs', () => ({
  __esModule: true,
  useAuth: () => ({ isSignedIn: mockSignedIn, isLoaded: true }),
}))

// Import after mocks
import Navbar from '../Navbar'

const renderNavbar = (signedIn: boolean) => {
  mockSignedIn = signedIn
  pushMock.mockReset()
  return render(<Navbar />)
}

describe('Navbar functional branches', () => {
  it('calls router.push on Login button when signed out', () => {
    renderNavbar(false)
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(pushMock).toHaveBeenCalledWith('/custom-auth/sign-in?redirect_url=%2Fhome')
  })

  it('calls router.push on Dashboard when signed in', () => {
    renderNavbar(true)
    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))
    expect(pushMock).toHaveBeenCalledWith('/home')
  })

  it('toggles mobile menu open and close', () => {
    renderNavbar(false)
    const openBtn = screen.getByLabelText(/open menu/i)
    fireEvent.click(openBtn)
    const closeBtn = screen.getByLabelText(/close menu/i)
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)
    expect(screen.queryByLabelText(/close menu/i)).not.toBeInTheDocument()
  })

  it('mobile menu → Dashboard button (signed in) closes menu and redirects', async () => {
    renderNavbar(true)
    fireEvent.click(screen.getByLabelText(/open menu/i))

    // Dashboard button inside mobile drawer
    fireEvent.click(screen.getAllByText(/dashboard/i)[0])

    expect(pushMock).toHaveBeenCalledWith('/home')
  })

  it('mobile menu → Log in button when signed out', async () => {
    renderNavbar(false)
    fireEvent.click(screen.getByLabelText(/open menu/i))

    fireEvent.click(screen.getAllByText(/log in/i)[0])

    expect(pushMock).toHaveBeenCalledWith('/custom-auth/sign-in?redirect_url=%2Fhome')
  })

  it('theme toggle and window resize handler', () => {
    renderNavbar(false)

    // theme button
    fireEvent.click(screen.getByLabelText('Toggle theme'))
    expect(setThemeSpy).toHaveBeenCalled()

    // trigger resize to call handleResize
    fireEvent(window, new Event('resize'))
  })

  it('desktop Explore → FlashCards link triggers router', () => {
    renderNavbar(true)
    // flashcards link is in DOM even if dropdown invisible
    fireEvent.click(screen.getByText(/flashcards/i))
    expect(pushMock).toHaveBeenCalledWith('/flashcards')
  })

  it('resize ≥768 closes mobile menu', () => {
    renderNavbar(false)
    // open menu first
    fireEvent.click(screen.getByLabelText(/open menu/i))
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument()

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 })
    fireEvent(window, new Event('resize'))

    expect(screen.queryByLabelText(/close menu/i)).not.toBeInTheDocument()
  })
}) 