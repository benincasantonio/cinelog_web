import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { LogListItem } from '../models';
import { useMovieLogDialogStore } from './movieLogDialogStore';

describe('useMovieLogDialogStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        const { result } = renderHook(() => useMovieLogDialogStore());
        act(() => {
            result.current.close();
        });
    });

    describe('initial state', () => {
        it('should have isOpen as false initially', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            expect(result.current.isOpen).toBe(false);
        });

        it('should have prefilledMovie as null initially', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            expect(result.current.prefilledMovie).toBeNull();
        });

        it('should have movieToEdit as null initially', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            expect(result.current.movieToEdit).toBeNull();
        });

        it('should have triggerCount as 0 initially', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            expect(result.current.triggerCount).toBe(0);
        });
    });

    describe('open', () => {
        it('should set isOpen to true when open is called without options', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());

            act(() => {
                result.current.open();
            });

            expect(result.current.isOpen).toBe(true);
        });

        it('should set prefilledMovie when open is called with prefilledMovie option', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            const prefilledMovie = { tmdbId: 550, title: 'Fight Club' };

            act(() => {
                result.current.open({ prefilledMovie });
            });

            expect(result.current.isOpen).toBe(true);
            expect(result.current.prefilledMovie).toEqual(prefilledMovie);
            expect(result.current.movieToEdit).toBeNull();
        });

        it('should set movieToEdit when open is called with movieToEdit option', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            const movieToEdit: LogListItem = {
                id: '1',
                movieId: 'movie-1',
                tmdbId: 550,
                dateWatched: '2024-01-09',
            };

            act(() => {
                result.current.open({ movieToEdit });
            });

            expect(result.current.isOpen).toBe(true);
            expect(result.current.movieToEdit).toEqual(movieToEdit);
            expect(result.current.prefilledMovie).toBeNull();
        });

        it('should throw error when both movieToEdit and prefilledMovie are provided', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            const prefilledMovie = { tmdbId: 550, title: 'Fight Club' };
            const movieToEdit: LogListItem = {
                id: '1',
                movieId: 'movie-1',
                tmdbId: 550,
                dateWatched: '2024-01-09',
            };

            expect(() => {
                act(() => {
                    result.current.open({ movieToEdit, prefilledMovie });
                });
            }).toThrow('Cannot open dialog with both movieToEdit and prefilledMovie');
        });
    });

    describe('close', () => {
        it('should set isOpen to false when close is called', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());

            act(() => {
                result.current.open();
            });
            expect(result.current.isOpen).toBe(true);

            act(() => {
                result.current.close();
            });
            expect(result.current.isOpen).toBe(false);
        });

        it('should clear prefilledMovie when close is called', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            const prefilledMovie = { tmdbId: 550, title: 'Fight Club' };

            act(() => {
                result.current.open({ prefilledMovie });
            });
            expect(result.current.prefilledMovie).toEqual(prefilledMovie);

            act(() => {
                result.current.close();
            });
            expect(result.current.prefilledMovie).toBeNull();
        });

        it('should clear movieToEdit when close is called', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            const movieToEdit: LogListItem = {
                id: '1',
                movieId: 'movie-1',
                tmdbId: 550,
                dateWatched: '2024-01-09',
            };

            act(() => {
                result.current.open({ movieToEdit });
            });
            expect(result.current.movieToEdit).toEqual(movieToEdit);

            act(() => {
                result.current.close();
            });
            expect(result.current.movieToEdit).toBeNull();
        });
    });

    describe('setIsOpen', () => {
        it('should set isOpen to true', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());

            act(() => {
                result.current.setIsOpen(true);
            });

            expect(result.current.isOpen).toBe(true);
        });

        it('should set isOpen to false and clear prefilledMovie', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());

            act(() => {
                result.current.open({ prefilledMovie: { tmdbId: 550, title: 'Fight Club' } });
            });

            act(() => {
                result.current.setIsOpen(false);
            });

            expect(result.current.isOpen).toBe(false);
            expect(result.current.prefilledMovie).toBeNull();
        });
    });

    describe('clearPrefilledMovie', () => {
        it('should clear prefilledMovie without affecting other state', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            const prefilledMovie = { tmdbId: 550, title: 'Fight Club' };

            act(() => {
                result.current.open({ prefilledMovie });
            });
            expect(result.current.prefilledMovie).toEqual(prefilledMovie);
            expect(result.current.isOpen).toBe(true);

            act(() => {
                result.current.clearPrefilledMovie();
            });

            expect(result.current.prefilledMovie).toBeNull();
            expect(result.current.isOpen).toBe(true); // isOpen should remain true
        });
    });

    describe('triggerUpdate', () => {
        it('should increment triggerCount', () => {
            const { result } = renderHook(() => useMovieLogDialogStore());
            expect(result.current.triggerCount).toBe(0);

            act(() => {
                result.current.triggerUpdate();
            });
            expect(result.current.triggerCount).toBe(1);

            act(() => {
                result.current.triggerUpdate();
            });
            expect(result.current.triggerCount).toBe(2);
        });
    });
});
