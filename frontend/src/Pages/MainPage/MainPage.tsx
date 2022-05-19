import { StyledMain, NoItemsContainer, StyledList } from "./styled";
import { useApplicationContext } from "./Contexts/ApplicationContext";
import { ModelGridItem } from "./Components/ModelGridItem";

export const MainPage = () => {
	const { galleryItems } = useApplicationContext();

	return (
		<StyledMain>
			<StyledList>
				{galleryItems?.length ? (
					galleryItems.map((item) => (
						<ModelGridItem key={item.id} data={item} />
					))
				) : (
					<NoItemsContainer>...</NoItemsContainer>
				)}
			</StyledList>
		</StyledMain>
	);
};
