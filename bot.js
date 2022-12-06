const CONFIG = require("./.config.json");
const testData = require("./testData.json");
const {App} = require("@slack/bolt");

'use strict'

let testLevel = 'greeting';

let isTesting = false;

const btn = {
    blocks: [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "Press Button",
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Start Test",
                },
                action_id: "button_click",
            },
        },
    ],
};

let result = {
    attachments: [
        {
            "mrkdwn_in": ["text"],
            "color": "36a64f",
            "pretext": "Test Result",
            fields: [
                {
                    "title": "성공",
                    "value": "",
                    "short": "false"
                }
            ]
        },
        {
            "mrkdwn_in": ["text"],
            "color": "bf1f2f",
            fields: [
                {
                    "title": "실패",
                    "value": "",
                    "short": false
                }
            ]
        }
    ]
}

function check(expression, testMsg) {
    (expression) ?
        result.attachments[0].fields[0].value += `${testMsg}\n`
        : result.attachments[1].fields[0].value += `${testMsg}\n`;
}

function sleep(time) {
    return new Promise((res) => setTimeout(res, time));
}

const app = new App({
    token: CONFIG.TEST_TOKEN,
    signingSecret: CONFIG.TEST_SIGNING_SECRET,
    socketMode: true,
    appToken: CONFIG.TEST_XAPP,
});

app.message(async ({ event}) => {
    const {user, text} = event;

    console.assert(user === CONFIG.MAIN_ID, 'only receive main bot\'s message');

    switch (testLevel) {
        case 'greeting':
            check(testData.greeting_a.toString().includes(text), 'Greeting');
            testLevel = 'schedule';
            break;
        case 'schedule':
            check(text === '| 안내 받을 날짜를 입력해주세요 \n' +
                '| 형식 : 월/일 (12/13)', '');
            testLevel = 'schedule_invalid'
            break;
        case 'schedule_invalid':
            check(text === "올바른 날짜를 입력하세요", 'Schedule (Invalid)');
            testLevel = 'schedule_valid';
            break;
        case 'schedule_valid':
            check(text === "12/21 : 종강\n", 'Schedule(Valid)');
            testLevel = 'menu_today';
            break;
        // case 'schedule_empty':
        //     //check(text === "해당 날짜에는 행사가 없습니다!", 'Schedule (Empty)');
        //     testLevel = 'schedule_invalid';
        //     break;
        case 'menu_today':
            //check(text === , 'Menu (today)');
            testLevel = "menu_week";
            break;
        case 'menu_week':
            //check(text.toLowerCase() === 'hi', 'Menu (week)');
            testLevel = "dept";
            break;
        case "dept":
            check(text === `| 학과 이름을 입력해주세요 \n| (⨂ 영문입력 바람)`, '');
            testLevel = "dept_invalid";
            break;
        case 'dept_invalid':
            check(text === "학과 이름을 올바르게 입력해주세요.", 'Department (Invalid)');
            testLevel = 'dept_valid';
            break;
        case 'dept_valid':
            check(text === "College of Engineering Building 7, 224", 'Department (Valid)');
            testLevel = 'greeting';
            break;
    }
});


app.command("/test", async ({ack, say}) => {
    await ack();
    await say(btn);
});

app.action("button_click", async ({ ack, say}) => {

    if (isTesting)
        return;

    await ack();

    isTesting = true;

    await show(say, "hi");
    await show(say, "학사일정");
    await show(say, "13/-1");
    await show(say, "12/21");
    await show(say, "오늘 밥 뭐야");
    await show(say, "이번 주 식단");
    await show(say, "학과 사무실 안내");
    await show(say, "MBA Course Please");
    await show(say, "Computer Science and Engineering");


    await say(result);

    result.attachments[0].fields[0].value = '';

    isTesting = false;
});

(async () => {
    await app.start();
    console.log("⚡️ Bolt app is running!");
})();

async function show(callback, msg) {
    await callback(msg);
    await sleep(1500);
}
