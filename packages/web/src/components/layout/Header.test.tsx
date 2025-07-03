import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './Header';

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />);
  });

  it('displays the TypeAmp branding link', () => {
    render(<Header />);
    const brandingLink = screen.getByRole('link', { name: /typeamp/i });
    expect(brandingLink).toBeInTheDocument();
    expect(brandingLink).toHaveAttribute('href', '/');
  });

  it('shows the Login button', () => {
    render(<Header />);
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeVisible();
  });

  it('contains navigation links with icons', () => {
    render(<Header />);

    // Check for navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /stats/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /learn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });
});
