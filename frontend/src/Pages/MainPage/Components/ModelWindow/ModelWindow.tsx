import { FC, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useApplicationContext } from "../../ApplicationContext";
import {
	getContentKeyframes,
	getSlideKeyframes,
} from "../ModelGrid/ModelGridItem/keyframes";
import {
	ContentBackground,
	GridContent as ContentWrapper,
} from "../ModelGrid/ModelGridItem/styled";
import Loading from "./Loading";
import ModelViewer from "./ModelViewer";

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

	const [bytesLoaded, setBytesLoaded] = useState(0);
	const [byteCount, setByteCount] = useState(0);
	const [model, setModel] = useState<Blob>();

	const { openedItem } = useApplicationContext();

	const slideKeyframes = useMemo(
		() =>
			getSlideKeyframes({
				itemCoordinates,
				itemDimensions,
				color: openedItem.color.replace("0x", "#"),
			}),
		[itemCoordinates, itemDimensions, openedItem.color]
	);

	const contentKeyframes = useMemo(() => getContentKeyframes(), []);

	const animateWindowOpen = () =>
		new Promise<void>(async (resolve) => {
			const background = backgroundRef.current;
			const content = contentRef.current;

			await background.animate(slideKeyframes, {
				fill: "forwards",
				delay: 100,
				duration: 400,
			}).finished;

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
		(async () => {
			const response = await fetch(
				`http://localhost:8080/model/${openedItem.id}`
			);
			const contentLength = response.headers.get("content-length");
			const totalLength = parseInt(contentLength, 10);

			setByteCount(totalLength);

			const readableStream = new ReadableStream({
				async start(controller) {
					const reader = response.body.getReader();

					while (true) {
						const { done, value } = await reader.read();

						if (done) {
							break;
						}

						// for some reason we need to halve the byteLength here
						setBytesLoaded((bytes) => bytes + value.byteLength / 2);
						controller.enqueue(value);
					}

					controller.close();
				},
			});

			const result = new Response(readableStream);
			const blob = await result.blob();

			setModel(blob);
		})();
	}, []);

	const handleWindowClose = async (event) => {
		if (event.target === backgroundRef.current) {
			await animateWindowClose();
			onWindowClose();
		}
	};

	return (
		<ContentBackground ref={backgroundRef} onClick={handleWindowClose}>
			<ContentWrapper ref={contentRef} onClick={(e) => e.preventDefault()}>
				{!model ? (
					<Loading currentLength={bytesLoaded} totalLength={byteCount} />
				) : (
					<ModelViewer model={model} />
				)}
			</ContentWrapper>
		</ContentBackground>
	);
};
