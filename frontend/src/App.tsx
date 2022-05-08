import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { MainPage } from "./Pages/MainPage";
import { StudioPage } from "./Pages/StudioPage";

const App = () => (
	<Router>
		<Routes>
			<Route path="/" element={<MainPage />} />
			<Route path="/studio" element={<StudioPage />} />
		</Routes>
	</Router>
);

export default App;
