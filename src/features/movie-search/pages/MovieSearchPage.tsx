import { Input } from '@antoniobenincasa/ui';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLocale } from '@/lib/utilities/locale-utils';
import { MovieSearchList } from '../components';
import { movieSearchOptions } from '../queries/movie-search-options';

const MovieSearchPage = () => {
	const { t, i18n } = useTranslation();
	const activeLocale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
	const [query, setQuery] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState({
		query: '',
		locale: activeLocale,
	});
	const activeQuery =
		query.length >= 3 && debouncedSearch.locale === activeLocale
			? debouncedSearch.query
			: '';
	const search = useQuery(movieSearchOptions(activeQuery, activeLocale));

	useEffect(() => {
		setDebouncedSearch({ query: '', locale: activeLocale });
	}, [activeLocale]);

	useEffect(() => {
		if (query.length < 3) {
			setDebouncedSearch({ query: '', locale: activeLocale });
			return;
		}

		const timer = setTimeout(() => {
			setDebouncedSearch({ query, locale: activeLocale });
		}, 500);

		return () => clearTimeout(timer);
	}, [query, activeLocale]);

	return (
		<>
			<title>{t('MovieSearchPage.pageTitle')}</title>
			<div className="flex flex-col">
				<h1 className="text-2xl font-bold mb-4">
					{t('MovieSearchPage.title')}
				</h1>
				<Input
					placeholder={t('MovieSearchPage.searchPlaceholder')}
					className="mb-4"
					value={query}
					autoFocus
					onChange={(e) => setQuery(e.target.value)}
				/>

				<MovieSearchList
					results={search.data?.results}
					isLoading={search.isLoading}
					isFetching={search.isFetching}
					isError={search.isError}
					onRetry={() => {
						void search.refetch();
					}}
				/>
			</div>
		</>
	);
};

export default MovieSearchPage;
