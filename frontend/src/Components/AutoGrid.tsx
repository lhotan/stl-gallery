import { debounce, reverse, times, uniqueId } from "lodash";
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
//@ts-ignore
import thumb from "./thumb.mp4";

const data = times(40, (i) => ({
  id: uniqueId(),
  title: `Fancy model ${i}`,
  thumbnail: thumb,
}));

const StyledList = styled.ul`
  list-style-type: none;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(16rem, 1fr));
  padding-right: 2rem;

  min-height: 60rem;

  gap: 0.5rem;
  padding: 1rem 1rem;
  align-items: center;
`;

const AutoGrid = () => {
  const gridRef = useRef<HTMLUListElement | undefined>();
  const [gridItemCount, setGridItemCount] = useState(0);
  const [openedDesignId, setOpenedDesignId] = useState<string>();

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (gridRef.current) {
      const gridResizeObserver = new ResizeObserver(() => {
        setIsResizing(true);
        handleGridResize(gridRef.current as HTMLUListElement);
      });

      const root = document.querySelector("#root");

      if (root) {
        gridResizeObserver.observe(root);
      }

      return () => {
        gridResizeObserver.disconnect();
      };
    }
  }, [gridRef.current]);

  const handleGridResize = debounce((grid: HTMLUListElement) => {
    const gridComputedStyle = window.getComputedStyle(grid);

    const gridRowCount = gridComputedStyle
      .getPropertyValue("grid-template-rows")
      .split(" ").length;
    const gridColumnCount = gridComputedStyle
      .getPropertyValue("grid-template-columns")
      .split(" ").length;

    // subtract 3 items to make big tile fit
    const gridItemCount = gridRowCount * gridColumnCount - 3;
    setGridItemCount(gridItemCount);
    setIsResizing(false);
  }, 250);

  const handleItemClick = (identifier: string) => () => {
    if (identifier === openedDesignId) {
      setOpenedDesignId(undefined);
    } else {
      setOpenedDesignId(identifier);
    }
  };

  return (
    <StyledList ref={gridRef}>
      {!isResizing &&
        times(gridItemCount, (i) => {
          const item = data?.[i];

          if (!item) {
            return <div />;
          }

          const { id, thumbnail, title } = item;

          return (
            <AutoGridItem
              key={i}
              onClick={handleItemClick(id)}
              isOpen={openedDesignId === id}
              title={title}
              thumbnail={thumbnail}
            />
          );
        })}
    </StyledList>
  );
};

const ContentTitle = styled.p`
  position: absolute;
  bottom: 0;
  right: 1rem;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  text-shadow: 1px 1px 10px grey;
`;

const StyledListItem = styled.li<{ $isOpen: boolean }>`
  background-color: orange;
  height: 100%;

  &:first-of-type {
    background-color: green;
    grid-column: 1 / 3;
    grid-row: 1 / 3;

    & ${ContentTitle} {
      font-size: 2rem;
    }
  }

  transition: all 200ms linear;

  display: grid;
  position: relative;

  ${({ $isOpen }) =>
    $isOpen
      ? css`
          filter: grayscale(75%) opacity(80%);
        `
      : css`
          &:hover {
            cursor: pointer;
            transform: scale(1.04);
            background-color: red;
            z-index: 2;
          }
        `}
`;

const ContentBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;

  display: grid;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
  }
`;

const GridContent = styled.div`
  opacity: 0;
  width: 90vw;
  height: 90vh;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 0 8px grey;
`;

const GridThumbnail = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

type AutoGridItemProps = {
  onClick: () => void;
  title: string;
  thumbnail: string;
  isOpen: boolean;
};

const AutoGridItem: FC<AutoGridItemProps> = ({
  title,
  thumbnail,
  onClick,
  isOpen,
}) => {
  const itemRef = useRef<HTMLLIElement>();
  const backgroundRef = useRef<HTMLDivElement>();
  const contentRef = useRef<HTMLDivElement>();
  const thumbnailRef = useRef<HTMLVideoElement>();

  const [openAnimationDone, setOpenAnimationDone] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const [itemCoordinates, setItemCoordinates] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [itemDimensions, setItemDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  useEffect(() => {
    if (isHover) {
      thumbnailRef.current.play();
    } else {
      thumbnailRef.current.pause();
    }
  }, [isHover]);

  useEffect(() => {
    if (itemRef.current) {
      const { x, y, width, height } = itemRef.current.getBoundingClientRect();
      setItemCoordinates({ x, y });
      setItemDimensions({ width, height });
    }
  }, [itemRef.current]);

  const contentKeyframes = [
    {
      opacity: 0,
    },
    {
      opacity: 1,
    },
  ];

  const keyframes = useMemo(() => {
    const { x, y } = itemCoordinates;
    const { width, height } = itemDimensions;
    return [
      {
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "white",
      },
      {
        transform: "translate(0,0)",
      },
      {
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(5px)",
      },
    ];
  }, [itemCoordinates]);

  useEffect(() => {
    if (isOpen && backgroundRef.current && !openAnimationDone) {
      setOpenAnimationDone(false);

      backgroundRef.current
        .animate(keyframes, {
          fill: "forwards",
          delay: 100,
          duration: 400,
        })
        .addEventListener("finish", () => {
          contentRef.current
            .animate(contentKeyframes, {
              fill: "forwards",
              duration: 400,
            })
            .addEventListener("finish", () => {
              setOpenAnimationDone(true);
            });
        });
    }
  }, [isOpen, backgroundRef.current]);

  const handleContentClose = () => {
    contentRef.current
      .animate(contentKeyframes, {
        direction: "reverse",
        fill: "forwards",
        delay: 100,
        duration: 400,
      })
      .addEventListener("finish", () => {
        backgroundRef.current
          .animate(keyframes, {
            fill: "forwards",
            direction: "reverse",
            duration: 400,
          })
          .addEventListener("finish", () => {
            onClick();
          });
      });
  };

  return (
    <>
      {isOpen && (
        <ContentBackground ref={backgroundRef} onClick={handleContentClose}>
          <GridContent ref={contentRef}>"foo bar baz"</GridContent>
        </ContentBackground>
      )}
      <StyledListItem
        ref={itemRef}
        onClick={onClick}
        $isOpen={isOpen}
        onPointerEnter={() => setIsHover(true)}
        onPointerLeave={() => setIsHover(false)}
      >
        <ContentTitle>{title}</ContentTitle>
        <GridThumbnail ref={thumbnailRef} loop disablePictureInPicture>
          <source src={thumbnail} type="video/mp4" />
        </GridThumbnail>
      </StyledListItem>
    </>
  );
};

export default AutoGrid;
