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
import { BufferGeometry, Mesh } from "three";
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
  background-color: grey;
  position: absolute;
  bottom: 0;
  right: 0;
  height: 20rem;
  width: 20rem;
`;

const CameraController = () => {
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
  }, [controls]);

  const handleCameraRotate = useCallback(() => {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 50;

    const rotate = () => {
      if (
        controls.getAzimuthalAngle()?.toFixed(1) ===
          originalCameraAngle?.toFixed(1) &&
        frames > 10
      ) {
        document.dispatchEvent(
          new CustomEvent("onviewermessage", {
            detail: {
              message: "viewer/done",
            },
          })
        );
      } else {
        controls.update();
        setFrames((frames) => frames + 1);
      }
    };

    rotate();
  }, [controls, originalCameraAngle, frames]);

  useEffect(() => {
    const handleViewerMessage = (message) => {
      if (message.detail.message === "viewer/rotate") {
        handleCameraRotate();
      }
    };

    document.addEventListener("onviewermessage", handleViewerMessage);

    return () => {
      document.removeEventListener("onviewermessage", handleViewerMessage);
      controls.dispose();
    };
  }, [controls, handleCameraRotate]);

  return null;
};

type SceneProps = {
  model: BufferGeometry;
};

const Scene: FC<SceneProps> = ({ model }) => {
  const mesh = useRef<Mesh>();

  return (
    <Bounds fit clip damping={6} margin={1.2}>
      <Center>
        <ambientLight intensity={0.2} />
        <directionalLight />
        <mesh geometry={model} ref={mesh}>
          <meshStandardMaterial />
        </mesh>
      </Center>
    </Bounds>
  );
};

type ModelViewProps = {
  model: BufferGeometry;
};

const ModelView: FC<ModelViewProps> = ({ model }) => (
  <Canvas
    camera={{
      fov: 75,
      position: [5, 5, 5],
    }}
  >
    <Suspense fallback={null}>
      <Scene model={model} />
      <CameraController />
    </Suspense>
  </Canvas>
);

const StudioPage = () => {
  const [model, setModel] = useState<BufferGeometry>();
  const inputRef = useRef<HTMLInputElement>();
  const [rotateInProgress, setRotateInProgress] = useState(false);

  useEffect(() => {
    if (rotateInProgress) {
      setTimeout(() => {
        setRotateInProgress(false);
      }, 250);
    }
  }, [rotateInProgress]);

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

  const [renderDone, setRenderDone] = useState(false);

  useEffect(() => {
    const handleViewerMessage = (message) => {
      if (message.detail.message === "viewer/done") {
        setRenderDone(() => true);
      }
    };

    document.addEventListener("onviewermessage", handleViewerMessage);

    return () => {
      document.removeEventListener("onviewermessage", handleViewerMessage);
    };
  }, []);

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
      {!rotateInProgress && (
        <StudioControls>
          {renderDone && (
            <button onClick={() => setRenderDone(false)} id="button-done">
              DONE - RESET RENDER
            </button>
          )}
          <button
            onClick={() =>
              document.dispatchEvent(
                new CustomEvent("onviewermessage", {
                  detail: {
                    message: "viewer/reset",
                  },
                })
              )
            }
          >
            Reset rotation
          </button>
          <button
            id="button-rotate"
            onClick={() => {
              setRotateInProgress(true);
              document.dispatchEvent(
                new CustomEvent("onviewermessage", {
                  detail: {
                    message: "viewer/rotate",
                  },
                })
              );
            }}
          >
            Rotate +1
          </button>
        </StudioControls>
      )}
    </StudioContainer>
  );
};

export default StudioPage;
