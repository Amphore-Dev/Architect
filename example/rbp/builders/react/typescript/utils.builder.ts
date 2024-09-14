interface IUtilBuilder {
	name: string;
}

function UtilBuilder(args: IUtilBuilder) {
	console.log("CUSTOM REACT TYPESCRIPT UTILS BUILDER ", args);

	return ["CUSTOM REACT TYPESCRIPT UTILS BUILDER"];
}

export default UtilBuilder;
