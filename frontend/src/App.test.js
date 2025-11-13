import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  const usernameInput = screen.getByPlaceholderText(/username/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);
  const loginButton = screen.getByRole('button', { name: /login/i });

  expect(usernameInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
});
