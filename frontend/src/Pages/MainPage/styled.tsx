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

const StyledList = styled.ul`
	list-style-type: none;

	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	grid-auto-rows: min-content;
	min-height: 30rem;

	gap: 0.75rem;
	padding: 1rem 1rem;
	align-items: start;
`;

const NoItemsContainer = styled.div`
	display: grid;
	align-items: center;
	justify-content: center;
`;

export {
	AppContainer,
	StyledHeader,
	StyledSeparator,
	StyledMain,
	StyledList,
	NoItemsContainer,
};
