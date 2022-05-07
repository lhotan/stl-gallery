import { Bounds, Center } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
	FC,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styled from "styled-components";
import { BufferGeometry, Color, Mesh } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const StudioContainer = styled.div`
	width: 100vw;
	height: 100vh;

	display: grid;
	grid-template-columns: auto;
`;

const StudioContent = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	justify-content: center;
	align-items: center;
`;

const StudioControls = styled.div`
	position: absolute;
	bottom: 0;
	right: 0;
	visibility: hidden;
`;

const CameraController = () => {
	const { camera, gl } = useThree();
	const [originalCameraAngle, setOriginalCameraAngle] = useState<number>();
	const [frames, setFrames] = useState<number>(0);

	useEffect(() => {
		//@ts-ignore
		window.STUDIO_RENDER_DONE = false;
	}, []);

	const controls = useMemo(
		() => new OrbitControls(camera, gl.domElement),
		[camera, gl]
	);

	useEffect(() => {
		if (originalCameraAngle === undefined) {
			setOriginalCameraAngle(() => controls.getAzimuthalAngle());
		}
	}, [controls]);

	useEffect(() => {
		// @ts-ignore
		window.STUDIO_ROTATE_CAMERA = () => {
			handleCameraRotate();
		};
	}, [originalCameraAngle, frames]);

	const handleCameraRotate = () => {
		controls.autoRotate = true;
		controls.autoRotateSpeed = 25;

		const rotate = () => {
			if (
				controls.getAzimuthalAngle()?.toFixed(1) ===
					originalCameraAngle?.toFixed(1) &&
				frames > 10
			) {
				//@ts-ignore
				window.STUDIO_RENDER_DONE = true;
			} else {
				controls.update();
				setFrames((frames) => frames + 1);
			}
		};

		rotate();
	};

	return null;
};

type SceneProps = {
	model: BufferGeometry;
	color: number;
};

const Scene: FC<SceneProps> = ({ model, color }) => {
	const mesh = useRef<Mesh>();

	return (
		<Bounds fit clip damping={6} margin={1.2}>
			<Center>
				<ambientLight intensity={0.2} />
				<directionalLight />
				<mesh geometry={model} ref={mesh}>
					<meshStandardMaterial color={color} />
				</mesh>
			</Center>
		</Bounds>
	);
};

type ColorArray = [r: number, g: number, b: number];

type ModelViewProps = {
	model: BufferGeometry;
};

const ModelView: FC<ModelViewProps> = ({ model }) => {
	const [color, setColor] = useState(0xaaaaaa);

	useEffect(() => {
		// @ts-ignore
		window.STUDIO_SET_COLOR = (color: string) => {
			setColor(parseInt(color));
		};
	}, []);

	const backgroundColor = useMemo(() => {
		const bgColor = new Color(color);
		const tintColor = new Color(0xeeeeee);

		return new Color().addColors(bgColor, tintColor).toArray() as ColorArray;
	}, [color]);

	return (
		<Canvas
			camera={{
				fov: 75,
				position: [5, 5, 5],
			}}
		>
			<Suspense fallback={null}>
				<color attach="background" args={backgroundColor} />
				<Scene model={model} color={color} />
				<CameraController />
			</Suspense>
		</Canvas>
	);
};

const StudioPage = () => {
	const [model, setModel] = useState<BufferGeometry>();
	const inputRef = useRef<HTMLInputElement>();

	const handleFileUpload = (file: File) => {
		if (!file.name.toLowerCase().endsWith(".stl")) {
			alert("NOT AN STL FILE!");
			inputRef.current.value = "";
		} else {
			const loader = new STLLoader();
			const filePath = URL.createObjectURL(file);

			loader.load(filePath, (model) => {
				setModel(model);
			});
		}
	};

	return (
		<StudioContainer>
			<StudioContent>
				{!model ? (
					<div>
						<label htmlFor="model">Upload stl file here: </label>
						<input
							ref={inputRef}
							onChange={(e) => handleFileUpload(e.target.files[0])}
							type="file"
							id="model"
							name="model"
							accept=".stl"
						/>
					</div>
				) : (
					<ModelView model={model} />
				)}
			</StudioContent>
		</StudioContainer>
	);
};

export default StudioPage;
