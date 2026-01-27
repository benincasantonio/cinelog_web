import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMovieLogStore } from './movieLogStore';

// Mock the repository functions
vi.mock('../repositories', () => ({
    createLog: vi.fn(),
    updateLog: vi.fn(),
}));

import { createLog, updateLog } from '../repositories';

const mockCreateLog = vi.mocked(createLog);
const mockUpdateLog = vi.mocked(updateLog);

describe('useMovieLogStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the store before each test
        const { result } = renderHook(() => useMovieLogStore());
        act(() => {
            result.current.clearError();
        });
    });

    describe('initial state', () => {
        it('should have isLoading as false initially', () => {
            const { result } = renderHook(() => useMovieLogStore());
            expect(result.current.isLoading).toBe(false);
        });

        it('should have error as null initially', () => {
            const { result } = renderHook(() => useMovieLogStore());
            expect(result.current.error).toBeNull();
        });
    });

    describe('createLog', () => {
        const mockLogData = {
            tmdbId: 550,
            dateWatched: '2024-01-09',
            watchedWhere: 'cinema' as const,
        };

        it('should set isLoading to true while creating log', async () => {
            mockCreateLog.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            );

            const { result } = renderHook(() => useMovieLogStore());

            act(() => {
                result.current.createLog(mockLogData);
            });

            expect(result.current.isLoading).toBe(true);
        });

        it('should set isLoading to false after successful create', async () => {
            mockCreateLog.mockResolvedValueOnce({ id: '1', ...mockLogData });

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                await result.current.createLog(mockLogData);
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should set error on failed create', async () => {
            const errorMessage = 'Network error';
            mockCreateLog.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                try {
                    await result.current.createLog(mockLogData);
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe(errorMessage);
        });

        it('should throw error on failed create', async () => {
            const errorMessage = 'Network error';
            mockCreateLog.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useMovieLogStore());

            await expect(
                act(async () => {
                    await result.current.createLog(mockLogData);
                })
            ).rejects.toThrow(errorMessage);
        });

        it('should set default error message when error is not an Error instance', async () => {
            mockCreateLog.mockRejectedValueOnce('Unknown error');

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                try {
                    await result.current.createLog(mockLogData);
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Failed to create movie log');
        });
    });

    describe('updateLog', () => {
        const movieId = 'movie-1';
        const mockUpdateData = {
            dateWatched: '2024-01-10',
            watchedWhere: 'streaming' as const,
        };

        it('should set isLoading to true while updating log', async () => {
            mockUpdateLog.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            );

            const { result } = renderHook(() => useMovieLogStore());

            act(() => {
                result.current.updateLog(movieId, mockUpdateData);
            });

            expect(result.current.isLoading).toBe(true);
        });

        it('should set isLoading to false after successful update', async () => {
            mockUpdateLog.mockResolvedValueOnce({ id: movieId, ...mockUpdateData });

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                await result.current.updateLog(movieId, mockUpdateData);
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should set error on failed update', async () => {
            const errorMessage = 'Update failed';
            mockUpdateLog.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                try {
                    await result.current.updateLog(movieId, mockUpdateData);
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe(errorMessage);
        });

        it('should throw error on failed update', async () => {
            const errorMessage = 'Update failed';
            mockUpdateLog.mockRejectedValueOnce(new Error(errorMessage));

            const { result } = renderHook(() => useMovieLogStore());

            await expect(
                act(async () => {
                    await result.current.updateLog(movieId, mockUpdateData);
                })
            ).rejects.toThrow(errorMessage);
        });

        it('should set default error message when error is not an Error instance', async () => {
            mockUpdateLog.mockRejectedValueOnce('Unknown error');

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                try {
                    await result.current.updateLog(movieId, mockUpdateData);
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Failed to update movie log');
        });
    });

    describe('clearError', () => {
        it('should clear error', async () => {
            mockCreateLog.mockRejectedValueOnce(new Error('Some error'));

            const { result } = renderHook(() => useMovieLogStore());

            await act(async () => {
                try {
                    await result.current.createLog({ tmdbId: 550, dateWatched: '2024-01-09' });
                } catch {
                    // Expected to throw
                }
            });

            expect(result.current.error).not.toBeNull();

            act(() => {
                result.current.clearError();
            });

            expect(result.current.error).toBeNull();
        });
    });
});
