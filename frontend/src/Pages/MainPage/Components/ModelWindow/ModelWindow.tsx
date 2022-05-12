import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useApplicationContext } from "../../ApplicationContext";
import {
	getContentKeyframes,
	getSlideKeyframes,
} from "../ModelGrid/ModelGridItem/keyframes";
import {
	ContentBackground,
	GridContent,
} from "../ModelGrid/ModelGridItem/styled";

type ItemCoordinates = {
	x: number;
	y: number;
};

type ItemDimensions = {
	width: number;
	height: number;
};

type ModelWindowProps = {
	itemCoordinates: ItemCoordinates;
	itemDimensions: ItemDimensions;
	onWindowClose: () => void;
};

export const ModelWindow: FC<ModelWindowProps> = ({
	itemCoordinates,
	itemDimensions,
	onWindowClose,
}) => {
	const backgroundRef = useRef<HTMLDivElement>();
	const contentRef = useRef<HTMLDivElement>();

	const slideKeyframes = useMemo(
		() => getSlideKeyframes({ itemCoordinates, itemDimensions }),
		[itemCoordinates, itemDimensions]
	);

	const contentKeyframes = useMemo(() => getContentKeyframes(), []);

	const animateWindowOpen = () =>
		new Promise<void>(async (resolve) => {
			const background = backgroundRef.current;
			const content = contentRef.current;

			console.log(backgroundRef.current, contentRef.current);
			const r = background.animate(slideKeyframes, {
				fill: "forwards",
				delay: 100,
				duration: 400,
			}).finished;

			console.log(r);
			const rr = await r;
			console.log(rr);

			await content.animate(contentKeyframes, {
				fill: "forwards",
				duration: 400,
			}).finished;

			resolve();
		});

	const animateWindowClose = () =>
		new Promise<void>(async (resolve) => {
			const background = backgroundRef.current;
			const content = contentRef.current;

			await content.animate(contentKeyframes, {
				direction: "reverse",
				fill: "forwards",
				delay: 100,
				duration: 400,
			}).finished;

			await background.animate(slideKeyframes, {
				fill: "forwards",
				direction: "reverse",
				duration: 400,
				endDelay: 50,
			}).finished;

			resolve();
		});

	useEffect(() => {
		animateWindowOpen();
	}, []);

	const handleWindowClose = async () => {
		await animateWindowClose();
		onWindowClose();
	};

	return (
		<ContentBackground ref={backgroundRef} onClick={handleWindowClose}>
			<GridContent ref={contentRef}>"foo bar baz"</GridContent>
		</ContentBackground>
	);
};
