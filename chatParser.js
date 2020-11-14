const fs = require('fs');
const { exit, config } = require('process');

function Parser() {
    let pattern = /\[\d\d-\w\w\w-\d\d\s\d\d:\d\d\s\w\w\]\s.*#\d\d\d\d/g;
    let getdatepattern = /\d\d-\w\w\w-\d\d\s\d\d:\d\d\s\w\w/;
    let startpattern = /={5,}/g;

    let channelName;
    let blockRange;
    let channelInfo;

    let curtime;
    let timetemp;
    let chatParsed = [];
    let configuration;

    try {
        configuration = fs.readFileSync('./configuration.json', { 'encoding': 'utf8' });
        configuration = JSON.parse(configuration);
        channelInfo = configuration['channelCode'];
        userDict = configuration['userCode'];
        filelist = fs.readdirSync('chattxt', { 'encoding': 'utf8' });
        blockRange = configuration['parserSetting']['blockRange']; // 단위 : 분. 
    }
    catch (error) {
        console.log("필요한 파일이 없습니다. 파서를 종료합니다.");
        console.log(error);
        exit(-1);
    }
    console.log(filelist);

    for (filename in filelist) {
        let text = '';
        let array = [];
        let user = '';
        console.log(filename);
        textArray = fs.readFileSync(filelist[filename], { encoding: 'utf8' }).split('\n');
        for (let lines = 0; lines < textArray.length; lines++) {
            message = textArray[lines];
            if (pattern.exec(message)) {
                if (user) {
                    array.push([user.split(/\r/g)[0], text]);
                    text = '';
                }
                user = message;
            }
            else if (startpattern.exec(message)) {
                while (true) {
                    ++lines;
                    message = textArray[lines];
                    if (message.split(':')[0] === 'Channel') {
                        channelName = message.split('/ ')[1].split('\r')[0];
                        channelName = channelName
                    }
                    if (startpattern.exec(message)) {
                        break;
                    }
                }
            }
            else {
                if (message === "{Embed}\r") {
                    while (true) {
                        ++lines;
                        message = textArray[lines];
                        if (pattern.exec(message)) {
                            lines -= 2;
                            break;
                        }
                    }
                }
                else {
                    if (((message != '\r') && (message != '{Attachments}\r'))) {
                        text += message.split(/\r/g)[0];
                    }
                }
            }
        }
        if (user) {
            array.push([user.split(/\r/g)[0], text]);
        }


        let formertime = -1;
        let index = -1;

        channelName = channelInfo[channelName];
        console.log(channelName);

        for (elem in array) {
            temp = array[elem][0]; // 시간과 유저 태그
            curtime = new Date(getdatepattern.exec(temp)[0]);
            timetemp = curtime - formertime;
            if ((timetemp <= (blockRange * 1000 * 60) || (timetemp == 0))) {
                chatParsed[index]['text'].push([userDict[[temp.split('] ')[1]]], parseInt(timetemp / 60000), array[elem][1]]);
                chatParsed[index]['userInfo'][userDict[temp.substr((getdatepattern.exec(temp)[0]).length + 3)]] = 1;
            }
            else {
                index += 1;
                chatParsed[index] = {
                    'channel': channelName,
                    'blockInfo': curtime,
                    'userInfo': {},
                    'text': []
                };
                chatParsed[index]['text'].push([userDict[[temp.split('] ')[1]]], 0, array[elem][1]]);
                chatParsed[index]['userInfo'][userDict[temp.substr((getdatepattern.exec(temp)[0]).length + 3)]] = 1;

            }
            formertime = curtime;
        }
    }

    console.log(chatParsed);

    fs.writeFileSync('parsedText.json', JSON.stringify(chatParsed), 'utf8');
}

module.exports = {
    parser: Parser
}
