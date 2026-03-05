const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");

async function main() {
    await fs.ensureDir("results");

    // DU Bulletin
    const bulletinURL = "https://bulletin.du.edu/undergraduate/coursedescriptions/comp/";
    const bulletinPage = await axios.get(bulletinURL);
    const $ = cheerio.load(bulletinPage.data);
    const courses = [];

    $(".courseblock").each((i, el) => {
        const titleText = $(el).find(".courseblocktitle").text().trim();
        const desc = $(el).find(".courseblockdesc").text().toLowerCase();
        const match = titleText.match(/COMP\s(\d{4})\.\s(.+)/);
        if (!match) return;
        const number = parseInt(match[1]);
        const title = match[2];
        if (number >= 3000 && !desc.includes("prerequisite")) {
            courses.push({
                course: `COMP-${number}`,
                title: title
            });
        }

    });
    await fs.writeJson("results/bulletin.json", { courses }, { spaces: 4 });
    console.log("bulletin.json created");

    // DU Athletics Events
    const athleticsURL = "https://denverpioneers.com/index.aspx";
    const athleticsPage = await axios.get(athleticsURL);
    const $a = cheerio.load(athleticsPage.data);
    const athleticEvents = [];

    $a(".sidearm-schedule-game").each((i, el) => {
        const opponent = $a(el).find(".sidearm-schedule-game-opponent-name").text().trim();
        const date = $a(el).find(".sidearm-schedule-game-datetime").text().trim();
        if (opponent && date) {
            athleticEvents.push({
                duTeam: "Denver Pioneers",
                opponent: opponent,
                date: date
            });
        }

    });
    await fs.writeJson(
        "results/athletic_events.json",
        { events: athleticEvents },
        { spaces: 4 }
    );
    console.log("athletic_events.json created");

    // DU Calendar Events
    const calendarURL = "https://www.du.edu/calendar?search=&start_date=2025-01-01&end_date=2025-02-01#events-listing-date-filter-anchor";
    const calendarPage = await axios.get(calendarURL);
    const $c = cheerio.load(calendarPage.data);
    const calendarEvents = [];

    $c(".event_item").each((i, el) => {
        const title = $c(el).find(".summary").text().trim();
        const date = $c(el).find(".date").text().trim();
        const time = $c(el).find(".time").text().trim();
        if (date.includes("2025")) {
            calendarEvents.push({
                title: title,
                date: date,
                time: time || "" 
            });
        }

    });
    await fs.writeJson(
        "results/calendar_events.json",
        { events: calendarEvents },
        { spaces: 4 }
    );
    console.log("calendar_events.json created");
}

main();