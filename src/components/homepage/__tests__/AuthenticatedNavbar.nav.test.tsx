import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AuthenticatedNavbar from '../AuthenticatedNavbar'

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { firstName: 'T', id: 'uid' } }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  const Ctx = React.createContext({ theme: 'light', setTheme: jest.fn() })
  return {
    __esModule: true,
    ThemeProvider: ({ children }: any) => React.createElement(Ctx.Provider, { value: { theme: 'light', setTheme: jest.fn() } }, children),
    useTheme: () => React.useContext(Ctx),
  }
})

describe('AuthenticatedNavbar – desktop nav scroll', () => {
  it('calls window.scrollTo when My Learning clicked', () => {
    // add target section to DOM
    const target = document.createElement('div')
    target.id = 'learning-section'
    // fake position
    target.getBoundingClientRect = () => ({ top: 100, left:0,right:0,bottom:0,width:0,height:0 }) as any
    document.body.appendChild(target)

    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const { getByText } = render(<AuthenticatedNavbar isScrolled={false} />)
    const btn = getByText('My Learning')
    fireEvent.click(btn)

    expect(scrollSpy).toHaveBeenCalled()
    scrollSpy.mockRestore()
  })
}) 