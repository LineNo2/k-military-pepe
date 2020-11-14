const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const { exit } = require('process');
const { prefix, token } = require('./botConfig.json');
const { parser } = require('./chatParser.js').parser;
let webhooklist = [];

let configuration;
let parsedText;

let minTime;
let maxTime;
let sendingTimer;
let webhookSendingTimer = [];
let webhookSendingTimerIndex = 0;
let sendingIntervalTime // 메시지 간 보내는 기본 간격 단위 : 초
let sendingRandomDelay// 보내는 기본 간격 sending Interval Time + 랜덤 딜레이 맥스 sendingRandomDelay
let userDict;
let currentBlock = [];
let sendingMode// 0 -> loose | 1 -> strict
let workingMode// 0 -> not on duty | 1 -> on duty
let blockDelayMode// 

try {
    configuration = fs.readFileSync('./configuration.json', { 'encoding': 'utf8' });
    configuration = JSON.parse(configuration);
    userState = configuration['userState'];
    userDict = configuration['userCode'];
    minTime = configuration['botSetting']['minTime'];
    maxTime = configuration['botSetting']['maxTime'];
    sendingRandomDelay = configuration['botSetting']['sendingRandomDelay'];
    sendingIntervalTime = configuration['botSetting']['sendingIntervalTime'];
    sendingMode = configuration['botSetting']['sendingMode'];
    workingMode = configuration['botSetting']['workingMode'];
    blockDelayMode = configuration['botSetting']['blockDelayMode'];
    token1 = configuration['webHook']['token1'];
    token2 = configuration['webHook']['token2'];
    for (username in token1) {
        webhooklist[username] = new Discord.WebhookClient(token1[username], token2[username]);
    }
}
catch (error) {
    console.log("Critical ERROR : Configuration File Has ERROR OR Not Found.")
    console.log(error);
    exit(-1);
}

parsedText = fs.readFileSync('parsedText.json', { encoding: 'utf8' });
parsedText = JSON.parse(parsedText);

function updateCurrentTime() {//현재 시간 구하기 -> mode 바뀌면 타이머 리셋하고 currentBlock 다시 만들어서 다시 타이머 시작.
    currentTime = new Date();
    timeZone = currentTime.getTimezoneOffset();
    console.log(currentTime);
    currentTime.setHours(currentTime.getHours() + (timeZone + 540) / 60);
}

setInterval(//1분마다 자동 갱신
    function () {
        if (workingMode != getCurrentMode()) {
            console.log('=====블록 업데이트=====');
            resetCurrentBlock();
            updateCurrentBlock();
        }
    }, 60000);

function getCurrentMode() { // 0 -> not on duty | 1 -> on duty
    updateCurrentTime();
    if (18 <= currentTime.getHours() && currentTime.getHours() <= 22) {
        return 0;
    }
    else if (currentTime.getDay() == 6 || currentTime.getDay() == 0) {
        return 0;
    }
    return 1;
}

function getRandomTime(minTime, maxTime) { // 블럭 간 보내는 랜덤 간격 리턴,
    minTime = setMinimumInterval(blockDelayMode);
    let time = (Math.random() * (maxTime - minTime) + minTime) * 1000;
    console.log(parseInt(time / 1000 / 60) + '분');
    return time / 10;
}

function getRandomDelay(length) { // 메시지 간 보내는 기본 간격 단위에 더할 랜덤 딜레이 추가.
    return length > sendingRandomDelay ? (Math.random() * sendingRandomDelay) : length;
}

function updateCurrentBlock() {
    workingMode = getCurrentMode();
    console.log("workingMode :" + workingMode);
    console.log("sendingtMode :" + sendingMode);

    if (sendingMode == 1) {
        for (elem in parsedText) {
            let tempInfo = parsedText[elem]['userInfo'];
            let validChecker = 0;
            for (userIndex in tempInfo) {
                if (workingMode == 0) {//쉬는중인데
                    if (userState[userIndex] != 2) {//훈련병이 아니라면
                        validChecker = 1;//not valid
                        break;
                    }
                } else {//일하는중인데
                    if (userState[userIndex] == 0) {//민간인이라면
                        validChecker = 1;//not valid
                        break;
                    }
                }
            }
            if (validChecker == 0) {
                currentBlock.push(parsedText[elem]);
            }
        }
    }
    else {
        for (elem in parsedText) {
            let tempInfo = parsedText[elem]['userInfo'];
            let validChecker = 0;
            for (userIndex in tempInfo) {
                if (workingMode == 0) {//쉬는중인데
                    if (userState[userIndex] == 2) {//훈련병이 있으면
                        validChecker = 1;//valid
                        break;
                    }
                } else {//일하는중인데
                    if (userState[userIndex] != 0) {//병이나 훈련병이 있으면
                        validChecker = 1;//valid
                        break;
                    }
                }
            }
            if (validChecker) {
                currentBlock.push(parsedText[elem]);
            }
        }
    }
    minTime = setMinimumInterval(blockDelayMode);
    console.log('현재 블록 길이: ' + currentBlock.length);
}

function resetCurrentBlock() {
    currentBlock = [];
}

function sendRandomMessage() {
    webhookSendingTimerIndex = 0;
    if (currentBlock.length === 0) {
        webhooklist['undefined'].send('현재 시간에 출력할 수 있는 메시지가 없습니다.');
    }
    else {
        let randomNumber = parseInt(Math.random() * currentBlock.length);
        block = currentBlock[randomNumber]['text'];
        for (var i = 0; i < block.length; i++) {
            let element = block[i];
            let randomDelay = parseInt(getRandomDelay(element[2].length));
            console.log("waiting " + (randomDelay + i * sendingIntervalTime) + "s");
            webhookSendingTimer[webhookSendingTimerIndex++] = setTimeout(function () {
                webhooklist[element[0]].send(element[2]);
                console.log('printed "' + element[2] + '"');
            }, ((randomDelay + i * sendingIntervalTime) * 1000))
        }
    }
}

function sendingStart() {
    resetCurrentBlock();
    updateCurrentBlock();
    sendRandomMessage();
    sendingTimer = setInterval(function () {
        console.log('timer passed');
        sendRandomMessage();
    }, getRandomTime(minTime, maxTime));
}

function sendingStop() {
    clearInterval(sendingTimer);
    for (elem in webhookSendingTimer) {
        clearTimeout(webhookSendingTimer[elem]);
        webhookSendingTimer[elem] = null;
    }
}

function updateJSON() {
    let updatedJSON = { "userCode": [], "userState": [] };
    console.log(userDict);
    updatedJSON["userCode"] = userDict;
    updatedJSON["userState"] = userState;
    fs.writeFileSync('./configuration.json', JSON.stringify(updatedJSON), { 'encoding': 'utf8' });
}

function setMinimumInterval(mode) {
    if (mode == 1) { // strict 모드.
        let longestBlockLength = -1;
        for (elem in currentBlock) {
            let textblock = currentBlock[elem]['text'];
            let currentLength = textblock.length;
            if (longestBlockLength < currentLength) {
                longestBlockLength = currentLength;
            }
        }
        return parseInt(longestBlockLength * (sendingIntervalTime + sendingRandomDelay));
    }
    if (mode == 0) { // loose 모드
        let accumulatedLength = 0;
        for (elem in currentBlock) {
            let textblock = currentBlock[elem]['text'];
            accumulatedLength += textblock.length;
        }
        return parseInt((accumulatedLength / currentBlock.length) * 3 * (sendingIntervalTime + sendingRandomDelay));
    }
}

function returnUserCode(userNickName) {
    return userDict[userNickName] == undefined ? undefined : userDict[userNickName];
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command === '공익이') {
        message.reply('공익이 버스를 20번이나 혼자 타네');
    }
    else if (command === 'help' || command === '명령어') {
        if (args[0] != undefined) {
            switch (args[0]) {
                case 'help':
                    message.channel.send('예???');
                case '명령어':
                    message.channel.send('예???');
                case 'set':
                case '설정':
                    message.channel.send('!set|설정 help를 쳐보세요.');
                    break;
                case 'bot':
                    message.channel.send('!bot start -> 군인좀비가 활동을 시작합니다.\n!bot stop-> 군인좀비가 활동을 멈춥니다');
                    break;
                case 'state':
                    message.channel.send('!stauts 유저이름 -> 해당 유저의 신분을 확인합니다. 반드시 유저의 별명으로 해야합니다.띄어쓰기는 안해도 됩니다. EX) Real 썪 -> Real썪\n!state 유저이름 [훈련병or병] -> 해당 유저의 신분을 훈련병 또는 병으로 바꿉니다. 함부로하지 마세요.\n훈련병일시 24시간 내내 군인좀비가 작동하며, 병일시 일과시간에만 작동합니다.');
                    break;
                case 'interval':
                    message.channel.send('!interval -> 랜덤으로 메시지가 나오는 시간의 범위를 출력합니다\n!interval 최소시간 최대시간 -> 랜덤으로 메시지가 나오는 시간의 범위를 [최소시간,최대시간] 으로 정합니다.\n시간의 단위는 초입니다. 너무 큰 수로 하면 좀 섭섭해질 수도 있습니다.\n기본설정: [300,7200]');
                    break;
                case 'update':
                    message.channel.send('!update -> 현재 쓰고있는 데이터베이스를 업데이트 할 수 있는 링크를 제공합니다. 근데 아직 안만들어서 없음 ㅈㅅ.');
                    break;
                case '공익이':
                    message.channel.send('쳐보면 압니다');
                    break;
                case 'set':
                    message.channel.send('!set 한테 물어보세요.');
                    break;
                case 'time':
                    message.channel.send('!time 을 하면 현재 시간을 보여줍니다');
                    break;
                case 'mode':
                    message.channel.send('!mode sending|working|blockdelay 로 각각의 모드 상태를 조회해보세요.\nsending모드가 strict라면 엄격하게 채팅을 고르고, loose라면 덜 엄격하게 고릅니다.\nworking모드가 true라면 군인의 근무시간이라는 뜻이고, false라면 쉬는시간이라는 뜻입니다.\nblockDelay가 strict라면 매우 안전하게 채팅을 전송해 서로 겹치는 일이 일어나지 않습니다.loose라면 겹칠 수도 있지만, 그럴 확률은 극히 적으니 안심하셔도 됩니다.');
                default:
                    message.channel.send('존재하지 않는 명령입니다')
            }
            // case '':
            //     message.channel.send('');
        }
        else {
            message.channel.send(`!help 뒤에 궁금한 명령어를 작성하면 해당 명령어에 대한 자세한 설명을 제공합니다.\n명령어: 공익이|bot|state|interval|update|set|time|mpde`)
        }
    }
    else if (command === 'time') {
        updateCurrentTime();
        message.channel.send(("" + currentTime).split('GMT+0000 (Coordinated Universal Time)')[0]);
    }

    else if (command === 'bot') {
        if (args[0] == undefined) {
            message.channel.send('!bot start -> 군인좀비가 활동을 시작합니다.\n !bot stop -> 군인좀비가 활동을 멈춥니다\n단, 파싱된 파일이 없으면 작동을 하지 않습니다.');
        }
        else {
            if (args[0] == 'start') {
                message.channel.send('시작하겠습니다.');
                try {
                    sendingStart();
                }
                catch (error) {
                    message.channel.send("무언가가 잘못됐습니다..");
                    console.log(error);
                }
            }
            else if (args[0] === 'stop') {
                message.channel.send('끝내겠습니다.');
                sendingStop();
            }
            else {
                message.channel.send('!bot start -> 군인좀비가 활동을 시작합니다.\n!bot stop -> 군인좀비가 활동을 멈춥니다');
            }
        }
    }
    else if (command === 'state') {
        if (args[0] == undefined) {
            message.channel.send('!state *유저이름* -> 해당 유저의 신분을 확인합니다. 반드시 유저의 별명으로 해야합니다.\n!state *유저이름* [**민간인**|**훈련병**|**병**] -> 해당 유저의 신분을 민간인, 훈련병 또는 병으로 바꿉니다. 함부로하지 마세요.\n훈련병일시 24시간 내내 군인좀비가 작동하며, 병일시 일과시간에만 작동합니다.');
        }
        else {
            if (args[0] === "list" || args[0] === "*") {
                let tempMessage = '';
                for (elem in userState) {
                    tempMessage += `${elem} : ${userState[elem] == 0 ? '민간인' : userState[elem] == 1 ? '병' : '훈련병'}\n`;
                }
                tempMessage += "입니다."
                message.channel.send(tempMessage);

            }
            else if (returnUserCode(args[0]) === undefined) {
                message.channel.send('존재하지 않는 유저입니다. configuration파일에서 설정하신 유저중에서만 골라주세요.\n!state *****나 !state **list**를 하면 모든 유저의 상태를 출력합니다.')
            }
            else {
                message.channel.send(userState[returnUserCode(args[0])] == 0 ? '민간인' : userState[returnUserCode(args[0])] == 1 ? '훈련병' : '병' + '인 유저입니다.');
            }
        }
    }
    else if (command === 'interval') {
        message.channel.send(`현재 인터벌은 [${minTime},${maxTime}]입니다.`);
    }
    else if (command === 'update') {
        message.channel.send('update를 진행하겠습니다. 근데 어짜피 관리자밖에 못하기 때문에 똑같이 나올거에요.그래서 안해야지');
        if (args[0] === 'yes') {
            parser();
        }
    }
    else if (command === 'mode') {
        if (args[0] === 'working') {
            message.channel.send('현재 근무 여부 : ' + (workingMode == 1 ? "근무중" : "근무중 아님"));
        }
        else if (args[0] === 'sending') {
            message.channel.send('현재 전송 모드 : ' + (sendingMode == 0 ? "loose" : "strict"));
        }
        else if (args[0] === 'blockdelay') {
            message.channel.send('현재 블럭 딜레이 모드 : ' + (blockDelayMode == 0 ? "loose" : "strict"));
        }
        else {
            message.channel.send('!mode **working**|**sending**|**blockdelay** 으로 확인해주세요.\nsendingMode: strict -> 보낼 채팅을 엄격하게 검사합니다.\nsendingMode: loose -> 보낼 채팅을 덜 엄격하게 검사합니다.')
        }
    }
    else if (command === 'set' || command === '설정') {
        switch (args[0]) {
            case "interval":
            case "간격":
                {
                    let givenMinTime = parseInt(args[1]);
                    let givenMaxTime = parseInt(args[2]);
                    if (givenMinTime != NaN && givenMaxTime != NaN) {
                        maxTime = givenMaxTime;
                        if (minTime > givenMinTime) {
                            message.channel.send(`인터벌을 ${minTime}보다 작게 설정하는것은 불가능합니다!\n인터벌 중 MaxTime만 변경해 새로 [${minTime},${maxTime}]로 변경했습니다.`);
                        }
                        else {
                            minTime = givenMinTime;
                            message.channel.send(`인터벌을 [${minTime},${maxTime}]로 변경했습니다. 봇의 채팅 전송도 **중단**되오니 다시 시작해주세요.`);
                            sendingStop();
                        }
                    } else {
                        message.channel.send('!set **interval**|**간격** *최소시간* *최대시간* -> 랜덤으로 메시지가 나오는 시간의 범위를 [최소시간,최대시간] 으로 정합니다.\n시간의 단위는 초입니다. 너무 큰 수로 하면 좀 섭섭해질 수도 있습니다.\n기본설정: [최장길이메시지블럭에 비례,7200]');
                    }
                }
                break;
            case "sendingrandomdelay":
            case "랜덤딜레이":
                {
                    let givenInt = parseInt(args[1])
                    if (givenInt != NaN) {
                        message.channel.send(`기존 랜덤 딜레이 : ${sendingRandomDelay}초에서 ${givenInt}초로 바꿨습니다. 봇의 채팅 전송도 **중단**되오니 다시 시작해주세요.`)
                        sendingRandomDelay = givenInt;
                        setMinimumInterval(blockDelayMode);
                        sendingStop();
                    }
                    else {
                        message.channel.send(`!set **sendingrandomdelay**|**랜덤딜레이** *시간*. \n시간의 단위는 초(정수) 입니다.\n랜덤 딜레이는 메시지간의 기본 시간 간격에 랜덤한 초 간격을 추가하는 역할을 합니다.`)
                    }
                }
                break;
            case "sendingintervaltime":
            case "기본딜레이":
                {
                    let givenInt = parseInt(args[1])
                    if (givenInt != NaN && givenInt >= 0) {
                        message.channel.send(`기본 딜레이 : ${sendingIntervalTime}초에서 ${givenInt}초로 바꿨습니다. 봇의 채팅 전송도 **중단**되오니 다시 시작해주세요.`)
                        sendingIntervalTime = givenInt;
                        setMinimumInterval(blockDelayMode);
                        sendingStop();
                    }
                    else {
                        message.channel.send(`!set **sendingintervaltime**|**기본딜레이** *시간*. \n시간의 단위는 초(음이 아닌 정수) 입니다.\n기본 딜레이는 메시지간의 기본 시간 간격을 정해줍니다.\n`)
                    }
                }
                break;
            case "state":
            case "상태":
                {
                    if (args[1] == undefined || args[2] == undefined) {
                        message.channel.send('!set **state**|**상태** *유저이름* [*민간인*|*훈련병*|*병*] -> 해당 유저의 신분을 민간인, 훈련병 또는 병으로 바꿉니다. 함부로하지 마세요.\n훈련병일시 24시간 내내 군인좀비가 작동하며, 병일시 일과시간에만 작동합니다.');
                    }
                    else {
                        if (userState[returnUserCode(args[1])] === undefined) {
                            message.channel.send('존재하지 않는 유저입니다. \nconfiguration파일에서 설정하신 유저 중에서만 골라주세요.')
                        }
                        else {
                            switch (args[2]) {
                                case '민간인':
                                    message.channel.send(args[1] + "을(를) " + args[2] + '으로 잘 바꿨습니다.');
                                    userState[returnUserCode(args[1])] = 0;
                                    break;
                                case '훈련병':
                                    message.channel.send(args[1] + "을(를) " + args[2] + '으로 잘 바꿨습니다.');
                                    userState[returnUserCode(args[1])] = 2;
                                    break;
                                case '병':
                                    message.channel.send(args[1] + "을(를) " + args[2] + '으로 잘 바꿨습니다.');
                                    userState[returnUserCode(args[1])] = 1;
                                    break;
                                default:
                                    message.channel.send(args[2] + '같은 상태는 없습니다. *민간인*|*훈련병*|*병* 중에서 골라주세요.');
                            }
                            updateJSON();
                            resetCurrentBlock();
                            updateCurrentBlock();
                        }
                    }
                }
                break;
            case "sendingmode":
            case "전송모드":
                if (args[1] == 'strict') {
                    sendingMode = 1;
                    message.channel.send('**strict**모드로 설정했습니다.');
                    resetCurrentBlock();
                    updateCurrentBlock();
                }
                else if (args[1] == 'loose') {
                    sendingMode = 0;
                    message.channel.send('**loose**모드로 설정했습니다.');
                    resetCurrentBlock();
                    updateCurrentBlock();
                }
                else {
                    message.channel.send('!set **전송모드**|**sendingmode** **strict**|**loose** 둘 중 하나로 정해주세요.\nstrict -> 현재 메시지를 보낼 수 없는 사람들로 "만" 구성된 블록을 보냅니다.\nloose -> 현재 메시지를 보낼 수 없는 사람들이 "있는" 블록을 보냅니다.');
                }
                break;
            case "blockdelay":
            case "블럭딜레이":

                if (args[1] == 'strict') {
                    sendingMode = 1;
                    message.channel.send('strict모드로 설정했습니다.');
                    updateCurrentBlock();
                }
                else if (args[1] == 'loose') {
                    sendingMode = 0;
                    message.channel.send('loose모드로 설정했습니다.');
                    updateCurrentBlock();
                }
                else {
                    message.channel.send('!set **blockdelay**|**블럭딜레이** **strict**|**loose** 둘 중 하나로 정해주세요.\nstrict -> 두개 이상의 메시지 블럭이 중첩되어 혼란스러운 메시지가 보내지는 현상이 발생하지 않습니다.\nloose -> 두개 이상의 메시지 블럭이 중첩되어 보내지는 현상이 있을수도 있지만, 그럴 확률은 극히 적으니 loose를 추천드립니다.');
                }
                break;
            default:
                message.channel.send("!set **interval**|**sendingrandomdelay**|**sendingintervaltime**|**state**|**sendingmode**|**blockdelay**\n!설정 **간격**|**랜덤딜레이**|**기본딜레이**|**상태**|**전송모드**|**블럭딜레이** \n모르겠는 명령어 뒤에 help를 붙여보세요.");
        }
    }
    else {
        message.channel.send("모르겠으면 !help 또는 !명령어 를 입력해보세요");
    }
});

client.login(token);