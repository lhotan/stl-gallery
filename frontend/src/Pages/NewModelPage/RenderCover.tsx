import styled from "styled-components";
import { useUpload } from "./Contexts";

const RenderCoverContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: white;

	display: grid;
	justify-content: center;
	align-items: center;

	z-index: 999;
`;

export const RenderCover = () => {
	const { prepareCanvas, uploadStage } = useUpload();

	if (!prepareCanvas) {
		return null;
	}

	return (
		<RenderCoverContainer>
			{(() => {
				switch (uploadStage) {
					case "resize-canvas":
						return <>Resizing canvas...</>;
					case "render-video":
						return <>Rendering video...</>;
					case "done-rendering":
						return <>Done rendering!</>;
					case "uploading":
						return <>Uploading model...</>;
					case "done-uploading":
						return <>Done uploading!</>;
					default:
						return null;
				}
			})()}
		</RenderCoverContainer>
	);
};
