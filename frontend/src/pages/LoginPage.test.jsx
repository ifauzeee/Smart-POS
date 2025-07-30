import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
    it('should render the login form correctly', () => {
        // 1. Render komponen di dalam MemoryRouter karena ada <Link>
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        // 2. Cari elemen-elemen penting di layar
        const title = screen.getByRole('heading', { name: /selamat datang/i });
        const emailInput = screen.getByLabelText(/alamat email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });
        const registerLink = screen.getByText(/daftar di sini/i);

        // 3. Pastikan semua elemen tersebut ada di dalam dokumen
        expect(title).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
        expect(registerLink).toBeInTheDocument();
    });
});