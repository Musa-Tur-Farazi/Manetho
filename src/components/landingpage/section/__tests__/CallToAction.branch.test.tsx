import React from 'react'
import { render } from '@testing-library/react'
import CallToAction from '../CallToAction'

// Trigger IntersectionObserver callback immediately with isIntersecting true
beforeAll(() => {
  // @ts-ignore
  global.IntersectionObserver = class {
    private _cb: any
    constructor(cb: any) {
      this._cb = cb
    }
    observe() {
      // invoke after observer instance exists to avoid ref error
      this._cb([{ isIntersecting: true }])
    }
    disconnect() {}
    unobserve() {}
  }
})

describe('CallToAction – visible branch execution', () => {
  it('mounts and runs IntersectionObserver callback', () => {
    render(<CallToAction />)
    // No explicit assertion needed — if the component renders without throwing,
    // the branch has been executed. Jest will fail if any error occurs.
  })
}) 