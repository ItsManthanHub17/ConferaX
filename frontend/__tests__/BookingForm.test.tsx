/**
 * Unit tests for BookingForm component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingForm from '../components/BookingForm'

// Mock rooms data
const mockRooms = [
  {
    id: 'room-1',
    name: 'Conference Room A',
    floor: '1st Floor',
    room_number: 'CR-101',
    capacity: 10,
    features: ['Projector', 'Whiteboard'],
    is_active: true,
  },
  {
    id: 'room-2',
    name: 'Conference Room B',
    floor: '2nd Floor',
    room_number: 'CR-201',
    capacity: 15,
    features: ['Video Conference'],
    is_active: true,
  },
]

describe('BookingForm Component', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders booking form with all required fields', () => {
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText(/Room/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Attendees/i)).toBeInTheDocument()
  })

  it('displays all available rooms in dropdown', () => {
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const roomSelect = screen.getByLabelText(/Room/i)
    fireEvent.click(roomSelect)

    expect(screen.getByText('Conference Room A')).toBeInTheDocument()
    expect(screen.getByText('Conference Room B')).toBeInTheDocument()
  })

  it('allows user to fill in booking details', async () => {
    const user = userEvent.setup()
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Select room
    const roomSelect = screen.getByLabelText(/Room/i)
    await user.selectOptions(roomSelect, 'room-1')

    // Fill in date
    const dateInput = screen.getByLabelText(/Date/i)
    await user.type(dateInput, '2026-02-20')

    // Fill in times
    const startTimeInput = screen.getByLabelText(/Start Time/i)
    await user.type(startTimeInput, '10:00')

    const endTimeInput = screen.getByLabelText(/End Time/i)
    await user.type(endTimeInput, '11:00')

    // Fill in title
    const titleInput = screen.getByLabelText(/Title/i)
    await user.type(titleInput, 'Team Meeting')

    // Fill in attendees
    const attendeesInput = screen.getByLabelText(/Attendees/i)
    await user.clear(attendeesInput)
    await user.type(attendeesInput, '5')

    expect(roomSelect).toHaveValue('room-1')
    expect(dateInput).toHaveValue('2026-02-20')
    expect(titleInput).toHaveValue('Team Meeting')
    expect(attendeesInput).toHaveValue(5)
  })

  it('validates that end time is after start time', async () => {
    const user = userEvent.setup()
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const startTimeInput = screen.getByLabelText(/Start Time/i)
    const endTimeInput = screen.getByLabelText(/End Time/i)

    await user.type(startTimeInput, '15:00')
    await user.type(endTimeInput, '14:00') // Before start time

    const submitButton = screen.getByRole('button', { name: /Create Booking|Submit/i })
    await user.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/end time.*after.*start time/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Create Booking|Submit/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    // Fill in all required fields
    await user.selectOptions(screen.getByLabelText(/Room/i), 'room-1')
    await user.type(screen.getByLabelText(/Date/i), '2026-02-20')
    await user.type(screen.getByLabelText(/Start Time/i), '10:00')
    await user.type(screen.getByLabelText(/End Time/i), '11:00')
    await user.type(screen.getByLabelText(/Title/i), 'Team Meeting')
    await user.clear(screen.getByLabelText(/Attendees/i))
    await user.type(screen.getByLabelText(/Attendees/i), '5')

    const submitButton = screen.getByRole('button', { name: /Create Booking|Submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('pre-fills form when editing existing booking', () => {
    const existingBooking = {
      id: 'BK-2026-1234',
      room_id: 'room-1',
      date: '2026-02-15',
      start_time: '14:00',
      end_time: '15:00',
      title: 'Existing Meeting',
      attendees: 8,
      description: 'Important meeting',
      priority: 'High',
      status: 'Approved',
    }

    render(
      <BookingForm
        rooms={mockRooms}
        booking={existingBooking}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText(/Room/i)).toHaveValue('room-1')
    expect(screen.getByLabelText(/Date/i)).toHaveValue('2026-02-15')
    expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Meeting')
    expect(screen.getByLabelText(/Attendees/i)).toHaveValue(8)
  })

  it('shows priority selection', () => {
    render(
      <BookingForm
        rooms={mockRooms}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const prioritySelect = screen.getByLabelText(/Priority/i)
    expect(prioritySelect).toBeInTheDocument()
    
    fireEvent.click(prioritySelect)
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })
})
