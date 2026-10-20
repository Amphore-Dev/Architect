import { useState } from "react";

// Custom blueprint: example/architect/blueprints/react/typescript/hooks.bp.ts
export const __NAME__ = () => {
	const [value, setValue] = useState();

	return { value, setValue };
};
