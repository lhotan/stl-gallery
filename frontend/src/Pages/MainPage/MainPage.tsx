import { ModelGrid } from "./Components/ModelGrid";
import {
	AppContainer,
	StyledHeader,
	StyledMain,
	StyledSeparator,
} from "./styled";
import profilePicture from "./Assets/profile.png";

export const MainPage = () => {
	return (
		<AppContainer>
			<StyledHeader>
				<h1>STL Catalog</h1>
				<div>
					<p>Bob Placeholder</p>
					<img src={profilePicture} alt="profile" />
				</div>
			</StyledHeader>
			<StyledSeparator />
			<StyledMain>
				<ModelGrid />
			</StyledMain>
		</AppContainer>
	);
};
