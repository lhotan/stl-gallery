import { createContext, FC, useContext, useEffect, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

type ContextType = {
  cameraOriginalAngle: number;
  cameraControls: OrbitControls;
  setCameraOriginalAngle: (angle: number) => void;
  setCameraControls: (controls: OrbitControls) => void;
};

const StudioPageContext = createContext<ContextType>({
  cameraOriginalAngle: undefined,
  setCameraOriginalAngle: undefined,
  cameraControls: undefined,
  setCameraControls: undefined,
});

const StudioPageContextProvider: FC<{ children: any }> = ({ children }) => {
  const [cameraOriginalAngle, setCameraOriginalAngle] = useState(0);
  const [cameraControls, setCameraControls] = useState<OrbitControls>();

  console.log(cameraControls);
  return (
    <StudioPageContext.Provider
      value={{
        cameraOriginalAngle,
        setCameraOriginalAngle,
        cameraControls,
        setCameraControls,
      }}
    >
      {children}
    </StudioPageContext.Provider>
  );
};

const useStudioPageContext = () => useContext(StudioPageContext);

export { StudioPageContextProvider, useStudioPageContext };
