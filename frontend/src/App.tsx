import {
	Route,
	BrowserRouter as Router,
	Routes,
	Outlet,
	Link,
	Navigate,
} from "react-router-dom";
import { MainPage } from "./Pages/MainPage";
import { ApplicationContextProvider } from "./Pages/MainPage/ApplicationContext";
import {
	AppContainer,
	StyledHeader,
	StyledSeparator,
} from "./Pages/MainPage/styled";
import { FC } from "react";
import { NewModelPage } from "./Pages/NewModelPage";
import styled from "styled-components";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

const StyledLink = styled(Link)`
	&:visited {
		color: black;
	}
`;

const StyledHeading = styled.h1`
	font-size: 2rem;
	margin: unset;
`;

const StyledNav = styled.nav`
	display: grid;
	grid-auto-flow: column;
	gap: 1rem;
	align-self: end;
`;

const HeadingUserContainer = styled.div`
	display: grid;
	grid-auto-flow: column;
	align-items: center;
	gap: 0.75rem;
`;

const HeadingUserName = styled.p`
	font-size: 1.25rem;
	margin: 0;
`;

const HeadingUserPicture = styled.img`
	width: 2.25rem;
	height: 2.25rem;
	border-radius: 100%;
`;

const Layout: FC = () => {
	const { loginWithRedirect, user, logout, isAuthenticated } = useAuth0();

	const handleLogout = async (event) => {
		event.preventDefault();
		logout();
	};

	const handleLogin = async (event) => {
		event.preventDefault();
		await loginWithRedirect();
	};

	return (
		<ApplicationContextProvider>
			<AppContainer>
				<StyledHeader>
					<StyledLink to="/">
						<StyledHeading>STL Catalog</StyledHeading>
					</StyledLink>
					{isAuthenticated ? (
						<>
							<StyledNav>
								<StyledLink to="/new">New model</StyledLink>
							</StyledNav>
							<HeadingUserContainer>
								<HeadingUserName>{user.name}</HeadingUserName>
								<StyledLink to="/logout" onClick={handleLogout}>
									<HeadingUserPicture
										src={`/proxy/${encodeURIComponent(user.picture)}`}
										alt="profile"
										referrerPolicy="no-referrer"
									/>
								</StyledLink>
							</HeadingUserContainer>
						</>
					) : (
						<>
							<StyledLink to="/login" onClick={handleLogin}>
								Login
							</StyledLink>
						</>
					)}
				</StyledHeader>
				<StyledSeparator />
				<Outlet />
			</AppContainer>
		</ApplicationContextProvider>
	);
};

const ProtectedRoute: FC = () => {
	const { isAuthenticated } = useAuth0();

	if (!isAuthenticated) {
		return <Navigate to="/" />;
	}

	return <Outlet />;
};

const App = () => (
	<Auth0Provider
		domain={process.env.REACT_APP_AUTH0_CLIENT_DOMAIN}
		clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
		cacheLocation={"localstorage"}
		useRefreshTokens={true}
		redirectUri={window.location.origin}
	>
		<Router>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<MainPage />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/new" element={<NewModelPage />} />
					</Route>
				</Route>
			</Routes>
		</Router>
	</Auth0Provider>
);

export default App;
