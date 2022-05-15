import { FC, useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../../../../../config";
import { useApplicationContext } from "../../../ApplicationContext";
import { ContentTitle, GridThumbnail, StyledListItem } from "./styled";

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

	const [isHover, setIsHover] = useState(false);

	const { showModelWindow, openedItem } = useApplicationContext();

	useEffect(() => {
		if (isHover) {
			thumbnailRef.current.play();
		} else {
			thumbnailRef.current.pause();
		}
	}, [isHover]);

	const handleContentOpen = (event) => {
		event.preventDefault();

		showModelWindow({
			itemElement: itemRef.current,
			item: {
				color,
				id,
				thumbnail,
				title,
			},
		});
	};

	return (
		<StyledListItem
			ref={itemRef}
			onClick={handleContentOpen}
			$isOpen={Boolean(openedItem)}
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
				<source src={`${BACKEND_URL}/thumbnail/${id}`} type="video/mp4" />
			</GridThumbnail>
		</StyledListItem>
	);
};
