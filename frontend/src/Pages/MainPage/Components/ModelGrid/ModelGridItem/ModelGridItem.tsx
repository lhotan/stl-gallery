import { FC, useEffect, useRef, useState } from "react";
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

	const { showModelWindow, windowOpen } = useApplicationContext();

	useEffect(() => {
		if (isHover) {
			thumbnailRef.current.play();
		} else {
			thumbnailRef.current.pause();
		}
	}, [isHover]);

	const handleContentOpen = (event) => {
		event.preventDefault();

		showModelWindow({ openedItem: itemRef.current });
	};

	return (
		<StyledListItem
			ref={itemRef}
			onClick={handleContentOpen}
			$isOpen={windowOpen}
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
					src={`http://localhost:8080/thumbnail/${id}`}
					type="video/mp4"
				/>
			</GridThumbnail>
		</StyledListItem>
	);
};
