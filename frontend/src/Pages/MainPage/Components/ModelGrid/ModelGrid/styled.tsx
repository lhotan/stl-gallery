import styled from "styled-components";

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

export { StyledList, NoItemsContainer };
