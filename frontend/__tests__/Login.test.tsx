/**
 * Unit tests for Login component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login'
import { api } from '../api'

// Mock the api module
vi.mock('../api', () => ({
  api: {
    login: vi.fn(),
  },
}))

describe('Login Component', () => {
  const mockOnLoginSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with required fields', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.getByText(/Access Node/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/firstname.lastname@cygnet.one/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Synchronize/i })).toBeInTheDocument()
  })

  it('displays ConferaX branding', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.getByText(/CONFERAX/i)).toBeInTheDocument()
    expect(screen.getByText(/Enterprise Space Node/i)).toBeInTheDocument()
  })

  it('allows user to type email and password', async () => {
    const user = userEvent.setup()
    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByPlaceholderText(/firstname.lastname@cygnet.one/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)

    await user.type(emailInput, 'john.doe@cygnet.one')
    await user.type(passwordInput, 'john@2026')

    expect(emailInput).toHaveValue('john.doe@cygnet.one')
    expect(passwordInput).toHaveValue('john@2026')
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement
    const toggleButton = screen.getByLabelText(/Show password/i)

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password')

    // Click to show password
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    // Click again to hide password
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits login form with valid credentials', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      access_token: 'mock-token-123',
      token_type: 'bearer',
      user: {
        id: '1',
        email: 'john.doe@cygnet.one',
        name: 'John Doe',
        role: 'USER',
        avatar: null,
      },
    }

    vi.mocked(api.login).mockResolvedValue(mockResponse)

    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByPlaceholderText(/firstname.lastname@cygnet.one/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /Synchronize/i })

    await user.type(emailInput, 'john.doe@cygnet.one')
    await user.type(passwordInput, 'john@2026')
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'john.doe@cygnet.one',
        password: 'john@2026',
      })
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid email or password'))

    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByPlaceholderText(/firstname.lastname@cygnet.one/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /Synchronize/i })

    await user.type(emailInput, 'wrong@cygnet.one')
    await user.type(passwordInput, 'wrongpass')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    vi.mocked(api.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByPlaceholderText(/firstname.lastname@cygnet.one/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /Synchronize/i })

    await user.type(emailInput, 'test@cygnet.one')
    await user.type(passwordInput, 'test@2026')
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/Establishing Link/i)).toBeInTheDocument()
  })

  it('does not show create account button', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.queryByText(/New user.*Create account/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Create Identity/i)).not.toBeInTheDocument()
  })

  it('displays password hint section', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.getByText(/Identity Hub Access/i)).toBeInTheDocument()
    expect(screen.getByText(/firstname@2026/i)).toBeInTheDocument()
    expect(screen.getByText(/firstname@2026admin/i)).toBeInTheDocument()
  })
})
