import { createContext, FC, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { ModelWindow } from "./Components/ModelWindow";

type ShowModelWindowArgs = {
	item: HTMLLIElement;
};

type ContextType = {
	showModelWindow: (args: ShowModelWindowArgs) => Promise<void>;
	windowOpen: boolean;
};

const ApplicationContext = createContext<ContextType>({
	showModelWindow: undefined,
	windowOpen: undefined,
});

const ApplicationContextProvider: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [itemCoordinates, setItemCoordinates] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	const [itemDimensions, setItemDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: 0, height: 0 });

	const [windowOpen, setWindowOpen] = useState(false);

	const handleWindowShow = ({ item }: ShowModelWindowArgs) =>
		new Promise<void>((resolve) => {
			const { x, y, width, height } = item.getBoundingClientRect();
			setItemCoordinates({ x, y });
			setItemDimensions({ width, height });
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
			}}
		>
			{children}
			{windowOpen &&
				createPortal(
					<ModelWindow
						onWindowClose={handleWindowClose}
						{...{ itemCoordinates, itemDimensions }}
					/>,
					document.querySelector("#portal")
				)}
		</ApplicationContext.Provider>
	);
};

const useApplicationContext = () => useContext(ApplicationContext);

export { ApplicationContextProvider, useApplicationContext };
