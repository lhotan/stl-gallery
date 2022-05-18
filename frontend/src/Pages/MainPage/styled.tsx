import styled from "styled-components";

const AppContainer = styled.div`
	height: 100%;

	display: grid;
	grid-template-rows: auto min-content 1fr;
`;

const StyledHeader = styled.header`
	padding-top: 0.5rem;
	padding-bottom: 0.25rem;
	width: 95%;
	justify-self: center;
	display: grid;
	grid-auto-flow: column;
	justify-content: space-between;
	align-items: center;
`;

const StyledSeparator = styled.hr`
	height: 2px;
	background-color: purple;
	width: 95%;
	margin-bottom: 0.25rem;
`;

const StyledMain = styled.main`
	width: 95%;
	justify-self: center;
	display: grid;
`;

export { AppContainer, StyledHeader, StyledSeparator, StyledMain };
