import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatAssistant from './ChatAssistant';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

test('ChatAssistant responds to "Tengo una duda" with helpful message', async () => {
  jest.useFakeTimers();
  render(<ChatAssistant />);

  // Open chat
  // The toggle button is the one visible initially.
  // It has a MessageCircle icon.
  const toggleButtons = screen.getAllByRole('button');
  fireEvent.click(toggleButtons[0]);

  // Find input
  const input = screen.getByPlaceholderText('Escribe tu consulta...');

  // Send "Tengo una duda"
  fireEvent.change(input, { target: { value: 'Tengo una duda' } });
  fireEvent.submit(input.closest('form'));

  // Fast-forward time for bot response
  act(() => {
    jest.advanceTimersByTime(1500);
  });

  // Verify we get the specific helpful response
  await waitFor(() => {
    const response = screen.queryByText(/Dime cuál es tu duda y trataré de ayudarte/i);
    // This should fail initially because the code currently returns the default error message
    expect(response).toBeInTheDocument();
  });
});

test('ChatAssistant lists specialties when asked', async () => {
    jest.useFakeTimers();
    render(<ChatAssistant />);

    const toggleButtons = screen.getAllByRole('button');
    fireEvent.click(toggleButtons[0]);

    const input = screen.getByPlaceholderText('Escribe tu consulta...');

    fireEvent.change(input, { target: { value: 'cuales son las especialidades' } });
    fireEvent.submit(input.closest('form'));

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      // Should list Cardiología, Pediatría, etc.
      expect(screen.queryByText(/Cardiología/i)).toBeInTheDocument();
      expect(screen.queryByText(/Pediatría/i)).toBeInTheDocument();
      expect(screen.queryByText(/Dermatología/i)).toBeInTheDocument();
    });
});
