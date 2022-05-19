import { useRef } from "react";
import { useApplicationContext } from "../../../ApplicationContext";
import { ModelGridItem } from "../ModelGridItem";
import { NoItemsContainer, StyledList } from "./styled";

export const ModelGrid = () => {
	const gridRef = useRef<HTMLUListElement | undefined>();

	const { galleryItems } = useApplicationContext();

	return (
		<StyledList ref={gridRef}>
			{galleryItems?.length ? (
				galleryItems.map((item) => <ModelGridItem key={item.id} data={item} />)
			) : (
				<NoItemsContainer>...</NoItemsContainer>
			)}
		</StyledList>
	);
};

export default ModelGrid;
