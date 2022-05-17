import {
	Route,
	BrowserRouter as Router,
	Routes,
	Outlet,
} from "react-router-dom";
import { MainPage } from "./Pages/MainPage";
import { ApplicationContextProvider } from "./Pages/MainPage/ApplicationContext";
import {
	AppContainer,
	StyledHeader,
	StyledSeparator,
} from "./Pages/MainPage/styled";
import profilePicture from "./Assets/profile.png";
import { FC, ReactNode } from "react";
import { NewItemPage } from "./Pages/NewItemPage";

const Layout: FC = () => (
	<ApplicationContextProvider>
		<AppContainer>
			<StyledHeader>
				<h1>STL Catalog</h1>
				<div>
					<p id="user_name">Bob Placeholder</p>
					<img src={profilePicture} alt="profile" />
				</div>
			</StyledHeader>
			<StyledSeparator />
			<Outlet />
		</AppContainer>
	</ApplicationContextProvider>
);

const App = () => (
	<Router>
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<MainPage />} />
				<Route path="/new" element={<NewItemPage />} />
			</Route>
		</Routes>
	</Router>
);

export default App;
