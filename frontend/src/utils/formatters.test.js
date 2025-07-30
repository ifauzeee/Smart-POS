import { describe, it, expect } from 'vitest';
import { formatRupiah, parseRupiah } from './formatters.js';

describe('formatters', () => {
    // Tes untuk fungsi formatRupiah
    describe('formatRupiah', () => {
        it('should format a number into a Rupiah string correctly', () => {
            expect(formatRupiah(50000)).toBe('Rp 50.000');
        });

        it('should handle large numbers with correct separators', () => {
            expect(formatRupiah(1234567)).toBe('Rp 1.234.567');
        });

        it('should handle zero correctly', () => {
            expect(formatRupiah(0)).toBe('Rp 0');
        });

        it('should return an empty string for null or undefined input', () => {
            expect(formatRupiah(null)).toBe('');
            expect(formatRupiah(undefined)).toBe('');
        });
    });

    // Tes untuk fungsi parseRupiah
    describe('parseRupiah', () => {
        it('should parse a Rupiah string into a raw number string', () => {
            expect(parseRupiah('Rp 50.000')).toBe('50000');
        });

        it('should remove all separators and Rp prefix', () => {
            expect(parseRupiah('Rp 1.234.567')).toBe('1234567');
        });

        it('should handle input without prefix or separators', () => {
            expect(parseRupiah('75000')).toBe('75000');
        });
    });
});