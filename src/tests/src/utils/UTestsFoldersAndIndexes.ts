type TTestFile = {
	path: string; // Path to the file
	contain?: string; // Content that the file should contain
};

type TTest = {
	type: string; // Type of the file to generate
	files: TTestFile[]; // Files that should be generated
};

export const getTestTypes = (outdir: string): TTest[] => [
	{
		type: "notAnObject",
		files: [
			{
				path: `${outdir}/components/notAnObject/Le_Fichier.tsx`,
				contain: "Le_Fichier",
			},
		],
	},
	{
		type: "none",
		files: [
			{
				path: `${outdir}/components/none/Le_Fichier.tsx`,
				contain: "Le_Fichier",
			},
		],
	},
	{
		type: "genFolder",
		files: [
			{
				path: `${outdir}/components/genFolder/Le_Fichier.tsx`,
				contain: "Le_Fichier",
			},
		],
	},
	{
		type: "genIndexOnly",
		files: [
			{
				path: `${outdir}/components/genIndexOnly/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/genIndexOnly/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
		],
	},
	{
		type: "folderAndIndex",
		files: [
			{
				path: `${outdir}/components/folderAndIndex/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/folderAndIndex/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
		],
	},
	{
		type: "subDir",
		files: [
			{
				path: `${outdir}/components/subDir/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
		],
	},
	{
		type: "subIndexOnly",
		files: [
			{
				path: `${outdir}/components/subIndexOnly/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/subIndexOnly/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
		],
	},
	{
		type: "subDirAndSubIndex",
		files: [
			{
				path: `${outdir}/components/subDirAndSubIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/subDirAndSubIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
		],
	},
	{
		type: "folderAndSubDir",
		files: [
			{
				path: `${outdir}/components/folderAndSubDir/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
		],
	},
	{
		type: "folderAndSubIndex",
		files: [
			{
				path: `${outdir}/components/folderAndSubIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/folderAndSubIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
		],
	},
	{
		type: "folderAndSubDirAndSubIndex",
		files: [
			{
				path: `${outdir}/components/folderAndSubDirAndSubIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/folderAndSubDirAndSubIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
		],
	},
	{
		type: "indexAndSubDir",
		files: [
			{
				path: `${outdir}/components/indexAndSubDir/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/indexAndSubDir/index.ts`,
				contain: 'export * from "./Ile-fichier/IleFichier";',
			},
		],
	},
	{
		type: "indexAndSubIndex",
		files: [
			{
				path: `${outdir}/components/indexAndSubIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/indexAndSubIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
			{
				path: `${outdir}/components/indexAndSubIndex/index.ts`,
				contain: 'export * from "./Ile-fichier";',
			},
		],
	},
	{
		type: "indexAndSubDirAndSubIndex",
		files: [
			{
				path: `${outdir}/components/indexAndSubDirAndSubIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/indexAndSubDirAndSubIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
			{
				path: `${outdir}/components/indexAndSubDirAndSubIndex/index.ts`,
				contain: 'export * from "./Ile-fichier";',
			},
		],
	},
	{
		type: "folderAndIndexAndSubDirAndSubIndex",
		files: [
			{
				path: `${outdir}/components/folderAndIndexAndSubDirAndSubIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/folderAndIndexAndSubDirAndSubIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
			{
				path: `${outdir}/components/folderAndIndexAndSubDirAndSubIndex/index.ts`,
				contain: 'export * from "./Ile-fichier";',
			},
		],
	},
	{
		type: "nested",
		files: [
			{
				path: `${outdir}/components/nested/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/nested/index.ts`,
				contain: 'export * from "./Ile-fichier";',
			},
		],
	},
	{
		type: "nested2",
		files: [
			{
				path: `${outdir}/components/nested/nested2/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/nested/nested2/index.ts`,
				contain: 'export * from "./Ile-fichier";',
			},
		],
	},
	{
		type: "nested3",
		files: [
			{
				path: `${outdir}/components/nested/nested2/nested3/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/nested/nested2/index.ts`,
				contain: 'export * from "./nested3/IleFichier";',
			},
		],
	},
	{
		type: "ultraNested",
		files: [
			{
				path: `${outdir}/components/nested/nested2/nested3/ultraNested/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/nested/nested2/nested3`, // only the folder should be generated
			},
			{
				path: `${outdir}/components/nested/nested2/index.ts`,
				contain: 'export * from "./nested3/ultraNested/IleFichier";',
			},
			{
				path: `${outdir}/components/nested/index.ts`,
				contain: 'export * from "./nested2";',
			},
		],
	},
	{
		type: "ultraNestedWithIndex",
		files: [
			{
				path: `${outdir}/components/nested/nested2/nested3/ultraNestedWithIndex/Ile-fichier/IleFichier.tsx`,
				contain: "ILEFICHIER",
			},
			{
				path: `${outdir}/components/nested/nested2/nested3/ultraNestedWithIndex/Ile-fichier/index.ts`,
				contain: 'export * from "./IleFichier";',
			},
			{
				path: `${outdir}/components/nested/nested2/nested3/ultraNestedWithIndex/index.ts`,
				contain: 'export * from "./Ile-fichier";',
			},
			{
				path: `${outdir}/components/nested/nested2/nested3`, // only the folder should be generated
			},
			{
				path: `${outdir}/components/nested/nested2/index.ts`,
				contain: 'export * from "./nested3/ultraNestedWithIndex";',
			},
			{
				path: `${outdir}/components/nested/index.ts`,
				contain: 'export * from "./nested2";',
			},
		],
	},
];
