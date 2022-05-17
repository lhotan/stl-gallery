import { useEffect } from "react";

type StudioPageMessageOptions = {
	iframe?: HTMLIFrameElement;
};

const useIframeMessage = (
	identifier: string,
	onMessage: (event: CustomEvent) => void,
	options?: StudioPageMessageOptions
): [sendMessage: () => void] => {
	useEffect(() => {
		window.document.addEventListener(identifier, handleMessageReceive, false);
	}, []);

	const handleMessageReceive = (event: CustomEvent) => {
		onMessage(event);
	};

	const handleMessageSend = () => {
		if (options?.iframe) {
			var event = new CustomEvent(identifier, { detail: "howdy" });
			options.iframe.contentDocument.dispatchEvent(event);
		} else {
			const event = new CustomEvent(identifier, { detail: "data" });
			window.parent.document.dispatchEvent(event);
		}
	};

	return [handleMessageSend];
};

export default useIframeMessage;
