import {
	createContext,
	FC,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { ModelWindow } from "./Components/ModelWindow";

type GalleryItem = {
	id: string;
	title: string;
	thumbnail: string;
	color: string;
};

type ShowModelWindowArgs = {
	openedItem: HTMLLIElement;
};

type ContextType = {
	showModelWindow: (args: ShowModelWindowArgs) => Promise<void>;
	windowOpen: boolean;
	galleryItems: GalleryItem[];
};

const ApplicationContext = createContext<ContextType>({
	showModelWindow: undefined,
	windowOpen: undefined,
	galleryItems: [],
});

const ApplicationContextProvider: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [openedItemCoordinates, setOpenedItemCoordinates] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	const [openedItemDimensions, setOpenedItemDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });

	const [galleryItems, setGalleryItems] = useState<GalleryItem[] | undefined>();

	const [windowOpen, setWindowOpen] = useState(false);

	useEffect(() => {
		fetch("http://localhost:8080/models").then((res) =>
			res.json().then((data) => setGalleryItems(data))
		);
	}, []);

	const handleWindowShow = ({ openedItem }: ShowModelWindowArgs) =>
		new Promise<void>((resolve) => {
			const { x, y, width, height } = openedItem.getBoundingClientRect();
			setOpenedItemCoordinates({ x, y });
			setOpenedItemDimensions({ width, height });
			setWindowOpen(true);
		});

	const handleWindowClose = () => {
		setWindowOpen(false);
	};

	return (
		<ApplicationContext.Provider
			value={{
				showModelWindow: handleWindowShow,
				windowOpen,
				galleryItems,
			}}
		>
			{children}
			{windowOpen &&
				createPortal(
					<ModelWindow
						onWindowClose={handleWindowClose}
						itemCoordinates={openedItemCoordinates}
						itemDimensions={openedItemDimensions}
					/>,
					document.querySelector("#portal")
				)}
		</ApplicationContext.Provider>
	);
};

const useApplicationContext = () => useContext(ApplicationContext);

export { ApplicationContextProvider, useApplicationContext };
