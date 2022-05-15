import { Bounds, Center, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { FC, Suspense, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { BufferGeometry, Color } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useApplicationContext } from "../../ApplicationContext";

const ModelViewerWrapper = styled.div`
	width: 80vw;
	height: 80vh;

	& :hover {
		cursor: grab;
	}
`;

type ColorArray = [r: number, g: number, b: number];

type ModelViewerProps = {
	model: Blob;
};

type SceneProps = {
	model: BufferGeometry;
	color: number;
};

const Scene: FC<SceneProps> = ({ model, color }) => {
	return (
		<Bounds fit clip damping={6} margin={1.2}>
			<Center>
				<ambientLight intensity={0.2} />
				<directionalLight />
				<mesh geometry={model}>
					<meshStandardMaterial color={color} />
				</mesh>
			</Center>
		</Bounds>
	);
};

const ModelViewer: FC<ModelViewerProps> = ({ model }) => {
	const {
		openedItem: { color },
	} = useApplicationContext();

	const parsedColor = parseInt(color);

	const [loadedModel, setLoadedModel] = useState<BufferGeometry>();

	useEffect(() => {
		const loader = new STLLoader();
		loader.load(URL.createObjectURL(model), (geometry) => {
			setLoadedModel(geometry);
		});
	}, [model]);

	const backgroundColor = useMemo(() => {
		const bgColor = new Color(parsedColor);
		const tintColor = new Color(0xeeeeee);

		return new Color().addColors(bgColor, tintColor).toArray() as ColorArray;
	}, [parsedColor]);

	return (
		<ModelViewerWrapper>
			<Canvas
				camera={{
					fov: 75,
					position: [5, 5, 5],
				}}
				style={{
					borderRadius: "8px",
				}}
			>
				<Suspense fallback={null}>
					<color attach="background" args={backgroundColor} />
					<Scene model={loadedModel} color={parsedColor} />
					<OrbitControls />
				</Suspense>
			</Canvas>
		</ModelViewerWrapper>
	);
};

export default ModelViewer;
