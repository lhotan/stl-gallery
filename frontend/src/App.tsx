import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import styled from "styled-components";
import AutoGrid from "./Components/AutoGrid";
import StudioPage from "./Pages/StudioPage";
import profilePicture from "./profile.png";

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
  background-color: white;

  width: 95%;
  justify-self: center;
  display: grid;
`;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AppContainer>
              <StyledHeader>
                <h1>STL Catalog</h1>
                <div>
                  <p>Bob Placeholder</p>
                  <img src={profilePicture} />
                </div>
              </StyledHeader>
              <StyledSeparator />
              <StyledMain>
                <AutoGrid></AutoGrid>
              </StyledMain>
            </AppContainer>
          }
        />
        <Route path="/studio" element={<StudioPage />} />
      </Routes>
    </Router>
  );
};

export default App;
