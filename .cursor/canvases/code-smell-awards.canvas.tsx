import {
	Callout,
	Card,
	CardBody,
	CardHeader,
	Code,
	CollapsibleSection,
	Divider,
	Grid,
	H1,
	H2,
	H3,
	Pill,
	PieChart,
	Row,
	Spacer,
	Stack,
	Stat,
	Table,
	Text,
	useCanvasState,
} from 'cursor/canvas';

type Severity = 'shame' | 'simpler' | 'nit' | 'award';

type Finding = {
	id: string;
	severity: Severity;
	title: string;
	where: string;
	smell: string;
	problem: string;
	leaner: string;
	savings: string;
};

const FINDINGS: Finding[] = [
	{
		id: '1',
		severity: 'shame',
		title: 'Test mass exceeds the product',
		where: 'Stats / MovieLogForm / AuthStore / MovieLogItem tests',
		smell: 'Test theater',
		problem:
			'~6.6k source LOC vs ~14k test LOC (2.1×). Stats.tsx is 73 lines; related tests approach 1.8k. Same store surfaces re-mocked; trivial getters asserted in matrices.',
		leaner:
			'Fewer golden integration paths + targeted units; shared factories; drop redundant getter matrices.',
		savings: '2–4k test LOC',
	},
	{
		id: '2',
		severity: 'shame',
		title: 'Dead MoviesPage twin',
		where: 'movie-search/pages/MoviesPage.tsx (+ tests, i18n)',
		smell: 'Dead code / abandoned WIP',
		problem:
			'Routes use MovieSearchPage only. MoviesPage is an unwired stub (search input, no handlers). The live file even names its component MoviesPage.',
		leaner: 'Delete the stub + tests + i18n; rename the real component to MovieSearchPage.',
		savings: '~80–100 LOC',
	},
	{
		id: '3',
		severity: 'shame',
		title: 'Zustand store with zero state',
		where: 'profile/stores/useUserStore.ts',
		smell: 'Fake store',
		problem:
			'Only re-exports updateProfile / changePassword from the repository. No cache, no loading, no shared state — a function table dressed as Zustand.',
		leaner: 'Call user-repository from forms (same as forgot/reset password).',
		savings: '~100 LOC',
	},
	{
		id: '4',
		severity: 'shame',
		title: 'Theme system split across 6 modules',
		where: 'ThemeProvider / Context / useTheme / Icon / Dropdown / RadioGroup',
		smell: 'Over-decomposition',
		problem:
			'A 3-option theme toggle is shredded into tiny files. RadioGroup is barrel-exported but only used internally. changeTheme is a one-liner around setTheme.',
		leaner: 'One ThemeProvider (context + hook) and one ThemeMenu (icon + items).',
		savings: '~100–150 LOC',
	},
	{
		id: '5',
		severity: 'shame',
		title: 'triggerCount as a global event bus',
		where: 'movieLogDialogStore → MoviesWatched / MovieLogItem',
		smell: 'Hidden pub/sub',
		problem:
			'Dialog store bumps an integer so lists re-fetch. Unrelated UI is temporally coupled through a magic counter.',
		leaner:
			'Own logs in a real store/query cache; invalidate or mutate the list after create/update/delete.',
		savings: 'complexity >> LOC',
	},
	{
		id: '6',
		severity: 'shame',
		title: 'Split-brain movie rating state',
		where: 'useMovieDetailsStore + useMovieRatingStore + MovieDetailsPage',
		smell: 'Store proliferation',
		problem:
			'Details owns movieRating; rating store owns modal + submit; page manually copies rating back after success.',
		leaner: 'One movie-page store, or keep rating on details and make the modal prop-driven.',
		savings: '~40–80 LOC',
	},
	{
		id: '7',
		severity: 'simpler',
		title: 'Form ritual cloned 8×',
		where: 'Login / Register / Forgot / Reset / ChangePassword / UpdateProfile / MovieLog / RateMovie',
		smell: 'Copy-paste async form',
		problem:
			'Same loading/error state + try/catch/finally + FormField ladder. Error handling inconsistent (raw Error.message vs extractApiError vs notify).',
		leaner: 'useAsyncSubmit + thin field helper; standardize on extractApiError / resolveApiFieldError.',
		savings: '~80–150 LOC',
	},
	{
		id: '8',
		severity: 'simpler',
		title: 'Auth store as API proxy',
		where: 'auth/stores/useAuthStore.ts',
		smell: 'Glorified pass-through',
		problem:
			'register / sendRegistrationCode only console.error and rethrow. Forgot/reset already call the repo directly — inconsistent layering.',
		leaner: 'Keep store for session only; call register/send-code from form/repo.',
		savings: '~20–40 LOC',
	},
	{
		id: '9',
		severity: 'simpler',
		title: 'Two movie repositories, same API',
		where: 'movie/repositories + movie-search/repositories',
		smell: 'Artificial feature split',
		problem: 'Both are one-liner apiClient calls to v1/movies. Thin wrappers that add ownership confusion.',
		leaner: 'Single movies API module (search + details + ratings).',
		savings: '~15–30 LOC',
	},
	{
		id: '10',
		severity: 'simpler',
		title: 'Request models mirroring Zod',
		where: 'auth/profile/logs models/*.ts vs schemas',
		smell: 'Type alias duplication',
		problem:
			'ForgotPasswordRequest / SendCodeRequest are { email: string } while schemas already infer form types. CamelCase twins often add nothing.',
		leaner: 'Keep wire types only where they differ; otherwise z.infer at the call site.',
		savings: '~40–60 LOC',
	},
	{
		id: '11',
		severity: 'simpler',
		title: 'RateMovieForm inlines Zod',
		where: 'movie/components/RateMovieForm.tsx',
		smell: 'Convention violation',
		problem: 'Schema lives in the component; AGENTS.md requires schemas/*.schema.ts.',
		leaner: 'Move to movie/schemas/rate-movie.schema.ts.',
		savings: 'consistency (0 LOC)',
	},
	{
		id: '12',
		severity: 'simpler',
		title: 'Dead HomeLayout / AuthLayout',
		where: 'home/components/HomeLayout.tsx',
		smell: 'Dead code',
		problem: 'Unused in the app; hardcoded English; ~72 LOC of tests for a 12 LOC layout.',
		leaner: 'Delete until needed.',
		savings: '~85 LOC',
	},
	{
		id: '13',
		severity: 'simpler',
		title: '36 barrel files of ceremony',
		where: 'features/**/index.ts',
		smell: 'Barrel sprawl',
		problem:
			'AppRoutes lazy-imports page files directly — page barrels unused. Models use export * against docs/programming-rules/models.md.',
		leaner: 'Barrels only at feature public boundaries; explicit named model re-exports.',
		savings: '~30–50 LOC',
	},
	{
		id: '14',
		severity: 'simpler',
		title: 'Hand-rolled time-unit i18n',
		where: 'lib/models/locale.model.ts (149) + date-utils',
		smell: 'Parallel i18n system',
		problem: 'Large static maps for year/month/… while the app already uses i18next JSON.',
		leaner: 'Locale JSON strings, or Intl.RelativeTimeFormat / DurationFormat.',
		savings: '~80–100 LOC',
	},
	{
		id: '15',
		severity: 'simpler',
		title: 'Custom shallowEqual for two numbers',
		where: 'lib/utilities/shallow-equal.ts + 101 LOC tests',
		smell: 'Reinventing the wheel',
		problem: 'Only used by stats canApplyFilters. Zustand ships shallow; or compare yearFrom/yearTo inline.',
		leaner: 'Inline compare or use Zustand shallow.',
		savings: '~110 LOC',
	},
	{
		id: '16',
		severity: 'simpler',
		title: 'Pass-through profile subpages',
		where: 'ProfileStats / Overview / MoviesWatched pages',
		smell: 'Title-only wrappers',
		problem: 'Stats is <title> + <Stats />. Overview is “coming soon”. Thin wiring dressed as pages.',
		leaner: 'Render from routes with a title helper; keep pages when they own fetching.',
		savings: '~40–60 LOC',
	},
	{
		id: '17',
		severity: 'simpler',
		title: 'Inconsistent data-fetch architecture',
		where: 'ProfilePage vs useMoviesStore vs MoviesWatched',
		smell: 'Three patterns, one app',
		problem:
			'Local useState+useEffect, Zustand async caches, and state-less “stores” coexist. Hard to know where loading/error lives.',
		leaner: 'Pick one (query library or thin feature stores with real cache).',
		savings: 'structural',
	},
	{
		id: '18',
		severity: 'nit',
		title: 'Navbar doubles its nav config',
		where: 'lib/components/Navbar.tsx',
		smell: 'Parallel data structures',
		problem: 'navigationData and mobileNavbarItems are the same links in two shapes.',
		leaner: 'One list mapped to desktop vs mobile.',
		savings: '~15 LOC',
	},
	{
		id: '19',
		severity: 'nit',
		title: 'console.error then rethrow everywhere',
		where: 'auth / movie / logs stores',
		smell: 'Noisy logging',
		problem: 'Logs + rethrows; tests must silence console. Noise without an observability strategy.',
		leaner: 'Let callers handle, or one error reporter.',
		savings: 'noise',
	},
	{
		id: '20',
		severity: 'nit',
		title: 'Overview tab ships “coming soon”',
		where: 'profile/pages/ProfileOverviewPage.tsx',
		smell: 'Placeholder as product',
		problem: 'Index profile tab is empty filler.',
		leaner: 'Default to movie-watched, or omit until real.',
		savings: 'UX',
	},
];

const AWARDS = [
	{
		title: 'Best Error UX Abstraction',
		item: 'api-error.ts map + override prefixes',
		why: 'Documented, typed, used well by Registration / ChangePassword.',
	},
	{
		title: 'Best Domain Modeling',
		item: 'Value enums from const arrays',
		why: 'profile-visibility, watched-where, stats presets match programming rules.',
	},
	{
		title: 'Most Earned Complexity',
		item: 'CSRF / refresh interceptors',
		why: 'Real auth edge cases handled with comments and raw fetch where needed.',
	},
	{
		title: 'Best Module Layout',
		item: 'features/<name>/{components,pages,stores,repositories,schemas}',
		why: 'Predictable navigation; lazy routes without forcing page barrels.',
	},
];

const SEVERITY_META: Record<
	Severity,
	{ label: string; tone: 'danger' | 'warning' | 'info' | 'success'; pill: 'deleted' | 'warning' | 'info' | 'success' }
> = {
	shame: { label: 'Hall of Shame', tone: 'danger', pill: 'deleted' },
	simpler: { label: 'Could Be Simpler', tone: 'warning', pill: 'warning' },
	nit: { label: 'Nit', tone: 'info', pill: 'info' },
	award: { label: 'Award', tone: 'success', pill: 'success' },
};

const PIE = [
	{ label: 'Hall of Shame', value: FINDINGS.filter((f) => f.severity === 'shame').length, tone: 'danger' as const },
	{ label: 'Could Be Simpler', value: FINDINGS.filter((f) => f.severity === 'simpler').length, tone: 'warning' as const },
	{ label: 'Nits', value: FINDINGS.filter((f) => f.severity === 'nit').length, tone: 'info' as const },
];

export default function CodeSmellAwardsCanvas() {
	const [filter, setFilter] = useCanvasState<'all' | Severity>('smell.filter', 'all');

	const visible = FINDINGS.filter((f) => filter === 'all' || f.severity === filter);
	const shame = FINDINGS.filter((f) => f.severity === 'shame').length;
	const simpler = FINDINGS.filter((f) => f.severity === 'simpler').length;
	const nits = FINDINGS.filter((f) => f.severity === 'nit').length;

	return (
		<Stack gap={24}>
			<Stack gap={8}>
				<Row gap={8} align="center">
					<H1>Cinelog Web — Code Smell Awards</H1>
					<Spacer />
					<Pill tone="warning">Critical review</Pill>
					<Pill tone="neutral">src/ ~20.5k LOC</Pill>
				</Row>
				<Text tone="secondary">
					Judged like a ceremony: what earns applause, what gets a polite golf clap,
					and what should be archived with less (or better) code. Scope:{' '}
					<Code>src/</Code> — React + TypeScript + Zustand + Zod.
				</Text>
			</Stack>

			<Callout tone="warning" title="Verdict">
				Readable architecture with intentional feature modules — but too many layers
				that don’t earn their keep (state-less stores, dead pages, theme file shrapnel),
				plus tests that grew faster than the product. Main debt is ceremony and hidden
				coupling, not chaos.
			</Callout>

			<Grid columns={4} gap={12}>
				<Stat value="2.1×" label="tests : source LOC" tone="warning" />
				<Stat value={String(shame)} label="Hall of Shame" tone="danger" />
				<Stat value={String(simpler)} label="Could Be Simpler" tone="warning" />
				<Stat value={String(AWARDS.length)} label="Award-worthy wins" tone="success" />
			</Grid>

			<Grid columns={2} gap={16}>
				<Card>
					<CardHeader>Smell distribution</CardHeader>
					<CardBody>
						<PieChart data={PIE} height={220} />
					</CardBody>
				</Card>
				<Card>
					<CardHeader>Cut first (impact order)</CardHeader>
					<CardBody>
						<Table
							headers={['#', 'Action', 'Approx. savings']}
							columnAlign={['left', 'left', 'right']}
							rows={[
								['1', 'Cull redundant stats/logs/auth/MovieLogItem tests', '2–4k test LOC'],
								['2', 'Delete dead MoviesPage + HomeLayout', '~170'],
								['3', 'Remove useUserStore; call repo from forms', '~100'],
								['4', 'Collapse theme files', '~100–150'],
								['5', 'Kill triggerCount + dual rating stores', 'complexity'],
								['6', 'Shared form submit + unify errors', '~100'],
								['7', 'Merge movie repos; drop barrels / twin models', '~80–120'],
							]}
						/>
					</CardBody>
				</Card>
			</Grid>

			<Divider />

			<Stack gap={8}>
				<H2>Filter findings</H2>
				<Row gap={8} wrap>
					{(
						[
							['all', 'All'],
							['shame', 'Hall of Shame'],
							['simpler', 'Could Be Simpler'],
							['nit', 'Nits'],
						] as const
					).map(([key, label]) => (
						<Pill
							key={key}
							active={filter === key}
							tone={key === 'all' ? 'neutral' : SEVERITY_META[key].pill}
							onClick={() => setFilter(key)}
						>
							{label}
							{key !== 'all'
								? ` (${FINDINGS.filter((f) => f.severity === key).length})`
								: ` (${FINDINGS.length})`}
						</Pill>
					))}
				</Row>
			</Stack>

			{filter !== 'nit' && (filter === 'all' || filter === 'shame') && (
				<Stack gap={12}>
					<H2>🏆 Hall of Shame</H2>
					<Text tone="secondary" size="small">
						These don’t just smell — they cost ongoing cognitive load for little payoff.
					</Text>
					{FINDINGS.filter((f) => f.severity === 'shame').map((f) => (
						<FindingCard key={f.id} finding={f} />
					))}
				</Stack>
			)}

			{(filter === 'all' || filter === 'simpler') && (
				<Stack gap={12}>
					<H2>✂️ Could Be Simpler</H2>
					<Text tone="secondary" size="small">
						Same behavior, less code — or clearer ownership with fewer files.
					</Text>
					{FINDINGS.filter((f) => f.severity === 'simpler').map((f) => (
						<CollapsibleSection
							key={f.id}
							title={`${f.id}. ${f.title}`}
							trailing={<Pill tone="warning" size="sm">{f.savings}</Pill>}
							defaultOpen={false}
						>
							<Stack gap={6}>
								<Text size="small" tone="secondary">
									{f.where}
								</Text>
								<Text size="small">
									<strong>Smell:</strong> {f.smell}
								</Text>
								<Text size="small">{f.problem}</Text>
								<Text size="small" tone="secondary">
									Leaner: {f.leaner}
								</Text>
							</Stack>
						</CollapsibleSection>
					))}
				</Stack>
			)}

			{(filter === 'all' || filter === 'nit') && (
				<Stack gap={12}>
					<H2>📎 Nits</H2>
					<Table
						headers={['#', 'Smell', 'Where', 'Leaner']}
						rows={FINDINGS.filter((f) => f.severity === 'nit').map((f) => [
							f.id,
							f.title,
							f.where,
							f.leaner,
						])}
					/>
				</Stack>
			)}

			{filter === 'all' && (
				<>
					<Divider />
					<Stack gap={12}>
						<H2>🎖️ Award-worthy patterns</H2>
						<Grid columns={2} gap={12}>
							{AWARDS.map((a) => (
								<Card key={a.title}>
									<CardHeader trailing={<Pill tone="success" size="sm">Win</Pill>}>
										{a.title}
									</CardHeader>
									<CardBody>
										<Stack gap={6}>
											<H3>{a.item}</H3>
											<Text tone="secondary" size="small">
												{a.why}
											</Text>
										</Stack>
									</CardBody>
								</Card>
							))}
						</Grid>
					</Stack>

					<Callout tone="info" title="Bottom line for the trophy case">
						Keep the feature layout, API error map, and auth interceptors. Archive the
						state-less store, dead pages, theme shrapnel, and the{' '}
						<Code>triggerCount</Code> bus. Then put the test suite on a diet — confidence
						is not proportional to line count.
					</Callout>

					<Text tone="tertiary" size="small">
						Showing {visible.length} of {FINDINGS.length} findings · {nits} nits in the
						table · source of truth: this canvas under{' '}
						<Code>.cursor/canvases/code-smell-awards.canvas.tsx</Code>
					</Text>
				</>
			)}
		</Stack>
	);
}

function FindingCard({ finding }: { finding: Finding }) {
	const meta = SEVERITY_META[finding.severity];
	return (
		<Card>
			<CardHeader
				trailing={
					<Row gap={6}>
						<Pill tone={meta.pill} size="sm">
							{meta.label}
						</Pill>
						<Pill tone="neutral" size="sm">
							{finding.savings}
						</Pill>
					</Row>
				}
			>
				{finding.id}. {finding.title}
			</CardHeader>
			<CardBody>
				<Stack gap={8}>
					<Text size="small" tone="secondary">
						{finding.where}
					</Text>
					<Row gap={8} wrap>
						<Pill tone="deleted" size="sm">
							{finding.smell}
						</Pill>
					</Row>
					<Text size="small">{finding.problem}</Text>
					<Callout tone="neutral" title="Leaner">
						{finding.leaner}
					</Callout>
				</Stack>
			</CardBody>
		</Card>
	);
}
