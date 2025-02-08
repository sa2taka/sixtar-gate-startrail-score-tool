import puppeteer from "puppeteer";
import { setTimeout } from "node:timers/promises";
import { readFile, writeFile } from "node:fs/promises";
let musicInformation: { songs: MusicInformation[] };
try {
	musicInformation = JSON.parse(await readFile("musicInformation.json", "utf-8"));
} catch {
	musicInformation = { songs: [] };
}

type DifficultInformation = {
	level: number;
	notes: number;
	combo: number;
};

type ModeInformation = {
	comet?: DifficultInformation;
	nova?: DifficultInformation;
	supernova?: DifficultInformation;
	quasar?: DifficultInformation;
	starlight?: DifficultInformation;
};

type MusicInformation = {
	link: string;
	id: string;
	name: string;
	englishName?: string;
	bpm: number;
	musicLength: number;
	lunar: ModeInformation;
	solar: ModeInformation;
};

const browser = await puppeteer.launch({ headless: true });

const listUpMusicLink = async (): Promise<string[]> => {
	const page = await browser.newPage();

	await page.goto("https://wikiwiki.jp/sixtargate/SongList");

	const musicListTable = (await page.$$("table"))[0];

	const musicInfoAnchors = await musicListTable.$$("tbody tr td:nth-child(3) a");

	return Promise.all(
		musicInfoAnchors.map(async (anchor) => {
			const prop = await anchor.getProperty("href");
			return prop.jsonValue();
		}),
	);
};

const getDifficultInformation = async (
	rows: [
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
	],
): Promise<ModeInformation | null> => {
	const levelRow = rows[0];
	const notesRow = rows[1];
	const comboRow = rows[2];

	let cometLevel = null;
	let cometNotes = null;
	let cometCombo = null;
	try {
		cometLevel = await levelRow.$eval("td:nth-child(3)", (el) => el.textContent);
		cometNotes = await notesRow.$eval("td:nth-child(2)", (el) => el.textContent);
		cometCombo = await comboRow.$eval("td:nth-child(2)", (el) => el.textContent);
	} catch (e) {
		// do nothing
	}

	// novaの処理x
	let novaLevel = null;
	let novaNotes = null;
	let novaCombo = null;
	try {
		novaLevel = await levelRow.$eval("td:nth-child(4)", (el) => el.textContent);
		novaNotes = await notesRow.$eval("td:nth-child(4)", (el) => el.textContent);
		novaCombo = await comboRow.$eval("td:nth-child(4)", (el) => el.textContent);
	} catch (e) {
		// do nothing
	}

	let supernovaLevel = null;
	let supernovaNotes = null;
	let supernovaCombo = null;
	try {
		supernovaLevel = await levelRow.$eval("td:nth-child(5)", (el) => el.textContent);
		supernovaNotes = await notesRow.$eval("td:nth-child(6)", (el) => el.textContent);
		supernovaCombo = await comboRow.$eval("td:nth-child(6)", (el) => el.textContent);
	} catch (e) {
		// do nothing
	}

	// quasarの処理x
	let quasarLevel = null;
	let quasarNotes = null;
	let quasarCombo = null;
	try {
		quasarLevel = await levelRow.$eval("td:nth-child(6)", (el) => el.textContent);
		quasarNotes = await notesRow.$eval("td:nth-child(8)", (el) => el.textContent);
		quasarCombo = await comboRow.$eval("td:nth-child(8)", (el) => el.textContent);
	} catch (e) {
		// do nothing
	}

	let starlightLevel = null;
	let starlightNotes = null;
	let starlightCombo = null;
	try {
		starlightLevel = await levelRow.$eval("td:nth-child(7)", (el) => el.textContent);
		starlightNotes = await notesRow.$eval("td:nth-child(10)", (el) => el.textContent);
		starlightCombo = await comboRow.$eval("td:nth-child(10)", (el) => el.textContent);
	} catch (e) {
		// do nothing
	}

	const createDifficultInformation = (
		level: string | null,
		notes: string | null,
		combo: string | null,
	): DifficultInformation | undefined => {
		return level && !Number.isNaN(Number(level))
			? { level: Number(level), notes: Number(notes), combo: Number(combo) }
			: undefined;
	};

	return {
		comet: createDifficultInformation(cometLevel, cometNotes, cometCombo),
		nova: createDifficultInformation(novaLevel, novaNotes, novaCombo),
		supernova: createDifficultInformation(supernovaLevel, supernovaNotes, supernovaCombo),
		quasar: createDifficultInformation(quasarLevel, quasarNotes, quasarCombo),
		starlight: createDifficultInformation(starlightLevel, starlightNotes, starlightCombo),
	};
};

const getMusicInformation = async (link: string): Promise<MusicInformation | null> => {
	console.log(link);

	const id = link.split("/").pop() as string;

	const page = await browser.newPage();

	await page.goto(link);

	let title: string | null;
	try {
		title = await page.$eval("h1.title", (el) => el.textContent);
	} catch (e) {
		title = await page.$eval("h2 span", (el) => el.textContent);
	}

	if (!title) {
		console.log(`${link}: title not found`);
		return null;
	}

	const [name, englishName] = title.split("|").map((s) => s.trim());

	const tables = await page.$$("table");

	let difficultInformation: puppeteer.ElementHandle<HTMLTableElement> | null = null;

	for (const table of tables) {
		try {
			const cometContent = await table.$eval("tbody tr:nth-child(1) th:nth-child(2)", (el) => el.textContent);
			const lunarContent = await table.$eval("tbody tr:nth-child(2) th:nth-child(1)", (el) => el.textContent);
			if (cometContent === "Comet" && lunarContent === "LUNAR") {
				difficultInformation = table;
			}
		} catch (e) {
			// do nothing
		}
	}

	if (!difficultInformation) {
		console.log(`${title}: difficult information table not found`);
		return null;
	}

	const bpmStr = await page.$eval(
		"::-p-xpath(//table//th[contains(text(), 'bpm')]/following-sibling::td[1])",
		(el) => el.textContent,
	);

	if (!bpmStr) {
		console.log(`${title}: bpm not found`);
		return null;
	}

	const bpm = Number(bpmStr);

	const lengthStr = await page.$eval(
		"::-p-xpath(//table//th[contains(text(), 'Length')]/following-sibling::td[1])",
		(el) => el.textContent,
	);

	if (!lengthStr) {
		console.log(`${title}: length not found`);
		return null;
	}

	const [minuteStr, secondStr] = lengthStr.split(":");
	const musicLength = Number(minuteStr) * 60 + Number(secondStr);

	const lunarTr = (
		await Promise.all([
			difficultInformation.$("tbody tr:nth-child(2)"),
			difficultInformation.$("tbody tr:nth-child(3)"),
			difficultInformation.$("tbody tr:nth-child(4)"),
		])
	).filter((tr) => !!tr) as [
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
	];

	const solarTr: [
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
	] = (
		await Promise.all([
			difficultInformation.$("tbody tr:nth-child(6)"),
			difficultInformation.$("tbody tr:nth-child(7)"),
			difficultInformation.$("tbody tr:nth-child(8)"),
		])
	).filter((tr) => !!tr) as [
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
		puppeteer.ElementHandle<HTMLTableRowElement>,
	];

	const lunar = await getDifficultInformation(lunarTr);
	const solar = await getDifficultInformation(solarTr);

	if (!lunar || Object.values(lunar).every((v) => !v) || !solar || Object.values(solar).every((v) => !v)) {
		console.log(`${title}: difficult information not found`);
		return null;
	}

	await page.close();

	return {
		link,
		id,
		name,
		englishName,
		bpm,
		musicLength,
		lunar,
		solar,
	};
};

const links = await listUpMusicLink();

function hasSong(link: string) {
	return musicInformation.songs?.some((song) => song.link === link);
}

async function processLinksInParallel(links: string[]): Promise<MusicInformation[]> {
	const result = [];

	for (const link of links) {
		if (hasSong(link)) {
			continue;
		}
		try {
			const musicInformation = await getMusicInformation(link);
			if (musicInformation) {
				result.push(musicInformation);
			}

			await setTimeout(2000);
		} catch (e) {
			console.error(e);
			return result;
		}
	}

	return result;
}

const result = await processLinksInParallel(links);

await writeFile(
	"musicInformation.json",
	`{\n  "songs": [\n${[...(musicInformation?.songs ?? []), ...result]
		.map((song) => `    ${JSON.stringify(song)}`)
		.join(",\n")}\n  ]\n}`
);

await browser.close();
