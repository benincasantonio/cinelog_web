import React from 'react';

export const useIsMobile = (): boolean => {
	const [isMobile, setIsMobile] = React.useState<boolean>(false);

	React.useEffect(() => {
		const checkIsMobile = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		checkIsMobile();
		window.addEventListener('resize', checkIsMobile);

		return () => {
			window.removeEventListener('resize', checkIsMobile);
		};
	}, []);

	return isMobile;
};
