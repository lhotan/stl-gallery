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

const CameraController = () => {
	const { camera, gl } = useThree();
	const [originalCameraAngle, setOriginalCameraAngle] = useState<number>();
	const [frames, setFrames] = useState<number>(0);

	useEffect(() => {
		// @ts-ignore
		window.STUDIO_RESET_FRAMES = () => {
			//@ts-ignore
			window.STUDIO_RENDER_DONE = false;
			handleFramesReset();
		};

		//@ts-ignore
		window.STUDIO_RESET_FRAMES();
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

	const handleFramesReset = () => {
		setFrames(() => 0);
	};

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

export const StudioPage = () => {
	const [model, setModel] = useState<BufferGeometry>();

	useEffect(() => {
		// @ts-ignore
		window.STUDIO_UPLOAD_MODEL = () => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".stl";

			input.onchange = (event: any) => {
				const file = event.target.files[0];
				const loader = new STLLoader();
				const filePath = URL.createObjectURL(file);

				loader.load(filePath, (model) => {
					setModel(model);
				});
			};

			input.click();
		};
	}, []);

	return (
		<StudioContainer>
			<StudioContent>
				{!model ? <div>nothing to see here</div> : <ModelView model={model} />}
			</StudioContent>
		</StudioContainer>
	);
};
