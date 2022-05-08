const AppContainer = styled.div`
height: 100vh;

display: grid;
grid-template-rows: 4.25rem min-content auto;
`;

const StyledHeader = styled.header`
padding: 0.25rem 2rem;

display: grid;
grid-auto-flow: column;
justify-content: space-between;

& h1 {
  margin: unset;
  font-size: 2rem;
  padding: 0.5rem;
}

& div {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  font-size: 1.5rem;
  gap: 1rem;
}

& img {
  margin-right: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 100%;
}
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
