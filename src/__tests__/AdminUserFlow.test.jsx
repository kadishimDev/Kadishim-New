import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import Admin from '../pages/Admin';

// Mock child components
vi.mock('../components/HebrewCalendarWidget', () => ({
    default: ({ kaddishList }) => <div data-testid="calendar-widget">Calendar Widget (Items: {kaddishList.length})</div>
}));

describe('Admin Page User Simulation', () => {

    it('Scenario 1: Full User Flow - Login -> Switch Tab -> Check Data', async () => {
        render(<Admin />);

        // 1. Verify Login Screen
        console.log("Step 1: Checking Login Screen...");
        expect(screen.getByText(/ממשק ניהול מסווג/i)).toBeInTheDocument();

        // Find by Label: "סיסמת גישה"
        const input = screen.getByLabelText(/סיסמת גישה/i);
        expect(input).toBeInTheDocument();

        // 2. Simulate User Typing Password
        console.log("Step 2: Typing Password...");
        fireEvent.change(input, { target: { value: 'admin123' } });

        // 3. Simulate Click Login
        console.log("Step 3: Clicking Login...");
        const loginBtn = screen.getByText(/כניסה למערכת/i);
        fireEvent.click(loginBtn);

        // 4. Verify Dashboard Loaded
        console.log("Step 4: Verifying Dashboard...");
        await waitFor(() => {
            expect(screen.getByText(/מאגר הנצחה וקדישים/i)).toBeInTheDocument();
        });

        // 5. Verify Default Tab (Archive)
        const archiveBtn = screen.getByText(/ארכיון היסטורי/i);
        expect(archiveBtn).toHaveClass('bg-black');

        const rows = screen.getAllByRole('row');
        console.log(`Step 5: Found ${rows.length} rows in Archive tab.`);
        expect(rows.length).toBeGreaterThan(1);

        // 6. Switch to "New Requests" Tab
        console.log("Step 6: Switching to 'New Requests'...");
        const newRequestsBtn = screen.getByText(/בקשות חדשות/i);
        fireEvent.click(newRequestsBtn);

        // 7. Verify New Data Loaded (Simulated)
        await waitFor(() => {
            expect(screen.getByText(/דוד בן יוסף/i)).toBeInTheDocument();
            expect(screen.getByText(/רחל בת לאה/i)).toBeInTheDocument();
        });
        console.log("Step 7: New Requests Data Verified!");

        // 8. Verify Strict Date Format in New Tab
        expect(screen.getByText(/כ״ב בשבט תשפ״ד/i)).toBeInTheDocument();
    });

});
