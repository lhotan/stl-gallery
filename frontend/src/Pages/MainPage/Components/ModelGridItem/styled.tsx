import styled, { css } from "styled-components";

const ContentBackground = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	z-index: 999;

	display: grid;
	justify-content: center;
	align-items: center;

	&:hover {
		cursor: pointer;
	}
`;

const GridContent = styled.div`
	opacity: 0;
	border-radius: 8px;
	background-color: white;
	box-shadow: 0 0 8px grey;
`;

const GridThumbnail = styled.video`
	width: 100%;
	height: 100%;
	border-radius: 8px;
`;

const ContentTitle = styled.p`
	position: absolute;
	bottom: 0;
	right: 0.5rem;
	left: 0.5rem;
	font-size: 1.5rem;
	font-weight: 400;
	color: black;

	background-color: #ffffffaa;
	padding: 0.3rem;
	border-radius: 8px;

	margin-bottom: 0.5rem;
`;

const StyledListItem = styled.li<{ $isOpen: boolean; $shadowColor: string }>`
	&:first-of-type {
		grid-column: 1 / 3;
		grid-row: 1 / 3;

		& ${ContentTitle} {
			font-size: 2rem;
		}
	}

	${({ $shadowColor }) => css`
		box-shadow: 0 0 4px ${$shadowColor};
	`}

	transition: all 200ms linear;
	position: relative;
	aspect-ratio: 4/3; // experimental, works perfectly here

	${({ $isOpen }) =>
		$isOpen
			? css`
					filter: grayscale(75%) opacity(80%);
			  `
			: css`
					&:hover {
						cursor: pointer;
						transform: scale(1.04);
						z-index: 2;
					}
			  `}
`;

export {
	ContentBackground,
	ContentTitle,
	GridContent,
	GridThumbnail,
	StyledListItem,
};
