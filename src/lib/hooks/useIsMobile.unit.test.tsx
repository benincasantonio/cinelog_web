import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './useIsMobile';

describe('useIsMobile', () => {
	const originalInnerWidth = window.innerWidth;
	const listeners: Record<string, EventListener[]> = {};

	beforeEach(() => {
		listeners.resize = [];
		vi.spyOn(window, 'addEventListener').mockImplementation(
			(event: string, handler: EventListener) => {
				if (!listeners[event]) listeners[event] = [];
				listeners[event].push(handler);
			}
		);
		vi.spyOn(window, 'removeEventListener').mockImplementation(
			(event: string, handler: EventListener) => {
				if (listeners[event]) {
					listeners[event] = listeners[event].filter((h) => h !== handler);
				}
			}
		);
	});

	afterEach(() => {
		Object.defineProperty(window, 'innerWidth', {
			value: originalInnerWidth,
			writable: true,
		});
		vi.restoreAllMocks();
	});

	it('should return false for desktop width', () => {
		Object.defineProperty(window, 'innerWidth', {
			value: 1024,
			writable: true,
		});

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(false);
	});

	it('should return true for mobile width', () => {
		Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(true);
	});

	it('should return true at exactly 768px', () => {
		Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(true);
	});

	it('should update when window is resized', () => {
		Object.defineProperty(window, 'innerWidth', {
			value: 1024,
			writable: true,
		});

		const { result } = renderHook(() => useIsMobile());
		expect(result.current).toBe(false);

		Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
		act(() => {
			for (const handler of listeners.resize) {
				handler(new Event('resize'));
			}
		});

		expect(result.current).toBe(true);
	});

	it('should clean up resize listener on unmount', () => {
		const { unmount } = renderHook(() => useIsMobile());

		expect(listeners.resize.length).toBe(1);

		unmount();

		expect(listeners.resize.length).toBe(0);
	});
});
