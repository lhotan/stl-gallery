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
		<StyledMain>
			<ModelGrid />
		</StyledMain>
	);
};
