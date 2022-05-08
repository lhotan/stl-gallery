import styled from "styled-components";

const StyledList = styled.ul`
	list-style-type: none;

	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(15vw, 1fr));
	grid-template-rows: repeat(auto-fit, minmax(16rem, 1fr));
	padding-right: 2rem;

	min-height: 60rem;

	gap: 0.75rem;
	padding: 1rem 1rem;
	align-items: center;
`;

export { StyledList };
