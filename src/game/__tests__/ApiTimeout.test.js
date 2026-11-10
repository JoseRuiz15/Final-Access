import { describe, expect, it } from 'vitest'
import { api } from '@/api/client'

describe('API request bounds', () => {
  it('has a finite timeout for requests that wait on the backend', () => {
    expect(api.defaults.timeout).toBe(15000)
  })
})
