import { describe, expect, it } from 'vitest';
import i18n from './i18n';

describe('i18n', () => {
	it('initializes translations with expected languages and fallback', () => {
		expect(i18n.isInitialized).toBe(true);
		expect(i18n.options.fallbackLng).toEqual(['en']);
		expect(i18n.options.supportedLngs).toEqual(
			expect.arrayContaining(['en', 'fr', 'it'])
		);
		expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
		expect(i18n.hasResourceBundle('fr', 'translation')).toBe(true);
		expect(i18n.hasResourceBundle('it', 'translation')).toBe(true);
	});

	it.each([
		[
			'en',
			{
				public: 'Public',
				followersOnly: 'Followers only',
				private: 'Private',
				publicDescription: 'Anyone can view your full profile and movie logs.',
				followersOnlyDescription:
					'Only followers you accept can view your full profile and movie logs.',
				privateDescription:
					'Only you can view your full profile and movie logs.',
			},
		],
		[
			'it',
			{
				public: 'Pubblico',
				followersOnly: 'Solo follower',
				private: 'Privato',
				publicDescription:
					'Chiunque può vedere il tuo profilo completo e i film che hai registrato.',
				followersOnlyDescription:
					'Solo i follower che accetti possono vedere il tuo profilo completo e i film che hai registrato.',
				privateDescription:
					'Solo tu puoi vedere il tuo profilo completo e i film che hai registrato.',
			},
		],
		[
			'fr',
			{
				public: 'Public',
				followersOnly: 'Abonnés uniquement',
				private: 'Privé',
				publicDescription:
					'Tout le monde peut voir votre profil complet et les films que vous avez enregistrés.',
				followersOnlyDescription:
					'Seuls les abonnés que vous acceptez peuvent voir votre profil complet et les films que vous avez enregistrés.',
				privateDescription:
					'Vous seul pouvez voir votre profil complet et les films que vous avez enregistrés.',
			},
		],
	])('contains complete profile visibility copy for %s', (language, copy) => {
		expect(i18n.t('ProfileVisibilitySelect.public', { lng: language })).toBe(
			copy.public
		);
		expect(
			i18n.t('ProfileVisibilitySelect.followers_only', { lng: language })
		).toBe(copy.followersOnly);
		expect(i18n.t('ProfileVisibilitySelect.private', { lng: language })).toBe(
			copy.private
		);
		expect(
			i18n.t('ProfileVisibilitySelect.descriptions.public', { lng: language })
		).toBe(copy.publicDescription);
		expect(
			i18n.t('ProfileVisibilitySelect.descriptions.followers_only', {
				lng: language,
			})
		).toBe(copy.followersOnlyDescription);
		expect(
			i18n.t('ProfileVisibilitySelect.descriptions.private', { lng: language })
		).toBe(copy.privateDescription);
	});
});
