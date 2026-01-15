export const HomeLayout = (props: { children: React.ReactNode }) => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100">
			<div className="w-1/2 hidden md:block bg">
				<h1 className="text-4xl font-bold text-center mb-8">
					Welcome to Cinelog
				</h1>
			</div>
			<div className="w-full md:w-1/2 px-2">{props.children}</div>
		</div>
	);
};
