import { render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import en from '@/lib/locales/en.json';
import fr from '@/lib/locales/fr.json';
import itLocale from '@/lib/locales/it.json';

vi.mock('./MovieLogItem', () => ({
	MovieLogItem: ({ log }: { log: { id: string } }) => (
		<div data-testid="movie-log-item">{log.id}</div>
	),
}));

import { MovieLogList } from './MovieLogList';

const i18n = createInstance();
beforeAll(async () => {
	await i18n.init({
		lng: 'en',
		resources: {
			en: { translation: en },
			fr: { translation: fr },
			it: { translation: itLocale },
		},
	});
});

describe('MovieLogList', () => {
	it.each([
		[0, 0, '0 Movies Watched'],
		[1, 0, '1 Movie Watched'],
		[2, 0, '2 Movies Watched'],
		[1, 1, '1 Movie Watched - 1 Rewatch'],
		[2, 2, '2 Movies Watched - 2 Rewatches'],
	])('renders %i unique movies and %i rewatches', async (uniqueTitles, totalRewatches, heading) => {
		await i18n.changeLanguage('en');
		const logs = Array.from(
			{ length: uniqueTitles + totalRewatches },
			(_, index) => ({
				id: String(index),
				movieId: String(index % uniqueTitles),
				tmdbId: index % uniqueTitles,
				dateWatched: '2026-01-01',
			})
		);
		render(
			<I18nextProvider i18n={i18n}>
				<MovieLogList
					logs={logs}
					uniqueTitles={uniqueTitles}
					totalRewatches={totalRewatches}
				/>
			</I18nextProvider>
		);

		expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(heading);
		expect(screen.queryAllByTestId('movie-log-item')).toHaveLength(logs.length);
		if (logs.length === 0) {
			expect(screen.getByText('No movies watched yet')).toBeInTheDocument();
		}
	});

	it.each([
		['it', 1, '1 Film Visto - 1 Rivisione'],
		['it', 2, '2 Film Visti - 2 Rivisioni'],
		['fr', 1, '1 Film Regardé - 1 Revisionnage'],
		['fr', 2, '2 Films Regardés - 2 Revisionnages'],
	])('localizes %s counts with %i rewatches', async (locale, count, heading) => {
		await i18n.changeLanguage(locale);
		render(
			<I18nextProvider i18n={i18n}>
				<MovieLogList logs={[]} uniqueTitles={count} totalRewatches={count} />
			</I18nextProvider>
		);
		expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(heading);
	});
});
