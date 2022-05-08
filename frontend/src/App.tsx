import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import styled from "styled-components";
import ModelGrid from "./Components/ModelGrid";
import MainPage from "./Pages/MainPage";
import StudioPage from "./Pages/StudioPage";
import profilePicture from "./profile.png";

const App = () => (
	<Router>
		<Routes>
			<Route path="/" element={<MainPage />} />
			<Route path="/studio" element={<StudioPage />} />
		</Routes>
	</Router>
);

export default App;
