import { expect, type Page, test } from '@playwright/test';
import en from '../src/lib/locales/en.json' with { type: 'json' };

const movieId = '6f1c2a9e-5738-46f6-bfc7-4c8e518de561';
const logId = 'bf6c39c4-00da-4f47-9314-1ebeb965412a';
const movie = {
	id: movieId,
	title: 'Selected movie',
	originalTitle: 'Selected movie',
	overview: 'Overview',
	releaseDate: '2010-07-16',
	posterPath: null,
	backdropPath: null,
	voteAverage: 8.4,
	voteCount: 100,
	runtime: 120,
	budget: 0,
	revenue: 0,
	status: 'Released',
	tagline: null,
	homepage: null,
	imdbId: null,
	originalLanguage: 'en',
	popularity: 1,
	adult: false,
	genres: [],
	productionCompanies: [],
	productionCountries: [],
	spokenLanguages: [],
};

async function backend(page: Page, referenceFirst = false) {
	const calls: {
		path: string;
		method: string;
		body?: Record<string, unknown>;
	}[] = [];
	let rating: Record<string, unknown> | undefined;
	let log: Record<string, unknown> | undefined;
	await page.route('**/api/v1/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const path = url.pathname.replace('/api/v1/', '');
		const method = request.method();
		const body = method === 'POST' ? request.postDataJSON() : undefined;
		calls.push({ path, method, body });
		const json = (value: unknown, status = 200) =>
			route.fulfill({ status, json: value });
		if (path === 'users/info' || path === 'users/viewer/profile')
			return json({
				id: 'cf6c39c4-00da-4f47-9314-1ebeb965412a',
				handle: 'viewer',
				firstName: 'Test',
				lastName: 'Viewer',
				email: 'viewer@example.test',
				dateOfBirth: '1990-01-01',
				locale: 'en-US',
				profileVisibility: 'public',
				followersCount: 0,
				followingCount: 0,
				isFollowing: false,
			});
		if (path === 'auth/csrf') return json({ csrfToken: 'test-csrf' });
		if (path === 'movies/search')
			return json(
				referenceFirst || url.searchParams.has('cursor')
					? {
							results: [
								{
									...movie,
									id: null,
									movieRef: 'opaque-reference',
									genreIds: [],
								},
							],
							nextCursor: null,
						}
					: {
							results: Array.from({ length: 15 }, (_, index) => ({
								...movie,
								id: `a0000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
								movieRef: null,
								title: `Catalog film ${index}`,
								genreIds: [],
							})),
							nextCursor: 'opaque-next-page',
						}
			);
		if (path === 'movies/resolve') {
			expect(body).toEqual({ movieRef: 'opaque-reference' });
			expect(request.headers()['x-csrf-token']).toBe('test-csrf');
			return json({ movieId });
		}
		if (path === `movies/${movieId}`) return json(movie);
		if (path === `movie-ratings/${movieId}`)
			return rating ? json(rating) : route.fulfill({ status: 204 });
		if (path === 'movie-ratings/' && method === 'POST') {
			expect(body).toEqual({ movieId, rating: 8, comment: null });
			rating = {
				id: 'rating-id',
				movieId,
				userId: 'viewer',
				rating: 8,
				comment: null,
				createdAt: '',
				updatedAt: '',
			};
			return json(rating);
		}
		if (path === 'logs/' && method === 'POST') {
			expect(body).toEqual({ movieId, dateWatched: '2026-10-31' });
			expect(body).not.toHaveProperty('tmdbId');
			expect(body).not.toHaveProperty('posterPath');
			log = { ...body, id: logId, movie, movieRating: 8, posterPath: null };
			return json(log);
		}
		if (path === 'logs/viewer')
			return json({
				logs: log ? [log] : [],
				totalWatches: log ? 1 : 0,
				uniqueTitles: log ? 1 : 0,
				totalRewatches: 0,
			});
		return json({ error_code_name: 'MOVIE_NOT_FOUND' }, 404);
	});
	return calls;
}

test('scroll, keyboard selection, canonical reload, rating, log and history navigation', async ({
	page,
}) => {
	const calls = await backend(page);
	await page.goto('/search');
	await page
		.getByRole('textbox', { name: en.MovieSearchPage.searchPlaceholder })
		.fill('Selected');
	await expect(
		page.getByRole('button', { name: /Catalog film 14/ })
	).toBeVisible();
	expect(calls.some((call) => call.path === 'movies/resolve')).toBe(false);
	await page
		.getByRole('button', { name: en.MovieSearchList.loadMore })
		.scrollIntoViewIfNeeded();
	const selection = page.getByRole('button', { name: /Selected movie/ });
	await expect(selection).toBeVisible();
	await selection.focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(`/movies/${movieId}`);
	expect(calls.filter((call) => call.path === 'movies/resolve')).toHaveLength(
		1
	);
	await page.reload();
	await page
		.getByRole('button', { name: en.MovieDetailsPage.rate, exact: true })
		.click();
	await page
		.getByRole('radio', {
			name: en.RateMovie.optionLabel.replace('{{value}}', '8'),
			exact: true,
		})
		.press('Space');
	await page
		.getByRole('button', { name: en.RateMovieForm.save, exact: true })
		.click();
	await expect(
		page.getByRole('dialog').filter({ has: page.locator('form') })
	).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: en.MovieDetailsPage.rate, exact: true })
	).not.toBeVisible();
	await page
		.getByRole('button', { name: en.MovieDetailsPage.logMovie, exact: true })
		.last()
		.click();
	await page.getByLabel(en.MovieLogForm.dateWatchedLabel).fill('2026-10-31');
	await page
		.getByRole('button', {
			name: en.CreateMovieLogDialog.submitCreate,
			exact: true,
		})
		.click();
	await expect(
		page.getByRole('dialog').filter({ has: page.locator('form') })
	).not.toBeVisible();
	await page.goto('/profile/viewer/movie-watched');
	await page.getByTestId('movie-title-link').focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(`/movies/${movieId}`);
	expect(calls.filter((call) => call.path === 'movies/resolve')).toHaveLength(
		1
	);
});

test('numeric URLs never make detail, rating or resolve requests', async ({
	page,
}) => {
	const calls = await backend(page);
	await page.goto('/movies/11304');
	await expect(page.getByText(en.MovieDetailsPage.notFound)).toBeVisible();
	expect(
		calls.filter((call) => /^(movies|movie-ratings)\//.test(call.path))
	).toEqual([]);
});

test('unknown UUID shows not found without resolving it', async ({ page }) => {
	const calls = await backend(page);
	await page.goto(`/movies/${logId}`);
	await expect(page.getByText(en.MovieDetailsPage.notFound)).toBeVisible();
	expect(calls.some((call) => call.path === 'movies/resolve')).toBe(false);
});

test('global log picker resolves its selected reference and submits without loading details', async ({
	page,
}) => {
	const calls = await backend(page, true);
	await page.goto('/');
	await page
		.getByRole('button', {
			name: en.CreateMovieLogButton.logMovie,
			exact: true,
		})
		.click();
	const submit = page.getByRole('button', {
		name: en.CreateMovieLogDialog.submitCreate,
		exact: true,
	});
	await expect(submit).toBeDisabled();
	await page.getByLabel(en.MovieLogForm.dateWatchedLabel).fill('2026-10-31');
	await page
		.getByRole('button', { name: en.MovieSelection.choose, exact: true })
		.click();
	await page
		.getByPlaceholder(en.MovieSearchPage.searchPlaceholder)
		.fill('Selected');
	const option = page.getByRole('option', { name: 'Selected movie' });
	await expect(option).toBeVisible();
	expect(calls.some((call) => call.path === 'movies/resolve')).toBe(false);
	await option.press('Enter');
	await expect(submit).toBeEnabled();
	await expect(option).not.toBeVisible();
	await page.screenshot({ path: test.info().outputPath('log-selection.png') });
	await submit.click();
	await expect(
		page.getByRole('dialog').filter({ has: page.locator('form') })
	).not.toBeVisible();
	expect(calls.filter((call) => call.path === 'movies/resolve')).toHaveLength(
		1
	);
	expect(calls.some((call) => call.path === `movies/${movieId}`)).toBe(false);
});
test('Back clears search state and narrow search remains keyboard accessible', async ({
	page,
}) => {
	await backend(page, true);
	await page.setViewportSize({ width: 320, height: 740 });
	await page.goto('/search');
	const query = page.getByRole('textbox', {
		name: en.MovieSearchPage.searchPlaceholder,
	});
	await query.fill('Selected');
	const movie = page.getByRole('button', { name: /Selected movie/ });
	await expect(movie).toBeVisible();
	await movie.focus();
	await page.screenshot({
		path: test.info().outputPath('search-mobile-focus.png'),
	});
	const bounds = await movie.boundingBox();
	expect(bounds).not.toBeNull();
	expect(bounds!.x).toBeGreaterThanOrEqual(0);
	expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(`/movies/${movieId}`);
	await expect(
		page.getByRole('heading', { name: 'Overview', exact: true })
	).toBeVisible();
	await page.goBack();
	await expect(query).toHaveValue('');
	await expect(page.getByText(en.MovieSearchList.startTyping)).toBeVisible();
});
