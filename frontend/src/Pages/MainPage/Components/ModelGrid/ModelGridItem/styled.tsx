import styled, { css } from "styled-components";

const ContentBackground = styled.div`
	position: absolute;
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
	width: 90vw;
	height: 90vh;
	border-radius: 8px;
	background-color: white;
	box-shadow: 0 0 8px grey;
`;

const GridThumbnail = styled.video`
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 8px;
`;

const ContentTitle = styled.p`
	position: absolute;
	bottom: 0;
	right: 1rem;
	font-size: 1.5rem;
	font-weight: 400;
	color: black;
`;

const StyledListItem = styled.li<{ $isOpen: boolean; $shadowColor: string }>`
	height: 100%;

	border-radius: 8px;

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

	display: grid;
	position: relative;

	${({ $isOpen }) =>
		$isOpen
			? css`
					filter: grayscale(75%) opacity(80%);
			  `
			: css`
					&:hover {
						cursor: pointer;
						transform: scale(1.04);
						background-color: red;
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
