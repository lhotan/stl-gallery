import { Auth0Client, User } from "@auth0/auth0-spa-js";
import { createContext, useContext, useEffect, useState } from "react";

const auth0 = new Auth0Client({
	domain: process.env.REACT_APP_AUTH0_CLIENT_DOMAIN,
	client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
	cacheLocation: "localstorage",
});

type ContextType = {
	user: User;
	logout: () => void;
	login: () => void;
};

const UserContext = createContext<ContextType>({
	user: undefined,
	logout: undefined,
	login: undefined,
});

const UserContextProvider = ({ children }) => {
	const [user, setUser] = useState<User>();

	useEffect(() => {
		(async () => {
			try {
				const token = await auth0.getTokenSilently();

				if (token) {
					const user = await auth0.getUser();
					setUser(user);
				}
			} catch (error) {
				switch (error.message) {
					case "Login required":
						console.log("you need to log in first");
						break;
					default:
						throw new Error(error);
				}
			}
		})();
	}, []);

	const handleUserLogout = () => {
		auth0.logout({ returnTo: "http://localhost:3000/" });
	};

	const handleUserLogin = async () => {
		await auth0.loginWithRedirect({ redirect_uri: "http://localhost:3000/" });
		const user = await auth0.getUser();

		setUser(user);
	};

	return (
		<UserContext.Provider
			value={{
				user,
				logout: handleUserLogout,
				login: handleUserLogin,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

const useUser = () => useContext(UserContext);

export { UserContextProvider, useUser };
