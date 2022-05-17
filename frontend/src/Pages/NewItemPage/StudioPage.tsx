import { Bounds, Center } from "@react-three/drei";
import { Canvas, render, useThree } from "@react-three/fiber";
import {
	FC,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styled, { css } from "styled-components";
import {
	BufferGeometry,
	Color,
	Mesh,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import useIframeMessage from "../../Shared/useIframeMessage";

type CameraControllerProps = {
	isRendering: boolean;
	onFrameDone: (data: string) => void;
	onRenderDone: () => void;
};

const CameraController: FC<CameraControllerProps> = ({
	onFrameDone,
	isRendering,
	onRenderDone,
}) => {
	const { camera, gl } = useThree();
	const [originalCameraAngle, setOriginalCameraAngle] = useState<number>();
	const [frames, setFrames] = useState<number>(0);

	const controls = useMemo(
		() => new OrbitControls(camera, gl.domElement),
		[camera, gl]
	);

	useEffect(() => {
		if (originalCameraAngle === undefined) {
			setOriginalCameraAngle(() => controls.getAzimuthalAngle());
		}

		controls.enablePan = false;
		controls.enableZoom = false;
		controls.enableRotate = false;
	}, [controls]);

	console.log(isRendering);

	useEffect(() => {
		// reset frames when rendering done
		if (!isRendering) {
			setFrames(0);
		}

		if (isRendering) {
			handleCameraRotate();
		}
	}, [isRendering, frames]);

	const handleCameraRotate = () => {
		controls.autoRotate = true;
		controls.autoRotateSpeed = 25;

		const rotate = () => {
			if (
				controls.getAzimuthalAngle()?.toFixed(1) ===
					originalCameraAngle?.toFixed(1) &&
				frames > 10
			) {
				onRenderDone();
			} else {
				controls.update();

				setFrames((frames) => frames + 1);

				onFrameDone(gl.domElement.toDataURL());
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

const ModelScene: FC<SceneProps> = ({ model, color }) => {
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
	color: number;
	onFrameDone: (data: string) => void;
	onRenderDone: () => void;
	isRendering: boolean;
};

const ModelView: FC<ModelViewProps> = ({
	model,
	color,
	onFrameDone,
	onRenderDone,
	isRendering,
}) => {
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
			gl={{ preserveDrawingBuffer: true /* make screenshots work */ }}
		>
			<Suspense fallback={null}>
				<color attach="background" args={backgroundColor} />
				<ModelScene model={model} color={color} />
				<CameraController
					onFrameDone={onFrameDone}
					isRendering={isRendering}
					onRenderDone={onRenderDone}
				/>
			</Suspense>
		</Canvas>
	);
};

const UploadModelViewContainer = styled.div<{ $isRendering }>`
	border: 1px solid black;
	width: 800px;
	height: 600px;

	${({ $isRendering }) =>
		$isRendering &&
		css`
			width: 800px;
			height: 600px;
		`}
`;

const UploadModelButton = styled.button`
	width: 100%;
	height: 100%;
`;
type UploadModelViewProps = {
	isRendering: boolean;
	color: number;
	onFrameDone: (data: string) => void;
	onRenderDone: () => void;
};

export const UploadModelView: FC<UploadModelViewProps> = ({
	isRendering,
	onFrameDone,
	onRenderDone,
	color,
}) => {
	const [model, setModel] = useState<BufferGeometry>();

	const handleModelUpload = () => {
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

	return (
		<UploadModelViewContainer $isRendering={isRendering}>
			{!model ? (
				<UploadModelButton onClick={handleModelUpload}>
					Click here to upload model
				</UploadModelButton>
			) : (
				<ModelView
					model={model}
					color={color}
					onFrameDone={onFrameDone}
					isRendering={isRendering}
					onRenderDone={onRenderDone}
				/>
			)}
		</UploadModelViewContainer>
	);
};
