import { FC, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useApplicationContext } from "../../../ApplicationContext";
import { getContentKeyframes, getSlideKeyframes } from "./keyframes";
import {
	ContentBackground,
	ContentTitle,
	GridContent,
	GridThumbnail,
	StyledListItem,
} from "./styled";

type ModelGridItemProps = {
	data: {
		id: string;
		title: string;
		thumbnail: string;
		color: string;
	};
};

export const ModelGridItem: FC<ModelGridItemProps> = ({
	data: { id, title, color, thumbnail },
}) => {
	const itemRef = useRef<HTMLLIElement>();

	const thumbnailRef = useRef<HTMLVideoElement>();
	const [isOpen, setIsOpen] = useState(false);

	const [animationInProgress, setAnimationInProgress] = useState(false);
	const [isHover, setIsHover] = useState(false);

	const { showModelWindow } = useApplicationContext();

	const handleContentOpen = (event) => {
		event.preventDefault();

		showModelWindow({ item: itemRef.current });

		console.log("opening content");
		if (!animationInProgress) {
			setIsOpen(() => true);
			//setAnimationInProgress(() => true);
			console.log(isOpen);
			//	await animateWindowOpen();
			console.log(isOpen);
			//setAnimationInProgress(() => false);
		}
	};

	const handleContentClose = async () => {
		console.log("closign content");
		if (!animationInProgress) {
			setAnimationInProgress(() => true);
			//await animateWindowClose();
			setAnimationInProgress(() => false);
			setIsOpen(() => false);
		}
	};

	return (
		<StyledListItem
			ref={itemRef}
			onClick={handleContentOpen}
			$isOpen={isOpen}
			$shadowColor={`#${color.split("0x").pop()}`}
			onPointerEnter={() => setIsHover(true)}
			onPointerLeave={() => setIsHover(false)}
		>
			<ContentTitle>{title}</ContentTitle>
			<GridThumbnail
				ref={thumbnailRef}
				poster={"data:image/png;base64," + thumbnail}
				loop
				disablePictureInPicture
				onClick={(event) => event.preventDefault()}
			>
				<source
					src={`http://localhost:4444/thumbnail/${id}`}
					type="video/mp4"
				/>
			</GridThumbnail>
		</StyledListItem>
	);
};
